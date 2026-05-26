import Link from "next/link";
import PricingCards from "./components/PricingCards";

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

function IconChart() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}
function IconLifebuoy() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M14.83 9.17l3.53-3.53M4.93 19.07l4.24-4.24" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}
function IconRoute() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
    href: "/report",
    icon: <IconChart />,
    title: "数字まるわかりレポート",
    description: "日記データをAIが分析、改善ポイントをレポート",
    label: "見直したい時に",
  },
  {
    href: "/assessment",
    icon: <IconCompass />,
    title: "適性診断",
    description: "15の質問で、あなたに向いた副業をAIが提案",
    label: "迷った時に",
  },
  {
    href: "/alerts",
    icon: <IconAlert />,
    title: "詐欺アラート",
    description: "副業詐欺の典型パターンと注意ポイントを定期配信",
    label: "Standard",
  },
  {
    href: "/roadmap",
    icon: <IconRoute />,
    title: "AI副業ロードマップ",
    description: "3ヶ月／半年／1年の段階的プランをAIが設計",
    label: "Premium",
  },
  {
    href: "/support",
    icon: <IconFile />,
    title: "AI実務サポート",
    description: "商品説明文・メール・SNS投稿などをAIが作成",
    label: "Premium",
  },
  {
    href: "/emergency",
    icon: <IconLifebuoy />,
    title: "緊急時テンプレ生成",
    description: "返金交渉・クレーム対応など困った時の文面をAIが作成",
    label: "Premium",
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
          <PricingCards />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <Link
              href="/terms"
              className="hover:text-emerald-600 transition-colors"
            >
              利用規約
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/privacy"
              className="hover:text-emerald-600 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/tokushoho"
              className="hover:text-emerald-600 transition-colors"
            >
              特定商取引法に基づく表記
            </Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 副業バディAI</p>
        </div>
      </footer>
    </main>
  );
}
