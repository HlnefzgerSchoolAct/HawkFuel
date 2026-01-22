# Hawk Fuel - Mobile-First UI Design

## Design Principles
- **Mobile-first**: Optimized for 375px width (iPhone standard)
- **Touch-friendly**: Minimum 44px touch targets
- **Clear hierarchy**: Large text for important numbers
- **Visual feedback**: Immediate response to all interactions
- **Beginner-friendly**: Clear labels, helpful hints, no jargon

---

## Screen 1: Welcome Screen

### Purpose
First impression and app introduction

### Inputs
**None** - This is a splash/landing screen

### Buttons
| Button | Style | Action |
|--------|-------|--------|
| Get Started | Primary (large, blue) | Navigate to Profile Setup |

### Displayed Calculations
**None**

### Feedback Messages
**None**

### Visual Elements
- **Logo placeholder**: `logo.jpg` (120px × 120px, centered)
- App name "Hawk Fuel" (32px, bold, black)
- Tagline "Your Fitness Companion" (16px, dark gray)
- Brief description: "Track calories, reach your strength & conditioning goals" (14px, gray)

### Layout Notes
- Full-screen centered content
- White background
- Logo at top (with spacing)
- Vertical spacing between elements
- Orange primary button at bottom third of screen (easy thumb reach)

---

## Screen 2: Profile Setup

### Purpose
Collect user data for BMR/TDEE calculations

### Inputs

| Field | Type | Placeholder | Validation | Help Text |
|-------|------|-------------|------------|-----------|
| Age | Number | "16" | 13-100 | "Enter your age in years" |
| Gender | Radio buttons | - | Required | None |
| Height (feet) | Number | "5" | 3-8 | None |
| Height (inches) | Number | "10" | 0-11 | "Total height" |
| Weight | Number | "165" | 50-500 | "Current weight in pounds" |
| Activity Level | Dropdown/Select | "Select..." | Required | See dropdown options |

**Activity Level Dropdown Options:**
```
Sedentary
  → Little to no exercise, desk job
  
Lightly Active
  → Light exercise 1-3 days/week
  
Moderately Active
  → Moderate exercise 3-5 days/week
  
Very Active
  → Hard exercise 6-7 days/week
  
Extra Active
  → Athlete or very physical job
```

### Buttons

| Button | Style | Action | State |
|--------|-------|--------|-------|
| Calculate My BMR | Primary (full width, orange bg, white text) | Validate form → Calculate → Navigate to Results | Disabled until all fields valid |
| Back | Secondary (black text link) | Return to Welcome | Always enabled |

### Displayed Calculations
**None** - Calculations happen on next screen

### Feedback Messages

**On Page Load:**
- None (clean form)

**Validation Errors (shown under each field):**
```
Age is required
Age must be between 13 and 100
Gender is required
Height is required
Height must be realistic (3-8 feet)
Weight is required
Weight must be between 50 and 500 lbs
Activity level is required
```

**Success:**
- No message - direct navigation to results screen

### Input Styling
- Label: 14px, semi-bold, black
- Input field: 48px height, 16px text, rounded corners, black border
- Help text: 12px, dark gray, italic
- Error text: 12px, orange-red, below field
- Error field: Orange border (2px)

### Progressive Enhancement
- Number inputs show numeric keyboard on mobile
- Dropdown shows native picker on mobile
- Auto-focus on first field

---

## Screen 3: BMR & TDEE Results

### Purpose
Display calculated metabolic values with explanations

### Inputs
**None** - Read-only display screen

### Buttons

| Button | Style | Action |
|--------|-------|--------|
| Set My Goal | Primary (full width, orange bg, white text) | Navigate to Goal Selection |
| Recalculate | Secondary (black text link) | Return to Profile Setup |

### Displayed Calculations

