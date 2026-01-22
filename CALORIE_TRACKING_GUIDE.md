# 📊 Hawk Fuel - Daily Calorie Tracking Guide

## Overview

Hawk Fuel now includes **daily calorie tracking** with localStorage persistence! This means you can:

- ✅ Log food you eat
- ✅ Log exercise calories burned
- ✅ See real-time daily totals
- ✅ Track calories remaining
- ✅ All data saves automatically (survives browser refresh!)
- ✅ Resets daily at midnight

---

## How It Works

### Step-by-Step Flow

1. **Initial Setup** (Steps 1-3)
   - Enter your profile (age, weight, height, gender)
   - Select your activity level and goal
   - Log planned activities
   - See your calculated daily calorie target

2. **Daily Tracking** (Step 4 - Dashboard)
   - **Log Food**: Add what you eat with calorie amounts
   - **Log Exercise**: Add workouts with calories burned
   - **View Totals**: See your progress in real-time
   - **Get Guidance**: App tells you exactly how much to eat/burn

### Dashboard Features

#### 📊 Summary Cards

Four cards at the top show:

1. **🎯 Daily Target** - Your goal calories for the day
2. **🍽️ Eaten** - Total calories consumed
3. **🔥 Burned** - Total calories from exercise
4. **📈 Remaining** - How many calories left to reach goal

**Formula:**
```
Remaining = Daily Target - (Eaten - Burned)
```

#### 🍽️ Food Logging

**How to log food:**
1. Type food name (e.g., "Grilled chicken")
2. Enter calories (e.g., 250)
3. Click "+ Add Food"
4. Food appears in list below
5. Click ✕ to delete if you made a mistake

**Example entries:**
- Breakfast: Oatmeal - 300 cal
- Lunch: Turkey sandwich - 450 cal
- Snack: Apple - 95 cal
- Dinner: Salmon with rice - 600 cal

#### 🏃 Exercise Logging

**How to log exercise:**
1. Type exercise name (e.g., "Running")
2. Enter calories burned (e.g., 400)
3. Click "+ Add Exercise"
4. Exercise appears in list below
5. Click ✕ to delete if needed

**How to calculate calories burned:**
- Use the Activity Tracker (Step 2) to plan activities with MET values
- Or use online calculators
- Or use fitness tracker devices (Apple Watch, Fitbit, etc.)

**Example entries:**
- Morning run - 400 cal
- Weight training - 250 cal
- Basketball game - 500 cal

#### 💡 Guidance Messages

The app gives you helpful messages:

**✅ Under target:**
> You can eat **500 more calories** to reach your goal!

**🎯 Perfect:**
> Perfect! You've hit your target exactly!

**⚠️ Over target:**
> You're **200 calories over** your target.

---

## localStorage Explained (For Beginners)

### What is localStorage?

**localStorage** is like a notebook built into your web browser:

- **Persistent**: Data stays even after closing browser
- **Per-browser**: Each browser has its own storage
- **No server needed**: All data stored locally on your computer
- **Automatic**: Hawk Fuel saves everything for you

### What Gets Saved?

Hawk Fuel saves 5 things to localStorage:

1. **User Profile**
   - Your age, weight, height, gender
   - Activity level and goal
   - Custom calorie adjustments

2. **Daily Target**
   - Your calculated daily calorie goal
   - Based on BMR, TDEE, and goals

3. **Food Log**
   - All food entries for today
   - Name and calories for each item
   - Timestamps

4. **Exercise Log**
   - All exercise entries for today
   - Name and calories for each workout
   - Timestamps

5. **Current Date**
   - Today's date
   - Used to reset logs at midnight

### When Does Data Reset?

**Daily logs reset automatically at midnight:**

