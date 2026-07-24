"use client";

import { useIsNativeApp } from "@/lib/isNativeApp";

/**
 * Web（ブログ・LP）を読んだ人を Google Play へ送る導線。
 *
 * Play Console の「UTM ソース」レポートは referrer パラメータを読むので、
 * どこ経由でストアに来たかが後から分かるように必ず付けておく。
 * （付けないと「UTM ソースが指定されていません」に丸められて追えない）
 *
 * アプリの中では出さない（すでに入れている人に案内しても意味がない）。
 */
const APP_ID = "ai.fukugyobuddy.app";

export function playUrl(source: string) {
  const referrer = encodeURIComponent(
    `utm_source=${source}&utm_medium=web&utm_campaign=organic`
  );
  return `https://play.google.com/store/apps/details?id=${APP_ID}&referrer=${referrer}`;
}

export default function AppInstallBanner({
  source,
  className = "",
}: {
  /** どのページから来たか（Play Console の UTM ソースに出る） */
  source: string;
  className?: string;
}) {
  const isNative = useIsNativeApp();
  if (isNative) return null;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`}
    >
      <p className="text-sm font-bold text-gray-900 mb-1">
        📱 スマホアプリでも使えます
      </p>
      <p className="text-xs text-gray-600 leading-relaxed mb-4">
        副業バディAIは Android アプリ版があります。診断・副業日記・詐欺アラートを、思い出したときにすぐ開けます。無料で始められます。
      </p>
      <a
        href={playUrl(source)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
      >
        Google Play で入手
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}