**BMR (Basal Metabolic Rate):**
```
┌─────────────────────────┐
│   📊 Your BMR          │
│                         │
│     1,650              │
│   calories/day         │
│                         │
└─────────────────────────┘
```
- Value: 32px, bold, orange
- Label: 14px, black
- Card: White background, black border
- Calculated using Mifflin-St Jeor:
  - Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
  - Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

**TDEE (Total Daily Energy Expenditure):**
```
┌─────────────────────────┐
│   🔥 Maintenance        │
│      Calories           │
│                         │
│     2,280              │
│   calories/day         │
│                         │
└─────────────────────────┘
```
- Value: 32px, bold, orange
- Label: 14px, black
- Card: White background, black border
- Calculated: BMR × Activity Multiplier

**Activity Multipliers:**
- Sedentary: 1.2
- Lightly Active: 1.375
- Moderately Active: 1.55
- Very Active: 1.725
- Extra Active: 1.9

### Feedback Messages

**Informational (always shown):**
```
ℹ️ What does this mean?

Your BMR is the calories your body burns at rest just to keep you alive.

Your maintenance calories (TDEE) include your daily activity. Eating this amount will maintain your current weight.
```

**Based on Results:**
- No special feedback - just clear explanations

##White background with black borders
- Clear visual separation
- Info section with light gray background, orange accent border
- Clear visual separation
- Info section with light blue background
- Comfortable spacing between sections

---

## Screen 4: Goal Selection

### Purpose
Set weight goal and calorie target

### Inputs

**Goal Type (Radio Cards):**
Three large, tappable cards:

| Card | Display | Calculation |
|------|---------|-------------|
| Maintain Weight | "2,280 calories" | TDEE + 0 |
| Lose Weight | "1,780 - 2,030 calories" | TDEE - 250 to -500 |
| Gain Weight | "2,530 - 2,780 calories" | TDEE + 250 to +500 |

**Deficit/Surplus Slider (appears when Lose/Gain selected):**

| Field | Type | Range | Default | Step |
|-------|------|-------|---------|------|
| Calorie Adjustment | Slider | -750 to +750 | ±500 | 50 |

**For Lose Weight:**
- Slider marks: -250, -500, -750
- Labels: "Moderate", "Recommended", "Aggressive"

**For Gain Weight:**
- Slider marks: +250, +500, +750
- Labels: "Slow", "Recommended", "Fast"

### Buttons

