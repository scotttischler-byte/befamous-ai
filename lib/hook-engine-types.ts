export type HookFormState = {
  platform: string;
  niche: string;
  goal: string;
  tone: string;
  audience: string;
  offer: string;
  cta: string;
  outputCount: 5 | 10 | 20;
};

export const PLATFORMS = [
  "TikTok",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "YouTube Shorts",
  "X/Twitter",
] as const;

export const NICHES = [
  "Law Firm Marketing",
  "Real Estate",
  "Fitness",
  "Beauty",
  "Finance",
  "Personal Brand",
  "Ecommerce",
] as const;

export const GOALS = [
  "Leads",
  "Views",
  "Comments",
  "Shares",
  "Booked Calls",
  "Brand Awareness",
] as const;

export const TONES = [
  "Bold",
  "Urgent",
  "Luxury",
  "Friendly",
  "Authority",
  "Controversial",
] as const;

export const OUTPUT_COUNTS = [5, 10, 20] as const;

export const DEFAULT_FORM: HookFormState = {
  platform: "TikTok",
  niche: "Personal Brand",
  goal: "Leads",
  tone: "Bold",
  audience: "founders and operators",
  offer: "your flagship offer or topic",
  cta: "comment GUIDE",
  outputCount: 5,
};
