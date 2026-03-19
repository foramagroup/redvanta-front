"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Package, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { fadeUp } from "@/lib/animations";
import { MODEL_LABELS } from "@/types/shop";

const Confirmation = () => {
  const { currentOrder, user } = useCart();

  if (!currentOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-dark pt-20">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">No order found</h1>
          <Link href="/product"><Button className="mt-4">Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div initial="hidden" animate="visible" className="mx-auto max-w-2xl text-center">
          <motion.div variants={fadeUp} custom={0}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 glow-red-sm">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="mt-8 font-display text-3xl font-bold md:text-4xl">
            Order <span className="text-gradient-red">Confirmed!</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="mt-3 text-muted-foreground">
            Thank you for your purchase. Your cards are being prepared for production.
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" className="mx-auto mt-12 max-w-2xl space-y-6">
          {/* Order Info */}
          <motion.div variants={fadeUp} custom={3} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="mt-1 font-display text-xl font-bold">{currentOrder.id}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">PAID</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(currentOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-medium">${currentOrder.total.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          {/* Items */}
          <motion.div variants={fadeUp} custom={4} className="rounded-xl border border-border/50 bg-gradient-card p-6">
            <h3 className="font-display text-lg font-semibold">Items</h3>
            <div className="mt-4 space-y-3">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.productName}</span>
                    <Badge variant="outline" className="text-xs">{MODEL_LABELS[item.model]}</Badge>
                    <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-sm">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div variants={fadeUp} custom={5} className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Package size={18} className="text-primary" /> What's Next?
            </h3>
            <div className="mt-4 space-y-3">
              {[
                "Your designs are now locked and sent to production.",
                "You'll receive a confirmation email shortly.",
                "Production takes 3-5 business days.",
                "You'll get a tracking number once shipped.",
              ].map((step, i) => (
                <p key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 size={14} className="text-primary shrink-0" /> {step}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Email notice */}
          <motion.div variants={fadeUp} custom={6} className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary p-4">
            <Mail size={18} className="text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to <span className="text-foreground font-medium">{user?.email || "your email"}</span>.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={7} className="flex flex-col items-center gap-3 pt-4">
            <Link href="/order-tracking">
              <Button className="glow-red-hover bg-primary text-primary-foreground hover:bg-primary/90">
                Track Your Order <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation;
