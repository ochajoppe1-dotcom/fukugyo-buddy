"use client";

import { useEffect, useState } from "react";
import { useIsNativeApp } from "@/lib/isNativeApp";

// Google Play のアプリページ（appId: ai.fukugyobuddy.app）
// 公開後に有効になる。アプリ内（FukugyoBuddyApp）でのみ表示。
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=ai.fukugyobuddy.app";

// ★を押した人＝もう二度と出さない
const DONE_KEY = "review_prompt_done_v2";
// 「あとで」を押した時刻。一定期間おいてもう一度だけ声をかける
const SNOOZE_KEY = "review_prompt_snoozed_at_v2";
// v1 で「あとで」を押して以降ずっと出なくなっていた人の引き継ぎ用
const LEGACY_KEY = "review_prompt_dismissed_v1";

const SNOOZE_DAYS = 14;

type Props = {
  /**
   * idle       … ホームなど。ただ開いただけなので少し待ってから出す
   * completion … 診断を終えた直後など、満足度が高い瞬間。文面も変える
   */
  variant?: "idle" | "completion";
};

export default function ReviewPrompt({ variant = "idle" }: Props) {
  const isNative = useIsNativeApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isNative) return;

    let snoozedAt = 0;
    try {
      if (localStorage.getItem(DONE_KEY)) return;

      // v1 で閉じた人は「今スヌーズした」ものとして引き継ぐ。
      // （更新直後にいきなり出して驚かせないため）
      if (localStorage.getItem(LEGACY_KEY)) {
        localStorage.removeItem(LEGACY_KEY);
        localStorage.setItem(SNOOZE_KEY, String(Date.now()));
        return;
      }

      snoozedAt = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    } catch {
      // localStorage 不可の環境では何もしない
      return;
    }

    if (snoozedAt) {
      const elapsed = Date.now() - snoozedAt;
      if (elapsed < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // 完了直後は流れを切らないよう短く、ホームでは唐突さを避けて長めに待つ
    const delay = variant === "completion" ? 900 : 2000;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [isNative, variant]);

  const later = () => {
    try {
      localStorage.setItem(SNOOZE_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    setShow(false);
  };

  const review = () => {
    try {
      localStorage.setItem(DONE_KEY, "1");
      localStorage.removeItem(SNOOZE_KEY);
    } catch {
      /* noop */
    }
    setShow(false);
    window.open(PLAY_URL, "_blank");
  };

  // Web版や、すでに★を押した人には一切表示しない
  if (!isNative || !show) return null;

  const heading =
    variant === "completion"
      ? "診断おつかれさまでした🌱"
      : "副業バディAI、お役に立ってますか？🌱";

  const bodyText =
    variant === "completion"
      ? "この診断が少しでも役に立ったら、ストアで ★ の評価をいただけると励みになります。30秒で終わります。"
      : "もしよければ、ストアで ★ の評価をいただけると開発の大きな励みになります。30秒で完了します。";

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <p className="text-sm font-bold text-gray-900 mb-1">{heading}</p>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">{bodyText}</p>
        <div className="flex gap-2">
          <button
            onClick={later}
            className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            あとで
          </button>
          <button
            onClick={review}
            className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            ★ ストアで応援する
          </button>
        </div>
      </div>
    </div>
  );
}
