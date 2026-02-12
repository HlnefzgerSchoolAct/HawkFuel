// Vercel Serverless Function for USDA FoodData Central Search
// Provides direct USDA food search with nutrient parsing
// Used as primary data source before falling back to AI estimation

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 60; // Higher limit for USDA (lightweight)

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
  1008: "calories",
  1003: "protein",
  1005: "carbs",
  1004: "fat",
  1079: "fiber",
  1093: "sodium",
  2000: "sugar",
  1253: "cholesterol",
  1106: "vitaminA",
  1162: "vitaminC",
  1114: "vitaminD",
  1109: "vitaminE",
  1185: "vitaminK",
  1165: "vitaminB1",
  1166: "vitaminB2",
  1167: "vitaminB3",
  1175: "vitaminB6",
  1178: "vitaminB12",
  1177: "folate",
  1087: "calcium",
  1089: "iron",
  1090: "magnesium",
  1095: "zinc",
  1092: "potassium",
};

/**
 * Parse a serving description to grams for USDA scaling (per 100g base)
 */
function parseServingToGrams(servingStr) {
  if (!servingStr) return 100;
  const str = servingStr.toLowerCase().trim();
  const match = str.match(/^([\d.]+)\s*(.*)$/);
  if (!match) return 100;

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

  const factor = conversions[unit] || 100;
  return Math.round(amount * factor);
}

/**
 * Parse USDA nutrients and scale to serving size
 */
function parseUsdaNutrients(foodNutrients, servingGrams) {
  const scale = servingGrams / 100;
  const raw = {};

  for (const nutrient of foodNutrients) {
    const id = nutrient.nutrientId || nutrient.nutrientNumber;
    const field = USDA_NUTRIENT_MAP[id];
    if (field && nutrient.value != null) {
      raw[field] = nutrient.value * scale;
    }
  }

  const parseNum = (val, decimals = 1) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return null;
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return {
    calories: Math.round(raw.calories || 0),
    protein: parseNum(raw.protein) || 0,
    carbs: parseNum(raw.carbs) || 0,
    fat: parseNum(raw.fat) || 0,
    fiber: parseNum(raw.fiber),
    sodium: parseNum(raw.sodium, 0),
    sugar: parseNum(raw.sugar),
    cholesterol: parseNum(raw.cholesterol, 0),
    vitaminA: parseNum(raw.vitaminA, 0),
    vitaminC: parseNum(raw.vitaminC),
    vitaminD: parseNum(raw.vitaminD),
    vitaminE: parseNum(raw.vitaminE, 2),
    vitaminK: parseNum(raw.vitaminK),
    vitaminB1: parseNum(raw.vitaminB1, 2),
    vitaminB2: parseNum(raw.vitaminB2, 2),
    vitaminB3: parseNum(raw.vitaminB3),
    vitaminB6: parseNum(raw.vitaminB6, 2),
    vitaminB12: parseNum(raw.vitaminB12, 2),
    folate: parseNum(raw.folate, 0),
    calcium: parseNum(raw.calcium, 0),
    iron: parseNum(raw.iron, 2),
    magnesium: parseNum(raw.magnesium, 0),
    zinc: parseNum(raw.zinc, 2),
    potassium: parseNum(raw.potassium, 0),
  };
}

export default async function handler(req, res) {
  // CORS
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
      error: "Too many requests. Please wait.",
      code: "RATE_LIMITED",
      retryAfter: rateCheck.retryAfter,
    });
  }

  try {
    const { query, servingDescription } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required", code: "MISSING_INPUT" });
    }

    if (query.trim().length > 200) {
      return res.status(400).json({ error: "Query too long (max 200 chars)", code: "INPUT_TOO_LONG" });
    }

    const usdaKey = process.env.USDA_API_KEY;
    if (!usdaKey) {
      return res.status(503).json({
        error: "USDA service not configured",
        code: "USDA_NOT_CONFIGURED",
      });
    }

    const searchQuery = query.trim();
    const servingGrams = parseServingToGrams(servingDescription);

    // Search USDA FoodData Central
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("query", searchQuery);
    url.searchParams.set("api_key", usdaKey);
    url.searchParams.set("pageSize", "5");
    url.searchParams.set("dataType", "SR Legacy,Foundation");

    const usdaResponse = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
    });

    if (!usdaResponse.ok) {
      console.error("[USDA] Search failed:", usdaResponse.status);
      return res.status(502).json({
        error: "USDA service unavailable",
        code: "USDA_ERROR",
      });
    }

    const usdaData = await usdaResponse.json();

    if (!usdaData.foods || usdaData.foods.length === 0) {
      return res.status(200).json({
        found: false,
        query: searchQuery,
        message: "No USDA results found for this food",
        responseTime: Date.now() - startTime,
      });
    }

    // Parse the best match
    const bestMatch = usdaData.foods[0];
    const nutrition = parseUsdaNutrients(bestMatch.foodNutrients, servingGrams);

    // Also return alternative matches
    const alternatives = usdaData.foods.slice(1, 5).map(function(food) {
      return {
        fdcId: food.fdcId,
        description: food.description,
        dataType: food.dataType,
      };
    });

    const duration = Date.now() - startTime;
    console.log("[INFO] USDA search for \"" + searchQuery + "\" found: " + bestMatch.description + " in " + duration + "ms");

    return res.status(200).json({
      found: true,
      query: searchQuery,
      nutrition: nutrition,
      usdaFood: {
        fdcId: bestMatch.fdcId,
        description: bestMatch.description,
        dataType: bestMatch.dataType,
      },
      alternatives: alternatives,
      servingGrams: servingGrams,
      source: "usda",
      responseTime: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("[ERROR] " + error.message + " after " + duration + "ms");
    return res.status(500).json({
      error: "An unexpected error occurred",
      code: "UNEXPECTED_ERROR",
    });
  }
}
