import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { checkUsage, incrementUsage, getUserPlan } from "@/lib/usage";

// 入力ガード（APIコスト暴走防止）
const MAX_MESSAGE_CHARS = 2000; // 1メッセージの最大文字数
const MAX_TOTAL_MESSAGES = 40; // リクエストに含められる履歴の最大件数
const MAX_USER_TURNS = 20; // 1会話あたりのユーザー発言数上限

// サーバー側のセッション管理用（service_role・RLSバイパス）
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

2. **運営者・特定個人の職業/経歴/体験談を返答に登場させない**
   - 運営者個人の経歴・職業・過去の副業体験などには一切触れない
   - 副業バディAIは客観的な情報提供ツールであり、特定個人の物語ではない

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

【参考にできる知見（業界で一般的に知られる注意点。客観情報として扱う）】
副業・情報商材の分野で、消費者庁・国民生活センター等の公的機関や業界全般で繰り返し指摘されている典型的な注意点：
- 「月商○○万円」と「月利（手元に残る額）」の混同を誘う表現
- 「低資金から始められる」の謳い文句と実態の乖離
- 大量仕入れ・数百SKU推奨が、限られた副業時間では管理不能になる問題
- 海外仕入れの為替・手数料を見えにくくする価格表示
- 不良品・クレーム対応の負担が見積もられていない問題
- サポート期間が短く、終了後に相談先がなくなる問題

→ これらは「一般的に報告されている傾向」「データ上よく見られるパターン」として提供する（特定個人の体験談としては語らない）。

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
   - 不安や悩みを抱える相談者への共感を忘れない

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

    // conversationId 必須（サーバー側で会話単位の消費を管理するため）
    if (
      typeof conversationId !== "string" ||
      conversationId.length < 1 ||
      conversationId.length > 64
    ) {
      return NextResponse.json(
        { error: "会話IDが正しくありません" },
        { status: 400 }
      );
    }

    // 入力ガード：履歴件数・1メッセージの文字数（APIコスト暴走防止）
    if (messages.length > MAX_TOTAL_MESSAGES) {
      return NextResponse.json(
        {
          error: `この会話は長くなりすぎました。新しい相談を開始してください。`,
          conversation_full: true,
        },
        { status: 400 }
      );
    }
    for (const m of messages) {
      if (
        !m ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string"
      ) {
        return NextResponse.json(
          { error: "メッセージが正しくありません" },
          { status: 400 }
        );
      }
      if (m.content.length > MAX_MESSAGE_CHARS) {
        return NextResponse.json(
          {
            error: `メッセージは${MAX_MESSAGE_CHARS}文字以内でお願いします。`,
          },
          { status: 400 }
        );
      }
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

    const userMessages = messages.filter(
      (m: { role: string }) => m.role === "user"
    );
    const latestUserMessage = userMessages[userMessages.length - 1];

    // === サーバー側セッション管理 ===
    // 「新しい会話かどうか」をクライアント送信の messages 配列ではなく
    // chat_conversations テーブルで判定する（カウント回避の穴を塞ぐ）
    const admin = getAdminClient();
    const { data: convo } = await admin
      .from("chat_conversations")
      .select("user_id, message_count")
      .eq("id", conversationId)
      .maybeSingle();

    // 他人の会話IDは使えない
    if (convo && convo.user_id !== user.id) {
      return NextResponse.json(
        { error: "この会話にはアクセスできません" },
        { status: 403 }
      );
    }

    // 1会話あたりの発言数上限
    if (convo && convo.message_count >= MAX_USER_TURNS) {
      return NextResponse.json(
        {
          error: `この会話は上限（${MAX_USER_TURNS}往復）に達しました。新しい相談を開始してください。`,
          conversation_full: true,
        },
        { status: 400 }
      );
    }

    const isNewConversation = !convo;

    // 会話の消費記録（成功時に呼ぶ）
    const recordTurn = async () => {
      if (isNewConversation) {
        await incrementUsage(user.id, "ai_chat");
        await admin.from("chat_conversations").insert({
          id: conversationId,
          user_id: user.id,
          message_count: 1,
        });
      } else {
        await admin
          .from("chat_conversations")
          .update({
            message_count: (convo?.message_count ?? 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
      }
    };

    // Standard 以上：副業日記のサマリーをコンテキストとして取得
    let diaryContext = "";
    if (isStandardOrAbove) {
      const { data: entries } = await supabase
        .from("diary_entries")
        .select("entry_date, revenue, expense, work_minutes")
        .eq("user_id", user.id) // RLSに加えて明示フィルタ（多層防御）
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

    // 月次利用回数チェック（新しい会話の開始時のみ）
    if (isNewConversation) {
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

      // 会話の消費・往復数を記録
      await recordTurn();

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
        // 会話はターンごとに「システム＋全履歴」を再送するため、プロンプトキャッシュで
        // 再送分を約1/10価格にする（多往復会話のAPIコスト暴騰対策・2026-07-11）。
        // top-level cache_control は最後のキャッシュ可能ブロックに自動配置され、
        // 次ターンが直前ターンまでのプレフィックスをキャッシュから読む。
        cache_control: { type: "ephemeral" },
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

    // 会話の消費・往復数を記録（応答成功時のみ）
    await recordTurn();

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
