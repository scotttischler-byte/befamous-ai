import { redirect } from "next/navigation";

/** Canonical BeFamous app is at `/`; keep `/app` as a short alias. */
export default function AppAliasPage() {
  redirect("/");
}
