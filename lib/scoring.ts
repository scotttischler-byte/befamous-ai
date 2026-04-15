import type { CaseType, IntakeLeadPayload, IntakePriority } from "@/lib/types";

const catastrophicInjuries = new Set([
  "spinal_cord_injury",
  "tbi",
  "skull_fracture",
  "fractures",
  "amputation",
  "severe_burns",
  "loss_vision",
  "loss_hearing",
  "organ_damage",
  "internal_bleeding",
  "permanent_disability",
  "paralysis",
  "facial_disfigurement",
  "fatality",
  "chronic_severe_pain",
]);

type CaseClassification = {
  caseType: CaseType;
  priority: IntakePriority;
  score: number;
  disqualificationReason: string | null;
  daysSinceAccident: number;
};

export function classifyCase(payload: IntakeLeadPayload): CaseClassification {
  const daysSinceAccident = getDaysSince(payload.accidentDate);
  const treatmentPositive =
    payload.treatmentStatus === "already_treating" ||
    payload.treatmentStatus === "willing_immediately";
  const insuranceEligible =
    payload.otherPartyInsurance === "yes" || payload.otherPartyInsurance === "not_sure";
  const severeInjury = payload.injuries.some((injury) => catastrophicInjuries.has(injury));

  let score = 0;
  if (daysSinceAccident <= 21) score += 30;
  else if (daysSinceAccident <= 90) score += 14;
  if (payload.hasAttorney === "no") score += 12;
  if (payload.faultStatus === "no") score += 18;
  if (payload.faultStatus === "not_sure") score += 8;
  if (payload.faultStatus === "yes") score -= 28;
  if (treatmentPositive) score += 15;
  if (payload.treatmentStatus === "not_yet_unsure") score += 4;
  if (payload.treatmentStatus === "no") score -= 18;
  if (severeInjury) score += 25;
  if (payload.accidentType === "commercial") score += 10;
  if (payload.accidentType === "motorcycle") score += 10;
  if (payload.accidentType === "rideshare" || payload.accidentType === "ped_bike_hit") score += 10;
  if (insuranceEligible) score += 6;
  if (payload.otherPartyInsurance === "no") score -= 10;

  if (!payload.injuredInMva) {
    return disqualified("Not an injury motor vehicle accident submission.", score, daysSinceAccident);
  }
  if (payload.hasAttorney === "yes") {
    return disqualified("Lead already represented by an attorney.", score, daysSinceAccident);
  }
  if (payload.faultStatus === "yes") {
    return disqualified("Lead reports being at fault.", score, daysSinceAccident);
  }

  const baseQualified = treatmentPositive && insuranceEligible && daysSinceAccident <= 21;
  const noAttorney = payload.hasAttorney === "no";
  const likelyNotAtFault = payload.faultStatus === "no" || payload.faultStatus === "not_sure";

  if (
    severeInjury &&
    daysSinceAccident <= 90 &&
    noAttorney &&
    likelyNotAtFault &&
    (payload.treatmentStatus === "already_treating" || payload.treatmentStatus === "willing_immediately")
  ) {
    return { caseType: "CATASTROPHIC", priority: "HIGH", score, disqualificationReason: null, daysSinceAccident };
  }

  if (payload.accidentType === "commercial" && baseQualified && noAttorney && likelyNotAtFault) {
    return { caseType: "COMMERCIAL", priority: score >= 70 ? "HIGH" : "MEDIUM", score, disqualificationReason: null, daysSinceAccident };
  }

  if (payload.accidentType === "motorcycle" && baseQualified && noAttorney && likelyNotAtFault) {
    return { caseType: "MOTORCYCLE", priority: score >= 70 ? "HIGH" : "MEDIUM", score, disqualificationReason: null, daysSinceAccident };
  }

  if (
    (payload.accidentType === "rideshare" || payload.accidentType === "ped_bike_hit") &&
    baseQualified &&
    noAttorney &&
    likelyNotAtFault
  ) {
    return { caseType: "RIDESHARE", priority: score >= 70 ? "HIGH" : "MEDIUM", score, disqualificationReason: null, daysSinceAccident };
  }

  if (baseQualified && noAttorney && likelyNotAtFault) {
    return { caseType: "STANDARD", priority: score >= 70 ? "HIGH" : "MEDIUM", score, disqualificationReason: null, daysSinceAccident };
  }

  return disqualified("Submission does not currently meet accident intake criteria.", score, daysSinceAccident);
}

function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 9999;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function disqualified(reason: string, score: number, daysSinceAccident: number): CaseClassification {
  return {
    caseType: "DISQUALIFIED",
    priority: "LOW",
    score,
    disqualificationReason: reason,
    daysSinceAccident,
  };
}
