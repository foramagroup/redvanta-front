"use client";

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Pencil, RefreshCw, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  draft: { label: "Draft", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground border-border/50" },
};

function getTextColor(background) {
  return background === "#FFFFFF" ? "#0D0D0D" : "#FFFFFF";
}

function CardPreview({ design, side, previewRef, aspectRatio }) {
  const textColor = getTextColor(design?.templateColor1);
  const title = side === "front" ? design?.businessName : `${design?.name} Design`;
  const body = side === "front" ? design?.frontInstructions : design?.backInstructions;

  return (
    <div
      ref={previewRef}
      className="w-full rounded-xl overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${design.templateColor1}, ${design.templateColor2})`,
        aspectRatio,
        maxHeight: "320px",
      }}
    >
      <div className="text-center px-6">
        {side === "front" && (
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#FBBF24" stroke="none" />
            ))}
          </div>
        )}
        <p className="text-sm font-bold" style={{ color: textColor }}>
          {title}
        </p>
        <p className="text-[10px] mt-1 opacity-70 whitespace-pre-line" style={{ color: textColor }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function PrintReadyPage({ design, side, previewRef }) {
  const textColor = getTextColor(design?.templateColor1);
  const pageTitle = side === "front" ? "RECTO (Front)" : "VERSO (Back)";
  const title = side === "front" ? design?.businessName : `${design?.name} Design`;
  const body = side === "front" ? design?.frontInstructions : design?.backInstructions;
  const footerLabel = side === "front" ? "RECTO (Front)" : "VERSO (Back)";

  return (
    <div
      ref={previewRef}
      style={{
        width: "1000px",
        minHeight: "760px",
        background: "#ffffff",
        color: "#111111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "72px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "26px", fontWeight: 700, marginBottom: "8px" }}>{pageTitle}</div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          {design?.businessName} · 85.6mm × 54.0mm · Print-ready
        </div>
      </div>

      <div
        style={{
          border: "2px dashed #d1d5db",
          padding: "8px",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            width: "408px",
            height: "257px",
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${design?.templateColor1}, ${design?.templateColor2})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "28px",
            boxSizing: "border-box",
          }}
        >
          {side === "front" && (
            <div style={{ fontSize: "22px", color: "#fbbf24", marginBottom: "14px", letterSpacing: "2px" }}>★★★★★</div>
          )}
          <div style={{ fontSize: "20px", fontWeight: 700, color: textColor, marginBottom: "12px" }}>
            {title}
          </div>
          <div
            style={{
              fontSize: "11px",
              lineHeight: 1.5,
              color: textColor,
              opacity: 0.92,
              maxWidth: "280px",
              whiteSpace: "pre-line",
            }}
          >
            {body}
          </div>
          <div style={{ marginTop: "auto", fontSize: "10px", color: textColor, opacity: 0.55 }}>
            {footerLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignDetailModal({
  design,
  onClose,
  onEdit,
  onDownloadCardExport,
  onRegenerateCard,
  cardActionLoading = false,
}) {
  const [previewSide, setPreviewSide] = useState("front");
  const [isGenerating, setIsGenerating] = useState(false);
  const frontPreviewRef = useRef(null);
  const backPreviewRef = useRef(null);

  const status = STATUS_CONFIG[design?.status] || STATUS_CONFIG.draft;

  const aspectRatio = useMemo(() => {
    return design?.orientation === "landscape" ? "16/10" : "10/16";
  }, [design?.orientation]);

  const handleClose = () => {
    setPreviewSide("front");
    onClose();
  };

  const handleEdit = () => {
    setPreviewSide("front");
    onEdit?.(design);
  };

  const handleDownloadPdf = async () => {
    if (!design || !frontPreviewRef.current || !backPreviewRef.current) return;

    setIsGenerating(true);
    try {
      const frontCanvas = await html2canvas(frontPreviewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const backCanvas = await html2canvas(backPreviewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });

      const width = frontCanvas.width;
      const height = frontCanvas.height;
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
      pdf.addPage([backCanvas.width, backCanvas.height], backCanvas.width > backCanvas.height ? "landscape" : "portrait");
      pdf.addImage(backCanvas.toDataURL("image/png"), "PNG", 0, 0, backCanvas.width, backCanvas.height);
      pdf.save(`${design.name || "design"}.pdf`);
    } catch {
      toast({
        title: "Download failed",
        description: "Unable to generate the PDF file.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={Boolean(design)} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{design?.name}</DialogTitle>
          <DialogDescription>{design?.businessName} · {design?.template}</DialogDescription>
        </DialogHeader>

        {design && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex rounded-lg border border-border/50 bg-secondary/40 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewSide("front")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${previewSide === "front" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Recto
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide("back")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${previewSide === "back" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Verso
                </button>
              </div>
              <div className="flex items-center gap-2">
                {design?.primaryCardUid && onRegenerateCard && (
                  <Button
                    variant="outline"
                    onClick={() => onRegenerateCard(design)}
                    disabled={cardActionLoading}
                    className="gap-2"
                  >
                    <RefreshCw size={14} className={cardActionLoading ? "animate-spin" : ""} />
                    {cardActionLoading ? "Regenerating..." : "Regenerate"}
                  </Button>
                )}
                {design?.primaryCardUid && onDownloadCardExport && (
                  <Button
                    variant="outline"
                    onClick={() => onDownloadCardExport(design, "pdf")}
                    className="gap-2"
                  >
                    <Download size={14} />
                    Card Export
                  </Button>
                )}
                <Button variant="outline" onClick={handleDownloadPdf} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </div>

            {design?.primaryCardUid && (
              <div className="rounded-lg border border-border/50 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                API linked card: <span className="font-medium text-foreground">{design.primaryCardUid}</span>
              </div>
            )}

            <CardPreview design={design} side={previewSide} previewRef={null} aspectRatio={aspectRatio} />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Model</span><p className="font-medium">{design.model}</p></div>
              <div><span className="text-muted-foreground text-xs">Orientation</span><p className="font-medium capitalize">{design.orientation}</p></div>
              <div><span className="text-muted-foreground text-xs">Status</span><Badge variant="outline" className={status.className}>{status.label}</Badge></div>
              <div><span className="text-muted-foreground text-xs">Linked Card</span><p className="font-medium">{design.linkedCard || "—"}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground text-xs">Front Instructions</span><p className="text-xs whitespace-pre-line">{design.frontInstructions}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground text-xs">Back Instructions</span><p className="text-xs whitespace-pre-line">{design.backInstructions}</p></div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>Close</Button>
          <Button onClick={handleEdit} className="gap-2">
            <Pencil size={14} /> Edit Design
          </Button>
        </DialogFooter>

        {design && (
          <div className="pointer-events-none absolute -left-[9999px] top-0 w-[1000px]">
            <PrintReadyPage design={design} side="front" previewRef={frontPreviewRef} />
            <div className="h-8" />
            <PrintReadyPage design={design} side="back" previewRef={backPreviewRef} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
