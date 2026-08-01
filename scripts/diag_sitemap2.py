# -*- coding: utf-8 -*-
r"""サイトマップ「取得できませんでした」の深掘り診断。

■ 疑うもの
  1. 応答が遅い（サーバーレスのコールドスタート）→ Google側がタイムアウト
  2. x-robots-tag: noindex などのヘッダ
  3. リダイレクト
  4. Vercel のボット保護／認証ゲート（x-vercel-* ヘッダに痕跡が出る）
  5. XMLの中身が壊れている（パースできない）
"""
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

SITE = "https://fukugyo-buddy.vercel.app"
GBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"


def probe(url, ua=GBOT, tries=3):
    print(f"===== {url} =====")
    for i in range(1, tries + 1):
        req = urllib.request.Request(url, headers={"User-Agent": ua})
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read()
                ms = int((time.time() - t0) * 1000)
                print(f"  [{i}] {r.status}  {ms}ms  {len(body)}バイト  最終URL={r.geturl()}")
                if i == 1:
                    for k, v in r.headers.items():
                        if k.lower().startswith(("x-vercel", "x-robots", "cache-control",
                                                 "content-type", "content-encoding",
                                                 "age", "server", "x-matched-path")):
                            print(f"      {k}: {v}")
                return body
        except urllib.error.HTTPError as e:
            print(f"  [{i}] HTTP {e.code}  {int((time.time()-t0)*1000)}ms")
        except Exception as e:
            print(f"  [{i}] 失敗 {int((time.time()-t0)*1000)}ms  {e}")
    return None


def main():
    body = probe(SITE + "/sitemap.xml")
    print()
    if body:
        print("===== XMLとして読めるか =====")
        try:
            root = ET.fromstring(body)
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            locs = root.findall(".//s:loc", ns)
            print(f"  ✅ パース成功 / ルート要素={root.tag.split('}')[-1]} / URL数={len(locs)}")
            bad = [l.text for l in locs if not (l.text or "").startswith(SITE)]
            print(f"  プロパティ外のURL: {bad[:3] if bad else 'なし'}")
            print(f"  先頭3件: {[l.text for l in locs[:3]]}")
        except Exception as e:
            print(f"  ❌ パース失敗: {e}")
    print()
    probe(SITE + "/robots.txt", tries=1)


if __name__ == "__main__":
    main()
