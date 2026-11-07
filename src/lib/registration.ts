"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ActionResult } from "@/types/action.md";
import {
  RegistrationData,
  Registration,
  RegistrationStatus,
  Voucher,
} from "@/types/registration.md";
import { RacepackEmailParams, sendRacepackEmails } from "@/lib/email";

// ─────────────────────────────────────────────────────────────────────────────
// SISTEM QR INDIVIDUAL
//
// 1 akun bisa mendaftarkan beberapa peserta dalam satu transaksi (groupId sama,
// satu bukti bayar). Saat admin mengonfirmasi pembayaran, SETIAP peserta
// mendapat QR miliknya sendiri yang dikirim ke email peserta tersebut.
// Racepack hanya bisa diklaim dengan QR peserta itu sendiri (sekali pakai).
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// File ini "use server": setiap fungsi yang di-export bisa dipanggil langsung
// dari browser, jadi aksi admin WAJIB mengecek role di sini.
// ─────────────────────────────────────────────────────────────────────────────

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

async function requireUser() {
  const user = await getSessionUser();
  if (!user?.id) throw new Error("Silakan login terlebih dahulu.");
  return user;
}

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user?.id || user.role !== "admin") {
    throw new Error("Unauthorized: hanya admin yang dapat melakukan aksi ini.");
  }
  return user;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Buat URL gambar QR Code untuk token unik peserta */
