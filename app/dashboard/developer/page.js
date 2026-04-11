"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Code2, Copy, Download, Globe, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const codeExamples = {
  Node: `const axios = require('axios');\n\nconst res = await axios.get(\n  'https://api.opinoor.com/v1/reviews',\n  {\n    headers: {\n      'Authorization': 'Bearer rv_live_sk_your_key',\n      'Content-Type': 'application/json'\n    }\n  }\n);\n\nconsole.log(res.data);`,
  Python: `import requests\n\nresponse = requests.get(\n    "https://api.opinoor.com/v1/reviews",\n    headers={\n        "Authorization": "Bearer rv_live_sk_your_key",\n        "Content-Type": "application/json"\n    }\n)\n\nprint(response.json())`,
  cURL: `curl -X GET \\\n  https://api.opinoor.com/v1/reviews \\\n  -H "Authorization: Bearer rv_live_sk_your_key" \\\n  -H "Content-Type: application/json"`,
};

const samplePayload = `{\n  "data": [\n    {\n      "id": "rev_a1b2c3d4",\n      "rating": 5,\n      "customer_name": "John D.",\n      "content": "Excellent service...",\n      "source": "nfc",\n      "location_id": "loc_xyz",\n      "created_at": "2026-02-24T14:30:00Z",\n      "status": "public"\n    }\n  ],\n  "meta": {\n    "total": 1247,\n    "page": 1,\n    "per_page": 20\n  }\n}`;

const endpoints = [
  { method: "GET", path: "/v1/reviews", desc: "List all reviews" },
  { method: "GET", path: "/v1/reviews/:id", desc: "Get single review" },
  { method: "POST", path: "/v1/requests", desc: "Send review request" },
  { method: "GET", path: "/v1/locations", desc: "List locations" },
  { method: "GET", path: "/v1/analytics", desc: "Get analytics data" },
  { method: "POST", path: "/v1/webhooks", desc: "Register webhook" },
];

const methodColors = { GET: "text-emerald-400 bg-emerald-400/10", POST: "text-blue-400 bg-blue-400/10", PUT: "text-amber-400 bg-amber-400/10", DELETE: "text-red-400 bg-red-400/10" };

const DeveloperAccess = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("Node");
  const [sandbox, setSandbox] = useState(false);

  return (
    <DashboardLayout title={t("devac.title")} subtitle={t("devac.subtitle")}>
      <motion.div variants={fadeUp} custom={0} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Globe size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("devac.api_overview")}</h3><p className="text-xs text-muted-foreground">{t("devac.api_desc")}</p></div></div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 rounded-lg bg-secondary/30 p-4"><span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">{t("devac.base_url")}</span><div className="flex items-center gap-2"><code className="text-sm font-mono text-primary">https://api.opinoor.com/v1</code><button className="text-muted-foreground hover:text-foreground"><Copy size={14} /></button></div></div>
          <div className="rounded-lg bg-secondary/30 p-4 flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{t("devac.sandbox_mode")}</span>
            <button onClick={() => setSandbox(!sandbox)} className="text-primary">{sandbox ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-muted-foreground" />}</button>
            <span className={`text-xs font-medium ${sandbox ? "text-amber-400" : "text-muted-foreground"}`}>{sandbox ? t("devac.active") : t("devac.off")}</span>
          </div>
        </div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{t("devac.endpoints")}</h4>
        <div className="space-y-1.5">
          {endpoints.map((ep, i) => (<div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/20 px-4 py-2.5"><span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${methodColors[ep.method]}`}>{ep.method}</span><code className="text-xs font-mono text-foreground flex-1">{ep.path}</code><span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span></div>))}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} custom={1} className="rounded-xl border border-border/50 bg-gradient-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Code2 size={20} className="text-primary" /></div><div><h3 className="font-display font-semibold">{t("devac.code_examples")}</h3><p className="text-xs text-muted-foreground">{t("devac.code_desc")}</p></div></div>
          <Button size="sm" variant="outline" className="gap-2 border-border/50"><Download size={14} /> {t("devac.postman")}</Button>
        </div>
        <div className="flex gap-1 mb-4">{Object.keys(codeExamples).map((lang) => (<button key={lang} onClick={() => setActiveTab(lang)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === lang ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>{lang}</button>))}</div>
        <div className="relative"><pre className="rounded-lg bg-[hsl(0,0%,6%)] border border-border/30 p-4 overflow-x-auto"><code className="text-xs font-mono text-muted-foreground whitespace-pre">{codeExamples[activeTab]}</code></pre><button className="absolute top-3 right-3 p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground"><Copy size={14} /></button></div>
      </motion.div>

      <motion.div variants={fadeUp} custom={2} className="rounded-xl border border-border/50 bg-gradient-card p-6">
        <h3 className="font-display font-semibold mb-4">{t("devac.sample_response")}</h3>
        <div className="relative"><pre className="rounded-lg bg-[hsl(0,0%,6%)] border border-border/30 p-4 overflow-x-auto"><code className="text-xs font-mono text-muted-foreground whitespace-pre">{samplePayload}</code></pre><button className="absolute top-3 right-3 p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground"><Copy size={14} /></button></div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DeveloperAccess;
