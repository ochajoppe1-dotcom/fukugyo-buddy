"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIsNativeApp } from "@/lib/isNativeApp";

type Plan = {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  highlight: boolean;
  planKey: "free" | "standard" | "premium";
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "0",
    tagline: "まず触ってみる",
    features: [
      "LP診断（セルフチェック版・27項目）",
      "適性診断（パターン判定版・15問）",
      "詐欺アラート 閲覧自由",
    ],
    highlight: false,
    planKey: "free",
  },
  {
    name: "Standard",
    price: "980",
    tagline: "副業を続ける人へ",
    features: [
      "LP診断 月10回（AI対話版）",
      "AI相談 月10回（日記の数字を踏まえた返答）",
      "適性診断 月5回（AI診断版）",
      "副業日記",
      "数字まるわかりレポート 月1回",
      "詐欺アラート",
    ],
    highlight: true,
    planKey: "standard",
  },
  {
    name: "Premium",
    price: "1980",
    tagline: "本気で本業化を目指す人へ",
    features: [
      "Standardの全機能",
      "AI相談 月25回・会話の全記憶",
      "数字まるわかりレポート 月2回",
      "AI副業ロードマップ 月1回",
      "AI実務サポート 月15回",
      "緊急時テンプレ生成 月10回",
    ],
    highlight: false,
    planKey: "premium",
  },
];

export default function PricingCards() {
  const router = useRouter();
  const isNativeApp = useIsNativeApp();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planKey: "standard" | "premium") => {
    setLoadingPlan(planKey);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();

      if (data.redirect) {
        router.push(data.redirect);
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 border ${
              plan.highlight
                ? "border-emerald-300 bg-emerald-50/30 relative"
                : "border-gray-100"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                おすすめ
              </span>
            )}
            <h3 className="font-semibold text-gray-900 mb-0.5">{plan.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{plan.tagline}</p>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-bold text-gray-900">
                ¥{plan.price}
              </span>
              {plan.price !== "0" && (
                <span className="text-sm text-gray-400">/月</span>
              )}
            </div>
            <ul className="space-y-2 mb-5">
              {plan.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-500 flex-shrink-0"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {plan.planKey === "free" ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-400 cursor-default"
              >
                ずっと無料
              </button>
            ) : isNativeApp ? (
              // アプリ内では決済導線を出さない（Google Play 決済規約対応）
              <div className="w-full py-2.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 text-center leading-relaxed px-2">
                ご登録・プラン変更は
                <br />
                ブラウザ版からお手続きください
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe(plan.planKey as "standard" | "premium")}
                disabled={loadingPlan !== null}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.planKey
                  ? "処理中..."
                  : "7日間無料で始める"}
              </button>
            )}
          </div>
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-red-600 mt-4">{error}</p>
      )}
      <p className="text-xs text-gray-400 text-center mt-6">
        初回7日間無料 ／ いつでもワンクリックで解約できます
      </p>
      <p className="text-xs text-gray-400 text-center mt-2">
        お申し込みの前に{" "}
        <a href="/terms" className="underline hover:text-emerald-600">
          利用規約
        </a>{" "}
        と{" "}
        <a href="/privacy" className="underline hover:text-emerald-600">
          プライバシーポリシー
        </a>{" "}
        をご確認ください
      </p>
    </div>
  );
}
