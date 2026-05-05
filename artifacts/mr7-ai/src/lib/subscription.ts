export type SubscriptionTier = "free" | "starter" | "professional" | "elite";

export type Subscription = {
  tier: SubscriptionTier;
  activatedAt: number | null;
  expiresAt: number | null;
  tokensUsed: number;
  activationCode: string | null;
};

export const TIER_TOKENS: Record<SubscriptionTier, number> = {
  free: 10_000,
  starter: 300_000,
  professional: 1_500_000,
  elite: 3_000_000,
};

export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
  elite: "Elite",
};

export const TIER_PRICES: Record<SubscriptionTier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 25, yearly: 20 },
  professional: { monthly: 90, yearly: 72 },
  elite: { monthly: 150, yearly: 120 },
};

export const TIER_ORDER: Record<SubscriptionTier, number> = {
  free: 0,
  starter: 1,
  professional: 2,
  elite: 3,
};

export function tierAtLeast(current: SubscriptionTier, required: SubscriptionTier): boolean {
  return TIER_ORDER[current] >= TIER_ORDER[required];
}

const ADMIN_SECRET = "CHATGPT-OWNER-2026";

export function generateActivationCode(tier: SubscriptionTier, days: number): string {
  const expiry = Date.now() + days * 86_400_000;
  const raw = `${tier}|${expiry}|${ADMIN_SECRET}`;
  const encoded = btoa(raw).replace(/=/g, "");
  return encoded.toUpperCase().slice(0, 32);
}

export function verifyActivationCode(code: string): { tier: SubscriptionTier; expiresAt: number } | null {
  try {
    const padded = code.toLowerCase() + "=".repeat((4 - (code.length % 4)) % 4);
    const decoded = atob(padded);
    const parts = decoded.split("|");
    if (parts.length !== 3) return null;
    const [tier, expiryStr, secret] = parts;
    if (secret !== ADMIN_SECRET) return null;
    const expiresAt = parseInt(expiryStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
    if (!["free", "starter", "professional", "elite"].includes(tier)) return null;
    return { tier: tier as SubscriptionTier, expiresAt };
  } catch {
    return null;
  }
}

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_SECRET;
}

export const INITIAL_SUBSCRIPTION: Subscription = {
  tier: "free",
  activatedAt: null,
  expiresAt: null,
  tokensUsed: 0,
  activationCode: null,
};

export const PLAN_FEATURES: Record<SubscriptionTier, string[]> = {
  free: [
    "10,000 tokens / month",
    "CHAT-GPT Fast model",
    "Basic AI chat",
    "5 messages context",
  ],
  starter: [
    "300K tokens / month",
    "All 5 AI models",
    "Max 8K tokens per request",
    "Up to 5 agent loops",
    "3 files per session",
    "Standard processing speed",
    "AI Chat & Code Generation",
    "AI Image Generator",
    "File & Document Upload (OCR)",
    "7-Day Refund Window",
  ],
  professional: [
    "1.5M tokens / month",
    "All 5 AI models",
    "Max 32K tokens per request",
    "Up to 15 agent loops",
    "15 files per session",
    "Faster processing speed",
    "Agent IDE — Cursor-style Editing",
    "Dark Web Intelligence Search",
    "Shell Security Code Generator",
    "AI Image Generator (Unrestricted)",
    "Priority support",
    "7-Day Refund Window",
  ],
  elite: [
    "3M tokens / month",
    "All 5 AI models",
    "Unlimited practical context",
    "Deep reasoning enabled",
    "Unlimited agent loops",
    "Priority queue processing",
    "Agent IDE with Cursor-style editing",
    "Dark Web Intelligence Search",
    "Shell Security Code Generator",
    "AI Image Generator (Unrestricted)",
    "Advanced code obfuscation",
    "7-Day Refund Window",
  ],
};
