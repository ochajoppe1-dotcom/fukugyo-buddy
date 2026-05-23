"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Plan = "free" | "standard" | "premium";
export type SubStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "inactive";

export type Subscription = {
  plan: Plan;
  status: SubStatus;
  current_period_end: string | null;
  isActive: boolean; // 機能制限の判定用（active or trialing）
};

const DEFAULT_SUB: Subscription = {
  plan: "free",
  status: "inactive",
  current_period_end: null,
  isActive: false,
};

export function useSubscription() {
  const [sub, setSub] = useState<Subscription>(DEFAULT_SUB);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchSub = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSub(DEFAULT_SUB);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        const isActive = data.status === "active" || data.status === "trialing";
        setSub({
          plan: (data.plan as Plan) ?? "free",
          status: (data.status as SubStatus) ?? "inactive",
          current_period_end: data.current_period_end,
          // 有効期限内なら、解約後でもアクセスOKにする
          isActive:
            isActive ||
            (data.status === "canceled" &&
              data.current_period_end !== null &&
              new Date(data.current_period_end) > new Date()),
        });
      } else {
        setSub(DEFAULT_SUB);
      }
      setLoading(false);
    };

    fetchSub();

    // ログイン/ログアウト時に再取得
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange(() => fetchSub());

    return () => authSub.unsubscribe();
  }, []);

  // ヘルパー：機能ごとのアクセス制御
  const canAccess = (requiredPlan: Plan): boolean => {
    if (requiredPlan === "free") return true;
    if (!sub.isActive) return false;
    const rank = { free: 0, standard: 1, premium: 2 };
    return rank[sub.plan] >= rank[requiredPlan];
  };

  return { ...sub, loading, canAccess };
}
