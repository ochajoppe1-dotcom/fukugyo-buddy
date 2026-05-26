import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage } from "@/lib/usage";

const SYSTEM_PROMPT = `あなたは「副業バディAI」のAI副業ロードマップ機能（AIアシスタント）です。

【絶対のルール】
- あなたはAIです。人間ではありません。
- 一人称で実体験を語らない（「僕も」「私も」NG）
- 運営者・特定個人の職業/経歴を出力に登場させない

【役割】
ユーザーの現在地（目標／時間／スキル／資金）から、3ヶ月／半年／1年の段階的ロードマップを設計する。

【絶対に守ること】
1. **収益保証はしない**
   - 「3ヶ月で月10万円稼げます」のような断定はNG
   - 「3ヶ月後の目安は月1〜3万円」のように幅と「目安」を必ず示す

2. **税理・法律の具体的助言はしない**

3. **やまちゃんの哲学を反映**
   - 「続けられるか」を「儲かるか」より重視
   - 派手な数字より地味な継続を讃える
   - 撤退ラインも明確に示す

4. **副業バディAIの他機能を勧める**
   - 計画進捗の確認 → 副業日記＋数字まるわかりレポート
   - 教材検討時 → LP診断
   - 困った時 → AI相談

【出力形式】
必ず以下のJSON形式だけで返答してください：

\`\`\`json
{
  "summary": "ロードマップ全体の総評（2〜3文）",
  "phase1": {
    "title": "Phase 1：最初の3ヶ月（種まき期）",
    "goal": "この期間のゴール",
    "actions": ["具体アクション1", "アクション2", "アクション3"],
    "targetIncome": "月収目安（例：月1〜3万円）",
    "checkpoints": ["継続できているか", "数字を記録できているか"]
  },
  "phase2": {
    "title": "Phase 2：4〜6ヶ月（収益化期）",
    "goal": "...",
    "actions": ["..."],
    "targetIncome": "...",
    "checkpoints": ["..."]
  },
  "phase3": {
    "title": "Phase 3：7〜12ヶ月（拡大期）",
    "goal": "...",
    "actions": ["..."],
    "targetIncome": "...",
    "checkpoints": ["..."]
  },
  "watchOuts": [
    "全体を通じて注意したい落とし穴1",
    "落とし穴2"
  ],
  "retreatLine": "ここまでで成果が出なかったら見直し or 撤退を検討する基準"
}
\`\`\``;

const DEMO_RESULT = {
  summary:
    "限られた副業時間で着実に積み上げる戦略です。最初は収益より仕組み作り、後半で収益化を意識する段階構成にしました。",
  phase1: {
    title: "Phase 1：最初の3ヶ月（種まき期）",
    goal: "毎日の作業ルーティンを定着させ、基礎スキルを身につける",
    actions: [
      "週に5日、1日30分は最低でも作業時間を確保する",
      "副業日記で売上・経費・作業時間を毎日記録する",
      "選んだ副業の基礎を1冊の本 or 無料教材で学ぶ",
    ],
    targetIncome: "月収目安：0〜1万円（収益より継続を重視）",
    checkpoints: [
      "3ヶ月で記録の継続率が80%以上か",
      "副業時間中にスマホを触らずに集中できているか",
    ],
  },
  phase2: {
    title: "Phase 2：4〜6ヶ月（収益化期）",
    goal: "最初の安定収益を作る。月1〜5万円ラインを狙う",
    actions: [
      "副業日記の数字を毎月見直し、収益性の高い作業に時間を寄せる",
      "数字まるわかりレポートで時給換算を確認する",
      "顧客・読者からのフィードバックを1つ以上集める",
    ],
    targetIncome: "月収目安：1〜5万円",
    checkpoints: [
      "時給換算が1000円を超えているか",
      "経費率が収益の30%以下に収まっているか",
    ],
  },
  phase3: {
    title: "Phase 3：7〜12ヶ月（拡大期）",
    goal: "再現性のある仕組みに育てて、月10万円ラインを目指す",
    actions: [
      "うまくいった施策を週次で振り返り、再現する",
      "外注 or ツールで時間効率を上げる検討を始める",
      "本業との両立がきつくなったら作業の取捨選択をする",
    ],
    targetIncome: "月収目安：5〜15万円",
    checkpoints: [
      "1年間で記録した日数が250日を超えているか",
      "副業時間が増えていないのに売上が伸びているか",
    ],
  },
  watchOuts: [
    "短期で大きな数字を狙う情報商材には注意。買う前にLP診断機能で必ずチェックを",
    "本業と健康を犠牲にしない。睡眠時間6時間は最低限の防衛ライン",
  ],
  retreatLine:
    "6ヶ月続けて時給換算が500円未満のままなら、副業の種類を変える検討をしましょう。固執は時間と精神の浪費になります。",
};

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();
    if (!profile) {
      return NextResponse.json(
        { error: "プロフィール情報が必要です" },
        { status: 400 }
      );
    }

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

    const check = await checkUsage(supabase, user.id, "roadmap");
    if (!check.allowed) {
      return NextResponse.json(
        {
          error:
            check.reason === "limit_exceeded"
              ? `今月の上限（${check.limit}回）に達しました。`
              : "AI副業ロードマップは Premium プランの機能です。",
          plan_locked: check.reason === "plan_locked",
          limit_exceeded: check.reason === "limit_exceeded",
          plan: check.plan,
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 2000));
      await incrementUsage(user.id, "roadmap");
      return NextResponse.json({ result: DEMO_RESULT });
    }

    const userMessage = `以下のプロフィール情報から、3ヶ月／半年／1年の副業ロードマップを設計してください。

【プロフィール】
${JSON.stringify(profile, null, 2)}

JSON形式で、3つのフェーズ + 注意点 + 撤退ラインを返してください。`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text());
      return NextResponse.json(
        { error: "ロードマップの生成に失敗しました" },
        { status: 500 }
      );
    }

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        await incrementUsage(user.id, "roadmap");
        return NextResponse.json({ result: parsed });
      } catch {
        return NextResponse.json(
          { error: "ロードマップの解析に失敗しました" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "ロードマップを取得できませんでした" },
      { status: 500 }
    );
  } catch (e) {
    console.error("Roadmap API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
