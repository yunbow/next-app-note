type PlanConfig = {
  name: string;
  priceId: string | null;
  price: number;
  description: string;
  features: readonly string[];
  limitations: readonly string[];
};

export const PLANS: Record<"free" | "basic" | "premium", PlanConfig> = {
  free: {
    name: "Free",
    priceId: null,
    price: 0,
    description: "個人利用の基本的なノート管理",
    features: [
      "ノート最大10件",
      "基本的なマークダウン編集",
      "タグ・カテゴリ管理",
      "共有リンク（閲覧専用）",
    ],
    limitations: [
      "バージョン履歴なし",
      "テンプレートなし",
      "パスワード保護なし",
      "ノート間リンクなし",
    ],
  },
  basic: {
    name: "Basic",
    priceId: process.env.STRIPE_BASIC_PRICE_ID ?? null,
    price: 500,
    description: "日常的なノート活用に最適",
    features: [
      "ノート無制限",
      "バージョン履歴（30日間）",
      "テンプレート（最大5件）",
      "タグ・カテゴリ管理",
      "共有リンク＋パスワード保護",
      "優先サポート",
    ],
    limitations: [
      "共有の有効期限設定なし",
      "ノート間リンクなし",
    ],
  },
  premium: {
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? null,
    price: 1500,
    description: "ヘビーユーザー向け全機能解放",
    features: [
      "ノート無制限",
      "バージョン履歴（無制限）",
      "テンプレート（無制限）",
      "タグ・カテゴリ管理",
      "共有（パスワード＋有効期限＋権限設定）",
      "ノート間リンク（グラフ構造）",
      "フォロー機能",
      "専用サポート",
    ],
    limitations: [],
  },
};

export const PLAN_LIMITS: Record<
  "free" | "basic" | "premium",
  {
    maxNotes: number | null;
    versionHistoryDays: number | null;
    maxTemplates: number | null;
    sharePassword: boolean;
    shareExpiry: boolean;
    shareEditPermission: boolean;
    noteLinks: boolean;
  }
> = {
  free: {
    maxNotes: 10,
    versionHistoryDays: 0,
    maxTemplates: 0,
    sharePassword: false,
    shareExpiry: false,
    shareEditPermission: false,
    noteLinks: false,
  },
  basic: {
    maxNotes: null,
    versionHistoryDays: 30,
    maxTemplates: 5,
    sharePassword: true,
    shareExpiry: false,
    shareEditPermission: false,
    noteLinks: false,
  },
  premium: {
    maxNotes: null,
    versionHistoryDays: null,
    maxTemplates: null,
    sharePassword: true,
    shareExpiry: true,
    shareEditPermission: true,
    noteLinks: true,
  },
};

export type PlanType = keyof typeof PLANS;