| Button | Style | Action | State |
|--------|-------|--------|-------|, orange bg, white text) | Save settings → Navigate to Dashboard | Enabled after goal selected |
| Back | Secondary (black rimary (full width) | Save settings → Navigate to Dashboard | Enabled after goal selected |
| Back | Secondary (text link) | Return to Results screen | Always enabled |

### Displayed Calculations

**Your Maintenance (always shown at top):**
```
Your maintenance: 2,280 cal/day
```
- 16px, regular, gray

**Selected Goal Card Highlight:**
- Orange border (3px), light orange background (#FFF7ED)

**Dynamic Calorie Target (updates with slider):**
```
┌─────────────────────────┐
│ Your Daily Target       │
│                         │
│      1,780             │
│    calories/day        │
│                         │
└─────────────────────────┘
```
- 28px, bold, orange
- Updates in real-time as slider moves
- Card: White background, orange accent border

**Calculation Formula:**
- Maintain: TDEE + 0
- Lose: TDEE + slider_value (negative)
- Gain: TDEE + slider_value (positive)

### Feedback Messages

**Below each goal option:**
```
🎯 Maintain Weight
"Stay at your current weight"

📉 Lose Weight
"Safe weight loss: 0.5-1.5 lbs/week"

📈 Gain Weight
"Healthy muscle gain: 0.5-1.5 lbs/week"
```

**Slider Guidance (shown when adjusting):**
```
Moderate (-250): ~0.5 lbs/week
Recommended (-500): ~1 lb/week
Aggressive (-750): ~1.5 lbs/week
```

**Warning (if aggressive selected):**
```
⚠️ Consult a coach before using aggressive deficits
```

### Interactive Behavior
- Tap goal card → Select + show slider (if applicable)
- Drag slider → Update target in real-time
- Target number animates when changed

---

## Screen 5: Main Dashboard (Home)

### Purpose
Central hub showing daily progress and quick actions

### Inputs
**None** - Display and navigation screen

### Buttons

| Button | Style | Action |
|--------|-------|--------|, orange bg, white text) | Navigate to Add Food screen |
| 🏃 Add Activity | Secondary (full width, white bg, orange border, orange text) | Navigate to Add Activity screen |
| ☰ Settings | Icon (top right header, black) | Navigate to Settings |
| 🗑️ Delete (on each log item) | Icon (right side, blackto Settings |
| 🗑️ Delete (on each log item) | Icon (right side) | Delete that entry |

### Displayed Calculations

**1. Daily Goal (static for the day):**
```
🎯 Daily Goal: 1,780 cal
```
- 18px, semi-bold

**2. Progress Bar:**
```
Progress
┌─────────────────────────┐
│███████████░░░░░░░░░░░░░│
└─────────────────────────┘
1,230 / 1,780
```
- Visual bar: Orange (primary color)
- Background: Light gray
- Border: Black (1px)
- Current/Goal: 16px, bold, black

**3. Summary Cards:**
```
┌───────────┬────────────┐
│ 🍽️ Eaten │ 🔥 Burned  │
│  1,420    │    190     │
│  calories │  calories  │
└───────────┴────────────┘
```
- Numbers: 24px, bold
- Labels: 12px, gray

**4. Net Calories:**
```
Net Calories: 1,230
```
- Formula: Eaten - Burned
- 18px, bold

**5. Remaining Calories:**
```
Remaining: 550 cal
```
- FormulaOrange (positive), Black (negative with ⚠️ icon
- 20px, bold
- Color: Green (positive), Red (negative)

**6. Status Indicator:**
```
✅ On Track
```
- Conditions:
  - ✅ On Track: Net within ±100 of goal (orange text)
  - ⚠️ Close to Limit: Net within ±200 of goal (black text)
  - ❌ Over Goal: Net > goal + 200 (black text)
  - ⚠️ Under Goal: Net < goal - 200 (black text)

### Feedback Messages

**Empty State (no entries yet):**
```
👋 Ready to start tracking!

Tap "Add Food" when you eat
Tap "Add Activity" when you exercise

Your progress will appear here.
```

**Motivational (based on progress):**
```
✅ On Track
Great job! You're right on target.
(Orange badge with white text)

⚠️ Close to Limit
Only 50 calories remaining for today.
(Light gray badge with black text)

❌ Over Goal
You're 200 calories over today's goal.
(Light gray badge with black text)

⚠️ Under Goal
You're 300 calories under. Make sure to fuel properly!
(Light gray badge with black text)
```

**Time-based:**
```
Good morning! [6am-12pm]
Good afternoon! [12pm-5pm]
Good evening! [5pm-10pm]
```

### Today's Log Display

**Each Food Entry:**
```
🍳 Breakfast                      🗑️
Oatmeal with berries
450 calories
```

**Each Activity Entry:**
```
🏃 Running                        🗑️
30 minutes
190 calories burned
```

**Time Display (optional for v1):**
```
Added 2 hours ago
```

### Real-Time Updates
- All calculations update immediately when:
  - Food entry added
  - Activity entry added
  - Entry deleted
- Progress bar animates to new value
- Status message updates

---

## Screen 6: Add Food

### Purpose
Quick food/meal logging

### Inputs

| Field | Type | Placeholder | Validation | Help Text |
|-------|------|-------------|------------|-----------|
| Food Name | Text | "e.g., Chicken sandwich" | 1-50 chars | "What did you eat?" |
| Meal Type | Dropdown | "Breakfast" | Required | None |
| Calories | Number | "450" | 1-5000 | "Total calories" |

**Meal Type Options:**
```
🍳 Breakfast
🥗 Lunch
🍽️ Dinner
🍪 Snack
```

### Buttons, orange bg, white text) | Validate → Save → Return to Dashboard | Disabled until calories entered |
| Cancel | Secondary (black text link) | Discard → Return to Dashboard | Always enabled |
| ✖ Close | Icon (top right, black State |
|--------|-------|--------|-------|
| Add Food | Primary (full width) | Validate → Save → Return to Dashboard | Disabled until calories entered |
| Cancel | Secondary (text link) | Discard → Return to Dashboard | Always enabled |
| ✖ Close | Icon (top right) | Same as Cancel | Always enabled |

### Displayed Calculations
**None** - User enters calories directly

### Feedback Messages

**On Page Load:**
```
Quick entry tip: Round to the nearest 10 calories
```

**Validation Errors:**
```
Food name is required
Calories must be a number
Calories must be between 1 and 5000
Meal type is required
``Orange background, white text
- `

**Success (after adding):**
- Brief toast message on Dashboard: "✓ Food added - 450 cal"
- Auto-dismiss after 2 seconds

**Common Calorie Guide (optional helper):**
```
💡 Common estimates:
Small snack: 100-200 cal
Regular meal: 400-600 cal
Large meal: 600-900 cal
```

### Input Behavior
- Food name: Auto-capitalize first letter
- Calories: Numeric keyboard on mobile
- Meal type: Defaults to current meal time:
  - 4am-11am → Breakfast
  - 11am-2pm → Lunch  
  - 2pm-5pm → Snack
  - 5pm-10pm → Dinner
  - 10pm-4am → Snack

---

## Screen 7: Add Activity

### Purpose
Log exercise and auto-calculate calories burned

### Inputs

| Field | Type | Placeholder | Validation | Help Text |
|-------|------|-------------|------------|-----------|
| Activity Type | Dropdown | "Select activity..." | Required | "What did you do?" |
| Duration | Number | "30" | 1-300 minutes | "How many minutes?" |

**Activity Type Options (with MET values):**
```
🚶 Walking (3.5 METs)
🏃 Running (8.0 METs)
🏀 Basketball (6.5 METs)
⚽ Soccer (7.0 METs)
🏋️ Weight Training (6.0 METs)
🏊 Swimming (6.0 METs)
🚴 Cycling (7.5 METs)
🧘 Yoga (2.5 METs)
💪 HIIT Training (8.0 METs)
⚾ Sports Practice (5.0 METs)
```

### Buttons

| Button | Style | Action | State |
|--------|-------|--------|-------|, orange bg, white text) | Validate → Save → Return to Dashboard | Disabled until duration entered |
| Cancel | Secondary (black text link) | Discard → Return to Dashboard | Always enabled |
| ✖ Close | Icon (top right, blacklink) | Discard → Return to Dashboard | Always enabled |
| ✖ Close | Icon (top right) | Same as Cancel | Always enabled |

### Displayed Calculations

**Calories Burned Preview (updates in real-time):**
```
┌─────────────────────────┐
│ Calories Burned:        │
│                         │
│       190              │
│     calories           │
│                         │
└─────────────────────────┘
```
- Updates as user types duration
- Formula: `MET × we
- Card: White background, orange accent bordekg × (duration_min / 60)`
- 28px, bold, orange color
- Shows "---" before activity and duration selected

**Calculation Details (small text below):**
```
Running (8.0 METs) × 30 min
Based on your weight: 165 lbs
```
- 12px, gray, italic
- Educational - helps students understand the math

### Feedback Messages

**On Page Load:**
```
Select your activity and enter the duration.
Calories will be calculated automatically.
```

**While Typing Duration:**
- Live calculation updates (no separate message)

**Validation Errors:**
```
Please select an activity
Duration is required
Duration must be between 1 and 300 minutes
```

**Orange background, white text
- Success (after adding):**
- Brief toast on Dashboard: "✓ Activity added - 190 cal burned"
- Auto-dismiss after 2 seconds

**Helpful Hints:**
```
💡 Tip: A typical workout is 30-60 minutes
```

### Interactive Behavior
- Duration input shows numeric keyboard on mobile
- Calculation updates instantly as duration changes
- MET value visible in dropdown (educational)
- Activity emoji makes selection more engaging

---

## Screen 8: Settings / Profile

### Purpose
View and update user information

### Inputs

**View Mode (default):**
- All fields displayed as read-only text

**Edit Mode (after clicking Edit Profile):**

| Field | Type | Validation |
|-------|------|------------|
| Age | Number | 13-100 |
| Gender | Radio | Required |
| Height | Two numbers | Feet: 3-8, Inches: 0-11 |
| Weight | Number | 50-500 lbs |
| Activity Level | Dropdown | Required |

### Buttons

**In View Mode:**

| Button | Style | Action |white bg, orange border, orange text) | Enter edit mode |
| Change Goal | Secondary (white bg, orange border, orange text) | Navigate to Goal Selection |
| Reset All Data | Destructive (white bg, black border, black text) | Show confirmation dialog |
| ← Back | Icon/text (header, blackutlined) | Navigate to Goal Selection |
| Reset All Data | Destructive (red text) | Show confirmation dialog |
| ← Back | Icon/text (header) | Return to Dashboard |

**In Edit Mode:**

| Button | Style | Action(orange bg, white text) | Validate → Recalculate → Save → Exit edit mode |
| Cancel | Secondary (white bg, black border, black text)------|
| Save Changes | Primary | Validate → Recalculate → Save → Exit edit mode |
| Cancel | Secondary | Discard changes → Exit edit mode |

**In Reset Confirmation Dialog:**

| Button | Style | Action |
|--------|-------|--------|black bg, white text, full) | Clear all data → Return to Welcome |
| Cancel | Secondary (white bg, orange border, orange text)ing | Destructive (red, full) | Clear all data → Return to Welcome |
| Cancel | Secondary | Close dialog |

### Displayed Calculations

**Profile Summary Section:**
```
📊 Your Profile
───────────────────────
Age: 16 years
Gender: Male
Height: 5'10" (178 cm)
Weight: 165 lbs (75 kg)
Activity: Moderately Active
```

**Goal Summary Section:**
```
🎯 Your Goal
───────────────────────
Goal: Lose Weight
Daily Target: 1,780 cal

BMR: 1,650 cal/day
TDEE: 2,280 cal/day
Deficit: -500 cal/day
```

**History Section (optional v1):**
```
📅 Last 7 Days
───────────────────────
Mon 1/20: 1,820 / 1,780 ✅
Sun 1/19: 1,650 / 1,780 ✅
Sat 1/18: 2,100 / 1,780 ⚠️
Fri 1/17: 1,750 / 1,780 ✅
Thu 1/16: 1,900 / 1,780 ⚠️
Wed 1/15: 1,700 / 1,780 ✅
Tue 1/14: 1,800 / 1,780 ✅

Average: 1,817 cal/day
```

### Feedback Messages

**View Mode:**
- None (clean display)

**Edit Mode Validation:**
```
Age must be between 13 and 100
Height must be realistic
Weight must be between 50 and 500 lbs
All fields are required
```

**After Saving Changes:**
```
✓ Profile updated
Your numbers have been recalculated.
```
- Toast message, auto-dismiss after 3 seconds

**Reset Confirmation Dialog:**
```
⚠️ Reset All Data?

This will delete:
• Your profile
• All food and activity logs
• Your goal settings

This cannot be undone.

[Cancel]  [Yes, Reset Everything]
```

**After Reset:**
- Navigate to Welcome screen (fresh start)

**If BMR/TDEE Changed:**
```
📊 Your calorie target has been updated based on your new weight.

Old target: 1,780 cal
New target: 1,750 cal
```

### App Settings Section

**Toggles and Options:**
```
⚙️ App Settings
───────────────────────
[ ] Dark Mode (toggle)

Units: ● Imperial  ○ Metric

Clear Today's Log [Button]
```

### Interactive Behavior
- Edit Profile → Fields become editable
- Weight change → Auto-recalculates BMR, TDEE, target
- Activity level change → Auto-recalculates TDEE, target
- Toggle switches for app settings
- Dangerous actions (reset) require confirmation

---

## Global UI Components

### Navigation Header

**Standard Header (most screens):**
```
┌─────────────────────────┐
│ ← Back    Screen Name  ☰│
└─────────────────────────┘
```
- Height: 56px
- Background: White
- Border-bottom: Black 1px
- Back button: Left side (black)
- Title: Center (black, semi-bold)
- Menu/Settings: Right side (black)

**Dashboard Header:**
```
┌─────────────────────────┐
│ [logo.jpg]  Hawk Fuel  ☰ │
└─────────────────────────┘
```
- Logo: 40px × 40px (left side)
- App name instead of back button (black, bold)
- Background: White with black bottom border

### Modal/Dialog Headers

**Add Food/Activity:**
```
┌─────────────────────────┐
│ ✖ Close    Add Food     │
└─────────────────────────┘
```
- Close icon: Left
- Title: Center

### Toast Messages

**Success Toast:**
```
┌─Orange background (#EA580C)
- White text
- Black border (1px)
- Bottom of screen
- Auto-dismiss: 2 seconds

**Error Toast:**
```
┌─────────────────────────┐
│ ❌ Please fill all fields│
└─────────────────────────┘
```
- Black background
- White text
- Orange border (2px)ill all fields│
└─────────────────────────┘
```
- Red background
- White text
- Bottom of screen
- Auto-dismiss: 3 seconds

### Loading States

**Button Loading:**
```
┌─────────────────────────┐
│     ⟳ Calculating...    │
└─────────────────────────┘
```
- Spinner + text
- Button disabled
- Prevents double-clicks

**Screen Loading:**
```
      ⟳ Loading...
```
- Centered spinner
- Minimal, fast

### Empty States

**No Food Logged:**
```
🍽️

No food logged yet today

Tap "Add Food" to get started
```

**No Activities Logged:**
```
🏃

No activities logged yet today

**Inspired by West Delaware High School theme**

### Primary Colors (Orange, Black, White)
```css
--primary-orange: #EA580C;      /* Primary actions, highlights */
--primary-orange-light: #FFF7ED; /* Hover states, backgrounds */
--primary-orange-dark: #C2410C;  /* Active states */

--primary-black: #000000;        /* Text, borders, headers */
--primary-white: #FFFFFF;        /* Backgrounds, button text */
```

### Usage
- **Orange (#EA580C)**: Primary buttons, links, selected states, progress bars, accents
- **Black (#000000)**: All text, borders, icons, secondary buttons (outlined)
- **White (#FFFFFF)**: Page backgrounds, card backgrounds, button text on orange

### Accent Colors (used sparingly)
```css
--accent-gray-light: #F5F5F5;   /* Subtle backgrounds */
--accent-gray: #E5E5E5;         /* Disabled states, dividers */
--accent-gray-dark: #666666;    /* Secondary text */
```

### Semantic Colors
```css
--success: #EA580C;    /* Orange - on track */
--warning: #000000;    /* Black - caution */
--error: #000000;      /* Black - errors with orange border */
--info: #EA580C;       /* Orange - information */
```

### Logo Integration
```css
--logo-size-small: 40px;   /* Header logo */
--logo-size-medium: 80px;  /* Screen headers */
--logo-size-large: 120px;  /* Welcome screen */
```

**Logo Placement:**
- Welcome Screen: 120px × 120px, centered above title
- Dashboard Header: 40px × 40px, left side before app name
- Settings/Profile: 60px × 60px, top of profile section
- All logos: Maintain aspect ratio, `logo.jpg` fileray-50: #f9fafb;   /* Background */
--gray-100: #f3f4f6;  /* Card background */
--gray-200: #e5e7eb;  /* Borders */
--gray-400: #9ca3af;  /* Disabled text */
--gray-600: #4b5563;  /* Secondary text */
--gray-900: #111827;  /* Primary text */
```

---

## Typography Scale

### Font Sizes
```css
--text-xs: 12px;    /* Help text, captions */
--text-sm: 14px;    /* Labels, secondary */
--text-base: 16px;  /* Body text */
--text-lg: 18px;    /* Emphasized text */
--text-xl: 20px;    /* Subheadings */
--text-2xl: 24px;   /* Section headers */
--text-3xl: 28px;   /* Calculations */
--text-4xl: 32px;   /* Hero numbers */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing System

### Spacing Scale (8px base)
```css
--space-1: 4px;
- Logo margin: 16px (all sides)
- Border width: 1px (standard), 2px (emphasis), 3px (selected)
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Application
- Input height: 48px (touch-friendly)
- Button height: 48px
- Card padding: 16px
- Section spacing: 24px
- Screen padding: 16px

---

## Responsive Breakpoints

### Mobile First Approach
```css
/* Base: Mobile (375px) */
/* Default styles */

/* Tablet: 768px+ */
@media (min-width: 768px) {
  /* Wider layouts, multi-column */
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  Black text on white: 21:1 (AAA compliant)
- White text on orange (#EA580C): 4.7:1 (AA compliant)
- All combinations meet accessibility standards
```

### Key Responsive Changes
- Mobile: Single column, full width
- Tablet: Max width 600px, centered, more padding
- Desktop: Max width 800px, side-by-side cards possible

---

## Accessibility Features

### Touch Targets
- Minimum size: 44px × 44px
- Spacing between: 8px minimum

### Color Contrast
- Text: WCAG AA compliant (4.5:1 for normal text)
- Important numbers: AAA compliant (7:1)

### Focus States
- Visible outline on keyboard focus
- Skip navigation available
- Form field focus indicators

### Screen Reader Support
- Semantic HTML (button, input, label)
- ARIA labels where needed
- Alt text for icons

### Error Handling
- Clear error messages
- Error icon + text
- Field-level validation
- Form-level validation summary

---

## Animation & Transitions

### Button Press
```css
transition: transform 0.1s;
active: scale(0.98);
```

### Page Transitions
```css
slide-in: 200ms ease-out;
fade: 150ms ease-in-out;
```

### Progress Bar
```css
width: transition 0.3s ease-out;
color: transition 0.2s;
```

### Number Changes
```css
count-up animation: 0.5s;
color-change: 0.2s;
```

### Toast Messages
```css
slide-up: 0.2s;
fade-out: 0.3s (after delay);
```

---

## Form Validation Patterns

### Real-Time Validation
- Validate on blur (after user leaves field)
- Show errors immediately
- Clear errors on fix

### Submit Validation
- Validate all on submit
- Focus first error field
- Show summary message

### Success States
- Green checkmark on valid field
- Positive feedback
- Enable submit button

---

## Data Persistence Strategy

### What to Store
```javascript
localStorage.setItem('userProfile', JSON.stringify({
  age, gender, height, weight, activityLevel
}));

localStorage.setItem('userGoal', JSON.stringify({
  goalType, calorieAdjustment, dailyTarget
}));

localStorage.setItem('todayLog', JSON.stringify({
  date, foodEntries[], activityEntries[]
}));

localStorage.setItem('history', JSON.stringify([
  { date, totalEaten, totalBurned, target }
]));
```

### When to Save
- Profile: On setup completion, on edit save
- Goal: On goal selection
- Log entries: Immediately on add/delete
- History: End of day (midnight)

### When to Load
- App startup: Load all
- Screen navigation: Load relevant data
- New day: Reset daily log, archive yesterday
