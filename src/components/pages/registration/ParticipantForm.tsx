"use client";

import React from "react";
import { UploadWidget } from "@/components/CloudinaryWidget";
import { ParticipantData } from "./RegistrationForm";
import Image from "next/image";
interface ParticipantFormProps {
  index: number;
  data: ParticipantData;
  onChange: (data: Partial<ParticipantData>) => void;
  isBundling: boolean;
  isUcStudent?: boolean;
  isOnlyMedal?: boolean;
}

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const BLOOD_TYPE_OPTIONS = ["A", "B", "AB", "O"];

const JERSEY_SIZE_OPTIONS = [
  { value: "XS", label: "XS", extra: 0 },
  { value: "S", label: "S", extra: 0 },
  { value: "M", label: "M", extra: 0 },
  { value: "L", label: "L", extra: 0 },
  { value: "XL", label: "XL", extra: 0 },
  { value: "XXL", label: "XXL (+Rp 10.000)", extra: 10000 },
  { value: "XXXL", label: "XXXL (+Rp 15.000)", extra: 15000 },
  { value: "FOUR_XL", label: "4XL (+Rp 20.000)", extra: 20000 },
  { value: "FIVE_XL", label: "5XL (+Rp 25.000)", extra: 25000 },
  { value: "SIX_XL", label: "6XL (+Rp 30.000)", extra: 30000 },
];

export { JERSEY_SIZE_OPTIONS };

export default function ParticipantForm({
  index,
  data,
  onChange,
  isBundling,
  isUcStudent = false,
  isOnlyMedal = false,
}: ParticipantFormProps) {
  const [isExpanded, setIsExpanded] = React.useState(index === 0);

  const inputClasses =
    "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#4BCFFC] focus:outline-none text-background placeholder-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white border-b-2 border-white shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-[#00476d] flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
            {index + 1}
          </span>
          <span className="text-white font-impact text-xl">
            {data.fullName || `Participant ${index + 1}`}
            {isBundling && index === 10 && (
              <span className="ml-2 px-2 py-1 bg-green-400 text-green-900 text-xs rounded-full font-normal">
                FREE!
              </span>
            )}
          </span>
        </div>
        <svg
          className={`w-6 h-6 text-white transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-background mb-4 pb-2 border-b-2 border-gray-100">
              Personal Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClasses}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => onChange({ fullName: e.target.value })}
                  placeholder="Enter full name as per ID card"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  placeholder="email@example.com"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={data.phoneNumber}
                  onChange={(e) => onChange({ phoneNumber: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={data.dateOfBirth}
                  onChange={(e) => onChange({ dateOfBirth: e.target.value })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.gender}
                  onChange={(e) => onChange({ gender: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">Gender</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>
                  Blood Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={data.bloodType}
                  onChange={(e) => onChange({ bloodType: e.target.value })}
                  className={inputClasses}
                >
                  <option value="">Choose your blood type</option>
                  {BLOOD_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClasses}>
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => onChange({ city: e.target.value })}
                  placeholder="Enter city of residence"
                  className={inputClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={data.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  placeholder="Enter full address"
                  rows={3}
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>
                  Committee Inviter{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={data.committeeInviter || ""}
                  onChange={(e) =>
                    onChange({ committeeInviter: e.target.value })
                  }
                  placeholder="Committee Inviter (Optional)"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-background mb-4 pb-2 border-b-2 border-gray-100">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.emergencyContact}
                  onChange={(e) =>
                    onChange({ emergencyContact: e.target.value })
                  }
                  placeholder="Name of emergency contact"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={labelClasses}>
                  Emergency Contact Number{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={data.emergencyPhone}
                  onChange={(e) => onChange({ emergencyPhone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-background mb-4 pb-2 border-b-2 border-gray-100">
              {isOnlyMedal ? "Medical Condition" : "Jersey & Medical Condition"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isOnlyMedal && (
                <div>
                  <label className={labelClasses}>
                    Jersey Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={data.jerseySize}
                    onChange={(e) => onChange({ jerseySize: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="">Select jersey size</option>
                    {JERSEY_SIZE_OPTIONS.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const selected = JERSEY_SIZE_OPTIONS.find(s => s.value === data.jerseySize);
                    if (selected && selected.extra > 0) {
                      return (
                        <p className="text-sm text-amber-600 mt-1">
                          * There is an additional charge of Rp {selected.extra.toLocaleString('id-ID')} for size {selected.label.split(' ')[0]}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}

              <div className="md:col-span-2">
                <label className={labelClasses}>
                  Medical Condition{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={data.medicalCondition}
                  onChange={(e) =>
                    onChange({ medicalCondition: e.target.value })
                  }
                  placeholder="Example: Allergies to certain medications, asthma, etc."
                  rows={2}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-background mb-4 pb-2 border-b-2 border-gray-100">
              {isUcStudent
                ? `Upload Student Card`
                : "Upload ID Card (KTP/SIM/Student Card)"}{" "}
              <span className="text-red-500">*</span>
            </h3>
            {data.idCardUrl ? (
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-700">
                    ID Card successfully uploaded
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ idCardUrl: "", idCardPublicId: "" });
                    }}
                    className="text-sm text-red-500 hover:underline mt-1"
                  >
                    Remove and re-upload
                  </button>
                </div>
              </div>
            ) : (
              <UploadWidget
                folder="enthusiast-run/id-cards"
                allowedFormats={["jpg", "jpeg", "png", "pdf"]}
                label=""
                onUploadSuccess={(url, publicId) => {
                  onChange({ idCardUrl: url, idCardPublicId: publicId || "" });
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
