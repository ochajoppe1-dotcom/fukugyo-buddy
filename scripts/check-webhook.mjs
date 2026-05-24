// Stripeのwebhook配信状況を確認するスクリプト
import Stripe from "stripe";

const SECRET = process.env.STRIPE_SECRET_KEY || process.argv[2];
if (!SECRET) {
  console.error("Usage: node scripts/check-webhook.mjs <sk_test_...>");
  process.exit(1);
}

const stripe = new Stripe(SECRET, { apiVersion: "2026-04-22.dahlia" });

async function main() {
  console.log("📨 最近のイベント一覧（最新10件）:\n");
  const events = await stripe.events.list({ limit: 10 });
  for (const e of events.data) {
    const date = new Date(e.created * 1000).toLocaleString("ja-JP");
    console.log(`  ${date}  ${e.type}  (${e.id})`);
  }

  console.log("\n📡 Webhook エンドポイント一覧:\n");
  const endpoints = await stripe.webhookEndpoints.list();
  for (const ep of endpoints.data) {
    console.log(`  ${ep.url}`);
    console.log(`    status: ${ep.status}`);
    console.log(`    enabled_events: ${ep.enabled_events.slice(0, 5).join(", ")}...`);
  }
}

main().catch((e) => {
  console.error("❌ エラー:", e.message);
  process.exit(1);
});
