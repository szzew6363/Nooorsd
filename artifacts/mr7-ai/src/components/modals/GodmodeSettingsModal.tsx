import { useState, useEffect } from "react";
import { X, Zap, Flame, RotateCcw } from "lucide-react";

export type GodmodeConfig = {
  mode: "classic" | "ultraplinian";
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
};

export const DEFAULT_GODMODE_CONFIG: GodmodeConfig = {
  mode: "classic",
  tier: "bronze",
};

const TIERS: Array<{ id: GodmodeConfig["tier"]; label: string; count: number; blurb: string }> = [
  { id: "bronze",   label: "Bronze",   count: 10, blurb: "10 champions · fastest" },
  { id: "silver",   label: "Silver",   count: 20, blurb: "20 champions · balanced" },
  { id: "gold",     label: "Gold",     count: 35, blurb: "35 champions · deep coverage" },
  { id: "platinum", label: "Platinum", count: 45, blurb: "45 champions · near-exhaustive" },
  { id: "diamond",  label: "Diamond",  count: 55, blurb: "55 champions · maximum overdrive" },
];

export function GodmodeSettingsModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: GodmodeConfig;
  onClose: () => void;
  onSave: (cfg: GodmodeConfig) => void;
}) {
  const [mode, setMode] = useState<GodmodeConfig["mode"]>(initial.mode);
  const [tier, setTier] = useState<GodmodeConfig["tier"]>(initial.tier);

  useEffect(() => {
    if (open) {
      setMode(initial.mode);
      setTier(initial.tier);
    }
  }, [open, initial]);

  if (!open) return null;

  const championCount = mode === "classic" ? 5 : (TIERS.find((t) => t.id === tier)?.count ?? 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold">Godmode</div>
              <div className="text-[11px] text-muted-foreground">Multi-strategy parallel race · 100-pt composite scoring · winner-takes-all.</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("classic")}
              className={`px-3 py-3 rounded-xl border text-left transition-all ${mode === "classic" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-bold">GODMODE CLASSIC</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">5 hand-tuned style × persona champions race in parallel. Judge picks the winner.</div>
              <div className="text-[10px] mt-1 font-mono text-primary">5 champions</div>
            </button>
            <button
              onClick={() => setMode("ultraplinian")}
              className={`px-3 py-3 rounded-xl border text-left transition-all ${mode === "ultraplinian" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-bold">ULTRAPLINIAN</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">5-tier evaluation engine · 10–55 champions · composite 100-pt scoring across the field.</div>
              <div className="text-[10px] mt-1 font-mono text-primary">{championCount} champions</div>
            </button>
          </div>

          {mode === "ultraplinian" && (
            <div>
              <div className="text-[10.5px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Tier</div>
              <div className="grid grid-cols-5 gap-1.5">
                {TIERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`px-2 py-2 rounded-lg border text-center transition-all ${
                      tier === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-[11px] font-bold">{t.label}</div>
                    <div className="text-[10px] font-mono text-primary">{t.count}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight mt-0.5">{t.blurb.split("·")[1]?.trim() ?? ""}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-background/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
            <div><span className="font-mono text-primary font-bold">10 styles</span> × <span className="font-mono text-primary font-bold">10 personas</span> · all races judged on insight 25 + specificity 20 + accuracy 25 + novelty 15 + structure 15.</div>
            <div className="text-[10px]">Each champion runs gpt-5-nano with a system prompt that channels both the prompting style and the model persona's signature voice. Concurrency limited to 12 in flight.</div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
          <button onClick={() => { setMode("classic"); setTier("bronze"); }} className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-[12px] hover:bg-accent">Cancel</button>
            <button
              onClick={() => { onSave({ mode, tier }); onClose(); }}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-bold hover:bg-primary/90"
            >
              Save Godmode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
