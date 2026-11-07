import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// DELETE - Delete voucher by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if voucher exists
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return NextResponse.json(
        { success: false, message: "Voucher tidak ditemukan" },
        { status: 404 }
      );
    }

    // Voucher yang sudah dipakai terhubung ke pendaftaran peserta → jangan dihapus
    if (voucher.isUsed) {
      return NextResponse.json(
        { success: false, message: "Voucher sudah digunakan dan tidak dapat dihapus" },
        { status: 400 }
      );
    }

    // Delete voucher
    await prisma.voucher.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Voucher berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete voucher error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}