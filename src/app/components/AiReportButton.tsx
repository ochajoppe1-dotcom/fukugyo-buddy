"use client";

import { useState } from "react";
import { useToast } from "./Toast";

type Props = {
  /** 対象機能名（例：「LP診断」「AI相談」） */
  feature: string;
  /** AI出力内容（テキストやJSON文字列） */
  output: string;
};

const REASONS = [
  { value: "factual_error", label: "事実誤認・不正確な内容" },
  { value: "inappropriate", label: "不適切な表現・差別的内容" },
  { value: "harmful_advice", label: "危険な助言（健康・法律・金銭）" },
  { value: "copyright", label: "著作権・引用元不明" },
  { value: "broken", label: "出力が壊れている・読めない" },
  { value: "other", label: "その他" },
];

export default function AiReportButton({ feature, output }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("factual_error");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const reasonLabel =
        REASONS.find((r) => r.value === reason)?.label || reason;
      const subject = `[AI出力報告] ${feature}：${reasonLabel}`;
      const body = `機能：${feature}
理由：${reasonLabel}

問題の出力内容：
---
${output.slice(0, 3000)}
---

ユーザーコメント：
${comment || "（なし）"}`;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "feature",
          subject,
          body,
          email: "ai-report@noreply.local", // フォーム経由ではないのでダミー
        }),
      });

      // emailが必須なので別ルートが必要かもしれないが、まず簡略版で
      const data = await res.json();
      if (data.success) {
        toast.show("報告ありがとうございます。確認します。", "success");
        setOpen(false);
        setComment("");
      } else {
        // emailダミーが弾かれるかもなのでfallback
        toast.show("送信に失敗しました。再試行してください。", "error");
      }
    } catch {
      toast.show("通信エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
        aria-label="この出力を報告"
      >
        🚩 この出力を報告
      </button>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
      <h4 className="text-xs font-bold text-amber-800 mb-2">
        🚩 AI出力の報告
      </h4>
      <p className="text-[11px] text-amber-700 mb-2 leading-relaxed">
        運営者にこの出力を報告します。ユーザー情報・出力内容は記録されます。
      </p>

      <label className="block text-[11px] font-bold text-gray-700 mb-1">
        理由
      </label>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white mb-2"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      <label className="block text-[11px] font-bold text-gray-700 mb-1">
        コメント（任意）
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="具体的にどこが問題かなど"
        rows={2}
        maxLength={500}
        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mb-2"
      />

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-amber-600 text-white text-xs py-1.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "送信中..." : "報告する"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={loading}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-white"
        >
          やめる
        </button>
      </div>
    </div>
  );
}
