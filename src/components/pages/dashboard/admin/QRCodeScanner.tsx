"use client";

import { useState } from "react";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Registration } from "@/types/registration.md";
import { validateRegistrationQR, claimRacePack } from "@/lib/registration";

type ScanState = "idle" | "scanning" | "result" | "error";

export default function QrCodeScanner() {
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [participant, setParticipant] = useState<Registration | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const handleScan = async (decodedResults: IDetectedBarcode[]) => {
    if (decodedResults?.length === 0 || scanState !== "scanning") return;

    const rawValue = decodedResults[0].rawValue;
    setScanState("idle"); // stop scanning

    const result = await validateRegistrationQR(rawValue);

    if (result.success && result.data) {
      setParticipant(result.data);
      setErrorMsg(null);
      setScanState("result");
    } else {
      setParticipant(null);
      setErrorMsg(result.error || "QR Code tidak valid.");
      setScanState("error");
    }
  };

  const handleClaim = async () => {
    if (!participant) return;
    setLoading(true);

    const result = await claimRacePack(participant.id);

    if (result.success) {
      setParticipant((prev) =>
        prev ? { ...prev, qrCodeClaimed: true, qrCodeClaimedAt: new Date() } : prev,
      );
      setClaimSuccess(true);
    } else {
      setErrorMsg(result.error || "Gagal mengklaim racepack.");
      setScanState("error");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setScanState("scanning");
    setParticipant(null);
    setErrorMsg(null);
    setClaimSuccess(false);
  };

  const formatDateTime = (date: Date | string) =>
    new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const StatusBadge = ({ claimed }: { claimed?: boolean | null }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
        claimed
          ? "bg-red-100 text-red-700 border border-red-300"
          : "bg-green-100 text-green-700 border border-green-300"
      }`}
    >
      {claimed ? "✓ SUDAH DIAMBIL" : "● BELUM DIAMBIL"}
    </span>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* SCANNER */}
      {scanState === "scanning" && (
        <div className="space-y-4">
          <p className="text-white/70 text-sm text-center font-futura">
            Arahkan kamera ke QR Code peserta
          </p>
          <div className="aspect-square overflow-hidden rounded-2xl border-4 border-white/60 shadow-2xl">
            <Scanner
              onScan={handleScan}
              allowMultiple={false}
              scanDelay={1500}
            />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-xs font-bold tracking-wider">
              SCANNING...
            </span>
          </div>
        </div>
      )}

      {/* LOADING */}
      {scanState === "idle" && !participant && !errorMsg && (
        <div className="text-center py-8">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/70 text-sm">Memvalidasi QR...</p>
        </div>
      )}

      {/* ERROR */}
      {scanState === "error" && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-background">
          <div className="p-6 bg-red-500 text-white text-center">
            <div className="text-4xl mb-2">✗</div>
            <h2 className="text-lg font-bold tracking-widest">QR TIDAK VALID</h2>
          </div>
          <div className="p-6 text-center space-y-4">
            <p className="text-red-600 font-medium">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-background text-white rounded-xl font-bold tracking-wider hover:bg-gray-800 transition"
            >
              SCAN ULANG
            </button>
          </div>
        </div>
      )}

      {/* RESULT — PARTICIPANT FOUND */}
      {scanState === "result" && participant && (
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-background">
          {/* Header */}
          <div
            className={`p-5 text-white ${
              claimSuccess
                ? "bg-green-600"
                : participant.qrCodeClaimed
                  ? "bg-red-500"
                  : "bg-[#4BCFFC]"
            }`}
          >
            <div className="text-3xl text-center mb-1">
              {claimSuccess ? "✓" : participant.qrCodeClaimed ? "✗" : "👤"}
            </div>
            <h2 className="text-center font-bold tracking-widest text-sm">
              {claimSuccess
                ? "RACEPACK BERHASIL DIKLAIM!"
                : participant.qrCodeClaimed
                  ? "RACEPACK SUDAH DIAMBIL"
                  : "PESERTA DITEMUKAN"}
            </h2>
          </div>

          {/* Participant Info */}
          <div className="p-5 space-y-3">
            <div className="text-center mb-4">
              <p className="text-xl font-bold text-background tracking-wide">
                {participant.fullName}
              </p>
              <div className="mt-2">
                <StatusBadge claimed={participant.qrCodeClaimed} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-0.5">
                  Kategori
                </p>
                <p className="font-bold text-sm">
                  {participant.category === "CATEGORY_5K" ? "5K RUN" : participant.category}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-0.5">
                  Jersey Size
                </p>
                <p className="font-bold text-sm">{participant.jerseySize}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-0.5">
                  Paket
                </p>
                <p className="font-bold text-sm capitalize">
                  {participant.chosenPackage?.replace(/_/g, " ") || "Personal"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-0.5">
                  Blood Type
                </p>
                <p className="font-bold text-sm">{participant.bloodType || "-"}</p>
              </div>
              {participant.qrCodeClaimed && participant.qrCodeClaimedAt && (
                <div className="col-span-2 border-t border-gray-200 pt-3">
                  <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-0.5">
                    Diambil Pada
                  </p>
                  <p className="font-bold text-sm text-red-600">
                    {formatDateTime(participant.qrCodeClaimedAt)}
                  </p>
                </div>
              )}
              {claimSuccess && (
                <div className="col-span-2 border-t border-gray-200 pt-3">
                  <p className="text-gray-400 text-[10px] tracking-widest uppercase mb-0.5">
                    Waktu Klaim
                  </p>
                  <p className="font-bold text-sm text-green-600">
                    {formatDateTime(new Date())}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 flex">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 transition text-sm font-bold tracking-wider text-gray-700"
            >
              SCAN ULANG
            </button>
            {!participant.qrCodeClaimed && !claimSuccess && (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white transition text-sm font-bold tracking-wider disabled:bg-gray-400"
              >
                {loading ? "MEMPROSES..." : "KONFIRMASI AMBIL"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}