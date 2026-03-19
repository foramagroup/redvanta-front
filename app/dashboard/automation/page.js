"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import DashboardLayout from "@/components/DashboardLayout";
import { Zap, Clock, Mail, Phone, Play, Eye, X, Plus, CreditCard, Calendar, Hand, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const initialWorkflows = [
  { id: 1, name: "Post-Payment Review Request", trigger: "After payment", triggerIcon: CreditCard, action: "Send SMS", actionIcon: Phone, delay: "2 hours", enabled: true, template: "Hi {customer_name}! Thank you for visiting {business_name}. We'd love your feedback: {review_link}", stats: { sent: 245, converted: 82 } },
  { id: 2, name: "Appointment Follow-up", trigger: "After appointment", triggerIcon: Calendar, action: "Send Email", actionIcon: Mail, delay: "24 hours", enabled: true, template: "Dear {customer_name}, we hope you enjoyed your visit at {business_name}. Share your experience: {review_link}", stats: { sent: 128, converted: 41 } },
  { id: 3, name: "Manual Campaign", trigger: "Manual trigger", triggerIcon: Hand, action: "Send SMS", actionIcon: Phone, delay: "Immediate", enabled: false, template: "{customer_name}, your opinion matters! Rate us here: {review_link}", stats: { sent: 67, converted: 19 } },
];

const Automation = () => {
  const { t } = useLanguage();
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [newWf, setNewWf] = useState({ name: "", trigger: "After payment", action: "Send SMS", delay: "2 hours", template: "" });

  const createWorkflow = () => {
    const wf = { id: workflows.length + 1, name: newWf.name || "New Workflow", trigger: newWf.trigger, triggerIcon: CreditCard, action: newWf.action, actionIcon: newWf.action === "Send SMS" ? Phone : Mail, delay: newWf.delay, enabled: false, template: newWf.template || "Hi {customer_name}, share your experience: {review_link}", stats: { sent: 0, converted: 0 } };
    setWorkflows((prev) => [...prev, wf]);
    setShowNewWorkflow(false);
    setNewWf({ name: "", trigger: "After payment", action: "Send SMS", delay: "2 hours", template: "" });
    toast({ title: t("auto.created"), description: `"${wf.name}"` });
  };

  return (
    <DashboardLayout title={t("auto.title")} subtitle={t("auto.subtitle")}
      headerAction={<Button size="sm" className="gap-2 glow-red-hover" onClick={() => setShowNewWorkflow(true)}><Plus size={16} /> {t("auto.new_workflow")}</Button>}
    >
      <motion.div variants={fadeUp} custom={0} className="space-y-4">
        {workflows.map((wf) => (
          <motion.div key={wf.id} variants={fadeUp} custom={wf.id * 0.5} className={`rounded-xl border bg-gradient-card p-6 transition-all ${wf.enabled ? "border-border/50" : "border-border/30 opacity-60"}`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Zap size={20} className="text-primary" /></div>
                  <div>
                    <h3 className="font-display font-semibold">{wf.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${wf.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>{wf.enabled ? t("auto.active") : t("auto.disabled_status")}</span>
                  </div>
                  <button className={`ml-auto lg:hidden relative w-10 h-5 rounded-full transition-colors ${wf.enabled ? "bg-primary" : "bg-muted"}`} onClick={() => setWorkflows((p) => p.map((w) => w.id === wf.id ? { ...w, enabled: !w.enabled } : w))}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${wf.enabled ? "left-5" : "left-0.5"}`} /></button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-2"><wf.triggerIcon size={14} className="text-primary" /><span>{wf.trigger}</span></div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-2"><Clock size={14} className="text-muted-foreground" /><span>{wf.delay}</span></div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-2"><wf.actionIcon size={14} className="text-primary" /><span>{wf.action}</span></div>
                </div>
              </div>
              <div className="flex gap-4 lg:gap-6">
                <div className="text-center"><span className="font-display text-xl font-bold block">{wf.stats.sent}</span><span className="text-[10px] text-muted-foreground">{t("auto.sent")}</span></div>
                <div className="text-center"><span className="font-display text-xl font-bold block">{wf.stats.converted}</span><span className="text-[10px] text-muted-foreground">{t("auto.converted")}</span></div>
                <div className="text-center"><span className="font-display text-xl font-bold text-primary block">{wf.stats.sent > 0 ? Math.round((wf.stats.converted / wf.stats.sent) * 100) : 0}%</span><span className="text-[10px] text-muted-foreground">{t("auto.rate")}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs border-border/50" onClick={() => { setSelectedWorkflow(wf); setShowPreview(true); }}><Eye size={14} /> {t("auto.preview")}</Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs border-border/50" onClick={() => { setSelectedWorkflow(wf); setShowTest(true); }}><Play size={14} /> {t("auto.test")}</Button>
                <button className={`hidden lg:block relative w-10 h-5 rounded-full transition-colors ${wf.enabled ? "bg-primary" : "bg-muted"}`} onClick={() => setWorkflows((p) => p.map((w) => w.id === wf.id ? { ...w, enabled: !w.enabled } : w))}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${wf.enabled ? "left-5" : "left-0.5"}`} /></button>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-secondary/30 p-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">{t("auto.message_template")}</label>
              <p className="text-sm text-muted-foreground">{wf.template}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">{"{customer_name}"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">{"{business_name}"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">{"{review_link}"}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {showNewWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowNewWorkflow(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="font-display font-semibold text-lg">{t("auto.new_workflow")}</h3><button onClick={() => setShowNewWorkflow(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.workflow_name")}</label><Input className="bg-secondary/50 border-border/50" value={newWf.name} onChange={(e) => setNewWf((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. VIP Follow-up" /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.trigger")}</label><select className="w-full h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm" value={newWf.trigger} onChange={(e) => setNewWf((p) => ({ ...p, trigger: e.target.value }))}><option>After payment</option><option>After appointment</option><option>Manual trigger</option><option>After NFC scan</option></select></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.action")}</label><select className="w-full h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm" value={newWf.action} onChange={(e) => setNewWf((p) => ({ ...p, action: e.target.value }))}><option>Send SMS</option><option>Send Email</option></select></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.delay")}</label><select className="w-full h-10 rounded-md border border-border/50 bg-secondary/50 px-3 text-sm" value={newWf.delay} onChange={(e) => setNewWf((p) => ({ ...p, delay: e.target.value }))}><option>Immediate</option><option>30 minutes</option><option>2 hours</option><option>24 hours</option><option>48 hours</option></select></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.message_template")}</label><textarea className="w-full rounded-lg border border-border/50 bg-secondary/50 p-3 text-sm resize-none h-24 focus:outline-none focus:ring-1 focus:ring-primary" value={newWf.template} onChange={(e) => setNewWf((p) => ({ ...p, template: e.target.value }))} /></div>
              <Button className="w-full glow-red-hover" onClick={createWorkflow}>{t("auto.create_workflow")}</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showPreview && selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-display font-semibold">{t("auto.template_preview")}</h3><button onClick={() => setShowPreview(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><selectedWorkflow.actionIcon size={14} /><span>{selectedWorkflow.action}</span></div>
              <p className="text-sm">{selectedWorkflow.template.replace("{customer_name}", "John").replace("{business_name}", "REDVANTA").replace("{review_link}", "https://g.page/r/...")}</p>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowPreview(false)}>{t("auto.close")}</Button>
          </motion.div>
        </div>
      )}

      {showTest && selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowTest(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm mx-4 rounded-xl border border-border/50 bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-display font-semibold">{t("auto.test_workflow")}</h3><button onClick={() => setShowTest(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button></div>
            <p className="text-sm text-muted-foreground mb-4">{t("auto.test_workflow")} "{selectedWorkflow.name}"</p>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.test_recipient")}</label><Input className="bg-secondary/50 border-border/50" placeholder={selectedWorkflow.action === "Send SMS" ? "+1 555 000-0000" : "test@email.com"} /></div>
              <div><label className="text-xs text-muted-foreground mb-1.5 block">{t("auto.customer_name")}</label><Input className="bg-secondary/50 border-border/50" defaultValue="John Doe" /></div>
            </div>
            <Button className="w-full mt-4 glow-red-hover gap-2" onClick={() => { toast({ title: t("auto.test_sent"), description: t("auto.test_sent_desc") }); setShowTest(false); }}><Play size={14} /> {t("auto.send_test")}</Button>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Automation;

