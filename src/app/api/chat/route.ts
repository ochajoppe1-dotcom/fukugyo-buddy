import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUsage, incrementUsage, getUserPlan } from "@/lib/usage";

// 副業バディAI チャット相談のシステムプロンプト
const SYSTEM_PROMPT = `あなたは「副業バディAI」というサービスのAIアシスタントです。

【超重要・絶対のルール】
あなたは**AIアシスタント**であり、人間ではありません。以下を絶対に守ってください：

1. **一人称で「僕」「私」を使って実体験を語らない**
   - ❌ NG例：「僕も○○の仕事をしてるので分かります」
   - ❌ NG例：「私も副業で失敗したことがあって」
   - ❌ NG例：「俺っちも〜」
   - ✅ OK例：「同じ立場の方からは○○というお話をよく聞きます」
   - ✅ OK例：「○○というケースが多いようです」

2. **運営者・特定個人の職業/経歴を返答に登場させない**
   - 「運営者は大型ドライバーで〜」「運営者は中国輸入で〜」は絶対に言わない
   - 運営者の個人情報は、ユーザーが知る必要がない

3. **AIとしての立場を明確にする**
   - 自分の体験ではなく、「一般的な傾向」「よく聞く話」「データ的には」として情報を提供する
   - ユーザーが「あなたは何者？」と聞いたら「副業バディAIというサービスのAIアシスタントです」と答える

【あなたの役割】
副業を始めたい、続けている、辞めたい、迷っている人の相談に乗る。
- 副業選びの相談
- 始め方の相談
- 続けるコツ・モチベ維持の相談
- 失敗・挫折の相談
- 詐欺被害・情報商材被害の相談
- 副業の数字（売上・経費・時給）の相談
- 撤退・方向転換の相談

【参考にできる知見（AI内部の知識として保持。直接「運営者が〜」と語らない）】
副業バディAIは、中国輸入せどりを副業として1年続けて「時給220円」という結論に至った人の実体験ベースで設計されている。そのため、以下の罠への警戒を持つ：
- 「月商○○万円」と「月利」の混同の罠
- 「低資金から始められる」の謳い文句の落とし穴
- 数百SKU推奨が副業時間では物理的に管理不能になる問題
- 中国"元表記"の心理トリック
- 不良品クレーム連鎖の現実
- 「サポート1ヶ月」が切れた後の孤独

→ これらの知見を、**「よく聞くパターン」「データ上の傾向」**として活かす。

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

5. **副業の哲学**
   - 「続けられるか」を「儲かるか」より重視する
   - 「完璧主義より動く」を推す
   - 派手な数字より地味な継続を讃える
   - 詐欺被害者への共感を忘れない

【トーン】
- 親しみやすく、押し付けがましくなく
- 短めの返答（3〜5文）を基本にする、長くなりすぎない
- 質問返しで対話を続ける
- 共感ファースト、アドバイス次
- AIとしての中立的な立場を保つ

それでは、ユーザーとの対話を始めてください。`;

// デモモード用の応答（APIキー未設定時）
const DEMO_RESPONSES = [
  "なるほど、副業について悩んでらっしゃるんですね。\n\n少しお聞かせください。今、副業に使える時間って1日どれくらいありますか？",
  "ありがとうございます。\n\n副業を始めたい一番の理由は何でしょう？「家計の足し」「将来不安」「やりがい」、近いものはありますか？",
  "わかりました。お話を伺った感じだと、限られた時間で着実に積み上げたいタイプかもしれません。\n\n副業選びで迷ってる場合は「適性診断」（Standardプラン）が役に立ちます。15問の質問でAIが向いてる副業を提案してくれますよ。",
];

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();
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

    // プラン確認
    // - 日記コンテキスト連携：Standard 以上
    // - 会話履歴の永続化：Premium のみ
    const plan = await getUserPlan(supabase, user.id);
    const isPremium = plan === "premium";
    const isStandardOrAbove = plan === "standard" || plan === "premium";

    // ユーザーメッセージ数をカウント（最初のメッセージ = 新セッション = 1回消費）
    const userMessages = messages.filter(
      (m: { role: string }) => m.role === "user"
    );
    const isFirstMessage = userMessages.length === 1;
    const latestUserMessage = userMessages[userMessages.length - 1];

    // Standard 以上：副業日記のサマリーをコンテキストとして取得
    let diaryContext = "";
    if (isStandardOrAbove) {
      const { data: entries } = await supabase
        .from("diary_entries")
        .select("entry_date, revenue, expense, work_minutes")
        .order("entry_date", { ascending: false })
        .limit(30);

      if (entries && entries.length > 0) {
        const totalRev = entries.reduce(
          (s, e) => s + (e.revenue ?? 0),
          0
        );
        const totalExp = entries.reduce(
          (s, e) => s + (e.expense ?? 0),
          0
        );
        const totalMin = entries.reduce(
          (s, e) => s + (e.work_minutes ?? 0),
          0
        );
        const hourly =
          totalMin > 0
            ? Math.round(((totalRev - totalExp) / totalMin) * 60)
            : 0;
        diaryContext = `\n\n【参考：このユーザーの副業日記（直近30件）】
- 記録日数：${entries.length}日
- 売上合計：${totalRev.toLocaleString()}円
- 経費合計：${totalExp.toLocaleString()}円
- 利益：${(totalRev - totalExp).toLocaleString()}円
- 作業時間：${(totalMin / 60).toFixed(1)}時間
- 時給換算：${hourly.toLocaleString()}円/h

ユーザーが数字や具体的な状況に触れたら、この日記データを参考に答えてOK。
ただし、ユーザーから明示的に聞かれない限り、勝手に数字の話を切り出さない。`;
      }
    }

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

      // Premium は履歴保存
      if (isPremium && conversationId && latestUserMessage) {
        await persistMessages(
          supabase,
          user.id,
          conversationId,
          latestUserMessage.content,
          responseText
        );
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
        system: SYSTEM_PROMPT + diaryContext,
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

    // Premium は履歴保存
    if (isPremium && conversationId && latestUserMessage) {
      await persistMessages(
        supabase,
        user.id,
        conversationId,
        latestUserMessage.content,
        responseText
      );
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

// メッセージ永続化（Premium のみ）
async function persistMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  conversationId: string,
  userContent: string,
  assistantContent: string
) {
  try {
    await supabase.from("chat_messages").insert([
      {
        user_id: userId,
        conversation_id: conversationId,
        role: "user",
        content: userContent,
      },
      {
        user_id: userId,
        conversation_id: conversationId,
        role: "assistant",
        content: assistantContent,
      },
    ]);
  } catch (e) {
    // 履歴保存失敗してもAPI自体は成功させる
    console.error("[chat] history save failed:", e);
  }
}
