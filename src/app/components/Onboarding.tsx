"use client";

import { useEffect, useState } from "react";

// 初回起動時のみ表示するウォークスルー。一度見たら二度と出ない。
const STORAGE_KEY = "onboarding_seen_v1";

type Slide = { emoji: string; title: string; body: string };

const SLIDES: Slide[] = [
  {
    emoji: "🌱",
    title: "副業バディAIへようこそ",
    body: "副業の始め方から実践、リスク回避まで。AIがあなたの副業に伴走します。",
  },
  {
    emoji: "🔍",
    title: "LP診断",
    body: "気になる副業の広告ページをAIが診断。申し込む前に、危険なサインをチェックできます。",
  },
  {
    emoji: "💬",
    title: "AI相談",
    body: "副業の悩みをAIに相談。始め方・続け方・お金の不安まで、あなたに合わせてアドバイス。",
  },
  {
    emoji: "📔",
    title: "副業日記",
    body: "日々の記録で収入や作業を見える化。続ける習慣づくりをサポートします。",
  },
  {
    emoji: "🛡️",
    title: "詐欺アラート",
    body: "よくある副業詐欺・情報商材の手口を学べる。「うまい話」に騙されないために。",
  },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      // localStorage 不可の環境では出さない
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
    setShow(false);
  };

  if (!show) return null;

  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* スキップ */}
      <div className="flex justify-end p-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button
          onClick={finish}
          className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1"
        >
          スキップ
        </button>
      </div>

      {/* スライド内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-5xl mb-7">
          {slide.emoji}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{slide.title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
          {slide.body}
        </p>
      </div>

      {/* インジケーター */}
      <div className="flex justify-center gap-2 mb-6">
        {SLIDES.map((_, idx) => (
          <span
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === index ? "w-6 bg-emerald-600" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* 次へ / はじめる */}
      <div className="px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => (isLast ? finish() : setIndex((v) => v + 1))}
          className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          {isLast ? "はじめる" : "次へ"}
        </button>
      </div>
    </div>
  );
}
