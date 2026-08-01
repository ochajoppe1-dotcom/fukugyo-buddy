# -*- coding: utf-8 -*-
r"""サイトマップがGoogleから取得できない原因を切り分ける。

■ なぜ（2026-07-31）
  Search Console で /sitemap.xml が「取得できませんでした」／検出ページ数0。
  こちらから普通に取ると200で返るので、**Googlebot に対してだけ**
  何かが起きている可能性を疑って切り分ける。

■ 見るところ
  - 通常UA と Googlebot UA で応答が変わらないか（Vercelのボット保護など）
  - Content-Type が XML になっているか（text/html だとGoogleが弾く）
  - リダイレクトされていないか
  - robots.txt が sitemap を正しく指しているか
"""
import urllib.request
import urllib.error

SITE = "https://fukugyo-buddy.vercel.app"

UAS = {
    "通常ブラウザ": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "UAなし": "",
}


def probe(url, ua):
    headers = {"User-Agent": ua} if ua else {}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            body = r.read()
            return {
                "status": r.status,
                "ctype": r.headers.get("Content-Type", "-"),
                "len": len(body),
                "head": body[:90].decode("utf-8", "ignore").replace("\n", " "),
                "final": r.geturl(),
            }
    except urllib.error.HTTPError as e:
        return {"status": e.code, "ctype": e.headers.get("Content-Type", "-"),
                "len": 0, "head": "(HTTPError)", "final": url}
    except Exception as e:
        return {"status": 0, "ctype": "-", "len": 0, "head": str(e)[:70], "final": url}


def main():
    for path in ("/sitemap.xml", "/robots.txt"):
        print(f"===== {path} =====")
        for label, ua in UAS.items():
            r = probe(SITE + path, ua)
            print(f"  {label:<14} {r['status']}  {r['ctype']}")
            print(f"    長さ{r['len']}  先頭: {r['head'][:70]}")
            if r["final"] != SITE + path:
                print(f"    ⚠️ リダイレクト先: {r['final']}")
        print()

    print("===== 記事ページ（Googlebot視点）=====")
    for p in ("/", "/blog", "/blog/side-job-burnout-and-rest"):
        r = probe(SITE + p, UAS["Googlebot"])
        print(f"  {p:<34} {r['status']}  {r['ctype'][:30]}  長さ{r['len']}")


if __name__ == "__main__":
    main()
