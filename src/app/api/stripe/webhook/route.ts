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

// Stripeのステータスを許可リスト形式に正規化（DBのCHECK制約は別途緩めるが念のため）
const ALLOWED_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "unpaid",
  "inactive",
] as const;

function normalizeStatus(stripeStatus: string): string {
  if ((ALLOWED_STATUSES as readonly string[]).includes(stripeStatus)) {
    return stripeStatus;
  }
  // incomplete / incomplete_expired / paused は "inactive" 扱い
  return "inactive";
}

// current_period_end を安全に取り出す
function extractPeriodEnd(subscription: Stripe.Subscription): string | null {
  // 新しいAPI: items.data[0].current_period_end
  // 古いAPI: subscription.current_period_end
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  // @ts-expect-error - 古いAPIでは subscription にも存在
  const fromSub = subscription.current_period_end;
  const ts = fromItem ?? fromSub;
  if (!ts || ts <= 0) return null;
  return new Date(ts * 1000).toISOString();
}

type UpsertPayload = {
  user_id: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  plan: string;
  status: string;
  current_period_end?: string | null;
};

async function upsertSubscription(
  supabase: ReturnType<typeof getAdminClient>,
  payload: UpsertPayload,
  context: string
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "user_id" })
    .select();

  if (error) {
    console.error(
      `[webhook:${context}] Supabase upsert error:`,
      JSON.stringify(error),
      "payload:",
      JSON.stringify(payload)
    );
  } else {
    console.log(
      `[webhook:${context}] Upsert success for user ${payload.user_id}:`,
      JSON.stringify(data)
    );
  }
  return { data, error };
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[webhook] Missing signature or secret");
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
    console.error("[webhook] Signature verification failed:", e);
    return NextResponse.json(
      { error: "署名検証に失敗しました" },
      { status: 400 }
    );
  }

  console.log(`[webhook] Received event: ${event.type} (${event.id})`);

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.user_id || session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log("[webhook:checkout] session metadata:", JSON.stringify({
          user_id_meta: session.metadata?.user_id,
          client_reference_id: session.client_reference_id,
          customer: customerId,
          subscription: subscriptionId,
        }));

        if (!userId || !subscriptionId) {
          console.warn(
            "[webhook:checkout] Missing userId or subscriptionId",
            { userId, subscriptionId }
          );
          break;
        }

        // サブスク詳細を取得してプラン特定
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        if (!plan) {
          console.warn(
            "[webhook:checkout] Unknown price id:",
            priceId,
            "PLANS:",
            { std: PLANS.standard.priceId, prm: PLANS.premium.priceId }
          );
          break;
        }

        await upsertSubscription(
          supabase,
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: normalizeStatus(subscription.status),
            current_period_end: extractPeriodEnd(subscription),
          },
          "checkout.session.completed"
        );
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.user_id;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        console.log(`[webhook:${event.type}] subscription:`, JSON.stringify({
          user_id_meta: subscription.metadata?.user_id,
          customer: subscription.customer,
          subscription: subscription.id,
          priceId,
          plan,
          status: subscription.status,
        }));

        // metadata.user_id が無い場合、customer_id から既存レコードを引く
        if (!userId) {
          const customerId = subscription.customer as string;
          const { data: existing } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          if (existing?.user_id) {
            userId = existing.user_id;
            console.log(
              `[webhook:${event.type}] Recovered user_id from customer:`,
              userId
            );
          }
        }

        if (!userId || !plan) {
          console.warn(`[webhook:${event.type}] Missing data`, {
            userId,
            plan,
            priceId,
          });
          break;
        }

        await upsertSubscription(
          supabase,
          {
            user_id: userId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            plan,
            status: normalizeStatus(subscription.status),
            current_period_end: extractPeriodEnd(subscription),
          },
          event.type
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.user_id;

        if (!userId) {
          const customerId = subscription.customer as string;
          const { data: existing } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          if (existing?.user_id) userId = existing.user_id;
        }

        if (!userId) {
          console.warn("[webhook:subscription.deleted] No user_id");
          break;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("user_id", userId);

        if (error) {
          console.error(
            "[webhook:subscription.deleted] Update error:",
            JSON.stringify(error)
          );
        } else {
          console.log(
            "[webhook:subscription.deleted] Downgraded user:",
            userId
          );
        }
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[webhook] Handler error:", e);
    return NextResponse.json(
      { error: "Webhook処理に失敗しました" },
      { status: 500 }
    );
  }
}
