# 📘 React Components Guide - Hawk Fuel

## For Complete Beginners

This guide explains the 3 main React components in Hawk Fuel and how they work.

---

## 🎯 What is a Component?

Think of a component like a **LEGO block** for your website:
- Each component is a reusable piece of UI
- Components can contain other components
- They manage their own data (state)
- They can receive data from parent components (props)

---

## 📦 Component #1: UserProfile

**File:** `src/components/UserProfile.js`

### What It Does:
Collects user's personal information and fitness goals.

### User Inputs:
1. **Age** (13-100 years)
2. **Gender** (Male/Female)
3. **Height** (Feet and Inches)
4. **Weight** (in pounds)
5. **Activity Level** (How active they are)
6. **Goal** (Maintain, Lose, or Gain weight)
7. **Calorie Adjustment** (if losing/gaining)

### Key React Concepts Used:

#### 1. **useState Hook**
```javascript
const [formData, setFormData] = useState({
  age: '',
  gender: 'male',
  // ... more fields
});
```

**What it does:**
- Creates a "state" variable (data that can change)
- `formData` = current values
- `setFormData` = function to update values

#### 2. **Controlled Inputs**
```javascript
<input
  name="age"
  value={formData.age}      // React controls the value
  onChange={handleChange}    // Updates state when user types
/>
```

**What it does:**
- React "controls" what shows in the input
- Single source of truth (state)
- Makes validation easier

#### 3. **Event Handling**
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;  // Get input name and value
  setFormData(prev => ({
    ...prev,        // Keep existing values
    [name]: value   // Update changed field
  }));
};
```

**What it does:**
- Runs when user types
- Extracts the field name and new value
- Updates only that field in state

#### 4. **Spread Operator (...)**
```javascript
setFormData(prev => ({
  ...prev,  // Copy all existing fields
  age: 16   // Update just age
}));
```

**What it does:**
- Copies all existing properties
- Lets you update just one field
- Keeps React's state immutable

#### 5. **Conditional Rendering**
```javascript
{formData.goal !== 'maintain' && (
  <div>
    {/* Calorie adjustment dropdown */}
  </div>
)}
```

**What it does:**
- Only shows content if condition is true
- `&&` means "if left side is true, show right side"
- In this case: Show adjustment only if goal isn't "maintain"

#### 6. **Props**
```javascript
function UserProfile({ onSubmit }) {
  // onSubmit is passed from parent component
}
```

**What it does:**
- Parent component passes functions/data
- Child component uses them
- Creates communication between components

### Full Example Flow:

```javascript
// 1. User types "16" in age input
<input onChange={handleChange} name="age" />

// 2. handleChange runs
const handleChange = (e) => {
  const { name, value } = e.target;  // name="age", value="16"
  setFormData(prev => ({
    ...prev,      // Keep all other fields
    age: "16"     // Update age to "16"
  }));
};

// 3. Component re-renders with new age
// 4. Input now shows "16"
```

---

## 📦 Component #2: ActivityTracker

**File:** `src/components/ActivityTracker.js`

### What It Does:
Lets users enter minutes for each physical activity.

### Features:
- Shows 6 activity cards (Walking, Running, Weight Lifting, Wrestling, Football, Cycling)
- Each card displays:
  - Emoji icon
  - Activity name
  - MET value (intensity)
  - Minutes input field
- Validates at least one activity has minutes
- Sends data to parent when submitted

### Key React Concepts Used:

#### 1. **Array of Objects (Data)**
```javascript
const ACTIVITIES = [
  { id: 'walking', name: 'Walking', met: 3.5, emoji: '🚶' },
  { id: 'running', name: 'Running', met: 10.0, emoji: '🏃' },
  // ... more activities
];
```

**What it does:**
- Stores activity data
- Each activity is an object with properties
- Easy to add/remove activities

#### 2. **map() Function**
```javascript
{ACTIVITIES.map(activity => (
  <div key={activity.id}>
    <h3>{activity.name}</h3>
    <span>{activity.emoji}</span>
  </div>
))}
```

**What it does:**
- Loops through array
- Creates a card for each activity
- Returns JSX for each item

#### 3. **key Prop**
```javascript
<div key={activity.id} className="activity-card">
```

**What it does:**
- React needs unique "key" for each item in a list
- Helps React track which items changed
- Improves performance

#### 4. **Template Literals**
```javascript
id={`activity-${activity.id}`}
// Results in: "activity-walking", "activity-running", etc.
```

**What it does:**
- Creates dynamic strings
- Uses backticks (`) instead of quotes
- `${variable}` inserts variable value

#### 5. **filter() Function**
```javascript
const activeActivities = ACTIVITIES
  .filter(activity => activities[activity.id] > 0);
```

**What it does:**
- Creates new array
- Only keeps items that meet condition
- In this case: Only activities with minutes > 0

#### 6. **Arrow Functions**
```javascript
onChange={(e) => handleActivityChange(activity.id, e.target.value)}
```

**What it does:**
- Short function syntax
- Passes multiple parameters
- Inline function definition

### Full Example Flow:

```javascript
// 1. User types "30" in "Running" input
<input onChange={(e) => handleActivityChange('running', e.target.value)} />

// 2. handleActivityChange runs
const handleActivityChange = (activityId, minutes) => {
  // activityId = 'running'
  // minutes = "30"
  
  setActivities(prev => ({
    ...prev,
    running: 30  // Update running to 30 minutes
  }));
};

// 3. State updates
// Before: { running: 0, walking: 0, ... }
// After:  { running: 30, walking: 0, ... }

// 4. Component re-renders
// 5. Input shows "30"
```

---

## 🔄 How Components Work Together

