"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "update" = リンクから来た後の新パスワード設定

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password?mode=update`,
      });
      if (error) {
        setError(error.message || "送信に失敗しました");
      } else {
        setSent(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const setNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || loading) return;
    if (newPassword.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setError(error.message || "更新に失敗しました");
      } else {
        setUpdated(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: リンクから来た（新パスワード設定）
  if (mode === "update") {
    if (updated) {
      return (
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            ✓
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            パスワードを更新しました
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            新しいパスワードでログインできます。
          </p>
          <a
            href="/login"
            className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            ログインする
          </a>
        </div>
      );
    }
    return (
      <form
        onSubmit={setNewPasswordSubmit}
        className="max-w-sm w-full space-y-4"
      >
        <h2 className="text-lg font-bold text-gray-900">
          新しいパスワードを設定
        </h2>
        <p className="text-sm text-gray-500">
          8文字以上の新しいパスワードを入力してください。
        </p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新しいパスワード"
          minLength={8}
          required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || newPassword.length < 8}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? "更新中..." : "パスワードを更新"}
        </button>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </form>
    );
  }

  // Step 1: メールアドレス入力 → リセットリンク送信
  if (sent) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          📧
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          メールを送信しました
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          <strong className="text-gray-700">{email}</strong>{" "}
          にパスワードリセット用のリンクを送信しました。
          <br />
          メールを開いてリンクをクリックしてください。
        </p>
        <p className="text-xs text-gray-400">
          メールが届かない場合は迷惑メールフォルダもご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={requestReset} className="max-w-sm w-full space-y-4">
      <h2 className="text-lg font-bold text-gray-900 text-center">
        パスワードをリセット
      </h2>
      <p className="text-sm text-gray-500 text-center">
        登録メールアドレスにリセット用リンクを送ります。
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="登録メールアドレス"
        required
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
      />
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {loading ? "送信中..." : "リセットリンクを送る"}
      </button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </form>
  );
}
