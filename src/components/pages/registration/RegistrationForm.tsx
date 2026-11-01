"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ParticipantForm from "./ParticipantForm";
import { UploadWidget } from "@/components/CloudinaryWidget";
import { createBulkRegistration } from "@/lib/registration";
import { RegistrationCategory, ChosenPackage } from "@/types/registration.md";
import Image from "next/image";
import { JERSEY_SIZE_OPTIONS } from "./ParticipantForm";

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
  jerseySize: "S",
  medicalCondition: "",
  idCardUrl: "",
  idCardPublicId: "",
  committeeInviter: "",
};

const BUNDLING_TOTAL_PARTICIPANTS = 4;
const COMMUNITY_TOTAL_PARTICIPANTS = 11;
const COMMUNITY_20_TOTAL_PARTICIPANTS = 20;
const COMMUNITY_30_TOTAL_PARTICIPANTS = 30;
const COMMUNITY_40_TOTAL_PARTICIPANTS = 40;

interface RegistrationFormProps {
  category: "Category_5K";
  type: "super_early_bird" | "early_bird" | "regular";
  mahasiswaUCEnabled?: boolean;
}

export default function RegistrationForm({
  category,
  type,
  mahasiswaUCEnabled = true,
}: RegistrationFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [packageType, setPackageType] = useState<ChosenPackage>("only_medal");
  const [participantCount, setParticipantCount] = useState(1);
  const [participants, setParticipants] = useState<ParticipantData[]>([
    { ...emptyParticipant },
  ]);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentProofId, setPaymentProofId] = useState("");
  const [rekeningName, setRekeningName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const is5K = category === "Category_5K";
  const prices =
    type === "super_early_bird"
      ? {
          personal: is5K ? 149000 : 179000,
          uc: 0,
          bundling: is5K ? 149000 : 179000,
          community: is5K ? 149000 : 179000,
          only_medal: 95000,
          community_package_20: 2950000,
          community_package_30: 4150000,
          community_package_40: 5000000,
        }
      : type === "early_bird"
        ? {
            personal: is5K ? 185000 : 210000,
            uc: is5K ? 155000 : 185000,
            bundling: is5K ? 162500 : 187500,
            community: is5K ? 156400 : 180900,
            only_medal: 95000,
            community_package_20: 2950000,
            community_package_30: 4150000,
            community_package_40: 5000000,
          }
        : {
            personal: is5K ? 199000 : 199000,
            uc: is5K ? 185000 : 185000,
            bundling: is5K ? 162500 : 187500,
            community: is5K ? 156400 : 180900,
            only_medal: 95000,
            community_package_20: 2950000,
            community_package_30: 4150000,
            community_package_40: 5000000,
          };

  const PERSONAL_PRICE = prices.personal;
  const UC_STUDENT_PRICE = prices.uc;
  const BUNDLING_PRICE = prices.bundling * 4;
  const COMMUNITY_PRICE = prices.community * 11;
  const ONLY_MEDAL_PRICE = prices.only_medal;
  const COMMUNITY_20_PRICE = prices.community_package_20;
  const COMMUNITY_30_PRICE = prices.community_package_30;
  const COMMUNITY_40_PRICE = prices.community_package_40;

  const getFixedParticipantCount = (pkg: ChosenPackage): number | null => {
    switch (pkg) {
      case "bundling": return BUNDLING_TOTAL_PARTICIPANTS;
      case "community": return COMMUNITY_TOTAL_PARTICIPANTS;
      case "community_package_20": return COMMUNITY_20_TOTAL_PARTICIPANTS;
      case "community_package_30": return COMMUNITY_30_TOTAL_PARTICIPANTS;
      case "community_package_40": return COMMUNITY_40_TOTAL_PARTICIPANTS;
      default: return null;
    }
  };

  useEffect(() => {
    const fixedCount = getFixedParticipantCount(packageType);
    if (fixedCount !== null) {
      setParticipants(
        Array(fixedCount)
          .fill(null)
          .map((_, i) => participants[i] || { ...emptyParticipant }),
      );
    } else {
      setParticipants(
        Array(participantCount)
          .fill(null)
          .map((_, i) => participants[i] || { ...emptyParticipant }),
      );
    }
  }, [packageType, participantCount]);

  const getJerseyExtra = (jerseySize: string) => {
    const option = JERSEY_SIZE_OPTIONS.find((s) => s.value === jerseySize);
    return option?.extra || 0;
  };

  const basePrice = (() => {
    if (packageType === "bundling") return BUNDLING_PRICE;
    if (packageType === "community") return COMMUNITY_PRICE;
    if (packageType === "community_package_20") return COMMUNITY_20_PRICE;
    if (packageType === "community_package_30") return COMMUNITY_30_PRICE;
    if (packageType === "community_package_40") return COMMUNITY_40_PRICE;
    if (packageType === "ucstudent") return participantCount * UC_STUDENT_PRICE;
    if (packageType === "only_medal") return participantCount * ONLY_MEDAL_PRICE;
    return participantCount * PERSONAL_PRICE;
  })();

  const jerseyExtrasTotal = participants.reduce(
    (acc, p) => acc + getJerseyExtra(p.jerseySize),
    0,
  );

  const totalPrice = basePrice + jerseyExtrasTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return toast.error("Please login first");
    if (totalPrice > 0 && (!paymentProofUrl || !rekeningName))
      return toast.error("Upload payment proof");

    // Validate all participant fields
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const label = `Participant ${i + 1}`;
      if (!p.fullName.trim()) return toast.error(`Please enter full name for ${label}`);
      if (!p.email.trim()) return toast.error(`Please enter email for ${label}`);
      if (!p.phoneNumber.trim()) return toast.error(`Please enter phone number for ${label}`);
      if (!p.dateOfBirth) return toast.error(`Please enter date of birth for ${label}`);
      if (!p.gender) return toast.error(`Please select gender for ${label}`);
      if (!p.bloodType) return toast.error(`Please select blood type for ${label}`);
      if (!p.city.trim()) return toast.error(`Please enter city for ${label}`);
      if (!p.address.trim()) return toast.error(`Please enter address for ${label}`);
      if (!p.emergencyContact.trim()) return toast.error(`Please enter emergency contact name for ${label}`);
      if (!p.emergencyPhone.trim()) return toast.error(`Please enter emergency contact number for ${label}`);
      if (packageType !== "only_medal" && !p.jerseySize) return toast.error(`Please select jersey size for ${label}`);
      if (!p.idCardUrl) return toast.error(`Please upload ID card for ${label}`);
    }
    setIsSubmitting(true);
    try {
      const dataList = participants.map((p) => ({
        userId: session.user.id as string,
        ...p,
        dateOfBirth: new Date(p.dateOfBirth),
        category: category as RegistrationCategory,
        type: type,
        paymentProofUrl: totalPrice > 0 ? paymentProofUrl : undefined,
        paymentProofId: totalPrice > 0 ? paymentProofId : undefined,
        rekeningName: rekeningName || "-",
        chosenPackage: packageType,
      }));

      const result = await createBulkRegistration(dataList);
      if (!result.success) throw new Error(result.error);

      toast.success("Registration successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-impact text-background mb-4">
          Select Package
        </h2>
        <div
          className={`grid gap-4 ${mahasiswaUCEnabled && type === "early_bird" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}
        >
          <button
            type="button"
            // disabled={true}
            onClick={() => setPackageType("personal")}
            className={`p-6 rounded-xl border-4 ${packageType === "personal" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
          >
            <h3 className="text-xl font-impact text-background">Personal</h3>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(PERSONAL_PRICE)}/person
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPackageType("bundling")}
            className={`p-6 rounded-xl border-4 ${packageType === "bundling" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
          >
            <h3 className="text-xl font-impact text-background">Bundling</h3>
            <p className="text-gray-600 mt-2 text-sm">4 Persons!</p>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(BUNDLING_PRICE)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPackageType("community")}
            className={`p-6 rounded-xl border-4 ${packageType === "community" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
            // disabled={true}
          >
            <h3 className="text-xl font-impact text-background">Community</h3>
            <p className="text-gray-600 mt-2 text-sm">11 Persons!</p>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(COMMUNITY_PRICE)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPackageType("only_medal")}
            className={`p-6 rounded-xl border-4 ${packageType === "only_medal" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
          >
            <h3 className="text-xl font-impact text-background">Only Medal</h3>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(ONLY_MEDAL_PRICE)}/person
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPackageType("community_package_20")}
            className={`p-6 rounded-xl border-4 ${packageType === "community_package_20" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
          >
            <h3 className="text-xl font-impact text-background">Community 20</h3>
            <p className="text-gray-600 mt-2 text-sm">20 Persons!</p>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(COMMUNITY_20_PRICE)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPackageType("community_package_30")}
            className={`p-6 rounded-xl border-4 ${packageType === "community_package_30" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
          >
            <h3 className="text-xl font-impact text-background">Community 30</h3>
            <p className="text-gray-600 mt-2 text-sm">30 Persons!</p>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(COMMUNITY_30_PRICE)}
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPackageType("community_package_40")}
            className={`p-6 rounded-xl border-4 ${packageType === "community_package_40" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
          >
            <h3 className="text-xl font-impact text-background">Community 40</h3>
            <p className="text-gray-600 mt-2 text-sm">40 Persons!</p>
            <p className="text-xl font-bold text-background mt-2">
              {formatCurrency(COMMUNITY_40_PRICE)}
            </p>
          </button>
          {mahasiswaUCEnabled && type !== "early_bird" && (
            <button
              type="button"
              // disabled={true}
              onClick={() => setPackageType("ucstudent")}
              className={`p-6 rounded-xl border-4 ${packageType === "ucstudent" ? "border-[#4BCFFC] bg-[#4BCFFC]/10" : "border-gray-200"}`}
            >
              <h3 className="text-xl font-impact text-background">
                UC Student
              </h3>
              <p className="text-xl font-bold text-background mt-2">
                {formatCurrency(UC_STUDENT_PRICE)}/person
              </p>
            </button>
          )}
        </div>
        {(packageType === "personal" || packageType === "only_medal" || packageType === "ucstudent") && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participant Count
            </label>
            <select
              value={participantCount}
              onChange={(e) => setParticipantCount(Number(e.target.value))}
              className="w-full md:w-48 px-4 py-2 border-2 rounded-lg border-gray-200 text-background"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} Participant
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        {/* Size chart ditampilkan sekali di atas Participant 1 */}
        {packageType !== "only_medal" && (
          <div className="bg-white p-6 shadow-lg border-b-2 border-gray-100">
            <h2 className="text-2xl font-impact text-background mb-4">Size Chart</h2>
            <Image
              src="/registration/size-chart-new.webp"
              className="w-full h-auto rounded-lg"
              alt="Size Chart"
              width={800}
              height={500}
            />
          </div>
        )}
        {participants.map((p, i) => (
          <ParticipantForm
            key={i}
            index={i}
            data={p}
            isUcStudent={packageType === "ucstudent"}
            isOnlyMedal={packageType === "only_medal"}
            onChange={(d) =>
              setParticipants((prev) => {
                const upd = [...prev];
                upd[i] = { ...upd[i], ...d };
                return upd;
              })
            }
            isBundling={packageType === "bundling"}
          />
        ))}
      </div>

      {totalPrice > 0 && (
        <div className="bg-amber-50 border-4 border-amber-400 p-6">
          <h2 className="text-2xl font-impact text-background mb-4">
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
      )}

      {totalPrice > 0 && (
        <div className="bg-white p-6 shadow-lg border-b-2 border-gray-100">
          <h2 className="text-2xl font-impact text-background mb-4">
            Payment Confirmation
          </h2>
          <input
            type="text"
            value={rekeningName}
            onChange={(e) => setRekeningName(e.target.value)}
            placeholder="Account holder name"
            className="w-full px-4 py-3 border-2 rounded-lg border-gray-200 text-background outline-none"
          />
        </div>
      )}

      <div className="bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-impact text-background mb-4">Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>
              {packageType === "bundling"
                ? `Bundling Package (${BUNDLING_TOTAL_PARTICIPANTS} persons)`
                : packageType === "community"
                  ? `Community Package (${COMMUNITY_TOTAL_PARTICIPANTS} persons)`
                  : packageType === "community_package_20"
                    ? `Community Package 20 (${COMMUNITY_20_TOTAL_PARTICIPANTS} persons)`
                    : packageType === "community_package_30"
                      ? `Community Package 30 (${COMMUNITY_30_TOTAL_PARTICIPANTS} persons)`
                      : packageType === "community_package_40"
                        ? `Community Package 40 (${COMMUNITY_40_TOTAL_PARTICIPANTS} persons)`
                        : packageType === "ucstudent"
                          ? `UC Student (${participantCount} person${participantCount > 1 ? "s" : ""})`
                          : packageType === "only_medal"
                            ? `Only Medal (${participantCount} person${participantCount > 1 ? "s" : ""})`
                            : `Personal (${participantCount} person${participantCount > 1 ? "s" : ""})`}
            </span>
            <span className="font-bold">{formatCurrency(basePrice)}</span>
          </div>

          {jerseyExtrasTotal > 0 && (
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
                        Participant {idx + 1} ({p.fullName || "No Name"}) - Size{" "}
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
              <span className="text-[#4BCFFC]">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-impact text-background mb-4">
            Upload Payment Proof
          </h2>
          {!paymentProofUrl ? (
            <UploadWidget
              folder="enthusiast-run/payment-proofs"
              allowedFormats={["jpg", "png", "pdf"]}
              onUploadSuccess={(url, id) => {
                setPaymentProofUrl(url);
                setPaymentProofId(id || "");
              }}
              label=""
            />
          ) : (
            <div className="p-4 bg-green-50 text-green-700">
              Proof uploaded.{" "}
              <button
                type="button"
                onClick={() => setPaymentProofUrl("")}
                className="underline"
              >
                Change
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-b-lg p-4 ">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full mt-6 py-4 rounded-xl font-impact text-xl text-white ${isSubmitting ? "bg-gray-400" : "bg-[#4BCFFC]"}`}
        >
          {isSubmitting
            ? "PROCESSING..."
            : `REGISTER NOW - ${formatCurrency(totalPrice)}`}
        </button>
      </div>
    </form>
  );
}
