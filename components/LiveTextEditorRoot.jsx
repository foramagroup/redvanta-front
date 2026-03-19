import { useEffect, useRef } from "react";
import { useLiveTextEditor } from "@/contexts/LiveTextEditorContext";

const EDITABLE_SELECTORS = "h1, h2, h3, h4, h5, h6, p, span, li, blockquote, td, th";

const LiveTextEditorRoot = ({ children }) => {
  const { isEditing } = useLiveTextEditor();
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(EDITABLE_SELECTORS);

    if (isEditing) {
      elements.forEach((el) => {
        const htmlEl = el;
        // Skip interactive elements and containers with block children
        if (htmlEl.closest("button, a, input, textarea, select, [role='button'], nav")) return;
        if (htmlEl.querySelector("h1, h2, h3, h4, h5, h6, p, div, ul, ol")) return;
        // Skip very short or icon-only spans
        if (htmlEl.tagName === "SPAN" && (htmlEl.textContent || "").trim().length < 2) return;
        
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
  }, [isEditing]);

  return (
    <div ref={rootRef} id="live-text-editor-root" style={isEditing ? { paddingTop: 48 } : undefined}>
      {children}
    </div>
  );
};

export default LiveTextEditorRoot;
