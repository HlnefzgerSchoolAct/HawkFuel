// Vercel Serverless Function for AI Food Photo Identification
// Uses Hack Club's AI proxy (Gemini 2.5 Flash vision) + USDA FoodData Central API
//
// Flow:
// 1. Receive base64 JPEG image from client
// 2. Send to Gemini vision to identify foods + estimate servings
// 3. Look up each food in USDA FoodData Central for accurate nutrition
// 4. Fall back to AI text estimation if USDA has no match

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 20; // 20 photo requests per window (lower than text)

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

// USDA FoodData Central nutrient ID -> app field mapping
const USDA_NUTRIENT_MAP = {
  1008: "calories",    // Energy (kcal)
  1003: "protein",     // Protein
  1005: "carbs",       // Carbohydrates
  1004: "fat",         // Total lipid (fat)
  1079: "fiber",       // Fiber, total dietary
  1093: "sodium",      // Sodium
  2000: "sugar",       // Sugars, total
  1253: "cholesterol", // Cholesterol
  1106: "vitaminA",    // Vitamin A, RAE
  1162: "vitaminC",    // Vitamin C
  1114: "vitaminD",    // Vitamin D (D2 + D3)
  1109: "vitaminE",    // Vitamin E (alpha-tocopherol)
  1185: "vitaminK",    // Vitamin K (phylloquinone)
  1165: "vitaminB1",   // Thiamin
  1166: "vitaminB2",   // Riboflavin
  1167: "vitaminB3",   // Niacin
  1175: "vitaminB6",   // Vitamin B-6
  1178: "vitaminB12",  // Vitamin B-12
  1177: "folate",      // Folate, total
  1087: "calcium",     // Calcium
  1089: "iron",        // Iron
  1090: "magnesium",   // Magnesium
  1095: "zinc",        // Zinc
  1092: "potassium",   // Potassium
};

/**
 * Parse USDA FDC food nutrients and scale to the estimated serving size
 * USDA returns nutrients per 100g; we scale by servingGrams/100
 */
function parseUsdaNutrients(foodNutrients, servingGrams) {
  const scale = servingGrams / 100;
  const nutrition = {};

  for (const nutrient of foodNutrients) {
    const id = nutrient.nutrientId || nutrient.nutrientNumber;
    const field = USDA_NUTRIENT_MAP[id];
    if (field && nutrient.value != null) {
      nutrition[field] = nutrient.value * scale;
    }
  }

  const parseNum = (val, decimals = 1) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return null;
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return {
    calories: Math.round(nutrition.calories || 0),
    protein: parseNum(nutrition.protein) || 0,
    carbs: parseNum(nutrition.carbs) || 0,
    fat: parseNum(nutrition.fat) || 0,
    fiber: parseNum(nutrition.fiber),
    sodium: parseNum(nutrition.sodium, 0),
    sugar: parseNum(nutrition.sugar),
    cholesterol: parseNum(nutrition.cholesterol, 0),
    vitaminA: parseNum(nutrition.vitaminA, 0),
    vitaminC: parseNum(nutrition.vitaminC),
    vitaminD: parseNum(nutrition.vitaminD),
    vitaminE: parseNum(nutrition.vitaminE, 2),
    vitaminK: parseNum(nutrition.vitaminK),
    vitaminB1: parseNum(nutrition.vitaminB1, 2),
    vitaminB2: parseNum(nutrition.vitaminB2, 2),
    vitaminB3: parseNum(nutrition.vitaminB3),
    vitaminB6: parseNum(nutrition.vitaminB6, 2),
    vitaminB12: parseNum(nutrition.vitaminB12, 2),
    folate: parseNum(nutrition.folate, 0),
    calcium: parseNum(nutrition.calcium, 0),
    iron: parseNum(nutrition.iron, 2),
    magnesium: parseNum(nutrition.magnesium, 0),
    zinc: parseNum(nutrition.zinc, 2),
    potassium: parseNum(nutrition.potassium, 0),
  };
}

/**
 * Search USDA FoodData Central for a food name
 */
async function searchUSDA(foodName, apiKey) {
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", foodName);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("pageSize", "3");
  url.searchParams.set("dataType", "SR Legacy,Foundation");

  const response = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    console.error("[USDA] Search failed (" + response.status + ") for: " + foodName);
    return null;
  }

  const data = await response.json();
  if (!data.foods || data.foods.length === 0) {
    console.log("[USDA] No results for: " + foodName);
    return null;
  }

  return data.foods[0];
}

/**
 * Convert AI-estimated serving string to grams for USDA scaling
 */
