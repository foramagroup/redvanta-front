import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center max-w-sm"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This review page doesn't exist or may have been removed. Please check the link and try again.
        </p>
      </motion.div>
    </div>
  );
}
