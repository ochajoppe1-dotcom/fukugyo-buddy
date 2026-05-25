// 現在のStripeサブスクとSupabaseのsubscriptionsテーブルを照合
import Stripe from "stripe";

const SECRET = process.env.STRIPE_SECRET_KEY || process.argv[2];
if (!SECRET) {
  console.error("Usage: node scripts/check-subscription.mjs <sk_test_...>");
  process.exit(1);
}

const stripe = new Stripe(SECRET, { apiVersion: "2026-04-22.dahlia" });

async function main() {
  console.log("📋 Stripe側のサブスク状態:\n");
  const subs = await stripe.subscriptions.list({ limit: 5, status: "all" });
  for (const sub of subs.data) {
    console.log(`  Subscription ID: ${sub.id}`);
    console.log(`    Status:                ${sub.status}`);
    console.log(`    Cancel at period end:  ${sub.cancel_at_period_end}`);
    console.log(
      `    Cancel at:             ${
        sub.cancel_at ? new Date(sub.cancel_at * 1000).toLocaleString("ja-JP") : "—"
      }`
    );
    console.log(
      `    Trial end:             ${
        sub.trial_end ? new Date(sub.trial_end * 1000).toLocaleString("ja-JP") : "—"
      }`
    );
    console.log(`    Plan:                  ${sub.items.data[0]?.price?.id}`);
    console.log("");
  }
}

main().catch((e) => {
  console.error("❌ エラー:", e.message);
  process.exit(1);
});
