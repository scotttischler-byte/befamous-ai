import { FirmFunnelPage } from "@/components/intake/firm-funnel-page";

export default function Page() {
  return (
    <FirmFunnelPage
      firmSlug="tygibson"
      firmName="Ty Gibson"
      heroTitle="Ty Gibson Campaign Funnel"
      heroSubtitle="Turn authority-driven content into inbound opportunities with a premium branded intake flow."
      audience="Founder-led audience evaluating legal strategy, trust, and execution depth before booking."
      valuePoints={[
        "Align messaging to authority + conversion intent.",
        "Collect context-rich inquiry details in one pass.",
        "Preserve campaign attribution for optimization loops.",
      ]}
      proofPoints={[
        "Inbound inquiry quality",
        "Booked call conversion",
        "Cost per qualified opportunity",
      ]}
    />
  );
}
