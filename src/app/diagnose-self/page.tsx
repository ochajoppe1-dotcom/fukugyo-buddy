import type { Metadata } from "next";
import Link from "next/link";
import DiagnoseSelfClient from "./DiagnoseSelfClient";

export const metadata: Metadata = {
  title: "LP診断（セルフチェック版）",
  description:
    "副業教材・情報商材の販売ページの危険度を、27項目のセルフチェックで判定します（AI不使用・無料）。",
};

export default function DiagnoseSelfPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 戻る
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-emerald-600">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <h1 className="font-semibold text-gray-900">
              LP診断（セルフチェック版）
            </h1>
          </div>
          <span className="text-xs text-gray-400">無料</span>
        </div>
      </header>

      <section className="flex-1">
        <DiagnoseSelfClient />
      </section>
    </main>
  );
}
