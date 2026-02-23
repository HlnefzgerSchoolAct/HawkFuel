import React, { useState, useEffect } from "react";
import { Bot, Camera, ExternalLink } from "lucide-react";
import { estimateWithUSDA } from "../services/aiNutritionService";
import { CompactMicronutrients } from "./common";
import FoodPhotoCapture from "./FoodPhotoCapture";
import devLog from "../utils/devLog";
import "./AIFoodInput.css";
/**
 *OOOooooo Food
 */
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
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState("");
  const [estimatedNutrition, setEstimatedNutrition] = useState(null);

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

    // #region agent log
    fetch('http://127.0.0.1:7478/ingest/a61803e4-33fd-4e07-8277-6c1c53f64fc5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '893c3b',
      },
      body: JSON.stringify({
        sessionId: '893c3b',
        runId: 'pre-fix-1',
        hypothesisId: 'H3',
        location: 'AIFoodInput.js:handleEstimate',
        message: 'handleEstimate called',
        data: { foodDescription, quantity, unit },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    setLoading(true);
    setLoadingStage("Preparing...");

    try {
      const nutrition = await estimateWithUSDA(
        foodDescription,
        quantity,
        unit,
        setLoadingStage,
      );

      const scaledNutrition = {
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein * 10) / 10,
        carbs: Math.round(nutrition.carbs * 10) / 10,
        fat: Math.round(nutrition.fat * 10) / 10,
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
        source: nutrition.source || "ai",
        fdcId: nutrition.fdcId,
        usdaDescription: nutrition.usdaDescription,
        dataType: nutrition.dataType,
      };

      setEstimatedNutrition(scaledNutrition);
    } catch (err) {
      setError(
        err.message || "Failed to estimate nutrition. Please try again.",
      );
      devLog.error("Estimation error:", err);
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handleAddFood = () => {
    if (!estimatedNutrition) return;
    const isUSDA = estimatedNutrition.source === "usda";
    const foodEntry = {
      id: Date.now(),
      name: `${quantity} ${unit} ${foodDescription}`,
      calories: estimatedNutrition.calories,
      protein: estimatedNutrition.protein,
      carbs: estimatedNutrition.carbs,
      fat: estimatedNutrition.fat,
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
      aiEstimated: !isUSDA,
      ...(isUSDA && {
        fdcId: estimatedNutrition.fdcId,
        usdaDescription: estimatedNutrition.usdaDescription,
        dataType: estimatedNutrition.dataType,
      }),
    };
    // #region agent log
    fetch('http://127.0.0.1:7478/ingest/a61803e4-33fd-4e07-8277-6c1c53f64fc5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '893c3b',
      },
      body: JSON.stringify({
        sessionId: '893c3b',
        runId: 'pre-fix-1',
        hypothesisId: 'H3',
        location: 'AIFoodInput.js:handleAddFood',
        message: 'handleAddFood called',
        data: {
          hasEstimated: !!estimatedNutrition,
          foodName: foodEntry.name,
          calories: foodEntry.calories,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
    onAddFood(foodEntry);
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
          title={
            showPhotoCapture
              ? "Switch to text input"
              : "Identify food from photo"
          }
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
                <label className="ai-label" htmlFor="ai-unit-select">
                  Unit
                </label>
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
            <button
              type="submit"
              className="ai-estimate-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {loadingStage || "Estimating..."}
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
                  {quantity} {unit} {foodDescription}
                </h4>
                {estimatedNutrition.source === "usda" ? (
                  <span className="ai-source-badge ai-source-badge--usda">
                    USDA Verified
                  </span>
                ) : (
                  <span className="ai-source-badge ai-source-badge--ai">
                    AI Estimated
                  </span>
                )}
              </div>
              {estimatedNutrition.source === "usda" &&
                estimatedNutrition.usdaDescription && (
                  <p className="ai-usda-match">
                    Matched:{" "}
                    {estimatedNutrition.fdcId ? (
                      <a
                        href={`https://fdc.nal.usda.gov/food-details/${estimatedNutrition.fdcId}/nutrients`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ai-usda-link"
                      >
                        {estimatedNutrition.usdaDescription}
                        <ExternalLink
                          size={11}
                          style={{ marginLeft: 3, verticalAlign: "middle" }}
                        />
                      </a>
                    ) : (
                      estimatedNutrition.usdaDescription
                    )}
                  </p>
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
