"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = React.createContext(null);
const AccordionItemContext = React.createContext(null);

function Accordion({ type = "single", collapsible = false, className, children }) {
  const [value, setValue] = React.useState(null);

  const isOpen = React.useCallback(
    (itemValue) => {
      if (type === "multiple") {
        return Array.isArray(value) && value.includes(itemValue);
      }
      return value === itemValue;
    },
    [type, value]
  );

  const toggle = React.useCallback(
    (itemValue) => {
      if (type === "multiple") {
        const current = Array.isArray(value) ? value : [];
        const next = current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue];
        setValue(next);
        return;
      }

      if (value === itemValue) {
        if (collapsible) setValue(null);
        return;
      }
      setValue(itemValue);
    },
    [type, collapsible, value]
  );

  return (
    <AccordionContext.Provider value={{ isOpen, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

const AccordionItem = React.forwardRef(({ className, value, children, ...props }, ref) => (
  <AccordionItemContext.Provider value={{ value }}>
    <div ref={ref} data-accordion-item-value={value} className={cn("border-b", className)} {...props}>
      {children}
    </div>
  </AccordionItemContext.Provider>
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);
  const itemValue = itemCtx?.value;
  const open = ctx?.isOpen(itemValue);

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={!!open}
      onClick={() => ctx?.toggle(itemValue)}
      className={cn(
        "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(AccordionContext);
  const itemCtx = React.useContext(AccordionItemContext);
  const itemValue = itemCtx?.value;
  const open = ctx?.isOpen(itemValue);

  if (!open) return null;

  return (
    <div ref={ref} className={cn("overflow-hidden text-sm", className)} {...props}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
