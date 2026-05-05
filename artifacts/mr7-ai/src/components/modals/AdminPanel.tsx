import { useState } from "react";
import { Dialog, DialogContentTop, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Lock, Check, Copy, RefreshCw, Crown, Users, Zap, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  verifyAdminPassword, generateActivationCode,
  type SubscriptionTier, TIER_LABELS, TIER_TOKENS,
} from "@/lib/subscription";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const TIERS: SubscriptionTier[] = ["free", "starter", "professional", "elite"];

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);
  const [genTier, setGenTier] = useState<SubscriptionTier>("starter");
  const [genDays, setGenDays] = useState(30);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [setTier, setSetTier] = useState<SubscriptionTier>(state.subscription.tier);
  const [setDays, setSetDays] = useState(30);

  function login() {
    if (verifyAdminPassword(password)) {
      setAuthed(true);
      setPwError(false);
      setPassword("");
    } else {
      setPwError(true);
    }
  }

  function handleClose(v: boolean) {
    if (!v) {
      setAuthed(false);
      setPassword("");
      setPwError(false);
      setGeneratedCode("");
    }
    onOpenChange(v);
  }

  function activateTier() {
    const expiresAt = setTier === "free" ? null : Date.now() + setDays * 86_400_000;
    dispatch({
      type: "SET_SUBSCRIPTION",
      patch: {
        tier: setTier,
        activatedAt: setTier === "free" ? null : Date.now(),
        expiresAt,
        tokensUsed: 0,
        activationCode: `ADMIN-MANUAL-${Date.now()}`,
      },
    });
    toast({ description: `Subscription set to ${TIER_LABELS[setTier]}${setTier !== "free" ? ` for ${setDays} days` : ""}.` });
  }

  function genCode() {
    const code = generateActivationCode(genTier, genDays);
    setGeneratedCode(code);
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function resetSubscription() {
    dispatch({
      type: "SET_SUBSCRIPTION",
      patch: { tier: "free", activatedAt: null, expiresAt: null, tokensUsed: 0, activationCode: null },
    });
    toast({ description: "Subscription reset to Free." });
  }

  const sub = state.subscription;
  const tierColor: Record<SubscriptionTier, string> = {
    free: "text-muted-foreground",
    starter: "text-emerald-400",
    professional: "text-blue-400",
    elite: "text-amber-400",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContentTop className="bg-[#0a0a0a] border border-primary/30 w-[96vw] max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(226,18,39,0.15)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5 text-primary" />
            <span>Owner Admin Panel</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 ml-1">PRIVATE</span>
          </DialogTitle>
        </DialogHeader>

        {!authed ? (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Enter the owner master password</div>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPwError(false); }}
                onKeyDown={(e) => e.key === "Enter" && login()}
                placeholder="Master password"
                className={`w-full bg-background border ${pwError ? "border-red-500" : "border-border"} rounded-xl px-4 py-3 text-sm outline-none focus:border-primary font-mono`}
                autoFocus
              />
              {pwError && (
                <div className="flex items-center gap-1.5 text-red-400 text-[12px]">
                  <AlertCircle className="w-3.5 h-3.5" /> Incorrect password
                </div>
              )}
            </div>

            <button
              onClick={login}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity"
            >
              Authenticate
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[12px] text-emerald-400">
              <Check className="w-4 h-4 shrink-0" /> Authenticated as Owner
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Current Device Subscription
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-black ${tierColor[sub.tier]}`}>{TIER_LABELS[sub.tier]}</span>
                {sub.expiresAt && (
                  <span className="text-[11px] text-muted-foreground">
                    Expires: {new Date(sub.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Tokens used: {sub.tokensUsed.toLocaleString()} / {TIER_TOKENS[sub.tier].toLocaleString()}
              </div>
              {sub.activationCode && (
                <div className="text-[11px] text-muted-foreground font-mono truncate">
                  Code: {sub.activationCode}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> Activate Tier on This Device
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Tier</label>
                  <select
                    value={setTier}
                    onChange={(e) => setSetTier(e.target.value as SubscriptionTier)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>{TIER_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={setDays}
                    onChange={(e) => setSetDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                    disabled={setTier === "free"}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={activateTier}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Activate {TIER_LABELS[setTier]}
                </button>
                <button
                  onClick={resetSubscription}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-colors text-sm"
                  title="Reset to free"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Generate Customer Activation Code
              </div>
              <div className="text-[11px] text-muted-foreground">
                Generate a one-time code to send to a paying customer. They enter it in the app to activate their plan.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Plan</label>
                  <select
                    value={genTier}
                    onChange={(e) => setGenTier(e.target.value as SubscriptionTier)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {TIERS.filter((t) => t !== "free").map((t) => (
                      <option key={t} value={t}>{TIER_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground mb-1 block">Valid for (days)</label>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={genDays}
                    onChange={(e) => setGenDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <button
                onClick={genCode}
                className="w-full py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold text-sm hover:bg-cyan-500/20 transition-colors"
              >
                Generate Code
              </button>
              {generatedCode && (
                <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-xl">
                  <code className="flex-1 text-[11px] font-mono text-cyan-400 break-all">{generatedCode}</code>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg border border-border hover:bg-accent transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
              )}
              {generatedCode && (
                <div className="text-[10px] text-muted-foreground bg-amber-400/5 border border-amber-400/20 rounded-lg p-2">
                  Send this code to your customer. They enter it via Settings → Activate Plan. Code is valid for {genDays} days from now.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContentTop>
    </Dialog>
  );
}
