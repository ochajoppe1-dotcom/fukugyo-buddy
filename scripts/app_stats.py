# -*- coding: utf-8 -*-
r"""副業バディAI アプリの登録者数・利用データを集計する。

■ なぜ（2026-08-31 やまちゃん「副業バディのショートじゃなくてアプリの登録者や
  内容データを検証してもらいたい」）
  これまでYouTube側（ショートの再生数・登録者）しか見ておらず、
  肝心の**アプリ本体に誰が登録し、何を使っているか**を一度も集計していなかった。

■ 鍵について（安全のため）
  ⚠️ クロちゃんはチャットで鍵を受け取らない。**.env.local に直接書いてもらう。**
  リポジトリの .env.local は .gitignore 済みで、書いても外には出ない。

  .env.local に以下を追記する（無ければ作る）:
      SUPABASE_SERVICE_ROLE_KEY=eyJ....
      （Supabaseダッシュボード → Project Settings → API → service_role key）

  NEXT_PUBLIC_SUPABASE_URL は既存の値をそのまま使う（無ければ同じ画面のProject URL）。

■ 使い方
    py scripts\app_stats.py

■ 見るもの
  1. 登録ユーザー総数（auth.users）
  2. プラン別内訳（free / standard / premium）と有効契約数
  3. 機能ごとの利用回数（今月・先月）：lp_diagnose / assessment / ai_chat など
  4. 副業日記（diary_entries）に書いた人数・件数
  5. AI相談セッション数（chat_conversations）
"""
import collections
import datetime
import io
import json
import os
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def load_env_local():
    env = {}
    p = os.path.join(ROOT, ".env.local")
    if not os.path.exists(p):
        return env
    for line in io.open(p, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()
    return env


ENV = {**load_env_local(), **os.environ}
URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL", "https://pfnvchuehtobwpcehtrh.supabase.co").rstrip("/")
KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY")

if not KEY:
    raise SystemExit(
        "SUPABASE_SERVICE_ROLE_KEY が無いっす。\n"
        f"{ROOT}\\.env.local に SUPABASE_SERVICE_ROLE_KEY=... を1行追記してから、"
        "もう一度実行してほしいっす。\n"
        "（Supabaseダッシュボード → Project Settings → API → service_role key）"
    )


def req(path, headers=None):
    h = {
        "apikey": KEY,
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
        **(headers or {}),
    }
    r = urllib.request.Request(URL + path, headers=h)
    with urllib.request.urlopen(r, timeout=25) as resp:
        return resp.status, resp.read().decode("utf-8"), resp.headers


def count(table, params=""):
    """Prefer: count=exact, Range 0-0 で件数だけ取る（本体データは取らない）"""
    status, body, headers = req(
        f"/rest/v1/{table}?select=*{('&' + params) if params else ''}",
        headers={"Range": "0-0", "Prefer": "count=exact"},
    )
    cr = headers.get("Content-Range", "")
    # 形式: "0-0/123"
    if "/" in cr:
        total = cr.split("/")[-1]
        if total.isdigit():
            return int(total)
    return None


def fetch_all(table, params=""):
    status, body, _ = req(f"/rest/v1/{table}?select=*{('&' + params) if params else ''}")
    return json.loads(body)


def main():
    print(f"対象: {URL}")
    print(f"実行時刻: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print()

    # ① 登録ユーザー総数（Auth Admin API。service_roleのみ叩ける）
    print("=== ① 登録ユーザー総数 ===")
    try:
        status, body, headers = req("/auth/v1/admin/users?per_page=1&page=1")
        data = json.loads(body)
        total_users = data.get("total") or data.get("aud")  # APIバージョンにより形が違う
        # 一部バージョンはtotalを返さないので、ページングして数える保険
        if not isinstance(total_users, int):
            n, page = 0, 1
            while True:
                _, b, _ = req(f"/auth/v1/admin/users?per_page=1000&page={page}")
                users = json.loads(b).get("users", [])
                n += len(users)
                if len(users) < 1000:
                    break
                page += 1
            total_users = n
        print(f"  総登録者数: {total_users} 人")
    except Exception as e:
        print(f"  ⚠️ 取得エラー: {e}")

    # ② プラン別内訳
    print("\n=== ② プラン別内訳（subscriptions） ===")
    subs = fetch_all("subscriptions", "select=plan,status")
    by_plan = collections.Counter((s["plan"], s["status"]) for s in subs)
    if not subs:
        print("  0件（有料契約なし）")
    for (plan, status), n in sorted(by_plan.items()):
        print(f"  {plan:10s} / {status:10s} : {n}人")
    active = sum(n for (p, s), n in by_plan.items() if s in ("active", "trialing"))
    print(f"  → 有効課金者 合計: {active}人")

    # ③ 機能ごとの利用回数（今月・先月）
    print("\n=== ③ 機能ごとの利用回数（usage_counters） ===")
    now = datetime.date.today()
    this_month = now.strftime("%Y-%m")
    last_month = (now.replace(day=1) - datetime.timedelta(days=1)).strftime("%Y-%m")
    for mk in (last_month, this_month):
        rows = fetch_all("usage_counters", f"month_key=eq.{mk}")
        by_feature = collections.Counter()
        users_by_feature = collections.defaultdict(set)
        for r in rows:
            by_feature[r["feature"]] += r["count"]
            users_by_feature[r["feature"]].add(r["user_id"])
        print(f"  --- {mk} ---")
        if not rows:
            print("    利用ログなし")
        for feat, total in sorted(by_feature.items(), key=lambda x: -x[1]):
            print(f"    {feat:14s} : 延べ{total:4d}回 / {len(users_by_feature[feat])}人")

    # ④ 副業日記
    print("\n=== ④ 副業日記（diary_entries） ===")
    diary = fetch_all("diary_entries", "select=user_id,created_at")
    diary_users = set(d["user_id"] for d in diary)
    print(f"  総投稿数: {len(diary)}件 / 書いた人: {len(diary_users)}人")

    # ⑤ AI相談セッション
    print("\n=== ⑤ AI相談セッション（chat_conversations） ===")
    conv = fetch_all("chat_conversations", "select=user_id,message_count")
    conv_users = set(c["user_id"] for c in conv)
    total_msgs = sum(c["message_count"] for c in conv)
    print(f"  セッション数: {len(conv)} / 利用した人: {len(conv_users)}人 / 延べメッセージ: {total_msgs}")


if __name__ == "__main__":
    main()
