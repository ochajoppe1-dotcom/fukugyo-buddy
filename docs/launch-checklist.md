# 🚀 副業バディAI 本番リリース完全ガイド

テストモードから本番モードへの切替手順と、リリース前の最終チェックリスト。

> ⚠️ 本番モードに切り替えると **実際の課金が発生** します。
> 切替前に必ず全項目を確認してください。

---

## 📋 リリース前チェックリスト

### 機能の動作確認（テストモード中に）

- [ ] LP診断：Free/Standardで上限挙動が違うことを確認
- [ ] AI相談：セッションごとに1カウントの挙動を確認
- [ ] 副業日記：記録の追加・削除が動く
- [ ] 数字まるわかりレポート：AI生成が成功する
- [ ] 適性診断：15問で結果が出る
- [ ] 詐欺アラート：6件のアラートが表示される
- [ ] AI副業ロードマップ：3フェーズが生成される
- [ ] AI実務サポート：メイン + 別バージョン2つが返る
- [ ] 緊急時テンプレ生成：件名 + 本文が返る
- [ ] アカウントページ：プラン状態の表示
- [ ] 解約フロー：「プラン変更・解約」→ Stripeポータル → DBに反映
- [ ] 課金フロー：「7日無料で始める」→ Stripeチェックアウト → DB反映

### 法的・運営ページ

- [ ] /privacy にアクセスできる
- [ ] /terms にアクセスできる
- [ ] /tokushoho にアクセスできる
- [ ] フッターから3ページにリンクされている
- [ ] 事業者情報が正しい（副業バディAI事務局 / 山口 隆志 / fukugyo.buddy.ai@gmail.com）

### Supabase設定

- [ ] subscriptions テーブルがある
- [ ] usage_counters テーブルがある
- [ ] diary_entries テーブルがある
- [ ] 全テーブルでRLS有効
- [ ] 新規ユーザー登録時に subscriptions に自動行作成（トリガー有効）

### Vercel環境変数（テストモード時）

確認用に現状の環境変数を一覧する：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` ← **本番切替時に差し替え**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ← **本番切替時に差し替え**
- `STRIPE_PRICE_ID_STANDARD` ← **本番切替時に差し替え**
- `STRIPE_PRICE_ID_PREMIUM` ← **本番切替時に差し替え**
- `STRIPE_WEBHOOK_SECRET` ← **本番切替時に差し替え**
- `NEXT_PUBLIC_SITE_URL`

---

## 🔄 Stripe テスト → 本番 切替手順

### Step 1：Stripe本番モードに切替

1. Stripeダッシュボードを開く: https://dashboard.stripe.com
2. 左上の「個人 ▽」ドロップダウン → **「本番環境」**（or サンドボックスから外す）に切り替え
3. 画面上部の「テスト環境です」帯が消えていることを確認

### Step 2：本番モードで商品を作成

⚠️ テストモードの商品は本番モードでは使えない。**もう一度作る必要がある**。

1. **商品カタログ → +商品を追加**
2. **商品①：副業バディAI Standard**
   - 名前：`副業バディAI Standard`
   - 説明：`副業を続ける人のための、AI伴走プラン`
   - 料金体系：**継続**
   - 価格：`550` JPY
   - 請求期間：**月次**
3. **商品②：副業バディAI Premium**
   - 名前：`副業バディAI Premium`
   - 価格：`990` JPY / 月次
4. 各商品の **料金ID（price_xxx）** をコピー → メモ帳に保管

### Step 3：本番のAPIキー取得

1. 左下「**開発者**」→「**APIキー**」
2. 「**標準キー**」セクション：
   - **公開可能キー**: `pk_live_...` をコピー
   - **シークレットキー**: 「**本番キーを表示**」→ `sk_live_...` をコピー

⚠️ **シークレットキーは絶対に他人と共有しない・GitHubに上げない**

### Step 4：本番モードでWebhookを設定

1. 開発者 → **Webhook** → **+ エンドポイントを追加**
2. エンドポイントURL：
   ```
   https://fukugyo-buddy.vercel.app/api/stripe/webhook
   ```
3. リッスンするイベント（4つチェック）：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 作成後、**署名シークレット**（`whsec_xxx`）をコピー

### Step 5：Vercelの環境変数を本番値に差し替え

👉 https://vercel.com/ochajoppe1-dotcoms-projects/fukugyo-buddy/settings/environment-variables

以下5つを更新（既存の値を編集 or 削除して新規作成）：

| Key | 値 |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...`（Step 3） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...`（Step 3） |
| `STRIPE_PRICE_ID_STANDARD` | 本番のStandard料金ID（Step 2） |
| `STRIPE_PRICE_ID_PREMIUM` | 本番のPremium料金ID（Step 2） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...`（Step 4） |

