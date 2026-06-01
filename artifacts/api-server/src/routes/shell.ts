import { Router } from "express";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import type { IncomingMessage } from "http";
import type { WebSocket as WS } from "ws";

const execAsync = promisify(exec);
const router = Router();

const WORKSPACE = process.cwd();

const BLOCKED = [
  /rm\s+-rf\s+\//,
  /:\(\)\s*\{.*\}\s*;/,
  /mkfs/,
  /dd\s+if=\/dev\/zero/,
  />\s*\/dev\/sd/,
  /chmod\s+-R\s+777\s+\//,
  /shutdown/,
  /reboot/,
  /halt/,
];

function isSafe(cmd: string): boolean {
  return !BLOCKED.some(p => p.test(cmd));
}

router.post("/shell/exec", async (req, res) => {
  const { command, cwd } = req.body as { command?: string; cwd?: string };
  if (!command) { res.status(400).json({ error: "command required" }); return; }
  if (!isSafe(command)) { res.status(403).json({ error: "Command blocked for safety", stdout: "", stderr: "Blocked" }); return; }

  const resolvedCwd = cwd ?? WORKSPACE;

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: resolvedCwd,
      timeout: 30_000,
      maxBuffer: 2 * 1024 * 1024,
      env: { ...process.env, TERM: "xterm-256color" },
    });
    res.json({ stdout: stdout ?? "", stderr: stderr ?? "", success: true, exitCode: 0 });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string; code?: number };
    res.json({
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message ?? "Unknown error",
      success: false,
      exitCode: err.code ?? 1,
    });
  }
});

// WebSocket terminal handler — called from index.ts on WS upgrade
export function handleTerminalSocket(ws: WS, _req: IncomingMessage) {
  let shellProcess: ReturnType<typeof spawn> | null = null;

  function startShell(cwd: string) {
    if (shellProcess) { try { shellProcess.kill(); } catch {} }

    shellProcess = spawn("/bin/bash", ["--norc", "--noprofile"], {
      cwd,
      env: {
        ...process.env,
        TERM: "xterm-256color",
        PS1: "\\[\\033[01;32m\\]kali@mr7\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ ",
        HOME: process.env.HOME ?? "/root",
        PATH: process.env.PATH ?? "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    shellProcess.stdout?.on("data", (data: Buffer) => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: "output", data: data.toString() }));
    });
    shellProcess.stderr?.on("data", (data: Buffer) => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: "output", data: data.toString() }));
    });
    shellProcess.on("exit", (code) => {
      if (ws.readyState === 1) ws.send(JSON.stringify({ type: "exit", code: code ?? 0 }));
    });

    ws.send(JSON.stringify({ type: "ready", cwd }));
  }

  ws.on("message", (raw: Buffer | string) => {
    try {
      const msg = JSON.parse(raw.toString()) as { type: string; data?: string; cwd?: string; cols?: number; rows?: number };
      if (msg.type === "start") {
        startShell(msg.cwd ?? WORKSPACE);
      } else if (msg.type === "input" && shellProcess?.stdin) {
        shellProcess.stdin.write(msg.data ?? "");
      } else if (msg.type === "resize") {
        // PTY resize not supported without node-pty, no-op
      } else if (msg.type === "kill") {
        shellProcess?.kill();
        shellProcess = null;
      }
    } catch {}
  });

  ws.on("close", () => {
    try { shellProcess?.kill(); } catch {}
    shellProcess = null;
  });
}

export default router;
