import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12 font-sans text-ink">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 text-center shadow-sheet">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent tnum">
          404 · Page Not Found
        </p>
        <h1 className="mt-2 font-editorial text-2xl sm:text-3xl font-medium text-ink">
          Chapter Beyond the Index
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          This path isn&apos;t in the archive. All 2,334 chapters await in the main reader.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link
            href="/read"
            className="btn-primary min-h-[44px] rounded-xl px-5 py-2.5 text-sm"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Open Reader</span>
          </Link>
          <Link
            href="/"
            className="btn-quiet min-h-[44px] rounded-xl px-5 py-2.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
