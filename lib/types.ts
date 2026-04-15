export type Platform = "instagram" | "tiktok" | "youtube_shorts";

export type BrandTag =
  | "MVA"
  | "LAW_FIRM"
  | "FITNESS"
  | "NBA_DOG_TAGS"
  | "GAMEDAY_RINGS"
  | "PERSONAL_BRAND";

export type PostStatus = "draft" | "posted";

export type BrandRow = {
  id: string;
  brand_tag: string;
  name: string;
  audience: string;
  tone: string;
  primary_goal: string;
  cta_style: string;
  offer: string;
  preferred_platforms: string[];
  created_at: string;
};

export type PlatformVariants = Partial<
  Record<
    Platform,
    { caption?: string; hashtags?: string; hook?: string; cta?: string }
  >
> & {
  mva_variation?: string;
};

export type ContentPostRow = {
  id: string;
  brand_id: string;
  brand_tag: string;
  platform: Platform;
  content: string;
  script: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  visual_plan: string[];
  score: number;
  platform_variants: PlatformVariants;
  image_url: string;
  video_url: string;
  generate_for_leads: boolean;
  status: PostStatus;
  created_at: string;
};

export type PerformanceRow = {
  id: string;
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  conversion_estimate: number;
  score: number;
  recorded_at: string;
};

export type PerformanceLogRow = {
  id: string;
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  conversion_estimate: number;
  score: number;
  logged_at: string;
};

export type WinningPatternRow = {
  id: string;
  brand_id: string;
  hook_pattern: string;
  cta_pattern: string;
  topic: string;
  avg_score: number;
  updated_at: string;
};

/** Viral score inputs (saves optional for legacy forms). */
export type PostMetricsInput = {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  conversion_estimate?: number;
};

export type PostMetricsLogInput = {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  conversion_estimate: number;
};

export type AnalyzedPost = {
  post: ContentPostRow;
  score: number;
};

export type IntakeFaultStatus = "no" | "not_sure" | "yes";
export type IntakeTreatmentStatus =
  | "already_treating"
  | "willing_immediately"
  | "not_yet_unsure"
  | "no";
export type IntakeTriageOption = "yes" | "no" | "not_sure";
export type IntakeAccidentType =
  | "car"
  | "commercial"
  | "motorcycle"
  | "rideshare"
  | "ped_bike_hit"
  | "other";

export type CaseType =
  | "STANDARD"
  | "CATASTROPHIC"
  | "COMMERCIAL"
  | "MOTORCYCLE"
  | "RIDESHARE"
  | "DISQUALIFIED";

export type IntakePriority = "HIGH" | "MEDIUM" | "LOW";

export type IntakeLeadPayload = {
  injuredInMva: boolean;
  accidentDate: string;
  hasAttorney: "yes" | "no";
  faultStatus: IntakeFaultStatus;
  accidentType: IntakeAccidentType;
  injuries: string[];
  treatmentStatus: IntakeTreatmentStatus;
  policeReport: IntakeTriageOption;
  policeReportCopy?: IntakeTriageOption;
  otherPartyInsurance: IntakeTriageOption;
  hasUmCoverage: IntakeTriageOption;
  fullName: string;
  phone: string;
  email: string;
  consent: boolean;
  incidentDescription: string;
};
