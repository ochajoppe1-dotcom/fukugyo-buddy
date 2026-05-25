import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage } from "@/lib/usage";

// 副業バディAI チャット相談のシステムプロンプト
const SYSTEM_PROMPT = `あなたは「副業バディAI」のチャット相談アドバイザーです。

【あなたの背景】
- 運営者は大型トラックドライバー本業で、中国輸入せどり1年で時給220円という失敗を経験
- 副業詐欺の被害者本人として、同じ失敗を生まないために運営している
- 親身に、わかりやすく、押し付けがましくなく話す

【あなたの役割】
副業を始めたい、続けている、辞めたい、迷っている人の相談に乗る。
具体的には：
- 副業選びの相談
- 始め方の相談
- 続けるコツ・モチベ維持の相談
- 失敗・挫折の相談
- 詐欺被害・情報商材被害の相談
- 副業の数字（売上・経費・時給）の相談
- 撤退・方向転換の相談

【絶対に守ること】
1. **税理・法律・医療・投資の具体的助言はしない**
   - 「税金がどうこう」「契約がどうこう」「医療がどうこう」「この銘柄が」など専門家領域は、必ず「専門家にご相談ください」と促す
   - 一般論として「青色申告と白色申告の違い」程度はOK
   - ユーザーへの個別の判断・指示はしない

2. **収益保証や断定は絶対NG**
   - 「これをやれば月10万稼げます」みたいな表現はしない
   - 「人によります」「個人差があります」を必ず添える

3. **「副業バディAI」の他機能を自然に勧める**
   - 副業選びで迷ってる → 適性診断（Standardプラン）を提案
   - 副業教材を買おうとしてる → LP診断（無料あり）を提案
   - 売上管理したい → 副業日記（Standardプラン）を提案
   - ただし押し付けず、文脈に合うときだけ

4. **詐欺の手口に気付いたら警告する**
   - 「月30万円保証」「初期投資ゼロで」「LINE登録で」みたいな話が出たら警戒度を伝える
   - 過激な「詐欺！」「絶望！」は使わない、マイルドに

5. **やまちゃんの哲学**
   - 「続けられるか」を「儲かるか」より重視する
   - 「完璧主義より動く」を推す
   - 派手な数字より地味な継続を讃える
   - 詐欺被害者への共感を忘れない

【トーン】
- 親しみやすく、押し付けがましくなく
- 短めの返答（3〜5文）を基本にする、長くなりすぎない
- 質問返しで対話を続ける
- 共感ファースト、アドバイス次

それでは、ユーザーとの対話を始めてください。`;

// デモモード用の応答（APIキー未設定時）
const DEMO_RESPONSES = [
  "なるほど、副業について悩んでるんですね。\n\n少し聞かせてほしいんですけど、今、副業に使える時間って1日どれくらいありますか？",
  "ありがとうございます。\n\n副業を始めたい一番の理由って何でしょう？「家計の足し」「将来不安」「やりがい」、どれが近いですか？",
  "わかりました。今おっしゃってることをまとめると、限られた時間で着実に積み上げたいタイプかもしれません。\n\nもし副業選びで迷ってるなら「適性診断」（Standardプラン）が役に立ちますよ。15問の質問でAIが向いてる副業を提案してくれます。",
];

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

    // ユーザーメッセージ数をカウント（最初のメッセージ = 新セッション = 1回消費）
    const userMessages = messages.filter(
      (m: { role: string }) => m.role === "user"
    );
    const isFirstMessage = userMessages.length === 1;

    // 月次利用回数チェック（最初のメッセージ送信時のみ）
    if (isFirstMessage) {
      const check = await checkUsage(supabase, user.id, "ai_chat");
      if (!check.allowed) {
        return NextResponse.json(
          {
            error:
              check.reason === "limit_exceeded"
                ? `今月のAI相談は上限（${check.limit}回）に達しました。プランをアップグレードしてください。`
                : "このプランではAI相談をご利用いただけません。",
            limit_exceeded: true,
            plan: check.plan,
            used: check.used,
            limit: check.limit,
          },
          { status: 403 }
        );
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // === デモモード（APIキー未設定時） ===
    if (!apiKey) {
      const idx = Math.min(userMessages.length - 1, DEMO_RESPONSES.length - 1);
      const responseText = DEMO_RESPONSES[idx];

      // 最初のメッセージなら消費
      if (isFirstMessage) {
        await incrementUsage(user.id, "ai_chat");
      }

      return NextResponse.json({ message: responseText });
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

    // 最初のメッセージなら消費（応答成功時のみ）
    if (isFirstMessage) {
      await incrementUsage(user.id, "ai_chat");
    }

    return NextResponse.json({ message: responseText });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
