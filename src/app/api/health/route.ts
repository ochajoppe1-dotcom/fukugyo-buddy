import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// ヘルスチェック兼 Supabase keepalive。
// GitHub Actions から数日おきに叩くことで、無料プランの
// 「7日間 DB 無アクセスで自動一時停止」を防ぐ。
// 軽量な head クエリで Postgres に触れるだけ（データは返さない）。
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok: false, db: "unconfigured" }, { status: 500 });
    }

    const admin = createSupabaseAdmin(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // head:true = 行を返さずカウントのみ。DBに触れることが目的。
    const { error } = await admin
      .from("subscriptions")
      .select("user_id", { head: true, count: "exact" });

    if (error) {
      console.error("[health] db error:", error.message);
      return NextResponse.json({ ok: false, db: "error" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      db: "up",
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[health] error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
