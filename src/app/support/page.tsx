import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, checkUsage } from "@/lib/usage";
import SupportClient from "./SupportClient";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI実務サポート - 商品説明・メール・SNS投稿をAIが作成",
  description:
    "副業の実務文章作成（商品説明、提案メール、価格交渉、SNSキャッチコピー、プロフィール文等）をAIがサポート。Premiumプランの機能。",
};

export default async function SupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);
  const usage = await checkUsage(supabase, user.id, "practical_support");

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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">AI実務サポート</h1>
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
            featureName="AI実務サポート"
            description="商品説明文、顧客向けメール、提案文、価格交渉文、SNS投稿などの副業実務文章をAIが作成・改善します。"
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
        <SupportClient canGenerate={usage.allowed} />
      </section>
    </main>
  );
}
