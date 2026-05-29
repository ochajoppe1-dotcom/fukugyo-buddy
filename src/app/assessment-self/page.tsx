import type { Metadata } from "next";
import Link from "next/link";
import AssessmentSelfClient from "./AssessmentSelfClient";

export const metadata: Metadata = {
  title: "適性診断（パターン判定版）",
  description:
    "15問の回答からあなたに向いた副業タイプをAI不使用で判定する無料版です。",
};

export default function AssessmentSelfPage() {
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
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </span>
            <h1 className="font-bold text-gray-900">
              適性診断（パターン判定版）
            </h1>
          </div>
          <span className="text-xs text-gray-400">無料</span>
        </div>
      </header>

      <section className="flex-1">
        <AssessmentSelfClient />
      </section>
    </main>
  );
}
