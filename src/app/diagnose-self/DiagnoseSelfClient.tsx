"use client";

import { useState, useMemo } from "react";
import {
  CHECKLIST,
  TOTAL_MAX_SCORE,
  getRiskLabel,
} from "./checklistData";
import ShareButtons from "../components/ShareButtons";
import ReviewPrompt from "../components/ReviewPrompt";

export default function DiagnoseSelfClient() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChecked(next);
  };

  const score = useMemo(() => {
    let s = 0;
    CHECKLIST.forEach((item) => {
      if (checked.has(item.id)) s += item.weight;
    });
    return s;
  }, [checked]);

  const percent = Math.round((score / TOTAL_MAX_SCORE) * 100);
  const risk = getRiskLabel(percent);

  // カテゴリ別にグルーピング
  const categories = useMemo(() => {
    const map = new Map<string, typeof CHECKLIST>();
    CHECKLIST.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return Array.from(map.entries());
  }, []);

  if (showResult) {
    const colorClasses = {
      green: "bg-emerald-50 border-emerald-200 text-emerald-700",
      yellow: "bg-amber-50 border-amber-200 text-amber-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      red: "bg-red-50 border-red-200 text-red-700",
    }[risk.color];

    const barColor = {
      green: "bg-emerald-500",
      yellow: "bg-amber-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
    }[risk.color];

    return (
      <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
        {/* 結果カード */}
        <div className={`rounded-2xl border p-6 ${colorClasses}`}>
          <p className="text-xs font-bold mb-2">判定結果</p>
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-3xl font-bold">{risk.label}</h2>
            <span className="text-2xl font-bold">{percent}%</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full ${barColor} transition-all`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm leading-relaxed">{risk.message}</p>
        </div>

        {/* チェック数 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-700 mb-2">
            チェック数：<strong>{checked.size}</strong> 項目（全
            {CHECKLIST.length}項目中）
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            重みづけスコア: {score} / {TOTAL_MAX_SCORE}
          </p>
        </div>

        {/* シェアボタン（バイラル誘導） */}
        <ShareButtons
          text={`副業教材の危険度を無料セルフチェックしてみた📋\n判定：「${risk.label}」（危険度${percent}%）`}
          hashtags={["副業バディAI", "副業", "副業詐欺対策"]}
          url="https://fukugyo-buddy.vercel.app/diagnose-self"
        />

        {/* Standard誘導 */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-emerald-700 mb-2">
            🤖 AI版なら「なぜ危険か」まで一緒に整理
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            このセルフ診断は27項目のチェックですが、{" "}
            <strong>Standardプラン</strong>{" "}
            のAI診断なら、検討中の教材について「具体的にどこが危険か」「どう判断すべきか」を対話形式で深掘りできます。
          </p>
          <a
            href="/#pricing"
            className="inline-block bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            7日間無料でAIに相談する →
          </a>
          <p className="text-xs text-gray-400 mt-2">
            初回7日間無料 ／ いつでも解約できます
          </p>
        </div>

        {/* 再診断 */}
        <button
          onClick={() => {
            setChecked(new Set());
            setShowResult(false);
          }}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          別の教材を診断する
        </button>

        {/* 公的相談先 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            📞 困ったら
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>
              <strong>消費者ホットライン 188</strong>
            </li>
            <li>
              <strong>警察相談ダイヤル #9110</strong>
            </li>
          </ul>
        </div>

        {/* 診断を終えた直後＝満足度が高い瞬間にだけレビューをお願いする（アプリ版のみ） */}
        <ReviewPrompt variant="completion" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-800 leading-relaxed">
        💡
        購入を検討している副業教材・情報商材のLPを見ながら、当てはまる項目にチェックを入れてください。重みづけ計算で危険度%が算出されます（AI不使用・無料）。
      </div>

      {categories.map(([cat, items]) => (
        <div key={cat}>
          <h2 className="text-sm font-bold text-gray-700 mb-2">{cat}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {items.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 flex-shrink-0"
                />
                <span className="text-sm text-gray-700 leading-relaxed flex-1">
                  {item.text}
                </span>
                {item.weight === 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-bold flex-shrink-0">
                    重大
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-20 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            チェック数: {checked.size} / {CHECKLIST.length}
          </span>
          <span className="text-xs text-gray-500">
            現在の危険度: <strong className="text-emerald-700">{percent}%</strong>
          </span>
        </div>
        <button
          onClick={() => setShowResult(true)}
          disabled={checked.size === 0}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          診断結果を見る
        </button>
      </div>
    </div>
  );
}
