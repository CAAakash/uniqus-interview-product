import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-ink-50 p-6">
      <div className="card max-w-md w-full p-6 text-center">
        <div className="h-10 w-10 mx-auto rounded-lg bg-accent-50 ring-1 ring-accent-200/70 grid place-items-center mb-3">
          <Compass className="h-5 w-5 text-accent-600" />
        </div>
        <h2 className="text-base font-semibold text-ink-900">Page not found</h2>
        <p className="text-sm text-ink-500 mt-1">
          That route doesn&apos;t exist in this workspace.
        </p>
        <Link href="/" className="btn btn-primary text-xs mt-4 inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
