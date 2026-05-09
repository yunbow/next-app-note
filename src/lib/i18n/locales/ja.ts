export type Translations = {
  metadata: {
    siteTitle: string;
    siteDescription: string;
  };
  common: {
    search: string;
    login: string;
    logout: string;
    register: string;
    cancel: string;
    or: string;
    view: string;
    nameNotSet: string;
    getStarted: string;
    submitting: string;
    loading: string;
    appName: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  language: {
    ja: string;
    en: string;
  };
  nav: {
    dashboard: string;
    notes: string;
    folders: string;
    tags: string;
    profile: string;
    settings: string;
    explore: string;
  };
  accessibility: {
    showPassword: string;
    hidePassword: string;
    switchLanguage: string;
    switchTheme: string;
    required: string;
    homeLink: string;
    footerNavigation: string;
    skipToContent: string;
    selectLanguage: string;
    selectTheme: string;
    selectFontSize: string;
    selectColorVision: string;
    userMenu: string;
  };
  footer: {
    terms: string;
    privacy: string;
    cookies: string;
    about: string;
    copyright: string;
  };
  login: {
    title: string;
    description: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    submit: string;
    submitting: string;
    noAccount: string;
    invalidCredentials: string;
    failed: string;
    continueWithGoogle: string;
    continueWithGithub: string;
  };
  registration: {
    success: string;
    failed: string;
    submitting: string;
    complete: string;
    sendEmail: string;
    sending: string;
    title: string;
    description: string;
    emailSent: string;
    emailSentDescription: string;
    devPreview: string;
    devTo: string;
    devSubject: string;
    devBody: string;
    devBodyText: string;
    devLinkValid: string;
    backToLogin: string;
    alreadyHaveAccount: string;
    termsAgreePrefix: string;
    termsConnector: string;
    termsIncludingCookie: string;
    termsAgreeSuffix: string;
    termsLink: string;
    privacyLink: string;
    cookieLink: string;
  };
  landing: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      cta: string;
      secondaryCta: string;
      imageAlt: string;
    };
    features: {
      eyebrow: string;
      title: string;
      subtitle: string;
      markdown: {
        title: string;
        description: string;
      };
      organize: {
        title: string;
        description: string;
      };
      links: {
        title: string;
        description: string;
      };
      share: {
        title: string;
        description: string;
      };
    };
    proof: {
      markdown: string;
      links: string;
      sharing: string;
    };
    workflow: {
      eyebrow: string;
      title: string;
      subtitle: string;
      capture: {
        title: string;
        description: string;
      };
      organize: {
        title: string;
        description: string;
      };
      share: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      description: string;
    };
  };
  cookieConsent: {
    message: string;
    accept: string;
    decline: string;
  };
  settings: {
    title: string;
    appearance: string;
    appearanceDescription: string;
    language: string;
    languageDescription: string;
    theme: string;
    themeDescription: string;
    fontSize: string;
    fontSizeDescription: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    colorVision: string;
    colorVisionDescription: string;
    colorVisionNormal: string;
    colorVisionProtanopia: string;
    colorVisionDeuteranopia: string;
    colorVisionTritanopia: string;
    account: string;
    accountDescription: string;
  };
  sidebar: {
    collapse: string;
    expand: string;
    logout: string;
    logoutConfirm: string;
    logoutDescription: string;
  };
  profile: {
    editProfile: string;
    editTitle: string;
    registeredAt: string;
    email: string;
    userId: string;
    nameLabel: string;
    namePlaceholder: string;
    userIdLabel: string;
    userIdPlaceholder: string;
    userIdHelp: string;
    imageHelp: string;
    imageUpdated: string;
    updated: string;
    saving: string;
    save: string;
  };
};

