import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import AssessmentClient from "./AssessmentClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "副業適性診断 - 15の質問であなたに向いた副業をAIが提案",
  description:
    "時間制約・体力・性格・リスク許容度・興味から、あなたに向いている副業TOP3と避けるべき副業をAIが診断。Standardプラン以上。",
};

export default async function AssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);

  // Free プランは AI版ではなく静的版へ
  if (plan === "free") {
    redirect("/assessment-self");
  }

  const header = (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
        >
          ← 戻る
        </Link>
        <div className="flex items-center gap-2">
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
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">副業適性診断</h1>
        </div>
      </div>
    </header>
  );

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1">
        <AssessmentClient />
      </section>
    </main>
  );
}
