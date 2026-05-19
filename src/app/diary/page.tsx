import Link from "next/link";

export default function DiaryPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="bg-gradient-to-r from-[#10B981] to-[#34D399] text-white px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-white/70 hover:text-white">
            ← 戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">📔</span>
            <h1 className="text-2xl font-bold">副業日記</h1>
          </div>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-[#1E3A8A] mb-3">実装中</h2>
          <p className="text-gray-600 mb-6">
            売上・経費・時間を記録して
            <br />
            AIが進捗を分析する機能を準備中です。
          </p>
          <Link
            href="/"
            className="inline-block bg-[#10B981] text-white px-6 py-3 rounded-full font-bold hover:bg-[#34D399] transition-colors"
          >
            トップに戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
