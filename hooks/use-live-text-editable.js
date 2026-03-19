import { useEffect } from "react";
import { useLiveTextEditor } from "@/contexts/LiveTextEditorContext";

/**
 * Hook that makes all text elements (h1-h6, p, span, a, li, button text)
 * contentEditable when live editing mode is active.
 */
const EDITABLE_SELECTORS = "h1, h2, h3, h4, h5, h6, p, span, li, blockquote, td, th, label";

export function useLiveTextEditable(containerRef) {
  const { isEditing } = useLiveTextEditor();

  useEffect(() => {
    const root = containerRef?.current || document.getElementById("live-text-editor-root");
    if (!root) return;

    const elements = root.querySelectorAll(EDITABLE_SELECTORS);

    if (isEditing) {
      elements.forEach((el) => {
        const htmlEl = el;
        // Skip elements that are interactive controls
        if (htmlEl.closest("button, a, input, textarea, select, [role='button']")) return;
        // Skip if it has child block-level elements (to avoid nesting issues)
        if (htmlEl.querySelector("h1, h2, h3, h4, h5, h6, p, div, ul, ol")) return;
        
        htmlEl.contentEditable = "true";
        htmlEl.classList.add("live-text-editable");
      });
    } else {
      elements.forEach((el) => {
        const htmlEl = el;
        htmlEl.contentEditable = "inherit";
        htmlEl.classList.remove("live-text-editable");
      });
    }

    return () => {
      elements.forEach((el) => {
        const htmlEl = el;
        htmlEl.contentEditable = "inherit";
        htmlEl.classList.remove("live-text-editable");
      });
    };
  }, [isEditing, containerRef]);
}
