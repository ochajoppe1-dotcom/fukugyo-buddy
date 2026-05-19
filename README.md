# 🤝 副業バディAI

あなたの副業を、AIが伴走します。

副業詐欺被害者本人が運営する、AI完結の副業安全パートナー。

## コンセプト

副業ライフサイクル全体（始める前→実践中→困った時→撤退）をAIが伴走するPWA/Androidアプリ。

## 機能

| 機能 | 説明 |
|---|---|
| 🛡 **LP診断** | 副業教材LPの危険度をAIが判定 |
| 💬 **AI相談** | 副業の悩みを24時間チャット相談 |
| 📔 **副業日記** | 売上・経費・時間を記録、AIが進捗分析 |
| 🧭 **適性診断** | あなたに向いてる副業をAIが提案 |
| 📨 **詐欺アラート** | 新しい詐欺手口を週1配信 |
| 📋 **緊急時テンプレ** | 返金交渉メール等をAI自動生成 |

## 料金プラン（税込）

- **Free**：0円（LP診断・AI相談 各月3回）
- **Standard**：月550円（LP診断無制限、AI相談月20回、日記、アラート）
- **Premium**：月990円（全機能無制限、進捗AI分析、緊急時テンプレ）
- 課金プランは初回7日間無料

## 技術構成

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- PWA → Capacitor で Android APP化
- Claude API（Anthropic）
- Supabase（認証・DB）
- Stripe（課金）
- Vercel デプロイ

## 開発状況

- [x] プロジェクト初期化
- [x] トップページ・4機能ページ枠
- [x] PWA manifest
- [ ] AIチャット実装（Claude API）
- [ ] LP診断ロジック移植
- [ ] 副業日記
- [ ] Supabase 認証
- [ ] Stripe 課金
- [ ] Capacitor Android化
- [ ] Google Play 申請

## 哲学

> 価値あるものを、安く、誠実に。

副業詐欺被害者本人が、同じ被害を生まないために作った。

## ライセンス

MIT License

---

Built with ❤️ by REHL / Takashi Yamaguchi
