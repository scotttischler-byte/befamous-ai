"use client";

import { useMemo, useState } from "react";
import { classifyCase } from "@/lib/scoring";
import { injuriesCatalog, intakeSchema, normalizePhone, toPayload } from "@/lib/validation";
import type { IntakeAccidentType, IntakeFaultStatus, IntakeLeadPayload, IntakeTriageOption, IntakeTreatmentStatus } from "@/lib/types";
import { ProgressBar } from "@/components/intake/ProgressBar";
import { StepCard } from "@/components/intake/StepCard";
import { DisqualificationView } from "@/components/intake/DisqualificationView";
import { DisclaimerFooter } from "@/components/legal/DisclaimerFooter";
import { ConsentBlock } from "@/components/legal/ConsentBlock";

const totalSteps = 11;

const injuryLabels: Record<(typeof injuriesCatalog)[number], string> = {
  head_injury: "Head injury",
  neck_injury: "Neck injury",
  back_injury: "Back injury",
  shoulder_injury: "Shoulder injury",
  arm_hand_injury: "Arm or hand injury",
  chest_injury: "Chest injury",
  hip_injury: "Hip injury",
  leg_knee_injury: "Leg or knee injury",
  fractures: "Broken bones / fractures",
  tbi: "Traumatic brain injury (TBI)",
  spinal_cord_injury: "Spinal cord injury",
  skull_fracture: "Skull fracture",
  internal_bleeding: "Internal bleeding",
  organ_damage: "Organ damage",
  severe_burns: "Severe burns",
  amputation: "Amputation",
  paralysis: "Paralysis",
  loss_vision: "Loss of vision",
  loss_hearing: "Loss of hearing",
  permanent_disability: "Permanent disability / cannot work",
  chronic_severe_pain: "Chronic severe pain",
  facial_disfigurement: "Facial disfigurement / permanent scarring",
  fatality: "Fatality / death",
  other: "Other",
};

type FormState = Omit<IntakeLeadPayload, "injuredInMva"> & { injuredInMva: boolean | null };

const initialState: FormState = {
  injuredInMva: null,
  accidentDate: "",
  hasAttorney: "no",
  faultStatus: "not_sure",
  accidentType: "car",
  injuries: [],
  treatmentStatus: "not_yet_unsure",
  policeReport: "not_sure",
  policeReportCopy: "not_sure",
  otherPartyInsurance: "not_sure",
  hasUmCoverage: "not_sure",
  fullName: "",
  phone: "",
  email: "",
  consent: false,
  incidentDescription: "",
};

