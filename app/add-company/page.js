"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, ArrowRight, CheckCircle2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "opinoor_account_companies";

const AddCompanyPage = () => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawCompanies = window.localStorage.getItem(STORAGE_KEY);
      if (!rawCompanies) {
        return;
      }

      const parsedCompanies = JSON.parse(rawCompanies);
      if (Array.isArray(parsedCompanies)) {
        setCompanies(parsedCompanies);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistCompanies = (nextCompanies) => {
    setCompanies(nextCompanies);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompanies));
    }
  };

  const latestCompany = useMemo(() => companies[companies.length - 1] || null, [companies]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    const nextCompanies = [
      ...companies,
      {
        id: `company-${Date.now()}`,
        name: companyName.trim(),
        address: companyAddress.trim(),
      },
    ];
    persistCompanies(nextCompanies);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleDeleteCompany = (companyId) => {
    const nextCompanies = companies.filter((company) => company.id !== companyId);
    persistCompanies(nextCompanies);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Company added!
            </h1>
            <p className="text-muted-foreground text-sm">
              <strong>{latestCompany?.name || companyName}</strong> has been added to your account. You can now manage it from your dashboard.
            </p>
          </div>
          <Card className="border-primary/10">
            <CardContent className="p-4 space-y-3">
              <p className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Companies on this account
              </p>
              <div className="space-y-2">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-3 py-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate font-semibold text-sm text-foreground">{company.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{company.address}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCompany(company.id)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${company.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full gap-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              Go to dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setCompanyName("");
                setCompanyAddress("");
              }}
              className="w-full"
            >
              Add another company
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
            Add a new company
          </h1>
          <p className="text-muted-foreground text-sm">
            This company will be linked to your existing account
          </p>
        </div>

        {/* Existing companies hint */}
        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Your current companies</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You already have <strong>{companies.length} {companies.length > 1 ? "companies" : "company"}</strong> in your account. The new company will appear alongside the existing ones in your dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="My New Business"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyAddress"
                    placeholder="456 Business Rd, City"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isSubmitting ? "Adding company..." : "Add company"}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCompanyPage;
