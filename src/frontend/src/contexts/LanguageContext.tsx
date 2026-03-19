import { createContext, useContext, useState } from "react";
import { translations } from "./translations";

type Lang = "en" | "te";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("hcn_lang") as Lang) || "en",
  );

  const setLang = (l: Lang) => {
    localStorage.setItem("hcn_lang", l);
    setLangState(l);
  };

  const t = (key: string): string =>
    translations[lang]?.[key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
