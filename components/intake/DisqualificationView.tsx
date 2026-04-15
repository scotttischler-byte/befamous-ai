type DisqualificationViewProps = {
  title: string;
  message: string;
  onRestart: () => void;
};

export function DisqualificationView({ title, message, onRestart }: DisqualificationViewProps) {
  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_24px_80px_-44px_rgba(0,0,0,0.9)]">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-blue-100/60">{message}</p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
      >
        Restart form
      </button>
    </section>
  );
}
