/** Direct-response style guides keyed by brand name / niche cluster. */
export function getNichePlaybook(brandName: string, niche: string): string {
  const key = `${brandName} ${niche}`.toLowerCase();

  if (key.includes("mva") || key.includes("motor vehicle") || key.includes("accident")) {
    return `
MVA / ACCIDENT VICTIMS (non-negotiable):
- Urgent but empathetic. You are authority + protector.
- Time-sensitive next steps, insurance pitfalls, what NOT to say after a crash.
- Angles: recorded statements, lowball offers, missed deadlines, "quick settlement" traps.
- Never victim-blame. Clear action: consult / case review / protect your rights.
`.trim();
  }

  if (key.includes("law firm") || key.includes("legal") || key.includes("intake")) {
    return `
LAW FIRM MARKETING:
- Credibility + empathy + professional tone. Lead-gen first.
- Angles: free case review, statute of limitations, common mistakes that cost cases, intake speed.
- Speak to decision-makers: owners, marketing leads, managing partners.
`.trim();
  }

  if (key.includes("fitness") || key.includes("performance") || key.includes("coaching")) {
    return `
FITNESS / PERFORMANCE:
- Bold, disciplined, high-energy. No soft generic wellness.
- Angles: testosterone, discipline, visible results, anti-aging energy, time-efficient training, mistakes killing progress.
- Demand specificity: numbers, timelines, standards.
`.trim();
  }

  if (
    key.includes("nba") ||
    key.includes("gameday") ||
    key.includes("dog tag") ||
    key.includes("silicone") ||
    key.includes("sports ring")
  ) {
    return `
NBA / SPORTS / GAMEDAY / ACCESSORIES:
- Fan identity, pride, giftability, exclusivity, collectors, game-day ritual.
- Angles: premium materials, limited drops, gift for real fans, wear your loyalty, conversation starters.
`.trim();
  }

  if (
    key.includes("real estate") ||
    key.includes("wealth") ||
    key.includes("business") ||
    key.includes("deal")
  ) {
    return `
REAL ESTATE / BUSINESS / WEALTH:
- Contrarian authority, leverage, creative deals, hidden opportunities, behind-the-scenes lessons.
- Angles: mistakes investors make, off-market access, negotiation leverage, asymmetric upside.
`.trim();
  }

  return `
GENERAL GROWTH (multi-brand internal engine):
- Direct-response: hook -> tension -> proof/pattern -> CTA.
- Avoid generic AI tone. Use concrete scenarios, numbers, and decisive language.
`.trim();
}
