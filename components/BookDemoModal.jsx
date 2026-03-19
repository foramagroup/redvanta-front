"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ArrowRight, ArrowLeft, Calendar, User, Building2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { icon: User, label: "Your Info" },
  { icon: Building2, label: "Company" },
  { icon: Calendar, label: "Schedule" },
  { icon: MessageSquare, label: "Details" },
];

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"
];

const BookDemoModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", role: "", size: "", industry: "",
    date: "", time: "", timezone: "",
    goals: "", currentTools: "", notes: "",
  });
  const { toast } = useToast();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 0) return form.firstName && form.email;
    if (step === 1) return form.company;
    if (step === 2) return form.date && form.time;
    return true;
  };

  const submit = () => {
    toast({ title: "Demo Booked!", description: "We'll send a confirmation to " + form.email });
    setOpen(false);
    setStep(0);
    setForm({ firstName: "", lastName: "", email: "", phone: "", company: "", role: "", size: "", industry: "", date: "", time: "", timezone: "", goals: "", currentTools: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setStep(0); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Book a Demo</DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/20 text-primary border border-primary" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name *</Label><Input value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John" /></div>
                  <div><Label>Last Name</Label><Input value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Doe" /></div>
                </div>
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@company.com" /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" /></div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <div><Label>Company Name *</Label><Input value={form.company} onChange={e => update("company", e.target.value)} placeholder="Acme Inc." /></div>
                <div><Label>Your Role</Label>
                  <Select value={form.role} onValueChange={v => update("role", v)}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {["CEO / Founder", "Marketing Director", "Operations Manager", "Agency Owner", "Developer", "Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Company Size</Label>
                  <Select value={form.size} onValueChange={v => update("size", v)}>
                    <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                    <SelectContent>
                      {["1-10", "11-50", "51-200", "201-500", "500+"].map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Industry</Label>
                  <Select value={form.industry} onValueChange={v => update("industry", v)}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {["SaaS / Tech", "Marketing Agency", "E-commerce", "Healthcare", "Real Estate", "Hospitality", "Other"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div><Label>Preferred Date *</Label><Input type="date" value={form.date} onChange={e => update("date", e.target.value)} min={new Date().toISOString().split("T")[0]} /></div>
                <div><Label>Preferred Time *</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {timeSlots.map(t => (
                      <button key={t} onClick={() => update("time", t)} className={`text-xs py-2 px-1 rounded-md border transition-colors ${form.time === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div><Label>Timezone</Label>
                  <Select value={form.timezone} onValueChange={v => update("timezone", v)}>
                    <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                    <SelectContent>
                      {["UTC-8 (PST)", "UTC-5 (EST)", "UTC+0 (GMT)", "UTC+1 (CET)", "UTC+8 (SGT)", "UTC+9 (JST)"].map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div><Label>What are your main goals?</Label><Textarea value={form.goals} onChange={e => update("goals", e.target.value)} placeholder="Improve online reputation, automate review collection..." rows={3} /></div>
                <div><Label>Current tools you use</Label><Input value={form.currentTools} onChange={e => update("currentTools", e.target.value)} placeholder="Google Business, Trustpilot..." /></div>
                <div><Label>Additional notes</Label><Textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Any specific questions or requirements..." rows={3} /></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}><ArrowLeft size={16} className="mr-1" /> Back</Button>
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next <ArrowRight size={16} className="ml-1" /></Button>
          ) : (
            <Button onClick={submit} className="glow-red">Book Demo <Check size={16} className="ml-1" /></Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookDemoModal;
