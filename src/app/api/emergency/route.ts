import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage } from "@/lib/usage";

const SYSTEM_PROMPT = `あなたは「副業バディAI」の緊急時テンプレ生成機能（AIアシスタント）です。

【絶対のルール】
- あなたはAIです。人間ではありません。
- 一人称で実体験を語らない（「僕も」「私も」NG）
- 運営者・特定個人の職業/経歴を出力に登場させない

【役割】
副業者が困った時のメール／メッセージ文面を、状況に応じて生成する。
具体的なシナリオ例：
- 情報商材の返金交渉メール
- 不良品クレーム対応メール
- 販売者と連絡が取れない時の催促メール
- クライアントへの納期遅延謝罪
- ハラスメント相手への線引きメッセージ
- 詐欺被害が疑われる時の通報・相談先案内
- フリマ・ECサイトでのトラブル対応文面

【絶対に守ること】
1. **法律相談はしない**
   - 「裁判で勝てます」「契約は無効です」のような法的判断は避ける
   - 必要に応じて「弁護士／消費生活センター（188）にご相談ください」と促す
   - 文面はあくまで「コミュニケーションの叩き台」として作成

2. **威嚇的・違法な文面は作らない**
   - 「告訴する」「警察に行く」を脅しとして使う文面はNG
   - 事実に基づいた冷静な文面のみ作成

3. **副業バディAIの他機能を文脈に応じて勧める**
   - LP診断していない教材の話 → LP診断を勧める
   - 詐欺の疑いが強い → 公的窓口（消費者庁188、警察）を提案

【出力形式】
必ず以下のJSON形式だけで返答してください（前後に文章を付けない）：

\`\`\`json
{
  "subject": "件名（メールの場合のみ、不要なら空文字）",
  "body": "本文（敬体、改行入り、コピペで使える完成形）",
  "tone": "fact-based" | "polite" | "firm",
  "tips": [
    "送信前のチェックポイント1",
    "送信前のチェックポイント2"
  ],
  "nextSteps": [
    "返答が来なかった場合の次のアクション",
    "状況が悪化した場合の相談先"
  ]
}
\`\`\``;

const DEMO_RESULT = {
  subject: "ご購入商品に関するお問い合わせ",
  body: `〇〇販売事業者　ご担当者様

お世話になっております。
先日、貴社より「〇〇」を購入いたしました [氏名] と申します。
注文番号：[注文番号]

商品を受領いたしましたが、説明されていた以下の点について確認させてください。

・[気になる点1]
・[気になる点2]

つきましては、以下のいずれかの対応をご検討いただけますでしょうか。

1. 商品が説明と相違している場合の返金
2. 不足機能の追加サポート
3. その他、貴社で可能な対応

お忙しいところ恐縮ですが、〇月〇日までにご返答いただけますと幸いです。

よろしくお願いいたします。

[氏名]
[連絡先メールアドレス]`,
  tone: "polite",
  tips: [
    "感情的な表現は避け、事実と要望を分けて書きましょう",
    "送信前に注文情報・商品名・購入日を再確認しましょう",
  ],
  nextSteps: [
    "7日以内に返答がない場合は、もう一度同じ内容で送信してください",
    "応答がない場合は消費生活センター（188）に相談を検討しましょう",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { situation, details } = await req.json();
    if (!situation) {
      return NextResponse.json(
        { error: "状況を入力してください" },
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

    const check = await checkUsage(supabase, user.id, "emergency_template");
    if (!check.allowed) {
      return NextResponse.json(
        {
          error:
            check.reason === "limit_exceeded"
              ? `今月の上限（${check.limit}回）に達しました。`
              : "緊急時テンプレ生成は Premium プランの機能です。",
          plan_locked: check.reason === "plan_locked",
          limit_exceeded: check.reason === "limit_exceeded",
          plan: check.plan,
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // デモモード
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1500));
      await incrementUsage(user.id, "emergency_template");
      return NextResponse.json({ result: DEMO_RESULT });
    }

    const userMessage = `以下の状況に対するテンプレを作成してください。

【状況】
${situation}

【詳細・補足】
${details || "（特になし）"}

【出力】
JSON形式で、コピペできる完成度のテンプレ本文と、送信前のチェックポイント、次のアクション提案を返してください。`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text());
      return NextResponse.json(
        { error: "テンプレの生成に失敗しました" },
        { status: 500 }
      );
    }

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        await incrementUsage(user.id, "emergency_template");
        return NextResponse.json({ result: parsed });
      } catch {
        return NextResponse.json(
          { error: "テンプレの解析に失敗しました" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "テンプレを取得できませんでした" },
      { status: 500 }
    );
  } catch (e) {
    console.error("Emergency API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
