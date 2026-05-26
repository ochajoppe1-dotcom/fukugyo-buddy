import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, checkUsage } from "@/lib/usage";
import EmergencyClient from "./EmergencyClient";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export default async function EmergencyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);
  const usage = await checkUsage(supabase, user.id, "emergency_template");

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
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">緊急時テンプレ生成</h1>
        </div>
        {usage.limit !== null && usage.limit !== Infinity && (
          <span className="text-xs text-gray-400">
            今月：あと {usage.remaining} 回
          </span>
        )}
      </div>
    </header>
  );

  if (plan !== "premium") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName="緊急時テンプレ生成"
            description="情報商材の返金交渉、不良品クレーム、相手と連絡が取れない時など、副業で困った時のメール・メッセージ文面をAIが状況に応じて作成します。"
            requiredPlan="Premium"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1">
        <EmergencyClient canGenerate={usage.allowed} />
      </section>
    </main>
  );
}
