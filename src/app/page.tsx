import Link from "next/link";

const features = [
  {
    href: "/diagnose",
    emoji: "🛡",
    title: "LP診断",
    description: "副業教材LPの危険度をAIが判定",
    color: "from-[#10B981] to-[#34D399]",
    label: "始める前",
  },
  {
    href: "/chat",
    emoji: "💬",
    title: "AI相談",
    description: "副業の悩みを24時間チャット相談",
    color: "from-[#1E40AF] to-[#3B82F6]",
    label: "困った時",
  },
  {
    href: "/diary",
    emoji: "📔",
    title: "副業日記",
    description: "売上・経費・時間を記録、AIが進捗分析",
    color: "from-[#10B981] to-[#34D399]",
    label: "実践中",
  },
  {
    href: "/assessment",
    emoji: "🧭",
    title: "適性診断",
    description: "あなたに向いてる副業をAIが提案",
    color: "from-[#1E40AF] to-[#3B82F6]",
    label: "迷い中",
  },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#10B981] to-[#1E40AF] text-white px-6 py-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🤝</span>
            <h1 className="text-3xl font-bold">
              副業バディ<span className="text-yellow-300">AI</span>
            </h1>
          </div>
          <p className="text-base text-white/90 mb-2">
            あなたの副業を、AIが伴走します。
          </p>
          <p className="text-xs text-white/70">
            副業詐欺被害者本人が運営する、AI完結の副業安全パートナー
          </p>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#F0FDF4] to-white px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-3">
            副業ライフサイクル、まるごと伴走
          </h2>
          <p className="text-gray-700 text-base">
            始める前のチェック、実践中の悩み相談、
            <br />
            進捗管理まで、AIが24時間サポート。
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="flex-1 px-6 py-10 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`block rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${feature.color} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-5xl">{feature.emoji}</div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {feature.label}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm opacity-90">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gradient-to-br from-[#F0FDF4] to-[#EFF6FF] px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-[#1E3A8A] text-center mb-6">
            シンプル＆お手頃な料金
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow border-2 border-gray-200">
              <h4 className="font-bold text-gray-700 mb-2">Free</h4>
              <p className="text-3xl font-bold text-[#10B981] mb-3">¥0</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• LP診断 月3回</li>
                <li>• AI相談 月3回</li>
                <li>• 適性診断 1回</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow border-2 border-[#10B981]">
              <div className="text-xs text-[#10B981] font-bold mb-1">おすすめ</div>
              <h4 className="font-bold text-gray-700 mb-2">Standard</h4>
              <p className="text-3xl font-bold text-[#10B981] mb-3">
                ¥550<span className="text-sm font-normal">/月</span>
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• LP診断 無制限</li>
                <li>• AI相談 月20回</li>
                <li>• 副業日記</li>
                <li>• 詐欺アラート 週1</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow border-2 border-[#1E40AF]">
              <h4 className="font-bold text-gray-700 mb-2">Premium</h4>
              <p className="text-3xl font-bold text-[#1E40AF] mb-3">
                ¥990<span className="text-sm font-normal">/月</span>
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Standardの全機能</li>
                <li>• AI相談 月100回</li>
                <li>• 進捗AI分析</li>
                <li>• 緊急時テンプレ生成</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            ※ 課金プランは初回7日間無料 / いつでもワンクリック解約
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E3A8A] text-white/70 text-center text-xs py-6 px-6">
        <p>© 2026 副業バディAI — 副業詐欺被害者本人が運営</p>
        <p className="mt-1 text-white/50">
          価値あるものを安く、誠実に。
        </p>
      </footer>
    </main>
  );
}
