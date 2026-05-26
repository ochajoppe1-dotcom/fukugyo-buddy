import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/usage";
import LockedFeature from "../components/LockedFeature";
import { ALERTS } from "./alertsData";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserPlan(supabase, user.id);

  const header = (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
        >
          ← 戻る
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <h1 className="font-bold text-gray-900">詐欺アラート</h1>
        </div>
      </div>
    </header>
  );

  if (plan === "free") {
    return (
      <main className="flex-1 flex flex-col">
        {header}
        <section className="flex-1">
          <LockedFeature
            featureName="詐欺アラート"
            description="副業詐欺・情報商材の典型的な手口を、業界全体の傾向としてAIがまとめて配信。被害に遭ってからでは遅い、購入前のチェック資料として活用してください。"
            requiredPlan="Standard"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {header}
      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-800 leading-relaxed">
            ⚠ 副業・情報商材の詐欺は手口が多様化しています。
            <br />
            このページでは特定の企業を名指しせず、業界全体の典型パターンを教育目的で紹介しています。
            <br />
            購入前のチェック資料としてご活用ください。
          </div>

          {ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              {/* ヘッダー */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                  {alert.category}
                </span>
                <span className="text-xs text-gray-400">
                  {alert.publishedAt}
                </span>
              </div>

              <h2 className="text-base font-bold text-gray-900 mb-2 leading-relaxed">
                {alert.title}
              </h2>

              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {alert.summary}
              </p>

              {/* 典型的な手口 */}
              <div className="mb-4">
                <h3 className="text-xs font-bold text-gray-500 mb-2">
                  🎯 典型的な手口
                </h3>
                <ul className="space-y-1.5">
                  {alert.patterns.map((p, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 leading-relaxed flex gap-2"
                    >
                      <span className="text-red-400 flex-shrink-0">▸</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 気をつけるポイント */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                <h3 className="text-xs font-bold text-amber-700 mb-2">
                  ⚠ 気をつけるポイント
                </h3>
                <ul className="space-y-1">
                  {alert.watchOuts.map((w, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 leading-relaxed flex gap-2"
                    >
                      <span className="text-amber-500 flex-shrink-0">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 被害に遭ったら */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <h3 className="text-xs font-bold text-emerald-700 mb-1.5">
                  💡 もし該当しそうなら
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {alert.ifVictim}
                </p>
              </div>
            </div>
          ))}

          {/* 相談先 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              📞 公的な相談先
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <strong>消費者ホットライン 188</strong>
                （全国共通・市区町村の消費生活センターにつながる）
              </li>
              <li>
                <strong>警察相談ダイヤル #9110</strong>
                （緊急性のない相談）
              </li>
              <li>
                <strong>金融庁 金融サービス利用者相談室</strong>
                （投資・金融商品関連）
              </li>
              <li>
                <strong>各都道府県弁護士会の法律相談</strong>
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            ※ 本コンテンツは公的機関の公開情報をもとに、業界全体の傾向として一般化したものです。
            <br />
            特定の企業・販売者・サービスを指すものではありません。
          </p>
        </div>
      </section>
    </main>
  );
}
