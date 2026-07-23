import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "../posts";

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

  return (
    <main className="flex-1 flex flex-col">
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

          {/* 免責 */}
          <p className="text-xs text-gray-400 leading-relaxed mt-8">
            ※ 本記事は一般的な情報提供を目的としたものであり、特定の商品・サービスを評価・推奨するものではありません。最終的な判断はご自身の責任で行ってください。
          </p>
        </article>
      </section>
    </main>
  );
}
