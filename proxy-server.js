const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration - allow from React dev server and production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://nutrinoteplus.hackclub.com"
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json({ limit: '5mb' }));

// Rate limiting: 30 requests per 15 minutes per IP
const nutritionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    error: "Too many nutrition requests. Please try again in a few minutes.",
    code: "RATE_LIMITED",
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Nutrition estimation endpoint - USDA first, AI fallback
app.post("/api/estimate-nutrition", nutritionLimiter, async (req, res) => {
  const startTime = Date.now();

  try {
    const { foodDescription } = req.body;

    // Input validation
    if (!foodDescription || typeof foodDescription !== "string") {
      return res.status(400).json({
        error: "Food description is required",
        code: "MISSING_INPUT",
      });
    }

    const trimmedDescription = foodDescription.trim();
    if (trimmedDescription.length === 0) {
      return res.status(400).json({
        error: "Food description cannot be empty",
        code: "EMPTY_INPUT",
      });
    }

    if (trimmedDescription.length > 200) {
      return res.status(400).json({
        error: "Food description too long (max 200 characters)",
        code: "INPUT_TOO_LONG",
      });
    }

    // Get API keys - need at least one
    const apiKey = process.env.OPENROUTER_API_KEY;
    const usdaKey = process.env.USDA_API_KEY;

    if (!apiKey && !usdaKey) {
      console.error("[ERROR] Missing both OPENROUTER_API_KEY and USDA_API_KEY");
      return res.status(500).json({
        error: "Server configuration error. Please contact support.",
        code: "SERVER_CONFIG_ERROR",
      });
    }

    // USDA nutrient mapping
    const NUTRIENT_MAP = { 1008: "calories", 1003: "protein", 1005: "carbs", 1004: "fat", 1079: "fiber", 1093: "sodium", 2000: "sugar", 1253: "cholesterol" };

    // Parse serving from description
    const servingMatch = trimmedDescription.match(/^([\d.]+)\s+(serving|servings|cup|cups|oz|ounce|ounces|tbsp|tsp|slice|slices|piece|pieces|g|gram|grams|lb|pound|pounds|medium|large|small)\s+(?:of\s+)?(.+)$/i);
    let foodName = trimmedDescription;
    let servingGrams = 100;

    if (servingMatch) {
      const amount = parseFloat(servingMatch[1]);
      const unit = servingMatch[2].toLowerCase();
      foodName = servingMatch[3].trim();
      const conv = { g: 1, gram: 1, grams: 1, oz: 28.35, ounce: 28.35, ounces: 28.35, cup: 240, cups: 240, tbsp: 15, tsp: 5, slice: 30, slices: 30, piece: 100, pieces: 100, serving: 150, servings: 150, medium: 150, large: 200, small: 100 };
      servingGrams = Math.round(amount * (conv[unit] || 100));
    }

    let nutrition = null;
    let source = "none";
    let usdaFoodName = null;

    // ── Strategy 1: Direct USDA search ──
    if (usdaKey) {
      try {
        console.log(`[USDA] Searching for: "${foodName}"`);
        const usdaUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
        usdaUrl.searchParams.set("query", foodName);
        usdaUrl.searchParams.set("api_key", usdaKey);
        usdaUrl.searchParams.set("pageSize", "3");
        usdaUrl.searchParams.set("dataType", "SR Legacy,Foundation");

        const usdaResp = await fetch(usdaUrl.toString());
        if (usdaResp.ok) {
          const usdaData = await usdaResp.json();
          if (usdaData.foods?.[0]?.foodNutrients) {
            const scale = servingGrams / 100;
            const raw = {};
            for (const n of usdaData.foods[0].foodNutrients) {
              const field = NUTRIENT_MAP[n.nutrientId || n.nutrientNumber];
              if (field && n.value != null) raw[field] = Math.round(n.value * scale * 10) / 10;
            }
            if (raw.calories > 0) {
              nutrition = raw;
              source = "usda";
              usdaFoodName = usdaData.foods[0].description;
              console.log(`[USDA] Direct match: ${usdaFoodName}`);
            }
          }
        }
      } catch (err) {
        console.error("[USDA] Direct search error:", err.message);
      }
    }

    // ── Strategy 2: AI-assisted USDA search ──
    if (!nutrition && usdaKey && apiKey) {
      try {
        console.log(`[AI+USDA] AI suggesting search term for: "${foodName}"`);
        const suggestResp = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://nutrinoteplus.hackclub.com", "X-Title": "NutriNote+" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Given a food description, return a simple common food name for USDA database search. Return ONLY the search term (1-4 words). Examples: 'grilled chicken breast' -> 'chicken breast cooked', 'Big Mac' -> 'hamburger double patty'" },
              { role: "user", content: trimmedDescription },
            ],
            temperature: 0.1, max_tokens: 50,
          }),
        });
        if (suggestResp.ok) {
          const suggestData = await suggestResp.json();
          const betterTerm = suggestData.choices?.[0]?.message?.content?.trim();
          if (betterTerm && betterTerm.length > 0 && betterTerm.length < 100 && betterTerm.toLowerCase() !== foodName.toLowerCase()) {
            console.log(`[AI] Suggested: "${betterTerm}"`);
            const usdaUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
            usdaUrl.searchParams.set("query", betterTerm);
            usdaUrl.searchParams.set("api_key", usdaKey);
            usdaUrl.searchParams.set("pageSize", "3");
            usdaUrl.searchParams.set("dataType", "SR Legacy,Foundation");
            const usdaResp = await fetch(usdaUrl.toString());
            if (usdaResp.ok) {
              const usdaData = await usdaResp.json();
              if (usdaData.foods?.[0]?.foodNutrients) {
                const scale = servingGrams / 100;
                const raw = {};
                for (const n of usdaData.foods[0].foodNutrients) {
                  const field = NUTRIENT_MAP[n.nutrientId || n.nutrientNumber];
                  if (field && n.value != null) raw[field] = Math.round(n.value * scale * 10) / 10;
                }
                if (raw.calories > 0) {
                  nutrition = raw;
                  source = "usda_ai_assisted";
                  usdaFoodName = usdaData.foods[0].description;
                  console.log(`[AI+USDA] Match: ${usdaFoodName}`);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("[AI+USDA] Error:", err.message);
      }
    }

    // ── Strategy 3: Full AI estimation (last resort) ──
    if (!nutrition && apiKey) {
      console.log(`[AI] Falling back to AI estimation for: "${trimmedDescription}"`);

      const apiUrl = "https://ai.hackclub.com/proxy/v1/chat/completions";
      const systemPrompt = `You are a nutrition expert. When given a food description, provide the nutritional information for that food. 
Always respond with a valid JSON object containing: calories (total kcal), protein (grams), carbs (grams), and fat (grams).
Use realistic USDA estimates. Format your response as JSON only, no other text.
Example: {"calories": 95, "protein": 0.5, "carbs": 25, "fat": 0.3}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nutrinoteplus.hackclub.com",
          "X-Title": "NutriNote+",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `What is the nutritional content of: ${trimmedDescription}? JSON format.` },
          ],
          temperature: 0.2,
          max_tokens: 200,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
        console.error(`[ERROR] AI API returned ${response.status}:`, errorData);

        const errorMessages = {
          401: { error: "Authentication failed.", code: "AUTH_ERROR" },
          403: { error: "Access forbidden.", code: "FORBIDDEN" },
          429: { error: "AI service rate limited. Please wait.", code: "API_RATE_LIMITED" },
          500: { error: "AI service temporarily unavailable.", code: "API_ERROR" },
          502: { error: "AI service is down.", code: "API_UNAVAILABLE" },
          503: { error: "AI service is overloaded.", code: "API_OVERLOADED" },
        };
        const errorInfo = errorMessages[response.status] || { error: errorData.error?.message || `API error (${response.status})`, code: "API_ERROR" };
        return res.status(response.status >= 500 ? 502 : response.status).json(errorInfo);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            nutrition = {
              calories: Math.round(parsed.calories || parsed.cal || 0),
              protein: Math.round((parsed.protein || 0) * 10) / 10,
              carbs: Math.round((parsed.carbs || parsed.carbohydrates || 0) * 10) / 10,
              fat: Math.round((parsed.fat || 0) * 10) / 10,
            };
            source = "ai_estimate";
          } catch (parseErr) {
            console.error("[ERROR] JSON parse failed:", parseErr.message);
          }
        }
      }
    }

    if (!nutrition) {
      return res.status(502).json({ error: "Could not estimate nutrition. Try rephrasing.", code: "NO_DATA" });
    }

    if (nutrition.calories < 0 || nutrition.protein < 0 || nutrition.carbs < 0 || nutrition.fat < 0) {
      return res.status(502).json({ error: "Invalid nutrition values.", code: "INVALID_VALUES" });
    }

    const duration = Date.now() - startTime;
    console.log(`[INFO] Nutrition for "${trimmedDescription}" from ${source} in ${duration}ms`);

    return res.json({
      nutrition,
      source,
      usdaFoodName: usdaFoodName || undefined,
      cached: false,
      responseTime: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error.name === "AbortError") {
      console.error(`[ERROR] Request timeout after ${duration}ms`);
      return res.status(504).json({
        error: "Request timed out. The AI service is slow. Please try again.",
        code: "TIMEOUT",
      });
    }

    console.error(
      `[ERROR] Unexpected error after ${duration}ms:`,
      error.message,
    );
    return res.status(500).json({
      error: "An unexpected error occurred. Please try again.",
      code: "UNEXPECTED_ERROR",
      details:
        process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
});

// Parse food for USDA - converts natural language into structured USDA query
app.post("/api/parse-food", nutritionLimiter, async (req, res) => {
  const { foodDescription, quantity, unit } = req.body || {};

  if (
    !foodDescription ||
    typeof foodDescription !== "string" ||
    !foodDescription.trim()
  ) {
    return res
      .status(400)
      .json({ error: "foodDescription is required", code: "MISSING_INPUT" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({
        error: "Server configuration error",
        code: "SERVER_CONFIG_ERROR",
      });
  }

  const trimmed = foodDescription.trim().slice(0, 200);

  const systemPrompt = `You are a USDA nutrition database expert. Convert food descriptions into optimized USDA FoodData Central search queries.

Respond ONLY with a valid JSON object — no prose, no markdown:
{
  "searchQuery": "primary USDA search query (2-5 words, USDA naming format)",
  "servingSizeGrams": <total weight in grams for the given quantity/unit>,
  "alternateQueries": ["backup query 1", "backup query 2"],
  "preferBranded": <true if this is clearly a packaged/branded food, false otherwise>
}

USDA naming conventions:
- Use comma-separated descriptors: "Chicken, breast, cooked, grilled"
- Prefer USDA-style names over colloquial names
- For generic foods: "Apple, raw" not "fresh apple"
- For cooked methods: append after food name
- Omit quantity/serving info from searchQuery

Serving size estimation (grams):
- 1 cup cooked rice ≈ 186g, 1 cup raw leafy greens ≈ 30g
- 1 oz = 28.35g, 1 tbsp oil ≈ 14g, 1 medium apple ≈ 182g
- 1 serving = estimate based on food type
- If unit is "g", use quantity directly`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      "https://ai.hackclub.com/proxy/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nutrinoteplus.hackclub.com",
          "X-Title": "NutriNote+",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Food: "${trimmed}" | Quantity: ${quantity ?? 1} | Unit: ${unit ?? "serving"}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 250,
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "AI service error", code: "API_ERROR" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content)
      return res
        .status(502)
        .json({ error: "Empty AI response", code: "EMPTY_RESPONSE" });

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      return res
        .status(502)
        .json({ error: "Could not parse AI response", code: "PARSE_ERROR" });

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return res
        .status(502)
        .json({ error: "Invalid JSON from AI", code: "PARSE_ERROR" });
    }

    const servingGrams = parseFloat(parsed.servingSizeGrams);
    return res.status(200).json({
      searchQuery: (parsed.searchQuery || trimmed).trim().slice(0, 100),
      servingSizeGrams:
        isFinite(servingGrams) && servingGrams > 0 ? servingGrams : 100,
      alternateQueries: Array.isArray(parsed.alternateQueries)
        ? parsed.alternateQueries.slice(0, 3).map(String)
        : [],
      preferBranded: Boolean(parsed.preferBranded),
    });
  } catch (error) {
    if (error.name === "AbortError")
      return res
        .status(504)
        .json({ error: "Request timed out", code: "TIMEOUT" });
    console.error("[parse-food] error:", error.message);
    return res
      .status(500)
      .json({ error: "Unexpected error", code: "UNEXPECTED_ERROR" });
  }
});

// USDA FoodData Central proxy - keeps USDA_API_KEY server-side
app.post("/api/usda-search", async (req, res) => {
  const { query, dataTypes, pageSize = 10 } = req.body || {};

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }

  const apiKey = process.env.USDA_API_KEY;
  const params = new URLSearchParams({
    query: query.trim(),
    pageSize: String(Math.min(Number(pageSize) || 10, 25)),
  });
  // USDA requires each dataType as a separate repeated parameter
  if (Array.isArray(dataTypes) && dataTypes.length > 0) {
    for (const dt of dataTypes) params.append("dataType", dt);
  }
  if (apiKey) params.set("api_key", apiKey);

  try {
    const upstream = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?${params}`,
      {
        headers: { Accept: "application/json" },
      },
    );

    if (!upstream.ok) {
      console.error("[usda-search] upstream error:", upstream.status);
      return res
        .status(upstream.status)
        .json({ error: "USDA API error", status: upstream.status });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("[usda-search] error:", error.message);
    return res.status(502).json({ error: "Failed to reach USDA API" });
  }
});

// Coach rate limiter
const coachRateLimitMap = new Map();
const COACH_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const COACH_RATE_LIMIT_MAX = 20;

function checkCoachRateLimit(ip) {
  const now = Date.now();
  const userLimit = coachRateLimitMap.get(ip);
  if (!userLimit || now - userLimit.windowStart > COACH_RATE_LIMIT_WINDOW) {
    coachRateLimitMap.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: COACH_RATE_LIMIT_MAX - 1 };
  }
  if (userLimit.count >= COACH_RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((userLimit.windowStart + COACH_RATE_LIMIT_WINDOW - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  userLimit.count++;
  return { allowed: true, remaining: COACH_RATE_LIMIT_MAX - userLimit.count };
}

const COACH_SYSTEM_PROMPT = `You are a highly knowledgeable nutrition coach and a trusted friend who happens to be an expert in food and nutrition. You have full context about this user from their NutriNote+ app, including their profile, today's foods, calorie progress, macros, goals, weekly history, and weight trend.

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

app.post("/api/ai-coach", nutritionLimiter, async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection?.remoteAddress || "unknown";

  const rateCheck = checkCoachRateLimit(clientIP);
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
    const { message, userContext, conversationHistory } = req.body || {};

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
    const systemContent = COACH_SYSTEM_PROMPT + "\n\nUser context:\n" + contextStr;

    const MAX_HISTORY_MESSAGES = 10;
    const MAX_MSG_CHARS = 500;
    const historyArr = Array.isArray(conversationHistory) ? conversationHistory.slice(-MAX_HISTORY_MESSAGES) : [];
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + openrouterKey,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NODE_ENV === "production"
          ? "https://nutrinoteplus.hackclub.com"
          : "http://localhost:3000",
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
    console.error("[ERROR] Coach: " + error.message + " after " + duration + "ms");
    return res.status(500).json({ error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" });
  }
});

// Legacy endpoint (deprecated) - redirect to new endpoint
app.post("/api/openrouter", nutritionLimiter, (req, res) => {
  console.warn("[WARN] Deprecated /api/openrouter endpoint called");
  res.status(410).json({
    error: "This endpoint is deprecated. Use /api/estimate-nutrition instead.",
    code: "DEPRECATED",
  });
});

// Photo rate limiter (lower limit for heavier requests)
const photoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: "Too many photo requests. Please try again in a few minutes.",
    code: "RATE_LIMITED",
    retryAfter: 15,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Photo food identification endpoint
app.post("/api/identify-food-photo", photoLimiter, async (req, res) => {
  const startTime = Date.now();

  try {
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      return res.status(400).json({
        error: "Image data is required (base64 JPEG)",
        code: "MISSING_INPUT",
      });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    if (base64Data.length > 4 * 1024 * 1024) {
      return res.status(400).json({
        error: "Image too large (max 3MB)",
        code: "IMAGE_TOO_LARGE",
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const usdaKey = process.env.USDA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server configuration error (missing AI key)", code: "SERVER_CONFIG_ERROR" });
    }
    // USDA key is optional - gracefully degrade to AI-only
    if (!usdaKey) {
      console.warn("[WARN] Missing USDA_API_KEY - will use AI estimation for photo nutrition");
    }

    // Step 1: Vision AI identification
    const visionPrompt = "You are a food identification expert. Analyze this food photo and identify each distinct food item visible.\n\nFor each food item, provide:\n- \"name\": A clear, common food name suitable for searching a nutrition database\n- \"estimatedServing\": The estimated serving size with a unit (e.g., \"6 oz\", \"1 cup\", \"150g\")\n\nRespond ONLY with a valid JSON object:\n{\"foods\": [{\"name\": \"food name\", \"estimatedServing\": \"amount unit\"}, ...]}\n\nIf no food is visible, respond with: {\"foods\": [], \"error\": \"No food detected\"}";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const visionResponse = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nutrinoteplus.hackclub.com",
        "X-Title": "NutriNote+",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
          ],
        }],
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!visionResponse.ok) {
      return res.status(502).json({ error: "AI vision service error", code: "VISION_ERROR" });
    }

    const visionData = await visionResponse.json();
    const visionContent = visionData.choices?.[0]?.message?.content;
    if (!visionContent) {
      return res.status(502).json({ error: "AI returned empty response", code: "EMPTY_RESPONSE" });
    }

    const jsonMatch = visionContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: "Could not parse food identification", code: "PARSE_ERROR" });
    }

    let identified;
    try {
      identified = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(502).json({ error: "Invalid food identification format", code: "PARSE_ERROR" });
    }

    if (!identified.foods || identified.foods.length === 0) {
      return res.json({
        foods: [],
        message: identified.error || "No food detected in the image.",
        responseTime: Date.now() - startTime,
      });
    }

    // Serving to grams conversion
    const parseServingToGrams = (str) => {
      const match = str.toLowerCase().trim().match(/^([\d.]+)\s*(.*)$/);
      if (!match) return 150;
      const amount = parseFloat(match[1]);
      const unit = match[2].trim();
      const conv = { g: 1, gram: 1, grams: 1, oz: 28.35, ounce: 28.35, cup: 240, cups: 240, tbsp: 15, tsp: 5, slice: 30, piece: 100, serving: 150, medium: 150, large: 200, small: 100 };
      return Math.round(amount * (conv[unit] || 150));
    };

    // USDA nutrient mapping
    const NUTRIENT_MAP = { 1008: "calories", 1003: "protein", 1005: "carbs", 1004: "fat", 1079: "fiber", 1093: "sodium", 2000: "sugar", 1253: "cholesterol" };

    // Step 2: USDA lookup for each food (if USDA key available)
    const results = await Promise.all(
      identified.foods.slice(0, 8).map(async (food) => {
        const servingGrams = parseServingToGrams(food.estimatedServing || "1 serving");
        const scale = servingGrams / 100;

        // Try USDA first (if key available)
        if (usdaKey) {
          try {
            const usdaUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
            usdaUrl.searchParams.set("query", food.name);
            usdaUrl.searchParams.set("api_key", usdaKey);
            usdaUrl.searchParams.set("pageSize", "1");
            usdaUrl.searchParams.set("dataType", "SR Legacy,Foundation");

            const usdaResp = await fetch(usdaUrl.toString());
            if (usdaResp.ok) {
              const usdaData = await usdaResp.json();
              if (usdaData.foods?.[0]?.foodNutrients) {
                const nutrition = {};
                for (const n of usdaData.foods[0].foodNutrients) {
                  const field = NUTRIENT_MAP[n.nutrientId || n.nutrientNumber];
                  if (field && n.value != null) nutrition[field] = Math.round(n.value * scale * 10) / 10;
                }
                if (nutrition.calories > 0) {
                  return { name: food.name, serving: food.estimatedServing, nutrition, source: "usda" };
                }
              }
            }
          } catch (e) {
            console.error(`[USDA] Error for ${food.name}:`, e.message);
          }
        }

        // Fallback to AI text estimation
        try {
          const fallbackResp = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://nutrinoteplus.hackclub.com", "X-Title": "NutriNote+" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You are a nutrition expert. Respond with JSON only: {\"calories\": N, \"protein\": N, \"carbs\": N, \"fat\": N}" },
                { role: "user", content: `Nutritional content of ${food.estimatedServing} of ${food.name}?` },
              ],
              temperature: 0.2,
              max_tokens: 200,
            }),
          });
          if (fallbackResp.ok) {
            const fbData = await fallbackResp.json();
            const fbContent = fbData.choices?.[0]?.message?.content;
            const fbMatch = fbContent?.match(/\{[\s\S]*\}/);
            if (fbMatch) {
              const parsed = JSON.parse(fbMatch[0]);
              return {
                name: food.name,
                serving: food.estimatedServing,
                nutrition: {
                  calories: Math.round(parsed.calories || 0),
                  protein: Math.round((parsed.protein || 0) * 10) / 10,
                  carbs: Math.round((parsed.carbs || 0) * 10) / 10,
                  fat: Math.round((parsed.fat || 0) * 10) / 10,
                },
                source: "ai_estimate",
              };
            }
          }
        } catch (e) {
          console.error(`[AI Fallback] Error for ${food.name}:`, e.message);
        }

        return { name: food.name, serving: food.estimatedServing, nutrition: null, source: "failed" };
      }),
    );

    const validResults = results.filter((r) => r.nutrition !== null);
    const duration = Date.now() - startTime;
    console.log(`[INFO] Photo identified ${validResults.length} foods in ${duration}ms`);

    return res.json({ foods: validResults, totalIdentified: identified.foods.length, responseTime: duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out", code: "TIMEOUT" });
    }
    console.error(`[ERROR] ${error.message} after ${duration}ms`);
    return res.status(500).json({ error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// USDA search endpoint
app.post("/api/search-usda", nutritionLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const { query, servingDescription } = req.body;
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required", code: "MISSING_INPUT" });
    }
    const usdaKey = process.env.USDA_API_KEY;
    if (!usdaKey) {
      return res.status(503).json({ error: "USDA service not configured", code: "USDA_NOT_CONFIGURED" });
    }

    const NUTRIENT_MAP = { 1008: "calories", 1003: "protein", 1005: "carbs", 1004: "fat", 1079: "fiber", 1093: "sodium", 2000: "sugar", 1253: "cholesterol" };
    const searchQuery = query.trim();

    // Parse serving to grams
    let servingGrams = 100;
    if (servingDescription) {
      const match = servingDescription.toLowerCase().trim().match(/^([\d.]+)\s*(.*)$/);
      if (match) {
        const amount = parseFloat(match[1]);
        const unit = match[2].trim();
        const conv = { g: 1, gram: 1, grams: 1, oz: 28.35, cup: 240, cups: 240, tbsp: 15, tsp: 5, slice: 30, piece: 100, serving: 150, medium: 150, large: 200, small: 100 };
        servingGrams = Math.round(amount * (conv[unit] || 100));
      }
    }

    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("api_key", usdaKey);
    url.searchParams.set("pageSize", "5");
    url.searchParams.set("dataType", "SR Legacy,Foundation");

    const usdaResp = await fetch(url.toString());
    if (!usdaResp.ok) {
      return res.status(502).json({ error: "USDA service unavailable", code: "USDA_ERROR" });
    }
    const usdaData = await usdaResp.json();
    if (!usdaData.foods || usdaData.foods.length === 0) {
      return res.json({ found: false, query: searchQuery, message: "No USDA results found", responseTime: Date.now() - startTime });
    }

    const bestMatch = usdaData.foods[0];
    const scale = servingGrams / 100;
    const nutrition = {};
    for (const n of bestMatch.foodNutrients) {
      const field = NUTRIENT_MAP[n.nutrientId || n.nutrientNumber];
      if (field && n.value != null) nutrition[field] = Math.round(n.value * scale * 10) / 10;
    }

    return res.json({
      found: true, query: searchQuery, nutrition,
      usdaFood: { fdcId: bestMatch.fdcId, description: bestMatch.description },
      source: "usda", responseTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error(`[ERROR] USDA search: ${error.message}`);
    return res.status(500).json({ error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "NutriNote+ AI Nutrition Proxy",
    version: "3.0.0",
    endpoints: {
      nutrition: "POST /api/estimate-nutrition (USDA-first, AI fallback)",
      coach: "POST /api/ai-coach (AI Nutrition Coach)",
      usdaSearch: "POST /api/search-usda",
      photoId: "POST /api/identify-food-photo",
      health: "GET /health",
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ NutriNote+ Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - POST /api/estimate-nutrition (USDA-first, AI fallback)`);
  console.log(`   - POST /api/ai-coach (AI Nutrition Coach)`);
  console.log(`   - POST /api/search-usda (direct USDA search)`);
  console.log(`   - POST /api/identify-food-photo (photo food ID)`);
  console.log(`   - GET  /health (health check)`);
});
