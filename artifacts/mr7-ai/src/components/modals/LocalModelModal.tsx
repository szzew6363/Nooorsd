import { useState } from "react";
import { Dialog, DialogContentTop, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Server, Wifi, WifiOff, CheckCircle2, AlertCircle, ExternalLink, Cpu } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

const QUICK_MODELS = [
  { id: "dolphin-mixtral", label: "Dolphin Mixtral", tag: "UNCENSORED" },
  { id: "dolphin-llama3:8b", label: "Dolphin Llama3 8B", tag: "UNCENSORED" },
  { id: "dolphin-llama3:70b", label: "Dolphin Llama3 70B", tag: "UNCENSORED" },
  { id: "dolphin-phi3", label: "Dolphin Phi3", tag: "FAST" },
  { id: "mistral", label: "Mistral 7B", tag: "FAST" },
  { id: "mixtral", label: "Mixtral 8x7B", tag: "POWERFUL" },
  { id: "llama3:8b", label: "Llama3 8B", tag: "FAST" },
  { id: "llama3:70b", label: "Llama3 70B", tag: "POWERFUL" },
  { id: "codellama", label: "Code Llama", tag: "CODE" },
  { id: "deepseek-coder-v2", label: "DeepSeek Coder V2", tag: "CODE" },
  { id: "wizardlm2", label: "WizardLM2 8x22B", tag: "POWERFUL" },
];

type TestStatus = "idle" | "testing" | "ok" | "fail";

interface LocalModelModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function LocalModelModal({ open, onOpenChange }: LocalModelModalProps) {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const lang = state.settings.language;

