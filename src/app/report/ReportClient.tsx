"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  monthKey: string;
  lastMonthKey: string;
  totals: {
    revenue: number;
    expense: number;
    profit: number;
    minutes: number;
    hourly: number;
    entries: number;
  };
  thisMonth: {
    revenue: number;
    expense: number;
    profit: number;
    minutes: number;
    hourly: number;
    entries: number;
  };
  lastMonth: {
    revenue: number;
    expense: number;
    profit: number;
    minutes: number;
    entries: number;
  };
};

type Report = {
  headline: string;
  highlights: string[];
  hourlyHealth: {
    score: "good" | "okay" | "warning";
    comment: string;
  };
  suggestions: string[];
  watchOuts: string[];
};

type Props = {
  plan: "free" | "standard" | "premium";
  canGenerate: boolean;
  remaining: number | null;
  limit: number | null;
};

export default function ReportClient({
  plan,
  canGenerate,
  remaining,
  limit,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReport(data.result);
        setStats(data.stats);
        // サーバー側のカウンタ表示を更新
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 初回表示
  if (!report && !loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            副業日記をAIが分析します
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            あなたの売上・経費・作業時間の記録から、今月の傾向、時給換算の健康度、改善ポイントをAIがレポートにします。
          </p>
          {plan === "standard" && (
            <p className="text-xs text-emerald-700 font-medium mb-1">
              Standard：月1回まで生成できます
            </p>
          )}
          {plan === "premium" && (
            <p className="text-xs text-emerald-700 font-medium mb-1">
              Premium：月4回（週1相当）まで生成できます
            </p>
          )}
          {limit !== null && remaining !== null && (
            <p className="text-xs text-gray-500">
              今月の残り：{remaining} / {limit} 回
            </p>
          )}
        </div>

        {canGenerate ? (
          <button
            onClick={generate}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            レポートを生成する
          </button>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 text-center">
            今月のレポート生成は上限に達しています。
            <br />
            来月またご利用いただけます。
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-600 mt-4">{error}</p>
        )}
      </div>
    );
  }

  // ローディング
  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="inline-block animate-spin text-5xl mb-4">📊</div>
        <p className="text-gray-600 font-medium">AIがあなたの数字を分析中...</p>
        <p className="text-gray-400 text-sm mt-1">少々お待ちください</p>
      </div>
    );
  }

  // レポート表示
  if (report) {
    const healthColor = {
      good: "text-emerald-600 bg-emerald-50 border-emerald-100",
      okay: "text-amber-700 bg-amber-50 border-amber-100",
      warning: "text-red-600 bg-red-50 border-red-100",
    }[report.hourlyHealth.score];

    const healthLabel = {
      good: "健全",
      okay: "注意",
      warning: "見直し推奨",
    }[report.hourlyHealth.score];

    return (
      <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
        {/* ヘッドライン */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 leading-relaxed">
            {report.headline}
          </h2>
        </div>

        {/* 数字サマリー */}
        {stats && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              📊 今月の数字（{stats.monthKey}）
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="売上" value={`¥${stats.thisMonth.revenue.toLocaleString()}`} />
              <Stat label="利益" value={`¥${stats.thisMonth.profit.toLocaleString()}`} />
              <Stat label="経費" value={`¥${stats.thisMonth.expense.toLocaleString()}`} />
              <Stat
                label="時給換算"
                value={`¥${stats.thisMonth.hourly.toLocaleString()}/h`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              累計：売上 ¥{stats.totals.revenue.toLocaleString()} / 利益 ¥
              {stats.totals.profit.toLocaleString()} / 時給 ¥
              {stats.totals.hourly.toLocaleString()}/h
            </p>
          </div>
        )}

        {/* ハイライト */}
        {report.highlights.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              💡 気づきポイント
            </h3>
            <ul className="space-y-2">
              {report.highlights.map((h, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-emerald-500 flex-shrink-0">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 時給ヘルスチェック */}
        <div className={`rounded-2xl border p-5 ${healthColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold">⏱ 時給ヘルスチェック</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 font-medium">
              {healthLabel}
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            {report.hourlyHealth.comment}
          </p>
        </div>

        {/* 提案 */}
        {report.suggestions.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-emerald-700 mb-3">
              🎯 次の1ヶ月のおすすめアクション
            </h3>
            <ol className="space-y-2 list-decimal list-inside">
              {report.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed">
                  {s}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 注意点 */}
        {report.watchOuts && report.watchOuts.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-700 mb-3">
              ⚠️ 注意したいポイント
            </h3>
            <ul className="space-y-2">
              {report.watchOuts.map((w, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-amber-500 flex-shrink-0">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => {
            setReport(null);
            setStats(null);
          }}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors mt-4"
        >
          閉じる
        </button>
      </div>
    );
  }

  return null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
