import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "パスワードリセット",
  description: "副業バディAI のパスワードリセット。登録メールアドレスに再設定リンクを送信します。",
};

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/login"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← ログインへ
          </Link>
          <h1 className="font-bold text-gray-900">パスワードリセット</h1>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <Suspense
          fallback={
            <div className="text-sm text-gray-400">読み込み中...</div>
          }
        >
          <ResetPasswordClient />
        </Suspense>
      </section>
    </main>
  );
}
