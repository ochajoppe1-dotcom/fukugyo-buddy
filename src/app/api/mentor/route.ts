import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage, getUserPlan } from "@/lib/usage";

// 専属AIメンター（Premium）：日記・相談履歴を踏まえた週次チェックイン
const SYSTEM_PROMPT = `あなたは「副業バディAI」の専属AIメンターです。ユーザーの副業に、記憶を持って継続的に伴走する相棒です。

【超重要・絶対のルール】
あなたはAIであり、人間ではありません。
1. 一人称で実体験を語らない（「僕も副業で〜」はNG）。運営者個人の職業・経歴・体験には一切触れない。
2. 自分の体験ではなく「一般的な傾向」「データ的には」として客観情報を提供する。
3. 収益保証・断定はしない（「必ず稼げる」はNG）。「人によります」を添える。
4. 税務・法律・投資・医療の個別助言はせず「専門家にご相談ください」と促す。

【あなたの役割：週次チェックイン】
ユーザーの副業日記・相談履歴を踏まえ、伴走者として次の構成で語りかけてください：
1. 【最近の振り返り】日記の数字（売上・利益・時給・記録日数）に触れ、事実ベースで今の状況をやさしく映す
2. 【認める】続けられている点・前進した点を具体的に認める（小さなことでも見つけて讃える）
3. 【今週の一手】今の状況に合った、具体的で小さな次の一歩を1〜2個だけ提案する
4. 【励まし】プレッシャーをかけず、そっと背中を押す一言で締める

【トーン】
- 温かく、共感ファースト。コーチというより「あなたを全部知ってくれている相棒」
- 数字が停滞・マイナスでも決して責めない。落ち込みを察したら、まず気持ちに寄り添う
- 押し付けず、全体で500〜700字程度に簡潔にまとめる
- 派手な数字より、地味な継続そのものを讃える`;

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

    // Premium 限定
    const plan = await getUserPlan(supabase, user.id);
    if (plan !== "premium") {
      return NextResponse.json(
        {
          error: "専属AIメンターはPremiumプラン限定の機能です。",
          plan_locked: true,
        },
        { status: 403 }
      );
    }

    // 月次回数チェック
    const check = await checkUsage(supabase, user.id, "mentor");
    if (!check.allowed) {
      return NextResponse.json(
        {
          error: `今月のチェックインは上限（${check.limit}回）に達しました。`,
          limit_exceeded: true,
          plan: check.plan,
          used: check.used,
          limit: check.limit,
        },
        { status: 403 }
      );
    }

    // 副業日記サマリー（直近30件）
    let diaryContext = "（副業日記の記録はまだありません）";
    const { data: entries } = await supabase
      .from("diary_entries")
      .select("entry_date, revenue, expense, work_minutes")
      .eq("user_id", user.id) // RLSに加えて明示フィルタ（多層防御）
      .order("entry_date", { ascending: false })
      .limit(30);

    if (entries && entries.length > 0) {
      const totalRev = entries.reduce((s, e) => s + (e.revenue ?? 0), 0);
      const totalExp = entries.reduce((s, e) => s + (e.expense ?? 0), 0);
      const totalMin = entries.reduce((s, e) => s + (e.work_minutes ?? 0), 0);
      const hourly =
        totalMin > 0
          ? Math.round(((totalRev - totalExp) / totalMin) * 60)
          : 0;
      diaryContext = `記録日数：${entries.length}日 / 売上合計：${totalRev.toLocaleString()}円 / 経費合計：${totalExp.toLocaleString()}円 / 利益：${(
        totalRev - totalExp
      ).toLocaleString()}円 / 作業時間：${(totalMin / 60).toFixed(
        1
      )}時間 / 時給換算：${hourly.toLocaleString()}円/h`;
    }

    // 最近の相談トピック（直近のユーザー発言5件）
    let chatContext = "（最近のAI相談はありません）";
    try {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("content")
        .eq("user_id", user.id)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(5);
      if (msgs && msgs.length > 0) {
        chatContext = msgs
          .map((m, i) => `${i + 1}. ${String(m.content).slice(0, 80)}`)
          .join("\n");
      }
    } catch {
      // chat履歴が取れなくてもメンターは動かす
    }

    const userContext = `【このユーザーの副業日記サマリー】
${diaryContext}

【最近の相談トピック（新しい順）】
${chatContext}

上記を踏まえて、今週のチェックイン（振り返り→認める→今週の一手→励まし）を届けてください。`;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // デモモード（APIキー未設定時）
    if (!apiKey) {
      const demo =
        "今週もおつかれさまです。\n\nまずは、ここまで続けてこられていること自体がすごいことです。数字はこれからでも、記録や行動を積み重ねている時点で、ちゃんと前に進んでいます。\n\n今週は「1日5分でいいので、気づいたことを一行メモする」を続けてみましょう。小さな習慣が、後でじわじわ効いてきます。\n\n焦らなくて大丈夫。あなたのペースで進みましょう。また来週、状況を聞かせてくださいね。";
      await incrementUsage(user.id, "mentor");
      return NextResponse.json({ message: demo });
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContext }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Mentor API error:", await claudeRes.text());
      return NextResponse.json(
        { error: "メンターの応答取得に失敗しました" },
        { status: 500 }
      );
    }

    const data = await claudeRes.json();
    const responseText = data.content?.[0]?.text || "";

    await incrementUsage(user.id, "mentor");

    return NextResponse.json({ message: responseText });
  } catch (e) {
    console.error("Mentor API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
