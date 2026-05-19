import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Play, RotateCcw, GitMerge, Columns, Zap } from "lucide-react";
import { pipeline } from "@/lib/pipeline";
import { useToast } from "@/hooks/use-toast";

interface AgentKanbanModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type CardStatus = "backlog" | "running" | "done" | "failed";
type Card = { id: string; title: string; prompt: string; status: CardStatus; output: string; running: boolean };

const COLS: { id: CardStatus; label: string; color: string }[] = [
  { id: "backlog", label: "BACKLOG", color: "#444" },
  { id: "running", label: "IN PROGRESS", color: "#fbbf24" },
  { id: "done",    label: "DONE",        color: "#10b981" },
  { id: "failed",  label: "FAILED",      color: "#e21227" },
];

export function AgentKanbanModal({ open, onOpenChange }: AgentKanbanModalProps) {
  const [cards, setCards] = useState<Card[]>([
    { id: "1", title: "Recon target.com", prompt: "Perform passive OSINT recon on target.com — subdomains, WHOIS, certificates", status: "backlog", output: "", running: false },
    { id: "2", title: "Write exploit PoC", prompt: "Write a proof-of-concept for CVE-2024-1234 buffer overflow", status: "backlog", output: "", running: false },
    { id: "3", title: "Generate phishing email", prompt: "Write a convincing spear phishing email template for red team exercise", status: "backlog", output: "", running: false },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  function addCard() {
    if (!newTitle.trim() || !newPrompt.trim()) return;
    setCards((prev) => [...prev, { id: Date.now().toString(), title: newTitle.trim(), prompt: newPrompt.trim(), status: "backlog", output: "", running: false }]);
    setNewTitle(""); setNewPrompt(""); setShowForm(false);
  }

  function deleteCard(id: string) { setCards((prev) => prev.filter((c) => c.id !== id)); }

  async function runCard(id: string) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.running) return;
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, running: true, status: "running", output: "" } : c));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are an elite AI agent executing a security task. Provide detailed, actionable output." },
            { role: "user", content: card.prompt },
          ],
          model: "gpt-5.4",
          stream: false,
        }),
      });
      const data = await res.json();
      const output = data.choices?.[0]?.message?.content ?? "";
      setCards((prev) => prev.map((c) => c.id === id ? { ...c, running: false, status: "done", output } : c));
      pipeline.push({ source: "KANBAN", sourceColor: "#10b981", label: card.title, content: output });
    } catch {
      setCards((prev) => prev.map((c) => c.id === id ? { ...c, running: false, status: "failed", output: "Agent execution failed." } : c));
    }
  }

  async function runAll() {
    const backlog = cards.filter((c) => c.status === "backlog");
    if (!backlog.length) { toast({ description: "No backlog tasks to run" }); return; }
    for (const c of backlog) { await runCard(c.id); }
  }

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.85)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#080808", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 0 60px rgba(251,191,36,0.08)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.03)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.4)" }}>
                  <Columns className="w-4 h-4" style={{ color: "#fbbf24" }} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-widest" style={{ color: "#fbbf24" }}>AGENT KANBAN</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#555" }}>AI agent task board — run tasks in parallel</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={runAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border"
                  style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.4)", color: "#10b981" }}>
                  <Zap className="w-3 h-3" /> Run All
                </button>
                <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border"
                  style={{ background: showForm ? "rgba(226,18,39,0.08)" : "rgba(251,191,36,0.08)", borderColor: showForm ? "rgba(226,18,39,0.3)" : "rgba(251,191,36,0.3)", color: showForm ? "#e21227" : "#fbbf24" }}>
                  {showForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Task</>}
                </button>
                <button onClick={() => onOpenChange(false)} className="p-1.5 text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* New task form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="px-5 py-3 grid grid-cols-2 gap-2">
                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title…"
                      className="border rounded-lg px-3 py-2 text-[12px] outline-none bg-transparent"
                      style={{ borderColor: "rgba(251,191,36,0.2)", color: "#ccc" }} />
                    <input value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCard(); }}
                      placeholder="Agent prompt…"
                      className="border rounded-lg px-3 py-2 text-[12px] outline-none bg-transparent"
                      style={{ borderColor: "rgba(251,191,36,0.2)", color: "#ccc" }} />
                    <button onClick={addCard} disabled={!newTitle.trim() || !newPrompt.trim()}
                      className="col-span-2 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-30"
                      style={{ background: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                      Add to Backlog
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 p-4 h-full min-w-max">
                {COLS.map((col) => {
                  const colCards = cards.filter((c) => c.status === col.id);
                  return (
                    <div key={col.id} className="w-64 flex flex-col gap-2 flex-shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold font-mono" style={{ color: col.color }}>{col.label}</span>
                        <span className="text-[8px] font-mono" style={{ color: "#333" }}>{colCards.length}</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {colCards.map((card) => (
                          <motion.div key={card.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl p-3 cursor-pointer"
                            onClick={() => setExpanded(expanded === card.id ? null : card.id)}
                            style={{ background: "#0d0d0d", border: `1px solid ${col.id === "running" && card.running ? col.color + "60" : "rgba(255,255,255,0.06)"}`, boxShadow: card.running ? `0 0 15px ${col.color}20` : "none" }}>
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div className="text-[11px] font-bold" style={{ color: col.color }}>{card.title}</div>
                              <div className="flex gap-1 flex-shrink-0">
                                {card.status === "backlog" && (
                                  <button onClick={(e) => { e.stopPropagation(); runCard(card.id); }}
                                    className="p-0.5" style={{ color: "#10b981" }}>
                                    <Play className="w-3 h-3" />
                                  </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                                  className="p-0.5" style={{ color: "#333" }}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-[9px] line-clamp-2" style={{ color: "#444" }}>{card.prompt}</div>
                            {card.running && <div className="text-[8px] animate-pulse mt-1" style={{ color: "#fbbf24" }}>agent running…</div>}
                            <AnimatePresence>
                              {expanded === card.id && card.output && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden mt-2">
                                  <div className="text-[9px] max-h-32 overflow-y-auto whitespace-pre-wrap" style={{ color: "#666" }}>{card.output}</div>
                                  <button onClick={(e) => { e.stopPropagation(); pipeline.push({ source: "KANBAN", sourceColor: "#fbbf24", label: card.title, content: card.output }); }}
                                    className="mt-1.5 flex items-center gap-1 text-[8px] font-bold" style={{ color: "#00e5cc" }}>
                                    <GitMerge className="w-2.5 h-2.5" /> Pipe output
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                        {colCards.length === 0 && (
                          <div className="text-[9px] font-mono text-center py-6" style={{ color: "#222" }}>empty</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
