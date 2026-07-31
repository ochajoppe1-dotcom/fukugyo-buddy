# -*- coding: utf-8 -*-
r"""副業バディAI の生存確認（本番サイト＋Supabase）。

■ なぜ（2026-07-31）
  Supabaseの無料プランは一定期間アクセスがないと自動で一時停止し、
  その間はログインも診断も動かなくなる。過去に実際に止まっている。
  「動いているつもり」で放置するのが一番まずいので、機械で確かめる。

■ 使い方
    py scripts\health_check.py

■ 判定
  - 本番の主要ページが 200 か
  - Supabase の認証(/auth/v1/settings)とDB(/rest/v1/...)が 200 か
    ※ /rest/v1/ ルートの 401 は仕様通りで異常ではない
  - anonキーは公開情報なので、本番のJSから拾って使う（環境変数不要）
"""
import re
import sys
import urllib.request
import urllib.error

SITE = "https://fukugyo-buddy.vercel.app"
SUPABASE = "https://pfnvchuehtobwpcehtrh.supabase.co"

PAGES = ["/", "/blog", "/diagnose-self", "/assessment-self", "/login",
         "/privacy", "/terms", "/tokushoho", "/account-deletion"]

UA = {"User-Agent": "Mozilla/5.0 (health-check)"}


def fetch(url, headers=None, timeout=25):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return 0, str(e)


def find_anon_key():
    """本番のJSからSupabaseのanonキー（公開情報）を拾う。"""
    _, html = fetch(SITE + "/login")
    scripts = re.findall(r'src="(/_next/static/[^"]+\.js)"', html)[:25]
    pat = re.compile(r"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+")
    for s in scripts:
        _, js = fetch(SITE + s)
        m = pat.search(js)
        if m:
            return m.group(0)
    return None


def main():
    ng = 0

    print("=== 本番サイト ===")
    for p in PAGES:
        code, _ = fetch(SITE + p)
        ok = code == 200
        ng += 0 if ok else 1
        print(f"  {'✅' if ok else '❌'} {code}  {p}")

    print("\n=== Supabase ===")
    key = find_anon_key()
    if not key:
        print("  ❌ anonキーを本番JSから取得できませんでした")
        ng += 1
    else:
        h = {"apikey": key, "Authorization": f"Bearer {key}"}
        for p, label in [("/auth/v1/settings", "認証"),
                         ("/rest/v1/subscriptions?select=id&limit=1", "DB")]:
            code, _ = fetch(SUPABASE + p, h)
            ok = code == 200
            ng += 0 if ok else 1
            print(f"  {'✅' if ok else '❌'} {code}  {label} {p}")
        print("  ※ /rest/v1/ ルートの401は仕様通り。異常ではない")

    print("\n=== SEOの土台 ===")
    for p, needle, label in [
        ("/sitemap.xml", "<loc>", "サイトマップ"),
        ("/robots.txt", "Sitemap", "robots.txt"),
        ("/", 'name="google-site-verification"', "Search Console認証タグ"),
        ("/blog/side-job-burnout-and-rest", "application/ld+json", "構造化データ"),
        ("/blog/side-job-burnout-and-rest", "関連記事", "関連記事リンク"),
    ]:
        code, body = fetch(SITE + p)
        ok = code == 200 and needle in body
        ng += 0 if ok else 1
        print(f"  {'✅' if ok else '❌'} {label}")

    print("\n" + ("✅ すべて正常" if ng == 0 else f"❌ 異常 {ng} 件"))
    sys.exit(0 if ng == 0 else 1)


if __name__ == "__main__":
    main()
