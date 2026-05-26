import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkUsage } from "@/lib/usage";
import DiagnoseChat from "./DiagnoseChat";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LP診断 - 副業教材の販売ページをAIがチェック",
  description:
    "情報商材・副業教材のLP（販売ページ）を、AIが対話形式で27の危険サインから診断します。購入前のチェックで詐欺被害を未然に防ぎましょう。",
};

export default async function DiagnosePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 利用回数情報を取得（Free=3回、Standard+=無制限）
  const usage = await checkUsage(supabase, user.id, "lp_diagnose");

  const header = (
    <header className="border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
        >
          ← 戻る
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-emerald-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <h1 className="font-semibold text-gray-900">LP診断</h1>
        </div>
        {/* 利用回数表示 */}
        {usage.limit !== null && usage.limit !== Infinity && (
          <span className="text-xs text-gray-400">
            今月：あと {usage.remaining} 回
          </span>
        )}
        {usage.limit === Infinity && (
          <span className="text-xs text-emerald-600 font-medium">無制限</span>
        )}
      </div>
    </header>
  );

  // Free で上限到達
  if (!usage.allowed && usage.reason === "limit_exceeded") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName={`LP診断（今月の上限 ${usage.limit} 回に到達）`}
            description="Standard プランなら無制限でLP診断が使えます。情報商材を買う前のチェックに、何度でもご利用ください。"
            requiredPlan="Standard"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1 flex flex-col">
        <DiagnoseChat />
      </section>
    </main>
  );
}
