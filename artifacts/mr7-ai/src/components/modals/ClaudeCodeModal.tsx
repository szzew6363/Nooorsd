import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Terminal, Play, Square, RotateCcw, ChevronRight, Zap,
  Plus, Trash2, Key, Eye, EyeOff, FileText, FolderOpen,
  Copy, CheckCheck, ChevronDown, ChevronUp, Brain,
  Settings, AlertCircle, Upload, Download,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClaudeCodeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type UltraMode = "medium" | "high" | "xhigh" | "max" | "ultracode";

interface CCMessage {
  role: "user" | "assistant";
  content: string;
}

interface VirtualFile {
  name: string;
  content: string;
  updatedAt: number;
}

interface Session {
  id: string;
  name: string;
  mode: UltraMode;
  messages: CCMessage[];
  files: VirtualFile[];
  tokensIn: number;
  tokensOut: number;
  createdAt: number;
}

type LogBlock =
  | { kind: "user"; text: string }
  | { kind: "tool"; tool: string; arg: string; id: number }
  | { kind: "thinking"; text: string; expanded: boolean; id: number }
  | { kind: "text"; text: string; id: number; streaming?: boolean }
  | { kind: "workflow"; text: string; id: number }
  | { kind: "error"; text: string; id: number }
  | { kind: "sep" };

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY_APIKEY    = "cc-anthropic-key-v2";
const LS_KEY_SESSIONS  = "cc-sessions-v2";

const MODES: { id: UltraMode; label: string; sub?: string; model: string; color: string }[] = [
  { id: "medium",    label: "medium",    model: "claude-3-5-haiku-20241022",   color: "#6b7280" },
  { id: "high",      label: "high",      model: "claude-3-5-sonnet-20241022",  color: "#9ca3af" },
  { id: "xhigh",     label: "xhigh",     model: "claude-3-7-sonnet-20250219",  color: "#c084fc" },
  { id: "max",       label: "max",       model: "claude-opus-4-5",             color: "#a855f7" },
  { id: "ultracode", label: "ultracode", sub: "xhigh + workflows", model: "claude-opus-4-5", color: "#7c3aed" },
];

const QUICK_PROMPTS = [
  "Review this code for bugs and security issues",
  "Write unit tests for the selected code",
  "Explain this architecture step by step",
  "Refactor for readability and performance",
  "Generate a README for this project",
  "Debug this error and suggest a fix",
];

const TOOL_ICONS: Record<string, string> = {
  "Read file":   "📂",
  "Write file":  "✏️",
  "Bash":        "⚡",
  "Search":      "🔍",
  "Thinking":    "🧠",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(name: string, mode: UltraMode = "xhigh"): Session {
  return {
    id: Math.random().toString(36).slice(2),
    name,
    mode,
    messages: [],
    files: [],
    tokensIn: 0,
    tokensOut: 0,
    createdAt: Date.now(),
  };
}

function saveSessionsToLS(sessions: Session[]) {
  try { localStorage.setItem(LS_KEY_SESSIONS, JSON.stringify(sessions)); } catch {}
}

function loadSessionsFromLS(): Session[] {
  try {
    const raw = localStorage.getItem(LS_KEY_SESSIONS);
    if (raw) return JSON.parse(raw) as Session[];
  } catch {}
  return [makeSession("main")];
}

function estimateCost(tokensIn: number, tokensOut: number, mode: UltraMode): string {
  const inRate  = mode === "medium" ? 0.0008 : mode === "high" ? 0.003 : mode === "xhigh" ? 0.003 : 0.015;
  const outRate = mode === "medium" ? 0.0004 : mode === "high" ? 0.015 : mode === "xhigh" ? 0.015 : 0.075;
  const cost = (tokensIn / 1000) * inRate + (tokensOut / 1000) * outRate;
  return cost < 0.001 ? "<$0.001" : `$${cost.toFixed(4)}`;
}

function detectTools(text: string): Array<{ tool: string; arg: string }> {
  const tools: Array<{ tool: string; arg: string }> = [];
  const patterns = [
    /^Read file:\s*(.+)/m,
    /^Write file:\s*(.+)/m,
    /^Bash:\s*(.+)/m,
    /^Search:\s*(.+)/m,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const label = p.source.replace(/\^/, "").replace(/:\\s\*.+\/m/, "").replace("\\s*(.+)", "").replace(/\\/g, "");
      tools.push({ tool: label.replace(/:/g, ""), arg: m[1].trim() });
    }
  }
  return tools;
}

