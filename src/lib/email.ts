"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Enthusiast Run <onboarding@resend.dev>";

export interface RacepackEmailParams {
  to: string;
  fullName: string;
  qrCodeUrl: string;
  qrToken: string;
  category: string;
  jerseySize: string;
  chosenPackage?: string;
}

function buildRacepackEmailHtml(params: RacepackEmailParams): string {
  const { fullName, qrCodeUrl, category, jerseySize, chosenPackage } = params;

  const categoryLabel =
    category === "CATEGORY_5K" ? "5K Run" : category;
  const packageLabel = chosenPackage
    ? chosenPackage.replace(/_/g, " ").toUpperCase()
    : "PERSONAL";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Racepack QR Code — Enthusiast Run</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f0f9ff; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header {
      background: linear-gradient(135deg, #73DADB 0%, #4BCFFC 50%, #3AA9D1 100%);
      padding: 40px 32px;
      text-align: center;
    }
    .header-logo {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .header-sub {
      color: rgba(255,255,255,0.9);
      font-size: 14px;
      margin-top: 6px;
      letter-spacing: 2px;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.25);
      border: 2px solid rgba(255,255,255,0.6);
      color: #ffffff;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 2px;
      padding: 4px 14px;
      border-radius: 20px;
      margin-top: 12px;
    }
    .body { padding: 36px 32px; }
    .greeting {
      font-size: 22px;
      font-weight: 900;
      color: #1a1a2e;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .intro {
      font-size: 14px;
      color: #555;
      line-height: 1.7;
      margin-bottom: 28px;
    }
    .qr-section {
      text-align: center;
      background: linear-gradient(135deg, #f0f9ff, #e0f7fa);
      border: 3px solid #4BCFFC;
      border-radius: 16px;
      padding: 32px 24px;
      margin-bottom: 28px;
    }
    .qr-label {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #4BCFFC;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .qr-img {
      border: 4px solid #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(75,207,252,0.3);
    }
    .qr-warning {
      font-size: 12px;
      color: #e74c3c;
      font-weight: bold;
      margin-top: 16px;
      letter-spacing: 0.5px;
    }
    .info-card {
      background: #f8f9fa;
      border-left: 4px solid #4BCFFC;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .info-title {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #4BCFFC;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-key { color: #888; }
    .info-val { font-weight: bold; color: #1a1a2e; }
    .instructions {
      background: #fff8e1;
      border: 2px solid #ffc107;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .instructions h3 {
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #e67e22;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .instructions ol { padding-left: 18px; }
    .instructions li {
      font-size: 13px;
      color: #555;
      line-height: 1.8;
    }
    .footer {
      background: #1a1a2e;
      padding: 24px 32px;
      text-align: center;
    }
    .footer p {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      line-height: 1.8;
    }
    .footer a { color: #4BCFFC; text-decoration: none; }
    .social { margin-top: 12px; }
    .social a {
      display: inline-block;
      margin: 0 6px;
      color: #4BCFFC;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">ENTHUSIAST RUN</div>
      <div class="header-sub">FOAM RUN VOL. 2</div>
      <div class="badge">RACEPACK QR CODE</div>
    </div>

    <div class="body">
      <p class="greeting">Halo, ${fullName}! 👋</p>
      <p class="intro">
        Selamat! Pendaftaranmu untuk <strong>Enthusiast Foam Run Vol. 2</strong> telah dikonfirmasi.
        Berikut adalah <strong>QR Code pribadi</strong> milikmu untuk pengambilan racepack pada hari-H.
        Tunjukkan QR ini kepada panitia di area pengambilan racepack.
      </p>

      <div class="qr-section">
        <div class="qr-label">📱 QR Code Racepack Kamu</div>
        <img class="qr-img" src="${qrCodeUrl}" alt="QR Code Racepack ${fullName}" width="200" height="200" />
        <p class="qr-warning">
          ⚠️ QR ini HANYA milikmu dan hanya dapat digunakan SATU KALI.
        </p>
      </div>

      <div class="info-card">
        <div class="info-title">📋 Detail Pendaftaran</div>
        <div class="info-row">
          <span class="info-key">Nama Peserta</span>
          <span class="info-val">${fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-key">Kategori</span>
          <span class="info-val">${categoryLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-key">Paket</span>
          <span class="info-val">${packageLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-key">Ukuran Jersey</span>
          <span class="info-val">${jerseySize}</span>
        </div>
      </div>

      <div class="instructions">
        <h3>📌 Cara Pengambilan Racepack</h3>
        <ol>
          <li>Datang ke lokasi pengambilan racepack sesuai jadwal yang diumumkan.</li>
          <li>Siapkan QR Code ini di layar ponselmu (atau print).</li>
          <li>Tunjukkan QR Code kepada panitia untuk di-scan.</li>
          <li>Verifikasi identitasmu jika diminta panitia.</li>
          <li>Ambil racepack dan selamat bersenang-senang! 🎉</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      <p>
        Email ini dikirim secara otomatis oleh sistem Enthusiast Run.<br />
        Jika ada pertanyaan, hubungi kami di Instagram.
      </p>
      <div class="social">
        <a href="https://www.instagram.com/enthusiast.run/" target="_blank">@enthusiast.run</a>
        &nbsp;|&nbsp;
        <a href="https://www.instagram.com/enthusiast.ibm/" target="_blank">@enthusiast.ibm</a>
      </div>
      <p style="margin-top: 12px; font-size: 11px; color: rgba(255,255,255,0.4);">
        © 2026 Enthusiast Run. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function sendRacepackEmail(
  params: RacepackEmailParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `🎽 QR Code Racepack kamu sudah siap, ${params.fullName}! — Enthusiast Run`,
      html: buildRacepackEmailHtml(params),
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", data?.id, "→", params.to);
    return { success: true };
  } catch (err: any) {
    console.error("[Email] Unexpected error:", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}
