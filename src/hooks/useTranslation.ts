import { useState } from "react";
import { translations } from "../locales/translations";

export function useTranslation() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  const t = (
    key: keyof typeof translations.en,
    params?: Record<string, string>,
  ) => {
    let text =
      (
        translations[lang as keyof typeof translations] as Record<
          string,
          string
        >
      )?.[key] ?? key;

    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{{${paramKey}}}`, params[paramKey]);
      });
    }

    return text;
  };

  const changeLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  return { t, lang, changeLang };
}
