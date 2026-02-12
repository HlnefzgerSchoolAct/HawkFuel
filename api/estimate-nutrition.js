// Vercel Serverless Function for Nutrition Estimation
// Strategy: USDA FoodData Central FIRST, AI estimation as fallback
//
// Flow:
// 1. Parse food description to extract food name + serving info
// 2. Search USDA FoodData Central for the food
// 3. If USDA found: return authoritative USDA nutrition data
// 4. If USDA not found: use AI to suggest a better USDA search term, retry
// 5. If still not found: fall back to full AI nutrition estimation

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
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

// USDA nutrient ID -> field mapping
const USDA_NUTRIENT_MAP = {
  1008: "calories", 1003: "protein", 1005: "carbs", 1004: "fat",
  1079: "fiber", 1093: "sodium", 2000: "sugar", 1253: "cholesterol",
  1106: "vitaminA", 1162: "vitaminC", 1114: "vitaminD", 1109: "vitaminE",
  1185: "vitaminK", 1165: "vitaminB1", 1166: "vitaminB2", 1167: "vitaminB3",
  1175: "vitaminB6", 1178: "vitaminB12", 1177: "folate",
  1087: "calcium", 1089: "iron", 1090: "magnesium", 1095: "zinc", 1092: "potassium",
};

const parseNum = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return null;
  const num = parseFloat(val);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

function parseServingToGrams(servingStr) {
  if (!servingStr) return 100;
  const str = servingStr.toLowerCase().trim();
  const match = str.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return 100;
  const amount = parseFloat(match[1]);
  const unit = match[2].trim();
  const conversions = {
    "g": 1, "gram": 1, "grams": 1, "oz": 28.35, "ounce": 28.35, "ounces": 28.35,
    "cup": 240, "cups": 240, "tbsp": 15, "tablespoon": 15, "tablespoons": 15,
    "tsp": 5, "teaspoon": 5, "teaspoons": 5, "lb": 453.6, "pound": 453.6, "pounds": 453.6,
    "kg": 1000, "ml": 1, "l": 1000, "slice": 30, "slices": 30,
    "piece": 100, "pieces": 100, "serving": 150, "servings": 150,
    "medium": 150, "large": 200, "small": 100,
  };
  return Math.round(amount * (conversions[unit] || 100));
}

function parseFoodDescription(description) {
  const str = description.trim();
  const match = str.match(/^([\d.]+)\s+(serving|servings|cup|cups|oz|ounce|ounces|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|slice|slices|piece|pieces|g|gram|grams|lb|pound|pounds|kg|ml|l|medium|large|small)\s+(?:of\s+)?(.+)$/i);
  if (match) return { serving: match[1] + " " + match[2], foodName: match[3].trim() };
  const simpleMatch = str.match(/^(?:a|an|one)\s+(.+)$/i);
  if (simpleMatch) return { serving: "1 serving", foodName: simpleMatch[1].trim() };
  return { serving: "1 serving", foodName: str };
}

function parseUsdaNutrients(foodNutrients, servingGrams) {
  const scale = servingGrams / 100;
  const raw = {};
  for (const nutrient of foodNutrients) {
    const id = nutrient.nutrientId || nutrient.nutrientNumber;
    const field = USDA_NUTRIENT_MAP[id];
    if (field && nutrient.value != null) raw[field] = nutrient.value * scale;
  }
  return {
    calories: Math.round(raw.calories || 0), protein: parseNum(raw.protein) || 0,
    carbs: parseNum(raw.carbs) || 0, fat: parseNum(raw.fat) || 0,
    fiber: parseNum(raw.fiber), sodium: parseNum(raw.sodium, 0),
    sugar: parseNum(raw.sugar), cholesterol: parseNum(raw.cholesterol, 0),
    vitaminA: parseNum(raw.vitaminA, 0), vitaminC: parseNum(raw.vitaminC),
    vitaminD: parseNum(raw.vitaminD), vitaminE: parseNum(raw.vitaminE, 2),
    vitaminK: parseNum(raw.vitaminK), vitaminB1: parseNum(raw.vitaminB1, 2),
    vitaminB2: parseNum(raw.vitaminB2, 2), vitaminB3: parseNum(raw.vitaminB3),
    vitaminB6: parseNum(raw.vitaminB6, 2), vitaminB12: parseNum(raw.vitaminB12, 2),
    folate: parseNum(raw.folate, 0), calcium: parseNum(raw.calcium, 0),
    iron: parseNum(raw.iron, 2), magnesium: parseNum(raw.magnesium, 0),
    zinc: parseNum(raw.zinc, 2), potassium: parseNum(raw.potassium, 0),
  };
}

