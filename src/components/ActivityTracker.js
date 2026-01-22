// Import React and useState hook for managing component state
import React, { useState } from 'react';
import './ActivityTracker.css';

/**
 * ACTIVITY DATA
 * 
 * This array stores all available activities with their MET values
 * MET = Metabolic Equivalent of Task (how intense the activity is)
 * 
 * Higher MET = More calories burned
 * Formula: Calories = MET × Weight(kg) × Time(hours)
 */
const ACTIVITIES = [
  { id: 'walking', name: 'Walking', met: 3.5 },
  { id: 'running', name: 'Running', met: 10.0 },
  { id: 'lifting', name: 'Weight Lifting', met: 5.0 },
  { id: 'wrestling', name: 'Wrestling', met: 6.0 },
  { id: 'football', name: 'Football Practice', met: 8.0 },
  { id: 'cycling', name: 'Cycling', met: 7.5 }
];

/**
 * ActivityTracker Component
 * 
 * Purpose: Collects how many minutes user spent on each activity
 * 
 * What it does:
 * 1. Shows cards for each activity with MET values
 * 2. Lets user input minutes for each activity
 * 3. Validates that at least one activity has minutes
 * 4. Sends active activities to parent component
 * 
 * Props:
 * - userProfile: User's info from previous step (not used here, but passed from parent)
 * - onSubmit: Function to call when user submits
 * - onBack: Function to call when user clicks back button
 */
function ActivityTracker({ userProfile, onSubmit, onBack }) {
  
  // STATE: Stores minutes for each activity
  // Initially all activities have 0 minutes
  const [activities, setActivities] = useState({
    walking: 0,
    running: 0,
    lifting: 0,
    wrestling: 0,
    football: 0,
    cycling: 0
  });

  /**
   * handleActivityChange Function
   * 
   * Updates the minutes for a specific activity
   * 
   * Parameters:
   * - activityId: Which activity (e.g., 'walking')
   * - minutes: How many minutes (as a string from input)
   * 
   * Example: User types "30" in running field
   * 1. activityId = 'running'
   * 2. minutes = "30"
   * 3. Updates activities.running to 30
   */
  const handleActivityChange = (activityId, minutes) => {
    setActivities(prev => ({
      ...prev,                                    // Keep other activities unchanged
      [activityId]: parseInt(minutes) || 0       // Update this activity (convert to number)
    }));
  };

  /**
   * handleSubmit Function
   * 
   * Runs when user clicks "Calculate Results" button
   * 
   * Steps:
   * 1. Prevent page refresh
   * 2. Filter out activities with 0 minutes
   * 3. Validate at least one activity has minutes
   * 4. Send active activities to parent component
   */
  const handleSubmit = (e) => {
    e.preventDefault();  // Stop form from refreshing page
    
    // Filter: Only keep activities with minutes > 0
    // Map: Add minutes to each activity object
    const activeActivities = ACTIVITIES
      .filter(activity => activities[activity.id] > 0)  // Only activities with minutes
      .map(activity => ({
        ...activity,                    // Keep id, name, met, emoji
        minutes: activities[activity.id] // Add minutes user entered
      }));

    // VALIDATION: Make sure user entered at least one activity
    if (activeActivities.length === 0) {
      alert('Please enter minutes for at least one activity');
      return;
    }

    // If validation passes, send data to parent
    onSubmit(activeActivities);
  };

  return (
    <div className="activity-tracker">
      {/* Header */}
      <h2>Track Your Activities</h2>
      <p className="subtitle">Enter the minutes you spent on each activity today</p>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        
        {/* ACTIVITY GRID: Shows all 6 activity cards */}
        <div className="activity-grid">
          {/* Map through ACTIVITIES array to create a card for each one */}
          {ACTIVITIES.map(activity => (
            
            // Each card needs a unique "key" for React
            <div key={activity.id} className="activity-card">
              
              {/* Activity Header: Name */}
              <div className="activity-header">
                <h3>{activity.name}</h3>
              </div>
              
              {/* MET Badge: Shows how intense the activity is */}
              <div className="met-badge">{activity.met} METs</div>
              
              {/* Minutes Input Field */}
              <div className="activity-input">
                <label htmlFor={`activity-${activity.id}`}>Minutes:</label>
                <input
                  type="number"                               // Only numbers
                  id={`activity-${activity.id}`}            // Unique ID
                  value={activities[activity.id]}            // Current value from state
                  onChange={(e) => handleActivityChange(     // Update when user types
                    activity.id,                             // Which activity
                    e.target.value                           // New value
                  )}
                  min="0"                                    // Can't be negative
                  max="1440"                                 // Max 24 hours (1440 min)
                  placeholder="0"                            // Hint text
                />
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS: Back and Submit */}
        <div className="button-group">
          {/* Back Button: Returns to previous step */}
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          
          {/* Submit Button: Validates and proceeds */}
          <button type="submit" className="btn-primary">
            Calculate Results
          </button>
        </div>
      </form>
    </div>
  );
}

// Export component so other files can use it
export default ActivityTracker;
