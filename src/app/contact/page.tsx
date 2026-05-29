import type { Metadata } from "next";
import Link from "next/link";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "副業バディAIへのお問い合わせフォーム。課金トラブル、アカウント関連、バグ報告、データ削除依頼など。",
};

export default function ContactPage() {
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
          <h1 className="font-bold text-gray-900">お問い合わせ</h1>
        </div>
      </header>

      <section className="flex-1">
        <ContactClient />
      </section>
    </main>
  );
}
