import type { Translations } from "./ja";

export const en: Translations = {
  metadata: {
    siteTitle: "Note - Online Note Sharing",
    siteDescription: "Real-time collaborative note-taking app with Markdown editor",
  },

  common: {
    search: "Search...",
    login: "Login",
    logout: "Logout",
    register: "Sign Up",
    cancel: "Cancel",
    or: "or",
    view: "View",
    nameNotSet: "Name not set",
    getStarted: "Get Started",
    submitting: "Submitting...",
    loading: "Loading...",
    appName: "Note",
  },

  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  language: {
    ja: "日本語",
    en: "English",
  },

  nav: {
    dashboard: "Dashboard",
    notes: "Notes",
    folders: "Folders",
    tags: "Tags",
    profile: "Profile",
    settings: "Settings",
  },

  accessibility: {
    showPassword: "Show password",
    hidePassword: "Hide password",
    switchLanguage: "Switch language",
    switchTheme: "Switch theme",
    required: "Required",
    homeLink: "Go to home page",
    footerNavigation: "Footer navigation",
    skipToContent: "Skip to main content",
    selectLanguage: "Select language",
    selectTheme: "Select theme",
    selectFontSize: "Select font size",
    selectColorVision: "Select color vision support",
    userMenu: "User menu",
  },

  footer: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    about: "About",
    copyright: "© 2026 Note. All rights reserved.",
  },

  profile: {
    editProfile: "Edit Profile",
    editTitle: "Edit Profile",
    registeredAt: "Registered: ",
    email: "Email",
    userId: "User ID",
    nameLabel: "Display Name",
    namePlaceholder: "Enter display name",
    userIdLabel: "User ID",
    userIdPlaceholder: "Alphanumeric, hyphens, underscores",
    userIdHelp: "3-30 characters, alphanumeric, hyphens, and underscores",
    imageHelp: "Click to change image (JPEG, PNG, GIF, WebP / 5MB max)",
    imageUpdated: "Profile image updated",
    updated: "Profile updated",
    saving: "Saving...",
    save: "Save",
  },

  login: {
    title: "Login",
    description: "Login to your account",
    email: "Email",
    emailPlaceholder: "example@example.com",
    password: "Password",
    submit: "Login",
    submitting: "Logging in...",
    noAccount: "Don't have an account?",
    invalidCredentials: "Invalid email or password",
    failed: "Login failed",
    continueWithGoogle: "Continue with Google",
    continueWithGithub: "Continue with GitHub",
  },

  registration: {
    success: "Registration completed",
    failed: "Registration failed",
    submitting: "Registering...",
    complete: "Complete Registration",
    sendEmail: "Send Registration Email",
    sending: "Sending...",
    title: "Sign Up",
    description: "Enter your email to start registration",
    emailSent: "Verification Email Sent",
    emailSentDescription:
      "Please click the link in the email to complete registration",
    devPreview: "Development Environment Preview",
    devTo: "To",
    devSubject: "Subject",
    devBody: "Body",
    devBodyText:
      "Click the link below to complete your account registration. This link is valid for 24 hours.",
    devLinkValid: "* This link is valid for 24 hours",
    backToLogin: "Back to login",
    alreadyHaveAccount: "Already have an account?",
    termsAgreePrefix: "By registering, you agree to our ",
    termsConnector: ", ",
    termsIncludingCookie: "(including {cookie})",
    termsAgreeSuffix: ".",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    cookieLink: "Cookie Policy",
  },

  landing: {
    hero: {
      title: "Organize Thoughts, Share Ideas",
      subtitle:
        "Efficient note management with Markdown editor and real-time collaboration",
      cta: "Get Started for Free",
    },
    features: {
      title: "Key Features",
      markdown: {
        title: "Markdown Editor",
        description: "Create beautifully formatted notes with intuitive Markdown editor",
      },
      realtime: {
        title: "Real-time Editing",
        description: "Collaborate seamlessly with simultaneous multi-user editing",
      },
      organize: {
        title: "Organize & Manage",
        description: "Organize notes with folders and tags, find what you need quickly",
      },
      share: {
        title: "Share",
        description: "Easily share notes and exchange ideas with team members",
      },
    },
  },

  cookieConsent: {
    message:
      "We use cookies to improve service quality and optimize user experience.",
    accept: "Accept",
    decline: "Decline",
  },

  settings: {
    title: "Settings",
    appearance: "Appearance",
    appearanceDescription: "Customize the appearance of the application",
    language: "Display Language",
    languageDescription: "Select your preferred language",
    theme: "Theme",
    themeDescription: "Select the application theme",
    fontSize: "Font Size",
    fontSizeDescription: "Adjust the text size",
    fontSizeSmall: "Small",
    fontSizeMedium: "Medium",
    fontSizeLarge: "Large",
    colorVision: "Color Vision Support",
    colorVisionDescription: "Adjust display for color vision characteristics",
    colorVisionNormal: "Normal",
    colorVisionProtanopia: "Protanopia (Red)",
    colorVisionDeuteranopia: "Deuteranopia (Green)",
    colorVisionTritanopia: "Tritanopia (Blue)",
    account: "Account Information",
    accountDescription: "Manage your account settings",
  },

  sidebar: {
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    logout: "Logout",
    logoutConfirm: "Logout?",
    logoutDescription: "You will need to log in again after logging out.",
  },
};
