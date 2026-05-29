// 静的版 適性診断のロジック
// 15問のスコアパターンマッチングで副業タイプを判定。AI不使用。
// 既存の questions.ts と同じ質問を再利用する。

import { questions } from "../assessment/questions";

export { questions };

// 結果タイプ
export type PersonaResult = {
  persona: string;
  description: string;
  topJobs: string[];
  avoidJobs: string[];
  advice: string;
};

type Axis =
  | "in_home"
  | "social"
  | "creative"
  | "stock"
  | "flow"
  | "risk_averse"
  | "low_capital";

const AXIS_BY_VALUE: Record<string, Partial<Record<Axis, number>>> = {
  // 1. time
  "30分以下": { stock: 2, in_home: 1 },
  "1時間程度": { stock: 1, in_home: 1 },
  "2〜3時間": { flow: 1, in_home: 1 },
  "4時間以上": { flow: 2 },

  // 2. goal
  "1〜3万円": { low_capital: 2, risk_averse: 1 },
  "5〜10万円": { stock: 1 },
  "20万円以上": { flow: 2 },
  "金額より経験": { creative: 2, stock: 1 },

  // 3. social
  "得意・好き": { social: 3, flow: 1 },
  "普通": { social: 1 },
  "苦手・避けたい": { in_home: 3, stock: 1 },

  // 4. face
  "両方OK": { social: 2, creative: 1 },
  "声だけOK": { social: 1, creative: 1 },
  "どちらも避けたい": { in_home: 2 },

  // 5. style
  "完璧主義": { creative: 2, stock: 1 },
  "行動派": { flow: 2 },
  "コツコツ型": { stock: 3 },

  // 6. investment
  "0円": { low_capital: 3, risk_averse: 2 },
  "1万円まで": { low_capital: 2, risk_averse: 1 },
  "5万円まで": { low_capital: 1 },
  "10万円以上OK": {},

  // 7. physical
  "余裕あり": { flow: 1 },
  "本業で疲れ気味": { in_home: 2, stock: 1 },

  // 8. skill
  "文章・ライティング": { creative: 2, stock: 1 },
  "デザイン・絵": { creative: 3 },
  "話す・教える": { social: 2 },
  "PC作業・データ": { in_home: 2 },
  "特になし": { low_capital: 1 },

  // 9. risk
  "安全第一": { risk_averse: 3, stock: 1 },
  "多少のリスクOK": {},
  "リスク歓迎": { flow: 2 },

  // 10. type
  "ストック型": { stock: 3 },
  "フロー型": { flow: 3 },

  // 11. place
  "完全在宅": { in_home: 3 },
  "外出もOK": { social: 1, flow: 1 },

  // 12. speed
  "すぐ欲しい": { flow: 2 },
  "数ヶ月OK": { stock: 1 },
  "1年でもOK": { stock: 3 },

  // 13. interest
  "物販・せどり": { flow: 2 },
  "コンテンツ作成": { creative: 3, stock: 2 },
  "スキル販売": { social: 2, creative: 1 },
  "投資・資産運用": { stock: 2 },
  "まだ決めてない": { low_capital: 1 },

  // 14. continuity
  "ある": { stock: 2 },
  "短期で飽きがち": { flow: 1 },
  "わからない": {},

  // 15. motivation
  "生活費・家計": { flow: 1, low_capital: 1 },
  "将来の不安": { stock: 2, risk_averse: 1 },
  "自由・独立": { creative: 1, stock: 1 },
  "やりがい・成長": { creative: 2 },
};

