import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const VALID_CATEGORIES = [
  "billing",
  "account",
  "feature",
  "data",
  "other",
] as const;

type Category = (typeof VALID_CATEGORIES)[number];

export async function POST(req: NextRequest) {
  try {
    const { category, subject, body, email } = await req.json();

    if (!subject?.trim() || !body?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "件名・本文・メールアドレスは必須です" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category as Category)) {
      return NextResponse.json(
        { error: "カテゴリが不正です" },
        { status: 400 }
      );
    }

    // 文字数制限（spam対策）
    if (subject.length > 200 || body.length > 5000) {
      return NextResponse.json(
        { error: "件名は200文字、本文は5000文字までです" },
        { status: 400 }
      );
    }

    // 認証情報（任意・ログイン中ならuser_id付ける）
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // service_role で書き込み（RLS バイパス）
    const admin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await admin.from("support_tickets").insert({
      user_id: user?.id ?? null,
      email,
      category,
      subject,
      body,
    });

    if (error) {
      console.error("[contact] insert error:", error);
      return NextResponse.json(
        { error: "送信に失敗しました。時間を置いてお試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[contact] error:", e);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
