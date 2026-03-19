"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, Check, Search, Pencil, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SuperAdminLayout from "@/components/admin/SuperAdminLayout";
import { LANGUAGES } from "@/contexts/LanguageContext";
import en from "@/locales/en.json";

const ENABLED_LANGUAGES_STORAGE_KEY = "enabledLanguages";
const SUPPORTED_LANGUAGES = LANGUAGES.map((l) => ({
  code: l.code,
  name: l.label,
  nativeName: l.label,
}));

// Flatten nested translation keys for display
function flattenKeys(obj, prefix = "") {
  const result = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      result.push(...flattenKeys(v, fullKey));
    } else {
      result.push({ key: fullKey, value: String(v) });
    }
  }
  return result;
}

export default function LanguageSettings() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [enabledLanguages, setEnabledLanguages] = useState(
    () => {
      if (typeof window === "undefined") {
        return new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
      }
      try {
        const raw = window.localStorage.getItem(ENABLED_LANGUAGES_STORAGE_KEY);
        if (!raw) return new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
        return new Set(["en", ...parsed.filter((code) => SUPPORTED_LANGUAGES.some((l) => l.code === code))]);
      } catch {
        return new Set(SUPPORTED_LANGUAGES.map((l) => l.code));
      }
    }
  );
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState(i18n.resolvedLanguage || i18n.language || "en");
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  const allKeys = useMemo(() => flattenKeys(en), []);

  const filteredKeys = useMemo(
    () =>
      search.trim()
        ? allKeys.filter(
            (item) =>
              item.key.toLowerCase().includes(search.toLowerCase()) ||
              item.value.toLowerCase().includes(search.toLowerCase())
          )
        : allKeys,
    [allKeys, search]
  );

  useEffect(() => {
    const onLanguageChanged = (lng) => {
      setSelectedLang(lng);
    };
    i18n.on("languageChanged", onLanguageChanged);
    return () => {
      i18n.off("languageChanged", onLanguageChanged);
    };
  }, [i18n]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      ENABLED_LANGUAGES_STORAGE_KEY,
      JSON.stringify(Array.from(enabledLanguages))
    );
  }, [enabledLanguages]);

  const toggleLanguage = (code) => {
    if (code === "en") return; // English always enabled
    const next = new Set(enabledLanguages);
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (next.has(code)) {
      next.delete(code);
      toast({ title: t("languages.languageDisabled", { language: lang?.name }) });
    } else {
      next.add(code);
      toast({ title: t("languages.languageEnabled", { language: lang?.name }) });
    }
    setEnabledLanguages(next);
  };

  const switchPreviewLanguage = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("appLanguage", code);
    }
  };

  return (
    <SuperAdminLayout
      title={t("languages.pageTitle")}
      subtitle={t("languages.pageSubtitle")}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {t("languages.pageTitle")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("languages.pageSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Languages Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-6 shadow-card mb-6"
        >
          <h2 className="text-lg font-display font-bold text-foreground mb-4">
            {t("languages.supported")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isEnabled = enabledLanguages.has(lang.code);
              const isActive = selectedLang === lang.code;
              return (
                <div
                  key={lang.code}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                  onClick={() => switchPreviewLanguage(lang.code)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {lang.nativeName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lang.name} ({lang.code.toUpperCase()})
                      </span>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <Check className="h-3 w-3 mr-0.5" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleLanguage(lang.code)}
                      disabled={lang.code === "en"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Translation Keys Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">
              {t("languages.translationKeys")}
            </h2>
            <Badge variant="outline" className="text-xs">
              {filteredKeys.length} keys
            </Badge>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("languages.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-border bg-secondary/50 text-sm"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[1fr_1fr] bg-muted text-xs font-semibold text-muted-foreground px-4 py-2.5">
              <span>{t("languages.key")}</span>
              <span>{selectedLang.toUpperCase()} — Value</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
              {filteredKeys.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("languages.noResults")}
                </div>
              ) : (
                filteredKeys.map((item) => (
                  <div
                    key={item.key}
                    className="grid grid-cols-[1fr_1fr] px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors items-center"
                    onDoubleClick={() => {
                      setEditingKey(item.key);
                      setEditValue(t(item.key));
                    }}
                  >
                    <span className="text-muted-foreground font-mono text-xs truncate">
                      {item.key}
                    </span>
                    {editingKey === item.key ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 text-sm rounded-lg"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Save the edited value to i18n resources
                            i18n.addResource(selectedLang, "translation", item.key, editValue);
                            toast({ title: t("languages.keySaved", { key: item.key }) });
                            setEditingKey(null);
                          }}
                          className="shrink-0 rounded-md p-1 text-primary hover:bg-primary/10 transition-colors"
                          title="Save"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingKey(null);
                          }}
                          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <span className="text-foreground truncate flex-1">
                          {t(item.key)}
                        </span>
                        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </SuperAdminLayout>
  );
}
