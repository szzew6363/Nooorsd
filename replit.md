# mr7.ai

Dark cybersecurity AI chat (KaliGPT branding). Pixel-perfect to user screenshots, Arabic communication, no emojis. Real LLM brain via Replit AI Integrations proxy.

## Recent additions (Apr 2026)

- **AI Image Generator** (new tool): `POST /api/image` (`artifacts/api-server/src/routes/image.ts`) calls `openai.images.generate` with model `gpt-image-1`, returns base64 PNG data URLs. Frontend tool `AIImageGenerator` in `UtilityToolModal.tsx` (prompt + size + quality selectors, generates and downloads). Registered in `ALL_TOOLS` (Generators, pink-400) and `ADDITIONAL_TOOLS` in Sidebar — total now 103 tools.
- **Voice Chat with AI** (`VoiceChatModal.tsx`): full duplex voice conversation overlay using Web Speech API (`SpeechRecognition` + `speechSynthesis`). Press the round phone button to start → listens (lang follows `state.settings.language` ar-SA / en-US) → sends transcribed turn to `/api/chat` via `streamChat` with full persona/memory/customInstructions context → speaks the reply → loops automatically. Mute toggle suppresses TTS. Triggered from a new Phone icon button in the ChatView toolbar.
- **Vision Capture** (`VisionCaptureModal.tsx`): screen-share OR webcam (rear camera preferred via `facingMode: "environment"`). Uses `getDisplayMedia` / `getUserMedia`, renders live `<video>`, snaps a downscaled (max 1280px) PNG canvas frame, posts it to new `POST /api/vision` endpoint (`gpt-5-mini` with `image_url` content part) along with a user prompt. Result can be downloaded or pushed back into the chat input. Two toolbar buttons: MonitorPlay (screen) and Camera (camera). Honest about phone control — browsers can't drive a phone, but this lets the user point their phone camera at anything and ask the model.
- **i18n**: `artifacts/mr7-ai/src/lib/i18n.ts` exposes `useT()` with a full en/ar dictionary (~210 keys across sidebar, top bar, chat, settings, tools hub, engines, modals, toasts). When `state.settings.language === "ar"` the store auto-sets `dir=rtl` + `<html lang="ar">`. Wired through TopBar, Sidebar, ChatView, ToolsHubModal, SettingsModal, App (konami toast).
- **Engines all-on by default**: store initial `settings` flips `stmHedge / stmDirect / stmCuriosity / autoTune / councilFusion / councilScoring` to true.
- **FUSION mode**: new chat mode pill that runs the council with `FUSION_COUNCIL_CONFIG` (mode:"all", every brain, fusion+scoring on) — exported from `CouncilSettingsModal.tsx`. ChatView routes "fusion" through `callCouncilWith(history, FUSION_COUNCIL_CONFIG)` so Parseltongue/AutoTune/STM/Council all run in parallel and merge.
- **SettingsModal**: rewritten on top of `useT()`, separate ENGINE_TOGGLES section + an "Activate all engines" button.

## Stack

- pnpm monorepo, two artifacts: `artifacts/mr7-ai` (web), `artifacts/api-server` (api)
- React + Vite + Tailwind v4
- framer-motion, lucide-react, shadcn/ui
- AI brain: OpenAI-compatible client through Replit AI Integrations (`@workspace/integrations-openai-ai-server`)
- Persisted local state in `localStorage` key `mr7-ai-state-v2` (legacy `v1` auto-hydrated)

## Architecture

