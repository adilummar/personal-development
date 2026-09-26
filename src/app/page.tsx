"use client";

import { motion, Variants } from "framer-motion";
import { CheckCircle2, CreditCard, ChevronRight, PieChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-16"
      >
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">Good evening, User.</h1>
          <p className="text-sm text-foreground/50 mt-1 font-mono uppercase tracking-widest">Monday, 23 Sep</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">U</div>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6"
      >
        {/* Reminders Card */}
        <motion.div variants={itemVariants}>
          <Link href="/reminders" className="group block">
            <div className="bg-surface rounded-2xl p-6 border border-border hover:border-accent/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-accent" />
              </div>
              <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-xl font-medium mb-1">Focus & Reminders</h2>
              <p className="text-sm text-foreground/60 mb-6">3 tasks remaining today</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-full border border-accent/50 flex-shrink-0" />
                  <span className="text-foreground/90">Review Q3 Financials</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-full border border-foreground/30 flex-shrink-0" />
                  <span className="text-foreground/90">Call Family</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Finance Card */}
        <motion.div variants={itemVariants}>
          <Link href="/finance" className="group block">
            <div className="bg-surface rounded-2xl p-6 border border-border hover:border-accent/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-accent" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-foreground" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/50 font-mono uppercase tracking-wider mb-1">Net Worth</p>
                  <p className="text-xl font-medium">$124,500.00</p>
                </div>
              </div>
              <h2 className="text-xl font-medium mb-1">Wealth Control</h2>
              <p className="text-sm text-foreground/60 mb-6">September budget on track</p>
              
              <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full bg-accent" 
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-foreground/50">
                <span>$3,250 spent</span>
                <span>$1,750 remaining</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
