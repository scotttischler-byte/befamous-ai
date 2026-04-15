type ConsentBlockProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function ConsentBlock({ checked, onChange, error }: ConsentBlockProps) {
  return (
    <section className="rounded-2xl border border-white/12 bg-black/30 p-4">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/40 bg-black/50 text-fuchsia-500 focus:ring-fuchsia-400"
        />
        <span className="text-sm leading-relaxed text-white/85">
          I agree to be contacted by partner law firms and the injury intake team by phone, text
          message, and email using automated technology at the number provided, even if listed on a
          Do Not Call registry. Consent is not required to receive services.
        </span>
      </label>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 space-y-2 text-xs leading-relaxed text-blue-100/55">
        <p>
          Submitting this form does not create an attorney-client relationship. An
          attorney-client relationship is only formed after signing a formal agreement with a
          licensed attorney.
        </p>
        <p>
          Not all submissions will qualify for legal representation. Case acceptance is subject to
          attorney review and applicable law.
        </p>
      </div>
    </section>
  );
}
