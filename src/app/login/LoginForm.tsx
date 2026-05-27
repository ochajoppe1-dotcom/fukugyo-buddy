"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "確認メールを送りました。メール内のリンクをクリックして登録を完了してください。",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/diary");
        router.refresh();
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "エラーが発生しました";
      // よくあるエラーを日本語化
      let jpMsg = msg;
      if (msg.includes("Invalid login credentials")) {
        jpMsg = "メールアドレスまたはパスワードが違います";
      } else if (msg.includes("already registered")) {
        jpMsg = "このメールアドレスは既に登録されています";
      } else if (msg.includes("Password should be")) {
        jpMsg = "パスワードは6文字以上にしてください";
      } else if (msg.includes("not configured") || msg.includes("fetch")) {
        jpMsg = "サーバー設定が未完了です（管理者にお問い合わせください）";
      }
      setMessage({ type: "error", text: jpMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* モード切替タブ */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => {
            setMode("login");
            setMessage(null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "login"
              ? "bg-white text-emerald-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          ログイン
        </button>
        <button
          onClick={() => {
            setMode("signup");
            setMessage(null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "signup"
              ? "bg-white text-emerald-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          新規登録
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="6文字以上"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {message && (
          <div
            className={`text-sm rounded-xl px-4 py-3 ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? "処理中..."
            : mode === "login"
            ? "ログイン"
            : "新規登録する"}
        </button>
      </form>

      {mode === "login" && (
        <p className="text-xs text-center mt-4">
          <a
            href="/reset-password"
            className="text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            パスワードを忘れた方
          </a>
        </p>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
        副業日記の利用には登録が必要です。
        <br />
        メールアドレスとパスワードだけで始められます。
      </p>
    </div>
  );
}