- Food log clears (new day = new meals)
- Exercise log clears (new day = new workouts)
- User profile stays (your info doesn't change daily)
- Daily target stays (your goal is consistent)

**Example:**
- Monday: Log breakfast, lunch, dinner
- Tuesday midnight: Food/exercise logs clear
- Tuesday: Start fresh logging for new day

### How to Clear All Data

Click the **"🔄 Start New Calculation"** button in the Dashboard to:
- Clear all localStorage data
- Return to Step 1 (User Profile)
- Start completely fresh

---

## Code Structure (For Students)

### New Files Created

#### 1. `src/utils/localStorage.js`

**Purpose**: All localStorage operations

**Key Functions:**
```javascript
// Save data
saveToLocalStorage(key, data)

// Load data
loadFromLocalStorage(key, defaultValue)

// Food logging
addFoodEntry(foodEntry)
deleteFoodEntry(entryId)

// Exercise logging
addExerciseEntry(exerciseEntry)
deleteExerciseEntry(entryId)

// Calculations
getTotalCaloriesEaten()
getTotalCaloriesBurned()
getRemainingCalories()
```

**How it works:**
1. Takes JavaScript objects
2. Converts to JSON strings (`JSON.stringify()`)
3. Saves to `localStorage.setItem()`
4. Loads with `localStorage.getItem()`
5. Converts back to objects (`JSON.parse()`)

#### 2. `src/components/Dashboard.js`

**Purpose**: Main daily tracking interface

**State Variables:**
```javascript
const [foodName, setFoodName] = useState('');
const [foodCalories, setFoodCalories] = useState('');
const [foodLog, setFoodLog] = useState([]);

const [exerciseName, setExerciseName] = useState('');
const [exerciseCalories, setExerciseCalories] = useState('');
const [exerciseLog, setExerciseLog] = useState([]);

const [caloriesEaten, setCaloriesEaten] = useState(0);
const [caloriesBurned, setCaloriesBurned] = useState(0);
const [remainingCalories, setRemainingCalories] = useState(0);
```

**Key Functions:**
- `handleAddFood()` - Adds food entry
- `handleAddExercise()` - Adds exercise entry
- `handleDeleteFood()` - Removes food entry
- `handleDeleteExercise()` - Removes exercise entry
- `calculateTotals()` - Updates all totals

**React Hooks Used:**
- `useState` - Manages component state
- `useEffect` - Loads data on mount, recalculates totals

#### 3. `src/components/Dashboard.css`

**Purpose**: Styles for Dashboard component

**Key Sections:**
- `.summary-cards` - Grid layout for top cards
- `.logging-section` - Two-column layout (food/exercise)
- `.log-form` - Input styling
- `.log-entry` - Individual entry styling
- `.guidance` - Helpful message styling

### Updated Files

#### 1. `src/App.js`

**Changes:**
- Added `dailyTarget` state
- Added `currentStep` 4 (Dashboard)
- Added `useEffect` to load saved profile
- Added `handleResultsComplete()` function
- Imports Dashboard component
- Imports localStorage utilities

**New Flow:**
```
Step 1 → Step 2 → Step 3 → Step 4 (Dashboard)
  ↑                              ↓
  └──────── Reset Button ────────┘
```

#### 2. `src/components/Results.js`

**Changes:**
- Added `onComplete` prop
- Added "Continue to Daily Tracker" button
- Calls `onComplete(dailyTarget)` on click
- Styled with `.button-group` for two buttons

---

## React Concepts Used

### State Management

**What is state?**
State is data that can change over time.

**Example:**
```javascript
const [foodLog, setFoodLog] = useState([]);
// foodLog = current value (starts as empty array)
// setFoodLog = function to update it
```

**When state updates, React re-renders the component.**

### useEffect Hook

**Purpose:** Run code at specific times

**Example 1: On mount (load data)**
```javascript
useEffect(() => {
  loadSavedData();
}, []); // Empty array = only run once
```

**Example 2: When dependencies change**
```javascript
useEffect(() => {
  calculateTotals();
}, [foodLog, exerciseLog]); // Run when these change
```

### Props (Properties)

**What are props?**
Props pass data from parent to child components.

**Example:**
```javascript
// App.js (parent)
<Dashboard 
  userProfile={userProfile}
  dailyTarget={dailyTarget}
  onReset={resetApp}
/>

// Dashboard.js (child)
function Dashboard({ userProfile, dailyTarget, onReset }) {
  // Can use these values here
}
```

### Event Handlers

**Pattern for handling user input:**

```javascript
// 1. State for input
const [foodName, setFoodName] = useState('');

// 2. onChange handler
<input 
  value={foodName}
  onChange={(e) => setFoodName(e.target.value)}
/>

// 3. Form submit handler
const handleAddFood = (e) => {
  e.preventDefault(); // Don't refresh page
  // Process the data
};
```

### Array Methods

**filter()** - Remove items
```javascript
const updatedLog = foodLog.filter(entry => entry.id !== entryId);
```

**map()** - Display items
```javascript
{foodLog.map(entry => (
  <div key={entry.id}>{entry.name}</div>
))}
```

**reduce()** - Calculate totals
```javascript
const total = foodLog.reduce((sum, entry) => sum + entry.calories, 0);
```

---

## Testing Guide

### What to Test

1. **Food Logging**
   - ✅ Add food entry → appears in list
   - ✅ Delete food entry → removed from list
   - ✅ Total updates correctly
   - ✅ Data persists after refresh

2. **Exercise Logging**
   - ✅ Add exercise → appears in list
   - ✅ Delete exercise → removed from list
   - ✅ Total updates correctly
   - ✅ Data persists after refresh

3. **Calculations**
   - ✅ Remaining = Target - (Eaten - Burned)
   - ✅ Summary cards show correct values
   - ✅ Guidance message updates

4. **localStorage**
   - ✅ Refresh page → data still there
   - ✅ Close browser → reopen → data still there
   - ✅ New day → logs reset
   - ✅ Reset button → all data cleared

### Test Scenarios

**Scenario 1: Basic Logging**
1. Add breakfast (300 cal)
2. Add lunch (500 cal)
3. Check total = 800 cal
4. Add morning run (400 cal burned)
5. Check remaining = Target - (800 - 400)

**Scenario 2: Persistence**
1. Add some food entries
2. Refresh page (F5)
3. Verify entries still there

**Scenario 3: Daily Reset**
1. Change computer date to tomorrow
2. Refresh page
3. Verify food/exercise logs cleared
4. Verify profile and target still saved

---

## Common Questions

### Q: Where is my data stored?

**A:** In your browser's localStorage. Open DevTools (F12) → Application tab → Local Storage → file:// to see it!

### Q: Can I access my data on another computer?

**A:** No. localStorage is per-browser, per-device. For multi-device sync, you'd need a database/server (future feature).

### Q: What happens if I clear browser data?

**A:** All Hawk Fuel data will be deleted. You'll start fresh from Step 1.

### Q: How accurate are the calorie calculations?

**A:** BMR/TDEE formulas are industry-standard (Mifflin-St Jeor). Activity calories use MET values from scientific research. However, individual metabolism varies - these are estimates!

### Q: Can I change my daily target later?

**A:** Yes! Click "Start New Calculation" to redo your profile and get a new target.

### Q: What if I log something by mistake?

**A:** Click the ✕ button next to any entry to delete it instantly.

---

## Future Enhancements (Ideas for Practice)

Want to improve Hawk Fuel? Try adding:

1. **Edit Entries**
   - Currently can only delete
   - Add ability to edit food/exercise names and calories

2. **Food Database**
   - Pre-populate common foods
   - Search by name
   - Auto-fill calories

3. **Exercise Database**
   - Pre-populate common exercises
   - Calculate calories based on duration and MET values
   - Integration with Step 2 (Activity Tracker)

4. **Weekly View**
   - Save last 7 days of data
   - Show weekly totals
   - Track progress over time

5. **Charts and Graphs**
   - Visualize daily calories
   - Show trends
   - Goal progress bars

6. **Meal Planning**
   - Plan tomorrow's meals
   - Set meal targets (breakfast, lunch, dinner)
   - Macro tracking (protein, carbs, fats)

7. **Export Data**
   - Download as CSV
   - Print daily report
   - Share with trainer/nutritionist

8. **Dark Mode**
   - Toggle dark/light theme
   - Save preference to localStorage

---

## Troubleshooting

### Issue: Data not saving

**Solution:**
1. Check browser console (F12) for errors
2. Verify localStorage is enabled in browser
3. Check if in private/incognito mode (localStorage may be limited)

### Issue: Totals not updating

**Solution:**
1. Check useEffect dependencies in Dashboard.js
2. Verify calculateTotals() is being called
3. Look for console errors

### Issue: Reset doesn't work

**Solution:**
1. Verify resetApp() clears all state
2. Check if localStorage.clear() is called
3. Hard refresh (Ctrl+Shift+R)

### Issue: Date not resetting

**Solution:**
1. Check getTodaysDate() function
2. Verify checkAndResetDaily() is called on load
3. Compare saved date vs current date in DevTools

---

## Learning Resources

### localStorage
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [JavaScript.info: localStorage](https://javascript.info/localstorage)

### React Hooks
- [React Docs: useState](https://react.dev/reference/react/useState)
- [React Docs: useEffect](https://react.dev/reference/react/useEffect)

### JSON
- [MDN: JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)

---

## Summary

Hawk Fuel now has a **complete daily calorie tracking system** with:

✅ Food logging with calorie input
✅ Exercise logging with calories burned
✅ Real-time daily totals and calculations
✅ Remaining calories display
✅ Helpful guidance messages
✅ localStorage persistence (survives refresh!)
✅ Automatic daily reset at midnight
✅ Clean, beginner-friendly code with comments
✅ Responsive design for all devices

**All features work offline - no server required!**

Ready to track your calories? Run `npm start` and complete Steps 1-3 to see the Dashboard! 🚀
