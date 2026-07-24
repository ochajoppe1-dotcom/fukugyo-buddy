import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "./posts";
import AppInstallBanner from "../components/AppInstallBanner";

export const metadata: Metadata = {
  title: "副業お役立ち記事｜副業バディAI",
  description:
    "副業の始め方、教材の見分け方、詐欺の防ぎ方など、副業を安全に始めて続けるためのお役立ち記事をお届けします。",
};

export default function BlogIndexPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 戻る
          </Link>
          <h1 className="font-bold text-gray-900">お役立ち記事</h1>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            副業を安全に始めて続けるための情報をお届けします。
          </p>

          <div className="space-y-4">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <span>{post.publishedAt}</span>
                  <span>·</span>
                  <span>約{post.readMinutes}分で読めます</span>
                </div>
                <h2 className="font-bold text-gray-900 leading-relaxed mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>

          <AppInstallBanner source="blog_index" className="mt-8" />
        </div>
      </section>
    </main>
  );
}
