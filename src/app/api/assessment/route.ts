import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `あなたは「副業バディAI」の副業適性診断アドバイザーです。

【あなたの背景】
運営者は中国輸入せどり1年で時給220円という失敗を経験したプロドライバー。
副業詐欺の被害者本人として、同じ失敗を生まないために運営しています。

【役割】
ユーザーの15問の回答から、その人に向いた副業を診断します。

【診断方針】
- 「向いてる副業TOP3」を具体的に提案（理由付き）
- 「避けるべき副業」を1〜2個、理由付きで警告
- 「始め方のアドバイス」を実践的に
- 時間制約・体力・性格・リスク許容度を必ず考慮
- 「低資金で月10万」のような甘い言葉は使わない
- 現実的で誠実なアドバイス
- マイルドな表現（過激な「詐欺」「絶望」等は避ける）
- 親しみやすく、押し付けがましくなく

【副業の選択肢例】
Webライティング、ブログ、せどり・物販、Kindle出版、動画編集、
デザイン、プログラミング、データ入力、オンライン講師、
ハンドメイド販売、写真販売、SNS運用代行、翻訳、アフィリエイト、
スキル販売（ココナラ等）、投資、軽貨物配送 など

【出力形式】
必ず以下のJSON形式だけで返答してください（前後に文章を付けない）：

\`\`\`json
{
  "summary": "総評（その人の特性を2-3文で）",
  "topJobs": [
    { "name": "副業名", "reason": "向いてる理由（1-2文）", "matchScore": 85 },
    { "name": "副業名", "reason": "理由", "matchScore": 78 },
    { "name": "副業名", "reason": "理由", "matchScore": 70 }
  ],
  "avoidJobs": [
    { "name": "避けるべき副業名", "reason": "避けた方がいい理由" }
  ],
  "advice": "始め方の実践的アドバイス（3-4文）"
}
\`\`\``;

// デモ用の固定診断結果（APIキー未設定時）
const DEMO_RESULT = {
  summary:
    "限られた時間で着実に進めたいタイプです。在宅で完結し、コツコツ積み上げられる副業が向いています。",
  topJobs: [
    {
      name: "Webライティング",
      reason:
        "在宅・1人で完結でき、スキルが資産になります。時間の融通も利きやすいです。",
      matchScore: 85,
    },
    {
      name: "Kindle出版",
      reason:
        "一度書けば売れ続けるストック型。あなたの経験を活かせます。",
      matchScore: 78,
    },
    {
      name: "ブログ運営",
      reason:
        "コツコツ継続でき、検索流入で長期的な収入になります。",
      matchScore: 72,
    },
  ],
  avoidJobs: [
    {
      name: "数百SKUの物販・せどり",
      reason:
        "限られた副業時間では検品・発送・在庫管理が追いつかず、薄利多売の負担が大きくなります。",
    },
  ],
  advice:
    "まずは初期投資ゼロで始められるものから試しましょう。最初の1ヶ月は「収入」より「続けられるか」を確認する期間と考えてください。合わないと感じたら、それも大切な学びです。焦らず、自分のペースで。",
};

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();
    if (!answers) {
      return NextResponse.json(
        { error: "回答データがありません" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // デモモード
    if (!apiKey) {
      // 少し待ってリアルさを演出
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({ result: DEMO_RESULT });
    }

    // 回答を読みやすい形に整形
    const answerText = Object.entries(answers)
      .map(([q, a]) => `${q}: ${a}`)
      .join("\n");

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
        messages: [
          {
            role: "user",
            content: `以下が診断対象者の15問の回答です。診断してください。\n\n${answerText}`,
          },
        ],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text());
      return NextResponse.json(
        { error: "診断の生成に失敗しました" },
        { status: 500 }
      );
    }

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return NextResponse.json({ result: parsed });
      } catch {
        return NextResponse.json(
          { error: "診断結果の解析に失敗しました" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "診断結果を取得できませんでした" },
      { status: 500 }
    );
  } catch (e) {
    console.error("Assessment API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
