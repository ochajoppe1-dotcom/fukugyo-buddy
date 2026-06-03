"use client";

import { useState } from "react";

export default function MentorClient() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCheckin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mentor", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました");
        return;
      }
      setMessage(data.message);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
      {/* 説明 */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-emerald-800 mb-2">
          🌱 あなた専属のAIメンター
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          副業日記やAI相談の内容を踏まえて、AIが「最近の振り返り」と「今週の一手」を届けます。数字が伸び悩んでいる時も、まず気持ちに寄り添って、次の小さな一歩を一緒に考えます。
        </p>
        <p className="text-xs text-gray-400 mt-2">
          ※ 副業日記を記録しておくと、より具体的なアドバイスになります（月4回・週1相当まで）
        </p>
      </div>

      {/* チェックインボタン */}
      {!message && (
        <button
          onClick={getCheckin}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? "メンターが考えています…" : "今週のチェックインを受け取る"}
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* メンターからのメッセージ */}
      {message && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
              🌱
            </span>
            <span className="text-sm font-bold text-gray-900">
              専属AIメンターから
            </span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
          <button
            onClick={() => {
              setMessage(null);
              setError(null);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 leading-relaxed">
        ※ 本機能はAIによる一般的な情報提供・伴走を目的としたものです。税務・法律・投資・医療に関する個別の判断は、専門家にご相談ください。
      </p>
    </div>
  );
}
