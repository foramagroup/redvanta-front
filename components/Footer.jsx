"use client";

import Link from "next/link";
import BookDemoModal from "@/components/BookDemoModal";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="font-display text-2xl font-bold tracking-tight">
              RED<span className="text-gradient-red">VANTA</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">{t("footer.product")}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.features")}</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.pricing")}</Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.dashboard")}</Link>
              <Link href="/agency" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.agency")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">{t("footer.company")}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.contact")}</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.faq")}</Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.privacy")}</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.terms")}</a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4">{t("footer.get_started")}</h4>
            <div className="flex flex-col gap-3">
              <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.start_trial")}</Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.login")}</Link>
              <BookDemoModal><button className="text-sm text-muted-foreground hover:text-primary transition-colors text-left">{t("footer.book_demo")}</button></BookDemoModal>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
          <p className="text-xs text-muted-foreground">{t("footer.motto")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
