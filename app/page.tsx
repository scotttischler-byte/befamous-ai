import { PublicMarketing } from "@/components/landing/public-marketing";

export default function Home() {
  return (
    <>
      <div
        className="fixed right-4 top-4 z-[200] rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg"
        role="status"
        aria-live="polite"
      >
        SYNC TEST — VERSION 413
      </div>
      <PublicMarketing />
    </>
  );
}
