import React from "react";

const FRAMER_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "variants",
  "transition",
  "whileHover",
  "whileTap",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "drag",
  "dragConstraints",
  "dragElastic",
  "dragMomentum",
  "custom",
]);

function createMotionTag(tag) {
  return function MotionTag({ children, ...props }) {
    const domProps = { ...props };

    for (const prop of FRAMER_PROPS) {
      if (prop in domProps) {
        delete domProps[prop];
      }
    }

    return React.createElement(tag, domProps, children);
  };
}

export const motion = new Proxy(
  {},
  {
    get(_target, prop) {
      const tag = typeof prop === "string" ? prop : "div";
      return createMotionTag(tag);
    },
  }
);
