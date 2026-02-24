/**
 * Edit Food Modal Component
 * Allows users to modify logged food entries
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Trash2,
  Copy,
  Minus,
  Plus,
} from "lucide-react";
import "./EditFoodModal.css";

import {
  M3Button,
  M3TextField,
  M3Card,
  M3CardContent,
  Chip,
  ChipGroup,
  BottomSheet,
  ConfirmDialog,
  VisuallyHidden,
  useAnnounce,
} from "./common";

import { FOOD_UNITS, getUnitLabel } from "../utils/units";
import { haptics } from "../utils/haptics";

/**
 * Meal type options
 */
const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍪" },
];

/**
 * Quick quantity adjustments
 */
const QUANTITY_PRESETS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];

/**
 * EditFoodModal Component
 */
export const EditFoodModal = ({
  open = false,
  entry = null,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}) => {
  const announce = useAnnounce();

  // Form state
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("serving");
  const [mealType, setMealType] = useState("snack");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Original values for calculating proportional changes
  const [originalCalories, setOriginalCalories] = useState(0);
  const [originalQuantity, setOriginalQuantity] = useState(1);

  // Initialize form with entry data
  useEffect(() => {
    if (entry && open) {
      setName(entry.name || "");
      setCalories(entry.calories || 0);
      setProtein(entry.protein || 0);
      setCarbs(entry.carbs || 0);
      setFat(entry.fat || 0);
      setQuantity(entry.quantity || 1);
      setUnit(entry.unit || "serving");
      setMealType(entry.mealType || "snack");
      setNotes(entry.notes || "");
      setOriginalCalories(entry.calories || 0);
      setOriginalQuantity(entry.quantity || 1);
      setErrors({});
    }
  }, [entry, open]);

  // Validate form
  const validate = useCallback(() => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (calories < 0) {
      newErrors.calories = "Calories cannot be negative";
    }

    if (quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, calories, quantity]);

  // Update macros proportionally when quantity changes
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) return;

    const baseCaloriesPerUnit = originalCalories / originalQuantity;

    setQuantity(newQuantity);
    setCalories(Math.round(baseCaloriesPerUnit * newQuantity));
    setProtein(
      Math.round(
        ((entry?.protein || 0) / originalQuantity) * newQuantity * 10,
      ) / 10,
    );
    setCarbs(
      Math.round(((entry?.carbs || 0) / originalQuantity) * newQuantity * 10) /
        10,
    );
    setFat(
      Math.round(((entry?.fat || 0) / originalQuantity) * newQuantity * 10) /
        10,
    );

    haptics.tick();
  };

  // Increment/decrement quantity
  const adjustQuantity = (delta) => {
    const newQuantity = Math.max(0.25, quantity + delta);
    handleQuantityChange(newQuantity);
  };

  // Handle save
  const handleSave = () => {
    if (!validate()) {
      haptics.error();
      announce("Please fix the errors before saving", "assertive");
      return;
    }

    const updatedEntry = {
      ...entry,
      name: name.trim(),
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      quantity,
      unit,
      mealType,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSave?.(updatedEntry);
    haptics.success();
    announce("Food entry updated", "polite");
    onClose?.();
  };

  // Handle delete
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(entry);
    haptics.heavy();
    announce("Food entry deleted", "polite");
    setShowDeleteConfirm(false);
    onClose?.();
  };

  // Handle duplicate
  const handleDuplicate = () => {
    const duplicatedEntry = {
      name: name.trim(),
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      quantity,
      unit,
      mealType,
      notes: notes.trim(),
    };

    onDuplicate?.(duplicatedEntry);
    haptics.success();
    announce("Food entry duplicated", "polite");
    onClose?.();
  };

  if (!entry) return null;

  return (
    <>
    <ConfirmDialog
      open={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDeleteConfirm}
      title="Delete food entry?"
      message={`Are you sure you want to delete "${entry.name}"? This cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      destructive
    />
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Edit Food Entry"
      fullHeight
    >
      <div className="edit-food-modal">
        <VisuallyHidden>
          <h2>Edit {entry.name}</h2>
        </VisuallyHidden>

        {/* Name Field */}
        <div className="edit-food-modal__field">
          <M3TextField
            label="Food Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            fullWidth
          />
        </div>

        {/* Quantity Controls */}
        <div className="edit-food-modal__quantity">
          <label className="edit-food-modal__label">Quantity</label>

          <div className="edit-food-modal__quantity-controls">
            <button
              className="edit-food-modal__qty-btn"
              onClick={() => adjustQuantity(-0.5)}
              disabled={quantity <= 0.25}
              aria-label="Decrease quantity"
            >
              <Minus size={20} />
            </button>

            <input
              type="number"
              className="edit-food-modal__qty-input"
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(parseFloat(e.target.value) || 0.25)
              }
              min="0.25"
              step="0.25"
              aria-label="Quantity"
            />

            <button
              className="edit-food-modal__qty-btn"
              onClick={() => adjustQuantity(0.5)}
              aria-label="Increase quantity"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Quick quantity presets */}
          <div className="edit-food-modal__presets">
            {QUANTITY_PRESETS.map((preset) => (
              <button
                key={preset}
                className={`edit-food-modal__preset ${quantity === preset ? "edit-food-modal__preset--active" : ""}`}
                onClick={() => handleQuantityChange(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selection */}
        <div className="edit-food-modal__field">
          <label className="edit-food-modal__label">Unit</label>
          <div className="edit-food-modal__units">
            <ChipGroup
              value={unit}
              onChange={(v) => {
                setUnit(v);
                haptics.selection();
              }}
            >
              {FOOD_UNITS.slice(0, 8).map((u) => (
                <Chip key={u.value} value={u.value} variant="filter">
                  {u.label}
                </Chip>
              ))}
            </ChipGroup>
          </div>
        </div>

        {/* Meal Type */}
        <div className="edit-food-modal__field">
          <label className="edit-food-modal__label">Meal</label>
          <div className="edit-food-modal__meals">
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal.value}
                className={`edit-food-modal__meal ${mealType === meal.value ? "edit-food-modal__meal--active" : ""}`}
                onClick={() => {
                  setMealType(meal.value);
                  haptics.selection();
                }}
                aria-pressed={mealType === meal.value}
              >
                <span className="edit-food-modal__meal-emoji">
                  {meal.emoji}
                </span>
                <span className="edit-food-modal__meal-label">
                  {meal.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Summary */}
        <M3Card variant="filled" className="edit-food-modal__nutrition">
          <M3CardContent>
            <div className="edit-food-modal__nutrition-grid">
              <div className="edit-food-modal__nutrition-item">
                <span className="edit-food-modal__nutrition-value">
                  {Math.round(calories)}
                </span>
                <span className="edit-food-modal__nutrition-label">
                  Calories
                </span>
              </div>
              <div className="edit-food-modal__nutrition-item">
                <span className="edit-food-modal__nutrition-value">
                  {protein.toFixed(1)}g
                </span>
                <span className="edit-food-modal__nutrition-label">
                  Protein
                </span>
              </div>
              <div className="edit-food-modal__nutrition-item">
                <span className="edit-food-modal__nutrition-value">
                  {carbs.toFixed(1)}g
                </span>
                <span className="edit-food-modal__nutrition-label">Carbs</span>
              </div>
              <div className="edit-food-modal__nutrition-item">
                <span className="edit-food-modal__nutrition-value">
                  {fat.toFixed(1)}g
                </span>
                <span className="edit-food-modal__nutrition-label">Fat</span>
              </div>
            </div>
          </M3CardContent>
        </M3Card>

        {/* Notes */}
        <div className="edit-food-modal__field">
          <M3TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={2}
            fullWidth
            placeholder="Add any notes about this food..."
          />
        </div>

        {/* Actions */}
        <div className="edit-food-modal__actions">
          <M3Button
            variant="outlined"
            icon={<Trash2 size={18} />}
            onClick={handleDeleteClick}
            className="edit-food-modal__delete-btn"
          >
            Delete
          </M3Button>

          <M3Button
            variant="tonal"
            icon={<Copy size={18} />}
            onClick={handleDuplicate}
          >
            Log Again
          </M3Button>

          <M3Button
            variant="filled"
            icon={<Save size={18} />}
            onClick={handleSave}
          >
            Save
          </M3Button>
        </div>
      </div>
    </BottomSheet>
    </>
  );
};

/**
 * Quick Adjust Modal
 * Simplified modal for just adjusting quantity
 */
export const QuickAdjustModal = ({
  open = false,
  entry = null,
  onClose,
  onSave,
}) => {
  const [quantity, setQuantity] = useState(1);
  const announce = useAnnounce();

  useEffect(() => {
    if (entry && open) {
      setQuantity(entry.quantity || 1);
    }
  }, [entry, open]);

  const handleSave = () => {
    if (!entry) return;

    const ratio = quantity / (entry.quantity || 1);
    const updatedEntry = {
      ...entry,
      quantity,
      calories: Math.round(entry.calories * ratio),
      protein: Math.round(entry.protein * ratio * 10) / 10,
      carbs: Math.round(entry.carbs * ratio * 10) / 10,
      fat: Math.round(entry.fat * ratio * 10) / 10,
      updatedAt: new Date().toISOString(),
    };

    onSave?.(updatedEntry);
    haptics.success();
    announce("Quantity updated", "polite");
    onClose?.();
  };

  if (!entry) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Adjust Quantity">
      <div className="quick-adjust-modal">
        <p className="quick-adjust-modal__food-name">{entry.name}</p>

        <div className="quick-adjust-modal__controls">
          <button
            className="quick-adjust-modal__btn"
            onClick={() => {
              setQuantity(Math.max(0.25, quantity - 0.5));
              haptics.tick();
            }}
            disabled={quantity <= 0.25}
          >
            <Minus size={24} />
          </button>

          <div className="quick-adjust-modal__value">
            <span className="quick-adjust-modal__number">{quantity}</span>
            <span className="quick-adjust-modal__unit">
              {getUnitLabel(entry.unit || "serving", quantity)}
            </span>
          </div>

          <button
            className="quick-adjust-modal__btn"
            onClick={() => {
              setQuantity(quantity + 0.5);
              haptics.tick();
            }}
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="quick-adjust-modal__presets">
          {QUANTITY_PRESETS.map((preset) => (
            <button
              key={preset}
              className={`quick-adjust-modal__preset ${quantity === preset ? "quick-adjust-modal__preset--active" : ""}`}
              onClick={() => {
                setQuantity(preset);
                haptics.selection();
              }}
            >
              {preset}×
            </button>
          ))}
        </div>

        <div className="quick-adjust-modal__calories">
          <span>New total: </span>
          <strong>
            {Math.round(entry.calories * (quantity / (entry.quantity || 1)))}{" "}
            cal
          </strong>
        </div>

        <div className="quick-adjust-modal__actions">
          <M3Button variant="text" onClick={onClose}>
            Cancel
          </M3Button>
          <M3Button variant="filled" onClick={handleSave}>
            Update
          </M3Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default EditFoodModal;
