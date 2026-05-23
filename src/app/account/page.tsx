import { Suspense } from "react";
import Link from "next/link";
import AccountClient from "./AccountClient";

export default function AccountPage() {
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
          <AccountClient />
        </Suspense>
      </section>
    </main>
  );
}
