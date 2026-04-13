import type { BrandRow, BrandTag, Platform } from "@/lib/types";

/** Canonical in-code profiles — keep aligned with `supabase/schema.sql` seeds. */
export type BrandProfile = {
  tag: BrandTag;
  displayName: string;
  audience: string;
  tone: string;
  goal: "leads" | "followers" | "authority" | "orders";
  ctaStyle: string;
  offer: string;
  platforms: Platform[];
  /** Extra system-prompt bias for this vertical */
  nicheDirective: string;
};

export const BRAND_PROFILES: Record<BrandTag, BrandProfile> = {
  MVA: {
    tag: "MVA",
    displayName: "MVA",
    audience: "Accident victims & injured drivers",
    tone: "Direct response: urgent, empathetic, authoritative — never generic",
    goal: "leads",
    ctaStyle: "Call / DM now — statute & insurance urgency",
    offer: "Free case review for accident victims",
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    nicheDirective:
      "Insurance traps, what not to say, quick-settlement risk, medical documentation, deadlines.",
  },
  LAW_FIRM: {
    tag: "LAW_FIRM",
    displayName: "Law Firm",
    audience: "Attorneys & firm marketing leaders",
    tone: "Credible, professional, emotionally intelligent",
    goal: "leads",
    ctaStyle: "Free case eval — rights & deadlines",
    offer: "Free intake audit & case review",
    platforms: ["instagram", "youtube_shorts", "tiktok"],
    nicheDirective:
      "Signed cases, intake speed, trust, statute themes, common mistakes that kill claims.",
  },
  FITNESS: {
    tag: "FITNESS",
    displayName: "Fitness",
    audience: "Busy adults chasing transformation",
    tone: "Bold, disciplined, high-energy",
    goal: "followers",
    ctaStyle: "Apply / book — proof & standards",
    offer: "Performance coaching for busy professionals",
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    nicheDirective:
      "Discipline, visible results, hormones/energy (tasteful), anti-fluff, time-efficient training.",
  },
  NBA_DOG_TAGS: {
    tag: "NBA_DOG_TAGS",
    displayName: "NBA Dog Tags",
    audience: "NBA fans & gift buyers",
    tone: "Pride, exclusivity, collectible energy",
    goal: "orders",
    ctaStyle: "Shop / limited drop / link in bio",
    offer: "Premium NBA hardwood dog tags",
    platforms: ["tiktok", "instagram", "youtube_shorts"],
    nicheDirective:
      "Fan identity, giftability, game-day ritual, premium materials, collectors.",
  },
  GAMEDAY_RINGS: {
    tag: "GAMEDAY_RINGS",
    displayName: "GameDay Rings",
    audience: "Athletes & fans",
    tone: "Game-day identity, giftability",
    goal: "orders",
    ctaStyle: "Claim yours / link in bio",
    offer: "Silicone sports rings for fans",
    platforms: ["instagram", "tiktok", "youtube_shorts"],
    nicheDirective:
      "Wearable fandom, comfort, gifting, locker-room energy, limited colors.",
  },
  PERSONAL_BRAND: {
    tag: "PERSONAL_BRAND",
    displayName: "Personal Brand",
    audience: "Operators building authority",
    tone: "Contrarian, direct, proof-heavy",
    goal: "authority",
    ctaStyle: "DM keyword / join insider list",
    offer: "1:1 advisory & mentorship access",
    platforms: ["youtube_shorts", "instagram", "tiktok"],
    nicheDirective:
      "Leverage, lessons learned, asymmetric bets, behind-the-scenes, credibility stacks.",
  },
};

const SYNTHETIC_BRAND_IDS: Record<BrandTag, string> = {
  MVA: "00000000-0000-4000-8000-000000000001",
  LAW_FIRM: "00000000-0000-4000-8000-000000000002",
  FITNESS: "00000000-0000-4000-8000-000000000003",
  NBA_DOG_TAGS: "00000000-0000-4000-8000-000000000004",
  GAMEDAY_RINGS: "00000000-0000-4000-8000-000000000005",
  PERSONAL_BRAND: "00000000-0000-4000-8000-000000000006",
};

/** In-memory brand row for generation when DB is unavailable (tag must exist in BRAND_PROFILES). */
export function syntheticBrandRow(tag: BrandTag): BrandRow {
  const p = BRAND_PROFILES[tag];
  if (!p) {
    throw new Error(`Unknown brand tag: ${tag}`);
  }
  const now = new Date().toISOString();
  return {
    id: SYNTHETIC_BRAND_IDS[tag],
    brand_tag: p.tag,
    name: p.displayName,
    audience: p.audience,
    tone: p.tone,
    primary_goal: p.goal,
    cta_style: p.ctaStyle,
    offer: p.offer,
    preferred_platforms: p.platforms,
    created_at: now,
  };
}

export function getBrandProfileByTag(tag: string): BrandProfile | null {
  return BRAND_PROFILES[tag as BrandTag] ?? null;
}

/** Merge DB row with static niche directive for prompts. */
export function mergeBrandForEngine(row: BrandRow): BrandRow & {
  nicheDirective: string;
} {
  const p = getBrandProfileByTag(row.brand_tag);
  return {
    ...row,
    nicheDirective: p?.nicheDirective ?? "Direct-response short-form; concrete hooks and CTAs.",
  };
}
