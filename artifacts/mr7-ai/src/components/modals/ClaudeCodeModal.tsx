import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Terminal, Play, Square, RotateCcw, ChevronRight, Zap } from "lucide-react";
import { streamChat } from "@/lib/chat-client";

interface ClaudeCodeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type UltraMode = "medium" | "high" | "xhigh" | "max" | "ultracode";

const MODES: { id: UltraMode; label: string; sub?: string; effort: string; color: string }[] = [
  { id: "medium",    label: "medium",    effort: "/effort medium",   color: "#888" },
  { id: "high",      label: "high",      effort: "/effort high",     color: "#aaa" },
  { id: "xhigh",     label: "xhigh",     effort: "/effort xhigh",    color: "#c084fc" },
  { id: "max",       label: "max",       effort: "/effort max",      color: "#a855f7" },
  { id: "ultracode", label: "ultracode", sub: "xhigh + workflows",   effort: "/effort xhigh for your hardest tasks", color: "#7c3aed" },
];

const MODE_SYSTEM_PROMPTS: Record<UltraMode, string> = {
  medium: "You are an AI assistant. Provide clear, concise responses.",
  high: "You are an advanced AI assistant. Think step by step, provide detailed and thorough responses.",
  xhigh: "You are an expert-level AI assistant. Analyze deeply, reason carefully, and provide comprehensive multi-step solutions with full explanations.",
  max: "You are operating at maximum intelligence. Engage every reasoning capability. Provide exhaustive analysis, multiple solution paths, edge case handling, and expert-level depth on every topic.",
  ultracode: "You are operating in ULTRACODE mode — xhigh intelligence with autonomous workflow orchestration. You will: 1) Plan the complete solution before executing, 2) Break complex tasks into sub-workflows, 3) Execute each workflow step autonomously, 4) Synthesize all results into a final comprehensive output. Think like a senior engineer with unlimited compute. No shortcuts, no placeholders, maximum depth on every task.",
};

type LogLine =
  | { kind: "cmd"; text: string }
  | { kind: "bullet"; text: string; done?: boolean }
  | { kind: "stream"; text: string }
  | { kind: "workflow"; text: string }
  | { kind: "error"; text: string }
  | { kind: "sep" };

const SESSION_STARTERS = [
  "Analyze the current codebase architecture and suggest improvements",
  "Generate a complete penetration testing report template",
  "Write an autonomous agent that can browse the web and extract data",
  "Create a full-stack application with authentication and database",
  "Design a distributed system for real-time data processing",
  "Build a complete CI/CD pipeline configuration",
];

function getVersionLine(mode: UltraMode) {
  if (mode === "ultracode") return "Claude Code v2.1.112  ·  Opus 4.8 (1M context)  ·  Max  ·  Fast";
  if (mode === "max")       return "Claude Code v2.1.112  ·  Opus 4.7 (1M context)  ·  Max  ·  Fast";
  if (mode === "xhigh")     return "Claude Code v2.1.0   ·  Sonnet 4.5 (200k)  ·  High";
  if (mode === "high")      return "Claude Code v2.0.1   ·  Haiku 3.5 (200k)  ·  Standard";
  return "Claude Code v2.0.0   ·  Haiku 3.0 (100k)  ·  Medium";
}

