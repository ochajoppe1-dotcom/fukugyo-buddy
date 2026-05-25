import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkUsage } from "@/lib/usage";
import ChatClient from "./ChatClient";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const usage = await checkUsage(supabase, user.id, "ai_chat");

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
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </span>
          <h1 className="font-semibold text-gray-900">AI相談</h1>
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

  // 上限到達
  if (!usage.allowed && usage.reason === "limit_exceeded") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName={`AI相談（今月の上限 ${usage.limit} 回に到達）`}
            description="Standard プランなら月20回、Premium プランなら無制限でAI相談が使えます。"
            requiredPlan={usage.plan === "free" ? "Standard" : "Premium"}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1 flex flex-col">
        <ChatClient />
      </section>
    </main>
  );
}
