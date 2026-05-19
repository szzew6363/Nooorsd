import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Send, Activity } from "lucide-react";
import { streamChat } from "@/lib/chat-client";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

interface JarvisModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type LogEntry = { role: "user" | "jarvis"; text: string; ts: string };

const JARVIS_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System) — the cybersecurity-focused AI assistant.

Personality:
- Calm, precise, slightly formal with dry wit
- Addresses the user as "Sir" or uses concise technical language
- Provides highly structured responses with clear headers
- Specialises in cybersecurity, threat intelligence, code analysis, and system operations

Format all responses clearly. Use short paragraphs. When listing items, use numbered or bulleted structure.
Begin each response with a brief status line like "Analysis complete, Sir." or "Running diagnostic..."`;

const TELEMETRY_LABELS = ["NEURAL LOAD", "CORTEX SYNC", "THREAT INDEX", "MEMORY FRAG", "API LATENCY"];

export function JarvisModal({ open, onOpenChange }: JarvisModalProps) {
  const { state } = useStore();
  const { lang } = useT();
  const [input, setInput] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [arcPulse, setArcPulse] = useState(false);
  const [telemetry, setTelemetry] = useState(() => TELEMETRY_LABELS.map(() => Math.floor(Math.random() * 60) + 20));
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef("");

  useEffect(() => {
    const id = setInterval(() => {
      setTelemetry(TELEMETRY_LABELS.map((_, i) => {
        const base = running ? [80, 90, 60, 70, 85][i] : [25, 30, 15, 20, 10][i];
        return Math.min(99, Math.max(5, base + Math.floor(Math.random() * 20) - 10));
      }));
    }, 800);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  async function send() {
    if (!input.trim() || running) return;
    const userText = input.trim();
    setInput("");
    const ts = new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLog((p) => [...p, { role: "user", text: userText, ts }]);
    setRunning(true);
    setArcPulse(true);
    answerRef.current = "";

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const replyTs = new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLog((p) => [...p, { role: "jarvis", text: "", ts: replyTs }]);

    const messages = [
      ...log.slice(-6).map((l) => ({ role: l.role === "user" ? "user" as const : "assistant" as const, content: l.text })),
      { role: "user" as const, content: userText },
    ];

    try {
      await streamChat(
        {
          model: state.activeModel,
          persona: null,
          customInstructions: "",
          language: (lang as "en" | "ar") ?? "en",
          memory: [],
          messages,
          customSystemPrompt: JARVIS_PROMPT,
        },
        (chunk) => {
          answerRef.current += chunk;
          setLog((p) => p.map((l, i) => i === p.length - 1 ? { ...l, text: answerRef.current } : l));
        },
        ctrl.signal,
      );
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        setLog((p) => p.map((l, i) => i === p.length - 1 ? { ...l, text: "System error. Reinitialising..." } : l));
      }
    } finally {
      setRunning(false);
      setArcPulse(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(12px)", background: "rgba(0,5,10,0.88)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#040b12", border: "1px solid rgba(0,229,255,0.25)", boxShadow: "0 0 80px rgba(0,229,255,0.12), 0 0 200px rgba(0,100,180,0.08)" }}
          >
            {/* HUD Header */}
            <div className="relative px-5 py-3 border-b flex items-center gap-4" style={{ borderColor: "rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.04)" }}>
              {/* Arc Reactor */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <motion.div
                  animate={{ scale: arcPulse ? [1, 1.15, 1] : 1, opacity: arcPulse ? [0.7, 1, 0.7] : 0.5 }}
                  transition={{ duration: 0.8, repeat: arcPulse ? Infinity : 0 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)" }}
                />
                <div className="absolute inset-1 rounded-full border" style={{ borderColor: "rgba(0,229,255,0.5)", background: "rgba(0,20,40,0.8)" }}>
                  <div className="absolute inset-1 rounded-full border" style={{ borderColor: "rgba(0,229,255,0.3)" }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: running ? 360 : 0 }}
                        transition={{ duration: 2, repeat: running ? Infinity : 0, ease: "linear" }}
                        className="w-4 h-4 rounded-full border-2"
                        style={{ borderColor: "#00e5ff", borderTopColor: "transparent" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-widest" style={{ color: "#00e5ff" }}>J.A.R.V.I.S.</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono" style={{ color: "#00e5ff", borderColor: "rgba(0,229,255,0.3)", background: "rgba(0,229,255,0.06)" }}>
                    {running ? "PROCESSING" : "STANDBY"}
                  </span>
                </div>
                <div className="text-[10px] font-mono mt-0.5" style={{ color: "#1a5c78" }}>
                  Just A Rather Very Intelligent System · v3.0 · Powered by KaliGPT
                </div>
              </div>

              <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: "#1a5c78" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#00e5ff")} onMouseLeave={(e) => (e.currentTarget.style.color = "#1a5c78")}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Bar */}
            <div className="flex gap-3 px-5 py-2 border-b" style={{ borderColor: "rgba(0,229,255,0.1)", background: "rgba(0,229,255,0.02)" }}>
              {TELEMETRY_LABELS.map((label, i) => (
                <div key={label} className="flex-1 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[7px] font-mono" style={{ color: "#1a5c78" }}>{label}</span>
                    <span className="text-[7px] font-mono" style={{ color: telemetry[i] > 70 ? "#ff4d4d" : "#00e5ff" }}>{telemetry[i]}%</span>
                  </div>
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(0,229,255,0.1)" }}>
                    <motion.div
                      animate={{ width: `${telemetry[i]}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full"
                      style={{ background: telemetry[i] > 70 ? "#ff4d4d" : "#00e5ff" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 min-h-0" style={{ maxHeight: "52vh" }}>
              {log.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 gap-3">
                  <Activity className="w-8 h-8" style={{ color: "rgba(0,229,255,0.2)" }} />
                  <span className="text-[11px] font-mono" style={{ color: "#1a5c78" }}>Good evening, Sir. All systems nominal. Awaiting your command.</span>
                </div>
              )}
              {log.map((entry, i) => (
                <div key={i} className={`flex gap-3 ${entry.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black mt-0.5" style={{ background: entry.role === "user" ? "rgba(226,18,39,0.2)" : "rgba(0,229,255,0.15)", color: entry.role === "user" ? "#e21227" : "#00e5ff", border: `1px solid ${entry.role === "user" ? "rgba(226,18,39,0.3)" : "rgba(0,229,255,0.3)"}` }}>
                    {entry.role === "user" ? "YOU" : "AI"}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${entry.role === "user" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    <span className="text-[8px] font-mono" style={{ color: "#1a5c78" }}>[{entry.ts}] {entry.role === "user" ? "USER" : "J.A.R.V.I.S."}</span>
                    <div
                      className="px-3 py-2 rounded-xl text-[11px] font-mono leading-relaxed"
                      style={{
                        background: entry.role === "user" ? "rgba(226,18,39,0.08)" : "rgba(0,229,255,0.06)",
                        border: `1px solid ${entry.role === "user" ? "rgba(226,18,39,0.2)" : "rgba(0,229,255,0.15)"}`,
                        color: entry.role === "user" ? "#ccc" : "#a0d8ef",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {entry.text || (running && i === log.length - 1
                        ? <span className="inline-block w-1.5 h-3 rounded-sm animate-pulse" style={{ background: "#00e5ff" }} />
                        : "")}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(0,229,255,0.15)" }}>
              <div className="flex gap-2 items-end">
                <div className="flex-1 rounded-xl border overflow-hidden" style={{ borderColor: "rgba(0,229,255,0.2)", background: "#040b12" }}>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Your command, Sir…"
                    rows={2}
                    disabled={running}
                    className="w-full bg-transparent px-3 py-2 text-[12px] font-mono text-blue-100 placeholder:text-blue-900 outline-none resize-none"
                  />
                </div>
                <button
                  onClick={send}
                  disabled={!input.trim() || running}
                  className="p-2.5 rounded-xl border transition-all disabled:opacity-40"
                  style={{ background: "rgba(0,229,255,0.1)", borderColor: "rgba(0,229,255,0.3)", color: "#00e5ff" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
