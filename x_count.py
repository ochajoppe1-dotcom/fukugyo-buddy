# -*- coding: utf-8 -*-
"""X(旧Twitter)の投稿文字数を数える。無料アカウントの上限は280。

Xの数え方（twitter-text の weighted length）:
  ・半角英数・記号・改行 = 1
  ・日本語/中国語/韓国語などCJK = 2
  ・URL は実際の長さに関係なく一律 23（t.co短縮されるため）

使い方:
    py x_count.py "投稿文"
    py x_count.py --file post.txt
"""
import sys, re, io

LIMIT = 280
URL_WEIGHT = 23
URL_RE = re.compile(r"https?://\S+")

# CJK・全角の範囲（ざっくりだが実用上これで足りる）
def weight(ch):
    o = ord(ch)
    if (0x1100 <= o <= 0x11FF or 0x2E80 <= o <= 0xA4CF or 0xAC00 <= o <= 0xD7A3
            or 0xF900 <= o <= 0xFAFF or 0xFE30 <= o <= 0xFE4F
            or 0xFF00 <= o <= 0xFF60 or 0xFFE0 <= o <= 0xFFE6
            or 0x20000 <= o <= 0x3FFFD):
        return 2
    return 1


def count(text):
    urls = URL_RE.findall(text)
    body = URL_RE.sub("", text)
    return sum(weight(c) for c in body) + len(urls) * URL_WEIGHT, len(urls)


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--file":
        text = io.open(sys.argv[2], encoding="utf-8").read()
    elif len(sys.argv) > 1:
        text = sys.argv[1]
    else:
        text = sys.stdin.read()

    n, urls = count(text)
    rest = LIMIT - n
    mark = "OK" if rest >= 0 else "⚠ 超過"
    print(f"{mark}  {n} / {LIMIT}  （残り {rest}） URL {urls}本")
    if rest < 0:
        # 日本語1文字=2なので、削るべき文字数の目安を出す
        print(f"→ 日本語で約 {(-rest + 1) // 2} 文字ぶん削る必要あり")
