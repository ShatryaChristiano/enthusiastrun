import { NextRequest, NextResponse } from "next/server";
import { claimRacePack } from "@/lib/registration";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId } = body as { registrationId?: string };

    if (!registrationId || typeof registrationId !== "string") {
      return NextResponse.json(
        { success: false, error: "registrationId diperlukan." },
        { status: 400 },
      );
    }

    const result = await claimRacePack(registrationId.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }, // 409 Conflict untuk "sudah diklaim"
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("[QR Claim API]", err);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 },
    );
  }
}
