import { motion } from "framer-motion";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PositiveResult({ googlePlaceId, onRedirect }) {
  const handleClick = () => {
    onRedirect();
    window.open(
      `https://search.google.com/local/writereview?placeid=${googlePlaceId}`,
      "_blank"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-5 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, delay: 0.1 }}
      >
        <CheckCircle2 className="h-14 w-14 text-green-500" />
      </motion.div>
      <h2 className="text-lg font-display font-bold text-foreground">
        We're happy you had a great experience!
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        Would you mind sharing your experience on Google? It helps us a lot!
      </p>
      <Button
        onClick={handleClick}
        size="lg"
        className="w-full gradient-primary text-primary-foreground font-semibold text-base rounded-xl h-12 border-0 hover:opacity-90 transition-opacity gap-2"
      >
        Continue to Google
        <ExternalLink className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
