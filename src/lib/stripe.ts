import Stripe from "stripe";

// サーバー側で使うStripeクライアント（遅延初期化）
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY が設定されていません");
  }
  _stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  return _stripe;
}

// Proxy: stripe.checkout.sessions.create() のように使えるラッパー
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const s = getStripe();
    // @ts-expect-error - dynamic property access
    const value = s[prop];
    return typeof value === "function" ? value.bind(s) : value;
  },
});

// プラン定義
export const PLANS = {
  standard: {
    name: "Standard",
    get priceId() {
      return process.env.STRIPE_PRICE_ID_STANDARD || "";
    },
    amount: 550,
  },
  premium: {
    name: "Premium",
    get priceId() {
      return process.env.STRIPE_PRICE_ID_PREMIUM || "";
    },
    amount: 990,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
