import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import LockedFeature from "../components/LockedFeature";
import MentorClient from "./MentorClient";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
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
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
              <path d="m19 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">専属AIメンター</h1>
        </div>
      </div>
    </header>
  );

  if (plan !== "premium") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName="専属AIメンター"
            description="副業日記・AI相談・診断の内容をすべて踏まえて、AIメンターが毎週あなたに伴走します。先週の振り返りと、今週の具体的な一手を届けます。"
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
        <MentorClient />
      </section>
    </main>
  );
}
