import { Router } from "express";

const router = Router();

const MODEL_MAP: Record<string, string> = {
  medium:    "claude-3-5-haiku-20241022",
  high:      "claude-3-5-sonnet-20241022",
  xhigh:     "claude-3-7-sonnet-20250219",
  max:       "claude-opus-4-5",
  ultracode: "claude-opus-4-5",
};

const MAX_TOKENS: Record<string, number> = {
  medium:    4096,
  high:      8192,
  xhigh:     16000,
  max:       16000,
  ultracode: 32000,
};

const THINKING_BUDGET: Record<string, number> = {
  xhigh:     8000,
  max:       10000,
  ultracode: 16000,
};

router.post("/claude-code/stream", async (req, res) => {
  const apiKey = req.headers["x-anthropic-key"] as string | undefined;
  if (!apiKey || !apiKey.startsWith("sk-ant")) {
    res.status(401).json({ error: "مفتاح Anthropic API مطلوب (يبدأ بـ sk-ant-)" });
    return;
  }

  const {
    messages = [],
    mode = "xhigh",
    system = "",
    files = [] as { name: string; content: string }[],
  } = req.body as {
    messages: { role: string; content: string }[];
    mode: string;
    system: string;
    files: { name: string; content: string }[];
  };

  const model = MODEL_MAP[mode] ?? MODEL_MAP.xhigh;
  const maxTokens = MAX_TOKENS[mode] ?? 8192;
  const useThinking = mode === "xhigh" || mode === "max" || mode === "ultracode";
  const thinkingBudget = THINKING_BUDGET[mode] ?? 0;

  const systemParts: string[] = [];

  systemParts.push(
    `You are Claude Code — an autonomous AI coding agent. You operate in ${mode.toUpperCase()} mode.`,
    `You help with complex coding tasks, architecture decisions, debugging, and autonomous task execution.`,
    `When working on code, describe your actions clearly:`,
    `- When you read a file: start with "Read file: <filename>"`,
    `- When you write a file: start with "Write file: <filename>"`,
    `- When you run a command: start with "Bash: <command>"`,
    `- When you search: start with "Search: <query>"`,
    `- When you think: start with "Thinking: ..."`,
  );

  if (mode === "ultracode") {
    systemParts.push(
      `\nULTRACODE MODE ACTIVE: xhigh intelligence + dynamic workflow orchestration.`,
      `For every task: 1) Plan completely, 2) Break into sub-workflows, 3) Execute each autonomously, 4) Synthesize results.`,
      `No shortcuts. Maximum depth. Treat every problem as if it's your hardest.`,
    );
  } else if (mode === "max") {
    systemParts.push(`\nMAX MODE: Use maximum reasoning capability. Exhaustive analysis required.`);
  }

  if (system) systemParts.push(`\nAdditional instructions: ${system}`);

  if (files.length > 0) {
    systemParts.push(`\nVirtual workspace files:`);
    for (const f of files) {
      systemParts.push(`\n=== ${f.name} ===\n${f.content}\n`);
    }
  }

  const fullSystem = systemParts.join("\n");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  };

  if (useThinking && thinkingBudget > 0) {
    headers["anthropic-beta"] = "interleaved-thinking-2025-05-14";
  }

  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    stream: true,
    system: fullSystem,
    messages,
  };

  if (useThinking && thinkingBudget > 0) {
    body["thinking"] = { type: "enabled", budget_tokens: thinkingBudget };
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      let errMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed?.error?.message ?? errText;
      } catch {}
      res.write(`data: ${JSON.stringify({ type: "error", error: errMsg })}\n\n`);
      res.end();
      return;
    }

    const reader = upstream.body?.getReader();
    if (!reader) { res.end(); return; }

    const decoder = new TextDecoder();
    let buf = "";

    req.on("close", () => {
      try { reader.cancel(); } catch {}
    });

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          res.write(line + "\n\n");
        }
      }
    }

    res.write(`data: ${JSON.stringify({ type: "message_stop" })}\n\n`);
    res.end();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "error", error: msg })}\n\n`);
      res.end();
    }
  }
});

router.post("/claude-code/models", async (req, res) => {
  const apiKey = req.headers["x-anthropic-key"] as string | undefined;
  if (!apiKey?.startsWith("sk-ant")) {
    res.status(401).json({ error: "مفتاح API مطلوب" });
    return;
  }
  try {
    const r = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
