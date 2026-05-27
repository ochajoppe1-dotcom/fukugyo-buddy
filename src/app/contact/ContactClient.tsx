"use client";

import { useState } from "react";
import { useToast } from "../components/Toast";

const CATEGORIES = [
  { value: "billing", label: "💳 課金トラブル（決済できない・反映されない）" },
  { value: "account", label: "👤 アカウント関連（ログイン・メアド変更等）" },
  { value: "feature", label: "🐛 機能要望・バグ報告" },
  { value: "data", label: "🗑 データ削除依頼" },
  { value: "other", label: "💬 その他" },
];

export default function ContactClient({
  initialEmail,
}: {
  initialEmail: string;
}) {
  const toast = useToast();
  const [category, setCategory] = useState("billing");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!subject.trim() || !body.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, body, email }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.show("お問い合わせを送信しました", "success");
      } else {
        toast.show(data.error || "送信に失敗しました", "error");
      }
    } catch {
      toast.show("通信エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          ✓
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          送信しました
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          内容を確認のうえ、運営者から{" "}
          <strong className="text-gray-700">{email}</strong>{" "}
          までご返信いたします。
          <br />
          通常2〜3営業日以内にお返事します。
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          トップへ戻る
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto px-6 py-6 space-y-5">
      <p className="text-xs text-gray-500 leading-relaxed">
        ご質問・不具合・要望などお気軽にどうぞ。通常2〜3営業日以内にお返事します。
        <br />
        よくある質問は{" "}
        <a href="/help" className="text-emerald-600 underline">
          ヘルプページ
        </a>{" "}
        もご確認ください。
      </p>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-emerald-500"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          件名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="決済が反映されない、など"
          maxLength={200}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          本文 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="状況をできるだけ詳しくお書きください。決済の場合は決済日時、メールアドレス、エラーメッセージなどあると助かります。"
          rows={6}
          maxLength={5000}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {body.length} / 5000
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          返信先メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !subject.trim() || !body.trim() || !email.trim()}
        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {loading ? "送信中..." : "送信する"}
      </button>

      <p className="text-xs text-gray-400 leading-relaxed">
        ご記入いただいた内容は{" "}
        <a href="/privacy" className="text-emerald-600 underline">
          プライバシーポリシー
        </a>{" "}
        に従い、運営者のみが閲覧します。
      </p>
    </form>
  );
}
