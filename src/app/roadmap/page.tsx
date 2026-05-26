import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, checkUsage } from "@/lib/usage";
import RoadmapClient from "./RoadmapClient";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI副業ロードマップ - 3ヶ月/半年/1年の段階的プラン",
  description:
    "目標・時間・スキル・予算から、3ヶ月／半年／1年の段階的アクションプランをAIが設計。撤退ラインも明示。Premiumプランの専属サポート。",
};

export default async function RoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);
  const usage = await checkUsage(supabase, user.id, "roadmap");

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
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">AI副業ロードマップ</h1>
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
            featureName="AI副業ロードマップ"
            description="あなたの現状と目標から、3ヶ月／半年／1年の段階的アクションプランをAIが設計します。撤退ラインも明示。"
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
        <RoadmapClient canGenerate={usage.allowed} />
      </section>
    </main>
  );
}
