"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../components/Toast";
import AiReportButton from "../components/AiReportButton";

type Result = {
  subject: string;
  body: string;
  tone: "fact-based" | "polite" | "firm";
  tips: string[];
  nextSteps: string[];
};

const SCENARIOS = [
  {
    title: "情報商材の返金交渉",
    situation: "購入した情報商材が説明と相違していたため、返金を求めたい",
  },
  {
    title: "不良品クレーム対応",
    situation: "仕入れた商品が不良品で、顧客からクレームが来た。販売者に対応を依頼したい",
  },
  {
    title: "販売者と連絡が取れない",
    situation: "購入した教材の販売者からサポート期間内に返信がない。催促したい",
  },
  {
    title: "クライアント納期遅延",
    situation: "副業のクライアントへの納期に間に合わない。誠実に連絡したい",
  },
  {
    title: "詐欺の疑いがある相手への連絡",
    situation: "情報商材を購入したが詐欺の可能性が高い。事実確認と返金を求めたい",
  },
];

export default function EmergencyClient({
  canGenerate,
}: {
  canGenerate: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [situation, setSituation] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!situation.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, details }),
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

  const copyBody = async () => {
    if (!result) return;
    const full = result.subject
      ? `件名：${result.subject}\n\n${result.body}`
      : result.body;
    try {
      await navigator.clipboard.writeText(full);
      toast.show("✓ コピーしました", "success");
    } catch {
      toast.show("コピーに失敗しました", "error");
    }
  };

  const reset = () => {
    setResult(null);
    setSituation("");
    setDetails("");
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

  // 結果表示
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
        {result.subject && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 mb-2">件名</h3>
            <p className="text-sm font-medium text-gray-900">{result.subject}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-500 mb-2">本文</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {result.body}
          </p>
          <button
            onClick={copyBody}
            className="mt-3 w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm"
          >
            📋 件名+本文をコピー
          </button>
        </div>

        {result.tips.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-emerald-700 mb-2">
              💡 送信前のチェック
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

        {result.nextSteps.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-700 mb-2">
              ⚠ 返答がない・状況が悪化したら
            </h3>
            <ul className="space-y-1.5">
              {result.nextSteps.map((s, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-700 leading-relaxed flex gap-2"
                >
                  <span className="text-amber-500 flex-shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          別の状況でもう一度生成する
        </button>

        <div className="text-right">
          <AiReportButton
            feature="緊急時テンプレ生成"
            output={JSON.stringify(result, null, 2)}
          />
        </div>
      </div>
    );
  }

  // 入力フォーム
  return (
    <div className="max-w-xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 leading-relaxed">
        ⚠ AIが生成する文面は「叩き台」です。送信前に必ず内容を確認・修正してください。法的判断が必要な場合は弁護士・消費生活センター（188）にご相談を。
      </div>

      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-2">
          よくある状況から選ぶ
        </h2>
        <div className="space-y-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.title}
              onClick={() => setSituation(s.situation)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-emerald-300 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">{s.title}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          状況 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="どんな状況ですか？（例：購入した教材のサポート期間内なのに返信がない、など）"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          詳細・補足 <span className="text-gray-400 font-normal">（任意）</span>
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="購入日、商品名、相手の会社名、これまでのやり取りの経緯など（個人情報は伏字で）"
          rows={3}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        onClick={generate}
        disabled={!situation.trim() || loading}
        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "生成中..." : "テンプレを生成する"}
      </button>

      {error && (
        <p className="text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