async function searchUSDA(query, apiKey) {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("pageSize", "3");
  url.searchParams.set("dataType", "SR Legacy,Foundation");
  const response = await fetch(url.toString(), { headers: { "Content-Type": "application/json" } });
  if (!response.ok) { console.error("[USDA] Search failed (" + response.status + ") for: " + query); return null; }
  const data = await response.json();
  if (!data.foods || data.foods.length === 0) { console.log("[USDA] No results for: " + query); return null; }
  return data.foods[0];
}

async function aiSuggestSearchTerm(foodDescription, apiKey, refererUrl) {
  try {
    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "HTTP-Referer": refererUrl, "X-Title": "NutriNote+" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You help search the USDA FoodData Central database. Given a food description, return a simple, common food name that would match in USDA's database. Return ONLY the simplified search term (1-4 words). Examples: 'grilled chicken breast' -> 'chicken breast cooked', 'pad thai' -> 'noodles stir fried', 'Big Mac' -> 'hamburger double patty'" },
          { role: "user", content: foodDescription },
        ],
        temperature: 0.1, max_tokens: 50,
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim();
    if (suggestion && suggestion.length > 0 && suggestion.length < 100) {
      console.log("[AI] Suggested USDA search: \"" + foodDescription + "\" -> \"" + suggestion + "\"");
      return suggestion;
    }
    return null;
  } catch { return null; }
}

async function aiEstimateNutrition(foodDescription, apiKey, refererUrl) {
  const systemPrompt = "You are a nutrition expert. When given a food description, provide comprehensive nutritional information.\nAlways respond with a valid JSON object containing:\n- calories (total kcal), protein (grams), carbs (grams), fat (grams)\n- fiber (grams), sodium (milligrams), sugar (grams), cholesterol (milligrams)\n- vitaminA (mcg RAE), vitaminC (mg), vitaminD (mcg), vitaminE (mg), vitaminK (mcg)\n- vitaminB1 (mg), vitaminB2 (mg), vitaminB3 (mg), vitaminB6 (mg), vitaminB12 (mcg)\n- folate (mcg DFE), calcium (mg), iron (mg), magnesium (mg), zinc (mg), potassium (mg)\nUse realistic USDA estimates. Use null for nutrients you cannot estimate. Format as JSON only.";

  const controller = new AbortController();
  const timeout = setTimeout(function() { controller.abort(); }, 20000);

  try {
    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "HTTP-Referer": refererUrl, "X-Title": "NutriNote+" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "What is the complete nutritional content of: " + foodDescription + "? JSON format." },
        ],
        temperature: 0.2, max_tokens: 500,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const status = response.status;
      if (status === 429) throw Object.assign(new Error("AI service rate limited. Please wait."), { code: "API_RATE_LIMITED", status: 429 });
      if (status === 401) throw Object.assign(new Error("Authentication failed"), { code: "AUTH_ERROR", status: 401 });
      throw Object.assign(new Error("AI service temporarily unavailable"), { code: "API_ERROR", status: 502 });
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      calories: Math.round(parsed.calories || parsed.cal || 0),
      protein: parseNum(parsed.protein) || 0,
      carbs: parseNum(parsed.carbs || parsed.carbohydrates) || 0,
      fat: parseNum(parsed.fat) || 0,
      fiber: parseNum(parsed.fiber), sodium: parseNum(parsed.sodium, 0),
      sugar: parseNum(parsed.sugar || parsed.sugars), cholesterol: parseNum(parsed.cholesterol, 0),
      vitaminA: parseNum(parsed.vitaminA || parsed.vitamin_a, 0),
      vitaminC: parseNum(parsed.vitaminC || parsed.vitamin_c),
      vitaminD: parseNum(parsed.vitaminD || parsed.vitamin_d),
      vitaminE: parseNum(parsed.vitaminE || parsed.vitamin_e, 2),
      vitaminK: parseNum(parsed.vitaminK || parsed.vitamin_k),
      vitaminB1: parseNum(parsed.vitaminB1 || parsed.vitamin_b1 || parsed.thiamin, 2),
      vitaminB2: parseNum(parsed.vitaminB2 || parsed.vitamin_b2 || parsed.riboflavin, 2),
      vitaminB3: parseNum(parsed.vitaminB3 || parsed.vitamin_b3 || parsed.niacin),
      vitaminB6: parseNum(parsed.vitaminB6 || parsed.vitamin_b6, 2),
      vitaminB12: parseNum(parsed.vitaminB12 || parsed.vitamin_b12, 2),
      folate: parseNum(parsed.folate, 0), calcium: parseNum(parsed.calcium, 0),
      iron: parseNum(parsed.iron, 2), magnesium: parseNum(parsed.magnesium, 0),
      zinc: parseNum(parsed.zinc, 2), potassium: parseNum(parsed.potassium, 0),
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.code) throw error;
    if (error.name === "AbortError") throw Object.assign(new Error("Request timed out"), { code: "TIMEOUT", status: 504 });
    return null;
  }
}

