import Link from "next/link";

type Props = {
  featureName: string;
  description: string;
  requiredPlan: "Standard" | "Premium";
};

export default function LockedFeature({
  featureName,
  description,
  requiredPlan,
}: Props) {
  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {featureName} は {requiredPlan} 以上の機能です
      </h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">
        {description}
      </p>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-left">
        <h3 className="text-sm font-bold text-emerald-700 mb-2">
          {requiredPlan} プランで使える機能
        </h3>
        {requiredPlan === "Standard" ? (
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>・LP診断 無制限</li>
            <li>・AI相談 月20回</li>
            <li>・適性診断 無制限</li>
            <li>・副業日記</li>
            <li>・数字まるわかりレポート</li>
            <li>・AI進捗コーチング 月次</li>
            <li>・詐欺アラート（パターン集・随時更新）</li>
          </ul>
        ) : (
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>・Standardの全機能</li>
            <li>・専属AIメンター（無制限・全記憶）</li>
            <li>・AI実務サポート（副業特化）</li>
            <li>・AI副業ロードマップ</li>
            <li>・緊急時テンプレ生成</li>
          </ul>
        )}
      </div>

      <Link
        href="/#pricing"
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
      >
        プランをアップグレード
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
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      <p className="text-xs text-gray-400 mt-4">
        初回7日間無料で試せます ／ いつでも解約できます
      </p>
    </div>
  );
}
