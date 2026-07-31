import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "../posts";
import { getRelated } from "../related";
import AppInstallBanner from "../../components/AppInstallBanner";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "記事が見つかりません" };
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://fukugyo-buddy.vercel.app";
  const ogImage = `${siteUrl}/og/blog.png`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      // ⚠️ PNGで指定する（SVGはSNSがOGP画像として読まない）
      images: [
        { url: ogImage, width: 1200, height: 630, alt: post.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelated(post.slug, 4);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://fukugyo-buddy.vercel.app";

  // 構造化データ。Google に「これは記事である」と伝える。
  // ⚠️ 2026-07-31 まで入っていなかった（検索での見え方が弱くなる）。
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        inLanguage: "ja",
        mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
        image: `${siteUrl}/og/blog.png`,
        author: { "@type": "Organization", name: "副業バディAI" },
        publisher: {
          "@type": "Organization",
          name: "副業バディAI",
          url: siteUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: "記事一覧",
            item: `${siteUrl}/blog`,
          },
          { "@type": "ListItem", position: 3, name: post.title },
        ],
      },
    ],
  };

  return (
    <main className="flex-1 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/blog"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 記事一覧
          </Link>
        </div>
      </header>

      <section className="flex-1">
        <article className="max-w-2xl mx-auto px-6 py-8">
          {/* タイトル */}
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
            <span>{post.publishedAt}</span>
            <span>·</span>
            <span>約{post.readMinutes}分</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-relaxed mb-5">
            {post.title}
          </h1>

          {/* リード */}
          <p className="text-sm text-gray-700 leading-relaxed mb-8 bg-gray-50 rounded-2xl p-4">
            {post.lead}
          </p>

          {/* 本文 */}
          <div className="space-y-8">
            {post.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {section.heading}
                </h2>
                {section.body.map((para, j) => (
                  <p
                    key={j}
                    className="text-sm text-gray-700 leading-relaxed mb-3"
                  >
                    {para}
                  </p>
                ))}
                {section.list && (
                  <ul className="space-y-1.5 mt-2 bg-white rounded-2xl border border-gray-100 p-4">
                    {section.list.map((item, k) => (
                      <li
                        key={k}
                        className="text-sm text-gray-700 leading-relaxed flex gap-2"
                      >
                        <span className="text-emerald-500 flex-shrink-0">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mt-10 text-center">
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {post.cta.text}
            </p>
            <Link
              href={post.cta.href}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              {post.cta.label}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 記事を読み終えた人をアプリへ送る（Web閲覧時のみ表示） */}
          <AppInstallBanner source="blog" className="mt-4" />

          {/* 関連記事：読者の回遊とSEOの両方に効く。
              ⚠️ 2026-07-31まで記事同士のリンクが1本も無く、70本が孤立していた。 */}
          {related.length > 0 && (
            <nav aria-label="関連記事" className="mt-10">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                あわせて読みたい
              </h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
                    >
                      <span className="block text-sm font-medium text-gray-900 leading-relaxed">
                        {r.title}
                      </span>
                      <span className="block text-xs text-gray-500 leading-relaxed mt-1">
                        {r.description.slice(0, 70)}…
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* 免責 */}
          <p className="text-xs text-gray-400 leading-relaxed mt-8">
            ※ 本記事は一般的な情報提供を目的としたものであり、特定の商品・サービスを評価・推奨するものではありません。最終的な判断はご自身の責任で行ってください。
          </p>
        </article>
      </section>
    </main>
  );
}
