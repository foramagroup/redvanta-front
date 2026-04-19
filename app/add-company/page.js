"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, MapPin, ArrowRight, CheckCircle2, Phone, Loader2, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { post, get, remove } from "@/lib/api";
import CompanySwitchDialog from "@/components/CompanySwitchDialog";
import { fadeUp } from "@/lib/animations";

const AddCompanyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState("");

  const redirectMessage = searchParams.get("message");

  useEffect(() => {
    if (redirectMessage) {
      toast({ title: "Compte existant", description: redirectMessage });
    }
  }, [redirectMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await post("/client/auth/add-company", {
        companyName: companyName.trim(),
        address: companyAddress.trim() || null,
        phone: companyPhone.trim() || null,
      });

      if (response.success) {
        setCompanies((prev) => [...prev, {
          id: response.company.id,
          name: response.company.name,
          address: response.company.address || "",
        }]);
        setIsSuccess(true);
        setCompanyName("");
        setCompanyAddress("");
        setCompanyPhone("");
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || "Erreur lors de l'ajout de l'entreprise";
      setError(errorMessage);
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = async () => {
    if (companies.length <= 1) {
      router.push("/dashboard");
      return;
    }
    try {
      const res = await get("/client/auth/me");
      const links = res?.user?.companies || [];
      const all = links.map((e) => ({ id: e?.company?.id, name: e?.company?.name, email: e?.company?.email, status: e?.company?.status, isOwner: !!e.isOwner })).filter((c) => c.id);
      setAllCompanies(all);
      setSelectedCompanyId(all[0]?.id ?? null);
      setShowSwitchModal(true);
    } catch {
      router.push("/dashboard");
    }
  };

  const handleSwitchConfirm = async () => {
    if (!selectedCompanyId) return;
    setIsSwitching(true);
    setSwitchError("");
    try {
      await post("/client/auth/switch-company", { companyId: selectedCompanyId });
      window.dispatchEvent(new Event("app:company-switched"));
      router.push("/dashboard");
    } catch (err) {
      setSwitchError(err?.error || err?.message || "Failed to switch company");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDelete = async (companyId) => {
    if (companies.length <= 1) {
      toast({ title: "Impossible", description: "Vous ne pouvez pas supprimer votre seule entreprise", variant: "destructive" });
      return;
    }
    setDeletingId(companyId);
    try {
      await remove(`/client/auth/company/${companyId}`);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      toast({ title: "Entreprise supprimée" });
    } catch (err) {
      toast({ title: "Erreur", description: err?.response?.data?.error || err?.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  if (isSuccess) {
    return (
      <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">Company added!</h1>
            <p className="text-muted-foreground text-sm">You can now manage all your companies from the dashboard.</p>
          </div>

          <div className="space-y-2 text-left">
            {companies.map((c) => (
              <Card key={c.id} className="border-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                      {c.address && <p className="text-xs text-muted-foreground truncate">{c.address}</p>}
                    </div>
                    {companies.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                      >
                        {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGoToDashboard}
              className="w-full gap-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              Go to dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="w-full"
            >
              Add another company
            </Button>
          </div>
        </div>
      </div>

      <CompanySwitchDialog
        open={showSwitchModal}
        onOpenChange={setShowSwitchModal}
        title="Select a company"
        description="Choose which company you want to manage on the dashboard."
        companies={allCompanies}
        selectedCompanyId={selectedCompanyId}
        onSelectedCompanyIdChange={setSelectedCompanyId}
        onConfirm={handleSwitchConfirm}
        isSubmitting={isSwitching}
        errorMessage={switchError}
        confirmLabel="Go to dashboard"
      />
      </>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-dark px-6 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <motion.div initial="hidden" animate="visible" className="relative w-full max-w-md">
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <Link href="/" className="font-display text-3xl font-bold tracking-tight">
            OPI<span className="text-gradient-red">NOOR</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold">Add a new company</h1>
          <p className="mt-2 text-sm text-muted-foreground">This company will be linked to your existing account</p>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="mt-8 rounded-2xl border border-border/50 bg-gradient-card p-8 shadow-2xl backdrop-blur">
          {redirectMessage && (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Info size={16} />
                <span className="text-sm font-semibold">Existing account detected</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">You are now logged in. Add a new company to your account.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company name *</label>
              <Input
                className="mt-2 border-border/50 bg-background text-foreground"
                placeholder="My New Business"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address (optional)</label>
              <Input
                className="mt-2 border-border/50 bg-background text-foreground"
                placeholder="123 Main St, City"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone (optional)</label>
              <Input
                className="mt-2 border-border/50 bg-background text-foreground"
                placeholder="+1 234 567 8900"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting || !companyName.trim()}
              className="glow-red-hover w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
              ) : (
                <>Add company <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} custom={2} className="mt-6 text-center text-sm text-muted-foreground">
          <button onClick={() => router.push("/dashboard")} className="text-primary hover:underline">
            Back to dashboard
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AddCompanyPage;
