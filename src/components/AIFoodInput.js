import React, { useState, useEffect } from "react";
import { Bot, Camera } from "lucide-react";
import { estimateNutrition } from "../services/aiNutritionService";
import { CompactMicronutrients } from "./common";
import FoodPhotoCapture from "./FoodPhotoCapture";
import devLog from "../utils/devLog";
import "./AIFoodInput.css";

function AIFoodInput({
  onAddFood,
  userWeight,
  prefillDescription,
  onDescriptionUsed,
}) {
  const [foodDescription, setFoodDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [unit, setUnit] = useState("serving");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [estimatedNutrition, setEstimatedNutrition] = useState(null);

  // Handle prefill from barcode scanner fallback
  useEffect(() => {
    if (prefillDescription) {
      setFoodDescription(prefillDescription);
      if (onDescriptionUsed) {
        onDescriptionUsed();
      }
    }
  }, [prefillDescription, onDescriptionUsed]);

  const handleEstimate = async (e) => {
    e.preventDefault();
    setError("");
    setEstimatedNutrition(null);

    if (!foodDescription.trim()) {
      setError("Please enter a food description");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    setLoading(true);

    try {
      const fullDescription = `${quantity} ${unit} of ${foodDescription}`;
      const nutrition = await estimateNutrition(fullDescription);

      // Round nutrition values (quantity is already included in the AI prompt)
      const scaledNutrition = {
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein * 10) / 10,
        carbs: Math.round(nutrition.carbs * 10) / 10,
        fat: Math.round(nutrition.fat * 10) / 10,
        // Micronutrients
        fiber: nutrition.fiber,
        sodium: nutrition.sodium,
        sugar: nutrition.sugar,
        cholesterol: nutrition.cholesterol,
        vitaminA: nutrition.vitaminA,
        vitaminC: nutrition.vitaminC,
        vitaminD: nutrition.vitaminD,
        vitaminE: nutrition.vitaminE,
        vitaminK: nutrition.vitaminK,
        vitaminB1: nutrition.vitaminB1,
        vitaminB2: nutrition.vitaminB2,
        vitaminB3: nutrition.vitaminB3,
        vitaminB6: nutrition.vitaminB6,
        vitaminB12: nutrition.vitaminB12,
        folate: nutrition.folate,
        calcium: nutrition.calcium,
        iron: nutrition.iron,
        magnesium: nutrition.magnesium,
        zinc: nutrition.zinc,
        potassium: nutrition.potassium,
      };

      setEstimatedNutrition(scaledNutrition);
    } catch (err) {
      setError(
        err.message || "Failed to estimate nutrition. Please try again.",
      );
      devLog.error("Estimation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = () => {
    if (!estimatedNutrition) return;

    const foodEntry = {
      id: Date.now(),
      name: `${quantity} ${unit} ${foodDescription}`,
      calories: estimatedNutrition.calories,
      protein: estimatedNutrition.protein,
      carbs: estimatedNutrition.carbs,
      fat: estimatedNutrition.fat,
      // Micronutrients
      fiber: estimatedNutrition.fiber,
      sodium: estimatedNutrition.sodium,
      sugar: estimatedNutrition.sugar,
      cholesterol: estimatedNutrition.cholesterol,
      vitaminA: estimatedNutrition.vitaminA,
      vitaminC: estimatedNutrition.vitaminC,
      vitaminD: estimatedNutrition.vitaminD,
      vitaminE: estimatedNutrition.vitaminE,
      vitaminK: estimatedNutrition.vitaminK,
      vitaminB1: estimatedNutrition.vitaminB1,
      vitaminB2: estimatedNutrition.vitaminB2,
      vitaminB3: estimatedNutrition.vitaminB3,
      vitaminB6: estimatedNutrition.vitaminB6,
      vitaminB12: estimatedNutrition.vitaminB12,
      folate: estimatedNutrition.folate,
      calcium: estimatedNutrition.calcium,
      iron: estimatedNutrition.iron,
      magnesium: estimatedNutrition.magnesium,
      zinc: estimatedNutrition.zinc,
      potassium: estimatedNutrition.potassium,
      timestamp: new Date().toISOString(),
      aiEstimated: estimatedNutrition._source === "ai_estimate",
      nutritionSource: estimatedNutrition._source || "ai_estimate",
      usdaFoodName: estimatedNutrition._usdaFoodName,
    };

    onAddFood(foodEntry);

    // Reset form
    setFoodDescription("");
    setQuantity("1");
    setUnit("serving");
    setEstimatedNutrition(null);
    setError("");
  };

  return (
    <div className="ai-food-input">
      <div className="ai-food-title-row">
        <h3 className="ai-food-title">
          <Bot size={20} aria-hidden="true" /> AI Nutrition Estimator
        </h3>
        <button
          type="button"
          className="ai-photo-toggle-btn"
          onClick={() => setShowPhotoCapture((prev) => !prev)}
          title={showPhotoCapture ? "Switch to text input" : "Identify food from photo"}
        >
          <Camera size={18} />
          {showPhotoCapture ? "Text Input" : "Photo ID"}
        </button>
      </div>

      {showPhotoCapture ? (
        <FoodPhotoCapture
          onAddFood={onAddFood}
          onClose={() => setShowPhotoCapture(false)}
        />
      ) : (
      <>
      <form onSubmit={handleEstimate} className="ai-food-form">
        <div className="ai-form-group">
          <label htmlFor="ai-food-description" className="ai-label">
            What did you eat?
          </label>
          <input
            id="ai-food-description"
            type="text"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            placeholder="e.g., grilled chicken with rice and vegetables"
            className="ai-input"
            disabled={loading}
          />
          <small className="ai-hint">
            Be specific for better estimates (e.g., "1 medium apple" or "8oz
            sirloin steak")
          </small>
        </div>

        <div className="ai-form-row">
          <div className="ai-form-group">
            <label htmlFor="ai-food-quantity" className="ai-label">
              Quantity
            </label>
            <input
              id="ai-food-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              step="0.5"
              min="0"
              className="ai-input"
              disabled={loading}
            />
          </div>

          <div className="ai-form-group">
            <label className="ai-label" htmlFor="ai-unit-select">Unit</label>
            <select
              id="ai-unit-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="ai-select"
              disabled={loading}
            >
              <option value="serving">serving</option>
              <option value="cup">cup</option>
              <option value="oz">oz</option>
              <option value="g">gram</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="piece">piece</option>
              <option value="slice">slice</option>
            </select>
          </div>
        </div>

        <button type="submit" className="ai-estimate-btn" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner"></div>
              Estimating...
            </>
          ) : (
            "Estimate Nutrition"
          )}
        </button>
      </form>

      {error && <div className="ai-error">{error}</div>}

      {estimatedNutrition && (
        <div className="ai-result-container">
          <div className="ai-result-header">
            <h4 className="ai-result-title">
              Estimated for: {quantity} {unit} {foodDescription}
            </h4>
            <span className={"ai-source-badge " + (estimatedNutrition._source?.startsWith("usda") ? "badge-usda" : "badge-ai")}>
              {estimatedNutrition._source === "usda" ? "USDA" : estimatedNutrition._source === "usda_ai_assisted" ? "USDA (AI-assisted)" : "AI Est."}
            </span>
          </div>
          {estimatedNutrition._usdaFoodName && (
            <p className="ai-usda-match">Matched: {estimatedNutrition._usdaFoodName}</p>
          )}
          <div className="ai-nutrition-grid">
            <div className="ai-nutrition-item">
              <div className="ai-nutrition-value">
                {estimatedNutrition.calories}
              </div>
              <div className="ai-nutrition-label">Calories</div>
            </div>
            <div className="ai-nutrition-item">
              <div className="ai-nutrition-value">
                {estimatedNutrition.protein}g
              </div>
              <div className="ai-nutrition-label">Protein</div>
            </div>
            <div className="ai-nutrition-item">
              <div className="ai-nutrition-value">
                {estimatedNutrition.carbs}g
              </div>
              <div className="ai-nutrition-label">Carbs</div>
            </div>
            <div className="ai-nutrition-item">
              <div className="ai-nutrition-value">
                {estimatedNutrition.fat}g
              </div>
              <div className="ai-nutrition-label">Fat</div>
            </div>
          </div>

          {/* Micronutrient highlights */}
          {(estimatedNutrition.fiber ||
            estimatedNutrition.sodium ||
            estimatedNutrition.sugar) && (
            <div className="ai-micros-section">
              <CompactMicronutrients
                fiber={estimatedNutrition.fiber}
                sodium={estimatedNutrition.sodium}
                sugar={estimatedNutrition.sugar}
              />
            </div>
          )}

          <button className="ai-add-btn" onClick={handleAddFood}>
            ✓ Add to Food Log
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default AIFoodInput;
