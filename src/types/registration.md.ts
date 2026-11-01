export type RegistrationCategory = "CATEGORY_5K";
export type RegistrationStatus = "pending" | "confirmed" | "cancelled";
export type EmailStatus = "NOT_SENT" | "SENT" | "FAILED";
export type Gender = "Male" | "Female";
export type BloodType = "A" | "B" | "AB" | "O";
export type JerseySize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | "FOUR_XL" | "FIVE_XL" | "SIX_XL";
export type ChosenPackage =
  | "personal"
  | "bundling"
  | "ucstudent"
  | "community"
  | "only_medal"
  | "community_package_20"
  | "community_package_30"
  | "community_package_40";

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender | "";
  address: string;
  city: string;
  emergencyContact: string;
  emergencyPhone: string;
  category: RegistrationCategory | "";
  bloodType?: BloodType | "";
  medicalCondition?: string;
  jerseySize: JerseySize | "";
  committeeInviter?: string;
}

export interface RegistrationPhotos {
  photoUrl: string;
  photoPublicId: string;
  idCardUrl: string;
  idCardPublicId: string;
  paymentProofUrl: string;
  paymentProofId: string;
}

export interface RegistrationData {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  city: string;
  emergencyContact: string;
  emergencyPhone: string;
  category: RegistrationCategory;
  bloodType?: string;
  medicalCondition?: string;
  photoUrl?: string;
  photoPublicId?: string;
  idCardUrl?: string;
  idCardPublicId?: string;
  jerseySize: string;
  paymentProofUrl?: string;
  paymentProofId?: string;
  rekeningName?: string;
  type: "super_early_bird" | "early_bird" | "regular" | "redeem_voucher";
  chosenPackage?: ChosenPackage;
  committeeInviter?: string;
}

export interface Voucher {
  id: string;
  category: string;
  isUsed: boolean;
}

export interface Registration extends RegistrationData {
  id: string;
  status: RegistrationStatus;
  paymentStatus: boolean;
  paymentDate?: Date | null;
  createdAt: Date;
  qrCodeId?: string | null;
  qrCodeClaimed?: boolean | null;
  qrCodeClaimedAt?: Date | null;
  emailStatus?: EmailStatus;
  emailSentAt?: Date | null;
  updatedAt: Date;
  user?: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  qrCode?: {
    id: string;
    token: string;
    qrCodeUrl: string;
  } | null;
}

export interface BundlingParticipant {
  fullName: string;
  email: string;
  bloodType: string;
  ktp: string;
  gender: "Laki-laki" | "Perempuan";
  birthDate: string;
  phone: string;
  emergencyPhone: string;
  participantStatus: "Mahasiswa" | "Umum";
  jerseySize: JerseySize;
}

export interface BundlingRegistrationData {
  participants: BundlingParticipant[];
  paymentProofUrl?: string;
}
