"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/Toast";
import AiReportButton from "../components/AiReportButton";

type Result = {
  title: string;
  main: string;
  alternatives: string[];
  tips: string[];
};

const PRESETS = [
  {
    label: "📦 商品説明文",
    task: "フリマアプリで商品を出品するための説明文を作って",
  },
  {
    label: "✉️ クライアント向けメール",
    task: "クライアントへの提案・お礼メールの文面を作って",
  },
  {
    label: "💰 価格交渉文",
    task: "仕入れ先・取引先への価格交渉のメールを作って",
  },
  {
    label: "📱 SNS投稿キャッチコピー",
    task: "副業の告知用にSNSで使える短いキャッチコピーを3案作って",
  },
  {
    label: "👤 プロフィール文",
    task: "ココナラ・ランサーズ用のプロフィール文を作って",
  },
];

export default function SupportClient({
  canGenerate,
}: {
  canGenerate: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!task.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, context }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.show("✓ コピーしました", "success");
    } catch {
      toast.show("コピーに失敗しました", "error");
    }
  };

  const reset = () => {
    setResult(null);
    setTask("");
    setContext("");
    setError(null);
  };

  if (!canGenerate) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-700">
          今月の生成上限に達しています。来月またご利用いただけます。
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-bold">{result.title}</p>
        </div>

        {/* メイン */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5">
          <h3 className="text-xs font-bold text-gray-500 mb-2">
            🌟 おすすめ
          </h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {result.main}
          </p>
          <button
            onClick={() => copy(result.main)}
            className="mt-3 w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm"
          >
            📋 コピー
          </button>
        </div>

        {/* 別バージョン */}
        {result.alternatives.map((alt, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <h3 className="text-xs font-bold text-gray-500 mb-2">
              別バージョン {i + 1}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {alt}
            </p>
            <button
              onClick={() => copy(alt)}
              className="mt-3 w-full border border-gray-300 text-gray-600 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              📋 コピー
            </button>
          </div>
        ))}

        {result.tips.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-emerald-700 mb-2">
              💡 活用のコツ
            </h3>
            <ul className="space-y-1.5">
              {result.tips.map((t, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-700 leading-relaxed flex gap-2"
                >
                  <span className="text-emerald-500 flex-shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          別の文章を作成する
        </button>

        <div className="text-right">
          <AiReportButton
            feature="AI実務サポート"
            output={JSON.stringify(result, null, 2)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-6 space-y-5">
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2">
          よく使うパターン
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setTask(p.task)}
              className="text-left bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-emerald-300 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{p.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          やりたいこと <span className="text-red-500">*</span>
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="どんな文章が欲しいですか？（例：手作りアクセサリーのフリマ出品文）"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          コンテキスト・前提情報{" "}
          <span className="text-gray-400 font-normal">（任意）</span>
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="商品名・価格・想定読者・トーン（丁寧／フランク）などあれば"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        onClick={generate}
        disabled={!task.trim() || loading}
        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "生成中..." : "文章を生成する"}
      </button>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
