# 副業バディAI

> あなたの副業を、AIが伴走します。

副業ライフサイクル全体（始める前 → 実践中 → 困った時 → 撤退）を、AI完結でサポートする Webアプリ + Android アプリ。

🌐 **本番URL**: https://fukugyo-buddy.vercel.app

---

## 機能一覧

### 🆓 Free プラン
| 機能 | URL | 上限 |
|---|---|---|
| LP診断 | `/diagnose` | 月3回 |
| AI相談 | `/chat` | 月3回 |

### 💚 Standard プラン（¥550/月）
Free に加えて：
| 機能 | URL | 上限 |
|---|---|---|
| LP診断 | `/diagnose` | 無制限 |
| AI相談 | `/chat` | 月20回 |
| 適性診断 | `/assessment` | 無制限 |
| 副業日記 | `/diary` | 無制限 |
| 数字まるわかりレポート | `/report` | 月1回 |
| 詐欺アラート | `/alerts` | 閲覧自由 |

### 🟧 Premium プラン（¥990/月）
Standard に加えて：
| 機能 | URL | 上限 |
|---|---|---|
| AI相談 | `/chat` | 無制限 |
| 数字まるわかりレポート | `/report` | 月4回 |
| AI副業ロードマップ | `/roadmap` | 月2回 |
| AI実務サポート | `/support` | 月30回 |
| 緊急時テンプレ生成 | `/emergency` | 月20回 |

---

## 技術スタック

| レイヤー | 採用技術 |
|---|---|
| フロント | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| AI | Claude Sonnet 4.5 (Anthropic API) |
| 認証 | Supabase Auth |
| DB | Supabase Postgres + RLS |
| 課金 | Stripe Checkout + Customer Portal + Webhook |
| デプロイ | Vercel |
| モバイル | Capacitor (WebView ラッパー方式) |

---

## ディレクトリ構成

```
src/
├ app/
│ ├ page.tsx              トップ（料金プラン・機能カード）
│ ├ layout.tsx            ルート（フォント・metadata・PWA設定）
│ ├ sitemap.ts            SEO sitemap
│ ├ robots.ts             SEO robots.txt
│ ├ login/                ログイン・新規登録
│ ├ account/              マイページ（プラン状態・解約）
│ ├ diagnose/             LP診断（チャット形式）
│ ├ chat/                 AI相談
│ ├ diary/                副業日記
│ ├ assessment/           15問適性診断
│ ├ report/               数字まるわかりレポート
│ ├ alerts/               詐欺アラート
│ ├ roadmap/              副業ロードマップ
│ ├ support/              AI実務サポート
│ ├ emergency/            緊急時テンプレ生成
│ ├ privacy/              プライバシーポリシー
│ ├ terms/                利用規約
│ ├ tokushoho/            特定商取引法に基づく表記
│ ├ components/           PricingCards, LegalLayout, LockedFeature, BottomNav
│ └ api/
│    ├ diagnose/          LP診断 API
│    ├ chat/              AI相談 API
│    ├ assessment/        適性診断 API
│    ├ report/            レポート生成 API
│    ├ roadmap/           ロードマップ生成 API
│    ├ support/           実務サポート API
│    ├ emergency/         緊急テンプレ API
│    └ stripe/
│       ├ checkout/        サブスク開始
│       ├ portal/          カスタマーポータル
│       └ webhook/         Stripeイベント受信
└ lib/
  ├ stripe.ts             Stripeクライアント + PLANS定義
  ├ usage.ts              プラン制限・利用回数管理
  ├ hooks/
  │  └ useSubscription.ts
  └ supabase/
     ├ client.ts          ブラウザ用 Supabase client
     └ server.ts          SSR用 Supabase client

supabase/
├ subscriptions.sql       サブスクテーブル + RLS + 新規ユーザートリガー
├ usage_counters.sql      月次利用回数カウンタ
├ add_cancel_at.sql       解約予約カラム追加
└ fix_subscriptions_constraint.sql  status制約緩和

android/                  Capacitor が生成した Android プロジェクト
docs/
├ launch-checklist.md     本番モード切替ガイド
└ android-build-guide.md  Android APP化 完全手順
```

---

## セットアップ

### 必要なもの
- Node.js 20+
- Supabase アカウント
- Stripe アカウント（テストモードでOK）
- Anthropic API キー

### 環境変数（`.env.local`）

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_STANDARD=price_xxx
STRIPE_PRICE_ID_PREMIUM=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_SITE_URL=https://fukugyo-buddy.vercel.app
```

### Supabase 初期化

`supabase/*.sql` を順番に Supabase SQL Editor で実行：

1. `subscriptions.sql`
2. `usage_counters.sql`
3. `add_cancel_at.sql`
4. `fix_subscriptions_constraint.sql`

### 起動

```bash
npm install
npm run dev      # 開発: http://localhost:3000
npm run build    # 本番ビルド
```

### Android ビルド

```bash
npm run android:sync  # web→android 同期
npm run android:open  # Android Studio で開く
```

詳細は [docs/android-build-guide.md](./docs/android-build-guide.md)

---

## 本番リリース

[docs/launch-checklist.md](./docs/launch-checklist.md) 参照。

主な流れ：
1. テストモードで全機能動作確認
2. Stripe を本番モードに切り替え（商品再作成・APIキー差替）
3. Vercel 環境変数を本番値に更新
4. Webhook 本番エンドポイント設定
5. 動作確認後 → 公開

---

## 設計方針

### AI機能の安全性
- AI はAIアシスタントとして振る舞う（人間ではない）
- 一人称で実体験を語らない
- 運営者個人情報を返答に含めない
- 税理・法律・医療の具体的助言は専門家に促す
- 収益保証・断定はしない

### プラン制限
- API 側で必ずチェック（クライアント側のチェックは UX 用）
- 月次カウンタは `month_key='YYYY-MM'` で自動リセット
- 解約後も期限内はプラン継続

### データプライバシー
- RLS で本人のみ自データにアクセス可
- service_role キーは webhook 等のサーバー処理のみで使用
- Anthropic API には学習オプトアウトの設定が前提

---

## ライセンス

Private project. 無断転載・再配布禁止。

## 運営

- 事業者：副業バディAI事務局（個人事業主）
- 運営責任者：山口 隆志
- お問い合わせ：fukugyo.buddy.ai@gmail.com
