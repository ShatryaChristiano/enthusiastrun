"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Registration } from "@/types/registration.md";
import { getRegistrationGroup, resendRacepackEmail } from "@/lib/registration";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RegistrationDetailModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationDetailModal({
  registration,
  isOpen,
  onClose,
}: RegistrationDetailModalProps) {
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (p: Registration) => {
    setResendingId(p.id);
    const result = await resendRacepackEmail(p.id);
    if (result.success) {
      toast.success(`QR dikirim ulang ke ${p.email}`);
      const data = await getRegistrationGroup(p.id);
      if (data.length) setParticipants(data);
    } else {
      toast.error(result.error || "Gagal mengirim ulang email");
    }
    setResendingId(null);
  };

  useEffect(() => {
    async function fetchGroup() {
      if (!registration || !isOpen) return;

      setLoading(true);
      try {
        const data = await getRegistrationGroup(registration.id);
        setParticipants(data && data.length > 0 ? data : [registration]);
      } catch (error) {
        setParticipants([registration]);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [registration, isOpen]);

  if (!registration) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const DetailItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex flex-col py-1">
      <span className="text-gray-400 text-[10px]  uppercase tracking-wider">{label}</span>
      <span className="text-background  text-sm">{value || "-"}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[70vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="p-6 bg-background">
          <DialogTitle className="text-2xl font-heading font-medium text-white uppercase">
            Registration Group Details {participants.length > 0 && `(${participants.length} Participants)`}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {loading ? (
            <div className="text-center py-10 font-heading text-background animate-pulse">LOADING PARTICIPANT DATA...</div>
          ) : (
            participants.map((p, idx) => (
              <div key={p.id} className="border-4 border-gray-100 rounded-2xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                  <span className="font-heading text-background uppercase italic">
                    Participant #{idx + 1} {p.chosenPackage ? `(${p.chosenPackage})` : ""}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${p.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {p.status}
                  </span>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-[#4BCFFC] uppercase border-b border-gray-100 pb-1">Identity</h4>
                    <DetailItem label="Full Name" value={p.fullName} />
                    <DetailItem label="Email" value={p.email} />
                    <DetailItem label="Phone" value={p.phoneNumber} />
                    <DetailItem label="Gender" value={p.gender} />
                    <DetailItem label="DOB" value={formatDate(p.dateOfBirth)} />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-[#4BCFFC] uppercase border-b border-gray-100 pb-1">Event Details</h4>
                    <DetailItem label="Category" value={p.category === "CATEGORY_5K" ? "5K RUN" : p.category} />
                    <DetailItem label="Jersey Size" value={p.jerseySize} />
                    <DetailItem label="Blood Type" value={p.bloodType} />
                    <DetailItem label="Medical" value={p.medicalCondition} />
                    <DetailItem label="Committee Inviter" value={p.committeeInviter} />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-[#4BCFFC] uppercase border-b border-gray-100 pb-1">ID Card</h4>
                    {p.idCardUrl ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-100">
                        <Image src={p.idCardUrl} alt="ID Card" fill className="object-cover" />
                        <a href={p.idCardUrl} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] ">VIEW FULL</a>
                      </div>
                    ) : <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300 text-[10px]">NO ID CARD</div>}
                  </div>
                </div>

                {/* QR individual peserta */}
                <div className="border-t-2 border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="text-gray-400 uppercase tracking-wider">Racepack QR</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${p.qrCode ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.qrCode ? "QR DIBUAT" : "BELUM ADA QR"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold ${
                      p.emailStatus === "SENT"
                        ? "bg-green-100 text-green-700"
                        : p.emailStatus === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    EMAIL {p.emailStatus === "SENT" ? "TERKIRIM" : p.emailStatus === "FAILED" ? "GAGAL" : "BELUM DIKIRIM"}
                    {p.emailStatus === "SENT" && p.emailSentAt ? ` · ${new Date(p.emailSentAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}` : ""}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${p.qrCodeClaimed ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {p.qrCodeClaimed ? "RACEPACK SUDAH DIAMBIL" : "RACEPACK BELUM DIAMBIL"}
                  </span>
                  {p.status === "confirmed" && (
                    <button
                      onClick={() => handleResend(p)}
                      disabled={resendingId === p.id}
                      className="ml-auto px-3 py-1 bg-[#4BCFFC] text-white rounded hover:bg-[#3AA9D1] transition disabled:bg-gray-400"
                    >
                      {resendingId === p.id ? "MENGIRIM..." : p.emailStatus === "SENT" ? "KIRIM ULANG EMAIL" : "KIRIM EMAIL QR"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          <div className="space-y-4">
            <h3 className="font-heading text-xl text-background uppercase italic border-b-4 border-[#4BCFFC] inline-block">Group Payment Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl">
              <div className="space-y-2">
                <DetailItem label="Account Holder Name" value={registration.rekeningName} />
                <DetailItem label="Registration Type" value={registration.type.replace(/_/g, ' ')} />
                <DetailItem label="Package Chosen" value={registration.chosenPackage?.toUpperCase() || "PERSONAL"} />
                <DetailItem label="Payment Status" value={registration.paymentStatus ? "PAID" : "UNPAID"} />
              </div>
              <div>
                <p className="text-gray-400 text-[10px]  uppercase mb-2">Payment Proof</p>
                {registration.paymentProofUrl ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md bg-white border-2 border-white">
                    <Image src={registration.paymentProofUrl} alt="Payment Proof" fill className="object-contain" />
                    <a href={registration.paymentProofUrl} target="_blank" className="absolute bottom-2 right-2 bg-[#4BCFFC] text-white px-3 py-1 rounded text-[10px] ">VIEW PROOF</a>
                  </div>
                ) : <div className="h-64 bg-white rounded-xl flex items-center justify-center text-gray-300 italic text-xs">No proof uploaded</div>}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}