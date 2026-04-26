"use client";

import { useLocale } from "./context";

export function useTranslations() {
  const { t: translations } = useLocale();
  
  // ネストされたオブジェクトから値を取得するヘルパー関数
  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split(".");
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // パラメータ置換
    if (typeof value === "string" && params) {
      return Object.entries(params).reduce(
        (str, [key, val]) => str.replace(`{${key}}`, val),
        value
      );
    }
    
    return value;
  };
  
  return { t };
}
