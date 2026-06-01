"use client";

import { useEffect, useState } from "react";
import { useIsNativeApp } from "@/lib/isNativeApp";

// Google Play のアプリページ（appId: ai.fukugyobuddy.app）
// 公開後に有効になる。アプリ内（FukugyoBuddyApp）でのみ表示。
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=ai.fukugyobuddy.app";
const STORAGE_KEY = "review_prompt_dismissed_v1";

export default function ReviewPrompt() {
  const isNative = useIsNativeApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isNative) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage 不可の環境では何もしない
    }
    // 開いた直後ではなく少し置いてから（唐突さを避ける）
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, [isNative]);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
    setShow(false);
  };

  const review = () => {
    close();
    window.open(PLAY_URL, "_blank");
  };

  // Web版や、すでに閉じた人には一切表示しない
  if (!isNative || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <p className="text-sm font-bold text-gray-900 mb-1">
          副業バディAI、お役に立ってますか？🌱
        </p>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          もしよければ、ストアで ★ の評価をいただけると開発の大きな励みになります。30秒で完了します。
        </p>
        <div className="flex gap-2">
          <button
            onClick={close}
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