export const ja: Translations = {
  metadata: {
    siteTitle: "Note - オンラインメモ共有",
    siteDescription:
      "Markdownエディタを備えたリアルタイム編集対応のメモ共有アプリケーション",
  },

  common: {
    search: "検索...",
    login: "ログイン",
    logout: "ログアウト",
    register: "新規登録",
    cancel: "キャンセル",
    or: "または",
    view: "見る",
    nameNotSet: "名前未設定",
    getStarted: "始める",
    submitting: "送信中...",
    loading: "読み込み中...",
    appName: "Note",
  },

  theme: {
    light: "ライト",
    dark: "ダーク",
    system: "システム",
  },

  language: {
    ja: "日本語",
    en: "English",
  },

  nav: {
    dashboard: "ダッシュボード",
    notes: "ノート",
    folders: "フォルダ",
    tags: "タグ",
    profile: "プロフィール",
    settings: "設定",
    explore: "検索",
  },

  accessibility: {
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを非表示",
    switchLanguage: "言語を切り替え",
    switchTheme: "テーマを切り替え",
    required: "必須",
    homeLink: "ホームページへ",
    footerNavigation: "フッターナビゲーション",
    skipToContent: "メインコンテンツへスキップ",
    selectLanguage: "言語を選択",
    selectTheme: "テーマを選択",
    selectFontSize: "フォントサイズを選択",
    selectColorVision: "色覚サポートを選択",
    userMenu: "ユーザーメニュー",
  },

  footer: {
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    cookies: "Cookieポリシー",
    about: "作成者",
    copyright: "© 2026 Note. All rights reserved.",
  },

  profile: {
    editProfile: "プロフィール編集",
    editTitle: "プロフィール編集",
    registeredAt: "登録日: ",
    email: "メールアドレス",
    userId: "ユーザーID",
    nameLabel: "ユーザー名",
    namePlaceholder: "表示名を入力",
    userIdLabel: "ユーザーID",
    userIdPlaceholder: "英数字、ハイフン、アンダースコア",
    userIdHelp: "3〜30文字の英数字、ハイフン、アンダースコアが使用できます",
    imageHelp: "クリックして画像を変更（JPEG, PNG, GIF, WebP / 5MB以下）",
    imageUpdated: "プロフィール画像を更新しました",
    updated: "プロフィールを更新しました",
    saving: "保存中...",
    save: "保存",
  },

  login: {
    title: "ログイン",
    description: "アカウントにログインしてください",
    email: "メールアドレス",
    emailPlaceholder: "example@example.com",
    password: "パスワード",
    submit: "ログイン",
    submitting: "ログイン中...",
    noAccount: "アカウントをお持ちでないですか？",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません",
    failed: "ログインに失敗しました",
    continueWithGoogle: "Googleでログイン",
    continueWithGithub: "GitHubでログイン",
  },

  registration: {
    success: "登録が完了しました",
    failed: "登録に失敗しました",
    submitting: "登録中...",
    complete: "登録を完了する",
    sendEmail: "登録メールを送信",
    sending: "送信中...",
    title: "新規登録",
    description: "メールアドレスを入力して登録を開始してください",
    emailSent: "確認メールを送信しました",
    emailSentDescription:
      "メールに記載されたリンクをクリックして登録を完了してください",
    devPreview: "開発環境プレビュー",
    devTo: "宛先",
    devSubject: "件名",
    devBody: "本文",
    devBodyText:
      "以下のリンクをクリックして、アカウント登録を完了してください。このリンクは24時間有効です。",
    devLinkValid: "※ このリンクは24時間有効です",
    backToLogin: "ログインページに戻る",
    alreadyHaveAccount: "既にアカウントをお持ちですか？",
    termsAgreePrefix: "登録することで、",
    termsConnector: "、",
    termsIncludingCookie: "（{cookie}を含む）",
    termsAgreeSuffix: "に同意したものとみなされます。",
    termsLink: "利用規約",
    privacyLink: "プライバシーポリシー",
    cookieLink: "Cookieポリシー",
  },

  landing: {
    hero: {
      eyebrow: "Markdownで書き、つなげて、必要な人へ共有",
      title: "思考を整理し、アイデアを共有",
      subtitle: "Markdownエディタとリアルタイム編集で、効率的なメモ管理を実現",
      cta: "無料で始める",
      secondaryCta: "ログイン",
      imageAlt:
        "NoteのMarkdownエディタ、ノート一覧、共有設定を表示した画面イメージ",
    },
    features: {
      eyebrow: "主な機能",
      title: "主な機能",
      subtitle:
        "書く、整理する、つなげる、共有する。メモ管理に必要な流れをひとつの場所にまとめます。",
      markdown: {
        title: "Markdownエディタ",
        description:
          "見出し、チェックリスト、コード、リンクを軽快に書ける編集体験。",
      },
      organize: {
        title: "整理・管理",
        description:
          "フォルダとタグで情報を分類し、後から見つけやすい状態を保てます。",
      },
      links: {
        title: "ノート間リンク",
        description:
          "関連するメモをつなぎ、仕様、議事録、調査メモを知識として育てられます。",
      },
      share: {
        title: "共有",
        description:
          "公開範囲、パスワード、有効期限を使って、必要な相手にだけ届けられます。",
      },
    },
    proof: {
      markdown: "Markdown対応",
      links: "ノート間リンク",
      sharing: "共有・公開設定",
    },
    workflow: {
      eyebrow: "メモが散らからない流れ",
      title: "思いつきから共有資料まで、同じ場所で進める",
      subtitle:
        "個人の下書き、チームの議事録、公開用メモを分断せず、状態に合わせて整理と共有を切り替えられます。",
      capture: {
        title: "すばやく書き始める",
        description:
          "Markdownで構造化しながら、会議メモや仕様メモをその場で残せます。",
      },
      organize: {
        title: "タグとフォルダで見失わない",
        description:
          "プロジェクト、カテゴリ、関連タグで分類し、検索前提のメモ倉庫にしません。",
      },
      share: {
        title: "必要な粒度で共有する",
        description:
          "共同編集、限定共有、公開リンクを使い分けて、メモをそのまま情報共有に使えます。",
      },
    },
    cta: {
      title: "チームにも個人にもなじむ、軽いノート基盤を作りましょう",
      description:
        "まずはアカウントを作成して、Markdownで書ける共有ノート環境を試してください。",
    },
  },

  cookieConsent: {
    message:
      "当サイトではCookieを使用して、サービスの品質向上とユーザー体験の最適化を図っています。",
    accept: "同意する",
    decline: "拒否する",
  },

  settings: {
    title: "設定",
    appearance: "外観",
    appearanceDescription: "アプリケーションの外観をカスタマイズします",
    language: "表示言語",
    languageDescription: "表示言語を選択してください",
    theme: "テーマ",
    themeDescription: "アプリケーションのテーマを選択してください",
    fontSize: "フォントサイズ",
    fontSizeDescription: "テキストのサイズを調整します",
    fontSizeSmall: "小",
    fontSizeMedium: "中",
    fontSizeLarge: "大",
    colorVision: "色覚サポート",
    colorVisionDescription: "色覚特性に応じた表示に調整します",
    colorVisionNormal: "通常",
    colorVisionProtanopia: "1型色覚（赤）",
    colorVisionDeuteranopia: "2型色覚（緑）",
    colorVisionTritanopia: "3型色覚（青）",
    account: "アカウント情報",
    accountDescription: "アカウント設定を管理します",
  },

  sidebar: {
    collapse: "サイドバーを閉じる",
    expand: "サイドバーを開く",
    logout: "ログアウト",
    logoutConfirm: "ログアウトしますか？",
    logoutDescription: "ログアウトすると、再度ログインが必要になります。",
  },
};