### Parent Component: App.js

```javascript
function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: User fills profile
  const handleProfileSubmit = (profile) => {
    setUserProfile(profile);
    setCurrentStep(2);  // Move to activities
  };

  // Step 2: User logs activities
  const handleActivitiesSubmit = (activityData) => {
    setActivities(activityData);
    setCurrentStep(3);  // Move to results
  };

  return (
    <div>
      {currentStep === 1 && (
        <UserProfile onSubmit={handleProfileSubmit} />
      )}
      
      {currentStep === 2 && (
        <ActivityTracker 
          userProfile={userProfile}
          onSubmit={handleActivitiesSubmit}
        />
      )}
      
      {currentStep === 3 && (
        <Results 
          userProfile={userProfile}
          activities={activities}
        />
      )}
    </div>
  );
}
```

### Data Flow:

```
App.js (Parent)
    ↓ passes onSubmit function
UserProfile (Child)
    ↓ user fills form
    ↓ calls onSubmit(formData)
App.js receives data
    ↓ saves to userProfile state
    ↓ changes currentStep to 2
    ↓ passes userProfile & onSubmit to ActivityTracker
ActivityTracker (Child)
    ↓ user enters minutes
    ↓ calls onSubmit(activities)
App.js receives data
    ↓ saves to activities state
    ↓ changes currentStep to 3
    ↓ passes userProfile & activities to Results
Results (Child)
    ↓ displays calculations
```

---

## 📚 React Concepts Cheat Sheet

### useState
```javascript
const [value, setValue] = useState(initialValue);
```
- Creates state variable
- `value` = current state
- `setValue` = update function
- `initialValue` = starting value

### Props
```javascript
function Component({ prop1, prop2 }) {
  // Use prop1 and prop2
}

// Parent passes props:
<Component prop1="hello" prop2={42} />
```

### Event Handlers
```javascript
const handleClick = (e) => {
  e.preventDefault();  // Stop default behavior
  // Do something
};

<button onClick={handleClick}>Click Me</button>
```

### Conditional Rendering
```javascript
{condition && <div>Show if true</div>}
{condition ? <div>True</div> : <div>False</div>}
```

### Lists
```javascript
{array.map(item => (
  <div key={item.id}>
    {item.name}
  </div>
))}
```

---

## 🎯 Common Patterns in Hawk Fuel

### Pattern 1: Controlled Form Input
```javascript
const [value, setValue] = useState('');

<input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Pattern 2: Form Submission
```javascript
const handleSubmit = (e) => {
  e.preventDefault();  // Don't refresh page
  // Validate
  // Send data to parent
  onSubmit(data);
};

<form onSubmit={handleSubmit}>
```

### Pattern 3: Object State Update
```javascript
setFormData(prev => ({
  ...prev,            // Keep other fields
  [fieldName]: value  // Update one field
}));
```

### Pattern 4: Array Filtering
```javascript
const filtered = array.filter(item => item.property > 0);
```

---

## 🐛 Common Beginner Mistakes

### ❌ Mistake #1: Mutating State Directly
```javascript
// WRONG
formData.age = 16;

// CORRECT
setFormData(prev => ({ ...prev, age: 16 }));
```

### ❌ Mistake #2: Forgetting Keys in Lists
```javascript
// WRONG
{array.map(item => <div>{item.name}</div>)}

// CORRECT
{array.map(item => <div key={item.id}>{item.name}</div>)}
```

### ❌ Mistake #3: Not Preventing Form Submit
```javascript
// WRONG
const handleSubmit = () => {
  // Form refreshes page!
};

// CORRECT
const handleSubmit = (e) => {
  e.preventDefault();  // Stop page refresh
};
```

### ❌ Mistake #4: Wrong onChange Syntax
```javascript
// WRONG
<input onChange={handleChange(value)} />

// CORRECT
<input onChange={(e) => handleChange(e.target.value)} />
```

---

## 🎓 Learning Progression

### Level 1: Understand the Structure
- Read through UserProfile.js
- Identify the parts: imports, state, functions, JSX
- Understand what each section does

### Level 2: Make Small Changes
- Change placeholder text
- Add console.log() to see data
- Modify min/max values

### Level 3: Add Features
- Add a new input field
- Add a new activity
- Change validation rules

### Level 4: Create Your Own
- Create a new component
- Connect it to App.js
- Make it work with state

---

## 🔍 How to Read the Code

### Step-by-Step Guide:

1. **Start at the top**
   - Read imports
   - See what the component uses

2. **Find the function definition**
   - `function ComponentName({ props })`
   - See what props it receives

3. **Look at useState**
   - What state does it manage?
   - What are the initial values?

4. **Read the handler functions**
   - What do they do?
   - When do they run?

5. **Study the JSX (return statement)**
   - What HTML does it create?
   - How does it use state/props?

6. **Follow the data flow**
   - User action → Event handler → State update → Re-render

---

## 🚀 Next Steps

1. **Run the app** - See components in action
2. **Add console.log()** - See state changes
3. **Modify text** - Change what displays
4. **Add new fields** - Practice form handling
5. **Create new component** - Build your own

---

## 📞 Questions?

### "Why do we need useState?"
Without it, when you change a variable, React doesn't know to re-render the component.

### "What's the spread operator (...) for?"
It copies all properties from an object/array, so you don't lose data when updating state.

### "Why do we use arrow functions?"
They're shorter and don't create their own `this` context (avoids bugs).

### "What's the difference between props and state?"
- **Props:** Data passed from parent (read-only)
- **State:** Data managed by component (can change)

---

**You've got this! Start with UserProfile.js and read through it slowly.** 🚀
