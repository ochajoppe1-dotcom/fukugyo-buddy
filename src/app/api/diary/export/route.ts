import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "ログインが必要です" },
      { status: 401 }
    );
  }

  // 副業日記は Standard 以上のプランの機能
  const plan = await getUserPlan(supabase, user.id);
  if (plan === "free") {
    return NextResponse.json(
      { error: "Standard プラン以上の機能です" },
      { status: 403 }
    );
  }

  const { data: entries, error } = await supabase
    .from("diary_entries")
    .select("entry_date, revenue, expense, work_minutes, memo, created_at")
    .eq("user_id", user.id) // RLSに加えて明示フィルタ（多層防御）
    .order("entry_date", { ascending: true });

  if (error) {
    console.error("[diary/export] fetch error:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }

  // CSV 構築（UTF-8 BOM付きで Excel で文字化けしないように）
  const header = [
    "日付",
    "売上(円)",
    "経費(円)",
    "利益(円)",
    "作業時間(分)",
    "時給換算(円/h)",
    "メモ",
    "記録日時",
  ];

  const rows =
    entries?.map((e) => {
      const profit = (e.revenue ?? 0) - (e.expense ?? 0);
      const minutes = e.work_minutes ?? 0;
      const hourly =
        minutes > 0 ? Math.round((profit / minutes) * 60) : 0;
      return [
        e.entry_date,
        String(e.revenue ?? 0),
        String(e.expense ?? 0),
        String(profit),
        String(minutes),
        String(hourly),
        `"${(e.memo ?? "").replace(/"/g, '""')}"`,
        e.created_at,
      ];
    }) ?? [];

  const csv =
    "﻿" + // UTF-8 BOM
    [header, ...rows].map((r) => r.join(",")).join("\r\n");

  const filename = `fukugyo-diary-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
