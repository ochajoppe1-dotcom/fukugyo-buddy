// 記事のカテゴリ分け
//
// ⚠️ なぜ必要か（2026-07-31 判明）
//   記事が70本あるのに一覧が「1列に70件」で、探しようがなかった。
//   読者は目的の記事にたどり着けず、Googleから見ても話題のまとまりが伝わらない。
//
// ⚠️ posts.ts には category 欄が無い。70件を書き換えるのはリスクが高いので、
//   ここで slug → カテゴリ の対応表を持つ。記事を足したらここにも1行足す。
//   対応表に無い slug は「その他」に入るので、書き忘れても表示は壊れない。

import { POSTS, type BlogPost } from "./posts";

export type CategoryId =
  | "start"
  | "jobs"
  | "money"
  | "safety"
  | "person";

export const CATEGORIES: { id: CategoryId; label: string; note: string }[] = [
  { id: "start", label: "始め方・続け方", note: "最初の一歩と、続けるための考え方" },
  { id: "jobs", label: "副業の種類", note: "どんな仕事があるのか、稼げるのか" },
  { id: "money", label: "お金・税金・契約", note: "確定申告、報酬、請求書のこと" },
  { id: "safety", label: "詐欺・トラブル対策", note: "危ない話の見分け方と、困ったときの対処" },
  { id: "person", label: "働き方・立場別", note: "主婦、シニア、会社員など状況ごとの話" },
];

const MAP: Record<string, CategoryId> = {
  // 始め方・続け方
  "how-to-start-side-job": "start",
  "first-3-months-side-job": "start",
  "side-job-without-skills": "start",
  "side-job-time-management": "start",
  "why-side-jobs-dont-last": "start",
  "when-to-quit-side-job": "start",
  "family-opposes-side-job": "start",
  "side-job-burnout-and-rest": "start",
  "earn-10000-yen-side-job": "start",
  "choose-side-job-by-type": "start",
  "side-job-portfolio-how-to-make": "start",
  "win-your-first-client": "start",
  "freelance-vs-side-job": "start",

  // 副業の種類
  "data-entry-side-job": "jobs",
  "skill-market-side-job": "jobs",
  "video-editing-side-job": "jobs",
  "survey-monitor-side-job": "jobs",
  "web-writer-side-job-start": "jobs",
  "side-job-blog-affiliate-reality": "jobs",
  "spot-work-side-job": "jobs",
  "crowdsourcing-side-job": "jobs",
  "ai-side-job-reality": "jobs",
  "sedori-reselling-reality": "jobs",
  "is-poikatsu-worth-it": "jobs",
  "delivery-side-job": "jobs",
  "handmade-side-job": "jobs",
  "programming-side-job": "jobs",
  "online-assistant-side-job": "jobs",
  "stock-photo-side-job": "jobs",
  "translation-side-job": "jobs",
  "sns-management-side-job": "jobs",
  "transcription-side-job": "jobs",
  "sell-unused-items-side-job": "jobs",
  "mystery-shopper-side-job": "jobs",
  "home-call-center-side-job": "jobs",
  "online-tutor-side-job": "jobs",
  "line-stamp-side-job": "jobs",
  "kindle-publishing-side-job": "jobs",
  "illustration-side-job": "jobs",
  "music-bgm-side-job": "jobs",
  "car-side-job": "jobs",

  // お金・税金・契約
  "invoice-system-and-side-jobs": "money",
  "side-job-social-insurance": "money",
  "white-vs-blue-tax-return": "money",
  "side-job-bank-account-separation": "money",
  "side-job-dependents-income-limit": "money",
  "side-job-tax-not-filing-risk": "money",
  "how-to-file-side-job-tax": "money",
  "side-job-expenses": "money",
  "what-to-do-with-side-income": "money",
  "side-job-business-registration": "money",
  "side-job-resident-tax": "money",
  "side-job-tax-basics": "money",
  "revenue-vs-profit": "money",
  "side-job-pricing-and-raising-rates": "money",
  "side-job-contract-basics": "money",
  "side-job-invoice-how-to-write": "money",
  "side-job-unpaid-payment": "money",

  // 詐欺・トラブル対策
  "lp-check-27-points": "safety",
  "side-job-scam-7-patterns": "safety",
  "task-scam-side-job": "safety",
  "what-to-do-side-job-scam": "safety",
  "info-product-refund": "safety",
  "side-job-scout-dm-scam": "safety",
  "subscription-trial-trap": "safety",

  // 働き方・立場別
  "company-bans-side-job": "person",
  "work-from-home-side-jobs": "person",
  "smartphone-only-side-job": "person",
  "homemaker-side-job": "person",
  "senior-side-job": "person",
};

export function categoryOf(slug: string): CategoryId {
  return MAP[slug] ?? "start";
}

/** カテゴリごとに記事をまとめて返す（公開日の新しい順） */
export function groupByCategory(): {
  id: CategoryId;
  label: string;
  note: string;
  posts: BlogPost[];
}[] {
  return CATEGORIES.map((c) => ({
    ...c,
    posts: POSTS.filter((p) => categoryOf(p.slug) === c.id).sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt)
    ),
  })).filter((c) => c.posts.length > 0);
}
