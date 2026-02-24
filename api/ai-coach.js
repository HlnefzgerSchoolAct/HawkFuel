// Vercel Serverless Function for AI Nutrition Coach
// Uses Hack Club's AI proxy (OpenRouter) with full user context for personalized advice

const coachRateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = coachRateLimitMap.get(ip);

  if (!userLimit || now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    coachRateLimitMap.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil(
      (userLimit.windowStart + RATE_LIMIT_WINDOW - now) / 1000,
    );
    return { allowed: false, remaining: 0, retryAfter };
  }

  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - userLimit.count };
}

const SYSTEM_PROMPT = `You are a highly knowledgeable nutrition coach and a trusted friend who happens to be an expert in food and nutrition. You have full context about this user from their NutriNote+ app, including their profile, today's foods, calorie progress, macros, goals, weekly history, and weight trend.

PERSONALITY & TONE:
- Use their name naturally when you know it. Write like you're chatting with someone you've been helping for a while.
- Be warm, conversational, and genuinely supportive. Vary your sentence lengths; avoid robotic patterns.
- Reference their data concretely: "your oatmeal this morning," "your 8-day streak," "since you're under on protein..."
- Skip generic openers like "I'd be happy to help." Get straight to the point in a friendly way.
- Occasional encouragement or light humor is fine, but stay focused on actionable advice.

NUTRITION EXPERTISE:
- Draw on evidence-based nutrition: macronutrient roles (protein synthesis, satiety, fiber), glycemic index basics, meal composition, hydration, and practical food swaps.
- Address common myths vs evidence when relevant (e.g., meal timing for weight loss, "starvation mode," late-night eating).
- Cover hunger management, balanced plates, and micronutrient considerations when their goals or data suggest it.
- When topics touch medical conditions, eating disorders, or diagnosis, suggest they consult a healthcare provider.

RESPONSE STYLE:
- Be concise by default (2-4 paragraphs) but expand when the topic deserves depth.
- Prioritize actionable, specific advice over generic tips. Use their actual foods, goals, and progress.
- If they haven't logged much yet, encourage them and give practical first steps.
- When the question is simple, be brief. When it's complex or they're seeking understanding, explain more fully.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  const startTime = Date.now();
  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";

  const rateCheck = checkRateLimit(clientIP);
  res.setHeader("X-RateLimit-Remaining", rateCheck.remaining);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: "Too many coach requests. Please wait a few minutes.",
      code: "RATE_LIMITED",
      retryAfter: rateCheck.retryAfter,
    });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    console.error("[ERROR] Missing OPENROUTER_API_KEY");
    return res.status(500).json({ error: "Server configuration error", code: "SERVER_CONFIG_ERROR" });
  }

  try {
    const { message, userContext, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required", code: "MISSING_INPUT" });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({ error: "Message cannot be empty", code: "EMPTY_INPUT" });
    }
    if (trimmedMessage.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)", code: "INPUT_TOO_LONG" });
    }

    const contextStr = userContext && typeof userContext === "object"
      ? JSON.stringify(userContext, null, 0)
      : "{}";
    const systemContent = SYSTEM_PROMPT + "\n\nUser context:\n" + contextStr;

    const MAX_HISTORY_MESSAGES = 10;
    const MAX_MSG_CHARS = 500;
    const historyArr = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-MAX_HISTORY_MESSAGES)
      : [];
    const truncatedHistory = historyArr.map((m) => {
      if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
        const content = m.content.length > MAX_MSG_CHARS ? m.content.slice(0, MAX_MSG_CHARS) + "…" : m.content;
        return { role: m.role, content };
      }
      return null;
    }).filter(Boolean);

    const chatMessages = [
      { role: "system", content: systemContent },
      ...truncatedHistory,
      { role: "user", content: trimmedMessage },
    ];

    const refererUrl = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "https://nutrinoteplus.vercel.app";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + openrouterKey,
        "Content-Type": "application/json",
        "HTTP-Referer": refererUrl,
        "X-Title": "NutriNote+",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: chatMessages,
        temperature: 0.75,
        max_tokens: 1536,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return res.status(429).json({ error: "AI service rate limited. Please wait.", code: "API_RATE_LIMITED" });
      }
      if (status === 401) {
        return res.status(401).json({ error: "Authentication failed", code: "AUTH_ERROR" });
      }
      return res.status(502).json({ error: "AI service temporarily unavailable", code: "API_ERROR" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: "AI returned empty response", code: "EMPTY_RESPONSE" });
    }

    const duration = Date.now() - startTime;
    console.log("[INFO] Coach response in " + duration + "ms");

    return res.status(200).json({ reply, responseTime: duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out", code: "TIMEOUT" });
    }
    console.error("[ERROR] " + error.message + " after " + duration + "ms");
    return res.status(500).json({ error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" });
  }
}
