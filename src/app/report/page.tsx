import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, checkUsage } from "@/lib/usage";
import ReportClient from "./ReportClient";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);
  const usage = await checkUsage(supabase, user.id, "report");

  const header = (
    <header className="border-b border-gray-100 bg-white">
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
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">数字まるわかりレポート</h1>
        </div>
        {usage.limit !== null && usage.limit !== Infinity && (
          <span className="text-xs text-gray-400">
            今月：あと {usage.remaining} 回
          </span>
        )}
      </div>
    </header>
  );

  // Free はアクセス不可
  if (plan === "free") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName="数字まるわかりレポート"
            description="副業日記の記録から、月次の傾向・時給換算・改善ポイントをAIが分析します。"
            requiredPlan="Standard"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1">
        <ReportClient
          plan={plan}
          canGenerate={usage.allowed}
          remaining={
            usage.remaining === Infinity ? null : (usage.remaining as number)
          }
          limit={usage.limit === Infinity ? null : (usage.limit as number)}
        />
      </section>
    </main>
  );
}