function buildQRCodeUrl(token: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`;
}

/** Token acak 32 karakter hex — tidak bisa ditebak */
function generateQRToken(): string {
  return randomBytes(16).toString("hex");
}

const LEGACY_GROUP_WINDOW_MS = 60_000;

/**
 * Ambil semua id registrasi dalam satu transaksi pendaftaran.
 * Data baru memakai groupId; data lama (groupId null) memakai fallback
 * userId + createdAt ±60 detik seperti sistem sebelumnya.
 */
async function findGroupRegistrationIds(registrationId: string): Promise<string[]> {
  const target = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { id: true, userId: true, createdAt: true, groupId: true },
  });
  if (!target) return [];

  if (target.groupId) {
    const members = await prisma.registration.findMany({
      where: { groupId: target.groupId },
      select: { id: true },
    });
    return members.map((m) => m.id);
  }

  const members = await prisma.registration.findMany({
    where: {
      userId: target.userId,
      groupId: null,
      createdAt: {
        gte: new Date(target.createdAt.getTime() - LEGACY_GROUP_WINDOW_MS),
        lte: new Date(target.createdAt.getTime() + LEGACY_GROUP_WINDOW_MS),
      },
    },
    select: { id: true },
  });
  return members.map((m) => m.id);
}

/**
 * Pastikan setiap peserta (yang sudah confirmed) punya QR sendiri.
 * Idempotent: peserta yang sudah punya QR dilewati.
 */
async function ensureIndividualQRCodes(registrationIds: string[]): Promise<void> {
  const missing = await prisma.registration.findMany({
    where: { id: { in: registrationIds }, qrCodeId: null, status: "confirmed" },
    select: { id: true },
  });

  for (const { id } of missing) {
    const token = generateQRToken();
    await prisma.$transaction(async (tx) => {
      const qr = await tx.qRCode.create({
        data: { token, qrCodeUrl: buildQRCodeUrl(token) },
      });
      await tx.registration.update({
        where: { id },
        data: { qrCodeId: qr.id, emailStatus: "NOT_SENT" },
      });
    });
  }
}

/**
 * Kirim email QR ke masing-masing peserta (ke email peserta itu sendiri).
 * - force=false: peserta yang emailnya sudah SENT dilewati (idempotent)
 * - force=true : kirim ulang walau sudah pernah terkirim
 */
async function sendQREmailsToParticipants(
  registrationIds: string[],
  { force = false }: { force?: boolean } = {},
): Promise<{ sent: number; failed: number; skipped: number }> {
  const regs = await prisma.registration.findMany({
    where: {
      id: { in: registrationIds },
      status: "confirmed",
      qrCodeId: { not: null },
      ...(force ? {} : { emailStatus: { not: "SENT" } }),
    },
    include: { qrCode: true, user: { select: { name: true } } },
  });

  const sendable = regs.filter((r) => r.qrCode);
  if (sendable.length === 0) {
    return { sent: 0, failed: 0, skipped: registrationIds.length };
  }

  const params: RacepackEmailParams[] = sendable.map((r) => ({
    to: r.email,
    fullName: r.fullName,
    qrCodeUrl: r.qrCode!.qrCodeUrl,
    qrToken: r.qrCode!.token,
    category: r.category,
    jerseySize: r.jerseySize,
    chosenPackage: r.chosenPackage ?? undefined,
    registeredBy: r.user?.name ?? undefined,
  }));

  const results = await sendRacepackEmails(params);

  const sentIds = sendable.filter((_, i) => results[i]?.success).map((r) => r.id);
  const failedIds = sendable.filter((_, i) => !results[i]?.success).map((r) => r.id);

  if (sentIds.length) {
    await prisma.registration.updateMany({
      where: { id: { in: sentIds } },
      data: { emailStatus: "SENT", emailSentAt: new Date() },
    });
  }
  if (failedIds.length) {
    await prisma.registration.updateMany({
      where: { id: { in: failedIds } },
      data: { emailStatus: "FAILED" },
    });
  }

  return {
    sent: sentIds.length,
    failed: failedIds.length,
    skipped: registrationIds.length - sendable.length,
  };
}

/**
 * Validasi email peserta: setiap peserta wajib memakai email berbeda dan
 * belum terdaftar, karena QR racepack dikirim ke email masing-masing.
 */
async function validateParticipantEmails(
  emails: string[],
  category: string,
): Promise<string | null> {
  const normalized = emails.map(normalizeEmail);

  const seen = new Map<string, number>();
  for (let i = 0; i < normalized.length; i++) {
    const prev = seen.get(normalized[i]);
    if (prev !== undefined) {
      return `Participant ${prev + 1} dan Participant ${i + 1} memakai email yang sama (${normalized[i]}). Setiap peserta wajib memakai email masing-masing karena QR racepack dikirim ke email tersebut.`;
    }
    seen.set(normalized[i], i);
  }

  const existing = await prisma.registration.findMany({
    where: {
      category: category as Registration["category"],
      status: { not: "cancelled" },
      OR: normalized.map((email) => ({
        email: { equals: email, mode: "insensitive" as const },
      })),
    },
    select: { email: true },
  });

  if (existing.length > 0) {
    const list = [...new Set(existing.map((e) => e.email.toLowerCase()))].join(", ");
    return `Email berikut sudah terdaftar: ${list}. Gunakan email lain untuk peserta tersebut.`;
  }

  return null;
}

function buildRegistrationCreateData(
  data: RegistrationData & { voucherId?: string },
  userId: string,
  overrides: { status: RegistrationStatus; groupId: string },
) {
  return {
    userId,
    groupId: overrides.groupId,
    fullName: data.fullName.trim(),
    email: normalizeEmail(data.email),
    phoneNumber: data.phoneNumber,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    address: data.address,
    city: data.city,
    emergencyContact: data.emergencyContact,
    emergencyPhone: data.emergencyPhone,
    category: data.category,
    bloodType: data.bloodType,
    medicalCondition: data.medicalCondition,
    photoUrl: data.photoUrl,
    photoPublicId: data.photoPublicId,
    idCardUrl: data.idCardUrl,
    idCardPublicId: data.idCardPublicId,
    jerseySize: data.jerseySize,
    paymentProofUrl: data.paymentProofUrl,
    paymentProofId: data.paymentProofId,
    status: overrides.status,
    type: data.type,
    rekeningName: data.rekeningName || "-",
    chosenPackage: data.chosenPackage || "personal",
    committeeInviter: data.committeeInviter || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATION COUNTS (publik)
// ─────────────────────────────────────────────────────────────────────────────

export async function checkRegistrationCount(
  category: "CATEGORY_5K",
  type: "super_early_bird" | "early_bird" | "regular" | "redeem_voucher",
): Promise<number> {
  try {
    return await prisma.registration.count({ where: { category, type } });
  } catch {
    return 100;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE REGISTRATION — Redeem voucher (1 peserta, langsung confirmed)
// ─────────────────────────────────────────────────────────────────────────────

export async function createRegistration(
  data: RegistrationData & { voucherId?: string },
): Promise<ActionResult<Registration>> {
  try {
    const user = await requireUser();

    // Jalur ini hanya untuk redeem voucher; pendaftaran berbayar lewat
    // createBulkRegistration (status pending sampai admin konfirmasi).
    if (data.type !== "redeem_voucher" || !data.voucherId) {
      return { success: false, error: "Kode voucher diperlukan." };
    }

    const emailError = await validateParticipantEmails([data.email], data.category);
    if (emailError) return { success: false, error: emailError };

    const registration = await prisma.$transaction(async (tx) => {
      // Klaim voucher secara atomic: gagal jika sudah dipakai / tidak ada
      const claimed = await tx.voucher.updateMany({
        where: { id: data.voucherId, isUsed: false, category: data.category },
        data: { isUsed: true },
      });
      if (claimed.count === 0) {
        throw new Error("Kode voucher tidak valid atau sudah digunakan.");
      }

      return tx.registration.create({
        data: {
          ...buildRegistrationCreateData(data, user.id, {
            status: "confirmed",
            groupId: randomUUID(),
          }),
          voucherId: data.voucherId,
        },
      });
    });

    // Voucher = langsung confirmed → buat QR + kirim email sekarang
    try {
      await ensureIndividualQRCodes([registration.id]);
      await sendQREmailsToParticipants([registration.id]);
    } catch (err) {
      console.error("[QR/Email] Error after voucher registration:", err);
    }

    revalidatePath("/register");
    revalidatePath("/dashboard");

    return { success: true, data: registration as unknown as Registration };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Failed to register." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK REGISTRATION — 1 akun mendaftarkan 1..N peserta (status pending)
// QR dibuat per peserta setelah admin mengonfirmasi pembayaran.
// ─────────────────────────────────────────────────────────────────────────────

export async function createBulkRegistration(
  dataList: (RegistrationData & { voucherId?: string })[],
): Promise<ActionResult<Registration[]>> {
  try {
    const user = await requireUser();

    if (!dataList.length) {
      return { success: false, error: "Minimal satu peserta diperlukan." };
    }

    const emailError = await validateParticipantEmails(
      dataList.map((d) => d.email),
      dataList[0].category,
    );
    if (emailError) return { success: false, error: emailError };

    const groupId = randomUUID();

    const registrations = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const data of dataList) {
        results.push(
          await tx.registration.create({
            // userId diambil dari session, bukan dari input client
            data: buildRegistrationCreateData(data, user.id, {
              status: "pending",
              groupId,
            }),
          }),
        );
      }
      return results;
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true, data: registrations as unknown as Registration[] };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Failed to register." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE REGISTRATION STATUS (Admin)
// Satu bukti bayar = satu grup, jadi status diterapkan ke seluruh grup.
// Saat confirmed: setiap peserta dibuatkan QR sendiri + dikirim ke emailnya.
// ─────────────────────────────────────────────────────────────────────────────

export async function updateRegistrationStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled",
) {
  try {
    await requireAdmin();

    const updatedIds = await findGroupRegistrationIds(id);
    if (updatedIds.length === 0) {
      return { success: false, error: "Registration not found" };
    }

    await prisma.registration.updateMany({
      where: { id: { in: updatedIds } },
      data: {
        status,
        paymentStatus:
          status === "confirmed" ? true : status === "cancelled" ? false : undefined,
        paymentDate: status === "confirmed" ? new Date() : undefined,
      },
    });

    let message = `Status ${updatedIds.length} peserta diperbarui.`;

    if (status === "confirmed") {
      try {
        await ensureIndividualQRCodes(updatedIds);
        const result = await sendQREmailsToParticipants(updatedIds);
        message += ` QR terkirim ke ${result.sent} email peserta.`;
        if (result.failed > 0) {
          message += ` ${result.failed} email gagal — kirim ulang dari detail pendaftaran.`;
        }
      } catch (err) {
        console.error("[QR/Email] Error after confirmation:", err);
        message += " Namun terjadi error saat membuat/mengirim QR — cek detail pendaftaran.";
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true, updatedIds, message };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Failed to perform update" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATE QR (Admin — satu QR = satu peserta)
// ─────────────────────────────────────────────────────────────────────────────

export async function validateRegistrationQR(
  rawQRValue: string,
): Promise<ActionResult<Registration>> {
  try {
    await requireAdmin();

    const value = rawQRValue.trim();
    if (!value) return { success: false, error: "QR Code kosong." };

    const qrCode = await prisma.qRCode.findUnique({
      where: { token: value },
      include: { registration: { include: { qrCode: true } } },
    });

    if (!qrCode || !qrCode.registration) {
      return {
        success: false,
        error:
          "QR Code tidak valid atau sudah tidak berlaku. Jika peserta memakai QR lama (QR grup), minta peserta mengecek email terbaru.",
      };
    }

    if (qrCode.registration.status !== "confirmed") {
      return {
        success: false,
        error: "Pendaftaran ini belum dikonfirmasi. Racepack belum dapat diambil.",
      };
    }

    return { success: true, data: qrCode.registration as unknown as Registration };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Terjadi kesalahan saat validasi QR." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM RACEPACK (Admin — atomic, sekali pakai)
// ─────────────────────────────────────────────────────────────────────────────

export async function claimRacePack(
  registrationId: string,
): Promise<ActionResult<Registration>> {
  try {
    await requireAdmin();

    // Conditional update = atomic: dua scan bersamaan tidak bisa sama-sama berhasil
    const claimed = await prisma.registration.updateMany({
      where: { id: registrationId, status: "confirmed", qrCodeClaimed: false },
      data: { qrCodeClaimed: true, qrCodeClaimedAt: new Date() },
    });

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { qrCode: true },
    });

    if (claimed.count === 0) {
      if (!reg) throw new Error("Registrasi tidak ditemukan.");
      if (reg.status !== "confirmed") throw new Error("Pendaftaran belum dikonfirmasi.");
      throw new Error("Racepack sudah diambil sebelumnya.");
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true, data: reg as unknown as Registration };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Gagal mengklaim racepack." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEND EMAIL (Admin — QR yang sama, dikirim ulang ke email peserta)
// ─────────────────────────────────────────────────────────────────────────────

export async function resendRacepackEmail(
  registrationId: string,
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { id: true, status: true },
    });
    if (!reg) return { success: false, error: "Registrasi tidak ditemukan." };
    if (reg.status !== "confirmed") {
      return { success: false, error: "Pendaftaran belum dikonfirmasi." };
    }

    // Data lama mungkin belum punya QR individual → buatkan dulu
    await ensureIndividualQRCodes([registrationId]);
    const result = await sendQREmailsToParticipants([registrationId], { force: true });

    revalidatePath("/dashboard/admin");

    if (result.sent === 0) {
      return { success: false, error: "Gagal mengirim email. Cek RESEND_API_KEY / alamat email peserta." };
    }
    return { success: true, data: null, message: "Email QR berhasil dikirim ulang." };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Gagal resend email." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND PENDING QR EMAILS (Admin)
// Untuk data lama setelah migrasi, atau email yang sebelumnya gagal.
// Diproses per batch agar tidak timeout; jalankan ulang sampai remaining = 0.
// ─────────────────────────────────────────────────────────────────────────────

const PENDING_BATCH_SIZE = 100;

export async function sendPendingRacepackEmails(): Promise<
  ActionResult<{ sent: number; failed: number; remaining: number }>
> {
  try {
    await requireAdmin();

    const pendingWhere = {
      status: "confirmed" as const,
      OR: [{ qrCodeId: null }, { emailStatus: { not: "SENT" as const } }],
    };

    const batch = await prisma.registration.findMany({
      where: pendingWhere,
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: PENDING_BATCH_SIZE,
    });
    const ids = batch.map((r) => r.id);

    await ensureIndividualQRCodes(ids);
    const result = await sendQREmailsToParticipants(ids);

    // Yang gagal tetap FAILED → tidak dihitung lagi agar tidak loop tanpa akhir
    const remaining = await prisma.registration.count({
      where: {
        status: "confirmed",
        OR: [{ qrCodeId: null }, { emailStatus: "NOT_SENT" }],
      },
    });

    revalidatePath("/dashboard/admin");
    return {
      success: true,
      data: { sent: result.sent, failed: result.failed, remaining },
      message: `${result.sent} email terkirim, ${result.failed} gagal, ${remaining} tersisa.`,
    };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Gagal mengirim email tertunda." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGENERATE QR (Peserta sendiri)
// QR lama langsung tidak berlaku; QR baru dikirim ke email peserta.
// ─────────────────────────────────────────────────────────────────────────────

export async function regenerateQRCode(
  registrationId: string,
): Promise<ActionResult<{ qrCodeUrl: string }>> {
  try {
    const user = await requireUser();

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { id: true, email: true, qrCodeId: true, qrCodeClaimed: true, status: true },
    });

    // Hanya peserta pemilik email yang boleh me-regenerate QR-nya sendiri
    if (
      !registration ||
      !user.email ||
      normalizeEmail(registration.email) !== normalizeEmail(user.email)
    ) {
      return { success: false, error: "QR code tidak ditemukan." };
    }
    if (registration.status !== "confirmed" || !registration.qrCodeId) {
      return { success: false, error: "QR code belum tersedia." };
    }
    if (registration.qrCodeClaimed) {
      return { success: false, error: "Cannot regenerate — race pack already claimed" };
    }

    const oldQrCodeId = registration.qrCodeId;
    const token = generateQRToken();
    const qrCodeUrl = buildQRCodeUrl(token);

    await prisma.$transaction(async (tx) => {
      const qr = await tx.qRCode.create({ data: { token, qrCodeUrl } });
      await tx.registration.update({
        where: { id: registrationId },
        data: { qrCodeId: qr.id, emailStatus: "NOT_SENT" },
      });
      await tx.qRCode.delete({ where: { id: oldQrCodeId } });
    });

    await sendQREmailsToParticipants([registrationId]);

    revalidatePath("/dashboard");
    return { success: true, data: { qrCodeUrl } };
  } catch (error) {
    return { success: false, error: errorMessage(error) || "Failed to regenerate QR code" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PESERTA
// - myRegistration: pendaftaran milik user yang login (email = email akun).
//   Hanya QR ini yang ditampilkan.
// - registeredByMe: peserta yang didaftarkan akun ini (tanpa QR — QR mereka
//   dikirim ke email masing-masing agar racepack tidak bisa diambilkan).
// ─────────────────────────────────────────────────────────────────────────────

export type DashboardParticipant = {
  id: string;
  fullName: string;
  email: string;
  status: RegistrationStatus;
  emailStatus: "NOT_SENT" | "SENT" | "FAILED";
  qrCodeClaimed: boolean;
};

export async function getDashboardData(): Promise<{
  myRegistration: Registration | null;
  registeredByMe: DashboardParticipant[];
}> {
  const user = await requireUser();

  const myRegistration = user.email
    ? await prisma.registration.findFirst({
        where: { email: { equals: normalizeEmail(user.email), mode: "insensitive" } },
        include: { qrCode: true },
        // Utamakan yang tidak cancelled, lalu yang terbaru
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      })
    : null;

  const registeredByMe = await prisma.registration.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      emailStatus: true,
      qrCodeClaimed: true,
    },
    orderBy: [{ createdAt: "desc" }, { fullName: "asc" }],
  });

  return {
    myRegistration: myRegistration as unknown as Registration | null,
    registeredByMe,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET REGISTRATIONS (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllRegistrations(): Promise<Registration[]> {
  await requireAdmin();
  const allData = await prisma.registration.findMany({
    include: { user: true, qrCode: true },
    orderBy: { createdAt: "desc" },
  });
  return allData as unknown as Registration[];
}

export async function getRegistrationGroup(
  registrationId: string,
): Promise<Registration[]> {
  await requireAdmin();
  const ids = await findGroupRegistrationIds(registrationId);
  return (await prisma.registration.findMany({
    where: { id: { in: ids } },
    include: { qrCode: true },
    orderBy: { fullName: "asc" },
  })) as unknown as Registration[];
}

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHERS (Admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function makeVoucher(category: "CATEGORY_5K") {
  await requireAdmin();
  await prisma.voucher.create({ data: { category } });
}

export async function deleteVoucher(id: string) {
  await requireAdmin();
  await prisma.voucher.delete({ where: { id } });
}

export async function useVoucher(id: string): Promise<ActionResult<Voucher>> {
  try {
    await requireAdmin();
    const voucher = await prisma.voucher.update({
      where: { id },
      data: { isUsed: true },
    });
    return { success: true, data: voucher as Voucher, message: "Voucher used successfully" };
  } catch {
    return { success: false, error: "Failed to use voucher" };
  }
}

export async function getAllVouchers(): Promise<Voucher[]> {
  await requireAdmin();
  return await prisma.voucher.findMany({ orderBy: { id: "desc" } });
}