export default async function handler(req, res) {
  // CORS headers
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
      error: "Too many requests. Please try again in a few minutes.",
      code: "RATE_LIMITED",
      retryAfter: rateCheck.retryAfter,
    });
  }

  try {
    const { foodDescription } = req.body;

    // Input validation
    if (!foodDescription || typeof foodDescription !== "string") {
      return res.status(400).json({ error: "Food description is required", code: "MISSING_INPUT" });
    }

    const trimmedDescription = foodDescription.trim();
    if (trimmedDescription.length === 0) {
      return res.status(400).json({ error: "Food description cannot be empty", code: "EMPTY_INPUT" });
    }
    if (trimmedDescription.length > 200) {
      return res.status(400).json({ error: "Food description too long (max 200 characters)", code: "INPUT_TOO_LONG" });
    }

    // Get API keys - need at least one
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const usdaKey = process.env.USDA_API_KEY;

    if (!openrouterKey && !usdaKey) {
      console.error("[ERROR] Missing both OPENROUTER_API_KEY and USDA_API_KEY");
      return res.status(500).json({ error: "Server configuration error", code: "SERVER_CONFIG_ERROR" });
    }

    const refererUrl = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "https://nutrinoteplus.vercel.app";

    // Parse the food description for serving + food name
    const { serving, foodName } = parseFoodDescription(trimmedDescription);
    const servingGrams = parseServingToGrams(serving);

    let nutrition = null;
    let source = "none";
    let usdaFoodName = null;

    // ──────────────────────────────────────────
    // Strategy 1: Direct USDA search (fastest, most accurate)
    // ──────────────────────────────────────────
    if (usdaKey) {
      try {
        console.log("[USDA] Searching for: \"" + foodName + "\"");
        const usdaResult = await searchUSDA(foodName, usdaKey);
        if (usdaResult && usdaResult.foodNutrients) {
          nutrition = parseUsdaNutrients(usdaResult.foodNutrients, servingGrams);
          if (nutrition.calories > 0) {
            source = "usda";
            usdaFoodName = usdaResult.description;
            console.log("[USDA] Direct match found: " + usdaFoodName);
          } else { nutrition = null; }
        }
      } catch (err) { console.error("[USDA] Direct search error:", err.message); }
    }

    // ──────────────────────────────────────────
    // Strategy 2: AI-assisted USDA search
    // ──────────────────────────────────────────
    if (!nutrition && usdaKey && openrouterKey) {
      try {
        console.log("[AI+USDA] AI suggesting search term for: \"" + foodName + "\"");
        const betterTerm = await aiSuggestSearchTerm(trimmedDescription, openrouterKey, refererUrl);
        if (betterTerm && betterTerm.toLowerCase() !== foodName.toLowerCase()) {
          const usdaResult = await searchUSDA(betterTerm, usdaKey);
          if (usdaResult && usdaResult.foodNutrients) {
            nutrition = parseUsdaNutrients(usdaResult.foodNutrients, servingGrams);
            if (nutrition.calories > 0) {
              source = "usda_ai_assisted";
              usdaFoodName = usdaResult.description;
              console.log("[AI+USDA] AI-assisted match: " + usdaFoodName);
            } else { nutrition = null; }
          }
        }
      } catch (err) { console.error("[AI+USDA] Error:", err.message); }
    }

    // ──────────────────────────────────────────
    // Strategy 3: Full AI estimation (last resort)
    // ──────────────────────────────────────────
    if (!nutrition && openrouterKey) {
      console.log("[AI] Falling back to AI estimation for: \"" + trimmedDescription + "\"");
      try {
        nutrition = await aiEstimateNutrition(trimmedDescription, openrouterKey, refererUrl);
        if (nutrition) { source = "ai_estimate"; }
      } catch (error) {
        if (error.code && error.status) {
          return res.status(error.status >= 500 ? 502 : error.status).json({ error: error.message, code: error.code });
        }
        console.error("[AI] Estimation error:", error.message);
      }
    }

    if (!nutrition) {
      return res.status(502).json({ error: "Could not estimate nutrition. Try rephrasing.", code: "NO_DATA" });
    }
    if (nutrition.calories < 0 || nutrition.protein < 0 || nutrition.carbs < 0 || nutrition.fat < 0) {
      return res.status(502).json({ error: "Invalid nutrition values", code: "INVALID_VALUES" });
    }

    const duration = Date.now() - startTime;
    console.log("[INFO] Nutrition for \"" + trimmedDescription + "\" from " + source + " in " + duration + "ms");

    return res.status(200).json({
      nutrition,
      source,
      usdaFoodName: usdaFoodName || undefined,
      cached: false,
      responseTime: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Request timed out", code: "TIMEOUT" });
    }
    console.error("[ERROR] " + error.message + " after " + duration + "ms");
    return res.status(500).json({ error: "An unexpected error occurred", code: "UNEXPECTED_ERROR" });
  }
}
