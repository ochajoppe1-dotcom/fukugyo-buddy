import Link from "next/link";
import AssessmentClient from "./AssessmentClient";

export default function AssessmentPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </span>
            <h1 className="font-bold text-gray-900">副業適性診断</h1>
          </div>
        </div>
      </header>

      <section className="flex-1">
        <AssessmentClient />
      </section>
    </main>
  );
}
