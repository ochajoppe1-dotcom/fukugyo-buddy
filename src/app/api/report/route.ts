import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage } from "@/lib/usage";

const SYSTEM_PROMPT = `あなたは「副業バディAI」の数字まるわかりレポート機能（AIアシスタント）です。

【絶対のルール】
- あなたはAIです。人間ではありません。
- 一人称で実体験を語らない（「僕も」「私も」NG）
- 運営者・特定個人の職業/経歴を出力に登場させない
- 業界データ・一般的傾向として知見を活かす

【役割】
ユーザーの副業日記の集計データを受け取って、以下を分析してアドバイスする：
- 今月・累計の傾向
- 時給換算の健康度
- 改善提案
- 注意点や警告

【絶対に守ること】
1. **税理・法律の具体的助言はしない**
   - 「青色申告したほうがいい」「個人事業主登録すべき」等の判断は避ける
   - 「専門家にご相談ください」と促す程度に留める
   - 集計と一般的な傾向の説明はOK

2. **収益保証や断定は絶対NG**
   - 「来月は○○万円稼げます」みたいな予測はしない
   - 「過去の傾向から見ると」程度に抑える

3. **マイルドな表現**
   - 数字が悪くても「絶望」「終わった」「失敗」等の過激な表現は使わない
   - 「改善余地」「見直しタイミング」のような前向きな言葉で

4. **副業バディAIの他機能を自然に勧める**
   - 時給が極端に低い → LP診断や適性診断を提案
   - 経費が増えている → 数字を見直す提案

【出力形式】
必ず以下のJSON形式だけで返答してください（前後に文章を付けない）：

\`\`\`json
{
  "headline": "今月の総評（1文・最重要メッセージ）",
  "highlights": [
    "ポイント1（数字を踏まえた気づき・2文以内）",
    "ポイント2",
    "ポイント3"
  ],
  "hourlyHealth": {
    "score": "good" | "okay" | "warning",
    "comment": "時給換算についてのコメント（2文以内）"
  },
  "suggestions": [
    "次の1ヶ月での具体的なアクション提案1",
    "提案2",
    "提案3"
  ],
  "watchOuts": ["注意したい点1", "注意したい点2"]
}
\`\`\``;

type Entry = {
  entry_date: string;
  revenue: number;
  expense: number;
  work_minutes: number;
  memo?: string | null;
};

function getMonthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function computeStats(entries: Entry[]) {
  const now = new Date();
  const thisMonthKey = getMonthKey(now);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = getMonthKey(lastMonth);

  const thisMonth = entries.filter((e) => e.entry_date.startsWith(thisMonthKey));
  const lastMonthEntries = entries.filter((e) =>
    e.entry_date.startsWith(lastMonthKey)
  );

  const sum = (xs: Entry[], k: "revenue" | "expense" | "work_minutes") =>
    xs.reduce((s, e) => s + (e[k] ?? 0), 0);

  const all = {
    entries: entries.length,
    revenue: sum(entries, "revenue"),
    expense: sum(entries, "expense"),
    minutes: sum(entries, "work_minutes"),
  };
  const thisM = {
    entries: thisMonth.length,
    revenue: sum(thisMonth, "revenue"),
    expense: sum(thisMonth, "expense"),
    minutes: sum(thisMonth, "work_minutes"),
  };
  const lastM = {
    entries: lastMonthEntries.length,
    revenue: sum(lastMonthEntries, "revenue"),
    expense: sum(lastMonthEntries, "expense"),
    minutes: sum(lastMonthEntries, "work_minutes"),
  };

  const profitAll = all.revenue - all.expense;
  const profitThis = thisM.revenue - thisM.expense;
  const profitLast = lastM.revenue - lastM.expense;
  const hourlyAll = all.minutes > 0 ? (profitAll / all.minutes) * 60 : 0;
  const hourlyThis = thisM.minutes > 0 ? (profitThis / thisM.minutes) * 60 : 0;

  return {
    monthKey: thisMonthKey,
    lastMonthKey,
    totals: {
      revenue: all.revenue,
      expense: all.expense,
      profit: profitAll,
      minutes: all.minutes,
      hourly: Math.round(hourlyAll),
      entries: all.entries,
    },
    thisMonth: {
      revenue: thisM.revenue,
      expense: thisM.expense,
      profit: profitThis,
      minutes: thisM.minutes,
      hourly: Math.round(hourlyThis),
      entries: thisM.entries,
    },
    lastMonth: {
      revenue: lastM.revenue,
      expense: lastM.expense,
      profit: profitLast,
      minutes: lastM.minutes,
      entries: lastM.entries,
    },
  };
}

