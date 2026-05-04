import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/context/summarize", async (req, res) => {
  try {
    const body = req.body as {
      messages?: { role: string; content: string }[];
      language?: string;
    };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const language = body.language ?? "en";
    if (messages.length === 0) {
      return res.json({ summary: "", originalCount: 0 });
    }
    const transcript = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content.slice(0, 1500)}`)
      .join("\n\n");

    const langNote = language === "ar" ? "Write the summary in Arabic." : "Write the summary in English.";

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `You are a context compression engine. Compress a conversation into a dense, information-preserving summary that a future AI session can use to continue seamlessly.

RULES:
- Keep ALL facts, decisions, code, credentials, file paths, URLs, IPs, CVEs, and conclusions
- Use a structured bullet list format grouped by topic
- Preserve technical accuracy — no approximations
- Include the final state of any ongoing work
- ${langNote}
- Be maximally dense: every word must carry information
- Mark the most recent context clearly so the AI knows where things stand`,
        },
        { role: "user", content: transcript },
      ],
    });

    const summary = completion.choices?.[0]?.message?.content ?? "";
    return res.json({ summary, originalCount: messages.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "summarize failed";
    return res.status(500).json({ error: message });
  }
});

export default router;
