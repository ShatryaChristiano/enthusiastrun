import { NextRequest, NextResponse } from "next/server";
import { resendRacepackEmail } from "@/lib/registration";

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

    const result = await resendRacepackEmail(registrationId.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    console.error("[Resend Email API]", err);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 },
    );
  }
}
