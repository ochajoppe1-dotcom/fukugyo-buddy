// Stripeのサブスクをちょっと更新して、webhookイベントを再発火させるスクリプト
// 使い方: node scripts/trigger-webhook.mjs
import Stripe from "stripe";

const SECRET = process.env.STRIPE_SECRET_KEY || process.argv[2];
if (!SECRET) {
  console.error("Usage: node scripts/trigger-webhook.mjs <sk_test_...>");
  process.exit(1);
}

const stripe = new Stripe(SECRET, { apiVersion: "2026-04-22.dahlia" });

async function main() {
  console.log("📋 最近のサブスク一覧を取得中...");
  const subs = await stripe.subscriptions.list({ limit: 10 });

  console.log(`  → ${subs.data.length} 件見つかった`);

  for (const sub of subs.data) {
    console.log(`\n🎯 Subscription: ${sub.id}`);
    console.log(`   Customer: ${sub.customer}`);
    console.log(`   Status:   ${sub.status}`);
    console.log(`   Plan:     ${sub.items.data[0]?.price?.id}`);
    console.log(`   Metadata: ${JSON.stringify(sub.metadata)}`);

    // metadata をちょっと更新 → customer.subscription.updated イベント発火
    console.log("   🔄 metadata 更新中（webhook再発火させる）...");
    const updated = await stripe.subscriptions.update(sub.id, {
      metadata: {
        ...sub.metadata,
        ping_at: new Date().toISOString(),
      },
    });
    console.log(`   ✅ 更新完了 (status: ${updated.status})`);
  }

  console.log("\n🎉 完了！1〜2秒以内にwebhookが発火するはず。");
  console.log("   → アカウントページを更新して確認してね");
}

main().catch((e) => {
  console.error("❌ エラー:", e.message);
  process.exit(1);
});