// ─── API Key Setup ────────────────────────────────────────────────────────────

function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [testing, setTesting] = useState(false);

  async function handleSave() {
    const k = key.trim();
    if (!k.startsWith("sk-ant")) {
      setErr("المفتاح يجب أن يبدأ بـ sk-ant-");
      return;
    }
    setTesting(true);
    setErr("");
    try {
      const r = await fetch("/api/claude-code/models", {
        method: "POST",
        headers: { "x-anthropic-key": k, "content-type": "application/json" },
        body: "{}",
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({ error: "مفتاح غير صالح" }));
        setErr(d.error ?? "مفتاح غير صالح");
        setTesting(false);
        return;
      }
      localStorage.setItem(LS_KEY_APIKEY, k);
      onSave(k);
    } catch {
      setErr("تعذر الاتصال بالخادم");
    }
    setTesting(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6" style={{ background: "#0c0c10" }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "#121218", borderColor: "rgba(124,58,237,0.3)" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)" }}
            >
              <Key className="w-5 h-5" style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Anthropic API Key</div>
              <div className="text-[10px] font-mono" style={{ color: "#555" }}>
                console.anthropic.com/settings/keys
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3"
            style={{ background: "#0e0e14", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              placeholder="sk-ant-api03-..."
              className="flex-1 bg-transparent text-[12px] font-mono text-gray-200 outline-none placeholder:text-gray-700"
              autoFocus
            />
            <button onClick={() => setShow(!show)} className="text-gray-600 hover:text-gray-400 transition-colors">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {err && (
            <div className="flex items-center gap-1.5 mb-3 text-[11px]" style={{ color: "#f87171" }}>
              <AlertCircle className="w-3.5 h-3.5" />
              {err}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!key.trim() || testing}
            className="w-full py-2.5 rounded-xl text-[12px] font-bold transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(139,92,246,0.2))",
              border: "1px solid rgba(124,58,237,0.5)",
              color: "#c4b5fd",
            }}
          >
            {testing ? "جاري التحقق..." : "حفظ وتشغيل Claude Code"}
          </button>

          <div className="mt-4 space-y-1.5">
            {[
              "المفتاح يُحفظ محلياً في المتصفح فقط",
              "يدعم claude-opus-4-5 / claude-3-7-sonnet",
              "Ultracode mode يستخدم Extended Thinking",
            ].map(t => (
              <div key={t} className="flex items-center gap-2 text-[10px]" style={{ color: "#4a4060" }}>
                <div className="w-1 h-1 rounded-full" style={{ background: "#6d28d9" }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── File Manager ─────────────────────────────────────────────────────────────

function FilePanel({
  files,
  onAdd,
  onRemove,
}: {
  files: VirtualFile[];
  onAdd: (f: VirtualFile) => void;
  onRemove: (name: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    const el = document.createElement("input");
    el.type = "file";
    el.accept = ".ts,.tsx,.js,.jsx,.py,.rs,.go,.java,.cpp,.c,.h,.json,.yaml,.yml,.toml,.md,.txt,.sh,.sql,.html,.css";
    el.onchange = async () => {
      const file = el.files?.[0];
      if (!file) return;
      const content = await file.text();
      onAdd({ name: file.name, content, updatedAt: Date.now() });
    };
    el.click();
  }

  return (
    <div
      className="border-b shrink-0"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0e0e14" }}
    >
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="w-3 h-3" style={{ color: "#555" }} />
          <span className="text-[9px] font-mono font-bold" style={{ color: "#444" }}>WORKSPACE FILES</span>
          {files.length > 0 && (
            <span
              className="text-[8px] px-1 rounded font-mono"
              style={{ background: "rgba(124,58,237,0.15)", color: "#7c3aed" }}
            >
              {files.length}
            </span>
          )}
        </div>
        <button
          onClick={pickFile}
          className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors"
          style={{ color: "#555", border: "1px solid rgba(255,255,255,0.06)" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
        >
          <Upload className="w-2.5 h-2.5" />
          رفع ملف
        </button>
      </div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
          {files.map(f => (
            <div
              key={f.name}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono group"
              style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}
            >
              <FileText className="w-2.5 h-2.5" />
              {f.name}
              <button
                onClick={() => onRemove(f.name)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Log Block renderer ───────────────────────────────────────────────────────

function LogBlockView({
  block,
  onToggleThinking,
}: {
  block: LogBlock;
  onToggleThinking: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (block.kind === "sep") {
    return <div className="my-2 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />;
  }

  if (block.kind === "user") {
    return (
      <div className="flex items-start gap-2 mt-3 mb-1">
        <span style={{ color: "#4ade80", fontSize: 11 }}>❯</span>
        <span className="text-[12px] font-mono" style={{ color: "#e2e8f0", fontWeight: 600 }}>
          {block.text}
        </span>
      </div>
    );
  }

  if (block.kind === "tool") {
    const icon = TOOL_ICONS[block.tool] ?? "🔧";
    return (
      <div
        className="flex items-center gap-2 my-0.5 pl-2 py-0.5 rounded text-[10px] font-mono"
        style={{ color: "#9ca3af" }}
      >
        <span>{icon}</span>
        <span style={{ color: "#6d28d9" }}>{block.tool}:</span>
        <span style={{ color: "#7c3aed", opacity: 0.8 }} className="truncate">{block.arg}</span>
      </div>
    );
  }

  if (block.kind === "workflow") {
    return (
      <div
        className="flex items-center gap-2 px-2 py-1 rounded my-1 text-[10px] font-mono"
        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        <Zap className="w-3 h-3 flex-shrink-0" style={{ color: "#7c3aed" }} />
        <span style={{ color: "#a78bfa" }}>{block.text}</span>
      </div>
    );
  }

  if (block.kind === "thinking") {
    return (
      <div
        className="my-1 rounded overflow-hidden"
        style={{ border: "1px solid rgba(168,85,247,0.2)", background: "rgba(139,92,246,0.04)" }}
      >
        <button
          onClick={() => onToggleThinking(block.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-[9px] font-mono"
          style={{ color: "#7c3aed" }}
        >
          <Brain className="w-3 h-3" />
          <span>Extended Thinking</span>
          <span className="ml-auto" style={{ color: "#4a3870" }}>
            {block.expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </button>
        {block.expanded && (
          <div
            className="px-3 pb-2 text-[10px] font-mono leading-relaxed"
            style={{ color: "#6b5f9a", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {block.text}
          </div>
        )}
      </div>
    );
  }

  if (block.kind === "error") {
    return (
      <div
        className="flex items-start gap-2 my-1 px-2 py-1.5 rounded text-[11px] font-mono"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
      >
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{block.text}</span>
      </div>
    );
  }

  if (block.kind === "text") {
    return (
      <div className="relative group my-1">
        <div
          className="pl-3 py-1.5 text-[12px] font-mono leading-relaxed"
          style={{
            color: "#d1d5db",
            borderLeft: "2px solid rgba(124,58,237,0.3)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {block.text}
          {block.streaming && (
            <span
              className="inline-block w-1.5 h-3.5 ml-0.5 align-middle animate-pulse rounded-sm"
              style={{ background: "#7c3aed" }}
            />
          )}
        </div>
        {!block.streaming && block.text && (
          <button
            onClick={() => copy(block.text)}
            className="absolute top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
            style={{ color: "#555" }}
          >
            {copied ? <CheckCheck className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  }

  return null;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function ClaudeCodeModal({ open, onOpenChange }: ClaudeCodeModalProps) {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(LS_KEY_APIKEY) ?? "");
  const [sessions, setSessions] = useState<Session[]>(() => loadSessionsFromLS());
  const [activeId, setActiveId] = useState<string>(() => {
    const ss = loadSessionsFromLS();
    return ss[0]?.id ?? "";
  });
  const [logs, setLogs] = useState<LogBlock[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [blockId, setBlockId] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textBufRef = useRef("");
  const thinkBufRef = useRef("");
  const streamBlockRef = useRef<number>(-1);
  const thinkBlockRef = useRef<number>(-1);

  const activeSession = sessions.find(s => s.id === activeId) ?? sessions[0];
  const modeIdx = MODES.findIndex(m => m.id === (activeSession?.mode ?? "xhigh"));
  const currentMode = MODES[modeIdx] ?? MODES[2];

  // Persist sessions
  useEffect(() => { saveSessionsToLS(sessions); }, [sessions]);

  // Auto-scroll
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // On open
  useEffect(() => {
    if (open) {
      if (!activeId && sessions[0]) setActiveId(sessions[0].id);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Rebuild logs from active session messages when switching sessions
  useEffect(() => {
    if (!activeSession) return;
    const rebuilt: LogBlock[] = [];
    for (const msg of activeSession.messages) {
      if (msg.role === "user") {
        rebuilt.push({ kind: "user", text: msg.content });
      } else {
        rebuilt.push({ kind: "text", text: msg.content, id: Math.random() });
      }
      rebuilt.push({ kind: "sep" });
    }
    setLogs(rebuilt);
    textBufRef.current = "";
    thinkBufRef.current = "";
    streamBlockRef.current = -1;
    thinkBlockRef.current = -1;
  }, [activeId]);

  // ── Session helpers ───────────────────────────────────────────────────────

  function updateSession(id: string, patch: Partial<Session>) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function newSession() {
    const s = makeSession(`session-${sessions.length + 1}`, activeSession?.mode ?? "xhigh");
    setSessions(prev => [...prev, s]);
    setActiveId(s.id);
    setLogs([]);
  }

  function closeSession(id: string) {
    if (sessions.length <= 1) return;
    const next = sessions.find(s => s.id !== id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (id === activeId && next) setActiveId(next.id);
  }

  function setMode(mode: UltraMode) {
    if (!running) updateSession(activeId, { mode });
  }

  function addFile(f: VirtualFile) {
    const files = [...(activeSession?.files ?? []).filter(x => x.name !== f.name), f];
    updateSession(activeId, { files });
  }

  function removeFile(name: string) {
    updateSession(activeId, { files: (activeSession?.files ?? []).filter(f => f.name !== name) });
  }

  // ── Thinking block toggle ─────────────────────────────────────────────────

  const toggleThinking = useCallback((id: number) => {
    setLogs(prev => prev.map(b =>
      b.kind === "thinking" && b.id === id ? { ...b, expanded: !b.expanded } : b
    ));
  }, []);

  // ── Stop ──────────────────────────────────────────────────────────────────

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
    setLogs(prev => {
      const arr = [...prev];
      // Finalize streaming text block
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].kind === "text" && (arr[i] as { streaming?: boolean }).streaming) {
          (arr[i] as { streaming?: boolean }).streaming = false;
          break;
        }
      }
      return [...arr, { kind: "sep" }];
    });
  }

  // ── Execute ───────────────────────────────────────────────────────────────

  async function execute() {
    const task = input.trim();
    if (!task || running || !activeSession) return;
    if (!apiKey) return;

    setInput("");
    setRunning(true);
    textBufRef.current = "";
    thinkBufRef.current = "";

    const userMsg: CCMessage = { role: "user", content: task };
    const updatedMessages = [...activeSession.messages, userMsg];
    updateSession(activeId, { messages: updatedMessages });

    const newId = () => { setBlockId(n => n + 1); return blockId + 1; };

    setLogs(prev => [
      ...prev,
      { kind: "user", text: task },
    ]);

    // Show workflow init for ultracode
    if (currentMode.id === "ultracode") {
      const wfId = newId();
      setLogs(prev => [...prev, { kind: "workflow", text: "Initializing autonomous workflow orchestration...", id: wfId }]);
      await sleep(300);
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Build messages for API (convert to Anthropic format)
    const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));

    let assistantText = "";
    let currentTextId = -1;
    let currentThinkId = -1;
    let inThinking = false;
    let inText = false;
    let tokensIn = 0;
    let tokensOut = 0;

    try {
      const res = await fetch("/api/claude-code/stream", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-anthropic-key": apiKey,
        },
        body: JSON.stringify({
          messages: apiMessages,
          mode: currentMode.id,
          files: activeSession.files,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({ error: "خطأ في الاتصال" }));
        const errId = newId();
        setLogs(prev => [...prev, { kind: "error", text: d.error ?? "خطأ في الخادم", id: errId }, { kind: "sep" }]);
        setRunning(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setRunning(false); return; }

      const decoder = new TextDecoder();
      let buf = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          let evt: Record<string, unknown>;
          try { evt = JSON.parse(raw); } catch { continue; }

          const type = evt.type as string;

          if (type === "error") {
            const errId = newId();
            setLogs(prev => [...prev, { kind: "error", text: String((evt as { error?: unknown }).error ?? "خطأ غير معروف"), id: errId }]);
            break;
          }

          if (type === "message_start") {
            const usage = (evt as { message?: { usage?: { input_tokens?: number } } }).message?.usage;
            if (usage?.input_tokens) tokensIn = usage.input_tokens;
          }

          if (type === "message_delta") {
            const usage = (evt as { usage?: { output_tokens?: number } }).usage;
            if (usage?.output_tokens) tokensOut = usage.output_tokens;
          }

          if (type === "content_block_start") {
            const cb = (evt as { content_block?: { type?: string } }).content_block;
            if (cb?.type === "thinking") {
              inThinking = true;
              inText = false;
              const thId = newId();
              currentThinkId = thId;
              thinkBufRef.current = "";
              setLogs(prev => [...prev, { kind: "thinking", text: "", expanded: false, id: thId }]);
            } else if (cb?.type === "text") {
              inText = true;
              inThinking = false;
              const txId = newId();
              currentTextId = txId;
              textBufRef.current = "";
              setLogs(prev => [...prev, { kind: "text", text: "", id: txId, streaming: true }]);
            }
          }

          if (type === "content_block_delta") {
            const delta = (evt as { delta?: { type?: string; thinking?: string; text?: string } }).delta;
            if (delta?.type === "thinking_delta" && delta.thinking && inThinking) {
              thinkBufRef.current += delta.thinking;
              const tId = currentThinkId;
              setLogs(prev => prev.map(b =>
                b.kind === "thinking" && b.id === tId
                  ? { ...b, text: thinkBufRef.current }
                  : b
              ));
            }
            if (delta?.type === "text_delta" && delta.text && inText) {
              const chunk = delta.text;
              textBufRef.current += chunk;
              assistantText += chunk;

              // Detect tool calls inline
              const tools = detectTools(chunk);
              const txId = currentTextId;
              for (const t of tools) {
                const toolId = newId();
                setLogs(prev => {
                  const arr = [...prev];
                  const idx = arr.findIndex(b => b.kind === "text" && (b as { id: number }).id === txId);
                  if (idx >= 0) {
                    arr.splice(idx, 0, { kind: "tool", tool: t.tool, arg: t.arg, id: toolId });
                  }
                  return arr;
                });
              }

              setLogs(prev => prev.map(b =>
                b.kind === "text" && (b as { id: number }).id === txId
                  ? { ...b, text: textBufRef.current, streaming: true }
                  : b
              ));
            }
          }

          if (type === "content_block_stop") {
            if (inText && currentTextId >= 0) {
              const txId = currentTextId;
              setLogs(prev => prev.map(b =>
                b.kind === "text" && (b as { id: number }).id === txId
                  ? { ...b, streaming: false }
                  : b
              ));
              inText = false;
            }
            if (inThinking) inThinking = false;
          }

          if (type === "message_stop") {
            break;
          }
        }
      }

      // Save assistant message
      const assistantMsg: CCMessage = { role: "assistant", content: assistantText };
      updateSession(activeId, {
        messages: [...updatedMessages, assistantMsg],
        tokensIn: (activeSession.tokensIn ?? 0) + tokensIn,
        tokensOut: (activeSession.tokensOut ?? 0) + tokensOut,
      });

      if (currentMode.id === "ultracode") {
        const wfDoneId = newId();
        setLogs(prev => [...prev, { kind: "workflow", text: "Workflow complete. All sub-tasks synthesized.", id: wfDoneId }]);
      }

      setLogs(prev => [...prev, { kind: "sep" }]);
    } catch (e: unknown) {
      if ((e as { name?: string })?.name !== "AbortError") {
        const errId = newId();
        setLogs(prev => [
          ...prev,
          { kind: "error", text: (e as Error)?.message ?? "خطأ غير معروف", id: errId },
          { kind: "sep" },
        ]);
      }
    } finally {
      setRunning(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") { stop(); return; }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); execute(); }
  }

  // ── Commands ──────────────────────────────────────────────────────────────

  function handleCommand(cmd: string) {
    const c = cmd.trim().toLowerCase();
    if (c === "/clear") {
      setLogs([]);
      updateSession(activeId, { messages: [] });
      setInput("");
    } else if (c === "/new") {
      newSession();
      setInput("");
    } else if (c === "/key") {
      setShowSettings(true);
      setInput("");
    } else if (c.startsWith("/model ")) {
      const m = c.replace("/model ", "").trim() as UltraMode;
      if (MODES.find(x => x.id === m)) { setMode(m); setInput(""); }
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!open) return null;

  if (!apiKey) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              className="w-full max-w-lg flex flex-col rounded-xl overflow-hidden"
              style={{ background: "#0c0c10", border: "1px solid rgba(124,58,237,0.3)", maxHeight: "90vh" }}
            >
              {/* Title bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#121218" }}>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => onOpenChange(false)} className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
                </div>
                <span className="text-[11px] font-mono" style={{ color: "#555" }}>Claude Code — API Key Setup</span>
                <button onClick={() => onOpenChange(false)} className="text-gray-700 hover:text-gray-400"><X className="w-3.5 h-3.5" /></button>
              </div>
              <ApiKeySetup onSave={k => { setApiKey(k); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
          onClick={e => { if (e.target === e.currentTarget) onOpenChange(false); }}
        >
          <motion.div
            initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-4xl flex flex-col rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "#0c0c10",
              border: "1px solid rgba(124,58,237,0.25)",
              boxShadow: "0 0 80px rgba(124,58,237,0.2), 0 30px 60px rgba(0,0,0,0.9)",
              height: "min(90vh, 780px)",
            }}
          >
            {/* ── Title bar ── */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0 select-none"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "#121218" }}
            >
              <div className="flex items-center gap-1.5">
                <button onClick={() => onOpenChange(false)} className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
              </div>

              <div className="flex items-center gap-2 mx-auto">
                <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", color: "#a78bfa" }}>AI</div>
                <span className="text-[11px] font-mono" style={{ color: "#666" }}>
                  Claude Code v2.1 · {currentMode.model} · {currentMode.id.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowFiles(!showFiles)}
                  className="p-1 rounded transition-colors"
                  style={{ color: showFiles ? "#7c3aed" : "#444" }}
                  title="Workspace Files"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 rounded transition-colors"
                  style={{ color: showSettings ? "#7c3aed" : "#444" }}
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onOpenChange(false)} className="p-1 text-gray-700 hover:text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Settings panel ── */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  className="overflow-hidden"
                  style={{ borderBottom: "1px solid rgba(124,58,237,0.15)", background: "#0e0e14" }}
                >
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold" style={{ color: "#555" }}>API KEY</span>
                    <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: "#121218", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <input
                        type={showKey ? "text" : "password"}
                        value={newKeyInput || apiKey}
                        onChange={e => setNewKeyInput(e.target.value)}
                        className="flex-1 bg-transparent text-[11px] font-mono text-gray-400 outline-none"
                        placeholder="sk-ant-..."
                      />
                      <button onClick={() => setShowKey(!showKey)} className="text-gray-600 hover:text-gray-400">
                        {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const k = newKeyInput.trim();
                        if (k.startsWith("sk-ant")) {
                          localStorage.setItem(LS_KEY_APIKEY, k);
                          setApiKey(k);
                          setNewKeyInput("");
                          setShowSettings(false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold"
                      style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa" }}
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem(LS_KEY_APIKEY);
                        setApiKey("");
                      }}
                      className="px-2 py-1.5 rounded-lg text-[10px]"
                      style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <span className="text-[9px] font-mono ml-2" style={{ color: "#333" }}>
                      {activeSession ? estimateCost(activeSession.tokensIn, activeSession.tokensOut, activeSession.mode) : "$0"}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Session tabs ── */}
            <div
              className="flex items-center gap-0 px-2 pt-1.5 shrink-0 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0e0e14" }}
            >
              <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1 group shrink-0"
                    style={{
                      borderBottom: s.id === activeId ? `2px solid ${currentMode.color}` : "2px solid transparent",
                      paddingBottom: 2,
                    }}
                  >
                    <button
                      onClick={() => setActiveId(s.id)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-t text-[10px] font-mono transition-colors"
                      style={{ color: s.id === activeId ? currentMode.color : "#444" }}
                    >
                      <Terminal className="w-2.5 h-2.5" />
                      {s.name}
                      <span className="text-[8px] ml-0.5 opacity-60">{MODES.find(m => m.id === s.mode)?.label ?? s.mode}</span>
                    </button>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => closeSession(s.id)}
                        className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-red-500"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={newSession}
                className="p-1.5 shrink-0 transition-colors text-gray-700 hover:text-gray-400"
                title="New session (Ctrl+T)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Path / session info bar ── */}
            <div
              className="flex items-center gap-2 px-4 py-1 shrink-0"
              style={{ background: "#0e0e14", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <Terminal className="w-3 h-3" style={{ color: "#333" }} />
              <span className="text-[9px] font-mono" style={{ color: "#333" }}>~/Coding/KaliGPT</span>
              <span style={{ color: "#222" }}>·</span>
              <span
                className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "rgba(124,58,237,0.08)", color: "#5b21b6", border: "1px solid rgba(109,40,217,0.15)" }}
              >
                {currentMode.id === "ultracode" ? "bypass permissions on" : `effort: ${currentMode.id}`}
              </span>
              <div className="ml-auto flex items-center gap-2 text-[9px] font-mono" style={{ color: "#2a2240" }}>
                <span>{activeSession?.messages.length ?? 0} msgs</span>
                <span>·</span>
                <span>{activeSession ? estimateCost(activeSession.tokensIn, activeSession.tokensOut, activeSession.mode) : "$0"}</span>
                {running && <span className="animate-pulse" style={{ color: "#7c3aed" }}>⬤ running</span>}
              </div>
            </div>

            {/* ── File panel ── */}
            <AnimatePresence>
              {showFiles && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden shrink-0">
                  <FilePanel
                    files={activeSession?.files ?? []}
                    onAdd={addFile}
                    onRemove={removeFile}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Terminal output ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3 font-mono min-h-0"
              style={{ background: "#0c0c10" }}
            >
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 pb-8">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                  >
                    <Terminal className="w-7 h-7" style={{ color: "rgba(124,58,237,0.5)" }} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold mb-1" style={{ color: "#2a2240" }}>{currentMode.model}</div>
                    <div className="text-[10px] font-mono" style={{ color: "#1e1530" }}>
                      {currentMode.id === "ultracode" ? "xhigh + workflow orchestration" : `/${currentMode.id} mode active`}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 w-full max-w-sm px-4">
                    {QUICK_PROMPTS.map(p => (
                      <button
                        key={p}
                        onClick={() => { setInput(p); inputRef.current?.focus(); }}
                        className="text-left px-2 py-1.5 rounded-lg text-[9px] font-mono transition-all"
                        style={{ background: "#0e0e14", border: "1px solid rgba(255,255,255,0.05)", color: "#3a3060" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"; e.currentTarget.style.color = "#6d28d9"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#3a3060"; }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {logs.map((block, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <LogBlockView block={block} onToggleThinking={toggleThinking} />
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
                  onChange={e => {
                    const v = e.target.value;
                    setInput(v);
                    if (v.startsWith("/") && (v.endsWith(" ") || v === "/clear" || v === "/new" || v === "/key")) {
                      handleCommand(v);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={
                    running
                      ? "Running... (Esc to stop)"
                      : `Claude Code [${currentMode.id}] — اكتب هنا... أو /clear /new /key /model <mode>`
                  }
                  disabled={running}
                  className="flex-1 bg-transparent text-[12px] font-mono outline-none resize-none placeholder:text-gray-800 text-gray-200"
                  style={{ lineHeight: "1.5", maxHeight: 120 }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 120) + "px";
                  }}
                />
                <div className="flex items-center gap-1.5 mb-1.5 flex-shrink-0">
                  {running ? (
                    <button
                      onClick={stop}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold"
                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}
                    >
                      <Square className="w-3 h-3 fill-current" /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={execute}
                      disabled={!input.trim()}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold disabled:opacity-30 transition-all"
                      style={{
                        background: currentMode.id === "ultracode" ? "rgba(124,58,237,0.2)" : "rgba(139,92,246,0.12)",
                        border: `1px solid ${currentMode.color}40`,
                        color: currentMode.color,
                      }}
                    >
                      <Play className="w-3 h-3 fill-current" /> Run
                    </button>
                  )}
                  <button
                    onClick={() => { setLogs([]); updateSession(activeId, { messages: [] }); }}
                    className="p-1 rounded text-gray-700 hover:text-gray-500 transition-colors"
                    title="Clear"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const text = logs
                        .filter(b => b.kind === "text" || b.kind === "user")
                        .map(b => (b as { text: string }).text)
                        .join("\n\n");
                      navigator.clipboard.writeText(text);
                    }}
                    className="p-1 rounded text-gray-700 hover:text-gray-500 transition-colors"
                    title="Copy session"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[9px] font-mono mt-0.5 pl-6" style={{ color: "#2a2240" }}>
                Shift+Enter للسطر الجديد · /clear لمسح المحادثة · /new جلسة جديدة · /key لتغيير API Key
              </div>
            </div>

            {/* ── Ultracode Mode Slider ── */}
            <div
              className="shrink-0 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e1030 0%, #150d2a 40%, #1a0a3d 70%, #0f0720 100%)",
                borderTop: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              {/* Glow under active mode */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `radial-gradient(ellipse 50% 100% at ${(modeIdx / (MODES.length - 1)) * 100}% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)`,
                }}
              />

              <div className="relative px-6 py-3">
                {/* Smarter label */}
                <div className="absolute top-1 right-8 flex flex-col items-center">
                  <span className="text-[8px] font-mono" style={{ color: "#5b21b6" }}>Smarter</span>
                  <div className="w-px h-1.5" style={{ background: "rgba(91,33,182,0.5)" }} />
                </div>

                {/* Track + dots */}
                <div className="relative flex items-center mt-1">
                  {/* Full track line */}
                  <div
                    className="absolute top-[5px] left-0 right-0 h-0.5"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  {/* Active track */}
                  <div
                    className="absolute top-[5px] left-0 h-0.5 transition-all duration-400"
                    style={{
                      width: `${(modeIdx / (MODES.length - 1)) * 100}%`,
                      background: `linear-gradient(to right, rgba(139,92,246,0.4), ${currentMode.color})`,
                    }}
                  />

                  {MODES.map((m, idx) => {
                    const isActive = m.id === activeSession?.mode;
                    const isPast = idx <= modeIdx;
                    return (
                      <div key={m.id} className="flex-1 flex flex-col items-center relative">
                        <button
                          onClick={() => !running && setMode(m.id)}
                          disabled={running}
                          className="flex flex-col items-center gap-0.5 group"
                        >
                          <div
                            className="relative z-10 rounded-full transition-all duration-300"
                            style={{
                              width: isActive ? 12 : 7,
                              height: isActive ? 12 : 7,
                              background: isActive
                                ? m.color
                                : isPast ? "rgba(139,92,246,0.45)" : "rgba(255,255,255,0.1)",
                              boxShadow: isActive
                                ? `0 0 10px ${m.color}, 0 0 20px ${m.color}60`
                                : undefined,
                            }}
                          />
                          <span
                            className="text-[8px] font-mono font-bold mt-1 transition-colors duration-200"
                            style={{ color: isActive ? m.color : "#3a2e55" }}
                          >
                            {m.label}
                          </span>
                          {m.sub && (
                            <span className="text-[7px] font-mono" style={{ color: isActive ? "#5b21b6" : "#221a38" }}>
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
                  <span className="text-[8px] font-mono" style={{ color: "#3a2e55" }}>
                    {running ? (
                      <span className="animate-pulse" style={{ color: "#7c3aed" }}>
                        {currentMode.id === "ultracode" ? "Ultracode workflow running..." : `${currentMode.id} mode running...`}
                      </span>
                    ) : (
                      currentMode.model
                    )}
                  </span>
                  <span className="text-[8px] font-mono" style={{ color: "#2a2044" }}>
                    Esc to stop · Enter to run · Shift+Enter newline
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
