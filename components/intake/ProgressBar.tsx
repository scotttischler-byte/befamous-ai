type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-blue-100/60">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 shadow-[0_0_20px_rgba(168,85,247,0.45)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
