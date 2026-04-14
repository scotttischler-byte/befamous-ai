import Link from "next/link";

export default function Home() {
return (
<main style={{ padding: 24 }}>
<h1>BeFamous Growth Engine</h1>
<div style={{ display: "flex", gap: 16, marginTop: 20 }}>
<Link href="/jjlegal">JJ Legal</Link>
<Link href="/tygibson">Ty Gibson</Link>
</div>
</main>
);
}
