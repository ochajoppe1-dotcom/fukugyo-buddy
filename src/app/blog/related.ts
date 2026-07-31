// 関連記事を自動で選ぶ（SEO・回遊）
//
// ⚠️ なぜ必要か（2026-07-31 判明）
//   記事が70本あるのに、記事同士のリンクが1本も無かった。
//   ①読者が1本読んで離脱する ②Googleから見て孤立したページの集まりになる
//   （クロールもリンク評価も /blog 経由でしか流れない）。
//
// 選び方：キーワードの一致数が多い順。同数なら公開日が近い順。
// 外部ライブラリを使わず、posts.ts のデータだけで完結させる。

import { POSTS, type BlogPost } from "./posts";

/** 2つの記事のキーワード一致数 */
function overlap(a: BlogPost, b: BlogPost): number {
  const bag = new Set(b.keywords.map((k) => k.trim()));
  let n = 0;
  for (const k of a.keywords) if (bag.has(k.trim())) n++;

  // キーワードが完全一致しなくても、語が含まれていれば弱く加点する
  // （例：「副業 請求書 書き方」と「副業 契約」は "副業" で繋がる）
  const words = (p: BlogPost) =>
    new Set(p.keywords.flatMap((k) => k.split(/\s+/)).filter((w) => w.length >= 2));
  const wa = words(a);
  const wb = words(b);
  let w = 0;
  for (const x of wa) if (wb.has(x)) w++;

  return n * 10 + w;
}

/** slug に関連する記事を count 件返す（自分自身は除く） */
export function getRelated(slug: string, count = 4): BlogPost[] {
  const self = POSTS.find((p) => p.slug === slug);
  if (!self) return [];

  const scored = POSTS.filter((p) => p.slug !== slug).map((p) => ({
    post: p,
    score: overlap(self, p),
    // 公開日が近いほど小さい値
    gap: Math.abs(
      new Date(p.publishedAt).getTime() - new Date(self.publishedAt).getTime()
    ),
  }));

  scored.sort((a, b) => (b.score - a.score) || (a.gap - b.gap));
  return scored.slice(0, count).map((s) => s.post);
}