### Step 6：Vercelを再デプロイ

Vercel → Deployments → 最新の「⋯」→ **Redeploy**  
（環境変数の変更は再デプロイで反映される）

---

## ✅ 本番切替後の確認

### 動作テスト（実際に課金が走るので慎重に）

1. 副業バディAIにログイン
2. 料金プランで **Standard 7日無料で始める** をクリック
3. Stripe Checkoutに飛ぶ → カード情報入力
   - ⚠️ **必ず自分の本物のカードで**（テスト用 `4242 4242 4242 4242` は本番モードでは使えない）
4. 7日間トライアル中であることを確認（実際の課金は7日後）
5. アカウントページで「Standard / 無料トライアル中」表示を確認
6. Supabase usage_counters / subscriptions テーブルにレコードを確認
7. **すぐ「プラン変更・解約」から解約予約**（7日後の課金を回避）

### 切替後の継続監視

- Vercel Logs → 課金エラーや Webhook 失敗が無いか
- Stripe Dashboard → Webhookが200 OKで届いてるか
- Supabase → subscriptions / usage_counters が正常に更新されているか

---

## 🌐 公開前にやっておきたいこと（任意）

### A. 独自ドメイン取得（任意）
- 例：`fukugyo-buddy.com`
- 取得元：お名前.com / ムームードメイン / Cloudflare Registrar
- Vercelの Domains 画面に追加 → DNSレコード設定

→ 月数百円かかるが、信頼度UP + メールアドレスを `info@fukugyo-buddy.com` のように使える

### B. Google Search Console登録
- https://search.google.com/search-console/welcome
- サイト追加 → DNS / HTMLタグで所有権確認
- サイトマップ送信：`https://fukugyo-buddy.vercel.app/sitemap.xml`
  （未実装なら後追いでOK）

### C. PWAのアイコン・スプラッシュ画像最終確認
- `/public/icons/icon-192.svg` `/public/icons/icon-512.svg` が現状あり
- スマホで「ホームに追加」して見え方を確認

### D. Supabase メール認証の設定
- Supabase → Authentication → Email Templates
- 確認メール・パスワードリセットメールの文面をブランド色に
- メール送信元アドレスをカスタマイズしたい場合はSMTP設定

---

## 📱 Phase 6：Android APP化（後日）

Capacitorで `fukugyo-buddy.vercel.app` をAndroidアプリ化する。  
詳細手順は別途 `docs/android-build-guide.md` 参照（作成予定）。

主な流れ：
1. `npm install @capacitor/core @capacitor/cli @capacitor/android`
2. `npx cap init`
3. `capacitor.config.ts` で server.url を本番URLに
4. `npx cap add android`
5. Android Studioで開く → APK生成
6. Google Play Console（$25）で配信

---

## 🆘 トラブル対応

### 課金が走らない
1. Stripe Dashboard → Webhookのログを確認（200か500か）
2. Vercel Logs → `/api/stripe/webhook` のエラー
3. Supabase subscriptions テーブル → 行があるか

### Webhookが失敗する
1. `STRIPE_WEBHOOK_SECRET` が正しいか（テスト用と本番用は別）
2. `SUPABASE_SERVICE_ROLE_KEY` が正しいか
3. Vercel 再デプロイされているか

### ユーザーが「解約したのに反映されない」
1. アカウントページで `cancel_at` が表示されているか
2. されていなければ Stripe ポータルでの操作が完了していない可能性
3. Webhookログで `customer.subscription.updated` が届いているか

---

## 📊 リリース後の指標トラッキング（推奨）

最初の30日で見るべき指標：

| 指標 | 目標（保守的） |
|---|---|
| 新規登録数 | 10〜50人 |
| Free → Standard アップグレード率 | 1〜3% |
| Standard → Premium アップグレード率 | 5〜10% |
| 月間アクティブ機能利用者 | 登録数の30%以上 |
| サブスク継続率（1ヶ月後） | 60%以上 |

→ 集客戦略によって大きく変動。Kindle/X連携凍結中の現状では低めの数字でも順当。

---

## ✍ 編集履歴

- 2026-05-26：初版作成（Phase 5完了時点）
