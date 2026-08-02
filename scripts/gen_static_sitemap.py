# -*- coding: utf-8 -*-
r"""public/sitemap-static.xml を作る（Googleが読めない sitemap.xml の代替ルート）。

■ なぜ（2026-08-02）
  Search Console のサイトマップ画面が **2回連続で「取得できませんでした」**
  （型:不明・最終読み込み日時が空・検出0）。一方でサーバー側は Googlebot に
  200 / application/xml / 17KB を 42〜332ms で返しており、壊れていない。
  つまり詰まっているのは Google 側の取得記録で、こちらでは直せない。

  そこで **別のパスに、Next.js の処理を一切通さない素のファイル** を置き、
  2本目のサイトマップとして送信する。public/ に置いたファイルは Vercel の
  CDN からそのまま返るので、サーバーレス関数が動く余地がない。

■ 使い方（記事を足したら毎回これを実行してから commit する）
    py scripts\gen_static_sitemap.py
"""
import io
import os
import re
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
POSTS = os.path.join(ROOT, "src", "app", "blog", "posts.ts")
OUT = os.path.join(ROOT, "public", "sitemap-static.xml")

SITE = "https://fukugyo-buddy.vercel.app"

# sitemap.ts と同じ静的ページ一覧（順番も合わせる）
STATIC_PAGES = [
    ("", 1.0, "weekly"),
    ("/login", 0.5, "monthly"),
    ("/diagnose-self", 0.95, "weekly"),
    ("/assessment-self", 0.9, "weekly"),
    ("/diagnose", 0.85, "weekly"),
    ("/chat", 0.9, "weekly"),
    ("/diary", 0.8, "weekly"),
    ("/assessment", 0.8, "weekly"),
    ("/report", 0.7, "weekly"),
    ("/alerts", 0.7, "weekly"),
    ("/roadmap", 0.7, "weekly"),
    ("/support", 0.7, "weekly"),
    ("/emergency", 0.7, "weekly"),
    ("/help", 0.5, "monthly"),
    ("/contact", 0.4, "monthly"),
    ("/reset-password", 0.3, "yearly"),
    ("/privacy", 0.3, "yearly"),
    ("/terms", 0.3, "yearly"),
    ("/tokushoho", 0.3, "yearly"),
]


def read_posts():
    """posts.ts から slug と publishedAt を出てくる順に拾う"""
    src = io.open(POSTS, encoding="utf-8").read()
    slugs = re.findall(r'^\s{4}slug:\s*"([^"]+)"', src, re.M)
    dates = re.findall(r'^\s{4}publishedAt:\s*"([^"]+)"', src, re.M)
    if len(slugs) != len(dates):
        raise SystemExit(
            f"slug {len(slugs)}件 と publishedAt {len(dates)}件 の数が合いません"
        )
    return list(zip(slugs, dates))


def main():
    posts = read_posts()
    today = date.today().isoformat()

    rows = [f"  <url><loc>{SITE}/blog</loc>"
            f"<lastmod>{today}</lastmod>"
            f"<changefreq>weekly</changefreq><priority>0.8</priority></url>"]
    for slug, published in posts:
        rows.append(
            f"  <url><loc>{SITE}/blog/{slug}</loc>"
            f"<lastmod>{published}</lastmod>"
            f"<changefreq>monthly</changefreq><priority>0.7</priority></url>"
        )
    for path, prio, freq in STATIC_PAGES:
        rows.append(
            f"  <url><loc>{SITE}{path}</loc>"
            f"<lastmod>{today}</lastmod>"
            f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        )

    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + "\n".join(rows) + "\n</urlset>\n")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(xml)
    print(f"記事 {len(posts)}件 ＋ 固定ページ {len(STATIC_PAGES)}件 ＋ /blog")
    print(f"URL合計 {len(rows)}件 -> {OUT}")


if __name__ == "__main__":
    main()
