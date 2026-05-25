import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DiaryClient from "./DiaryClient";
import { getUserPlan } from "@/lib/usage";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログインならログインページへ
  if (!user) {
    redirect("/login");
  }

  // プランチェック：Standard+のみ
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
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">副業日記</h1>
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
            featureName="副業日記"
            description="売上・経費・作業時間を記録し、累計や時給換算を自動で集計します。"
            requiredPlan="Standard"
          />
        </section>
      </main>
    );
  }

  // Standard / Premium：通常表示
  const { data: entries } = await supabase
    .from("diary_entries")
    .select("*")
    .order("entry_date", { ascending: false });

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1">
        <DiaryClient initialEntries={entries ?? []} />
      </section>
    </main>
  );
}
