import Link from "next/link";

export const metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ページが見つかりません
      </h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-8 text-center max-w-sm">
        URLが変更されたか、削除された可能性があります。
        <br />
        トップページから目的の機能を探してみてください。
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          href="/"
          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-center"
        >
          トップへ戻る
        </Link>
        <Link
          href="/diagnose"
          className="flex-1 border border-emerald-300 text-emerald-700 py-3 rounded-xl font-medium hover:bg-emerald-50 transition-colors text-center"
        >
          LP診断を試す
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        お困りの場合は{" "}
        <a
          href="mailto:fukugyo.buddy.ai@gmail.com"
          className="text-emerald-600 hover:underline"
        >
          fukugyo.buddy.ai@gmail.com
        </a>{" "}
        までご連絡ください
      </p>
    </main>
  );
}
