"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AiReportButton from "../components/AiReportButton";

type Phase = {
  title: string;
  goal: string;
  actions: string[];
  targetIncome: string;
  checkpoints: string[];
};

type Result = {
  summary: string;
  phase1: Phase;
  phase2: Phase;
  phase3: Phase;
  watchOuts: string[];
  retreatLine: string;
};

type Profile = {
  goalIncome: string;
  monthlyHours: string;
  currentSkill: string;
  budget: string;
  preferredStyle: string;
  motivation: string;
};

export default function RoadmapClient({
  canGenerate,
}: {
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    goalIncome: "",
    monthlyHours: "",
    currentSkill: "",
    budget: "",
    preferredStyle: "",
    motivation: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isReady =
    profile.goalIncome &&
    profile.monthlyHours &&
    profile.currentSkill &&
    profile.budget;

  const generate = async () => {
    if (!isReady || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  if (!canGenerate) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-700">
          今月の生成上限に達しています。来月またご利用いただけます。
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 leading-relaxed">
            {result.summary}
          </h2>
        </div>

        <PhaseCard phase={result.phase1} accent="emerald" />
        <PhaseCard phase={result.phase2} accent="emerald" />
        <PhaseCard phase={result.phase3} accent="emerald" />

        {result.watchOuts.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-amber-700 mb-2">
              ⚠ 注意したい落とし穴
            </h3>
            <ul className="space-y-1.5">
              {result.watchOuts.map((w, i) => (
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
        )}

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-red-700 mb-2">
            🛑 撤退ライン
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.retreatLine}
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          別の条件でもう一度作成する
        </button>

        <div className="text-right">
          <AiReportButton
            feature="AI副業ロードマップ"
            output={JSON.stringify(result, null, 2)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-6 space-y-5">
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-xs text-emerald-700 leading-relaxed">
        💡 現状と目標を入力すると、3ヶ月／半年／1年の段階的ロードマップをAIが設計します。
      </div>

      <Field
        label="① 1年後の目標月収"
        required
        type="select"
        value={profile.goalIncome}
        onChange={(v) => setProfile({ ...profile, goalIncome: v })}
        options={[
          "月1〜3万円（お小遣い）",
          "月5〜10万円（家計の足し）",
          "月20万円以上（本業並み）",
          "金額より経験・スキル重視",
        ]}
      />

      <Field
        label="② 1日に副業へ使える時間"
        required
        type="select"
        value={profile.monthlyHours}
        onChange={(v) => setProfile({ ...profile, monthlyHours: v })}
        options={["30分以下", "1時間程度", "2〜3時間", "4時間以上"]}
      />

      <Field
        label="③ 今の得意なこと・スキル"
        required
        type="select"
        value={profile.currentSkill}
        onChange={(v) => setProfile({ ...profile, currentSkill: v })}
        options={[
          "文章を書くこと",
          "デザイン・絵",
          "話す・教えること",
          "PC作業・データ整理",
          "ハンドメイド・工作",
          "特になし（これから身につけたい）",
        ]}
      />

      <Field
        label="④ 初期投資の予算"
        required
        type="select"
        value={profile.budget}
        onChange={(v) => setProfile({ ...profile, budget: v })}
        options={[
          "0円（無料で始めたい）",
          "1万円まで",
          "5万円まで",
          "10万円以上OK",
        ]}
      />

      <Field
        label="⑤ 好みの働き方"
        type="select"
        value={profile.preferredStyle}
        onChange={(v) => setProfile({ ...profile, preferredStyle: v })}
        options={[
          "コツコツ積み上げ型（ブログ・Kindle等）",
          "働いた分すぐ収入型（受託・物販等）",
          "どちらでもOK",
        ]}
      />

      <Field
        label="⑥ 始めたい理由"
        type="select"
        value={profile.motivation}
        onChange={(v) => setProfile({ ...profile, motivation: v })}
        options={[
          "生活費・家計のため",
          "将来への備え",
          "いずれ独立したい",
          "やりがい・自己成長",
        ]}
      />

      <button
        onClick={generate}
        disabled={!isReady || loading}
        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "ロードマップを設計中..." : "ロードマップを作成する"}
      </button>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  type: "select";
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
      >
        <option value="">選択してください</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function PhaseCard({ phase, accent }: { phase: Phase; accent: "emerald" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className={`text-base font-bold text-${accent}-700 mb-2`}>
        {phase.title}
      </h3>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{phase.goal}</p>

      <p className="text-xs font-bold text-gray-500 mb-1.5">アクション</p>
      <ol className="space-y-1.5 mb-4 list-decimal list-inside">
        {phase.actions.map((a, i) => (
          <li key={i} className="text-sm text-gray-700 leading-relaxed">
            {a}
          </li>
        ))}
      </ol>

      <div className="bg-emerald-50 rounded-xl p-3 mb-3">
        <p className="text-xs font-bold text-emerald-700 mb-0.5">月収目安</p>
        <p className="text-sm text-gray-800">{phase.targetIncome}</p>
      </div>

      <p className="text-xs font-bold text-gray-500 mb-1.5">
        ✓ チェックポイント
      </p>
      <ul className="space-y-1">
        {phase.checkpoints.map((c, i) => (
          <li
            key={i}
            className="text-xs text-gray-600 leading-relaxed flex gap-2"
          >
            <span className="text-emerald-500 flex-shrink-0">·</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