export function calculateResult(
  answers: Record<string, string>
): PersonaResult {
  const axisScore: Record<Axis, number> = {
    in_home: 0,
    social: 0,
    creative: 0,
    stock: 0,
    flow: 0,
    risk_averse: 0,
    low_capital: 0,
  };

  Object.values(answers).forEach((value) => {
    const points = AXIS_BY_VALUE[value];
    if (!points) return;
    Object.entries(points).forEach(([axis, pt]) => {
      axisScore[axis as Axis] += pt;
    });
  });

  const isCreator = axisScore.creative >= 4;
  const isStock = axisScore.stock >= 5;
  const isFlow = axisScore.flow >= 4;
  const isHome = axisScore.in_home >= 4;
  const isSocial = axisScore.social >= 4;
  const isLowCap = axisScore.low_capital >= 3;
  const isCautious = axisScore.risk_averse >= 3;

  if (isCreator && isStock) {
    return {
      persona: "📝 ストック型クリエイター",
      description:
        "コツコツ積み上げる創作系の副業が向いています。一度作ったコンテンツが資産になるタイプの仕事と相性が良いです。",
      topJobs: [
        "ブログ運営（特化型ブログ + 広告/アフィリエイト）",
        "Kindle出版（ノウハウ系・体験談）",
        "YouTube（顔出しなしのナレーション動画）",
      ],
      avoidJobs: [
        "数百SKUの大量物販（管理時間がない）",
        "面談営業が必要な仕事",
      ],
      advice:
        "最初の3ヶ月は収益ゼロ覚悟で「続けられる仕組み」を作りましょう。1日30分でも毎日触れることが何より大切。半年〜1年でコンテンツが資産化し始めます。",
    };
  }

  if (isHome && isSocial && !isCreator) {
    return {
      persona: "💬 オンライン対人型",
      description:
        "在宅でも人とコミュニケーションを取る仕事に向いています。テキストやチャットでの仕事と相性が良いです。",
      topJobs: [
        "ココナラ等のスキル販売（相談・占い・コーチング）",
        "オンライン家庭教師・コーチ",
        "コミュニティ運営（有料サロン補助）",
      ],
      avoidJobs: ["完全黙々作業の単純データ入力", "在庫を抱える物販"],
      advice:
        "強みは「親身さ」「話の聞き上手」など人間性です。最初は500〜1000円の相談から始め、リピート率を上げていく戦略がおすすめ。",
    };
  }

  if (isFlow && isLowCap) {
    return {
      persona: "🏃 即金実務型",
      description:
        "働いた分すぐ収入になるフロー型の副業が向いています。短期で結果を出したい人向け。",
      topJobs: [
        "Webライティング（クラウドソーシング）",
        "デザイン・動画編集の受託",
        "短期スポット仕事（軽作業・配達）",
      ],
      avoidJobs: [
        "成果が出るまで半年以上かかる積み上げ型",
        "高額初期投資が必要な物販",
      ],
      advice:
        "最初は単価300円〜の小さな仕事から実績を作り、徐々に単価UPを狙いましょう。3ヶ月で時給1500円ラインを目標に。",
    };
  }

  if (isHome && isCautious) {
    return {
      persona: "🔒 慎重・在宅黙々型",
      description:
        "リスク低めで在宅で完結する仕事が向いています。コツコツ系か実務代行で安定収入を狙う層。",
      topJobs: [
        "データ入力・文字起こし",
        "ライティング（リサーチ系）",
        "ストックフォト・素材販売",
      ],
      avoidJobs: ["投資系副業", "在庫リスクのある物販"],
      advice:
        "安全第一は正解です。ただし時給は300〜800円スタートが現実的。スキルが上がる作業を優先して、6ヶ月で時給1000円超えを目指しましょう。",
    };
  }

  if (isCreator && !isStock) {
    return {
      persona: "🎨 即時クリエイター型",
      description:
        "クリエイティブな仕事を受託で進めるタイプ。1案件ごとに完結する仕事と相性が良いです。",
      topJobs: [
        "デザイン受託（ロゴ・バナー）",
        "動画編集受託",
        "イラスト販売",
      ],
      avoidJobs: ["数年スパンの積み上げ型", "対面営業が必要な仕事"],
      advice:
        "ポートフォリオ作成が最優先。最初は実績ゼロでも応募する勇気を持ち、3〜5件の納品を3ヶ月以内に達成しましょう。",
    };
  }

  return {
    persona: "🌱 まずは試行錯誤型",
    description:
      "明確な方向性はまだ定まっていません。複数の副業を小さく試して、自分に合うものを見つけるフェーズです。",
    topJobs: [
      "ポイ活・アンケート（リスクゼロで開始可能）",
      "Webライティング（最も間口が広い）",
      "メルカリ・ヤフオク（自宅の不用品から）",
    ],
    avoidJobs: ["10万円以上の高額情報商材", "面談勧誘がある副業"],
    advice:
      "最初の3ヶ月は「収入を稼ぐ」より「合うもの・合わないものを見つける」を目的にしてください。手を動かすうちに方向性が見えてきます。",
  };
}
