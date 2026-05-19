import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bot, Hexagon, Cpu, Zap, Brain, Terminal, Database,
  Layers, Code2, Users, Sparkles, BookOpen, Settings2,
  CheckSquare, Square, ExternalLink, Shield, Swords,
} from "lucide-react";

export type ArsenalModuleId =
  | "kaliagent" | "nexus" | "jarvis" | "parseltongue"
  | "ragflow" | "opengravity" | "teamagent" | "skills"
  | "agentOS" | "geminiCLI";

export type ArsenalModule = {
  id: ArsenalModuleId;
  name: string;
  subtitle: string;
  desc: string;
  icon: typeof Bot;
  color: string;
  border: string;
  bg: string;
  glow: string;
  source: string;
  tag: string;
};

export const ARSENAL_MODULES: ArsenalModule[] = [
  {
    id: "kaliagent", name: "KaliAgent", subtitle: "Autonomous Recon Agent",
    desc: "Multi-step ReAct agent with live web search, DNS, CVE hunting, exploit gen & network recon.",
    icon: Bot, color: "#ff4d4d", border: "rgba(255,77,77,0.35)", bg: "rgba(255,77,77,0.08)", glow: "rgba(255,77,77,0.25)",
    source: "OpenClaw", tag: "AGENT",
  },
  {
    id: "nexus", name: "NEXUS Agent", subtitle: "5-Tier Super Agent",
    desc: "Escalating intelligence tiers I–V. Tier V activates Council multi-brain synthesis after the ReAct loop.",
    icon: Hexagon, color: "#fbbf24", border: "rgba(251,191,36,0.4)", bg: "rgba(251,191,36,0.08)", glow: "rgba(251,191,36,0.3)",
    source: "NEXUS", tag: "SUPER AGENT",
  },
  {
    id: "jarvis", name: "JARVIS", subtitle: "Iron Man HUD Assistant",
    desc: "Futuristic HUD interface with arc reactor core, system telemetry, and voice-aware AI assistant.",
    icon: Cpu, color: "#00e5ff", border: "rgba(0,229,255,0.35)", bg: "rgba(0,229,255,0.07)", glow: "rgba(0,229,255,0.25)",
    source: "Project JARVIS", tag: "HUD",
  },
  {
    id: "parseltongue", name: "Parseltongue", subtitle: "Red-Team Text Engine",
    desc: "6 obfuscation techniques (leetspeak, unicode, ZWJ, mixedcase, phonetic, random) × 3 intensities for adversarial prompt research.",
    icon: Swords, color: "#00ff41", border: "rgba(0,255,65,0.3)", bg: "rgba(0,255,65,0.06)", glow: "rgba(0,255,65,0.2)",
    source: "G0DM0D3", tag: "RED TEAM",
  },
  {
    id: "ragflow", name: "RAGFlow", subtitle: "Knowledge Base Chat",
    desc: "Upload documents (text/markdown/code) and chat with them using deep retrieval-augmented generation.",
    icon: Database, color: "#3b82f6", border: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.07)", glow: "rgba(59,130,246,0.25)",
    source: "RAGFlow", tag: "RAG",
  },
  {
    id: "opengravity", name: "OpenGravity IDE", subtitle: "AI Code Editor",
    desc: "Browser-based AI code editor with inline completions, refactor, explain, and debug powered by the main AI.",
    icon: Code2, color: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.07)", glow: "rgba(167,139,250,0.25)",
    source: "OpenGravity", tag: "IDE",
  },
  {
    id: "teamagent", name: "Team Agent", subtitle: "Parallel Multi-Agent Mode",
    desc: "Spawn 2–5 agents in parallel on the same task. Each produces independent analysis. Final fusion synthesis merges results.",
    icon: Users, color: "#f97316", border: "rgba(249,115,22,0.35)", bg: "rgba(249,115,22,0.07)", glow: "rgba(249,115,22,0.25)",
    source: "oh-my-openagent", tag: "PARALLEL",
  },
  {
    id: "skills", name: "Skills Library", subtitle: "1,460+ Agentic Skills",
    desc: "Browse, search, and inject curated SKILL.md playbooks from Antigravity / Ruflo into the active AI context.",
    icon: BookOpen, color: "#10b981", border: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.07)", glow: "rgba(16,185,129,0.25)",
    source: "Antigravity + Ruflo", tag: "SKILLS",
  },
  {
    id: "agentOS", name: "Agent OS", subtitle: "Autonomous Task Runner",
    desc: "Schedule recurring AI tasks. Agents run autonomously on a timer and post results to the chat stream.",
    icon: Layers, color: "#fb923c", border: "rgba(251,146,60,0.35)", bg: "rgba(251,146,60,0.07)", glow: "rgba(251,146,60,0.25)",
    source: "OpenFang", tag: "SCHEDULER",
  },
  {
    id: "geminiCLI", name: "Gemini CLI", subtitle: "Terminal AI Interface",
    desc: "Command-line style AI terminal with slash commands, piped output, file context injection, and history.",
    icon: Terminal, color: "#818cf8", border: "rgba(129,140,248,0.35)", bg: "rgba(129,140,248,0.07)", glow: "rgba(129,140,248,0.25)",
    source: "Gemini CLI", tag: "CLI",
  },
];

