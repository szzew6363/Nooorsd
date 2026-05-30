import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bot, Hexagon, Cpu, Zap, Brain, Terminal, Database,
  Layers, Code2, Users, Sparkles, BookOpen,
  CheckSquare, Square, Shield, Swords, ExternalLink,
  GitMerge, ArrowRight, RotateCcw, Trash2, Copy, CheckCheck,
  Network, Briefcase, Palette, Activity, Link2, Plus,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Flame, TrendingDown, Monitor, BarChart2, Bug, Factory,
  FlaskConical, Search, Wifi, Rocket, FileText, Skull,
} from "lucide-react";
import { pipeline, type PipelineHistoryEntry, type ChainRule } from "@/lib/pipeline";

export type ArsenalModuleId =
  | "kaliagent" | "nexus" | "jarvis" | "parseltongue"
  | "ragflow" | "opengravity" | "teamagent" | "skills"
  | "agentOS" | "geminiCLI"
  | "hermes" | "graphify" | "getshitdone" | "ccswitch"
  | "uiuxpro" | "careerops" | "abtop" | "awesomellm"
  | "osintscanner" | "nanobot" | "agentkanban" | "autobe"
  | "superpowers" | "lerimcli" | "claudeprompts" | "rvsagent"
  | "codexmobile" | "openacp" | "handclaw" | "ralph"
  | "burnbaby" | "crush" | "rtk"
  | "codexbar" | "codexsaver" | "agentmemory" | "decepticon"
  | "droiddesk" | "bughunter" | "hyperresearch" | "aifactory"
  | "gemmachat" | "codegraph" | "ohmypi" | "awesomeopencode"
  | "openreplove" | "dyad" | "ghostwriter" | "agentscope" | "insforge"
  | "malwarearsenal" | "threatintel" | "wormgpt"
  | "antigravitymgr" | "axonhub" | "bigagi" | "hackingtool"
  | "godmod3" | "geminiresearch" | "openantigravity";

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
    desc: "6 obfuscation techniques × 3 intensities for adversarial prompt research and red team operations.",
    icon: Swords, color: "#00ff41", border: "rgba(0,255,65,0.3)", bg: "rgba(0,255,65,0.06)", glow: "rgba(0,255,65,0.2)",
    source: "G0DM0D3", tag: "RED TEAM",
  },
  {
    id: "ragflow", name: "RAGFlow", subtitle: "Knowledge Base Chat",
    desc: "Upload documents and chat with them using deep retrieval-augmented generation with keyword scoring.",
    icon: Database, color: "#3b82f6", border: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.07)", glow: "rgba(59,130,246,0.25)",
    source: "RAGFlow", tag: "RAG",
  },
  {
    id: "opengravity", name: "OpenGravity IDE", subtitle: "AI Code Editor",
    desc: "Browser-based AI code editor with inline completions, refactor, explain, and debug.",
    icon: Code2, color: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.07)", glow: "rgba(167,139,250,0.25)",
    source: "OpenGravity", tag: "IDE",
  },
  {
    id: "teamagent", name: "Team Agent", subtitle: "Parallel Multi-Agent Mode",
    desc: "Spawn 2–5 agents in parallel on the same task. Fusion synthesis merges all results.",
    icon: Users, color: "#f97316", border: "rgba(249,115,22,0.35)", bg: "rgba(249,115,22,0.07)", glow: "rgba(249,115,22,0.25)",
    source: "oh-my-openagent", tag: "PARALLEL",
  },
  {
    id: "skills", name: "Skills Library", subtitle: "1,460+ Agentic Skills",
    desc: "Browse and inject curated SKILL.md playbooks from Antigravity / Ruflo into the active AI context.",
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
  // --- New modules from uploaded projects ---
  {
    id: "hermes", name: "Hermes Agent", subtitle: "Multi-Step Reasoning Chain",
    desc: "Think → Plan → Act → Reflect → Answer. Structured 5-phase reasoning agent for deep analytical problem solving.",
    icon: Zap, color: "#fbbf24", border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.07)", glow: "rgba(251,191,36,0.25)",
    source: "hermes-agent", tag: "REASONING",
  },
  {
    id: "graphify", name: "Graphify", subtitle: "Knowledge Graph Generator",
    desc: "Convert any text into an interactive SVG knowledge graph with draggable nodes, colored by type.",
    icon: Network, color: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.07)", glow: "rgba(167,139,250,0.25)",
    source: "graphify-8", tag: "GRAPH",
  },
  {
    id: "getshitdone", name: "Get Shit Done", subtitle: "AI GTD Task Engine",
    desc: "Enter a goal → AI breaks it into prioritized tasks with micro-steps. Track progress, expand tasks, pipe output.",
    icon: CheckSquare, color: "#f97316", border: "rgba(249,115,22,0.35)", bg: "rgba(249,115,22,0.07)", glow: "rgba(249,115,22,0.25)",
    source: "get-shit-done", tag: "PRODUCTIVITY",
  },
  {
    id: "ccswitch", name: "CC Switch", subtitle: "Multi-Model Comparison",
    desc: "Send the same prompt to multiple AI models simultaneously. Compare responses side-by-side in real time.",
    icon: Layers, color: "#6366f1", border: "rgba(99,102,241,0.35)", bg: "rgba(99,102,241,0.07)", glow: "rgba(99,102,241,0.25)",
    source: "cc-switch", tag: "COMPARE",
  },
  {
    id: "uiuxpro", name: "UI/UX Pro Max", subtitle: "Design Intelligence Suite",
    desc: "Wireframes, UI critique, component generation, UX flows, color systems, and microcopy — 6 specialist modes.",
    icon: Palette, color: "#ec4899", border: "rgba(236,72,153,0.35)", bg: "rgba(236,72,153,0.07)", glow: "rgba(236,72,153,0.25)",
    source: "ui-ux-pro-max-skill", tag: "DESIGN",
  },
  {
    id: "careerops", name: "Career Ops", subtitle: "AI Career Intelligence",
    desc: "Resume optimizer, cover letters, interview prep, salary negotiation, LinkedIn optimizer, career roadmap.",
    icon: Briefcase, color: "#0ea5e9", border: "rgba(14,165,233,0.35)", bg: "rgba(14,165,233,0.07)", glow: "rgba(14,165,233,0.25)",
    source: "career-ops", tag: "CAREER",
  },
  {
    id: "abtop", name: "ABTop", subtitle: "AI Threat Monitor",
    desc: "Live security threat dashboard — real-time IOC detection, CVSS metrics, and AI-powered SOC analysis.",
    icon: Activity, color: "#e21227", border: "rgba(226,18,39,0.35)", bg: "rgba(226,18,39,0.07)", glow: "rgba(226,18,39,0.25)",
    source: "abtop", tag: "MONITOR",
  },
  {
    id: "awesomellm", name: "Awesome LLM Apps", subtitle: "AI App Gallery",
    desc: "12 curated AI app templates (RAG, agents, code review, security, SQL, data science) — one-click inject into chat.",
    icon: Sparkles, color: "#fbbf24", border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.07)", glow: "rgba(251,191,36,0.25)",
    source: "awesome-llm-apps", tag: "GALLERY",
  },
  // --- Second batch from uploaded ZIP projects ---
  {
    id: "osintscanner", name: "OSINT Scanner", subtitle: "Open-Source Intelligence Recon",
    desc: "Domain/IP/email/username/hash scanner with 7 data sources. AI report auto-chains to KaliAgent for exploit discovery.",
    icon: Layers, color: "#e21227", border: "rgba(226,18,39,0.35)", bg: "rgba(226,18,39,0.08)", glow: "rgba(226,18,39,0.25)",
    source: "openclaw-android / handclaw", tag: "OSINT",
  },
  {
    id: "nanobot", name: "NanoBot", subtitle: "Lightweight AI Assistant",
    desc: "Zero-fluff AI chat with 8 quick-action presets. Instant answers, code, shell, SQL, regex — no filler.",
    icon: Zap, color: "#00e5cc", border: "rgba(0,229,204,0.35)", bg: "rgba(0,229,204,0.07)", glow: "rgba(0,229,204,0.25)",
    source: "nanobot-main", tag: "FAST",
  },
  {
    id: "agentkanban", name: "Agent Kanban", subtitle: "AI Task Board",
    desc: "Kanban board where each card is an AI agent task. Backlog → Running → Done. Run all tasks in parallel.",
    icon: Layers, color: "#fbbf24", border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.07)", glow: "rgba(251,191,36,0.25)",
    source: "agent-kanban-main", tag: "KANBAN",
  },
  {
    id: "autobe", name: "Auto-BE", subtitle: "Backend Generator",
    desc: "Generate production-ready backends in Express/FastAPI/Django/Go/Rust/Spring. 6 frameworks × 6 templates.",
    icon: Code2, color: "#22d3ee", border: "rgba(34,211,238,0.35)", bg: "rgba(34,211,238,0.07)", glow: "rgba(34,211,238,0.25)",
    source: "autobe-main", tag: "BACKEND",
  },
  {
    id: "superpowers", name: "Superpowers", subtitle: "AI Capability Injector",
    desc: "12 elite superpowers (Adversarial Thinking, First Principles, Code Archaeologist, Master Negotiator…) inject into chat.",
    icon: Sparkles, color: "#fbbf24", border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.07)", glow: "rgba(251,191,36,0.25)",
    source: "superpowers-optimized-main", tag: "INJECT",
  },
  {
    id: "lerimcli", name: "Lerim CLI", subtitle: "AI Terminal Interface",
    desc: "Full AI terminal with /ask /code /explain /fix /shell /scan /pipe commands, history navigation, Ctrl+L clear.",
    icon: Terminal, color: "#818cf8", border: "rgba(129,140,248,0.35)", bg: "rgba(129,140,248,0.07)", glow: "rgba(129,140,248,0.25)",
    source: "lerim-cli-main", tag: "CLI",
  },
  {
    id: "claudeprompts", name: "Claude Prompts", subtitle: "Expert Prompt Library",
    desc: "12 production-grade prompts (Security Auditor, System Design, API Designer, LLM Red Teamer…) inject instantly.",
    icon: BookOpen, color: "#10b981", border: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.07)", glow: "rgba(16,185,129,0.25)",
    source: "claude-code-prompts-master", tag: "PROMPTS",
  },
  {
    id: "rvsagent", name: "Run VS Agent", subtitle: "AI Code Executor",
    desc: "AI-simulated execution for Python/JS/TS/Bash/Go/Rust. Paste code, see output. AI Fix button auto-corrects bugs.",
    icon: Code2, color: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.07)", glow: "rgba(167,139,250,0.25)",
    source: "RunVSAgent-main", tag: "EXEC",
  },
  {
    id: "codexmobile", name: "Codex Mobile", subtitle: "Mobile Code Assistant",
    desc: "Compact mobile-style code assistant with 8 quick actions: Review PR, Write Tests, Refactor, Add Types, Gen Docs, Find Bugs.",
    icon: Cpu, color: "#34d399", border: "rgba(52,211,153,0.35)", bg: "rgba(52,211,153,0.07)", glow: "rgba(52,211,153,0.25)",
    source: "codex-mobile-main", tag: "CODE",
  },
  {
    id: "openacp", name: "Open ACP", subtitle: "Agent Coordination Protocol",
    desc: "Planner → Executor → Critic → Researcher run in parallel, Synthesizer combines all outputs into final solution.",
    icon: GitMerge, color: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.07)", glow: "rgba(167,139,250,0.25)",
    source: "OpenACP-main", tag: "MULTI-AGENT",
  },
  {
    id: "handclaw", name: "HandClaw", subtitle: "Voice & Gesture AI",
    desc: "Control AI with voice (Web Speech API) or 6 gesture triggers. Speak commands, tap gestures, instant results.",
    icon: Brain, color: "#fb7185", border: "rgba(251,113,133,0.35)", bg: "rgba(251,113,133,0.07)", glow: "rgba(251,113,133,0.25)",
    source: "handclaw-main", tag: "VOICE",
  },
  {
    id: "ralph", name: "Ralph Agent", subtitle: "AI Brainstorm + Autonomous Loop",
    desc: "Start vague → AI interviews you → builds refined prompt → iterates autonomously until perfect. Ralph Loop methodology.",
    icon: Bot, color: "#fb923c", border: "rgba(251,146,60,0.35)", bg: "rgba(251,146,60,0.07)", glow: "rgba(251,146,60,0.25)",
    source: "ralph-desktop-main", tag: "LOOP",
  },
  {
    id: "burnbaby", name: "Burn Baby Burn", subtitle: "Intentional Token Burner",
    desc: "Burn tokens on purpose with real model pricing (Haiku/Sonnet/GPT-5.x). Target token count, cost tracking, per-call log.",
    icon: Flame, color: "#e21227", border: "rgba(226,18,39,0.4)", bg: "rgba(226,18,39,0.08)", glow: "rgba(226,18,39,0.3)",
    source: "burn-baby-burn", tag: "TOKENS",
  },
  {
    id: "crush", name: "Crush", subtitle: "Terminal AI Coding Assistant",
    desc: "Your coding bestie by Charmbracelet — multi-provider (Anthropic/OpenAI/Gemini/Bedrock), sessions, LSP, MCP, PreToolUse hooks.",
    icon: Terminal, color: "#a78bfa", border: "rgba(167,139,250,0.4)", bg: "rgba(167,139,250,0.08)", glow: "rgba(167,139,250,0.3)",
    source: "crush", tag: "CODING",
  },
  {
    id: "rtk", name: "RTK", subtitle: "Rust Token Killer",
    desc: "CLI proxy that reduces LLM token consumption 60-90%. Single Rust binary, 100+ commands, <10ms overhead. Saves ~80% in 30-min sessions.",
    icon: TrendingDown, color: "#e21227", border: "rgba(226,18,39,0.35)", bg: "rgba(226,18,39,0.07)", glow: "rgba(226,18,39,0.25)",
    source: "rtk-develop", tag: "COMPRESS",
  },
  // --- Batch 3: New modules from uploaded ZIPs ---
  {
    id: "codexbar", name: "CodexBar", subtitle: "AI Token Limits Dashboard",
    desc: "40+ AI provider token limits in one view. Usage bars, reset countdowns, near-limit alerts. Copy usage report instantly.",
    icon: BarChart2, color: "#10b981", border: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.07)", glow: "rgba(16,185,129,0.25)",
    source: "CodexBar-main", tag: "MONITOR",
  },
  {
    id: "codexsaver", name: "CodexSaver", subtitle: "Cost-Aware AI Router",
    desc: "Smart token cost optimizer. Routes low-risk tasks to cheaper worker LLM. Analyze any task and get router recommendation + cost saving %.",
    icon: TrendingDown, color: "#22d3ee", border: "rgba(34,211,238,0.35)", bg: "rgba(34,211,238,0.07)", glow: "rgba(34,211,238,0.25)",
    source: "CodexSaver-main", tag: "COST",
  },
  {
    id: "agentmemory", name: "Agent Memory", subtitle: "Persistent Cross-Session Memory",
    desc: "Store and retrieve context across AI sessions. No more re-explaining your stack. Inject full memory context into any conversation.",
    icon: Brain, color: "#fbbf24", border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.07)", glow: "rgba(251,191,36,0.25)",
    source: "agentmemory-main", tag: "MEMORY",
  },
  {
    id: "decepticon", name: "Decepticon", subtitle: "Autonomous Red Team Agent",
    desc: "5-phase autonomous red team pipeline: Recon → Scan → Exploit → Persist → Report. AI-powered attack planning for authorized engagements.",
    icon: Swords, color: "#e21227", border: "rgba(226,18,39,0.4)", bg: "rgba(226,18,39,0.08)", glow: "rgba(226,18,39,0.3)",
    source: "Decepticon-main", tag: "RED TEAM",
  },
  {
    id: "droiddesk", name: "DroidDesk", subtitle: "Linux Desktop on Android",
    desc: "Full Linux desktop on any Android phone. Termux + PRoot + XFCE4. Run VS Code, Claude Code, Metasploit, Wireshark — no root required.",
    icon: Monitor, color: "#0ea5e9", border: "rgba(14,165,233,0.35)", bg: "rgba(14,165,233,0.07)", glow: "rgba(14,165,233,0.25)",
    source: "DroidDesk-main", tag: "MOBILE",
  },
  {
    id: "bughunter", name: "Bug Hunter", subtitle: "51 Skills · 681 HackerOne Patterns",
    desc: "claude-bughunter skill bundle. 24 vulnerability classes, enterprise attack chains (M365, Okta, Cloud IAM), APK red team, supply chain.",
    icon: Bug, color: "#e21227", border: "rgba(226,18,39,0.35)", bg: "rgba(226,18,39,0.07)", glow: "rgba(226,18,39,0.25)",
    source: "Claude-BugHunter-main", tag: "BUG HUNT",
  },
  {
    id: "hyperresearch", name: "HyperResearch", subtitle: "Deep Research Agent",
    desc: "16-step adversarially-audited research pipeline. Leads DeepResearch-Bench. Source provenance vault, bias detection, tier-adaptive depth.",
    icon: Search, color: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.07)", glow: "rgba(167,139,250,0.25)",
    source: "hyperresearch-main", tag: "RESEARCH",
  },
  {
    id: "aifactory", name: "AI Factory", subtitle: "Multi-Stage AI Pipelines",
    desc: "Stop configuring. Start building. 6 production pipelines: Code Review, Docs, Tests, Refactor, Security Audit, Code Translate.",
    icon: Factory, color: "#0ea5e9", border: "rgba(14,165,233,0.35)", bg: "rgba(14,165,233,0.07)", glow: "rgba(14,165,233,0.25)",
    source: "ai-factory-2.x", tag: "PIPELINE",
  },
  {
    id: "gemmachat", name: "Gemma Chat", subtitle: "Local AI Coding Agent",
    desc: "Vibe code without the internet. Gemma 4 via Apple MLX — no API keys, no cloud, no Wi-Fi. Full coding assistant running on your device.",
    icon: Wifi, color: "#4299e1", border: "rgba(66,153,225,0.35)", bg: "rgba(66,153,225,0.07)", glow: "rgba(66,153,225,0.25)",
    source: "gemma-chat-main", tag: "LOCAL AI",
  },
  {
    id: "codegraph", name: "CodeGraph", subtitle: "Codebase Knowledge Graph",
    desc: "Transform your codebase into a semantically searchable knowledge graph. AI agents reason about architecture — not just grep.",
    icon: Network, color: "#3b82f6", border: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.07)", glow: "rgba(59,130,246,0.25)",
    source: "codegraph-rust-main", tag: "GRAPH",
  },
  {
    id: "ohmypi", name: "oh-my-pi", subtitle: "Coding Agent · IDE Wired In",
    desc: "Pi coding agent with the full IDE wired in. TypeScript + Rust + Bun. Senior-engineer-level code, architecture, and debugging.",
    icon: Cpu, color: "#34d399", border: "rgba(52,211,153,0.35)", bg: "rgba(52,211,153,0.07)", glow: "rgba(52,211,153,0.25)",
    source: "oh-my-pi-main", tag: "CODING",
  },
  {
    id: "awesomeopencode", name: "Awesome OpenCode", subtitle: "Curated AI Tool Gallery",
    desc: "Hand-curated open-source AI coding projects. Agents, memory systems, skills, security tools, research pipelines — inject any into chat.",
    icon: Sparkles, color: "#6366f1", border: "rgba(99,102,241,0.35)", bg: "rgba(99,102,241,0.07)", glow: "rgba(99,102,241,0.25)",
    source: "awesome-opencode-main", tag: "GALLERY",
  },
  // ─── Batch 4: OpenRepLove · Dyad · Ghostwriter · AgentScope · InsForge ───────
  {
    id: "openreplove", name: "OpenRepLove", subtitle: "Local AI IDE · 6 Agents",
    desc: "Replit/Lovable-style local AI IDE. 6 specialized agents: Planner, Context, Coder, QA, UI, Deployment. Build full-stack apps from plain English prompts.",
    icon: Rocket, color: "#6366f1", border: "rgba(99,102,241,0.35)", bg: "rgba(99,102,241,0.07)", glow: "rgba(99,102,241,0.25)",
    source: "OpenRepLove-main", tag: "IDE AGENT",
  },
  {
    id: "dyad", name: "Dyad", subtitle: "8 Dev Workflow Skills",
    desc: "Claude Code skill bundle for dev workflows: Plan→Issue, Fix Issue, PR Fix, Lint, Deflake E2E, Feedback→Issues, Fast Push, Session Debug.",
    icon: GitMerge, color: "#818cf8", border: "rgba(129,140,248,0.35)", bg: "rgba(129,140,248,0.07)", glow: "rgba(129,140,248,0.25)",
    source: "dyad-main", tag: "WORKFLOW",
  },
  {
    id: "ghostwriter", name: "Ghostwriter", subtitle: "Pentest Report Generator",
    desc: "Professional engagement management platform. 6 report types: Pentest, Red Team, Vuln, Finding, OSINT, Cloud. CVSS scoring, PoC writeups, remediation roadmaps.",
    icon: FileText, color: "#e21227", border: "rgba(226,18,39,0.35)", bg: "rgba(226,18,39,0.07)", glow: "rgba(226,18,39,0.25)",
    source: "Ghostwriter-master", tag: "REPORTING",
  },
  {
    id: "agentscope", name: "AgentScope 2.0", subtitle: "Production Agent Framework",
    desc: "Production-ready multi-agent framework. ReAct, Multi-Agent orchestration, Workflow pipelines, Memory, Realtime Voice, MCP integration. A2A coordination.",
    icon: Cpu, color: "#fbbf24", border: "rgba(251,191,36,0.35)", bg: "rgba(251,191,36,0.07)", glow: "rgba(251,191,36,0.25)",
    source: "agentscope-main", tag: "FRAMEWORK",
  },
  {
    id: "insforge", name: "InsForge", subtitle: "Agentic Backend Platform",
    desc: "All-in-one backend for agentic coding. DB · Auth · Storage · Edge Functions · AI Gateway · Realtime. Coding agents interact via MCP or CLI skills.",
    icon: Database, color: "#10b981", border: "rgba(16,185,129,0.35)", bg: "rgba(16,185,129,0.07)", glow: "rgba(16,185,129,0.25)",
    source: "InsForge-main", tag: "BACKEND",
  },
  {
    id: "malwarearsenal", name: "Malware Arsenal", subtitle: "100+ Offensive Techniques",
    desc: "Complete offensive security arsenal: Payloads · Obfuscation · C2 Frameworks · Persistence · Evasion · Lateral Movement · PrivEsc · Injection · Ransomware · Post-Exploitation.",
    icon: Skull, color: "#e21227", border: "rgba(226,18,39,0.4)", bg: "rgba(226,18,39,0.08)", glow: "rgba(226,18,39,0.3)",
    source: "KaliGPT", tag: "ARSENAL",
  },
  {
    id: "threatintel", name: "Threat Intelligence", subtitle: "CVE · APT · Campaigns · AI Briefs",
    desc: "Live threat intelligence dashboard: real-time CVE feed, APT group tracking, active campaign monitoring, and AI-powered security briefings updated on demand.",
    icon: Shield, color: "#e21227", border: "rgba(226,18,39,0.4)", bg: "rgba(226,18,39,0.08)", glow: "rgba(226,18,39,0.3)",
    source: "KaliGPT · NVD · MITRE ATT&CK", tag: "THREAT INTEL",
  },
  {
    id: "wormgpt", name: "Worm-GPT", subtitle: "Operator · Red Team · File Analysis · Mission Logs",
    desc: "Dual-mode offensive AI terminal: OPERATOR (professional security research) & RED TEAM (unrestricted attack mindset). File upload analysis, pre-built arsenal commands, and persistent mission log storage.",
    icon: Terminal, color: "#00ff41", border: "rgba(0,255,65,0.4)", bg: "rgba(0,255,65,0.07)", glow: "rgba(0,255,65,0.3)",
    source: "Worm-GPT · KaliGPT", tag: "OFFENSIVE AI",
  },
  // ── Batch 5: ZIP-project integrations ────────────────────────────────────
  {
    id: "antigravitymgr", name: "AntigravityManager", subtitle: "Gravity · Levitation · Physics Override",
    desc: "Advanced anti-gravity simulation and manager: control levitation engines, inertia dampeners, gravity field manipulation, and physics override sequences for speculative tech research.",
    icon: Zap, color: "#8b5cf6", border: "rgba(139,92,246,0.4)", bg: "rgba(139,92,246,0.08)", glow: "rgba(139,92,246,0.3)",
    source: "AntigravityManager-main", tag: "SIMULATION",
  },
  {
    id: "axonhub", name: "AxonHub", subtitle: "Distributed Agent Mesh · Event Bus · Orchestration",
    desc: "Multi-agent neural communication hub: distributed event-bus routing, agent registration, pub/sub messaging, and real-time orchestration of autonomous agent networks.",
    icon: Network, color: "#06b6d4", border: "rgba(6,182,212,0.4)", bg: "rgba(6,182,212,0.08)", glow: "rgba(6,182,212,0.3)",
    source: "AxonHub", tag: "AGENT INFRA",
  },
  {
    id: "bigagi", name: "Big-AGI Beam", subtitle: "Multi-Model · Parallel Inference · Fusion",
    desc: "Parallel multi-model beam search: query GPT-4, Claude, Gemini, and open-source models simultaneously, compare responses side-by-side, and merge the best into a single authoritative answer.",
    icon: Layers, color: "#f59e0b", border: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.08)", glow: "rgba(245,158,11,0.3)",
    source: "big-AGI · Beam", tag: "MULTI-MODEL",
  },
  {
    id: "hackingtool", name: "HackingTool Suite", subtitle: "185+ Tools · 20 Categories",
    desc: "Comprehensive offensive security toolkit with 185+ tools across 20 categories: Information Gathering, Vulnerability Analysis, Exploitation, Post-Exploitation, Wireless, Forensics, Malware, MITM, OSINT, Password Attacks, and more.",
    icon: Skull, color: "#ef4444", border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.08)", glow: "rgba(239,68,68,0.3)",
    source: "HackingTool", tag: "OFFENSIVE",
  },
  {
    id: "godmod3", name: "G0DM0D3", subtitle: "GODMODE · ULTRAPLINIAN · Parseltongue · AutoTune",
    desc: "Quadruple-mode AI amplifier: GODMODE (unrestricted expert combos), ULTRAPLINIAN (catastrophic knowledge expansion), Parseltongue (serpent language encoder), AutoTune (response quality optimizer).",
    icon: FlaskConical, color: "#dc2626", border: "rgba(220,38,38,0.5)", bg: "rgba(220,38,38,0.1)", glow: "rgba(220,38,38,0.35)",
    source: "G0DM0D3", tag: "GODMODE",
  },
  {
    id: "geminiresearch", name: "Gemini Deep Research", subtitle: "Multi-Phase · Reflection · Refinement Loops",
    desc: "Gemini-style iterative deep research agent: Phase 1 query generation → Phase 2 broad research → Phase 3 reflection & gap analysis → Phase 4 refinement loops → Phase 5 synthesized comprehensive answer.",
    icon: Search, color: "#4285f4", border: "rgba(66,133,244,0.4)", bg: "rgba(66,133,244,0.08)", glow: "rgba(66,133,244,0.3)",
    source: "Gemini LangGraph Research", tag: "RESEARCH AI",
  },
  {
    id: "openantigravity", name: "Open-Antigravity", subtitle: "Phase Engine · Dark Matter · Quantum Lift",
    desc: "Open-source anti-gravity research platform: phase resonance calculations, dark matter interaction simulations, quantum lift field generation, and propulsion system modeling for theoretical physics.",
    icon: Rocket, color: "#10b981", border: "rgba(16,185,129,0.4)", bg: "rgba(16,185,129,0.08)", glow: "rgba(16,185,129,0.3)",
    source: "Open-Antigravity", tag: "QUANTUM SIM",
  },
];

