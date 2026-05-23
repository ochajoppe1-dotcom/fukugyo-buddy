import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Webhook は raw body が必要なので、body parsing を無効化
export const runtime = "nodejs";

// 管理者権限の Supabase クライアント（RLS をバイパス）
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// price_id からプラン名を逆引き
function planFromPriceId(priceId: string): "standard" | "premium" | null {
  if (priceId === PLANS.standard.priceId) return "standard";
  if (priceId === PLANS.premium.priceId) return "premium";
  return null;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "署名または webhook secret がありません" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return NextResponse.json(
      { error: "署名検証に失敗しました" },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) break;

        // サブスク詳細を取得してプラン特定
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        if (!plan) {
          console.warn("Unknown price id:", priceId);
          break;
        }

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: subscription.status,
            current_period_end: new Date(
              // @ts-expect-error - current_period_end may exist on legacy types
              (subscription.current_period_end ??
                subscription.items.data[0]?.current_period_end ??
                0) * 1000
            ).toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        if (!userId || !plan) break;

        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            plan,
            status: subscription.status,
            current_period_end: new Date(
              // @ts-expect-error - current_period_end may exist on legacy types
              (subscription.current_period_end ??
                subscription.items.data[0]?.current_period_end ??
                0) * 1000
            ).toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("user_id", userId);
        break;
      }

      default:
        // 未対応イベントは無視
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    return NextResponse.json(
      { error: "Webhook処理に失敗しました" },
      { status: 500 }
    );
  }
}
