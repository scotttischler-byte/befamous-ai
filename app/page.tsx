import type { Metadata } from "next";

import { HookEngineApp } from "@/components/hook-engine/hook-engine-app";

export const metadata: Metadata = {
  title: "Hook Engine | BeFamous App",
  description:
    "Generate hooks, angles, and starter captions with the BeFamous Hook Engine.",
};

export default function HomePage() {
  return <HookEngineApp />;
}
