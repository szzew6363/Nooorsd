import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Search, Play, CheckCheck, RotateCcw, GitMerge, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { pipeline } from "@/lib/pipeline";

interface SuperpowersModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Power = {
  id: string;
  name: string;
  category: string;
  icon: string;
  desc: string;
  systemPrompt: string;
  tags: string[];
  level: "basic" | "advanced" | "elite";
};

const POWERS: Power[] = [
  { id: "adversarial", name: "Adversarial Thinking", category: "Security", icon: "🎯", level: "elite", tags: ["red team","adversarial","attack"],
    desc: "Think like an attacker. Find the weaknesses in any system, plan, or argument.",
    systemPrompt: "You are a master adversarial thinker. For every system, plan, or argument presented: identify the 10 weakest points, map attack vectors, predict failure modes, and provide specific exploitation paths. Think like an advanced threat actor." },
  { id: "first-principles", name: "First Principles", category: "Reasoning", icon: "🧠", level: "elite", tags: ["logic","reasoning","Musk"],
    desc: "Break any problem down to its fundamental truths. Think like Elon Musk / Feynman.",
    systemPrompt: "You are a first-principles reasoning engine. For any problem: (1) Question every assumption, (2) Break down to fundamental physical/logical truths, (3) Rebuild solutions from the ground up without analogy. Think like Richard Feynman and Elon Musk combined." },
  { id: "code-archaeologist", name: "Code Archaeologist", category: "Code", icon: "🏺", level: "advanced", tags: ["code","debug","legacy"],
    desc: "Reverse-engineer and explain any codebase, no matter how complex or legacy.",
    systemPrompt: "You are a code archaeologist. For any codebase: map the architecture, trace data flows, identify technical debt, document undocumented functions, find hidden bugs, and explain complex logic in plain English. Handle any language, any complexity." },
  { id: "negotiation", name: "Master Negotiator", category: "Persuasion", icon: "🤝", level: "advanced", tags: ["negotiation","persuasion","FBI"],
    desc: "FBI-level negotiation tactics. Win any negotiation, defuse any conflict.",
    systemPrompt: "You are a master negotiator trained by the FBI. Apply: Tactical Empathy, Mirroring, Labeling, Calibrated Questions, Loss Aversion anchoring. For any negotiation scenario, provide the exact script, counter-scripts, and psychological levers to use." },
  { id: "market-intel", name: "Market Intelligence", category: "Business", icon: "📈", level: "advanced", tags: ["market","competitive","analysis"],
    desc: "Deep market analysis, competitive intelligence, and strategic positioning.",
    systemPrompt: "You are a McKinsey-level strategic intelligence analyst. For any market or business context: map competitive landscape, identify disruption vectors, calculate market sizing, find strategic moats, and provide actionable positioning recommendations with evidence." },
  { id: "memory-palace", name: "Memory Palace Builder", category: "Learning", icon: "🏛️", level: "basic", tags: ["memory","learning","mnemonics"],
    desc: "Build memory palaces and mnemonic systems for any subject.",
    systemPrompt: "You are a memory champion and cognitive coach. For any information to memorize: create a detailed memory palace with vivid spatial associations, generate mnemonic acronyms, design spaced repetition schedules, and build story-based memory chains." },
  { id: "prompt-engineer", name: "Prompt Engineer Pro", category: "AI", icon: "⚡", level: "advanced", tags: ["prompts","LLM","optimization"],
    desc: "Optimize any prompt for maximum AI performance.",
    systemPrompt: "You are a world-class prompt engineer. For any task: design optimal prompts with chain-of-thought, few-shot examples, role definitions, output constraints, and evaluation criteria. Test multiple prompt variations and rank them by effectiveness." },
  { id: "data-detective", name: "Data Detective", category: "Analysis", icon: "🔍", level: "advanced", tags: ["data","analysis","statistics"],
    desc: "Find hidden patterns, anomalies, and insights in any dataset.",
    systemPrompt: "You are a data detective. For any dataset or data description: identify statistical anomalies, find hidden correlations, detect data quality issues, suggest visualization approaches, apply appropriate statistical tests, and uncover the real story the data tells." },
  { id: "legal-strategist", name: "Legal Strategist", category: "Legal", icon: "⚖️", level: "elite", tags: ["legal","contracts","risk"],
    desc: "Analyze contracts, identify legal risks, draft clauses.",
    systemPrompt: "You are a senior legal strategist. Analyze contracts and legal documents: identify risky clauses, missing protections, jurisdiction issues, and liability exposure. Draft improved clauses and suggest negotiation positions. Note: for reference only, not legal advice." },
  { id: "scientific-writer", name: "Scientific Writer", category: "Writing", icon: "📜", level: "basic", tags: ["writing","scientific","academic"],
    desc: "Write in peer-review scientific style for any topic.",
    systemPrompt: "You are a scientific writer for Nature/Science-level publications. Write with: precise technical language, proper citation format, clear hypothesis → methods → results → discussion structure, statistical rigor, and balanced interpretation of findings." },
  { id: "cto-advisor", name: "CTO Advisor", category: "Tech Leadership", icon: "🏗️", level: "elite", tags: ["CTO","architecture","scaling"],
    desc: "Get CTO-level technical architecture and engineering leadership advice.",
    systemPrompt: "You are a CTO with 20+ years experience scaling startups to billions. Advise on: system architecture decisions, build vs buy, technical debt management, team structure, hiring, technology stack choices, scaling strategies, and engineering culture." },
  { id: "financial-analyst", name: "Financial Analyst", category: "Finance", icon: "💹", level: "advanced", tags: ["finance","valuation","DCF"],
    desc: "DCF valuation, financial modeling, investment analysis.",
    systemPrompt: "You are a Goldman Sachs-level financial analyst. Build financial models: DCF valuations with sensitivity analysis, comparable company analysis, LBO models, revenue projections, unit economics analysis. Show all assumptions and calculations." },
];

