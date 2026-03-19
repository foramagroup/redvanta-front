"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import es from "@/locales/es.json";
import de from "@/locales/de.json";
import ro from "@/locales/ro.json";
import ru from "@/locales/ru.json";
import ar from "@/locales/ar.json";
import zh from "@/locales/zh.json";

const allLocales = { en, fr, es, de, ro, ru, ar, zh };
const STORAGE_KEY = "appLanguage";

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

const defaultValue = {
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  dir: "ltr",
};

const LanguageContext = createContext(defaultValue);

export const useLanguage = () => useContext(LanguageContext);

const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
  return path
    .split(".")
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
};

const interpolate = (value, vars = {}) => {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{(.*?)\}\}/g, (_, name) => {
    const key = String(name).trim();
    return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
  });
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && allLocales[saved] && saved !== "en") {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((nextLang) => {
    if (!allLocales[nextLang]) return;
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    }
    if (typeof document !== "undefined") {
      document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = nextLang;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = useCallback(
    (key, vars = {}) => {
      const localized = getNestedValue(allLocales[lang], key);
      const fallback = getNestedValue(allLocales.en, key);
      return interpolate(localized ?? fallback ?? key, vars);
    },
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};
