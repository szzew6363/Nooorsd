import { useEffect, useRef, useState } from "react";
import { Menu, Sparkles, Coins, LayoutGrid, HelpCircle, Search, Zap, Brain, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { NotificationsPanel } from "./NotificationsPanel";
import { ThemePopover } from "./ThemePopover";
import { TokensPopover } from "./TokensPopover";
import { AI_MODELS, getModel } from "@/lib/ai-config";

interface TopBarProps {
  onMenuClick: () => void;
  onOpenPricing: () => void;
  onOpenToolsHub: () => void;
  onOpenHelp: () => void;
  onOpenPersonaEditor: () => void;
  onOpenLocalModel: () => void;
}

export function TopBar({ onMenuClick, onOpenPricing, onOpenToolsHub, onOpenHelp, onOpenPersonaEditor, onOpenLocalModel }: TopBarProps) {
  const { state, dispatch } = useStore();
  const { t } = useT();
  const { toast } = useToast();
  const powerOn = state.settings.powerMode;
  function togglePower() {
    const next = !powerOn;
    dispatch({ type: "SET_SETTINGS", patch: { powerMode: next } });
    toast({ description: t(next ? "power.activated" : "power.deactivated") });
  }
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = getModel(state.activeModel);
  const ActiveIcon = active.icon;

  const filtered = AI_MODELS.filter((m) =>
    m.id.toLowerCase().includes(q.toLowerCase()) || m.desc.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <header className="CHAT-GPT-topbar h-14 flex items-center justify-between px-2 sm:px-3 border-b border-border bg-background/85 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-1">
        <button
          onClick={onMenuClick}
          className="p-2 md:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          aria-label={t("top.openMenu")}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-card border border-border hover:bg-accent transition-colors"
            aria-label={`${t("top.switchModel")} — ${active.id}`}
          >
            <span className={`w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 ${active.color}`}>
              <ActiveIcon className="w-3.5 h-3.5" />
            </span>
            <span className="hidden sm:block text-[12px] font-semibold max-w-[140px] truncate">{active.id}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.14 }}
                className="absolute top-full left-0 mt-2 w-[320px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder={t("top.searchModels")}
                      className="w-full bg-background border border-border rounded-lg pl-8 pr-2 py-1.5 outline-none focus:border-primary text-[12px]"
                    />
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5 max-h-[min(75vh,640px)] overflow-y-auto">
                  {filtered.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          dispatch({ type: "SET_MODEL", model: m.id });
                          setOpen(false);
                        }}
                        className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-accent transition-colors"
                      >
                        <span className={`w-7 h-7 rounded-md border border-border flex items-center justify-center flex-shrink-0 mt-0.5 ${m.color}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-foreground truncate">{m.id}</span>
                            {m.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30">{m.badge}</span>}
                          </span>
                          <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5">{m.desc}</span>
                        </span>
                        {state.activeModel === m.id && <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="text-center text-muted-foreground text-[12px] py-6">{t("toolsHub.noResults", { q })}</div>
                  )}
                </div>
                <div className="border-t border-border">
                  <button
                    onClick={() => { onOpenPricing(); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-primary hover:bg-primary/5 transition-colors text-sm font-semibold"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t("top.getMoreTokens")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onOpenToolsHub}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-foreground/90 text-xs font-bold hover:bg-accent transition-colors"
          aria-label={t("top.toolsHub")}
          title={t("top.toolsHub")}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t("top.tools")}</span>
        </button>

        <button
          onClick={onOpenToolsHub}
          className="sm:hidden p-2 text-emerald-400 hover:text-emerald-300 hover:bg-accent rounded-lg transition-colors"
          aria-label={t("top.toolsHub")}
          title={t("top.toolsHub")}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Persona Editor button */}
        <button
          onClick={onOpenPersonaEditor}
          className={`p-2 rounded-lg transition-colors ${
            state.settings.activePersonaPreset !== "default" || state.settings.customSystemPrompt
              ? "text-primary hover:text-primary hover:bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          aria-label="AI Persona Editor"
          title="AI Persona / System Prompt Editor"
        >
          <Brain className="w-4 h-4" />
        </button>

        {/* Local Model button */}
        <button
          onClick={onOpenLocalModel}
          className={`p-2 rounded-lg transition-colors ${
            state.settings.useLocalModel
              ? "text-green-400 hover:text-green-300 hover:bg-green-400/10"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
          aria-label="Local Model Settings"
          title={state.settings.useLocalModel ? `Local: ${state.settings.localModel}` : "Connect Local Model (Ollama / LM Studio)"}
        >
          <Server className="w-4 h-4" />
        </button>

        <button
          onClick={togglePower}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
            powerOn
              ? "bg-primary/15 border-primary/60 text-primary shadow-[0_0_18px_rgba(226,18,39,0.45)] animate-pulse"
              : "bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/40"
          }`}
          aria-label={t("power.title")}
          title={t(powerOn ? "power.tooltipOn" : "power.tooltipOff")}
        >
          <Zap className={`w-3.5 h-3.5 ${powerOn ? "fill-current" : ""}`} />
          <span className="hidden sm:inline">{t("power.title")}</span>
          {powerOn && <span className="text-[9px] font-mono px-1 rounded bg-primary/20">ON</span>}
        </button>

        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-xs font-bold whitespace-nowrap hover:opacity-95 transition-opacity shadow-[0_0_18px_rgba(217,70,239,0.35)]"
          aria-label={t("top.buyTokens")}
          title={t("top.buyTokens")}
        >
          <Coins className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t("top.buyTokens")}</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          aria-label={t("top.shortcuts")}
          title={t("top.shortcuts")}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <NotificationsPanel />
        <ThemePopover />
        <TokensPopover onUpgrade={onOpenPricing} />
      </div>
    </header>
  );
}
