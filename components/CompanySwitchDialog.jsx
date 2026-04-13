"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CompanySwitchDialog = ({
  open,
  onOpenChange,
  title = "Select a company",
  description = "Choose the company you want to work with for this session.",
  companies = [],
  selectedCompanyId,
  onSelectedCompanyIdChange,
  onConfirm,
  isLoading = false,
  isSubmitting = false,
  errorMessage = "",
  confirmLabel = "Continue",
}) => {
  const selectedCompany = companies.find(
    (company) => String(company.id) === String(selectedCompanyId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {errorMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Company
            </label>
            <Select
              value={selectedCompanyId ? String(selectedCompanyId) : ""}
              onValueChange={onSelectedCompanyIdChange}
              disabled={isLoading || companies.length === 0}
            >
              <SelectTrigger className="border-border/50 bg-background">
                <SelectValue placeholder={isLoading ? "Loading companies..." : "Select a company"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany ? (
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedCompany.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {selectedCompany.email || "No company email"}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {selectedCompany.isOwner ? (
                    <span className="inline-flex rounded-full bg-primary/15 px-2 py-1 text-[10px] font-medium text-primary">
                      Owner
                    </span>
                  ) : null}
                  {selectedCompany.status ? (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {selectedCompany.status}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No company available for switching.
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onConfirm}
            disabled={isLoading || isSubmitting || !selectedCompanyId}
          >
            {isSubmitting ? "Loading..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanySwitchDialog;
