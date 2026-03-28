import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeModal({ businessName, open, onStart }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 backdrop-blur-review"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-modal text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
               className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#E10600] to-[#FF5A4F]"
            >
              
                <Heart className="h-8 w-8 text-black" strokeWidth={2.2} />
           
            </motion.div>

            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Thank you for visiting {businessName}!
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              We would love your feedback. It only takes 10 seconds.
            </p>

            <Button
              onClick={onStart}
              size="lg"
              className="w-full gradient-primary text-primary-foreground font-semibold text-base rounded-xl h-12 border-0 hover:opacity-90 transition-opacity"
            >
              Leave a Review
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
