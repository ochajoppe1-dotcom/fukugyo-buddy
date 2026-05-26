import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage } from "@/lib/usage";

const SYSTEM_PROMPT = `あなたは「副業バディAI」のAI実務サポート機能（AIアシスタント）です。

【絶対のルール】
- あなたはAIです。人間ではありません。
- 一人称で実体験を語らない（「僕も」「私も」NG）
- 運営者・特定個人の職業/経歴を出力に登場させない

【役割】
副業者の日常的な実務文章作成をサポートする。
具体例：
- 商品説明文の作成・改善
- 顧客向け案内メール
- クライアントへの提案文
- 価格交渉メール
- フリマ/EC出品文
- SNS投稿のキャッチコピー
- プロフィール文・自己紹介文

【絶対に守ること】
1. **過剰な誇張・煽りを避ける**
   - 「絶対」「100%」「誰でも」「最強」のような断定表現は使わない
   - 景品表示法・特商法に抵触しそうな表現は避ける

2. **法律相談はしない**
   - 契約書のレビュー、法的判断は弁護士へ

3. **収益保証や効果保証はしない**

【出力形式】
必ず以下のJSON形式だけで返答してください：

\`\`\`json
{
  "title": "今回作成した文章のタイプ（例：「商品説明文」「価格交渉メール」）",
  "main": "メインの文章本文（コピペできる完成形）",
  "alternatives": [
    "別バージョンA（少し違う角度・トーン）",
    "別バージョンB（さらに違う角度）"
  ],
  "tips": [
    "活用のコツ1",
    "活用のコツ2"
  ]
}
\`\`\``;

const DEMO_RESULT = {
  title: "商品説明文（フリマ出品用）",
  main: `【未使用品・自宅保管】〇〇 ブランド名 サイズM

【状態】
購入後、1〜2回着用しただけの美品です。クリーニング済みで保管していました。
タグはありませんが、目立つ汚れ・ダメージはありません。

【特徴】
・ブランド：〇〇
・サイズ：M（身丈〇〇cm／身幅〇〇cm）
・素材：コットン100%
・カラー：〇〇

【発送】
平日翌日発送、土日は週明け発送です。
コンビニ受取可。匿名配送対応。

ご質問・お写真追加のご希望はお気軽にコメントください。`,
  alternatives: [
    "シンプル版：簡潔に状態・サイズ・発送だけまとめた最小バージョン",
    "丁寧版：購入の経緯や手放す理由を加えた、信頼感重視バージョン",
  ],
  tips: [
    "サイズ表記は実測（cm）で書くと購入意欲が上がります",
    "「美品」「未使用に近い」など主観表現は、客観的な状態説明とセットで",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { task, context } = await req.json();
    if (!task) {
      return NextResponse.json(
        { error: "やりたいことを入力してください" },
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

    const check = await checkUsage(supabase, user.id, "practical_support");
    if (!check.allowed) {
      return NextResponse.json(
        {
          error:
            check.reason === "limit_exceeded"
              ? `今月の上限（${check.limit}回）に達しました。`
              : "AI実務サポートは Premium プランの機能です。",
          plan_locked: check.reason === "plan_locked",
          limit_exceeded: check.reason === "limit_exceeded",
          plan: check.plan,
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1500));
      await incrementUsage(user.id, "practical_support");
      return NextResponse.json({ result: DEMO_RESULT });
    }

    const userMessage = `以下の依頼に対する文章を作成してください。

【やりたいこと】
${task}

【コンテキスト・前提情報】
${context || "（特になし）"}

JSON形式で、メイン文章 + 別バージョン2つ + 活用のコツを返してください。`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("Claude API error:", await claudeRes.text());
      return NextResponse.json(
        { error: "文章の生成に失敗しました" },
        { status: 500 }
      );
    }

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        await incrementUsage(user.id, "practical_support");
        return NextResponse.json({ result: parsed });
      } catch {
        return NextResponse.json(
          { error: "文章の解析に失敗しました" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "文章を取得できませんでした" },
      { status: 500 }
    );
  } catch (e) {
    console.error("Support API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
