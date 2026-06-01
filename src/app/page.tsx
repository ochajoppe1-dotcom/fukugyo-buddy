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

function PlanBadge({ plan }: { plan: "free" | "standard" | "premium" }) {
  const styles = {
    free: "bg-gray-100 text-gray-600",
    standard: "bg-emerald-100 text-emerald-700",
    premium: "bg-amber-100 text-amber-700",
  };
  const label = {
    free: "FREE",
    standard: "STANDARD",
    premium: "PREMIUM",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider ${styles[plan]}`}
    >
      {label[plan]}
    </span>
  );
}

type FeatureGroup = {
  title: string;
  subtitle: string;
  badge: "free" | "standard" | "premium";
  items: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
};

const featureGroups: FeatureGroup[] = [
  {
    title: "まずは無料で試せる",
    subtitle: "アカウント登録のみ、課金なしで使える機能",
    badge: "free",
    items: [
      {
        href: "/diagnose-self",
        icon: <IconShield />,
        title: "LP診断（セルフチェック版）",
        description: "副業教材LPの危険度を27項目で自動判定",
      },
      {
        href: "/assessment-self",
        icon: <IconCompass />,
        title: "適性診断（パターン判定版）",
        description: "15問の回答からあなたに向いた副業タイプを判定",
      },
    ],
  },
  {
    title: "副業を続けるための機能",
    subtitle: "Standardプラン（¥980/月）に含まれる",
    badge: "standard",
    items: [
      {
        href: "/diagnose",
        icon: <IconShield />,
        title: "LP診断（AI対話版）",
        description: "AIとの対話で副業教材の危険度を詳細診断（月10回）",
      },
      {
        href: "/chat",
        icon: <IconMessage />,
        title: "AI相談",
        description: "副業の悩みを24時間チャット（Std月10/Prm月25）",
      },
      {
        href: "/diary",
        icon: <IconBook />,
        title: "副業日記",
        description: "売上・経費・時間を記録。時給換算を自動計算",
      },
      {
        href: "/report",
        icon: <IconChart />,
        title: "数字まるわかりレポート",
        description: "日記データをAIが分析、改善ポイントをレポート",
      },
      {
        href: "/assessment",
        icon: <IconCompass />,
        title: "適性診断（AI診断版）",
        description: "AIが向いてる副業TOP3を理由付きで提案（月5回）",
      },
      {
        href: "/alerts",
        icon: <IconAlert />,
        title: "詐欺アラート",
        description: "副業詐欺の典型パターンと注意ポイントをまとめて掲載（随時更新）",
      },
    ],
  },
  {
    title: "本業化を目指す人のための機能",
    subtitle: "Premiumプラン（¥1,980/月）だけの専属サポート",
    badge: "premium",
    items: [
      {
        href: "/roadmap",
        icon: <IconRoute />,
        title: "AI副業ロードマップ",
        description: "3ヶ月／半年／1年の段階的プランをAIが設計",
      },
      {
        href: "/support",
        icon: <IconFile />,
        title: "AI実務サポート",
        description: "商品説明・メール・SNS投稿などをAIが作成",
      },
      {
        href: "/emergency",
        icon: <IconLifebuoy />,
        title: "緊急時テンプレ生成",
        description: "返金交渉・クレーム対応などの文面をAIが作成",
      },
    ],
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

      {/* Features grouped by plan */}
      <section className="px-6 py-16 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
            副業ライフサイクル、まるごと伴走
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            9つの機能で、始める前から本業化まで段階的にサポート
          </p>

          {featureGroups.map((group, gIdx) => (
            <div key={group.title} className={gIdx > 0 ? "mt-12" : ""}>
              {/* グループヘッダー */}
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {group.title}
                </h3>
                <PlanBadge plan={group.badge} />
              </div>
              <p className="text-xs text-gray-500 mb-5">{group.subtitle}</p>

              {/* グループ内のカード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.items.map((feature) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-0.5">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-16">
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
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 flex-wrap">
            <Link
              href="/blog"
              className="hover:text-emerald-600 transition-colors"
            >
              お役立ち記事
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/help"
              className="hover:text-emerald-600 transition-colors"
            >
              よくある質問
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              href="/contact"
              className="hover:text-emerald-600 transition-colors"
            >
              お問い合わせ
            </Link>
            <span className="text-gray-300">/</span>
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