export function ClaudeCodeModal({ open, onOpenChange }: ClaudeCodeModalProps) {
  const [mode, setMode] = useState<UltraMode>("xhigh");
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamBufRef = useRef("");

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines]);

  useEffect(() => {
    if (open) {
      setLines([
        { kind: "bullet", text: `Initializing Claude Code ${mode === "ultracode" ? "ULTRACODE" : "v2.1.112"}...`, done: true },
        { kind: "bullet", text: `Mode set to: ${MODES.find(m => m.id === mode)?.effort ?? mode}`, done: true },
        { kind: "sep" },
      ]);
      setSessionCount(0);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLines(prev => {
      const clean = prev.filter(l => l.kind === "sep" || (l.kind === "bullet" && l.text.startsWith("Mode set")));
      return [
        { kind: "bullet", text: `Initializing...`, done: true },
        { kind: "bullet", text: `Mode set to: ${MODES.find(m => m.id === mode)?.effort ?? mode}`, done: true },
        ...(mode === "ultracode" ? [{ kind: "bullet" as const, text: "Dynamic workflow orchestration: ENABLED", done: true }] : []),
        { kind: "sep" },
      ];
    });
  }, [mode]);

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
    setLines(prev => [...prev, { kind: "bullet", text: "Interrupted by user.", done: true }]);
  }

  const addLine = useCallback((line: LogLine) => {
    setLines(prev => [...prev, line]);
  }, []);

  async function execute() {
    const task = input.trim();
    if (!task || running) return;
    setInput("");
    setRunning(true);
    streamBufRef.current = "";
    setSessionCount(c => c + 1);

    addLine({ kind: "cmd", text: `$ ${task}` });

    if (mode === "ultracode") {
      addLine({ kind: "workflow", text: "Initializing autonomous workflow orchestration..." });
      await sleep(320);
      addLine({ kind: "bullet", text: "Read 2 files" });
      await sleep(220);
      addLine({ kind: "bullet", text: "Let me initialize the autonomous GSD workflow." });
      await sleep(280);
      addLine({ kind: "bullet", text: "Ran 2 bash commands" });
      await sleep(200);
      addLine({ kind: "bullet", text: "Let me check STATE.md and the current project context" });
      await sleep(350);
      addLine({ kind: "bullet", text: "Read 1 file, listed 2 directories" });
      await sleep(180);
    } else if (mode === "max" || mode === "xhigh") {
      addLine({ kind: "bullet", text: "Analyzing task requirements..." });
      await sleep(300);
      addLine({ kind: "bullet", text: "Planning solution approach..." });
      await sleep(250);
    } else {
      addLine({ kind: "bullet", text: "Processing..." });
      await sleep(200);
    }

    const systemPrompt = MODE_SYSTEM_PROMPTS[mode];

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let streamStarted = false;

    try {
      await streamChat(
        {
          messages: [{ role: "user", content: task }],
          model: "CHAT-GPT Fast",
          persona: "Default",
          customSystemPrompt: systemPrompt,
          customInstructions: "",
          memory: [],
          language: "en",
        },
        (chunk) => {
          streamBufRef.current += chunk;
          if (!streamStarted) {
            streamStarted = true;
            setLines(prev => [...prev, { kind: "stream", text: "" }]);
          }
          setLines(prev => {
            const arr = [...prev];
            for (let i = arr.length - 1; i >= 0; i--) {
              if (arr[i].kind === "stream") {
                arr[i] = { kind: "stream", text: streamBufRef.current };
                break;
              }
            }
            return arr;
          });
        },
        ctrl.signal,
      );

      if (mode === "ultracode") {
        await sleep(180);
        addLine({ kind: "workflow", text: "Workflow complete. All sub-tasks synthesized." });
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        addLine({ kind: "error", text: `Error: ${(e as Error)?.message ?? "Unknown error"}` });
      }
    } finally {
      setRunning(false);
      addLine({ kind: "sep" });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") { onOpenChange(false); return; }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      execute();
    }
  }

  const currentMode = MODES.find(m => m.id === mode)!;
  const modeIdx = MODES.findIndex(m => m.id === mode);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-0"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "#0c0c10",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 80px rgba(124,58,237,0.2), 0 30px 60px rgba(0,0,0,0.9)",
            }}
          >
            {/* ── Title bar (macOS style) ── */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0 select-none"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "#121218" }}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-3 h-3 rounded-full transition-opacity"
                  style={{ background: "#ff5f57" }}
                />
                <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
              </div>
              <div className="flex items-center gap-2 mx-auto">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                  style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)" }}
                >
                  <span style={{ color: "#a78bfa" }}>AI</span>
                </div>
                <span className="text-[11px] font-mono" style={{ color: "#888" }}>
                  {getVersionLine(mode)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: mode === "ultracode" ? "rgba(124,58,237,0.25)" : "rgba(139,92,246,0.1)",
                    color: currentMode.color,
                    border: `1px solid ${currentMode.color}40`,
                  }}
                >
                  {mode.toUpperCase()}
                </span>
                <button onClick={() => onOpenChange(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Path bar ── */}
            <div
              className="flex items-center gap-2 px-4 py-1.5 border-b shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.04)", background: "#0e0e14" }}
            >
              <Terminal className="w-3 h-3" style={{ color: "#555" }} />
              <span className="text-[10px] font-mono" style={{ color: "#444" }}>
                ~/Coding/KaliGPT
              </span>
              <span className="text-[10px] font-mono" style={{ color: "#333" }}>·</span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "rgba(139,92,246,0.08)", color: "#6d28d9", border: "1px solid rgba(109,40,217,0.2)" }}
              >
                {mode === "ultracode" ? "bypass permissions on (shift+tab to cycle)" : `effort: ${mode}`}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[9px] font-mono" style={{ color: "#333" }}>
                  {sessionCount} cmd{sessionCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* ── Terminal output ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed min-h-0"
              style={{ background: "#0c0c10", color: "#c8c8d0" }}
            >
              <AnimatePresence initial={false}>
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.12 }}
                  >
                    {line.kind === "sep" && (
                      <div className="my-2 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
                    )}
                    {line.kind === "cmd" && (
                      <div className="flex items-start gap-2 mt-2 mb-1">
                        <span style={{ color: "#6d28d9" }}>&gt;</span>
                        <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{line.text.replace("$ ", "")}</span>
                      </div>
                    )}
                    {line.kind === "bullet" && (
                      <div className="flex items-start gap-2 py-0.5 pl-2">
                        <span style={{ color: "#4ade80", marginTop: "1px" }}>•</span>
                        <span style={{ color: "#9ca3af" }}>{line.text}</span>
                      </div>
                    )}
                    {line.kind === "workflow" && (
                      <div
                        className="flex items-center gap-2 px-2 py-1 rounded my-1"
                        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}
                      >
                        <Zap className="w-3 h-3 flex-shrink-0" style={{ color: "#7c3aed" }} />
                        <span style={{ color: "#a78bfa" }}>{line.text}</span>
                      </div>
                    )}
                    {line.kind === "stream" && (
                      <div
                        className="pl-4 py-2 mt-1 rounded"
                        style={{
                          color: "#d1d5db",
                          borderLeft: "2px solid rgba(139,92,246,0.3)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {line.text}
                        {running && i === lines.length - 1 && (
                          <span
                            className="inline-block w-1.5 h-3.5 rounded-sm ml-0.5 animate-pulse align-middle"
                            style={{ background: "#7c3aed" }}
                          />
                        )}
                      </div>
                    )}
                    {line.kind === "error" && (
                      <div className="flex items-center gap-2 py-1 pl-2" style={{ color: "#f87171" }}>
                        <span>!</span>
                        <span>{line.text}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div
              className="px-4 py-2 border-t shrink-0"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0e0e14" }}
            >
              <div className="flex items-end gap-2">
                <ChevronRight className="w-4 h-4 mb-2 flex-shrink-0" style={{ color: "#4ade80" }} />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={
                    running
                      ? "Running... (Esc to cancel)"
                      : mode === "ultracode"
                      ? "Enter task for autonomous ultracode execution..."
                      : `Ask Claude Code [${mode}]... (Enter to run)`
                  }
                  disabled={running}
                  className="flex-1 bg-transparent text-[12px] font-mono outline-none resize-none placeholder:text-gray-700 text-gray-200"
                  style={{ lineHeight: "1.5" }}
                />
                <div className="flex items-center gap-2 mb-1.5 flex-shrink-0">
                  {running ? (
                    <button
                      onClick={stop}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold transition-all"
                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}
                    >
                      <Square className="w-3 h-3 fill-current" />
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={execute}
                      disabled={!input.trim()}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-30"
                      style={{
                        background: mode === "ultracode" ? "rgba(124,58,237,0.2)" : "rgba(139,92,246,0.12)",
                        border: `1px solid ${currentMode.color}40`,
                        color: currentMode.color,
                      }}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Run
                    </button>
                  )}
                  <button
                    onClick={() => { setLines([]); setSessionCount(0); }}
                    className="p-1 rounded transition-colors text-gray-700 hover:text-gray-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-0.5 pl-6">
                {SESSION_STARTERS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-[9px] font-mono text-gray-700 hover:text-gray-500 transition-colors truncate max-w-[120px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Ultracode Mode Slider Bar ── */}
            <div
              className="shrink-0 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e1030 0%, #150d2a 40%, #1a0a3d 70%, #0f0720 100%)",
                borderTop: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 100% at ${(modeIdx / (MODES.length - 1)) * 100}% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)`,
                  transition: "background 0.4s ease",
                }}
              />

              <div className="relative px-6 py-3">
                {/* "Smarter" label above ultracode */}
                <div
                  className="absolute top-1.5 right-8 flex flex-col items-center"
                  style={{ transition: "opacity 0.3s" }}
                >
                  <span className="text-[9px] font-mono" style={{ color: "#7c3aed" }}>Smarter</span>
                  <div className="w-px h-2" style={{ background: "rgba(124,58,237,0.5)" }} />
                </div>

                {/* Slider track */}
                <div className="flex items-center gap-0 mt-1.5">
                  {MODES.map((m, idx) => {
                    const isActive = m.id === mode;
                    const isPast = idx <= modeIdx;
                    const isUltra = m.id === "ultracode";
                    return (
                      <div key={m.id} className="flex items-center flex-1">
                        <button
                          onClick={() => !running && setMode(m.id)}
                          className="flex flex-col items-center gap-1 group relative w-full"
                          disabled={running}
                        >
                          {/* Track line before dot */}
                          {idx > 0 && (
                            <div
                              className="absolute top-[5px] left-0 w-1/2 h-0.5 -translate-x-full"
                              style={{
                                background: isPast ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)",
                                transition: "background 0.3s",
                              }}
                            />
                          )}
                          {idx < MODES.length - 1 && (
                            <div
                              className="absolute top-[5px] right-0 w-1/2 h-0.5 translate-x-full"
                              style={{
                                background: idx < modeIdx ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)",
                                transition: "background 0.3s",
                              }}
                            />
                          )}

                          {/* Dot */}
                          <div
                            className="relative z-10 rounded-full transition-all duration-300"
                            style={{
                              width: isActive ? 12 : 7,
                              height: isActive ? 12 : 7,
                              background: isActive
                                ? (isUltra ? "#7c3aed" : "#a855f7")
                                : isPast
                                ? "rgba(139,92,246,0.5)"
                                : "rgba(255,255,255,0.12)",
                              boxShadow: isActive
                                ? `0 0 12px ${isUltra ? "#7c3aed" : "#a855f7"}, 0 0 24px ${isUltra ? "rgba(124,58,237,0.5)" : "rgba(168,85,247,0.4)"}`
                                : undefined,
                            }}
                          />

                          {/* Label */}
                          <span
                            className="text-[9px] font-mono font-bold transition-colors duration-200 mt-0.5"
                            style={{ color: isActive ? currentMode.color : "#4a4060" }}
                          >
                            {m.label}
                          </span>
                          {m.sub && (
                            <span className="text-[8px] font-mono" style={{ color: isActive ? "#6d28d9" : "#332848" }}>
                              {m.sub}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Status line */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-mono" style={{ color: "#4a3870" }}>
                    {running ? (
                      <span className="animate-pulse" style={{ color: "#7c3aed" }}>
                        Executing {mode === "ultracode" ? "ultracode workflow" : mode} mode...
                      </span>
                    ) : (
                      <span>{currentMode.effort}</span>
                    )}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: "#3d2d5e" }}>
                    Esc to cancel  ·  Enter to run  ·  Shift+Enter for newline
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
