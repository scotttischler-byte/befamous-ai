import type { ReactNode } from "react";

type StepCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function StepCard({ title, subtitle, children }: StepCardProps) {
  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.04] p-5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-lg sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-blue-100/55 sm:text-base">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
