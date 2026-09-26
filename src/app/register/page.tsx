"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-12 h-12 mx-auto border border-accent/30 rounded-xl mb-6 flex items-center justify-center bg-surface/50 backdrop-blur-sm"
          >
            <span className="text-accent text-xl font-serif italic">A</span>
          </motion.div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Initiate Access</h1>
          <p className="text-foreground/50 text-sm">Create an account to begin your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-foreground/30"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-foreground/30"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-4 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-foreground/30"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-red-400 text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center gap-2 bg-foreground text-background rounded-xl px-4 py-4 text-sm font-medium hover:bg-foreground/90 transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Initialize Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-foreground/40 mt-8">
          Already have access?{" "}
          <Link href="/login" className="text-foreground hover:text-accent transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