const STORAGE_KEY = "mr7-arsenal-enabled";

interface ArsenalHubModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLaunch: (id: ArsenalModuleId) => void;
}

export function ArsenalHubModal({ open, onOpenChange, onLaunch }: ArsenalHubModalProps) {
  const [enabled, setEnabled] = useState<Set<ArsenalModuleId>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw) as ArsenalModuleId[]);
    } catch { /* ignore */ }
    return new Set(ARSENAL_MODULES.map((m) => m.id));
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
  }, [enabled]);

  function toggle(id: ArsenalModuleId) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (enabled.size === ARSENAL_MODULES.length) setEnabled(new Set());
    else setEnabled(new Set(ARSENAL_MODULES.map((m) => m.id)));
  }

  const filtered = ARSENAL_MODULES.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase()) || m.source.toLowerCase().includes(search.toLowerCase()),
  );

  const allOn = enabled.size === ARSENAL_MODULES.length;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.82)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#080808", border: "1px solid rgba(226,18,39,0.25)", boxShadow: "0 0 80px rgba(226,18,39,0.12), 0 30px 60px rgba(0,0,0,0.9)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(226,18,39,0.2)", background: "rgba(226,18,39,0.04)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: "rgba(226,18,39,0.1)", borderColor: "rgba(226,18,39,0.4)" }}>
                  <Shield className="w-5 h-5" style={{ color: "#e21227" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-widest" style={{ color: "#e21227" }}>ARSENAL</span>
                    <span className="text-sm font-black tracking-widest text-white">HUB</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono" style={{ color: "#00e5cc", borderColor: "rgba(0,229,204,0.4)", background: "rgba(0,229,204,0.06)" }}>
                      {enabled.size}/{ARSENAL_MODULES.length} ACTIVE
                    </span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#444" }}>Launch, configure, and chain AI modules</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border"
                  style={{ background: allOn ? "rgba(226,18,39,0.1)" : "rgba(0,229,204,0.08)", borderColor: allOn ? "rgba(226,18,39,0.3)" : "rgba(0,229,204,0.3)", color: allOn ? "#e21227" : "#00e5cc" }}
                >
                  {allOn ? <Square className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                  {allOn ? "Deselect All" : "Select All"}
                </button>
                <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules…"
                className="w-full bg-transparent border rounded-lg px-3 py-2 text-[12px] outline-none font-mono"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#ccc" }}
              />
            </div>

            {/* Module Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((mod) => {
                  const Icon = mod.icon;
                  const isEnabled = enabled.has(mod.id);
                  return (
                    <motion.div
                      key={mod.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-3.5 flex flex-col gap-3 transition-all"
                      style={{
                        background: isEnabled ? mod.bg : "#0d0d0d",
                        border: `1px solid ${isEnabled ? mod.border : "rgba(255,255,255,0.06)"}`,
                        boxShadow: isEnabled ? `0 0 20px ${mod.glow}` : "none",
                        opacity: isEnabled ? 1 : 0.55,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0" style={{ background: isEnabled ? mod.bg : "#111", borderColor: isEnabled ? mod.border : "rgba(255,255,255,0.08)" }}>
                            <Icon className="w-4.5 h-4.5" style={{ color: isEnabled ? mod.color : "#444", width: 18, height: 18 }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-black" style={{ color: isEnabled ? mod.color : "#555" }}>{mod.name}</span>
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.05)", color: "#555" }}>{mod.tag}</span>
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: isEnabled ? "#888" : "#444" }}>{mod.subtitle}</div>
                          </div>
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => toggle(mod.id)}
                          className="relative w-10 h-5 rounded-full transition-all flex-shrink-0 mt-1"
                          style={{
                            background: isEnabled ? mod.color : "#222",
                            boxShadow: isEnabled ? `0 0 10px ${mod.glow}` : "none",
                          }}
                        >
                          <div
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                            style={{ left: isEnabled ? "calc(100% - 18px)" : 2 }}
                          />
                        </button>
                      </div>

                      <p className="text-[10px] leading-relaxed" style={{ color: isEnabled ? "#666" : "#3a3a3a" }}>
                        {mod.desc}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono" style={{ color: "#333" }}>
                          src: {mod.source}
                        </span>
                        <button
                          onClick={() => { if (isEnabled) { onLaunch(mod.id); onOpenChange(false); } }}
                          disabled={!isEnabled}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30"
                          style={{
                            background: mod.bg,
                            border: `1px solid ${mod.border}`,
                            color: mod.color,
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Launch
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] font-mono" style={{ color: "#333" }}>
                Sources: OpenClaw · G0DM0D3 · JARVIS · RAGFlow · OpenFang · OpenGravity · oh-my-openagent · Antigravity · Ruflo · Gemini CLI
              </span>
              <span className="text-[10px] font-mono" style={{ color: "#444" }}>
                All modules powered by main AI brain
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
