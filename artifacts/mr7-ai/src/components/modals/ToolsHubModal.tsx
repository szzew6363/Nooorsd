import { useMemo, useState } from "react";
import { Dialog, DialogContentTop, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Pin, Sparkles } from "lucide-react";
import { ALL_TOOLS, CATEGORIES, type ToolCategory, type UtilityTool } from "./UtilityToolModal";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function ToolsHubModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (t: UtilityTool) => void;
}) {
  const { state, dispatch } = useStore();
  const { t } = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | ToolCategory>("All");

  const filtered = useMemo(() => {
    return ALL_TOOLS.filter((tool) => cat === "All" || tool.category === cat)
      .filter((tool) => tool.tool.toLowerCase().includes(q.toLowerCase()) || tool.desc.toLowerCase().includes(q.toLowerCase()));
  }, [q, cat]);

  const pinned = ALL_TOOLS.filter((tool) => state.pinnedTools.includes(tool.tool));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentTop className="bg-card border-border w-[96vw] max-w-3xl max-h-[82vh] overflow-hidden flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> {t("toolsHub.title")}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">{ALL_TOOLS.length} {t("toolsHub.free")}</span>
          </DialogTitle>
          <DialogDescription>{t("toolsHub.subtitle", { count: ALL_TOOLS.length })}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("toolsHub.searchPlaceholder")}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-primary text-sm"
              autoFocus
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border ${cat === c ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:text-foreground"}`}
              >
                {c === "All" ? t("toolsHub.all") : c}
              </button>
            ))}
          </div>

          {pinned.length > 0 && cat === "All" && !q && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Pin className="w-3 h-3" /> {t("toolsHub.pinned")}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pinned.map((it) => (
                  <ToolCard key={it.tool} item={it} pinned onPin={() => dispatch({ type: "TOGGLE_TOOL_PIN", tool: it.tool })} onSelect={() => { onSelect(it.tool); onOpenChange(false); }} />
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto -mx-1 px-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filtered.map((it) => (
                <ToolCard
                  key={it.tool}
                  item={it}
                  pinned={state.pinnedTools.includes(it.tool)}
                  onPin={() => dispatch({ type: "TOGGLE_TOOL_PIN", tool: it.tool })}
                  onSelect={() => { onSelect(it.tool); onOpenChange(false); }}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-10">{t("toolsHub.noResults", { q })}</div>
            )}
          </div>
        </div>
      </DialogContentTop>
    </Dialog>
  );
}

function ToolCard({
  item,
  pinned,
  onPin,
  onSelect,
}: {
  item: (typeof ALL_TOOLS)[number];
  pinned: boolean;
  onPin: () => void;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className="w-full text-left rounded-xl border border-border bg-background hover:bg-accent hover:border-primary/30 transition-colors p-3 h-full"
      >
        <div className={`w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center mb-2 ${item.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="font-semibold text-[13px] mb-0.5">{item.tool}</div>
        <div className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{item.desc}</div>
        <div className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/70 mt-2">{item.category}</div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        className={`absolute top-2 right-2 p-1 rounded-md transition-colors ${pinned ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-card"}`}
        aria-label="Pin"
        title={pinned ? "Unpin" : "Pin"}
      >
        <Pin className={`w-3.5 h-3.5 ${pinned ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
