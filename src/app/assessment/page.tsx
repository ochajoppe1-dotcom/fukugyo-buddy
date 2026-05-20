import Link from "next/link";

export default function AssessmentPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </span>
            <h1 className="font-semibold text-gray-900">適性診断</h1>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-gray-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">準備中</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            15問の質問に答えると
            <br />
            AIがあなたに向いた副業を提案します。
          </p>
          <Link
            href="/"
            className="inline-block text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            トップに戻る →
          </Link>
        </div>
      </section>
    </main>
  );
}
