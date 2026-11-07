"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ParticipantForm from "./ParticipantForm";
import { JERSEY_SIZE_OPTIONS } from "./ParticipantForm";
import { UploadWidget } from "@/components/CloudinaryWidget";
import { createRegistration } from "@/lib/registration";
import { RegistrationCategory } from "@/types/registration.md";

export interface ParticipantData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  city: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  jerseySize: string;
  medicalCondition: string;
  idCardUrl: string;
  idCardPublicId: string;
  committeeInviter: string;
}

const emptyParticipant: ParticipantData = {
  fullName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  bloodType: "",
  city: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  jerseySize: "",
  medicalCondition: "",
  idCardUrl: "",
  idCardPublicId: "",
  committeeInviter: "",
};

const getJerseyExtra = (jerseySize: string) => {
  const option = JERSEY_SIZE_OPTIONS.find((s) => s.value === jerseySize);
  return option?.extra || 0;
};

interface RedeemCodeResponse {
  success: boolean;
  message?: string;
  discount?: number;
  maxParticipants?: number;
  category?: "CATEGORY_5K";
}

export default function RedeemCodeForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [redeemCode, setRedeemCode] = useState("");
  const [participants, setParticipants] = useState<ParticipantData[]>([
    { ...emptyParticipant },
  ]);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentProofId, setPaymentProofId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const calculateTotal = () => {
    const jerseyExtras = participants.reduce((total, p) => {
      return total + getJerseyExtra(p.jerseySize);
    }, 0);
    return jerseyExtras;
  };

  const updateParticipant = (index: number, data: Partial<ParticipantData>) => {
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  };

  const validateForm = () => {
    if (!redeemCode.trim()) {
      toast.error("Mohon masukkan kode voucher");
      return false;
    }
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (
        !p.fullName ||
        !p.email ||
        !p.phoneNumber ||
        !p.dateOfBirth ||
        !p.gender ||
        !p.bloodType ||
        !p.city ||
        !p.address ||
        !p.emergencyContact ||
        !p.emergencyPhone ||
        !p.jerseySize ||
        !p.idCardUrl
      ) {
        toast.error(`Mohon lengkapi semua data untuk Peserta ${i + 1}`);
        return false;
      }
    }
    if (calculateTotal() > 0 && !paymentProofUrl) {
      toast.error("Mohon unggah bukti pembayaran tambahan");
      return false;
    }
    if (!agreedToTerms) {
      toast.error("Mohon setujui syarat dan ketentuan");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/api/auth/signin");
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const voucherResponse = await fetch("/api/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: redeemCode.trim() }),
      });
      const voucherData: RedeemCodeResponse = await voucherResponse.json();
      if (!voucherData.success) {
        toast.error(voucherData.message || "Kode voucher tidak valid");
        setIsSubmitting(false);
        return;
      }
      for (const participant of participants) {
        const result = await createRegistration({
          userId: session.user.id,
          fullName: participant.fullName,
          email: participant.email,
          phoneNumber: participant.phoneNumber,
          dateOfBirth: new Date(participant.dateOfBirth),
          gender: participant.gender,
          bloodType: participant.bloodType,
          city: participant.city,
          address: participant.address,
          emergencyContact: participant.emergencyContact,
          emergencyPhone: participant.emergencyPhone,
          category: voucherData.category as RegistrationCategory,
          jerseySize: participant.jerseySize,
          medicalCondition: participant.medicalCondition || undefined,
          idCardUrl: participant.idCardUrl,
          idCardPublicId: participant.idCardPublicId,
          type: "redeem_voucher",
          committeeInviter: participant.committeeInviter || undefined,
          paymentProofUrl: paymentProofUrl,
          paymentProofId: `REDEEM VOUCHER ${redeemCode.trim()}`,
          voucherId: redeemCode.trim(),
        });
        if (!result.success) {
          toast.error(result.error || "Failed to create registration");
          setIsSubmitting(false);
          return;
        }
      }
      toast.success("Registration successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-heading text-background mb-4">
          Voucher Code
        </h2>
        <input
          type="text"
          value={redeemCode}
          onChange={(e) => setRedeemCode(e.target.value)}
          placeholder="Enter voucher code..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#4BCFFC] focus:outline-none text-background uppercase"
        />
      </div>

      <div>
        <ParticipantForm
          index={0}
          data={participants[0]}
          onChange={(data) => updateParticipant(0, data)}
          isBundling={false}
        />
      </div>

      <div className="bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-heading text-background mb-4">Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Pendaftaran Peserta (Voucher)</span>
            <span className="text-green-600 font-bold font-heading">FREE</span>
          </div>

          {participants.some(
            (p) => getJerseyExtra(p.jerseySize) > 0,
          ) && (
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 mt-2">
                Additional Charges (Jersey):
              </p>
              {participants.map((p, idx) => {
                const extra = getJerseyExtra(p.jerseySize);
                if (extra > 0) {
                  const sizeLabel = JERSEY_SIZE_OPTIONS.find(s => s.value === p.jerseySize)?.label.split(' ')[0] || p.jerseySize;
                  return (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-amber-600 pl-2"
                    >
                      <span>
                        Peserta {idx + 1} ({p.fullName || "Tanpa Nama"}) - Size{" "}
                        {sizeLabel}
                      </span>
                      <span>+{formatCurrency(extra)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          <div className="border-t-2 border-gray-200 pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold text-background">
              <span>Total Price</span>
              <span className="text-[#4BCFFC]">
                {calculateTotal() === 0
                  ? "FREE"
                  : formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {calculateTotal() > 0 && (
        <>
          <div className="bg-amber-50 border-4 border-amber-400 p-6">
            <h2 className="text-2xl font-heading text-background mb-4">
              Payment Information
            </h2>
            <div className="bg-white p-4 space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Bank:</span> BCA
              </p>
              <p>
                <span className="font-medium">Account:</span> 0092872571
              </p>
              <p>
                <span className="font-medium">Name:</span> Kho Valencia Febe
                Amanda
              </p>
              <p>
                <span className="font-medium">Payment Description:</span>{" "}
                Run.Participant Name
              </p>
            </div>
          </div>

          <div className="bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-heading text-background mb-4">
              Upload Payment Proof
            </h2>
            {!paymentProofUrl ? (
              <UploadWidget
                folder="enthusiast-run/payment-proofs"
                allowedFormats={["jpg", "jpeg", "png", "pdf"]}
                label=""
                onUploadSuccess={(url, publicId) => {
                  setPaymentProofUrl(url);
                  setPaymentProofId(publicId || "");
                }}
              />
            ) : (
              <div className="p-4 bg-green-50 border-2 border-green-200 text-green-700">
                Payment proof uploaded.{" "}
                <button
                  type="button"
                  onClick={() => setPaymentProofUrl("")}
                  className="text-red-500 underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="bg-white p-6 shadow-lg rounded-b-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-5 h-5"
          />
          <span className="text-gray-600">
            I agree to the terms and conditions.
          </span>
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-6 py-4 rounded-xl font-heading text-xl text-white ${isSubmitting ? "bg-gray-400" : "bg-[#4BCFFC] hover:bg-[#3AA9D1]"}`}
        >
          {isSubmitting
            ? "PROCESSING..."
            : calculateTotal() === 0
              ? "REDEEM & REGISTER NOW"
              : `REDEEM & PAY - ${formatCurrency(calculateTotal())}`}
        </button>
      </div>
    </form>
  );
}
