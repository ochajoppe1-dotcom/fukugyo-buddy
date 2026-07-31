# -*- coding: utf-8 -*-
r"""記事データに紛れ込みやすい異物を検査する。

■ なぜ（2026-07-31）
  クロちゃんが書いた記事に **キリル文字（прайベート）** と
  **英単語の書き残し（year中に）** が混入していた。
  日本語の文章に他言語の文字が混ざっても型チェックでは落ちないので、機械で見る。

■ 検査
  1. キリル文字・ハングルの混入
  2. カテゴリ表に登録されていない slug（一覧で迷子になる）
  3. 必須項目の欠け
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(HERE, "src", "app", "blog", "posts.ts")
CATS = os.path.join(HERE, "src", "app", "blog", "categories.ts")

src = io.open(POSTS, encoding="utf-8").read()
cats = io.open(CATS, encoding="utf-8").read()

ng = 0

print("=== 異物の混入 ===")
for name, pat in (("キリル文字", r"[Ѐ-ӿ]"), ("ハングル", r"[가-힣]")):
    hits = []
    for m in re.finditer(pat, src):
        line = src[:m.start()].count("\n") + 1
        ctx = src[max(0, m.start() - 25):m.start() + 25].replace("\n", " ")
        hits.append(f"{line}行目: …{ctx}…")
    if hits:
        ng += len(hits)
        print(f"  ❌ {name} {len(hits)}件")
        for h in hits[:5]:
            print(f"       {h}")
    else:
        print(f"  ✅ {name}なし")

print("\n=== カテゴリ表への登録漏れ ===")
slugs = re.findall(r'slug:\s*"([^"]+)"', src)
missing = [s for s in slugs if f'"{s}"' not in cats]
if missing:
    ng += len(missing)
    print(f"  ❌ 未登録 {len(missing)}件: {missing}")
else:
    print(f"  ✅ 全{len(slugs)}記事が登録済み")

print("\n=== 必須項目 ===")
for field in ("title", "description", "keywords", "publishedAt", "lead", "sections", "cta"):
    n = len(re.findall(rf"^\s+{field}:", src, re.M))
    ok = n >= len(slugs)
    if not ok:
        ng += 1
    print(f"  {'✅' if ok else '❌'} {field}: {n} / 記事{len(slugs)}件")

print("\n" + ("✅ 問題なし" if ng == 0 else f"❌ 指摘 {ng} 件"))
sys.exit(0 if ng == 0 else 1)
