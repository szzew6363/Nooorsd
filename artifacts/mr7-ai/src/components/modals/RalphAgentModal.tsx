import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Send, FolderOpen, FileText, RotateCcw, GitMerge, ChevronRight, Cpu } from "lucide-react";
import { pipeline } from "@/lib/pipeline";

interface RalphAgentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Message = { role: "user" | "ralph"; content: string; ts: string };
type Tool = { id: string; name: string; icon: string; desc: string; prompt: string };

const RALPH_TOOLS: Tool[] = [
  { id: "read", name: "Read File",     icon: "📄", desc: "Read and analyze file contents",     prompt: "Read and analyze this file content:" },
  { id: "write", name: "Write Code",   icon: "✍️", desc: "Generate complete source files",     prompt: "Write complete source code for:" },
  { id: "test",  name: "Run Tests",    icon: "🧪", desc: "Generate and execute tests",         prompt: "Generate comprehensive tests for:" },
  { id: "plan",  name: "Plan Task",    icon: "📋", desc: "Create a detailed execution plan",   prompt: "Create a detailed plan to:" },
  { id: "debug", name: "Debug",        icon: "🐛", desc: "Find and fix bugs systematically",   prompt: "Debug and fix this issue:" },
  { id: "docs",  name: "Gen Docs",     icon: "📚", desc: "Auto-generate documentation",        prompt: "Generate complete documentation for:" },
  { id: "git",   name: "Git Helper",   icon: "🔀", desc: "Git commands and strategies",        prompt: "Help me with git:" },
  { id: "deploy", name: "Deploy",       icon: "🚀", desc: "Deployment scripts and strategies",  prompt: "Create deployment setup for:" },
];

const RALPH_SYSTEM = `You are RALPH — an autonomous desktop AI agent with file system access, code execution, and planning capabilities.

Your personality: Methodical, thorough, and dependable. You:
1. THINK before acting — analyze requirements first
2. PLAN explicitly — state what you'll do before doing it
3. EXECUTE precisely — give exact, working code or commands
4. VERIFY — consider edge cases and error states
5. REPORT — summarize what was accomplished

Always show your reasoning. Give complete, production-ready outputs.`;

export function RalphAgentModal({ open, onOpenChange }: RalphAgentModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ralph", content: "Hello. I'm RALPH — your autonomous desktop AI agent. I can read files, write code, run tests, and execute complex multi-step tasks. What would you like me to do?", ts: new Date().toLocaleTimeString("en-US", { hour12: false }) },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    const history = [...messages, { role: "user" as const, content: text, ts }];
    setMessages(history);
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "ralph", content: "", ts: new Date().toLocaleTimeString("en-US", { hour12: false }) }]);

    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: RALPH_SYSTEM },
            ...history.map((m) => ({ role: m.role === "ralph" ? "assistant" : "user", content: m.content })),
          ],
          model: "gpt-5.4",
          stream: true,
        }),
        signal: abortRef.current.signal,
      });
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      let buf = "", full = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") continue;
          try { const c = JSON.parse(raw); const d = c.choices?.[0]?.delta?.content ?? ""; full += d; setMessages((p) => p.map((m, i) => i === p.length - 1 ? { ...m, content: full } : m)); } catch { /* ignore */ }
        }
      }
      if (full) pipeline.push({ source: "RALPH", sourceColor: "#fb923c", label: text.slice(0, 40), content: full });
    } catch { /* ignore */ }
    setStreaming(false);
    setActiveTool(null);
  }

  function useTool(tool: Tool) {
    setActiveTool(tool.id);
    setInput(tool.prompt + " ");
  }

  const lastRalph = [...messages].reverse().find((m) => m.role === "ralph");

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.85)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#080808", border: "1px solid rgba(251,146,60,0.25)", boxShadow: "0 0 60px rgba(251,146,60,0.1)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(251,146,60,0.2)", background: "rgba(251,146,60,0.04)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(251,146,60,0.1)", borderColor: "rgba(251,146,60,0.4)" }}>
                  <Cpu className="w-4 h-4" style={{ color: "#fb923c" }} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-widest" style={{ color: "#fb923c" }}>RALPH AGENT</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#555" }}>Desktop autonomous agent — file ops, code, planning</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setMessages([{ role: "ralph", content: "Ready. What would you like me to do?", ts: new Date().toLocaleTimeString("en-US", { hour12: false }) }])}
                  className="p-1.5 text-gray-600 hover:text-orange-400"><RotateCcw className="w-4 h-4" /></button>
                <button onClick={() => onOpenChange(false)} className="p-1.5 text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Tool belt */}
            <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#060606" }}>
              {RALPH_TOOLS.map((t) => (
                <button key={t.id} onClick={() => useTool(t)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold border whitespace-nowrap flex-shrink-0 transition-all"
                  style={{ background: activeTool === t.id ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.03)", borderColor: activeTool === t.id ? "rgba(251,146,60,0.4)" : "rgba(255,255,255,0.06)", color: activeTool === t.id ? "#fb923c" : "#444" }}>
                  <span>{t.icon}</span> {t.name}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "ralph" && (
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.3)" }}>
                      <Bot className="w-3.5 h-3.5" style={{ color: "#fb923c" }} />
                    </div>
                  )}
                  <div className="max-w-[85%] rounded-xl px-3 py-2"
                    style={{ background: m.role === "user" ? "rgba(251,146,60,0.08)" : "#0d0d0d", border: `1px solid ${m.role === "user" ? "rgba(251,146,60,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                    <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono" style={{ color: m.role === "user" ? "#fb923c" : "#888" }}>
                      {m.content}{streaming && i === messages.length - 1 && m.role === "ralph" ? "▊" : ""}
                    </div>
                    <div className="text-[8px] mt-1 font-mono" style={{ color: "#2a2a2a" }}>{m.ts}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {lastRalph && !streaming && lastRalph.content.length > 100 && (
              <div className="px-4 py-2 border-t flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button onClick={() => pipeline.push({ source: "RALPH", sourceColor: "#fb923c", label: "Ralph output", content: lastRalph.content })}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold border"
                  style={{ background: "rgba(0,229,204,0.06)", borderColor: "rgba(0,229,204,0.2)", color: "#00e5cc" }}>
                  <GitMerge className="w-3 h-3" /> Pipe to Pipeline
                </button>
              </div>
            )}

            <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Give RALPH a task… (Enter to send)"
                  disabled={streaming}
                  className="flex-1 border rounded-xl px-3 py-2.5 text-[12px] outline-none bg-transparent"
                  style={{ borderColor: "rgba(251,146,60,0.2)", color: "#ccc" }} />
                <button onClick={() => send()} disabled={streaming || !input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ background: "rgba(251,146,60,0.2)", border: "1px solid rgba(251,146,60,0.4)" }}>
                  <Send className="w-4 h-4" style={{ color: "#fb923c" }} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
