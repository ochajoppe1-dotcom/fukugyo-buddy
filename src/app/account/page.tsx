import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // サーバー側でサブスク状態を取得
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialSub = sub
    ? {
        plan: (sub.plan as "free" | "standard" | "premium") ?? "free",
        status: sub.status ?? "inactive",
        current_period_end: sub.current_period_end,
        cancel_at: sub.cancel_at ?? null,
      }
    : {
        plan: "free" as const,
        status: "inactive",
        current_period_end: null,
        cancel_at: null,
      };

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 戻る
          </Link>
          <h1 className="font-bold text-gray-900">アカウント</h1>
        </div>
      </header>

      <section className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-xl mx-auto px-6 py-12 text-center text-gray-400 text-sm">
              読み込み中...
            </div>
          }
        >
          <AccountClient
            initialEmail={user.email ?? null}
            initialSub={initialSub}
          />
        </Suspense>
      </section>
    </main>
  );
}
