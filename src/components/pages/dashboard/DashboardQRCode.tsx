"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { regenerateQRCode } from "@/lib/registration";

interface DashboardQRCodeProps {
  registrationId: string;
  qrCodeUrl: string;
  fullName: string;
}

export default function DashboardQRCode({
  registrationId,
  qrCodeUrl,
  fullName,
}: DashboardQRCodeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    setShowConfirm(false);
    const result = await regenerateQRCode(registrationId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to regenerate QR code");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={qrCodeUrl}
        unoptimized
        alt={`Racepack ${fullName} QR Code`}
        width={200}
        height={200}
      />

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="bg-[#FF8C42] border-2 border-white px-6 py-2 rounded-lg w-fit hover:bg-[#E07835] text-white font-heading disabled:opacity-50 transition"
        >
          {loading ? "REGENERATING..." : "REGENERATE QR CODE"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border-2 border-white">
          <p className="text-sm font-body text-center">
            Are you sure? Your old QR code will become invalid. The new QR code will also be sent to your email.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="bg-red-500 border-2 border-white px-4 py-2 rounded-lg hover:bg-red-600 text-white font-heading text-sm disabled:opacity-50 transition"
            >
              {loading ? "REGENERATING..." : "YES, REGENERATE"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-gray-500 border-2 border-white px-4 py-2 rounded-lg hover:bg-gray-600 text-white font-heading text-sm transition"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
