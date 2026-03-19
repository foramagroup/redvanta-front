"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fadeUp } from "@/lib/animations";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();

  const contactInfo = [
    { icon: Mail, titleKey: "contact.email_us", infoKey: "contact.email_address", descKey: "contact.email_desc" },
    { icon: MessageSquare, titleKey: "contact.book_demo", infoKey: "contact.book_demo_info", descKey: "contact.book_demo_desc" },
    { icon: MapPin, titleKey: "contact.headquarters", infoKey: "contact.hq_location", descKey: "contact.hq_desc" },
  ];

  return (
    <div className="bg-gradient-dark pt-32">
      <section className="section-spacing">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" className="mx-auto max-w-3xl text-center">
            <motion.h1 variants={fadeUp} custom={0} className="font-display text-4xl font-bold md:text-6xl">
              {t("contact.hero_title_1")} <span className="text-gradient-red">{t("contact.hero_title_2")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-lg text-muted-foreground">
              {t("contact.hero_desc")}
            </motion.p>
          </motion.div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} custom={0} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("contact.full_name")}</label>
                  <Input className="mt-2 bg-card border-border/50 text-foreground" placeholder={t("contact.placeholder_name")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("contact.email")}</label>
                  <Input className="mt-2 bg-card border-border/50 text-foreground" placeholder={t("contact.placeholder_email")} type="email" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("contact.company")}</label>
                  <Input className="mt-2 bg-card border-border/50 text-foreground" placeholder={t("contact.placeholder_company")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t("contact.message")}</label>
                  <Textarea className="mt-2 bg-card border-border/50 text-foreground min-h-[120px]" placeholder={t("contact.placeholder_message")} />
                </div>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-red-hover">
                  {t("contact.send_message")}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
              {contactInfo.map((item, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="flex gap-4 rounded-xl border border-border/50 bg-gradient-card p-6">
                  <item.icon className="text-primary shrink-0" size={24} />
                  <div>
                    <h3 className="font-display font-semibold">{t(item.titleKey)}</h3>
                    <p className="mt-1 text-sm text-primary">{t(item.infoKey)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(item.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
