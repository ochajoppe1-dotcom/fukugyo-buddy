import Link from "next/link";

export default function DiaryPage() {
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
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </span>
            <h1 className="font-semibold text-gray-900">副業日記</h1>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-gray-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">準備中</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            売上・経費・時間を記録して
            <br />
            AIが進捗を分析する機能を準備しています。
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
