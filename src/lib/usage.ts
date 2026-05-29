// プラン別の機能アクセス制限・月次利用回数管理
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Plan = "free" | "standard" | "premium";
export type Feature =
  | "lp_diagnose"
  | "assessment"
  | "ai_chat"
  | "diary"
  | "report"
  | "emergency_template"
  | "practical_support"
  | "roadmap";

// 機能 × プランの上限定義
// null = アクセス不可、Infinity = 無制限
// 副業バディAI 最終価格構成（2026-05-28 確定）
// Free は AI を完全に抜く（永続性最優先・静的版で代替）
const LIMITS: Record<Feature, Record<Plan, number | null>> = {
  lp_diagnose: {
    free: null, // 静的版を別途提供（AI不使用）
    standard: 10,
    premium: 10,
  },
  assessment: {
    free: null, // 静的版を別途提供（AI不使用）
    standard: 5,
    premium: 5,
  },
  ai_chat: {
    free: null, // Free は AI 使えない
    standard: 10,
    premium: 25,
  },
  diary: {
    free: null,
    standard: Infinity,
    premium: Infinity,
  },
  report: {
    free: null,
    standard: 1,
    premium: 2,
  },
  emergency_template: {
    free: null,
    standard: null,
    premium: 10,
  },
  practical_support: {
    free: null,
    standard: null,
    premium: 15,
  },
  roadmap: {
    free: null,
    standard: null,
    premium: 1,
  },
};

// プランの日本語ラベル
export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  standard: "Standard",
  premium: "Premium",
};

// 機能の日本語ラベル
export const FEATURE_LABEL: Record<Feature, string> = {
  lp_diagnose: "LP診断",
  assessment: "適性診断",
  ai_chat: "AI相談",
  diary: "副業日記",
  report: "数字まるわかりレポート",
  emergency_template: "緊急時テンプレ生成",
  practical_support: "AI実務サポート",
  roadmap: "AI副業ロードマップ",
};

function getMonthKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// service_role の Supabase クライアント（RLSバイパス用）
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ユーザーの有効プランを返す
// active or trialing なら subscriptions.plan、それ以外（解約後・期限切れ含む）は free
export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<Plan> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return "free";

  const isActive = data.status === "active" || data.status === "trialing";
  // 解約後でも期限内ならプラン継続
  const isWithinPeriod =
    data.status === "canceled" &&
    data.current_period_end &&
    new Date(data.current_period_end) > new Date();

  if (isActive || isWithinPeriod) {
    return (data.plan as Plan) ?? "free";
  }
  return "free";
}

export type UsageCheck = {
  allowed: boolean;
  plan: Plan;
  used: number;
  limit: number | null; // null = アクセス不可、Infinity = 無制限
  remaining: number | null; // null = 不可、Infinity = 無制限
  reason?: "plan_locked" | "limit_exceeded";
};

// 機能利用可否のチェック（インクリメントはしない）
export async function checkUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: Feature
): Promise<UsageCheck> {
  const plan = await getUserPlan(supabase, userId);
  const limit = LIMITS[feature][plan];

  // プランでアクセス不可
  if (limit === null) {
    return {
      allowed: false,
      plan,
      used: 0,
      limit: null,
      remaining: null,
      reason: "plan_locked",
    };
  }

  // 無制限プランは即座に許可
  if (limit === Infinity) {
    return {
      allowed: true,
      plan,
      used: 0,
      limit: Infinity,
      remaining: Infinity,
    };
  }

  // 月次利用回数を取得
  const monthKey = getMonthKey();
  const { data } = await supabase
    .from("usage_counters")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("month_key", monthKey)
    .maybeSingle();

  const used = data?.count ?? 0;
  const remaining = Math.max(limit - used, 0);

  return {
    allowed: used < limit,
    plan,
    used,
    limit,
    remaining,
    reason: used >= limit ? "limit_exceeded" : undefined,
  };
}

// 機能を1回使ったことを記録（成功時のみ呼ぶ）
// service_role 経由で書き込む（RLSバイパス）
export async function incrementUsage(
  userId: string,
  feature: Feature
): Promise<void> {
  const admin = getAdminClient();
  const monthKey = getMonthKey();

  // upsert で count + 1
  const { data: existing } = await admin
    .from("usage_counters")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (existing) {
    await admin
      .from("usage_counters")
      .update({ count: existing.count + 1 })
      .eq("user_id", userId)
      .eq("feature", feature)
      .eq("month_key", monthKey);
  } else {
    await admin.from("usage_counters").insert({
      user_id: userId,
      feature,
      month_key: monthKey,
      count: 1,
    });
  }
}

// limit表示用の文字列（"3/3", "20/20", "無制限" など）
export function formatUsage(check: UsageCheck): string {
  if (check.limit === null) return "未対応";
  if (check.limit === Infinity) return "無制限";
  return `${check.used} / ${check.limit}`;
}

// remaining 表示（「あと N 回」）
export function formatRemaining(check: UsageCheck): string {
  if (check.remaining === null) return "プラン未対応";
  if (check.remaining === Infinity) return "無制限";
  return `あと ${check.remaining} 回`;
}
