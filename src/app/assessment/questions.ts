// 副業適性診断の質問データ（15問）

export type Question = {
  id: string;
  text: string;
  options: { value: string; label: string }[];
};

export const questions: Question[] = [
  {
    id: "time",
    text: "1日に副業へ使える時間は？",
    options: [
      { value: "30分以下", label: "30分以下" },
      { value: "1時間程度", label: "1時間程度" },
      { value: "2〜3時間", label: "2〜3時間" },
      { value: "4時間以上", label: "4時間以上" },
    ],
  },
  {
    id: "goal",
    text: "月いくらの副収入が目標？",
    options: [
      { value: "1〜3万円", label: "1〜3万円（お小遣い）" },
      { value: "5〜10万円", label: "5〜10万円（家計の足し）" },
      { value: "20万円以上", label: "20万円以上（本業並み）" },
      { value: "金額より経験", label: "金額より経験・スキル重視" },
    ],
  },
  {
    id: "social",
    text: "人とのやり取りは得意？",
    options: [
      { value: "得意・好き", label: "得意・好き" },
      { value: "普通", label: "普通" },
      { value: "苦手・避けたい", label: "苦手・避けたい" },
    ],
  },
  {
    id: "face",
    text: "顔出し・声出しは平気？",
    options: [
      { value: "両方OK", label: "顔出しも声出しもOK" },
      { value: "声だけOK", label: "声だけならOK" },
      { value: "どちらも避けたい", label: "どちらも避けたい" },
    ],
  },
  {
    id: "style",
    text: "自分の性格に近いのは？",
    options: [
      { value: "完璧主義", label: "完璧にやりたい・じっくり型" },
      { value: "行動派", label: "まず動く・走りながら考える型" },
      { value: "コツコツ型", label: "毎日少しずつ・継続型" },
    ],
  },
  {
    id: "investment",
    text: "初期投資はいくらまで出せる？",
    options: [
      { value: "0円", label: "0円（無料で始めたい）" },
      { value: "1万円まで", label: "1万円まで" },
      { value: "5万円まで", label: "5万円まで" },
      { value: "10万円以上OK", label: "10万円以上OK" },
    ],
  },
  {
    id: "physical",
    text: "体力的な余裕は？",
    options: [
      { value: "余裕あり", label: "余裕あり" },
      { value: "普通", label: "普通" },
      { value: "本業で疲れ気味", label: "本業で疲れ気味" },
    ],
  },
  {
    id: "skill",
    text: "今ある得意なこと・スキルは？（近いもの）",
    options: [
      { value: "文章・ライティング", label: "文章を書くこと" },
      { value: "デザイン・絵", label: "デザイン・絵" },
      { value: "話す・教える", label: "話す・教えること" },
      { value: "PC作業・データ", label: "PC作業・データ整理" },
      { value: "特になし", label: "特になし・これから身につけたい" },
    ],
  },
  {
    id: "risk",
    text: "リスクへの考え方は？",
    options: [
      { value: "安全第一", label: "安全第一・確実なものがいい" },
      { value: "多少のリスクOK", label: "多少のリスクは取れる" },
      { value: "リスク歓迎", label: "リスクを取ってでも大きく稼ぎたい" },
    ],
  },
  {
    id: "type",
    text: "どちらの働き方が好み？",
    options: [
      { value: "ストック型", label: "コツコツ積み上げて後で楽になる型" },
      { value: "フロー型", label: "働いた分すぐ収入になる型" },
    ],
  },
  {
    id: "place",
    text: "作業場所の希望は？",
    options: [
      { value: "完全在宅", label: "完全在宅がいい" },
      { value: "外出もOK", label: "外に出る作業もOK" },
    ],
  },
  {
    id: "speed",
    text: "収入が出るまでの期間、どこまで待てる？",
    options: [
      { value: "すぐ欲しい", label: "すぐ（1ヶ月以内）に欲しい" },
      { value: "数ヶ月OK", label: "数ヶ月は待てる" },
      { value: "1年でもOK", label: "1年かけて育てる覚悟がある" },
    ],
  },
  {
    id: "interest",
    text: "興味のある分野は？（近いもの）",
    options: [
      { value: "物販・せどり", label: "物販・せどり" },
      { value: "コンテンツ作成", label: "ブログ・動画・SNS発信" },
      { value: "スキル販売", label: "自分のスキルを売る" },
      { value: "投資・資産運用", label: "投資・資産運用" },
      { value: "まだ決めてない", label: "まだ決めてない" },
    ],
  },
  {
    id: "continuity",
    text: "これまで何かを継続できた経験は？",
    options: [
      { value: "ある", label: "ある（趣味や習慣など）" },
      { value: "短期で飽きがち", label: "短期で飽きがち" },
      { value: "わからない", label: "わからない" },
    ],
  },
  {
    id: "motivation",
    text: "副業を始めたい一番の理由は？",
    options: [
      { value: "生活費・家計", label: "生活費・家計のため" },
      { value: "将来の不安", label: "将来への備え" },
      { value: "自由・独立", label: "いずれ独立したい" },
      { value: "やりがい・成長", label: "やりがい・自己成長" },
    ],
  },
];
