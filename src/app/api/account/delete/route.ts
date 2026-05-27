import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { confirm } = await req.json();

    // 確認文字列を必須に（誤操作防止）
    if (confirm !== "アカウントを削除します") {
      return NextResponse.json(
        { error: "確認文字列が一致しません" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 1. Stripe サブスク取得 & キャンセル
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (sub?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(sub.stripe_subscription_id);
      } catch (e) {
        console.error("[delete] Stripe cancel error (continue):", e);
        // 既に解約済みやエラーでも続行
      }
    }

    if (sub?.stripe_customer_id) {
      try {
        await stripe.customers.del(sub.stripe_customer_id);
      } catch (e) {
        console.error("[delete] Stripe customer delete error (continue):", e);
      }
    }

    // 2. Supabase: auth.users を削除（ON DELETE CASCADE で関連データも消える）
    const admin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 念のため明示的に各テーブルも削除
    await admin.from("chat_messages").delete().eq("user_id", userId);
    await admin.from("usage_counters").delete().eq("user_id", userId);
    await admin.from("diary_entries").delete().eq("user_id", userId);
    await admin.from("subscriptions").delete().eq("user_id", userId);
    // support_tickets は user_id を null にする（履歴は保持・トラブル時参照可）
    await admin
      .from("support_tickets")
      .update({ user_id: null })
      .eq("user_id", userId);

    // 3. 認証ユーザー本体を削除
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("[delete] auth.admin.deleteUser error:", deleteError);
      return NextResponse.json(
        { error: "アカウント削除に失敗しました: " + deleteError.message },
        { status: 500 }
      );
    }

    // 4. ログアウト
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[delete] error:", e);
    return NextResponse.json(
      { error: "アカウント削除中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
