export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    price: 0,
    features: ["ノート最大10件", "基本的なマークダウン編集", "バージョン履歴なし"],
  },
  basic: {
    name: "Basic",
    priceId: process.env.STRIPE_BASIC_PRICE_ID ?? null,
    price: 500,
    features: ["ノート無制限", "バージョン履歴30日", "タグ・カテゴリ管理", "優先サポート"],
  },
  premium: {
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? null,
    price: 1500,
    features: [
      "全機能無制限",
      "バージョン履歴無制限",
      "ノート共有・共同編集",
      "APIアクセス",
      "専用サポート",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
