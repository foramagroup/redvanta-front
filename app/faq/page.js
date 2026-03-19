"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const categories = ["All", "General", "Pricing", "Features", "Integrations", "Security", "Support"];

const faqs = [
  { q: "What is REDVANTA?", a: "REDVANTA is a comprehensive reputation management platform that helps businesses monitor, collect, and respond to customer reviews across all major platforms — all from a single dashboard.", category: "General" },
  { q: "How does the review collection system work?", a: "Our smart NFC cards and QR codes direct customers to leave reviews. The system uses intelligent routing to guide satisfied customers to public review sites while privately capturing feedback from less satisfied ones.", category: "General" },
  { q: "What platforms do you integrate with?", a: "We integrate with Google Business, Trustpilot, Yelp, Facebook, TripAdvisor, and 50+ other review platforms. Custom integrations are available via our API.", category: "Integrations" },
  { q: "Can I connect my existing CRM?", a: "Yes. REDVANTA integrates with major CRMs including Salesforce, HubSpot, and Pipedrive. We also offer webhooks and a REST API for custom integrations.", category: "Integrations" },
  { q: "What pricing plans are available?", a: "We offer Starter, Professional, and Enterprise plans. Each includes different levels of locations, API access, and features. Visit our pricing page for detailed comparisons.", category: "Pricing" },
  { q: "Is there a free trial?", a: "Yes, we offer a 14-day free trial on all plans with no credit card required. You get full access to all features during the trial period.", category: "Pricing" },
  { q: "Can I change my plan later?", a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle, with prorated adjustments.", category: "Pricing" },
  { q: "What AI features are included?", a: "Our AI assists with automated review response drafting, sentiment analysis, trend detection, and smart routing of customer feedback based on satisfaction scores.", category: "Features" },
  { q: "Do you support multi-location businesses?", a: "Yes. Our platform is built for multi-location management with centralized dashboards, location-level analytics, and team access controls.", category: "Features" },
  { q: "How do you handle data security?", a: "We use enterprise-grade encryption (AES-256), SOC 2 compliant infrastructure, GDPR compliance, and regular security audits. All data is stored in ISO 27001 certified data centers.", category: "Security" },
  { q: "Is my data GDPR compliant?", a: "Yes. We are fully GDPR compliant with data processing agreements, right to deletion support, and transparent data handling policies.", category: "Security" },
  { q: "What support channels are available?", a: "We offer email support, live chat, phone support (Business & Enterprise), and a comprehensive knowledge base. Enterprise plans include a dedicated account manager.", category: "Support" },
  { q: "Do you offer onboarding assistance?", a: "Yes. All plans include guided onboarding. Professional and Enterprise plans include dedicated onboarding sessions with a customer success manager.", category: "Support" },
  { q: "What is the white-label agency program?", a: "Our agency program lets you resell REDVANTA under your own brand. You get custom branding, sub-account management, consolidated billing, and dedicated agency support.", category: "General" },
];

const FAQ = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = faqs.filter(f => {
    const matchCategory = activeCategory === "All" || f.category === activeCategory;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-gradient-red">Questions</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">Find answers to common questions about REDVANTA's platform, pricing, and features.</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..." className="pl-10 bg-card border-border/50" />
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground glow-red-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No matching questions found</p>
              <p className="text-sm mt-1">Try a different search term or category</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-3">
              {filtered.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border/50 rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors">
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline py-4">
                    <div className="flex items-start gap-3 pr-4">
                      <span className="shrink-0 mt-0.5 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{faq.category}</span>
                      <span>{faq.q}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pl-0 sm:pl-[72px]">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors glow-red">
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
