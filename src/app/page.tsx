import Link from "next/link";

// シンプルな線アイコン（Lucide風）
function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
function IconCompass() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const features = [
  {
    href: "/diagnose",
    icon: <IconShield />,
    title: "LP診断",
    description: "副業教材の販売ページを、AIが対話形式で診断",
    label: "始める前に",
  },
  {
    href: "/chat",
    icon: <IconMessage />,
    title: "AI相談",
    description: "副業の悩みを、24時間いつでもチャットで相談",
    label: "困った時に",
  },
  {
    href: "/diary",
    icon: <IconBook />,
    title: "副業日記",
    description: "売上・経費・時間を記録。AIが進捗を分析",
    label: "実践中に",
  },
  {
    href: "/assessment",
    icon: <IconCompass />,
    title: "適性診断",
    description: "15の質問で、あなたに向いた副業をAIが提案",
    label: "迷った時に",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    features: ["LP診断 月3回", "AI相談 月3回"],
    highlight: false,
  },
  {
    name: "Standard",
    price: "550",
    features: [
      "LP診断 無制限",
      "AI相談 月20回",
      "適性診断",
      "副業日記",
      "詐欺アラート 週1",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "990",
    features: ["Standardの全機能", "AI相談 月100回", "進捗AI分析", "緊急時テンプレ生成"],
    highlight: false,
  },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg">
              副業バディAI
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            あなたの副業を、
            <br />
            AIが伴走します。
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8">
            始める前のチェックから、実践中の悩み相談、進捗管理まで。
            <br className="hidden md:block" />
            副業の全ステップを、AIがサポートします。
          </p>
          <Link
            href="/diagnose"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-7 py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            無料でLP診断を試す
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
            副業ライフサイクル、まるごと伴走
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            4つの機能で、あなたの副業をサポート。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {feature.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-12">
            シンプルで、お手頃な料金
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlight
                    ? "border-emerald-300 bg-emerald-50/30 relative"
                    : "border-gray-100"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                    おすすめ
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold text-gray-900">
                    ¥{plan.price}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-sm text-gray-400">/月</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-500 flex-shrink-0"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-6">
            課金プランは初回7日間無料 ／ いつでもワンクリックで解約できます
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-gray-400">© 2026 副業バディAI</p>
        </div>
      </footer>
    </main>
  );
}