export function IntakeWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [inlineError, setInlineError] = useState<string>("");
  const [disqualified, setDisqualified] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const classification = useMemo(() => {
    if (!readyForClassification(form)) return null;
    return classifyCase({
      ...form,
      injuredInMva: true,
    } as IntakeLeadPayload);
  }, [form]);

  function restart() {
    setStep(1);
    setForm(initialState);
    setInlineError("");
    setDisqualified(null);
    setSubmitting(false);
    setSubmitted(false);
  }

  function next() {
    const issue = validateCurrentStep();
    if (issue) {
      setInlineError(issue);
      return;
    }
    setInlineError("");
    setStep((s) => Math.min(totalSteps, s + 1));
  }

  function back() {
    setInlineError("");
    setStep((s) => Math.max(1, s - 1));
  }

  function validateCurrentStep(): string | null {
    if (step === 1 && form.injuredInMva === null) return "Please choose an option to continue.";
    if (step === 2 && !form.accidentDate) return "Please provide the accident date.";
    if (step === 3 && !form.hasAttorney) return "Please choose an option to continue.";
    if (step === 4 && !form.faultStatus) return "Please select fault status.";
    if (step === 6 && form.injuries.length === 0) return "Select at least one injury.";
    if (step === 10) {
      if (!form.fullName.trim()) return "Full name is required.";
      if (!form.phone.trim()) return "Phone is required.";
      if (!form.email.trim()) return "Email is required.";
    }
    return null;
  }

  async function onSubmit() {
    const schemaCheck = intakeSchema.safeParse({
      ...form,
      injuredInMva: true,
      phone: normalizePhone(form.phone),
    });
    if (!schemaCheck.success) {
      const msg = schemaCheck.error.issues[0]?.message ?? "Please review your answers and try again.";
      setInlineError(msg);
      return;
    }

    const caseResult = classifyCase(toPayload(schemaCheck.data));
    setSubmitting(true);
    setInlineError("");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: "intake",
          submittedAt: new Date().toISOString(),
          form: schemaCheck.data,
          classification: caseResult,
          integrations: {
            webhook: { status: "placeholder_pending" },
            twilioSms: { status: "placeholder_pending" },
            aiCall: { status: "placeholder_pending" },
          },
        }),
      });

      const body = await response.json();
      if (!response.ok || !body?.success) {
        throw new Error("Submission failed");
      }

      setSubmitted(true);
    } catch {
      setInlineError("We could not submit your information. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (disqualified) {
    return (
      <DisqualificationView
        title="Thank you for reaching out"
        message={disqualified}
        onRestart={restart}
      />
    );
  }

  if (submitted) {
    return (
      <StepCard
        title="Thank You — Your Information Has Been Received"
        subtitle="A member of our team will review your information and follow up as quickly as possible."
      >
        <p className="text-sm text-blue-100/65">
          Please keep your phone nearby in case additional details are needed.
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-6 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
        >
          Start new review
        </button>
      </StepCard>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      <div className="transition-all duration-300">
        {step === 1 ? (
          <StepCard title="Were you injured in a motor vehicle accident?" subtitle="This takes about 2 minutes.">
            <BinaryChoice
              value={form.injuredInMva ? "yes" : form.injuredInMva === false ? "no" : ""}
              onChange={(value) => {
                const yes = value === "yes";
                setForm((s) => ({ ...s, injuredInMva: yes }));
                if (!yes) {
                  setDisqualified(
                    "This form is intended for people injured in motor vehicle accidents. If your situation changes, feel free to return.",
                  );
                }
              }}
            />
          </StepCard>
        ) : null}

        {step === 2 ? (
          <StepCard title="When did the accident happen?" subtitle="Your answers help us determine the best next step.">
            <input
              type="date"
              value={form.accidentDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm((s) => ({ ...s, accidentDate: e.target.value }))}
              className={fieldClass}
            />
          </StepCard>
        ) : null}

        {step === 3 ? (
          <StepCard title="Do you currently have an attorney for this accident?">
            <BinaryChoice
              value={form.hasAttorney}
              onChange={(value) => {
                setForm((s) => ({ ...s, hasAttorney: value as "yes" | "no" }));
                if (value === "yes") {
                  setDisqualified(
                    "At this time, this program is intended for individuals who have not yet retained an attorney for this matter.",
                  );
                }
              }}
            />
          </StepCard>
        ) : null}

        {step === 4 ? (
          <StepCard title="Based on what you know, were you at fault for the accident?">
            <OptionRow
              options={[
                ["no", "No"],
                ["not_sure", "Not sure"],
                ["yes", "Yes"],
              ]}
              value={form.faultStatus}
              onChange={(value) => setForm((s) => ({ ...s, faultStatus: value as IntakeFaultStatus }))}
            />
          </StepCard>
        ) : null}

        {step === 5 ? (
          <StepCard title="What type of accident was this?">
            <OptionRow
              options={[
                ["car", "Car accident"],
                ["commercial", "Commercial truck / work vehicle"],
                ["motorcycle", "Motorcycle accident"],
                ["rideshare", "Uber / Lyft / rideshare"],
                ["ped_bike_hit", "Pedestrian or bicyclist hit by vehicle"],
                ["other", "Other"],
              ]}
              value={form.accidentType}
              onChange={(value) => setForm((s) => ({ ...s, accidentType: value as IntakeAccidentType }))}
            />
          </StepCard>
        ) : null}

        {step === 6 ? (
          <StepCard title="What injuries were involved?" subtitle="Everything you share is handled with care.">
            <div className="grid gap-2 sm:grid-cols-2">
              {injuriesCatalog.map((injury) => {
                const checked = form.injuries.includes(injury);
                return (
                  <label
                    key={injury}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-blue-50/85 transition hover:border-fuchsia-400/40 hover:bg-white/[0.06]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        setForm((s) => ({
                          ...s,
                          injuries: e.target.checked
                            ? [...s.injuries, injury]
                            : s.injuries.filter((item) => item !== injury),
                        }));
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-white/35 bg-black/40 text-fuchsia-500 focus:ring-fuchsia-400"
                    />
                    <span>{injuryLabels[injury]}</span>
                  </label>
                );
              })}
            </div>
          </StepCard>
        ) : null}

        {step === 7 ? (
          <StepCard title="Have you received medical treatment, or are you willing to begin treatment right away?">
            <OptionRow
              options={[
                ["already_treating", "Already receiving treatment"],
                ["willing_immediately", "Yes, willing to begin immediately"],
                ["not_yet_unsure", "Not yet / unsure"],
                ["no", "No"],
              ]}
              value={form.treatmentStatus}
              onChange={(value) => setForm((s) => ({ ...s, treatmentStatus: value as IntakeTreatmentStatus }))}
            />
          </StepCard>
        ) : null}

        {step === 8 ? (
          <StepCard title="Was a police report made?">
            <OptionRow
              options={[
                ["yes", "Yes"],
                ["no", "No"],
                ["not_sure", "Not sure"],
              ]}
              value={form.policeReport}
              onChange={(value) => setForm((s) => ({ ...s, policeReport: value as IntakeTriageOption }))}
            />
            {form.policeReport === "yes" ? (
              <div className="mt-5">
                <p className="mb-2 text-sm text-blue-100/70">Do you have a copy of the police report?</p>
                <OptionRow
                  options={[
                    ["yes", "Yes"],
                    ["no", "No"],
                  ]}
                  value={form.policeReportCopy ?? "not_sure"}
                  onChange={(value) => setForm((s) => ({ ...s, policeReportCopy: value as IntakeTriageOption }))}
                />
              </div>
            ) : null}
          </StepCard>
        ) : null}

        {step === 9 ? (
          <StepCard title="Did the other party have insurance?">
            <OptionRow
              options={[
                ["yes", "Yes"],
                ["no", "No"],
                ["not_sure", "Not sure"],
              ]}
              value={form.otherPartyInsurance}
              onChange={(value) => setForm((s) => ({ ...s, otherPartyInsurance: value as IntakeTriageOption }))}
            />
            <div className="mt-5">
              <p className="mb-2 text-sm text-blue-100/70">Do you have uninsured/underinsured motorist coverage?</p>
              <OptionRow
                options={[
                  ["yes", "Yes"],
                  ["no", "No"],
                  ["not_sure", "Not sure"],
                ]}
                value={form.hasUmCoverage}
                onChange={(value) => setForm((s) => ({ ...s, hasUmCoverage: value as IntakeTriageOption }))}
              />
            </div>
          </StepCard>
        ) : null}

        {step === 10 ? (
          <StepCard title="Where should we reach you?" subtitle="We will review your information promptly.">
            <div className="space-y-3">
              <input
                type="text"
                autoComplete="name"
                inputMode="text"
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                className={fieldClass}
              />
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                className={fieldClass}
              />
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </StepCard>
        ) : null}

        {step === 11 ? (
          <StepCard title="Review and consent" subtitle="Please confirm details before we submit.">
            <div className="rounded-2xl border border-white/12 bg-black/35 p-4 text-sm text-blue-100/70">
              <p>
                <span className="text-white/90">Name:</span> {form.fullName}
              </p>
              <p>
                <span className="text-white/90">Phone:</span> {normalizePhone(form.phone)}
              </p>
              <p>
                <span className="text-white/90">Email:</span> {form.email}
              </p>
              <p>
                <span className="text-white/90">Accident date:</span> {form.accidentDate}
              </p>
              {classification ? (
                <p>
                  <span className="text-white/90">Preliminary case type:</span> {classification.caseType} (
                  {classification.priority})
                </p>
              ) : null}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-blue-100/65">Briefly describe what happened</label>
              <textarea
                value={form.incidentDescription}
                onChange={(e) => setForm((s) => ({ ...s, incidentDescription: e.target.value }))}
                rows={4}
                className={`${fieldClass} resize-none`}
              />
            </div>

            <div className="mt-4">
              <ConsentBlock
                checked={form.consent}
                onChange={(checked) => setForm((s) => ({ ...s, consent: checked }))}
                error={inlineError.includes("Consent") ? inlineError : undefined}
              />
            </div>
          </StepCard>
        ) : null}
      </div>

      {inlineError && !inlineError.includes("Consent") ? (
        <p className="text-sm text-red-300">{inlineError}</p>
      ) : null}

      <div className="sticky bottom-2 z-10 rounded-2xl border border-white/10 bg-black/55 p-3 backdrop-blur sm:static sm:bg-transparent sm:p-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || submitting}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {step < totalSteps ? (
            <button
              type="button"
              onClick={next}
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.65)] transition hover:brightness-110"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.65)] transition hover:brightness-110 disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit Case Review"}
            </button>
          )}
        </div>
      </div>

      <DisclaimerFooter />
    </div>
  );
}

