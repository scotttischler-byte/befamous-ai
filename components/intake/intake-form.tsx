"use client";

import { useState } from "react";

type IntakeFormProps = {
  firmSlug: string;
  firmName: string;
};

export function IntakeForm({ firmSlug, firmName }: IntakeFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const payload = {
      route: firmSlug,
      firmName,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
    };
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (!res.ok || json.success === false) throw new Error("failed");
      setStatus("done");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  const field =
    "mb-3 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/40";

  if (status === "done") {
    return <p className="text-sm text-emerald-300">Thanks — we received your message.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-1">
      <input name="name" required placeholder="Name" className={field} />
      <input name="email" type="email" required placeholder="Email" className={field} />
      <input name="phone" type="tel" placeholder="Phone" className={field} />
      <textarea name="message" rows={4} placeholder="How can we help?" className={field} />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit"}
      </button>
      {status === "error" ? <p className="text-sm text-red-300">Something went wrong. Try again.</p> : null}
    </form>
  );
}
