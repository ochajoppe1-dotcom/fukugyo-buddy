import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, getUserPlan } from "@/lib/usage";
import ChatClient from "./ChatClient";
import LockedFeature from "../components/LockedFeature";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI相談 - 副業の悩みを24時間チャット相談",
  description:
    "副業選び、続け方、辞め時、詐欺被害の相談まで。AIが24時間いつでも答えます。Free月3回・Standard月20回・Premium無制限。",
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const usage = await checkUsage(supabase, user.id, "ai_chat");
  const plan = await getUserPlan(supabase, user.id);
  const isPremium = plan === "premium";

  // Premium のみ過去の会話履歴を読み込む（最新の会話セッション）
  let initialHistory: HistoryMessage[] = [];
  let initialConversationId: string | null = null;
  if (isPremium) {
    // 最新のメッセージから conversation_id を取得
    const { data: latest } = await supabase
      .from("chat_messages")
      .select("conversation_id, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest?.conversation_id) {
      // 同じ会話の全メッセージを取得（古い順）
      const { data: history } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", latest.conversation_id)
        .order("created_at", { ascending: true });

      if (history && history.length > 0) {
        initialHistory = history as HistoryMessage[];
        initialConversationId = latest.conversation_id;
      }
    }
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
        <ChatClient
          isPremium={isPremium}
          initialHistory={initialHistory}
          initialConversationId={initialConversationId}
        />
      </section>
    </main>
  );
}
