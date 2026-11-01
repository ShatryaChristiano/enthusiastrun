import { NextRequest, NextResponse } from "next/server";
import { validateRegistrationQR } from "@/lib/registration";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body as { token?: string };

    if (!token || typeof token !== "string" || token.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Token QR diperlukan." },
        { status: 400 },
      );
    }

    const result = await validateRegistrationQR(token.trim());

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("[QR Validate API]", err);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 },
    );
  }
}