type OptionRowProps = {
  options: [string, string][];
  value: string;
  onChange: (value: string) => void;
};

function OptionRow({ options, value, onChange }: OptionRowProps) {
  return (
    <div className="grid gap-2">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
            value === optionValue
              ? "border-fuchsia-400/70 bg-fuchsia-500/20 text-white shadow-[0_0_24px_-10px_rgba(217,70,239,0.7)]"
              : "border-white/12 bg-white/[0.03] text-blue-100/75 hover:border-white/25 hover:bg-white/[0.06]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function BinaryChoice({
  value,
  onChange,
}: {
  value: "" | "yes" | "no";
  onChange: (value: "yes" | "no") => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange("yes")}
        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
          value === "yes"
            ? "border-fuchsia-400/70 bg-fuchsia-500/20 text-white"
            : "border-white/12 bg-white/[0.03] text-blue-100/75 hover:border-white/25"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange("no")}
        className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
          value === "no"
            ? "border-fuchsia-400/70 bg-fuchsia-500/20 text-white"
            : "border-white/12 bg-white/[0.03] text-blue-100/75 hover:border-white/25"
        }`}
      >
        No
      </button>
    </div>
  );
}

function readyForClassification(form: FormState): boolean {
  return Boolean(form.accidentDate && form.injuries.length && form.injuredInMva);
}

const fieldClass =
  "w-full rounded-xl border border-white/12 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-blue-100/35 focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/20";
