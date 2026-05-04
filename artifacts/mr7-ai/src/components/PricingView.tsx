import { X, Check, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface PricingViewProps {
  onClose: () => void;
}

export function PricingView({ onClose }: PricingViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-background border border-border rounded-2xl shadow-2xl relative my-auto"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground bg-card rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" /> All plans unlocked · Free forever
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Every feature is yours.</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            All models, all tools, full API access, and the CHAT-GPT Agent CLI are unlocked for every operator. No payment required.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Starter */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="text-3xl font-bold font-mono mb-1">$0<span className="text-sm text-muted-foreground font-sans font-normal">/mo</span></div>
              <div className="text-sm text-muted-foreground mb-6">Unlimited tokens</div>

              <ul className="space-y-3 mb-8 flex-1 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>All CHAT-GPT models unlocked</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Advanced reasoning included</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Full API access</span>
                </li>
              </ul>

              <button onClick={onClose} className="w-full py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/15 transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Activated
              </button>
            </div>

            {/* Pro Hacker */}
            <div className="bg-card border-2 border-primary rounded-2xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(226,18,39,0.15)] transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> MOST POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">Pro</h3>
              <div className="text-3xl font-bold font-mono mb-1">$0<span className="text-sm text-muted-foreground font-sans font-normal">/mo</span></div>
              <div className="text-sm text-primary/80 font-medium mb-6 border border-primary/20 bg-primary/10 inline-block px-2 py-1 rounded">Unlimited tokens</div>

              <ul className="space-y-3 mb-8 flex-1 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-medium">All Premium Models</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>CHAT-GPT Thinking deep reasoning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>CHAT-GPT Coder & CHAT-GPT Vision</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Web search & document upload</span>
                </li>
              </ul>

              <button onClick={onClose} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Activated
              </button>
            </div>

            {/* Elite */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Elite</h3>
              <div className="text-3xl font-bold font-mono mb-1">$0<span className="text-sm text-muted-foreground font-sans font-normal">/mo</span></div>
              <div className="text-sm text-muted-foreground mb-6 font-medium border border-border inline-block px-2 py-1 rounded bg-accent/50">Unlimited tokens</div>

              <ul className="space-y-3 mb-8 flex-1 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Full API Access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>CHAT-GPT Agent CLI unlimited</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>

              <button onClick={onClose} className="w-full py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/15 transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Activated
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}