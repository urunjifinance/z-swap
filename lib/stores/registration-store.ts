import { create } from "zustand";

export interface RegistrationData {
  // Step 1 — Personal
  fullName: string;
  nrcNumber: string;
  dateOfBirth: string;
  gender: string;
  photoFileName: string;
  phone: string;
  email: string;
  altPhone: string;
  physicalAddress: string;
  password: string;
  confirmPassword: string;

  // Step 2 — Department
  departmentId: string;
  departmentOther: string;

  // Step 3 — Job details
  salaryScale: string;
  jobTitle: string;
  jobTitleOther: string;
  dateFirstAppointed: string;
  currentStationName: string;
  stationType: string;
  yearsOfService: string;
  qualification: string;
  teachingSubjects: string;

  // Step 4 — Current location
  currentProvince: string;
  currentDistrict: string;
  areaClassification: string;

  // Step 5 — Preferred swap locations
  desiredProvinces: string[];
  desiredDistricts: string[];
  desiredStation: string;
  willingToMove: string;
  swapReason: string;
  swapReasonOther: string;
  urgency: string;
  earliestAvailable: string;

  // Step 6 — Incentive
  incentivePreference: string;
  incentiveAmountMin: string;
  incentiveAmountMax: string;
  incentiveTerms: string;

  // Step 7 — Contacts
  whatsapp: string;
  whatsappSameAsPrimary: boolean;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;

  // Step 8 — Documents
  nrcDocName: string;
  selfieName: string;
  agreedToTerms: boolean;
  consentSharedProfile: boolean;

  // Step 9 — Referral
  promoCode: string;
}

const initialData: RegistrationData = {
  fullName: "",
  nrcNumber: "",
  dateOfBirth: "",
  gender: "",
  photoFileName: "",
  phone: "",
  email: "",
  altPhone: "",
  physicalAddress: "",
  password: "",
  confirmPassword: "",

  departmentId: "",
  departmentOther: "",

  salaryScale: "",
  jobTitle: "",
  jobTitleOther: "",
  dateFirstAppointed: "",
  currentStationName: "",
  stationType: "",
  yearsOfService: "",
  qualification: "",
  teachingSubjects: "",

  currentProvince: "",
  currentDistrict: "",
  areaClassification: "",

  desiredProvinces: [],
  desiredDistricts: [],
  desiredStation: "",
  willingToMove: "",
  swapReason: "",
  swapReasonOther: "",
  urgency: "Medium",
  earliestAvailable: "",

  incentivePreference: "negotiate",
  incentiveAmountMin: "",
  incentiveAmountMax: "",
  incentiveTerms: "",

  whatsapp: "",
  whatsappSameAsPrimary: true,
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",

  nrcDocName: "",
  selfieName: "",
  agreedToTerms: false,
  consentSharedProfile: false,

  promoCode: "",
};

interface RegistrationStore {
  step: number;
  data: RegistrationData;
  setStep: (step: number) => void;
  update: (fields: Partial<RegistrationData>) => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  step: 1,
  data: initialData,
  setStep: (step) => set({ step }),
  update: (fields) => set((s) => ({ data: { ...s.data, ...fields } })),
  reset: () => set({ step: 1, data: initialData }),
}));

export const TOTAL_STEPS = 9;

export const STEP_LABELS = [
  "Personal Details",
  "Department",
  "Job Details",
  "Current Location",
  "Preferred Locations",
  "Incentive",
  "Contacts",
  "Verification",
  "Review & Submit",
];
