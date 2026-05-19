import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, AlertTriangle, Shield, RefreshCw, Terminal } from "lucide-react";
import { pipeline } from "@/lib/pipeline";

interface ABTopModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type ThreatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type LogEntry = { ts: string; level: ThreatLevel; msg: string };
type Metric = { label: string; value: number; max: number; color: string; unit: string };

function randomBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }

const LEVEL_COLORS: Record<ThreatLevel, string> = {
  LOW: "#10b981",
  MEDIUM: "#fbbf24",
  HIGH: "#f97316",
  CRITICAL: "#e21227",
};

const THREAT_EVENTS = [
  [["LOW"], "Port scan detected on interface eth0 — source 192.168.1.{x}"],
  [["MEDIUM"], "Brute force attempt blocked — SSH /var/log/auth.log {x} attempts"],
  [["MEDIUM"], "Anomalous outbound DNS query pattern detected — {x} req/min"],
  [["HIGH"], "Suspicious process injection detected — PID {x} → explorer.exe"],
  [["HIGH"], "Privilege escalation attempt — UID 1001 → UID 0 blocked"],
  [["CRITICAL"], "Possible C2 beacon detected — 10.0.0.{x}:443 (TLS heartbeat pattern)"],
  [["CRITICAL"], "Ransomware indicator — mass file rename pattern in /home/user/"],
  [["LOW"], "New network connection: 172.16.{x}.{y}:8080 → external"],
  [["MEDIUM"], "Memory anomaly: process heap overflow in /usr/bin/app-{x}"],
  [["LOW"], "Failed sudo attempt by user 'www-data'"],
];

export function ABTopModal({ open, onOpenChange }: ABTopModalProps) {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "CPU Threat Load", value: 12, max: 100, color: "#10b981", unit: "%" },
    { label: "Network Anomaly Score", value: 8, max: 100, color: "#fbbf24", unit: "pts" },
    { label: "Memory Integrity", value: 94, max: 100, color: "#60a5fa", unit: "%" },
    { label: "Active Connections", value: 23, max: 200, color: "#a78bfa", unit: "" },
    { label: "Blocked Attacks", value: 5, max: 500, color: "#e21227", unit: "" },
    { label: "Entropy Score", value: 2.1, max: 8, color: "#00e5cc", unit: "" },
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [overallThreat, setOverallThreat] = useState<ThreatLevel>("LOW");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Initial logs
    addRandomLog();
    intervalRef.current = setInterval(() => {
      updateMetrics();
      if (Math.random() > 0.4) addRandomLog();
    }, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  function addRandomLog() {
    const [levels, msgTemplate] = THREAT_EVENTS[Math.floor(Math.random() * THREAT_EVENTS.length)] as [string[], string];
    const level = levels[Math.floor(Math.random() * levels.length)] as ThreatLevel;
    const msg = msgTemplate
      .replace("{x}", String(randomBetween(1, 254)))
      .replace("{y}", String(randomBetween(1, 254)));
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev.slice(-49), { ts, level, msg }]);
    setOverallThreat((prev) => {
      const order: ThreatLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      return order[Math.max(order.indexOf(prev), order.indexOf(level))];
    });
  }

  function updateMetrics() {
    setMetrics((prev) => prev.map((m) => {
      const delta = (Math.random() - 0.48) * 8;
      const newVal = Math.max(0, Math.min(m.max, m.value + delta));
      return { ...m, value: Math.round(newVal * 10) / 10 };
    }));
  }

  async function runAiAnalysis() {
    if (analyzing) return;
    setAnalyzing(true);
    setAiAnalysis("");
    const recentLogs = logs.slice(-10).map((l) => `[${l.level}] ${l.msg}`).join("\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `You are a SOC analyst. Analyze these security events and provide: threat assessment, attack vector hypothesis, immediate actions, and IOCs to hunt for. Be specific and tactical.\n\nEvents:\n${recentLogs}`,
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
          try { const chunk = JSON.parse(raw); const delta = chunk.choices?.[0]?.delta?.content ?? ""; full += delta; setAiAnalysis(full); } catch { /* ignore */ }
        }
      }
      pipeline.push({ source: "ABTOP", sourceColor: "#e21227", label: "Threat Analysis", content: full });
    } catch { /* ignore */ }
    setAnalyzing(false);
  }

  const threatColor = LEVEL_COLORS[overallThreat];

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.9)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: "#050505", border: `1px solid ${threatColor}40`, boxShadow: `0 0 60px ${threatColor}15` }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: `${threatColor}25`, background: `${threatColor}06` }}>
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: `${threatColor}15`, borderColor: `${threatColor}50` }}>
                  <Activity className="w-4 h-4" style={{ color: threatColor }} />
                  {(overallThreat === "HIGH" || overallThreat === "CRITICAL") && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping" style={{ background: threatColor }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-widest" style={{ color: threatColor }}>ABTOP</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ background: `${threatColor}20`, color: threatColor }}>
                      THREAT: {overallThreat}
                    </span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#555" }}>AI Security Monitor — Live Threat Intelligence</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={runAiAnalysis} disabled={analyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border disabled:opacity-40 transition-all"
                  style={{ background: `${threatColor}10`, borderColor: `${threatColor}30`, color: threatColor }}>
                  {analyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                  AI Analyze
                </button>
                <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg text-gray-600 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {metrics.map((m) => (
                <div key={m.label} className="rounded-xl p-3" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: "#444" }}>{m.label}</div>
                  <div className="text-[16px] font-black font-mono" style={{ color: m.color }}>
                    {m.value}{m.unit}
                  </div>
                  <div className="mt-1.5 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: m.color }} animate={{ width: `${(m.value / m.max) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              {/* Live log */}
              <div ref={logRef} className="flex-1 overflow-y-auto p-3 font-mono" style={{ maxHeight: aiAnalysis ? 150 : 280 }}>
                {logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 mb-0.5">
                    <span className="text-[9px] flex-shrink-0" style={{ color: "#333" }}>{l.ts}</span>
                    <span className="text-[8px] font-bold flex-shrink-0 px-1 rounded" style={{ background: `${LEVEL_COLORS[l.level]}15`, color: LEVEL_COLORS[l.level] }}>{l.level}</span>
                    <span className="text-[10px]" style={{ color: l.level === "CRITICAL" ? "#e21227" : l.level === "HIGH" ? "#f97316" : "#555" }}>{l.msg}</span>
                  </div>
                ))}
              </div>

              {/* AI Analysis output */}
              {(aiAnalysis || analyzing) && (
                <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#080808" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Terminal className="w-3 h-3" style={{ color: "#e21227" }} />
                    <span className="text-[9px] font-bold font-mono" style={{ color: "#e21227" }}>SOC ANALYSIS</span>
                  </div>
                  <div className="text-[10px] leading-relaxed max-h-32 overflow-y-auto" style={{ color: "#666", whiteSpace: "pre-wrap" }}>
                    {aiAnalysis}{analyzing && <span className="animate-pulse">▊</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                <span className="text-[9px] font-mono" style={{ color: "#333" }}>Live monitoring active</span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as ThreatLevel[]).map((l) => (
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: LEVEL_COLORS[l] }} />
                    <span className="text-[8px] font-mono" style={{ color: "#2a2a2a" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
