import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, MessageSquare, Coins, Calendar, Key, Zap, Check, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { TIER_LABELS, TIER_TOKENS, tierAtLeast } from "@/lib/subscription";
import { useState } from "react";
import { verifyActivationCode } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";

export function AccountModal({
  open,
  onOpenChange,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpgrade: () => void;
}) {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState(false);

  const totalChats = state.chats.length;
  const totalTokens = state.chats.reduce((acc, c) => acc + c.messages.reduce((a, m) => a + m.content.length, 0), 0);
  const sub = state.subscription;
  const tokenLimit = TIER_TOKENS[sub.tier];
  const used = sub.tokensUsed;
  const usedPct = Math.min(100, (used / tokenLimit) * 100);

  const tierBadge: Record<string, string> = {
    free: "border-border bg-background text-muted-foreground",
    starter: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    professional: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    elite: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  };

  const stats = [
    { icon: MessageSquare, label: "Total chats", value: totalChats.toString() },
    { icon: Coins, label: "Tokens used", value: `${(totalTokens / 1000).toFixed(1)}K` },
    { icon: Calendar, label: "Joined", value: "Apr 2026" },
  ];

  function activateCode() {
    const result = verifyActivationCode(codeInput.trim());
    if (!result) {
      setCodeError("Invalid or expired code.");
      return;
    }
    dispatch({
      type: "SET_SUBSCRIPTION",
      patch: {
        tier: result.tier,
        activatedAt: Date.now(),
        expiresAt: result.expiresAt,
        tokensUsed: 0,
        activationCode: codeInput.trim(),
      },
    });
    setCodeSuccess(true);
    setCodeError("");
    toast({ description: `${TIER_LABELS[result.tier]} plan activated!` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border w-[96vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-xl border border-white/10">
            A
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">KaliGPT User</div>
            <div className="flex items-center gap-1.5 text-xs mt-0.5">
              <span className={`px-2 py-0.5 rounded-full border font-semibold ${tierBadge[sub.tier]}`}>
                {TIER_LABELS[sub.tier]} plan
              </span>
              {sub.expiresAt && (
                <span className="text-muted-foreground text-[10px]">
                  Expires {new Date(sub.expiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border space-y-2 mb-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Token balance</span>
            <span className="font-mono font-semibold">{(tokenLimit - used).toLocaleString()} / {tokenLimit.toLocaleString()}</span>
          </div>
          <div className="h-1.5 rounded-full bg-accent overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usedPct > 80 ? "bg-red-500" : usedPct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${100 - usedPct}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">{used.toLocaleString()} tokens used this period</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-background border border-border p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto text-primary mb-1.5" />
              <div className="font-mono text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {sub.tier === "free" && (
          <div className="space-y-2 mb-3">
            <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Activate Plan</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setCodeError(""); setCodeSuccess(false); }}
                onKeyDown={(e) => e.key === "Enter" && activateCode()}
                placeholder="Activation code"
                className={`flex-1 bg-background border ${codeError ? "border-red-500/60" : "border-border"} rounded-xl px-3 py-2 text-[12px] outline-none focus:border-primary font-mono`}
              />
              <button
                onClick={activateCode}
                disabled={!codeInput.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-[12px] font-bold hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                <Key className="w-3.5 h-3.5" /> Apply
              </button>
            </div>
            {codeError && (
              <div className="flex items-center gap-1 text-red-400 text-[11px]">
                <AlertCircle className="w-3 h-3" /> {codeError}
              </div>
            )}
            {codeSuccess && (
              <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <Check className="w-3 h-3" /> Plan activated!
              </div>
            )}
          </div>
        )}

        {!tierAtLeast(sub.tier, "elite") && (
          <button
            onClick={onUpgrade}
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2"
          >
            {sub.tier === "free" ? (
              <><Crown className="w-4 h-4" /> Upgrade plan</>
            ) : (
              <><Zap className="w-4 h-4" /> Upgrade to Elite</>
            )}
          </button>
        )}

        {tierAtLeast(sub.tier, "elite") && (
          <div className="flex items-center justify-center gap-2 py-2 text-amber-400 text-sm font-bold">
            <Crown className="w-4 h-4" /> Elite plan active — enjoy full access
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
