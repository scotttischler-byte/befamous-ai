"use client";

import { useState } from "react";

type Mode = "internal" | "saas";

export function HomeModeSwitch() {
  const [mode, setMode] = useState<Mode>("internal");

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
        Operating mode
      </p>
      <div
        className="relative flex h-12 w-full max-w-[19rem] rounded-full border border-white/[0.12] bg-black/40 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
        role="group"
        aria-label="Choose internal or SaaS mode preview"
      >
        <span
          className="pointer-events-none absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-blue-600/95 via-violet-600/90 to-fuchsia-600/85 shadow-[0_0_28px_rgba(59,130,246,0.38)] transition-[left] duration-300 ease-out"
          style={{ left: mode === "internal" ? "4px" : "calc(50% + 0px)" }}
        />
        <button
          type="button"
          onClick={() => setMode("internal")}
          className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            mode === "internal" ? "text-white" : "text-white/50 hover:text-white/75"
          }`}
        >
          Internal
        </button>
        <button
          type="button"
          onClick={() => setMode("saas")}
          className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            mode === "saas" ? "text-white" : "text-white/50 hover:text-white/75"
          }`}
        >
          SaaS
        </button>
      </div>
      <p className="max-w-xl text-center text-sm leading-relaxed text-white/60">
        {mode === "internal" ? (
          <>
            <span className="font-medium text-white/90">Control center mode</span> — full
            visibility into brands, batches, scoring, and learning. Built for operators and
            founders running growth in-house.
          </>
        ) : (
          <>
            <span className="font-medium text-white/90">Product mode (roadmap)</span> — the
            same engine packaged for teams who want a guided, polished experience without
            touching the wiring.
          </>
        )}
      </p>
    </div>
  );
}
