"use client";

import { useState, type CSSProperties } from "react";
import { triggerLeadNotification } from "@/lib/triggerLeadNotification";

export type AccidentIntakeFormState = {
  injured: string;
  accidentDate: string;
  accidentType: string;
  role: string;
  details: string;
  represented: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  consent: boolean;
};

const initialForm: AccidentIntakeFormState = {
  injured: "",
  accidentDate: "",
  accidentType: "",
  role: "",
  details: "",
  represented: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  consent: false,
};

export function AccidentIntakeFunnel() {
  const totalSteps = 7;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AccidentIntakeFormState>(initialForm);

  const update = <K extends keyof AccidentIntakeFormState>(field: K, value: AccidentIntakeFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function submit() {
    setError("");
    if (!form.consent) {
      setError("Please confirm consent to continue.");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please complete all contact fields.");
      return;
    }

    const payload = { ...form, route: "intake" as const, submittedAt: new Date().toISOString() };

    setLoading(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => ({}))) as { success?: boolean };

      if (!res.ok || json.success === false) throw new Error("submit failed");

      triggerLeadNotification(payload as unknown as Record<string, unknown>);
      setSuccess(true);
    } catch {
      setError("We could not submit your information. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    setError("");
    setStep((s) => Math.min(totalSteps, s + 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  const progress = (step / totalSteps) * 100;

  if (success) {
    return (
      <main style={styles.page}>
        <section style={styles.successCard}>
          <h1 style={styles.successHeadline}>Thank you — your information has been received.</h1>
          <div style={styles.successBody}>
            <p style={styles.p}>First, we’re sorry you were involved in an accident. We hope you’re okay.</p>
            <p style={styles.p}>A member of our intake team is reviewing your case right now.</p>
            <p style={styles.p}>
              If your case qualifies, you will receive a call shortly to go over your situation and next steps.
            </p>
            <p style={styles.p}>Please keep your phone nearby — we will attempt to reach you as soon as possible.</p>
            <p style={styles.p}>If we miss you, we will also follow up by text.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.progressWrap}>
          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
          </div>
          <p style={styles.stepLabel}>
            Step {step} of {totalSteps}
          </p>
        </div>

        {step === 1 && (
          <>
            <h1 style={styles.headline}>Apply</h1>
            <p style={styles.subheadline}>
              Get started — tell us what happened and submit your application in a few quick steps.
            </p>
            <p style={styles.question}>Were you injured in the accident?</p>
            <button
              type="button"
              onClick={() => {
                update("injured", "Yes");
                next();
              }}
              style={styles.choiceButton}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                update("injured", "No");
                next();
              }}
              style={styles.choiceButton}
            >
              No
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.question}>When did the accident happen?</h2>
            <input
              type="date"
              value={form.accidentDate}
              onChange={(e) => update("accidentDate", e.target.value)}
              style={styles.input}
            />
            <div style={styles.footerRow}>
              <button type="button" onClick={back} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={next} style={styles.nextButton}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.question}>What type of accident was it?</h2>
            <select
              value={form.accidentType}
              onChange={(e) => update("accidentType", e.target.value)}
              style={styles.input}
            >
              <option value="">Select type</option>
              <option value="Car accident">Car accident</option>
              <option value="Truck accident">Truck accident</option>
              <option value="Motorcycle accident">Motorcycle accident</option>
              <option value="Uber / Lyft accident">Uber / Lyft accident</option>
              <option value="Pedestrian accident">Pedestrian accident</option>
              <option value="Other">Other</option>
            </select>
            <div style={styles.footerRow}>
              <button type="button" onClick={back} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={next} style={styles.nextButton}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={styles.question}>Were you the driver or passenger?</h2>
            <button type="button" onClick={() => update("role", "Driver")} style={styles.choiceButton}>
              Driver
            </button>
            <button type="button" onClick={() => update("role", "Passenger")} style={styles.choiceButton}>
              Passenger
            </button>
            <input
              placeholder="Other"
              value={form.role === "Driver" || form.role === "Passenger" ? "" : form.role}
              onChange={(e) => update("role", e.target.value)}
              style={styles.input}
            />
            <div style={styles.footerRow}>
              <button type="button" onClick={back} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={next} style={styles.nextButton}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={styles.question}>Briefly describe what happened</h2>
            <textarea
              value={form.details}
              onChange={(e) => update("details", e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.footerRow}>
              <button type="button" onClick={back} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={next} style={styles.nextButton}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h2 style={styles.question}>Are you currently represented by an attorney?</h2>
            <button type="button" onClick={() => update("represented", "No")} style={styles.choiceButton}>
              No
            </button>
            <button type="button" onClick={() => update("represented", "Yes")} style={styles.choiceButton}>
              Yes
            </button>
            <div style={styles.footerRow}>
              <button type="button" onClick={back} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={next} style={styles.nextButton}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <h2 style={styles.question}>Where should we contact you?</h2>
            <input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              style={styles.input}
              autoComplete="given-name"
            />
            <input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              style={styles.input}
              autoComplete="family-name"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              style={styles.input}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              style={styles.input}
              autoComplete="email"
              inputMode="email"
            />

            <ul style={styles.trustList}>
              <li style={styles.trustItem}>✔ Takes less than 60 seconds</li>
              <li style={styles.trustItem}>✔ No obligation</li>
              <li style={styles.trustItem}>✔ 100% confidential</li>
            </ul>

            <div style={styles.disclosureBox}>
              <p style={styles.disclosureTitle}>Apply — consent &amp; contact</p>
              <label style={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.consentText}>
                  I agree to be contacted about my application by phone, text, and email, including automated
                  messages at the number provided, even if my number is on a Do Not Call list. Consent is not
                  required to obtain services.
                </span>
              </label>

              <div style={styles.disclosureDivider} />

              <p style={styles.disclosureMuted}>
                Submitting this application does not create a professional relationship until you sign any
                required agreements with a qualified provider.
              </p>
              <p style={styles.disclosureMuted}>
                Submitting information does not guarantee acceptance. Review depends on your details and
                applicable rules.
              </p>
              <p style={styles.disclosureMuted}>
                Your application may be shared with partners and service providers to evaluate your request. Prior
                results do not guarantee a similar outcome.
              </p>
              <p style={styles.disclosureMuted}>
                If you are in immediate danger or need urgent medical attention, call 911 immediately.
              </p>
            </div>

            {error ? <p style={styles.errorText}>{error}</p> : null}

            <div style={styles.footerRow}>
              <button type="button" onClick={back} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={submit} disabled={loading} style={styles.ctaButton}>
                {loading ? "Submitting..." : "Submit your application"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const baseButton: CSSProperties = {
  width: "100%",
  padding: "16px 16px",
  marginTop: 12,
  borderRadius: 14,
  fontSize: 17,
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  minHeight: 52,
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    boxSizing: "border-box",
    background: "linear-gradient(180deg, #030304 0%, #0a0b0f 55%, #050506 100%)",
    color: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
    overflowX: "hidden",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "linear-gradient(165deg, rgba(24,26,32,0.98) 0%, rgba(14,15,18,0.98) 100%)",
    padding: "clamp(20px, 4vw, 28px)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  successCard: {
    width: "100%",
    maxWidth: 720,
    background: "linear-gradient(165deg, rgba(24,26,32,0.98) 0%, rgba(14,15,18,0.98) 100%)",
    padding: "clamp(22px, 4vw, 32px)",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  successHeadline: {
    fontSize: "clamp(22px, 4.5vw, 28px)",
    fontWeight: 800,
    lineHeight: 1.25,
    margin: "0 0 18px",
    color: "#fff",
  },
  successBody: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  p: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.88)",
  },
  progressWrap: {
    marginBottom: 22,
  },
  progressBarTrack: {
    width: "100%",
    height: 9,
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "#dc2626",
    borderRadius: 999,
    transition: "width 240ms ease",
  },
  stepLabel: {
    marginTop: 10,
    fontSize: 13,
    letterSpacing: "0.02em",
    color: "rgba(255,255,255,0.55)",
  },
  headline: {
    fontSize: "clamp(26px, 5vw, 34px)",
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: 12,
    color: "#fff",
  },
  subheadline: {
    marginTop: 0,
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.82)",
  },
  question: {
    marginTop: 0,
    marginBottom: 14,
    fontSize: "clamp(20px, 4vw, 24px)",
    fontWeight: 700,
    lineHeight: 1.25,
    color: "#fff",
  },
  input: {
    width: "100%",
    padding: "16px 16px",
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,11,14,0.92)",
    color: "#fff",
    fontSize: 17,
    outline: "none",
    boxSizing: "border-box",
    minHeight: 52,
  },
  textarea: {
    width: "100%",
    minHeight: 140,
    padding: "16px 16px",
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,11,14,0.92)",
    color: "#fff",
    fontSize: 17,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  choiceButton: {
    ...baseButton,
    background: "rgba(18,19,24,0.95)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#fff",
  },
  footerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    ...baseButton,
    marginTop: 0,
    background: "#2d3038",
    color: "#f4f4f5",
    flex: "1 1 140px",
  },
  nextButton: {
    ...baseButton,
    marginTop: 0,
    background: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
    color: "#fff",
    flex: "1 1 160px",
    boxShadow: "0 12px 32px rgba(22,163,74,0.35)",
  },
  ctaButton: {
    ...baseButton,
    marginTop: 0,
    padding: "17px 16px",
    fontSize: 18,
    fontWeight: 800,
    background: "linear-gradient(180deg, #22c55e 0%, #15803d 100%)",
    color: "#fff",
    flex: "1.2 1 200px",
    boxShadow: "0 14px 36px rgba(22,163,74,0.4)",
  },
  trustList: {
    listStyle: "none",
    padding: 0,
    margin: "8px 0 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  trustItem: {
    fontSize: 14,
    color: "rgba(255,255,255,0.62)",
    paddingLeft: 4,
  },
  disclosureBox: {
    marginTop: 4,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  disclosureTitle: {
    margin: "0 0 12px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  consentLabel: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    cursor: "pointer",
  },
  checkbox: {
    marginTop: 4,
    width: 18,
    height: 18,
    flexShrink: 0,
    accentColor: "#22c55e",
  },
  consentText: {
    fontSize: 13,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.78)",
  },
  disclosureDivider: {
    height: 1,
    margin: "16px 0",
    background: "rgba(255,255,255,0.08)",
  },
  disclosureMuted: {
    margin: "0 0 10px",
    fontSize: 12,
    lineHeight: 1.55,
    color: "rgba(255,255,255,0.52)",
  },
  errorText: {
    margin: "8px 0 0",
    fontSize: 14,
    color: "#fca5a5",
  },
};
