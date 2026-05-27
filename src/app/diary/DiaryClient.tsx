"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DiaryEntry = {
  id: string;
  entry_date: string;
  revenue: number;
  expense: number;
  work_minutes: number;
  memo: string | null;
};

export default function DiaryClient({
  initialEntries,
}: {
  initialEntries: DiaryEntry[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // フォーム入力
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [revenue, setRevenue] = useState("");
  const [expense, setExpense] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [memo, setMemo] = useState("");

  // 集計
  const totalRevenue = entries.reduce((s, e) => s + e.revenue, 0);
  const totalExpense = entries.reduce((s, e) => s + e.expense, 0);
  const totalProfit = totalRevenue - totalExpense;
  const totalMinutes = entries.reduce((s, e) => s + e.work_minutes, 0);
  const hourlyWage =
    totalMinutes > 0
      ? Math.round((totalProfit / totalMinutes) * 60)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const workMinutes =
        (parseInt(hours || "0") || 0) * 60 +
        (parseInt(minutes || "0") || 0);

      const { data, error } = await supabase
        .from("diary_entries")
        .insert({
          user_id: user.id,
          entry_date: date,
          revenue: parseInt(revenue || "0") || 0,
          expense: parseInt(expense || "0") || 0,
          work_minutes: workMinutes,
          memo: memo || null,
        })
        .select()
        .single();

      if (error) throw error;

      setEntries([data, ...entries]);
      // フォームリセット
      setRevenue("");
      setExpense("");
      setHours("");
      setMinutes("");
      setMemo("");
      setShowForm(false);
    } catch (err) {
      alert(
        "保存に失敗しました：" +
          (err instanceof Error ? err.message : "不明なエラー")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この記録を削除しますか？")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("diary_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setEntries(entries.filter((e) => e.id !== id));
    } catch {
      alert("削除に失敗しました");
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* サマリーカード */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-sm font-bold text-gray-500 mb-3">
          これまでの記録（{entries.length}件）
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400">累計売上</p>
            <p className="text-xl font-bold text-gray-900">
              ¥{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">累計利益</p>
            <p
              className={`text-xl font-bold ${
                totalProfit >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              ¥{totalProfit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">累計経費</p>
            <p className="text-base font-medium text-gray-600">
              ¥{totalExpense.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">時給換算</p>
            <p
              className={`text-base font-medium ${
                hourlyWage >= 1000
                  ? "text-emerald-600"
                  : hourlyWage > 0
                  ? "text-amber-600"
                  : "text-gray-400"
              }`}
            >
              ¥{hourlyWage.toLocaleString()}/h
            </p>
          </div>
        </div>
      </div>

      {/* AIレポートへの誘導 */}
      {entries.length > 0 && (
        <>
          <button
            onClick={() => router.push("/report")}
            className="w-full bg-white border border-emerald-200 text-emerald-700 py-3 rounded-2xl font-medium hover:bg-emerald-50 transition-colors mb-2 flex items-center justify-center gap-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            数字まるわかりレポート（AI分析）
          </button>
          <a
            href="/api/diary/export"
            className="w-full bg-white border border-gray-200 text-gray-600 py-2.5 rounded-2xl font-medium hover:bg-gray-50 transition-colors mb-4 flex items-center justify-center gap-2 text-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            CSVでダウンロード
          </a>
        </>
      )}

      {/* 記録追加ボタン or フォーム */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-medium hover:bg-emerald-700 transition-colors mb-4"
        >
          ＋ 今日の記録をつける
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-3"
        >
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                売上（円）
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                経費（円）
              </label>
              <input
                type="number"
                value={expense}
                onChange={(e) => setExpense(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              作業時間
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm text-gray-500">時間</span>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
              <span className="text-sm text-gray-500">分</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              メモ（任意）
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="今日やったこと、気づいたこと"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? "保存中..." : "記録する"}
            </button>
          </div>
        </form>
      )}

      {/* 記録一覧 */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          まだ記録がありません。
          <br />
          今日の副業を記録してみましょう。
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const profit = entry.revenue - entry.expense;
            return (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">
                    {entry.entry_date}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                  >
                    削除
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-400">売上 </span>
                    <span className="text-gray-700">
                      ¥{entry.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">利益 </span>
                    <span
                      className={
                        profit >= 0 ? "text-emerald-600" : "text-red-500"
                      }
                    >
                      ¥{profit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">時間 </span>
                    <span className="text-gray-700">
                      {Math.floor(entry.work_minutes / 60)}h
                      {entry.work_minutes % 60}m
                    </span>
                  </div>
                </div>
                {entry.memo && (
                  <p className="text-xs text-gray-500 mt-2">{entry.memo}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ログアウト */}
      <button
        onClick={handleLogout}
        className="w-full text-xs text-gray-400 hover:text-gray-600 mt-8 py-2 transition-colors"
      >
        ログアウト
      </button>
    </div>
  );
}
