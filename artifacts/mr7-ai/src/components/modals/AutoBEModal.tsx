import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Server, Copy, CheckCheck, GitMerge, RotateCcw, Code2 } from "lucide-react";
import { pipeline } from "@/lib/pipeline";

interface AutoBEModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Framework = "express" | "fastapi" | "django" | "go-gin" | "rust-axum" | "spring";
const FRAMEWORKS: { id: Framework; label: string; lang: string }[] = [
  { id: "express",   label: "Express.js", lang: "TypeScript" },
  { id: "fastapi",   label: "FastAPI",    lang: "Python" },
  { id: "django",    label: "Django REST",lang: "Python" },
  { id: "go-gin",    label: "Go + Gin",   lang: "Go" },
  { id: "rust-axum", label: "Rust Axum",  lang: "Rust" },
  { id: "spring",    label: "Spring Boot",lang: "Java" },
];

const TEMPLATES = [
  { label: "User Auth API", desc: "JWT auth with register/login/refresh/logout endpoints" },
  { label: "CRUD REST API", desc: "Full resource CRUD with pagination, filtering, validation" },
  { label: "File Upload API", desc: "Multipart upload with storage, resize, CDN integration" },
  { label: "WebSocket Server", desc: "Real-time bidirectional events with rooms and auth" },
  { label: "GraphQL API",    desc: "Schema, resolvers, auth middleware, DataLoader" },
  { label: "Microservice",   desc: "Event-driven service with message queue integration" },
];

export function AutoBEModal({ open, onOpenChange }: AutoBEModalProps) {
  const [framework, setFramework] = useState<Framework>("express");
  const [desc, setDesc] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate(overrideDesc?: string) {
    const d = (overrideDesc ?? desc).trim();
    if (!d || running) return;
    setRunning(true);
    setOutput("");
    const fw = FRAMEWORKS.find((f) => f.id === framework)!;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `You are a senior backend engineer. Generate a complete, production-ready ${fw.label} (${fw.lang}) backend implementation.

Requirements: ${d}

Include:
1. Complete working code with all imports
2. Proper error handling and validation
3. Authentication/authorization where appropriate
4. Database models/schemas
5. Request/response types
6. Environment configuration
7. A brief README with setup commands

Format as clean ${fw.lang} code with clear comments. Make it production-ready, not a tutorial.`,
          }],
          model: "gpt-5.4",
          stream: true,
        }),
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
          try { const chunk = JSON.parse(raw); const delta = chunk.choices?.[0]?.delta?.content ?? ""; full += delta; setOutput(full); } catch { /* ignore */ }
        }
      }
      pipeline.push({ source: "AUTOBE", sourceColor: "#22d3ee", label: `${fw.label}: ${d.slice(0, 40)}`, content: full });
    } catch { /* ignore */ }
    setRunning(false);
  }

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.85)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#080808", border: "1px solid rgba(34,211,238,0.25)", boxShadow: "0 0 60px rgba(34,211,238,0.1)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(34,211,238,0.2)", background: "rgba(34,211,238,0.04)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: "rgba(34,211,238,0.1)", borderColor: "rgba(34,211,238,0.4)" }}>
                  <Server className="w-4 h-4" style={{ color: "#22d3ee" }} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-widest" style={{ color: "#22d3ee" }}>AUTO-BE</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#555" }}>Auto Backend Generator — production-ready APIs in seconds</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setOutput(""); setDesc(""); }} className="p-1.5 text-gray-600 hover:text-cyan-400"><RotateCcw className="w-4 h-4" /></button>
                <button onClick={() => onOpenChange(false)} className="p-1.5 text-gray-600 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Framework selector */}
            <div className="flex gap-1.5 p-3 border-b flex-wrap" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {FRAMEWORKS.map((f) => (
                <button key={f.id} onClick={() => setFramework(f.id)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all"
                  style={{ background: framework === f.id ? "rgba(34,211,238,0.15)" : "transparent", borderColor: framework === f.id ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.08)", color: framework === f.id ? "#22d3ee" : "#444" }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Templates */}
            <div className="flex gap-1.5 px-3 py-2 border-b flex-wrap" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {TEMPLATES.map((t) => (
                <button key={t.label} onClick={() => { setDesc(t.desc); generate(t.desc); }}
                  className="flex flex-col items-start px-2.5 py-1.5 rounded-lg border transition-all text-left"
                  style={{ background: "rgba(34,211,238,0.04)", borderColor: "rgba(34,211,238,0.1)" }}>
                  <span className="text-[9px] font-bold" style={{ color: "#22d3ee" }}>{t.label}</span>
                  <span className="text-[8px]" style={{ color: "#444" }}>{t.desc.slice(0, 35)}…</span>
                </button>
              ))}
            </div>

            {/* Output */}
            <div className="flex-1 overflow-y-auto p-3">
              {!output && !running ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <Code2 className="w-10 h-10" style={{ color: "#0a2a2e" }} />
                  <div className="text-[11px] font-mono" style={{ color: "#333" }}>Describe your API or click a template above</div>
                </div>
              ) : (
                <pre className="text-[10px] leading-relaxed font-mono whitespace-pre-wrap" style={{ color: "#777" }}>
                  {output}{running && <span className="animate-pulse">▊</span>}
                </pre>
              )}
            </div>

            {output && !running && (
              <div className="px-4 py-2 border-t flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border"
                  style={{ background: "rgba(34,211,238,0.06)", borderColor: "rgba(34,211,238,0.2)", color: "#22d3ee" }}>
                  {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={() => pipeline.push({ source: "AUTOBE", sourceColor: "#22d3ee", label: "Backend code", content: output })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border"
                  style={{ background: "rgba(0,229,204,0.06)", borderColor: "rgba(0,229,204,0.2)", color: "#00e5cc" }}>
                  <GitMerge className="w-3 h-3" /> Pipe
                </button>
              </div>
            )}

            <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-2">
                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
                  placeholder="Describe your backend API requirements…"
                  disabled={running}
                  className="flex-1 border rounded-xl px-3 py-2.5 text-[12px] outline-none bg-transparent"
                  style={{ borderColor: "rgba(34,211,238,0.2)", color: "#ccc" }} />
                <button onClick={() => generate()} disabled={running || !desc.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                  style={{ background: "rgba(34,211,238,0.2)", border: "1px solid rgba(34,211,238,0.4)" }}>
                  <Send className="w-4 h-4" style={{ color: "#22d3ee" }} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
