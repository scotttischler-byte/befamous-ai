"use client";

import { useState } from "react";

const fieldStyle: React.CSSProperties = {
width: "100%",
padding: "12px 14px",
borderRadius: 10,
border: "1px solid rgba(255,255,255,0.14)",
background: "rgba(255,255,255,0.04)",
color: "#fff",
outline: "none",
marginBottom: 12,
};

export default function JJLegalPage() {
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setLoading(true);
setMessage("");

const form = e.currentTarget;
const formData = new FormData(form);

const payload = {
fullName: String(formData.get("fullName") || ""),
phone: String(formData.get("phone") || ""),
email: String(formData.get("email") || ""),
accidentDate: String(formData.get("accidentDate") || ""),
injured: String(formData.get("injured") || ""),
details: String(formData.get("details") || ""),
represented: String(formData.get("represented") || ""),
};

try {
const res = await fetch("/api/intake", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});

const json = await res.json();

if (!res.ok || !json.success) {
throw new Error("Request failed");
}

setMessage("Thank you. A team member will reach out shortly.");
form.reset();
} catch {
setMessage("There was a problem submitting your intake. Please try again.");
} finally {
setLoading(false);
}
}

return (
<main
style={{
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(124,58,237,0.25), transparent 30%), radial-gradient(circle at top right, rgba(236,72,153,0.18), transparent 28%), linear-gradient(180deg, #090d18 0%, #05070d 100%)",
color: "#fff",
padding: "32px 20px 56px",
fontFamily: "Inter, system-ui, sans-serif",
}}
>
<div style={{ maxWidth: 1180, margin: "0 auto" }}>
<div style={{ marginBottom: 18, opacity: 0.9, fontSize: 12, letterSpacing: 1.4 }}>
JJ LEGAL • ACCIDENT INTAKE
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "1.1fr 0.9fr",
gap: 24,
}}
>
<section>
<h1
style={{
fontSize: "clamp(38px, 6vw, 68px)",
lineHeight: 1.02,
margin: "0 0 14px",
fontWeight: 800,
maxWidth: 760,
}}
>
Hurt in a car accident?
<br />
Get help fast.
</h1>

<p
style={{
fontSize: 18,
lineHeight: 1.5,
opacity: 0.88,
maxWidth: 760,
marginBottom: 24,
}}
>
If you were injured in an accident, you may have rights. Complete the short intake below so
the JJ Legal team can review your situation and guide you on next steps.
</p>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: 16,
marginBottom: 18,
}}
>
<div
style={{
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
borderRadius: 18,
padding: 18,
}}
>
<div style={{ fontWeight: 700, marginBottom: 10 }}>Why people reach out now</div>
<ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, opacity: 0.9 }}>
<li>Deadlines can affect your claim</li>
<li>Evidence and witness details fade fast</li>
<li>Insurance companies move quickly</li>
</ul>
</div>

<div
style={{
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
borderRadius: 18,
padding: 18,
}}
>
<div style={{ fontWeight: 700, marginBottom: 10 }}>What happens next</div>
<ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, opacity: 0.9 }}>
<li>Your intake is reviewed promptly</li>
<li>A qualified team member follows up</li>
<li>You get guidance on your options</li>
</ul>
</div>
</div>

<div
style={{
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
borderRadius: 18,
padding: 20,
maxWidth: 820,
}}
>
<div style={{ fontWeight: 700, marginBottom: 10 }}>Why this page is built to convert</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
<div>
<div style={{ fontWeight: 700 }}>Fast intake</div>
<div style={{ opacity: 0.82, marginTop: 6 }}>Short, clear form built to capture urgency without friction.</div>
</div>
<div>
<div style={{ fontWeight: 700 }}>Credibility</div>
<div style={{ opacity: 0.82, marginTop: 6 }}>Empathetic language with strong next-step clarity.</div>
</div>
<div>
<div style={{ fontWeight: 700 }}>Action focused</div>
<div style={{ opacity: 0.82, marginTop: 6 }}>Designed to move visitors into immediate contact flow.</div>
</div>
</div>
</div>
</section>

<aside
style={{
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(13,18,33,0.86)",
borderRadius: 22,
padding: 22,
boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
alignSelf: "start",
position: "sticky",
top: 20,
}}
>
<div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Start your free intake</div>
<div style={{ opacity: 0.76, marginBottom: 18 }}>
Complete this form and someone will review your situation promptly.
</div>

<form onSubmit={handleSubmit}>
<input name="fullName" placeholder="Full name" required style={fieldStyle} />
<input name="phone" placeholder="Phone" required style={fieldStyle} />
<input name="email" type="email" placeholder="Email" required style={fieldStyle} />
<input name="accidentDate" type="date" style={fieldStyle} />

<select name="injured" defaultValue="" style={fieldStyle}>
<option value="" disabled>Were you injured?</option>
<option value="Yes">Yes</option>
<option value="No">No</option>
<option value="Not sure">Not sure</option>
</select>

<textarea
name="details"
placeholder="Briefly describe what happened"
rows={5}
style={{ ...fieldStyle, resize: "vertical" }}
/>

<select name="represented" defaultValue="" style={fieldStyle}>
<option value="" disabled>Are you currently represented by an attorney?</option>
<option value="No">No</option>
<option value="Yes">Yes</option>
</select>

<button
type="submit"
disabled={loading}
style={{
width: "100%",
border: "none",
borderRadius: 12,
padding: "14px 16px",
fontWeight: 800,
color: "#fff",
cursor: "pointer",
background: "linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)",
boxShadow: "0 12px 30px rgba(124,58,237,0.35)",
}}
>
{loading ? "Submitting..." : "Get Help Now"}
</button>

{message ? (
<div style={{ marginTop: 14, fontSize: 14, opacity: 0.9 }}>{message}</div>
) : null}
</form>
</aside>
</div>
</div>
</main>
);
}
