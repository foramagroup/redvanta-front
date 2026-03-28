import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function NegativeFeedback({ onSubmit }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    await onSubmit(message, email || undefined);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </motion.div>
        <h2 className="text-lg font-display font-bold text-foreground">
          Thank you for your feedback
        </h2>
        <p className="text-sm text-muted-foreground">
          We appreciate you taking the time to help us improve.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 w-full"
    >
      <h2 className="text-lg font-display font-bold text-foreground text-center">
        We're sorry to hear that
      </h2>
      <p className="text-sm text-muted-foreground text-center">
        Please let us know what went wrong so we can improve.
      </p>

      <Textarea
        placeholder="What went wrong?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-[100px] rounded-xl border-border bg-secondary/50 resize-none focus-visible:ring-primary text-sm"
      />

      <Input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border-border bg-secondary/50 focus-visible:ring-primary text-sm"
      />

      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || submitting}
        size="lg"
        className="w-full gradient-primary text-primary-foreground font-semibold text-base rounded-xl h-12 border-0 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Submit Feedback"
        )}
      </Button>
    </motion.div>
  );
}
