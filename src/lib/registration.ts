"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/action.md";
import {
  RegistrationData,
  Registration,
  RegistrationStatus,
  Voucher,
} from "@/types/registration.md";
import { sendRacepackEmail } from "@/lib/email";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Buat URL QR Code menggunakan token unik peserta */
function buildQRCodeUrl(token: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATION COUNTS
// ─────────────────────────────────────────────────────────────────────────────

export async function checkRegistrationCount(
  category: "CATEGORY_5K",
  type: "super_early_bird" | "early_bird" | "regular" | "redeem_voucher",
): Promise<number> {
  try {
    const count = await prisma.registration.count({
      where: { category, type },
    });
    return count;
  } catch {
    return 100;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE REGISTRATION
// ─────────────────────────────────────────────────────────────────────────────

export async function createRegistration(
  data: RegistrationData & { voucherId?: string },
): Promise<ActionResult<Registration>> {
  try {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) return { success: false, error: "User not found." };

    const existingRegistration = await prisma.registration.findFirst({
      where: {
        email: data.email,
        category: data.category,
        status: { not: "cancelled" },
      },
    });

    if (existingRegistration) {
      return { success: false, error: "Email already registered." };
    }

    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.create({
        data: {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
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
          status: (data.type === "redeem_voucher"
            ? "confirmed"
            : "pending") as RegistrationStatus,
          type: data.type,
          updatedAt: new Date(),
          voucherId: data.voucherId || null,
          rekeningName: data.rekeningName || "-",
          chosenPackage: data.chosenPackage || "personal",
          committeeInviter: data.committeeInviter || null,
        },
      });

      if (data.voucherId) {
        await tx.voucher.update({
          where: { id: data.voucherId },
          data: { isUsed: true },
        });
      }

      return reg;
    });

    revalidatePath("/register");
    revalidatePath("/dashboard");

    return { success: true, data: registration as Registration };
  } catch {
    return { success: false, error: "Failed to register." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK REGISTRATION (tidak lagi membuat QR — QR dibuat saat konfirmasi)
// ─────────────────────────────────────────────────────────────────────────────

export async function createBulkRegistration(
  dataList: (RegistrationData & { voucherId?: string })[],
): Promise<ActionResult<Registration[]>> {
  try {
    const registrations = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const data of dataList) {
        const reg = await tx.registration.create({
          data: {
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
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
            status: "pending",
            type: data.type,
            // qrCodeId: null — QR dibuat setelah pembayaran dikonfirmasi
            rekeningName: data.rekeningName || "-",
            chosenPackage: data.chosenPackage || "personal",
            committeeInviter: data.committeeInviter || null,
          },
        });
        results.push(reg);
      }
      return results;
    });

    revalidatePath("/dashboard/admin");
    return { success: true, data: registrations as Registration[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE INDIVIDUAL QR CODES
// Dipanggil saat status di-set ke "confirmed"
// Idempotent: tidak membuat QR baru jika sudah ada
// ─────────────────────────────────────────────────────────────────────────────

async function generateIndividualQRCodes(
  registrationIds: string[],
): Promise<void> {
  for (const regId of registrationIds) {
    // Cek apakah sudah punya QR (idempotency)
    const existing = await prisma.registration.findUnique({
      where: { id: regId },
      select: { qrCodeId: true },
    });

    if (existing?.qrCodeId) {
      // QR sudah ada, skip
      continue;
    }

    // Buat QR baru dengan token unik
    const newQR = await prisma.qRCode.create({
      data: { qrCodeUrl: "", token: "" },
    });

    // Token = id QRCode (sudah CUID, unik dan tidak mudah ditebak)
    const token = newQR.id;
    const qrCodeUrl = buildQRCodeUrl(token);

    await prisma.qRCode.update({
      where: { id: newQR.id },
      data: { token, qrCodeUrl },
    });

    // Link ke registration
    await prisma.registration.update({
      where: { id: regId },
      data: { qrCodeId: newQR.id },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND INDIVIDUAL RACEPACK EMAILS
// Idempotent: tidak mengirim ulang jika emailStatus === 'SENT'
// ─────────────────────────────────────────────────────────────────────────────

async function sendRacepackEmailsForRegistrations(
  registrationIds: string[],
): Promise<void> {
  for (const regId of registrationIds) {
    const reg = await prisma.registration.findUnique({
      where: { id: regId },
      include: { qrCode: true },
    });

    if (!reg) continue;

    // Sudah terkirim sukses → skip (idempotency)
    if (reg.emailStatus === "SENT") continue;

    // Belum punya QR → skip (tidak boleh kirim email tanpa QR)
    if (!reg.qrCode) continue;

    const emailResult = await sendRacepackEmail({
      to: reg.email,
      fullName: reg.fullName,
      qrCodeUrl: reg.qrCode.qrCodeUrl,
      qrToken: reg.qrCode.token,
      category: reg.category,
      jerseySize: reg.jerseySize,
      chosenPackage: reg.chosenPackage ?? undefined,
    });

    await prisma.registration.update({
      where: { id: regId },
      data: {
        emailStatus: emailResult.success ? "SENT" : "FAILED",
        emailSentAt: emailResult.success ? new Date() : undefined,
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE REGISTRATION STATUS
// Saat status → "confirmed": buat QR individual + kirim email
// ─────────────────────────────────────────────────────────────────────────────

export async function updateRegistrationStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled",
) {
  try {
    const target = await prisma.registration.findUnique({
      where: { id },
      select: { userId: true, createdAt: true },
    });

    if (!target) return { success: false, error: "Registration not found" };

    const timeWinStart = new Date(target.createdAt.getTime() - 60000);
    const timeWinEnd = new Date(target.createdAt.getTime() + 60000);

    const groupMembers = await prisma.registration.findMany({
      where: {
        userId: target.userId,
        createdAt: { gte: timeWinStart, lte: timeWinEnd },
      },
      select: { id: true },
    });

    const updatedIds = groupMembers.map((r) => r.id);

    await prisma.registration.updateMany({
      where: { id: { in: updatedIds } },
      data: {
        status,
        paymentStatus:
          status === "confirmed"
            ? true
            : status === "cancelled"
              ? false
              : undefined,
      },
    });

    // Jika dikonfirmasi: buat QR individual + kirim email (non-blocking error)
    if (status === "confirmed") {
      try {
        await generateIndividualQRCodes(updatedIds);
        await sendRacepackEmailsForRegistrations(updatedIds);
      } catch (emailErr) {
        console.error("[QR/Email] Error after confirmation:", emailErr);
        // Tidak menggagalkan konfirmasi hanya karena error email/QR
      }
    }

    revalidatePath("/dashboard/admin");
    return {
      success: true,
      updatedIds,
      message: `Successfully updated the entire registration group.`,
    };
  } catch {
    return { success: false, error: "Failed to perform update" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATE QR (Individual — satu QR = satu peserta)
// ─────────────────────────────────────────────────────────────────────────────

export async function validateRegistrationQR(
  rawQRValue: string,
): Promise<ActionResult<Registration>> {
  try {
    // rawQRValue bisa berupa token langsung (CUID dari QRCode.id)
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        OR: [{ token: rawQRValue }, { id: rawQRValue }],
      },
      include: {
        registration: {
          include: { qrCode: true },
        },
      },
    });

    if (!qrCode || !qrCode.registration) {
      return { success: false, error: "QR Code tidak valid atau tidak ditemukan." };
    }

    const registration = qrCode.registration;

    if (registration.status !== "confirmed") {
      return {
        success: false,
        error: "Pendaftaran ini belum dikonfirmasi. Racepack belum dapat diambil.",
      };
    }

    return { success: true, data: registration as unknown as Registration };
  } catch {
    return { success: false, error: "Terjadi kesalahan saat validasi QR." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM RACEPACK (Atomic — mencegah race condition)
// ─────────────────────────────────────────────────────────────────────────────

export async function claimRacePack(
  registrationId: string,
): Promise<ActionResult<Registration>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Lock row dan cek status claim terkini
      const reg = await tx.registration.findUnique({
        where: { id: registrationId },
        select: { id: true, qrCodeClaimed: true, status: true },
      });

      if (!reg) throw new Error("Registrasi tidak ditemukan.");
      if (reg.status !== "confirmed") throw new Error("Pendaftaran belum dikonfirmasi.");
      if (reg.qrCodeClaimed) throw new Error("Racepack sudah diambil sebelumnya.");

      const updated = await tx.registration.update({
        where: { id: registrationId },
        data: { qrCodeClaimed: true, qrCodeClaimedAt: new Date() },
        include: { qrCode: true },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true, data: result as unknown as Registration };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal mengklaim racepack.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEND EMAIL (Admin — menggunakan QR yang sama)
// ─────────────────────────────────────────────────────────────────────────────

export async function resendRacepackEmail(
  registrationId: string,
): Promise<ActionResult<null>> {
  try {
    const reg = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { qrCode: true },
    });

    if (!reg) return { success: false, error: "Registrasi tidak ditemukan." };
    if (!reg.qrCode) {
      return { success: false, error: "QR Code belum dibuat untuk peserta ini." };
    }
    if (reg.status !== "confirmed") {
      return { success: false, error: "Pendaftaran belum dikonfirmasi." };
    }

    const emailResult = await sendRacepackEmail({
      to: reg.email,
      fullName: reg.fullName,
      qrCodeUrl: reg.qrCode.qrCodeUrl,
      qrToken: reg.qrCode.token,
      category: reg.category,
      jerseySize: reg.jerseySize,
      chosenPackage: reg.chosenPackage ?? undefined,
    });

    await prisma.registration.update({
      where: { id: registrationId },
      data: {
        emailStatus: emailResult.success ? "SENT" : "FAILED",
        emailSentAt: emailResult.success ? new Date() : undefined,
      },
    });

    revalidatePath("/dashboard/admin");

    if (!emailResult.success) {
      return { success: false, error: `Gagal mengirim email: ${emailResult.error}` };
    }

    return { success: true, data: null, message: "Email berhasil dikirim ulang." };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal resend email." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAKE QR CODE (Admin manual — untuk registration lama)
// ─────────────────────────────────────────────────────────────────────────────

export async function makeQRCode(registrationId: string) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { id: true, qrCodeId: true, status: true },
    });

    if (!registration) return { success: false, error: "Not found" };
    if (registration.qrCodeId) {
      return { success: false, error: "QR sudah ada untuk peserta ini." };
    }
    if (registration.status !== "confirmed") {
      return { success: false, error: "Pendaftaran belum dikonfirmasi." };
    }

    const newQRCode = await prisma.qRCode.create({
      data: { qrCodeUrl: "", token: "" },
    });

    const token = newQRCode.id;
    const qrCodeUrl = buildQRCodeUrl(token);

    await prisma.qRCode.update({
      where: { id: newQRCode.id },
      data: { token, qrCodeUrl },
    });

    await prisma.registration.update({
      where: { id: registrationId },
      data: { qrCodeId: newQRCode.id },
    });

    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch {
    return { success: false, error: "QR Error" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET REGISTRATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserRegistration(
  userId: string,
): Promise<Registration | null> {
  return (await prisma.registration.findFirst({
    where: { userId },
    include: { qrCode: true },
    orderBy: { createdAt: "desc" },
  })) as Registration | null;
}

export async function isAcceptedRegistration(userId: string): Promise<boolean> {
  const reg = await prisma.registration.findFirst({
    where: { userId, status: "confirmed" },
  });
  return !!reg;
}

export async function getAllRegistrations(): Promise<Registration[]> {
  const allData = await prisma.registration.findMany({
    include: { user: true, qrCode: true },
    orderBy: { createdAt: "desc" },
  });
  return allData as unknown as Registration[];
}

export async function getGroupParticipants(
  userId: string,
  createdAt: Date,
): Promise<Registration[]> {
  const timeWinStart = new Date(createdAt.getTime() - 60000);
  const timeWinEnd = new Date(createdAt.getTime() + 60000);

  return (await prisma.registration.findMany({
    where: {
      userId,
      createdAt: { gte: timeWinStart, lte: timeWinEnd },
    },
    include: { qrCode: true },
    orderBy: { fullName: "asc" },
  })) as unknown as Registration[];
}

export async function getTransactionGroup(
  userId: string,
  createdAt: Date,
): Promise<Registration[]> {
  const timeWinStart = new Date(createdAt.getTime() - 60000);
  const timeWinEnd = new Date(createdAt.getTime() + 60000);

  return (await prisma.registration.findMany({
    where: {
      userId,
      createdAt: { gte: timeWinStart, lte: timeWinEnd },
    },
    include: { qrCode: true },
    orderBy: { fullName: "asc" },
  })) as unknown as Registration[];
}

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHERS
// ─────────────────────────────────────────────────────────────────────────────

export async function makeVoucher(category: "CATEGORY_5K") {
  await prisma.voucher.create({ data: { category } });
}

export async function deleteVoucher(id: string) {
  await prisma.voucher.delete({ where: { id } });
}

export async function useVoucher(id: string): Promise<ActionResult<Voucher>> {
  try {
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
  return await prisma.voucher.findMany({ orderBy: { id: "desc" } });
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY — masih digunakan oleh komponen lama, tidak dihapus
// ─────────────────────────────────────────────────────────────────────────────

export async function regenerateQRCode(
  registrationId: string,
): Promise<ActionResult<{ qrCodeUrl: string }>> {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { qrCodeId: true, qrCodeClaimed: true },
    });

    if (!registration || !registration.qrCodeId) {
      return { success: false, error: "Registration or QR code not found" };
    }

    if (registration.qrCodeClaimed) {
      return { success: false, error: "Cannot regenerate — race pack already claimed" };
    }

    const oldQrCodeId = registration.qrCodeId;

    const newQRCode = await prisma.qRCode.create({
      data: { qrCodeUrl: "", token: "" },
    });

    const token = newQRCode.id;
    const qrCodeUrl = buildQRCodeUrl(token);

    await prisma.qRCode.update({
      where: { id: newQRCode.id },
      data: { token, qrCodeUrl },
    });

    await prisma.registration.update({
      where: { id: registrationId },
      data: { qrCodeId: newQRCode.id, emailStatus: "NOT_SENT" },
    });

    // Hapus QR lama
    await prisma.qRCode.delete({ where: { id: oldQrCodeId } });

    revalidatePath("/dashboard");
    return { success: true, data: { qrCodeUrl } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to regenerate QR code" };
  }
}
