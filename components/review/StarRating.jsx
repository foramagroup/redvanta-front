import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import confetti from "canvas-confetti";

export function StarRating({ onRate }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleSelect = (star) => {
    setSelectedStar(star);
    triggerHaptic();
    if (star === 5) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }
    onRate(star);
  };

  const showCelebration = selectedStar >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center justify-center gap-5"
    >

    
      <h2 className="text-lg font-display font-bold text-foreground">
        How was your experience?
      </h2>
      <div className={`flex gap-2 transition-all duration-500 ${showCelebration ? "drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : ""}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredStar || selectedStar);
          return (
            <motion.button
              key={star}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.15 }}
              onHoverStart={() => setHoveredStar(star)}
              onHoverEnd={() => setHoveredStar(0)}
              onClick={() => handleSelect(star)}
              className="rounded-lg p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-11 w-11 transition-all duration-200 ${
                  isFilled
                    ? "fill-[#FBBF24] text-[#FBBF24] drop-shadow-sm"
                    : "fill-none text-[#D1D5DB]"
                }`}
                strokeWidth={1.5}
              />
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Tap a star to rate</p>
    </motion.div>
  );
}