  const [endpoint, setEndpoint] = useState(state.settings.localEndpoint || "http://localhost:11434/v1");
  const [model, setModel] = useState(state.settings.localModel || "dolphin-mixtral");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMsg, setTestMsg] = useState("");

  const useLocal = state.settings.useLocalModel;

  function toggleLocalModel(v: boolean) {
    dispatch({ type: "SET_SETTINGS", patch: { useLocalModel: v } });
    if (v) {
      toast({ description: lang === "ar" ? "تم تفعيل النموذج المحلي." : "Local model activated." });
    } else {
      toast({ description: lang === "ar" ? "تم التبديل إلى نماذج CHAT-GPT.ai." : "Switched back to CHAT-GPT.ai models." });
    }
  }

  function save() {
    dispatch({ type: "SET_SETTINGS", patch: { localEndpoint: endpoint.trim(), localModel: model.trim() } });
    toast({ description: lang === "ar" ? "تم حفظ إعدادات النموذج المحلي." : "Local model settings saved." });
  }

  async function testConnection() {
    setTestStatus("testing");
    setTestMsg("");
    const base = endpoint.trim().replace(/\/$/, "");
    try {
      const res = await fetch(`${base}/models`, {
        headers: { "Authorization": "Bearer ollama" },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const count = Array.isArray(data?.data) ? data.data.length : "?";
        setTestStatus("ok");
        setTestMsg(lang === "ar" ? `متصل! ${count} نموذج متاح.` : `Connected! ${count} model(s) available.`);
      } else {
        setTestStatus("fail");
        setTestMsg(lang === "ar" ? `فشل الاتصال: ${res.status} ${res.statusText}` : `Connection failed: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      setTestStatus("fail");
      setTestMsg(lang === "ar"
        ? "لا يمكن الاتصال. تأكد أن Ollama يعمل وأن CORS مُفعّل."
        : "Cannot connect. Make sure Ollama is running and CORS is enabled.");
    }
  }

  const tagColor = (tag: string) => {
    if (tag === "UNCENSORED") return "border-cyan-500/40 text-cyan-400 bg-cyan-400/10";
    if (tag === "FAST") return "border-green-500/40 text-green-400 bg-green-400/10";
    if (tag === "POWERFUL") return "border-violet-500/40 text-violet-400 bg-violet-400/10";
    if (tag === "CODE") return "border-blue-500/40 text-blue-400 bg-blue-400/10";
    return "border-border text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentTop className="bg-card border-border w-[96vw] max-w-xl max-h-[82vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Server className="w-5 h-5 text-primary" />
            {lang === "ar" ? "نموذج محلي (Ollama / LM Studio)" : "Local Model (Ollama / LM Studio)"}
            {useLocal && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-400/20 text-green-400 border border-green-400/30 ml-1">
                {lang === "ar" ? "مُفعّل" : "ACTIVE"}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            {lang === "ar"
              ? "قم بتشغيل نماذج مفتوحة المصدر غير مقيّدة محلياً على جهازك وربطها بـ CHAT-GPT.ai."
              : "Run unrestricted open-source models locally on your machine and connect them to CHAT-GPT.ai."}
          </DialogDescription>
        </DialogHeader>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/60">
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" />
              {lang === "ar" ? "استخدام النموذج المحلي" : "Use Local Model"}
            </div>
            <div className="text-[12px] text-muted-foreground mt-0.5">
              {lang === "ar"
                ? "تجاوز نماذج CHAT-GPT.ai والاتصال بـ Ollama أو LM Studio على جهازك"
                : "Bypass CHAT-GPT.ai models and connect to Ollama or LM Studio on your machine"}
            </div>
          </div>
          <Switch checked={useLocal} onCheckedChange={toggleLocalModel} />
        </div>

        {/* Endpoint */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            {lang === "ar" ? "عنوان الـ API" : "API Endpoint"}
          </label>
          <div className="flex gap-2">
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-primary"
              placeholder="http://localhost:11434/v1"
              spellCheck={false}
            />
          </div>
          <div className="text-[11px] text-muted-foreground">
            {lang === "ar"
              ? "Ollama الافتراضي: http://localhost:11434/v1 · LM Studio: http://localhost:1234/v1"
              : "Ollama default: http://localhost:11434/v1 · LM Studio: http://localhost:1234/v1"}
          </div>
        </div>

        {/* Model Name */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            {lang === "ar" ? "اسم النموذج" : "Model Name"}
          </label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:border-primary"
            placeholder="dolphin-mixtral"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-1.5">
            {QUICK_MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold transition-colors ${
                  model === m.id ? "bg-primary/15 border-primary/40 text-primary" : "border-border bg-background/60 hover:bg-accent text-muted-foreground"
                }`}
              >
                {m.label}
                <span className={`text-[8px] font-bold px-1 rounded border ${tagColor(m.tag)}`}>{m.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Test Connection */}
        <div className="flex items-center gap-2">
          <button
            onClick={testConnection}
            disabled={testStatus === "testing"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background/60 hover:bg-accent disabled:opacity-50 text-[12px] font-semibold transition-colors"
          >
            {testStatus === "testing" ? (
              <Wifi className="w-3.5 h-3.5 animate-pulse text-primary" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {lang === "ar" ? "اختبار الاتصال" : "Test Connection"}
          </button>
          {testStatus === "ok" && (
            <div className="flex items-center gap-1 text-[12px] text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {testMsg}
            </div>
          )}
          {testStatus === "fail" && (
            <div className="flex items-center gap-1 text-[12px] text-red-400">
              <AlertCircle className="w-3.5 h-3.5" /> {testMsg}
            </div>
          )}
          {testStatus === "testing" && (
            <div className="text-[12px] text-muted-foreground animate-pulse">
              {lang === "ar" ? "جارٍ الاختبار..." : "Testing..."}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-[13px] font-bold transition-colors"
        >
          {lang === "ar" ? "حفظ الإعدادات" : "Save Settings"}
        </button>

        {/* Setup Guide */}
        <div className="rounded-xl border border-border bg-background/40 p-4 space-y-3 text-[12px]">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-primary" />
            {lang === "ar" ? "دليل الإعداد السريع" : "Quick Setup Guide"}
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-cyan-400">Ollama</div>
            <div className="text-muted-foreground space-y-1">
              <div>1. {lang === "ar" ? "تثبيت Ollama:" : "Install Ollama:"} <code className="bg-background px-1 rounded text-[11px]">ollama.com</code></div>
              <div>2. {lang === "ar" ? "تشغيل النموذج:" : "Run model:"} <code className="bg-background px-1 rounded text-[11px]">ollama run dolphin-mixtral</code></div>
              <div>3. {lang === "ar" ? "تفعيل CORS:": "Enable CORS:"} <code className="bg-background px-1 rounded text-[11px]">OLLAMA_ORIGINS=* ollama serve</code></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-violet-400">LM Studio</div>
            <div className="text-muted-foreground space-y-1">
              <div>1. {lang === "ar" ? "تحميل LM Studio من" : "Download LM Studio from"} <code className="bg-background px-1 rounded text-[11px]">lmstudio.ai</code></div>
              <div>2. {lang === "ar" ? "تحميل نموذج Dolphin أو Mistral من Hugging Face" : "Load a Dolphin or Mistral model from Hugging Face"}</div>
              <div>3. {lang === "ar" ? "تشغيل خادم API المحلي (المنفذ 1234 افتراضياً)" : "Start Local Server (default port 1234)"}</div>
              <div>4. {lang === "ar" ? "استخدم:" : "Use endpoint:"} <code className="bg-background px-1 rounded text-[11px]">http://localhost:1234/v1</code></div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-400/5 border border-amber-400/20 text-amber-300/90">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div>
              {lang === "ar"
                ? "ملاحظة: النموذج المحلي يعمل على جهازك فقط. تأكد أن متصفحك يسمح بالاتصال بـ localhost."
                : "Note: Local model runs on your machine only. Ensure your browser allows connections to localhost."}
            </div>
          </div>

          <a
            href="https://ollama.com/library"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {lang === "ar" ? "تصفح نماذج Ollama" : "Browse Ollama Models"}
          </a>
        </div>
      </DialogContentTop>
    </Dialog>
  );
}