- Frontend calls `/api/chat`, `/api/title`, `/api/translate`, `/api/enhance`, `/api/council`, `/api/council/brains` directly (api-server is registered as kind=api, paths=["/api"]).
- `chat.ts` builds the system prompt per request from MODEL_PROFILES + PERSONA_PROFILES + ETHICS + memory[] + customInstructions + language and streams SSE chunks with gpt-5.4.
- `council.ts` runs a **105-brain** council (55 specialists + 50 famous LLM personas — GPT-4/4o/4-Turbo/o1/o3, Claude 3 Opus/Sonnet/Haiku/3.5 Sonnet, Gemini 1.5 Pro/Flash/Ultra/Gemma/Gemma 2, Grok/Grok-1.5, DeepSeek V3/R1, Llama 3 70B/8B/Llama 2/Code Llama, Qwen 2/1.5/Max, GLM-3/4, Kimi, MiniMax, Baichuan 2, Yi-34B, Mistral Large/Medium/Small/Mixtral 8x7B/8x22B, Command R/R+/Aya, Falcon 180B/40B, DBRX, Jurassic-2, Inflection-2, Phi-2/3, Orca, StableLM, RWKV, Amazon Titan). Each brain = gpt-5-nano, 400 tok max, with a system prompt that channels that specialty/model's voice. Parallel execution via `Promise.all` chunked at concurrency 12 to respect rate limits. Auto-router (gpt-5-nano, 1200 tok budget) picks N brains, mixing categories and pulling 1-2 AI Model personas when their distinct voice adds value. After parallel phase, gpt-5.4 synthesizer combines them into one answer. Streams events: `convene` → `brain_start/chunk/done/error` (per brain) → `synthesize_start` → `synthesis_chunk` → `done`.
- Title gen uses gpt-5-nano; translate / enhance use gpt-5-mini.
- No DB. Chats, memory, snippets, folders, settings, theme persist in browser only.

## Theme

| Surface       | Hex        |
| ------------- | ---------- |
| Background    | `#080808`  |
| Sidebar       | `#0d0d0d`  |
| Card          | `#161616`  |
| Signature red | `#e21227`  |
| Borders       | `#1f1f1f` / `#262626` |

10 accent colors: crimson · midnight · emerald · amber · violet · cyan · rose · lime · orange · slate.

## Important files

- `artifacts/api-server/src/routes/chat.ts` — SSE streaming endpoints + system-prompt builder.
- `artifacts/api-server/src/routes/council.ts` — 105 `COUNCIL_BRAINS` across Reasoning(10), Technology(10), Security(10), Business(8), Creative(5), Knowledge(7), Practical(5), AI Models(50). Endpoints: `POST /api/council` (SSE) + `POST /api/council/brains` (list). Concurrency-limited (12 in flight). Smart router prompt mixes categories + AI personas.
- `artifacts/mr7-ai/src/lib/store.tsx` — single reducer + persisted state (v2). Includes `chats`, `memory[]`, `customInstructions`, `compareModels`, `folders`, `archived`, `tags`, `settings.{language,density,showTokenMeter,autoTitle,...}`. `ChatMsg.council?: CouncilPayload` carries seat statuses + per-brain content + synthesis for council messages.
- `artifacts/mr7-ai/src/lib/chat-client.ts` — SSE parser, `streamChat`, `streamCouncil`, `generateTitle`, `translateText`, `enhancePrompt`, `estimateTokens`.
- `artifacts/mr7-ai/src/lib/ai-config.tsx` — `AI_MODELS` (15) + `PERSONAS` (16, includes Pentester, Defender, OSINT, Malware, Bug Bounty, Red Team, CTF, Mentor, Researcher, Threat Intel, Exploit Dev, DevSecOps, Crypto, SOC, Purple Team).
- `artifacts/mr7-ai/src/lib/council-brains.tsx` — `COUNCIL_BRAIN_META` (105 entries with icon + color + category + blurb), `defaultAutoBrains()`, `COUNCIL_CATEGORIES`, `COUNCIL_PRESETS` (8 quick-pick combos: AI Pantheon, OpenAI Stack, Open Source All-Stars, Reasoning Beasts, Speed Demons, Code Squad, Arabic Strong, Cyber War Room). Mirrors backend brains by id.
- `artifacts/mr7-ai/src/components/CouncilCard.tsx` — renders the live council card inside an assistant message: brain grid with status dots (idle / thinking / done / error), expandable per-brain content, and the streamed synthesis below.
- `artifacts/mr7-ai/src/components/modals/CouncilSettingsModal.tsx` — full brain picker. 3 modes: Auto (router picks ~N up to 30), Manual (user picks), All (every brain). Quick-preset chips, search, category bulk-select, max-brains slider.
- `artifacts/mr7-ai/src/components/Sidebar.tsx` — chat list, AI model picker, Quick panels grid (Search / Memory / Bookmarks / Compare), pinned tools, snippets, account.
- `artifacts/mr7-ai/src/components/TopBar.tsx` — model dropdown, Tools Hub, Buy Tokens, notifications, theme, tokens popover.
- `artifacts/mr7-ai/src/components/ChatView.tsx` — real `/api/chat` SSE streaming, stop button, persona popover, mode pills (chat/code/web/council), `callCouncil()` runs `streamCouncil` + dispatches `PATCH_MSG` with evolving `council` payload, prompt enhancer, translate input/message, slash commands (/cve /sigma /yara /threat /translate /scan /exploit ...), token meter, auto-title, save-to-memory action, branch/bookmark/edit/clear/share/export (md+json+pdf).
- `artifacts/mr7-ai/src/components/CompareView.tsx` — split-pane two-model side-by-side prompt streamer.
- `artifacts/mr7-ai/src/components/modals/MemoryModal.tsx` — long-term memory + custom instructions editor.
- `artifacts/mr7-ai/src/components/modals/BookmarksModal.tsx` — list/jump/copy/remove bookmarked messages across all chats.
- `artifacts/mr7-ai/src/components/modals/SearchModal.tsx` — full-text search across chats with highlighted snippets.
- `artifacts/mr7-ai/src/components/modals/SettingsModal.tsx` — language picker (en/ar), density (compact/comfortable/spacious), 10-accent grid, 8 toggles, export-all + reset.
- `artifacts/mr7-ai/src/components/CommandPalette.tsx` — Cmd+K palette listing all models, personas, and actions.
- `artifacts/mr7-ai/src/components/modals/UtilityToolModal.tsx` — 63 working tools across 6 categories (Recon, Offensive, Crypto, Generators, Utilities, AI Studio). 12 new cybersecurity educational tools added (May 2026): Zero-Day Exploits, RaaS Architecture, Supply Chain Attacks, Fileless Malware, Autonomous Offensive AI, Quantum Attacks, Bio-Digital Threats, AI Model Poisoning, Kali WiFi Hacking, Kali MITM Attack, Kali Metasploit, Kali SQLi Guide — all AI-powered with full Arabic educational prompts.
- `artifacts/mr7-ai/src/components/modals/MalwareToolsModal.tsx` — 10 tools (was 8): added Info Stealer (STEAL) and Ransomware Engine (RANSOM) to the Malware Arsenal modal. Both were previously inject-payload-only; now have full configurable builder UI with OS/language/extra selectors.
- `artifacts/mr7-ai/src/components/modals/ToolsHubModal.tsx` — searchable categorized grid with pin-to-favorites.

