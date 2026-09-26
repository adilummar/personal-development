"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Transaction {
  _id: string;
  amount: number;
  type: "income" | "expense" | "lent" | "borrowed";
  account: "cash" | "gpay";
  category: string;
  party?: string;
  description?: string;
  date: string;
}

export default function FinancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Transaction["type"]>("expense");
  const [account, setAccount] = useState<Transaction["account"]>("cash");
  const [category, setCategory] = useState("");
  const [party, setParty] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchTransactions();
    }
  }, [status, router]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/finance");
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          account,
          category,
          party,
          description,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
        setAmount("");
        setCategory("");
        setParty("");
        setDescription("");
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/finance/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // Calculations
  const calc = transactions.reduce(
    (acc, curr) => {
      if (curr.type === "income") {
        acc.netWorth += curr.amount;
        if (curr.account === "cash") acc.cash += curr.amount;
        if (curr.account === "gpay") acc.gpay += curr.amount;
      } else if (curr.type === "expense") {
        acc.netWorth -= curr.amount;
        if (curr.account === "cash") acc.cash -= curr.amount;
        if (curr.account === "gpay") acc.gpay -= curr.amount;
      } else if (curr.type === "lent") {
        acc.lent += curr.amount;
        if (curr.account === "cash") acc.cash -= curr.amount;
        if (curr.account === "gpay") acc.gpay -= curr.amount;
      } else if (curr.type === "borrowed") {
        acc.borrowed += curr.amount;
        if (curr.account === "cash") acc.cash += curr.amount;
        if (curr.account === "gpay") acc.gpay += curr.amount;
      }
      return acc;
    },
    { netWorth: 0, cash: 0, gpay: 0, lent: 0, borrowed: 0 }
  );

  if (loading || status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface/80 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-2xl font-light tracking-tight text-foreground">Finance</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5 text-black" />
        </button>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="col-span-2 bg-surface p-6 rounded-2xl border border-border">
          <p className="text-xs text-foreground/50 font-mono uppercase tracking-wider mb-2">Net Worth</p>
          <h2 className="text-4xl font-medium text-foreground">${calc.netWorth.toFixed(2)}</h2>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3 text-foreground/60">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Cash</span>
          </div>
          <p className="text-xl font-medium">${calc.cash.toFixed(2)}</p>
        </div>
        
        <div className="bg-surface p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3 text-foreground/60">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">GPay</span>
          </div>
          <p className="text-xl font-medium">${calc.gpay.toFixed(2)}</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3 text-foreground/60">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Lent</span>
          </div>
          <p className="text-xl font-medium">${calc.lent.toFixed(2)}</p>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3 text-foreground/60">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <span className="text-sm">Borrowed</span>
          </div>
          <p className="text-xl font-medium">${calc.borrowed.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions List */}
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-foreground/50 text-center py-8 text-sm">No transactions yet.</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx._id} className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' :
                  tx.type === 'expense' ? 'bg-red-500/10 text-red-500' :
                  tx.type === 'lent' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-orange-500/10 text-orange-500'
                }`}>
                  {tx.type === 'income' && <Plus className="w-4 h-4" />}
                  {tx.type === 'expense' && <ArrowDownRight className="w-4 h-4" />}
                  {tx.type === 'lent' && <ArrowUpRight className="w-4 h-4" />}
                  {tx.type === 'borrowed' && <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{tx.category} {tx.party && <span className="text-foreground/50 font-normal">({tx.party})</span>}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{new Date(tx.date).toLocaleDateString()} • {tx.account.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-medium ${
                  tx.type === 'income' || tx.type === 'borrowed' ? 'text-emerald-400' : 'text-foreground'
                }`}>
                  {tx.type === 'income' || tx.type === 'borrowed' ? '+' : '-'}${tx.amount.toFixed(2)}
                </p>
                <button 
                  onClick={() => handleDelete(tx._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium">New Record</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-foreground/50 hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="lent">I Lent Money</option>
                    <option value="borrowed">I Borrowed Money</option>
                  </select>

                  <select 
                    value={account} 
                    onChange={(e) => setAccount(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="cash">Cash</option>
                    <option value="gpay">Google Pay</option>
                  </select>
                </div>

                <input 
                  type="number" 
                  step="0.01"
                  required
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                />

                <input 
                  type="text" 
                  required
                  placeholder="Category (e.g. Salary, Food)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                />

                {(type === "lent" || type === "borrowed") && (
                  <input 
                    type="text" 
                    required
                    placeholder="Person's Name"
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                )}

                <input 
                  type="text" 
                  placeholder="Description (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                />

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-accent text-black font-medium py-3 rounded-xl hover:opacity-90 transition-opacity mt-4"
                >
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
