import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { plan } = (await req.json()) as { plan: PlanKey };

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: "プランが不正です" }, { status: 400 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: "Stripe料金IDが未設定です" },
        { status: 500 }
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

    // 既存の subscription レコードを確認（stripe_customer_id 再利用のため）
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // 既存の stripe_customer_id が「現在のStripeモード（本番/テスト）」に
    // 存在するか検証する。テスト→本番切替時など、別モードのIDが残っていると
    // checkout作成が失敗するため、無効なIDは使わず email から新規作成する。
    let validCustomerId: string | null = null;
    if (existingSub?.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(
          existingSub.stripe_customer_id
        );
        // 削除済みでなければ有効
        if (customer && !("deleted" in customer && customer.deleted)) {
          validCustomerId = existingSub.stripe_customer_id;
        }
      } catch {
        // No such customer 等 → 無効なので使わない（新規作成にフォールバック）
        validCustomerId = null;
      }
    }

    // Checkout セッション作成
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      // 初回7日間無料
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          plan,
        },
      },
      // 有効な既存顧客は再利用、それ以外は email から新規作成
      ...(validCustomerId
        ? { customer: validCustomerId }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan,
      },
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/?checkout=canceled`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