function parseServingToGrams(servingStr) {
  const str = servingStr.toLowerCase().trim();
  const match = str.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return 150;

  const amount = parseFloat(match[1]);
  const unit = match[2].trim();

  const conversions = {
    "g": 1, "gram": 1, "grams": 1,
    "oz": 28.35, "ounce": 28.35, "ounces": 28.35,
    "cup": 240, "cups": 240,
    "tbsp": 15, "tablespoon": 15, "tablespoons": 15,
    "tsp": 5, "teaspoon": 5, "teaspoons": 5,
    "lb": 453.6, "pound": 453.6, "pounds": 453.6,
    "kg": 1000, "kilogram": 1000, "kilograms": 1000,
    "ml": 1, "milliliter": 1, "milliliters": 1,
    "l": 1000, "liter": 1000, "liters": 1000,
    "slice": 30, "slices": 30,
    "piece": 100, "pieces": 100,
    "serving": 150, "servings": 150,
    "medium": 150, "large": 200, "small": 100,
  };

  const factor = conversions[unit] || 150;
  return Math.round(amount * factor);
}

/**
 * Fall back to AI text-based nutrition estimation
 */
async function fallbackAIEstimation(foodDescription, apiKey, refererUrl) {
  const systemPrompt = "You are a nutrition expert. When given a food description, provide comprehensive nutritional information.\nAlways respond with a valid JSON object containing:\n- calories (total kcal), protein (grams), carbs (grams), fat (grams)\n- fiber (grams), sodium (milligrams), sugar (grams), cholesterol (milligrams)\n- vitaminA (mcg RAE), vitaminC (mg), vitaminD (mcg), vitaminE (mg), vitaminK (mcg)\n- vitaminB1 (mg), vitaminB2 (mg), vitaminB3 (mg), vitaminB6 (mg), vitaminB12 (mcg)\n- folate (mcg DFE), calcium (mg), iron (mg), magnesium (mg), zinc (mg), potassium (mg)\nUse realistic USDA estimates. Use null for nutrients you cannot estimate. Format as JSON only.";

  const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "HTTP-Referer": refererUrl,
      "X-Title": "NutriNote+",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Nutritional content of: " + foodDescription + "? JSON format." },
      ],
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const parseNum = (val, decimals = 1) => {
      if (val === null || val === undefined || isNaN(val)) return null;
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) return null;
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    return {
      calories: Math.round(parsed.calories || 0),
      protein: parseNum(parsed.protein) || 0,
      carbs: parseNum(parsed.carbs || parsed.carbohydrates) || 0,
      fat: parseNum(parsed.fat) || 0,
      fiber: parseNum(parsed.fiber),
      sodium: parseNum(parsed.sodium, 0),
      sugar: parseNum(parsed.sugar),
      cholesterol: parseNum(parsed.cholesterol, 0),
      vitaminA: parseNum(parsed.vitaminA, 0),
      vitaminC: parseNum(parsed.vitaminC),
      vitaminD: parseNum(parsed.vitaminD),
      vitaminE: parseNum(parsed.vitaminE, 2),
      vitaminK: parseNum(parsed.vitaminK),
      vitaminB1: parseNum(parsed.vitaminB1, 2),
      vitaminB2: parseNum(parsed.vitaminB2, 2),
      vitaminB3: parseNum(parsed.vitaminB3),
      vitaminB6: parseNum(parsed.vitaminB6, 2),
      vitaminB12: parseNum(parsed.vitaminB12, 2),
      folate: parseNum(parsed.folate, 0),
      calcium: parseNum(parsed.calcium, 0),
      iron: parseNum(parsed.iron, 2),
      magnesium: parseNum(parsed.magnesium, 0),
      zinc: parseNum(parsed.zinc, 2),
      potassium: parseNum(parsed.potassium, 0),
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD_NOT_ALLOWED" });
  }

  const startTime = Date.now();
  const clientIP = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";

  // Rate limiting
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
    const { image } = req.body;

    // Input validation
    if (!image || typeof image !== "string") {
      return res.status(400).json({
        error: "Image data is required (base64 JPEG)",
        code: "MISSING_INPUT",
      });
    }

    // Strip data URI prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // Validate size (max ~4MB base64 -> ~3MB image)
    if (base64Data.length > 4 * 1024 * 1024) {
      return res.status(400).json({
        error: "Image too large (max 3MB)",
        code: "IMAGE_TOO_LARGE",
      });
    }

    // Get API keys
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const usdaKey = process.env.USDA_API_KEY;

    if (!openrouterKey) {
      console.error("[ERROR] Missing OPENROUTER_API_KEY");
      return res.status(500).json({ error: "Server configuration error", code: "SERVER_CONFIG_ERROR" });
    }

    // USDA key is optional - we gracefully degrade to AI-only if missing
    if (!usdaKey) {
      console.warn("[WARN] Missing USDA_API_KEY - will use AI estimation for nutrition data");
    }

    const refererUrl = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "https://nutrinoteplus.vercel.app";

    // ──────────────────────────────────────
    // Step 1: Vision AI — identify foods in the photo
    // ──────────────────────────────────────
    const visionPrompt = "You are a food identification expert. Analyze this food photo and identify each distinct food item visible.\n\nFor each food item, provide:\n- \"name\": A clear, common food name suitable for searching a nutrition database (e.g., \"grilled chicken breast\", \"white rice\", \"steamed broccoli\")\n- \"estimatedServing\": The estimated serving size with a unit (e.g., \"6 oz\", \"1 cup\", \"150g\", \"2 slices\")\n\nRespond ONLY with a valid JSON object:\n{\"foods\": [{\"name\": \"food name\", \"estimatedServing\": \"amount unit\"}, ...]}\n\nIf no food is visible in the image, respond with: {\"foods\": [], \"error\": \"No food detected in image\"}\nBe specific with food names (e.g., \"brown rice\" not just \"rice\", \"grilled salmon fillet\" not just \"fish\").";

    const controller = new AbortController();
    const timeout = setTimeout(function() { controller.abort(); }, 22000);

    const visionResponse = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + openrouterKey,
        "Content-Type": "application/json",
        "HTTP-Referer": refererUrl,
        "X-Title": "NutriNote+",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: visionPrompt },
              {
                type: "image_url",
                image_url: {
                  url: "data:image/jpeg;base64," + base64Data,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!visionResponse.ok) {
      let errorData;
      try { errorData = await visionResponse.json(); } catch { errorData = {}; }
      console.error("[ERROR] Vision API " + visionResponse.status + ":", errorData);

      const status = visionResponse.status;
      if (status === 429) return res.status(429).json({ error: "AI service rate limited. Please wait.", code: "API_RATE_LIMITED" });
      if (status === 401) return res.status(401).json({ error: "Authentication failed", code: "AUTH_ERROR" });
      return res.status(502).json({ error: "AI vision service error", code: "VISION_ERROR" });
    }

    const visionData = await visionResponse.json();
    const visionContent = visionData.choices?.[0]?.message?.content;

    if (!visionContent) {
      return res.status(502).json({ error: "AI returned empty response", code: "EMPTY_RESPONSE" });
    }

    // Parse the vision response
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

    if (!identified.foods || !Array.isArray(identified.foods) || identified.foods.length === 0) {
      return res.status(200).json({
        foods: [],
        message: identified.error || "No food detected in the image. Try taking a clearer photo.",
        responseTime: Date.now() - startTime,
      });
    }

    // Limit to 8 foods max
    const foodsToProcess = identified.foods.slice(0, 8);

    // ──────────────────────────────────────
    // Step 2: Look up each food in USDA FoodData Central
    // ──────────────────────────────────────
    const results = await Promise.all(
      foodsToProcess.map(async (food) => {
        const servingGrams = parseServingToGrams(food.estimatedServing || "1 serving");

        // Try USDA first (if key is available)
        if (usdaKey) {
          try {
            const usdaResult = await searchUSDA(food.name, usdaKey);

            if (usdaResult && usdaResult.foodNutrients) {
              const nutrition = parseUsdaNutrients(usdaResult.foodNutrients, servingGrams);

              if (nutrition.calories > 0) {
                return {
                  name: food.name,
                  serving: food.estimatedServing,
                  nutrition: nutrition,
                  source: "usda",
                  usdaFoodName: usdaResult.description,
                };
              }
            }
          } catch (err) {
            console.error("[USDA] Error looking up \"" + food.name + "\":", err.message);
          }
        }

        // Fall back to AI text estimation
        try {
          const fallbackDesc = food.estimatedServing + " of " + food.name;
          const aiNutrition = await fallbackAIEstimation(fallbackDesc, openrouterKey, refererUrl);

          if (aiNutrition) {
            return {
              name: food.name,
              serving: food.estimatedServing,
              nutrition: aiNutrition,
              source: "ai_estimate",
            };
          }
        } catch (err) {
          console.error("[AI Fallback] Error for \"" + food.name + "\":", err.message);
        }

        return {
          name: food.name,
          serving: food.estimatedServing,
          nutrition: null,
          source: "failed",
        };
      }),
    );

    const validResults = results.filter(function(r) { return r.nutrition !== null; });

    const duration = Date.now() - startTime;
    console.log("[INFO] Photo identified " + validResults.length + " foods in " + duration + "ms");

    return res.status(200).json({
      foods: validResults,
      totalIdentified: identified.foods.length,
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
