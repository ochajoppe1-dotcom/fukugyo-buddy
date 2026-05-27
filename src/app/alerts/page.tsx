import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import LockedFeature from "../components/LockedFeature";
import AlertsClient from "./AlertsClient";
import { ALERTS } from "./alertsData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "詐欺アラート - 副業詐欺の典型パターンを定期配信",
  description:
    "情報商材詐欺、SNS勧誘、面談営業、月商と月利の混同など、副業詐欺の典型パターンを業界全体の傾向としてまとめて配信。Standardプラン以上。",
};

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);

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
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">詐欺アラート</h1>
        </div>
      </div>
    </header>
  );

  if (plan === "free") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName="詐欺アラート"
            description="副業詐欺・情報商材の典型的な手口を、業界全体の傾向としてAIがまとめて配信。被害に遭ってからでは遅い、購入前のチェック資料として活用してください。"
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
        <AlertsClient alerts={ALERTS} />
      </section>
    </main>
  );
}
