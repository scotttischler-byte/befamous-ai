import { z } from "zod";
import type {
  IntakeAccidentType,
  IntakeFaultStatus,
  IntakeLeadPayload,
  IntakeTreatmentStatus,
  IntakeTriageOption,
} from "@/lib/types";

const injuryValues = [
  "head_injury",
  "neck_injury",
  "back_injury",
  "shoulder_injury",
  "arm_hand_injury",
  "chest_injury",
  "hip_injury",
  "leg_knee_injury",
  "fractures",
  "tbi",
  "spinal_cord_injury",
  "skull_fracture",
  "internal_bleeding",
  "organ_damage",
  "severe_burns",
  "amputation",
  "paralysis",
  "loss_vision",
  "loss_hearing",
  "permanent_disability",
  "chronic_severe_pain",
  "facial_disfigurement",
  "fatality",
  "other",
] as const;

const triageOptions: [IntakeTriageOption, ...IntakeTriageOption[]] = ["yes", "no", "not_sure"];
const treatmentOptions: [IntakeTreatmentStatus, ...IntakeTreatmentStatus[]] = [
  "already_treating",
  "willing_immediately",
  "not_yet_unsure",
  "no",
];
const faultOptions: [IntakeFaultStatus, ...IntakeFaultStatus[]] = ["no", "not_sure", "yes"];
const accidentTypeOptions: [IntakeAccidentType, ...IntakeAccidentType[]] = [
  "car",
  "commercial",
  "motorcycle",
  "rideshare",
  "ped_bike_hit",
  "other",
];

const e164Like = /^\+?[1-9]\d{9,14}$/;

export const intakeSchema = z.object({
  injuredInMva: z.literal(true),
  accidentDate: z.string().min(1, "Date of accident is required"),
  hasAttorney: z.enum(["yes", "no"]).refine((v) => v === "no", {
    message: "This intake is for people who have not retained an attorney.",
  }),
  faultStatus: z.enum(faultOptions),
  accidentType: z.enum(accidentTypeOptions),
  injuries: z.array(z.enum(injuryValues)).min(1, "Select at least one injury"),
  treatmentStatus: z.enum(treatmentOptions),
  policeReport: z.enum(triageOptions),
  policeReportCopy: z.enum(triageOptions).optional(),
  otherPartyInsurance: z.enum(triageOptions),
  hasUmCoverage: z.enum(triageOptions),
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .min(8, "Phone is required")
    .transform(normalizePhone)
    .refine((v) => e164Like.test(v), {
      message: "Use a valid phone number",
    }),
  email: z.string().email("Use a valid email"),
  consent: z.literal(true, {
    message: "Consent is required before submission.",
  }),
  incidentDescription: z.string().min(10, "Please add a brief description"),
});

export type IntakeSchemaData = z.infer<typeof intakeSchema>;

export const injuriesCatalog = injuryValues;

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (input.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

export function toPayload(data: IntakeSchemaData): IntakeLeadPayload {
  return {
    ...data,
    consent: true,
  };
}
