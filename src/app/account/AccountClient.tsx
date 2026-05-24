"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Plan = "free" | "standard" | "premium";

type InitialSub = {
  plan: Plan;
  status: string;
  current_period_end: string | null;
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
  const [portalLoading, setPortalLoading] = useState(false);

  const checkoutStatus = searchParams.get("checkout");

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "ポータルを開けませんでした");
      }
    } catch {
      alert("通信エラーが発生しました");
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
        <h2 className="text-sm font-bold text-gray-700 mb-3">アカウント情報</h2>
        <div className="text-sm text-gray-600">
          <p className="mb-1">
            <span className="text-gray-400">メール：</span>
            {initialEmail ?? "未登録"}
          </p>
        </div>
      </div>

      {/* プラン状態 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">現在のプラン</h2>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-emerald-700">
            {PLAN_LABEL[initialSub.plan]}
          </span>
          <span className="text-xs text-gray-500">
            {STATUS_LABEL[initialSub.status] ?? initialSub.status}
          </span>
        </div>
        {initialSub.current_period_end && (
          <p className="text-xs text-gray-500">
            次回更新日：
            {new Date(initialSub.current_period_end).toLocaleDateString("ja-JP")}
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
