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
      // 既存顧客は再利用、新規は customer_email で作成
      ...(existingSub?.stripe_customer_id
        ? { customer: existingSub.stripe_customer_id }
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
