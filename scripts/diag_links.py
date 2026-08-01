# -*- coding: utf-8 -*-
r"""Googleが辿れるリンクが、サーバーが返すHTMLに入っているかを確認する。

■ なぜ（2026-07-31）
  トップページはインデックス済みなのに /blog は「参照元ページが検出されませんでした」。
  トップに /blog へのリンクがあれば辿れるはずなので、
  **リンクがサーバー側HTMLに含まれているか**（JSで後から描いていないか）を確かめる。
  クライアント側でしか描かれないリンクは、クロールで辿られないことがある。
"""
import re
import urllib.request

SITE = "https://fukugyo-buddy.vercel.app"
GBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": GBOT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "ignore")


def links_in(html):
    """href="/..." の内部リンクを拾う（Next.jsのRSCペイロード内も含む）"""
    hrefs = set(re.findall(r'href="(/[^"#?]*)"', html))
    # Next.js の RSC ペイロード内に "href":"/blog" の形で入っている場合も拾う
    hrefs |= set(re.findall(r'\\"href\\":\\"(/[^"\\]*)\\"', html))
    hrefs |= set(re.findall(r'"href":"(/[^"]*)"', html))
    return hrefs


def main():
    for page in ("/", "/blog"):
        html = get(SITE + page)
        hrefs = links_in(html)
        blog_posts = sorted(h for h in hrefs if h.startswith("/blog/"))
        print(f"===== {page} =====")
        print(f"  HTMLの長さ: {len(html)}")
        print(f"  内部リンク総数: {len(hrefs)}")
        print(f"  /blog へのリンク: {'✅ ある' if '/blog' in hrefs else '❌ ない'}")
        print(f"  記事へのリンク: {len(blog_posts)} 本")
        if page == "/":
            main_links = sorted(h for h in hrefs if h.count("/") == 1)
            print(f"  トップから辿れる主要ページ: {main_links}")
        print()

    # noindex が付いていないか
    print("===== noindex の有無 =====")
    for page in ("/", "/blog", "/blog/side-job-burnout-and-rest"):
        html = get(SITE + page)
        has_noindex = bool(re.search(r'<meta[^>]+name="robots"[^>]+noindex', html, re.I))
        print(f"  {page:<36} {'❌ noindex あり' if has_noindex else '✅ なし'}")


if __name__ == "__main__":
    main()