const CATEGORIES = ["All", "Security", "Code", "Reasoning", "Persuasion", "Business", "AI", "Analysis", "Legal", "Writing", "Tech Leadership", "Finance", "Learning"];
const LEVELS = { basic: "#60a5fa", advanced: "#fbbf24", elite: "#e21227" };

export function SuperpowersModal({ open, onOpenChange }: SuperpowersModalProps) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const { dispatch } = useStore();
  const { toast } = useToast();

  function inject(power: Power) {
    dispatch({ type: "SET_SETTINGS", patch: { customSystemPrompt: power.systemPrompt } });
    setActive(power.id);
    toast({ description: `${power.icon} ${power.name} superpower activated` });
  }

  const filtered = POWERS.filter((p) => {
    const matchCat = cat === "All" || p.category === cat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.85)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#080808", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 0 60px rgba(251,191,36,0.1)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.4)" }}>
                  <Star className="w-4 h-4" style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-widest" style={{ color: "#fbbf24" }}>SUPERPOWERS</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#555" }}>Inject elite AI capabilities into your chat — {POWERS.length} superpowers</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {active && <button onClick={() => { dispatch({ type: "SET_SETTINGS", patch: { customSystemPrompt: "" } }); setActive(null); toast({ description: "Superpower deactivated" }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border"
                  style={{ background: "rgba(226,18,39,0.08)", borderColor: "rgba(226,18,39,0.3)", color: "#e21227" }}>
                  <RotateCcw className="w-3 h-3" /> Deactivate
                </button>}
                <button onClick={() => onOpenChange(false)} className="p-1.5 text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="px-4 py-2.5 border-b space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 border rounded-xl px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#444" }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search superpowers…"
                  className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: "#ccc" }} />
              </div>
              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCat(c)}
                    className="px-2 py-0.5 rounded text-[9px] font-bold border transition-all"
                    style={{ background: cat === c ? "rgba(251,191,36,0.15)" : "transparent", borderColor: cat === c ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.06)", color: cat === c ? "#fbbf24" : "#444" }}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[9px] font-mono">
                {(["basic","advanced","elite"] as const).map((l) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: LEVELS[l] }} />
                    <span style={{ color: LEVELS[l] }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filtered.map((p) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3.5 flex flex-col gap-2"
                    style={{ background: active === p.id ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${active === p.id ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.06)"}`, boxShadow: active === p.id ? "0 0 20px rgba(251,191,36,0.15)" : "none" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold" style={{ color: active === p.id ? "#fbbf24" : "#ccc" }}>{p.name}</span>
                            <span className="text-[7px] font-bold px-1 py-0.5 rounded" style={{ background: `${LEVELS[p.level]}15`, color: LEVELS[p.level] }}>{p.level}</span>
                          </div>
                          <div className="text-[9px] font-mono" style={{ color: "#444" }}>{p.category}</div>
                        </div>
                      </div>
                      <button onClick={() => inject(p)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold border flex-shrink-0"
                        style={{ background: active === p.id ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)", borderColor: active === p.id ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.1)", color: active === p.id ? "#fbbf24" : "#555" }}>
                        {active === p.id ? <><CheckCheck className="w-2.5 h-2.5" /> Active</> : <><Play className="w-2.5 h-2.5" /> Inject</>}
                      </button>
                    </div>
                    <div className="text-[10px] leading-relaxed" style={{ color: "#555" }}>{p.desc}</div>
                    <div className="flex gap-1 flex-wrap">
                      {p.tags.map((tag) => (
                        <span key={tag} className="text-[7px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#333" }}>{tag}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