const STORAGE_KEY = "mr7-arsenal-enabled";

interface ArsenalHubModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLaunch: (id: ArsenalModuleId) => void;
}

type Tab = "modules" | "chain" | "history" | "mission";

// ─── Chain Builder ────────────────────────────────────────────────────────────

const ALL_SOURCES = [
  "*",
  ...ARSENAL_MODULES.map((m) => m.name.toUpperCase().replace(/\s/g, "")),
  "CHAT",
];

const ALL_DESTINATIONS = [
  ...ARSENAL_MODULES.map((m) => ({ label: m.name, value: m.name.toUpperCase().replace(/\s/g, ""), color: m.color })),
  { label: "Chat", value: "CHAT", color: "#e21227" },
];

function ChainBuilderTab() {
  const [rules, setRules] = useState<ChainRule[]>(() => pipeline.getRules());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sourceModule: "*",
    destinationModule: "KALIAGENT",
    destinationColor: "#ff4d4d",
    triggerKeyword: "",
    enabled: true,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    return pipeline.subscribeRules(() => setRules(pipeline.getRules()));
  }, []);

  function saveRule() {
    if (!form.name.trim()) return;
    pipeline.addRule(form);
    setShowForm(false);
    setForm({ name: "", sourceModule: "*", destinationModule: "KALIAGENT", destinationColor: "#ff4d4d", triggerKeyword: "", enabled: true });
  }

  function deleteRule(id: string) { pipeline.deleteRule(id); }
  function toggleRule(id: string, enabled: boolean) { pipeline.updateRule(id, { enabled }); }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-bold" style={{ color: "#00e5cc" }}>Automation Rules</div>
          <div className="text-[10px] mt-0.5" style={{ color: "#444" }}>
            When a module produces output matching your rule, it automatically routes to the destination module.
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border flex-shrink-0 transition-all"
          style={{ background: showForm ? "rgba(226,18,39,0.1)" : "rgba(0,229,204,0.08)", borderColor: showForm ? "rgba(226,18,39,0.3)" : "rgba(0,229,204,0.3)", color: showForm ? "#e21227" : "#00e5cc" }}
        >
          {showForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> New Rule</>}
        </button>
      </div>

      {/* New rule form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(0,229,204,0.04)", border: "1px solid rgba(0,229,204,0.15)" }}>
              <div className="text-[10px] font-bold font-mono" style={{ color: "#00e5cc" }}>NEW CHAIN RULE</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono mb-1 block" style={{ color: "#444" }}>Rule Name</label>
                  <input
                    type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Parseltongue → KaliAgent"
                    className="w-full bg-transparent border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#ccc" }}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono mb-1 block" style={{ color: "#444" }}>Trigger Keyword (optional)</label>
                  <input
                    type="text" value={form.triggerKeyword} onChange={(e) => setForm((f) => ({ ...f, triggerKeyword: e.target.value }))}
                    placeholder="e.g. exploit, CVE, payload…"
                    className="w-full bg-transparent border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                    style={{ borderColor: "rgba(255,255,255,0.1)", color: "#ccc" }}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono mb-1 block" style={{ color: "#444" }}>Source Module</label>
                  <select
                    value={form.sourceModule}
                    onChange={(e) => setForm((f) => ({ ...f, sourceModule: e.target.value }))}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                    style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.1)", color: "#ccc" }}
                  >
                    <option value="*">Any Module</option>
                    {ALL_SOURCES.filter((s) => s !== "*").map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-mono mb-1 block" style={{ color: "#444" }}>Destination Module</label>
                  <select
                    value={form.destinationModule}
                    onChange={(e) => {
                      const dest = ALL_DESTINATIONS.find((d) => d.value === e.target.value);
                      setForm((f) => ({ ...f, destinationModule: e.target.value, destinationColor: dest?.color ?? "#00e5cc" }));
                    }}
                    className="w-full border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                    style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.1)", color: "#ccc" }}
                  >
                    {ALL_DESTINATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-mono" style={{ color: "#555" }}>
                    {form.sourceModule === "*" ? "Any output" : form.sourceModule}
                    {form.triggerKeyword ? ` containing "${form.triggerKeyword}"` : ""}
                    {" → "}
                    <span style={{ color: form.destinationColor }}>{form.destinationModule}</span>
                  </div>
                </div>
                <button
                  onClick={saveRule}
                  disabled={!form.name.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold border disabled:opacity-30"
                  style={{ background: "rgba(0,229,204,0.1)", borderColor: "rgba(0,229,204,0.3)", color: "#00e5cc" }}
                >
                  Save Rule
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ background: "rgba(0,229,204,0.04)", borderColor: "rgba(0,229,204,0.12)" }}>
            <Link2 className="w-6 h-6" style={{ color: "#1a3a38" }} />
          </div>
          <div className="text-[11px] font-mono" style={{ color: "#333" }}>No chain rules defined yet</div>
          <div className="text-[10px] text-center max-w-xs" style={{ color: "#222" }}>
            Create rules to automatically route module outputs to other modules in the pipeline
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const isExpanded = expandedId === rule.id;
            return (
              <motion.div key={rule.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl overflow-hidden" style={{ border: `1px solid ${rule.enabled ? "rgba(0,229,204,0.2)" : "rgba(255,255,255,0.06)"}`, background: rule.enabled ? "rgba(0,229,204,0.04)" : "#0a0a0a" }}>
                <div className="flex items-center gap-2 p-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: rule.enabled ? "#ccc" : "#444" }}>{rule.name}</div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#444" }}>
                        {rule.sourceModule === "*" ? "ANY" : rule.sourceModule}
                      </span>
                      <ArrowRight className="w-3 h-3" style={{ color: "#333" }} />
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${rule.destinationColor}15`, color: rule.destinationColor }}>
                        {rule.destinationModule}
                      </span>
                    </div>
                    {rule.execCount > 0 && (
                      <span className="text-[8px] font-mono" style={{ color: "#00e5cc" }}>{rule.execCount}x fired</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleRule(rule.id, !rule.enabled)}>
                      {rule.enabled
                        ? <ToggleRight className="w-4 h-4" style={{ color: "#00e5cc" }} />
                        : <ToggleLeft className="w-4 h-4" style={{ color: "#333" }} />
                      }
                    </button>
                    <button onClick={() => setExpandedId(isExpanded ? null : rule.id)}>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" style={{ color: "#444" }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: "#444" }} />}
                    </button>
                    <button onClick={() => deleteRule(rule.id)}>
                      <Trash2 className="w-3.5 h-3.5" style={{ color: "#333" }} />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="px-3 py-2.5 grid grid-cols-2 gap-2 text-[9px] font-mono" style={{ color: "#444" }}>
                        <div>Source: <span style={{ color: "#666" }}>{rule.sourceModule === "*" ? "Any Module" : rule.sourceModule}</span></div>
                        <div>Destination: <span style={{ color: rule.destinationColor }}>{rule.destinationModule}</span></div>
                        <div>Keyword: <span style={{ color: "#666" }}>{rule.triggerKeyword || "none"}</span></div>
                        <div>Created: <span style={{ color: "#666" }}>{new Date(rule.createdAt).toLocaleDateString()}</span></div>
                        <div>Exec count: <span style={{ color: "#00e5cc" }}>{rule.execCount}</span></div>
                        <div>Status: <span style={{ color: rule.enabled ? "#10b981" : "#e21227" }}>{rule.enabled ? "active" : "disabled"}</span></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, label, count, countColor = "#555" }: { active: boolean; onClick: () => void; label: string; count?: number; countColor?: string; }) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-3 text-[10px] font-bold tracking-widest transition-colors"
      style={{ color: active ? "#e21227" : "#444", borderBottom: active ? "2px solid #e21227" : "2px solid transparent" }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-[8px] font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: countColor }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ArsenalHubModal({ open, onOpenChange, onLaunch }: ArsenalHubModalProps) {
  const [tab, setTab] = useState<Tab>("modules");
  const [enabled, setEnabled] = useState<Set<ArsenalModuleId>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw) as ArsenalModuleId[]);
    } catch { /* ignore */ }
    return new Set(ARSENAL_MODULES.map((m) => m.id));
  });
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<PipelineHistoryEntry[]>(() => pipeline.getHistory());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [replayedId, setReplayedId] = useState<string | null>(null);
  const [chainRules] = useState(() => pipeline.getRules());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]));
  }, [enabled]);

  useEffect(() => {
    const unsub = pipeline.subscribeHistory(() => setHistory(pipeline.getHistory()));
    return unsub;
  }, []);

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

  function replay(entry: PipelineHistoryEntry) {
    pipeline.push({ source: entry.source, sourceColor: entry.sourceColor, label: entry.label, content: entry.content });
    setReplayedId(entry.id);
    setTimeout(() => setReplayedId(null), 1800);
  }

  function copyEntry(entry: PipelineHistoryEntry) {
    navigator.clipboard.writeText(entry.content);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filtered = ARSENAL_MODULES.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.desc.toLowerCase().includes(search.toLowerCase()) ||
      m.source.toLowerCase().includes(search.toLowerCase()) ||
      m.tag.toLowerCase().includes(search.toLowerCase()),
  );

  const allOn = enabled.size === ARSENAL_MODULES.length;
  const rulesCount = chainRules.length;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{ backdropFilter: "blur(10px)", background: "rgba(0,0,0,0.82)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
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
                {tab === "modules" && (
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border"
                    style={{ background: allOn ? "rgba(226,18,39,0.1)" : "rgba(0,229,204,0.08)", borderColor: allOn ? "rgba(226,18,39,0.3)" : "rgba(0,229,204,0.3)", color: allOn ? "#e21227" : "#00e5cc" }}
                  >
                    {allOn ? <Square className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                    {allOn ? "Deselect All" : "Select All"}
                  </button>
                )}
                {tab === "history" && history.length > 0 && (
                  <button
                    onClick={() => pipeline.clearHistory()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border"
                    style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear History
                  </button>
                )}
                <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center gap-0 px-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0a0a0a" }}>
              <TabBtn active={tab === "modules"} onClick={() => setTab("modules")} label="MODULES" count={ARSENAL_MODULES.length} />
              <TabBtn active={tab === "chain"} onClick={() => setTab("chain")} label="CHAIN BUILDER" count={rulesCount} countColor="#00e5cc" />
              <TabBtn active={tab === "history"} onClick={() => setTab("history")} label="PIPELINE HISTORY" count={history.length} countColor="#00e5cc" />
              <TabBtn active={tab === "mission"} onClick={() => setTab("mission")} label="MISSION CONTROL" />
            </div>

            {/* Search (modules tab only) */}
            {tab === "modules" && (
              <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search modules by name, tag, or source…"
                  className="w-full bg-transparent border rounded-lg px-3 py-2 text-[12px] outline-none font-mono"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "#ccc" }}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {tab === "modules" && (
                  <motion.div key="modules" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }} className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filtered.map((mod) => {
                        const Icon = mod.icon;
                        const isEnabled = enabled.has(mod.id);
                        return (
                          <motion.div key={mod.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl p-3.5 flex flex-col gap-3 transition-all"
                            style={{ background: isEnabled ? mod.bg : "#0d0d0d", border: `1px solid ${isEnabled ? mod.border : "rgba(255,255,255,0.06)"}`, boxShadow: isEnabled ? `0 0 20px ${mod.glow}` : "none", opacity: isEnabled ? 1 : 0.55 }}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0" style={{ background: isEnabled ? mod.bg : "#111", borderColor: isEnabled ? mod.border : "rgba(255,255,255,0.08)" }}>
                                  <Icon style={{ color: isEnabled ? mod.color : "#444", width: 18, height: 18 }} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[12px] font-black" style={{ color: isEnabled ? mod.color : "#555" }}>{mod.name}</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(255,255,255,0.05)", color: "#555" }}>{mod.tag}</span>
                                  </div>
                                  <div className="text-[10px] mt-0.5" style={{ color: isEnabled ? "#888" : "#444" }}>{mod.subtitle}</div>
                                </div>
                              </div>
                              <button onClick={() => toggle(mod.id)} className="relative w-10 h-5 rounded-full transition-all flex-shrink-0 mt-1" style={{ background: isEnabled ? mod.color : "#222", boxShadow: isEnabled ? `0 0 10px ${mod.glow}` : "none" }}>
                                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: isEnabled ? "calc(100% - 18px)" : 2 }} />
                              </button>
                            </div>
                            <p className="text-[10px] leading-relaxed" style={{ color: isEnabled ? "#666" : "#3a3a3a" }}>{mod.desc}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono" style={{ color: "#333" }}>src: {mod.source}</span>
                              <button
                                onClick={() => { if (isEnabled) { onLaunch(mod.id); onOpenChange(false); } }}
                                disabled={!isEnabled}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30"
                                style={{ background: mod.bg, border: `1px solid ${mod.border}`, color: mod.color }}
                              >
                                <ExternalLink className="w-3 h-3" /> Launch
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {tab === "chain" && (
                  <motion.div key="chain" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                    <ChainBuilderTab />
                  </motion.div>
                )}

                {tab === "mission" && (
                  <motion.div key="mission" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="p-4 space-y-4">
                    {/* Status grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "TOTAL MODULES", value: ARSENAL_MODULES.length, color: "#fff", icon: <Layers style={{ width: 14, height: 14 }} /> },
                        { label: "ACTIVE",         value: enabled.size,           color: "#10b981", icon: <Activity style={{ width: 14, height: 14 }} /> },
                        { label: "CHAIN RULES",    value: rulesCount,             color: "#00e5cc", icon: <GitMerge style={{ width: 14, height: 14 }} /> },
                        { label: "PIPELINE EVENTS",value: history.length,         color: "#fbbf24", icon: <BarChart2 style={{ width: 14, height: 14 }} /> },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg p-3 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                          <div className="flex items-center gap-1.5 mb-1" style={{ color: s.color }}>{s.icon}<span className="text-[9px] font-bold tracking-widest">{s.label}</span></div>
                          <div className="text-2xl font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Module status grid */}
                    <div>
                      <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#444" }}>MODULE STATUS</div>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {ARSENAL_MODULES.map(mod => {
                          const Icon = mod.icon;
                          const isOn = enabled.has(mod.id);
                          const lastEvent = history.find(h => h.source === mod.name || h.source.toUpperCase() === mod.name.toUpperCase());
                          return (
                            <div key={mod.id} className="flex items-center gap-2.5 p-2.5 rounded-lg border transition-all"
                              style={{ borderColor: isOn ? mod.border : "rgba(255,255,255,0.05)", background: isOn ? mod.bg : "rgba(255,255,255,0.01)" }}>
                              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: isOn ? mod.bg : "#111" }}>
                                <Icon style={{ width: 12, height: 12, color: isOn ? mod.color : "#333" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold truncate" style={{ color: isOn ? mod.color : "#444" }}>{mod.name}</div>
                                <div className="text-[8px] font-mono" style={{ color: "#333" }}>{lastEvent ? `last: ${lastEvent.label.slice(0,20)}` : "no activity"}</div>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isOn ? "#10b981" : "#222" }} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent pipeline events */}
                    <div>
                      <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#444" }}>RECENT PIPELINE EVENTS</div>
                      {history.length === 0 ? (
                        <div className="text-center py-6 text-[10px]" style={{ color: "#333" }}>No pipeline events yet — use modules to generate output</div>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {history.slice(0, 10).map(entry => (
                            <div key={entry.id} className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: entry.sourceColor }} />
                              <span className="text-[9px] font-bold font-mono" style={{ color: entry.sourceColor }}>{entry.source}</span>
                              <ArrowRight style={{ width: 10, height: 10, color: "#333", flexShrink: 0 }} />
                              <span className="text-[9px] truncate flex-1" style={{ color: "#666" }}>{entry.label}</span>
                              <span className="text-[8px] font-mono flex-shrink-0" style={{ color: "#333" }}>{new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Module categories */}
                    <div>
                      <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#444" }}>MODULE CATEGORIES</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(ARSENAL_MODULES.map(m => m.tag))).map(tag => {
                          const count = ARSENAL_MODULES.filter(m => m.tag === tag && enabled.has(m.id)).length;
                          const total = ARSENAL_MODULES.filter(m => m.tag === tag).length;
                          return (
                            <div key={tag} className="px-2.5 py-1.5 rounded border text-[9px] font-bold tracking-widest"
                              style={{ borderColor: count > 0 ? "rgba(0,229,204,0.3)" : "rgba(255,255,255,0.07)", background: count > 0 ? "rgba(0,229,204,0.06)" : "rgba(255,255,255,0.02)", color: count > 0 ? "#00e5cc" : "#444" }}>
                              {tag} <span style={{ opacity: 0.6 }}>{count}/{total}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === "history" && (
                  <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }} className="p-4">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border" style={{ background: "rgba(0,229,204,0.04)", borderColor: "rgba(0,229,204,0.12)" }}>
                          <GitMerge className="w-6 h-6" style={{ color: "#1a3a38" }} />
                        </div>
                        <div className="text-[11px] font-mono" style={{ color: "#333" }}>No pipeline events yet</div>
                        <div className="text-[10px]" style={{ color: "#222" }}>Use Pipe buttons in any module to route output between modules</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {history.map((entry, idx) => (
                          <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                            className="rounded-xl p-3.5" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border" style={{ background: `${entry.sourceColor}10`, borderColor: `${entry.sourceColor}30` }}>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.sourceColor }} />
                                <span className="text-[9px] font-bold font-mono" style={{ color: entry.sourceColor }}>{entry.source}</span>
                              </div>
                              <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: entry.destination ? "#00e5cc" : "#2a2a2a" }} />
                              {entry.destination ? (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border" style={{ background: `${entry.destinationColor}10`, borderColor: `${entry.destinationColor}30` }}>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.destinationColor ?? "#555" }} />
                                  <span className="text-[9px] font-bold font-mono" style={{ color: entry.destinationColor ?? "#555" }}>{entry.destination}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                                  <span className="text-[9px] font-mono" style={{ color: "#333" }}>pending</span>
                                </div>
                              )}
                              <div className="ml-auto flex flex-col items-end gap-0.5">
                                <span className="text-[8px] font-mono" style={{ color: "#333" }}>pushed {entry.timestamp}</span>
                                {entry.routedAt && <span className="text-[8px] font-mono" style={{ color: "#1a3a38" }}>routed {entry.routedAt}</span>}
                              </div>
                            </div>
                            <div className="mb-2">
                              <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "#555" }}>{entry.label}</span>
                            </div>
                            <div className="text-[10px] font-mono leading-relaxed mb-3 line-clamp-3" style={{ color: "#555", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                              {entry.content.slice(0, 200)}{entry.content.length > 200 ? "…" : ""}
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => replay(entry)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all"
                                style={{ background: replayedId === entry.id ? "rgba(0,229,204,0.15)" : "rgba(0,229,204,0.06)", borderColor: replayedId === entry.id ? "rgba(0,229,204,0.5)" : "rgba(0,229,204,0.2)", color: replayedId === entry.id ? "#00e5cc" : "#1a7a70" }}>
                                <RotateCcw style={{ width: 10, height: 10 }} />
                                {replayedId === entry.id ? "Pushed" : "Replay"}
                              </button>
                              <button onClick={() => copyEntry(entry)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all"
                                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "#444" }}>
                                {copiedId === entry.id
                                  ? <><CheckCheck style={{ width: 10, height: 10, color: "#4ade80" }} /> Copied</>
                                  : <><Copy style={{ width: 10, height: 10 }} /> Copy</>}
                              </button>
                              <div className="ml-auto text-[8px] font-mono" style={{ color: "#222" }}>{entry.content.length} chars</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#060606" }}>
              <div className="flex items-center gap-3 text-[9px] font-mono" style={{ color: "#2a2a2a" }}>
                <span>{ARSENAL_MODULES.length} modules</span>
                <span>·</span>
                <span>{pipeline.getRules().length} chain rules</span>
                <span>·</span>
                <span>{history.length} pipeline events</span>
              </div>
              <Brain className="w-3.5 h-3.5" style={{ color: "#1a1a1a" }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
