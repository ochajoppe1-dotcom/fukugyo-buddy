import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
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
          <h1 className="font-bold text-gray-900">ログイン / 新規登録</h1>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <LoginForm />
        <p className="text-xs text-gray-400 text-center mt-6">
          登録すると{" "}
          <Link href="/terms" className="underline hover:text-emerald-600">
            利用規約
          </Link>{" "}
          と{" "}
          <Link href="/privacy" className="underline hover:text-emerald-600">
            プライバシーポリシー
          </Link>{" "}
          に同意したものとみなされます
        </p>
      </section>
    </main>
  );
}
