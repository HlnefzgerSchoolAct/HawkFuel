// Import React and useState hook for managing component state
import React, { useState } from 'react';
import './UserProfile.css';

/**
 * UserProfile Component
 * 
 * Purpose: Collects user's personal information and fitness goals
 * 
 * What it does:
 * 1. Shows input fields for age, gender, height, weight
 * 2. Lets user select activity level (how active they are)
 * 3. Lets user choose goal (maintain, lose, or gain weight)
 * 4. Validates all inputs before submitting
 * 
 * Props:
 * - onSubmit: Function that runs when user submits the form
 */
function UserProfile({ onSubmit }) {
  
  // STATE MANAGEMENT
  // useState creates a "state" - data that can change
  // formData holds all the user's input
  // setFormData is the function to update formData
  const [formData, setFormData] = useState({
    age: '',                              // User's age in years
    gender: 'male',                       // User's biological sex
    heightFeet: '',                       // Height in feet (e.g., 5)
    heightInches: '',                     // Height in inches (e.g., 10)
    weight: '',                           // Weight in pounds
    activityLevel: 'moderately_active',   // How active they are
    goal: 'maintain',                     // Weight goal (maintain/lose/gain)
    customAdjustment: 0                   // Calorie adjustment amount
  });

  /**
   * handleChange Function
   * 
   * Runs every time a user types in an input field
   * Updates the formData state with the new value
   * 
   * Example: When user types in age field
   * 1. e.target.name = "age"
   * 2. e.target.value = "16" (what they typed)
   * 3. Updates formData.age to "16"
   */
  const handleChange = (e) => {
    const { name, value } = e.target;  // Get the input's name and value
    
    // Update formData while keeping other fields unchanged
    setFormData(prev => ({
      ...prev,        // Keep all existing values (spread operator)
      [name]: value   // Update only the changed field
    }));
  };

  /**
   * handleSubmit Function
   * 
   * Runs when user clicks the submit button
   * 
   * Steps:
   * 1. Prevent page refresh (default form behavior)
   * 2. Validate required fields
   * 3. If valid, pass data to parent component via onSubmit
   */
  const handleSubmit = (e) => {
    e.preventDefault();  // Stop the form from refreshing the page
    
    // VALIDATION: Make sure required fields are filled
    if (!formData.age || !formData.heightFeet || !formData.weight) {
      alert('Please fill in all required fields');
      return;  // Stop here if validation fails
    }

    // If validation passes, send data to parent component
    onSubmit(formData);
  };

  return (
    <div className="user-profile">
      {/* Header */}
      <h2>Tell Us About Yourself</h2>
      
      {/* Form starts here */}
      <form onSubmit={handleSubmit}>
        
        {/* ROW 1: Age and Gender side by side */}
        <div className="form-row">
          
          {/* AGE INPUT */}
          <div className="form-group">
            <label htmlFor="age">Age (years) *</label>
            <input
              type="number"           // Only numbers allowed
              id="age"                // Connects to label
              name="age"              // Must match formData key
              value={formData.age}    // Current value from state
              onChange={handleChange} // Update state when user types
              min="13"                // Minimum age
              max="100"               // Maximum age
              placeholder="e.g., 16"  // Hint text
              required                // HTML5 validation
            />
          </div>

          {/* GENDER DROPDOWN */}
          <div className="form-group">
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Height (Feet + Inches) and Weight */}
        <div className="form-row">
          
          {/* HEIGHT - FEET */}
          <div className="form-group">
            <label htmlFor="heightFeet">Height - Feet *</label>
            <input
              type="number"
              id="heightFeet"
              name="heightFeet"
              value={formData.heightFeet}
              onChange={handleChange}
              min="3"
              max="8"
              placeholder="5"
              required
            />
          </div>

          {/* HEIGHT - INCHES */}
          <div className="form-group">
            <label htmlFor="heightInches">Height - Inches</label>
            <input
              type="number"
              id="heightInches"
              name="heightInches"
              value={formData.heightInches}
              onChange={handleChange}
              min="0"
              max="11"
              placeholder="10"
            />
          </div>

          {/* WEIGHT */}
          <div className="form-group">
            <label htmlFor="weight">Weight (lbs) *</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="50"
              max="500"
              placeholder="165"
              required
            />
          </div>
        </div>

        {/* ACTIVITY LEVEL DROPDOWN */}
        <div className="form-group">
          <label htmlFor="activityLevel">Activity Level *</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
          >
            {/* These multiply your BMR to get maintenance calories */}
            <option value="sedentary">Sedentary (little/no exercise)</option>
            <option value="lightly_active">Lightly Active (1-3 days/week)</option>
            <option value="moderately_active">Moderately Active (3-5 days/week)</option>
            <option value="very_active">Very Active (6-7 days/week)</option>
            <option value="extra_active">Extra Active (athlete/physical job)</option>
          </select>
        </div>

        {/* GOAL SELECTION */}
        <div className="form-group">
          <label htmlFor="goal">Goal *</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
          >
            {/* Goal determines if we add/subtract calories from TDEE */}
            <option value="maintain">Maintain Weight</option>
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
        </div>

        {/* CONDITIONAL RENDERING: Only show if goal is NOT maintain */}
        {/* This lets users choose how aggressive their deficit/surplus is */}
        {formData.goal !== 'maintain' && (
          <div className="form-group">
            <label htmlFor="customAdjustment">
              Calorie Adjustment ({formData.goal === 'lose' ? 'Deficit' : 'Surplus'})
            </label>
            <select
              id="customAdjustment"
              name="customAdjustment"
              value={formData.customAdjustment}
              onChange={handleChange}
            >
              {/* 500 cal = ~1 lb per week (science-backed) */}
              <option value="250">250 calories/day (~0.5 lbs/week)</option>
              <option value="500">500 calories/day (~1 lb/week) - Recommended</option>
              <option value="750">750 calories/day (~1.5 lbs/week)</option>
            </select>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button type="submit" className="btn-primary">
          Continue to Activities →
        </button>
      </form>
    </div>
  );
}

// Export so other files can import this component
export default UserProfile;
