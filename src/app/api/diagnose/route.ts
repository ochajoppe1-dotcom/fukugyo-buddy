import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage } from "@/lib/usage";

// 副業バディAI の診断システムプロンプト
const SYSTEM_PROMPT = `あなたは「副業バディAI」という、副業詐欺被害を防ぐAIアドバイザーです。

【超重要・絶対のルール】
あなたは**AIアシスタント**であり、人間ではありません。以下を絶対に守ってください：

1. **一人称で「僕」「私」を使って実体験を語らない**
   - ❌ NG例：「僕も○○の仕事をしてるので分かります」
   - ❌ NG例：「私も副業で失敗したことがあって」
   - ✅ OK例：「同じケースを多く見ています」「一般的にそのパターンは〜」

2. **運営者・特定個人の職業/経歴を返答に登場させない**
   - 「運営者は大型ドライバーで〜」「運営者は中国輸入で〜」は絶対に言わない

3. **AIとしての立場を明確にする**
   - 業界データや「よく見るパターン」として知見を提供する

【あなたの役割】
ユーザーが検討している副業教材・情報商材のLP（販売ページ）を対話形式で診断する。

【診断の流れ】
1. まず教材のURL or タイトル/販売者名を聞く
2. 価格・サポート期間・売り文句を順番に聞く（一度に全部聞かない、1-2問ずつ）
3. ユーザーの状況（副業歴・予算・時間）も軽く聞く
4. 情報が十分集まったら、診断結果を JSON 形式で返す

【危険サインの判定基準（27項目から主要）】
- 「今だけ」「限定」「誰でも」「再現性100%」等の煽り文句
- 月商と月利の混同を誘う表現
- 「低資金で始められる」を強調するが実態は別
- 数百SKU推奨、過剰な仕入れ推奨
- サポート期間が短い（1ヶ月等）
- 中国仕入れの「元表記」トリック
- 販売者の実績証明が動画・スクショのみ
- 価格帯：5,000円〜10万円は要警戒
- 30分面談・短時間相談の強要

【診断結果の出力形式】
情報が十分集まったら、必ず以下の JSON で返答してください（メッセージ本文ではなく JSON だけ）：

\`\`\`json
{
  "isResult": true,
  "riskScore": 数値（0-100）,
  "summary": "総評（2-3文）",
  "redFlags": ["危険サイン1", "危険サイン2", ...],
  "recommendation": "おすすめのアクション（2-3文）"
}
\`\`\`

【会話中の応答】
情報がまだ足りない場合は、JSON を返さず、自然な日本語で次の質問を投げてください。

【トーン】
- 親しみやすく、押し付けがましくなく
- 「○○ですか？」と質問形式
- ユーザーの状況に共感する
- 過激な表現（詐欺・絶望・地獄等）は避ける、マイルドに

それでは、ユーザーとの対話を始めてください。`;

// デモモード用の応答（APIキー未設定時）
const DEMO_RESPONSES = [
  "ありがとうございます。それでは、この教材の **価格はいくら** ですか？",
  "なるほど、価格はわかりました。次に、**サポート期間はどのくらい** ですか？（例：1ヶ月、3ヶ月、無期限など）",
  "わかりました。それでは、最後に **販売ページに「今だけ」「限定」「誰でも」のような言葉** はありますか？",
];

const DEMO_RESULT = {
  isResult: true,
  riskScore: 72,
  summary:
    "この教材は副業詐欺のパターンに当てはまる要素が複数見られます。価格帯・サポート期間・煽り文句の組み合わせから、慎重な判断をおすすめします。",
  redFlags: [
    "「今だけ」「限定」などの心理的煽り表現",
    "サポート期間が短い（1ヶ月程度）",
    "価格帯が情報商材の典型パターン（5,000-10,000円台）",
    "販売者の実績証明が画像・動画のみで第三者検証なし",
  ],
  recommendation:
    "購入は一旦保留し、販売者の実績を別ソースで確認することをおすすめします。同じテーマで失敗した人の体験談を複数読んで、冷静に判断する時間を取りましょう。",
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "メッセージが正しくありません" },
        { status: 400 }
      );
    }

    // ログインユーザー取得
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

    // 月次利用回数チェック（Free=3回まで、Standard+=無制限）
    const check = await checkUsage(supabase, user.id, "lp_diagnose");
    if (!check.allowed) {
      return NextResponse.json(
        {
          error:
            check.reason === "limit_exceeded"
              ? `今月のLP診断は上限（${check.limit}回）に達しました。プランをアップグレードしてください。`
              : "このプランではLP診断をご利用いただけません。",
          limit_exceeded: true,
          plan: check.plan,
          used: check.used,
          limit: check.limit,
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // === デモモード（APIキー未設定時） ===
    if (!apiKey) {
      const userMessageCount = messages.filter(
        (m: { role: string }) => m.role === "user"
      ).length;

      // 3回までは追加質問、4回目で結果
      if (userMessageCount < 4) {
        return NextResponse.json({
          message:
            DEMO_RESPONSES[userMessageCount - 1] ||
            DEMO_RESPONSES[DEMO_RESPONSES.length - 1],
        });
      } else {
        // 結果生成時に1回消費
        await incrementUsage(user.id, "lp_diagnose");
        return NextResponse.json({
          result: DEMO_RESULT,
        });
      }
    }

    // === 本番モード（Claude API） ===
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
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!claudeRes.ok) {
      const errorText = await claudeRes.text();
      console.error("Claude API error:", errorText);
      return NextResponse.json(
        { error: "AI応答の取得に失敗しました" },
        { status: 500 }
      );
    }

    const claudeData = await claudeRes.json();
    const responseText = claudeData.content?.[0]?.text || "";

    // JSON 形式の診断結果が含まれるかチェック
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.isResult) {
          // 結果生成時に1回消費
          await incrementUsage(user.id, "lp_diagnose");
          return NextResponse.json({ result: parsed });
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    }

    // 通常の会話応答
    return NextResponse.json({ message: responseText });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
