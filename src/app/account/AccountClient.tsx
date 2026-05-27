"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "../components/Toast";

type Plan = "free" | "standard" | "premium";

type InitialSub = {
  plan: Plan;
  status: string;
  current_period_end: string | null;
  cancel_at: string | null;
};

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  standard: "Standard",
  premium: "Premium",
};

const STATUS_LABEL: Record<string, string> = {
  active: "有効",
  trialing: "無料トライアル中",
  past_due: "支払い遅延",
  canceled: "解約済み",
  unpaid: "未払い",
  inactive: "未契約",
  incomplete: "支払い未完了",
  incomplete_expired: "支払い期限切れ",
  paused: "一時停止中",
};

export default function AccountClient({
  initialEmail,
  initialSub,
}: {
  initialEmail: string | null;
  initialSub: InitialSub;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [portalLoading, setPortalLoading] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || emailLoading) return;
    setEmailLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        toast.show(error.message || "変更に失敗しました", "error");
      } else {
        setEmailSent(true);
        toast.show("確認メールを送信しました", "success");
      }
    } catch {
      toast.show("通信エラーが発生しました", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const checkoutStatus = searchParams.get("checkout");

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.show(data.error || "ポータルを開けませんでした", "error");
      }
    } catch {
      toast.show("通信エラーが発生しました", "error");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-5">
      {checkoutStatus === "success" && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 text-sm">
          🎉 サブスクリプションの登録が完了しました！
        </div>
      )}

      {/* アカウント情報 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">アカウント情報</h2>
          {!editingEmail && (
            <button
              onClick={() => {
                setEditingEmail(true);
                setNewEmail(initialEmail ?? "");
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              編集
            </button>
          )}
        </div>
        {!editingEmail ? (
          <p className="text-sm text-gray-600">
            <span className="text-gray-400">メール：</span>
            {initialEmail ?? "未登録"}
          </p>
        ) : emailSent ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 leading-relaxed">
            ✓ <strong>{newEmail}</strong> に確認メールを送信しました。
            <br />
            メール内のリンクをクリックすると変更が完了します。
          </div>
        ) : (
          <form onSubmit={handleChangeEmail} className="space-y-2">
            <p className="text-xs text-gray-500">
              新しいメールアドレスに確認メールが送られます。
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={emailLoading || !newEmail.trim() || newEmail === initialEmail}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {emailLoading ? "送信中..." : "変更"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingEmail(false);
                  setNewEmail("");
                  setEmailSent(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 解約予定バナー */}
      {initialSub.cancel_at && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm">
          <p className="font-bold mb-1">
            ⚠ {new Date(initialSub.cancel_at).toLocaleDateString("ja-JP")} に解約予定
          </p>
          <p className="text-xs text-amber-700">
            この日まで {PLAN_LABEL[initialSub.plan]} プランの機能が使えます。
            <br />
            予約をキャンセルしたい場合は、下の「プラン変更・解約」から取り消せます。
          </p>
        </div>
      )}

      {/* プラン状態 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">現在のプラン</h2>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-emerald-700">
            {PLAN_LABEL[initialSub.plan]}
          </span>
          <span className="text-xs text-gray-500">
            {initialSub.cancel_at
              ? "解約予定"
              : STATUS_LABEL[initialSub.status] ?? initialSub.status}
          </span>
        </div>
        {initialSub.current_period_end && !initialSub.cancel_at && (
          <p className="text-xs text-gray-500">
            次回更新日：
            {new Date(initialSub.current_period_end).toLocaleDateString("ja-JP")}
          </p>
        )}
        {initialSub.cancel_at && (
          <p className="text-xs text-gray-500">
            利用可能期限：
            {new Date(initialSub.cancel_at).toLocaleDateString("ja-JP")}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {initialSub.plan === "free" ? (
            <button
              onClick={() => router.push("/")}
              className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              プランをアップグレード
            </button>
          ) : (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {portalLoading ? "起動中..." : "プラン変更・解約"}
            </button>
          )}
        </div>
      </div>

      {/* ログアウト */}
      <div className="text-center pt-2">
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