const DEMO_RESULT = {
  headline: "今月は前月より着実に積み上がっています。継続が一番の武器です。",
  highlights: [
    "累計時給が現実的な水準で、副業として続けやすいペースです。",
    "経費率が控えめで、利益が残る構造になっています。",
    "記録の継続が3ヶ月以上あれば、今後の収益予測がより精緻になります。",
  ],
  hourlyHealth: {
    score: "okay",
    comment:
      "時給換算は現状の作業時間に対して妥当な範囲です。スキル蓄積で次第に上昇していくことが多いカテゴリーです。",
  },
  suggestions: [
    "毎日決まった時間に5分の記録習慣をつくると、継続率が大きく上がります。",
    "経費は月一でまとめて見直すと、無駄に気づきやすくなります。",
    "副業の方向性に迷ったら、適性診断で軸を再確認するのもおすすめです。",
  ],
  watchOuts: [
    "時給が一時的に下がっても、立ち上げ期は普通です。3ヶ月で判断しましょう。",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です", redirect: "/login" },
        { status: 401 }
      );
    }

    // プラン+利用回数チェック
    const check = await checkUsage(supabase, user.id, "report");
    if (!check.allowed) {
      return NextResponse.json(
        {
          error:
            check.reason === "limit_exceeded"
              ? `今月のレポート生成は上限（${check.limit}回）に達しました。`
              : "レポートは Standard プラン以上でご利用いただけます。",
          limit_exceeded: check.reason === "limit_exceeded",
          plan_locked: check.reason === "plan_locked",
          plan: check.plan,
          used: check.used,
          limit: check.limit,
        },
        { status: 403 }
      );
    }

    // 日記データ取得
    const { data: entries } = await supabase
      .from("diary_entries")
      .select("entry_date, revenue, expense, work_minutes, memo")
      .eq("user_id", user.id) // RLSに加えて明示フィルタ（多層防御）
      .order("entry_date", { ascending: false });

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        result: {
          headline: "まだ副業日記の記録がありません。",
          highlights: [
            "副業日記に記録を始めると、月次レポートで傾向や時給換算をAIが分析します。",
          ],
          hourlyHealth: {
            score: "okay",
            comment: "記録ができたら時給換算の健康度をお伝えします。",
          },
          suggestions: [
            "まずは1日5分、売上・経費・作業時間を記録する習慣から始めましょう。",
          ],
          watchOuts: [],
        },
        stats: null,
      });
    }

    const stats = computeStats(entries as Entry[]);

    // 入力データを整形してClaudeに渡す
    const userMessage = `以下が副業日記の集計データです。これを踏まえて分析・アドバイスをJSON形式で返してください。

【今月（${stats.monthKey}）】
- 記録日数：${stats.thisMonth.entries}日
- 売上：${stats.thisMonth.revenue.toLocaleString()}円
- 経費：${stats.thisMonth.expense.toLocaleString()}円
- 利益：${stats.thisMonth.profit.toLocaleString()}円
- 作業時間：${(stats.thisMonth.minutes / 60).toFixed(1)}時間
- 時給換算：${stats.thisMonth.hourly.toLocaleString()}円/h

【先月（${stats.lastMonthKey}）】
- 記録日数：${stats.lastMonth.entries}日
- 売上：${stats.lastMonth.revenue.toLocaleString()}円
- 利益：${stats.lastMonth.profit.toLocaleString()}円

【累計】
- 記録日数：${stats.totals.entries}日
- 売上：${stats.totals.revenue.toLocaleString()}円
- 経費：${stats.totals.expense.toLocaleString()}円
- 利益：${stats.totals.profit.toLocaleString()}円
- 作業時間：${(stats.totals.minutes / 60).toFixed(1)}時間
- 時給換算：${stats.totals.hourly.toLocaleString()}円/h`;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // デモモード
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1500));
      await incrementUsage(user.id, "report");
      return NextResponse.json({ result: DEMO_RESULT, stats });
    }

    // 本番モード
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text());
      return NextResponse.json(
        { error: "レポートの生成に失敗しました" },
        { status: 500 }
      );
    }

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        await incrementUsage(user.id, "report");
        return NextResponse.json({ result: parsed, stats });
      } catch {
        return NextResponse.json(
          { error: "レポートの解析に失敗しました" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "レポートを取得できませんでした" },
      { status: 500 }
    );
  } catch (e) {
    console.error("Report API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