## Keyboard shortcuts

- `Cmd/Ctrl+K` command palette · `Cmd/Ctrl+N` new chat · `Cmd/Ctrl+F` search · `?` shortcuts modal
- `Cmd/Ctrl+Shift+M` memory · `Cmd/Ctrl+Shift+B` bookmarks · `Cmd/Ctrl+Shift+C` compare · `Cmd/Ctrl+Shift+T` tools hub

## Conventions

- Arabic communication. NO emojis anywhere.
- All buttons MUST be functional — no placeholders.
- Tools live in `UtilityToolModal.tsx`. To add one: extend the `UtilityTool` union, add an entry to `ALL_TOOLS`, render a component, and add it to `ADDITIONAL_TOOLS` in `Sidebar.tsx`.
- Models / personas: edit only `lib/ai-config.tsx`; consumers (TopBar, Sidebar, CommandPalette, ChatView, MemoryModal, CompareView) auto-update.
- Theme accents: edit only `ACCENT_OPTIONS` in `lib/store.tsx` and the `accentMap` in the store useEffect.

## Verification

- `pnpm --filter @workspace/mr7-ai run typecheck` — must pass before declaring work done.
- Smoke test the brain: `curl -s -X POST "https://$REPLIT_DEV_DOMAIN/api/chat" -H 'content-type: application/json' -d '{"model":"KaliGPT v6 Fast","persona":null,"customInstructions":"","language":"en","memory":[],"messages":[{"role":"user","content":"ping"}]}'`

## Workflows

- `artifacts/mr7-ai: web` — Vite dev server.
- `artifacts/api-server: API Server` — Express SSE backend (port 8080, mounted at `/api`).
