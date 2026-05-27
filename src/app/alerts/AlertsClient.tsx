"use client";

import { useState, useMemo } from "react";
import type { Alert, AlertCategory } from "./alertsData";

const ALL_CATEGORIES: ("すべて" | AlertCategory)[] = [
  "すべて",
  "情報商材",
  "副業勧誘",
  "SNS手口",
  "電話・面談",
  "投資系",
  "返金詐欺",
];

export default function AlertsClient({ alerts }: { alerts: Alert[] }) {
  const [activeCategory, setActiveCategory] = useState<
    "すべて" | AlertCategory
  >("すべて");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      // カテゴリフィルタ
      if (activeCategory !== "すべて" && a.category !== activeCategory) {
        return false;
      }
      // キーワード検索（タイトル・サマリー・手口・気をつけるポイント横断）
      const q = query.trim().toLowerCase();
      if (q) {
        const haystack = [
          a.title,
          a.summary,
          ...a.patterns,
          ...a.watchOuts,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [alerts, activeCategory, query]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-800 leading-relaxed">
        ⚠ 副業・情報商材の詐欺は手口が多様化しています。
        <br />
        このページでは特定の企業を名指しせず、業界全体の典型パターンを教育目的で紹介しています。
        <br />
        購入前のチェック資料としてご活用ください。
      </div>

      {/* 検索ボックス */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <div className="relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで検索（例：返金、面談、月商）"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* カテゴリチップ */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 件数表示 */}
        <p className="text-xs text-gray-400">
          {filtered.length}件 / 全{alerts.length}件
        </p>
      </div>

      {/* アラート一覧 */}
      {filtered.length === 0 ? (
        <div className="text-center text-sm text-gray-500 py-12 bg-white rounded-2xl border border-gray-100">
          該当するアラートがありません。
          <br />
          別のキーワード or カテゴリでお試しください。
        </div>
      ) : (
        filtered.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                {alert.category}
              </span>
              <span className="text-xs text-gray-400">
                {alert.publishedAt}
              </span>
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-2 leading-relaxed">
              {alert.title}
            </h2>

            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {alert.summary}
            </p>

            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 mb-2">
                🎯 典型的な手口
              </h3>
              <ul className="space-y-1.5">
                {alert.patterns.map((p, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 leading-relaxed flex gap-2"
                  >
                    <span className="text-red-400 flex-shrink-0">▸</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
              <h3 className="text-xs font-bold text-amber-700 mb-2">
                ⚠ 気をつけるポイント
              </h3>
              <ul className="space-y-1">
                {alert.watchOuts.map((w, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 leading-relaxed flex gap-2"
                  >
                    <span className="text-amber-500 flex-shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <h3 className="text-xs font-bold text-emerald-700 mb-1.5">
                💡 もし該当しそうなら
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {alert.ifVictim}
              </p>
            </div>
          </div>
        ))
      )}

      {/* 公的相談先 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          📞 公的な相談先
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>消費者ホットライン 188</strong>
            （全国共通・市区町村の消費生活センターにつながる）
          </li>
          <li>
            <strong>警察相談ダイヤル #9110</strong>（緊急性のない相談）
          </li>
          <li>
            <strong>金融庁 金融サービス利用者相談室</strong>
            （投資・金融商品関連）
          </li>
          <li>
            <strong>各都道府県弁護士会の法律相談</strong>
          </li>
        </ul>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        ※ 本コンテンツは公的機関の公開情報をもとに、業界全体の傾向として一般化したものです。
        <br />
        特定の企業・販売者・サービスを指すものではありません。
      </p>
    </div>
  );
}
