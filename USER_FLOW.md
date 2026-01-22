# Hawk Fuel - User Flow

## First-Time User Experience

### 1. Welcome Screen
**User arrives at app**
↓
**Sees welcome message and brief explanation**
- "Track your calories for strength & conditioning class"
- "Calculate your BMR and reach your fitness goals"
↓
**Clicks "Get Started" button**

### 2. Profile Setup
**User fills out profile form**
- Enter age
- Select gender
- Enter height
- Enter current weight
- Select activity level
↓
**Clicks "Calculate My Numbers"**
↓
**App calculates and displays:**
- BMR (with explanation)
- Maintenance calories (TDEE)

### 3. Goal Selection
**User sets their goal**
- View current TDEE
- Choose goal type:
  - Maintain weight
  - Lose weight (select deficit amount)
  - Gain weight (select surplus amount)
↓
**App displays daily calorie goal**
↓
**Clicks "Start Tracking"**

## Daily Use Flow

### 4. Main Dashboard
**User lands on dashboard**
↓
**Views today's summary:**
- Daily calorie goal
- Calories eaten (starts at 0)
- Calories burned from exercise (starts at 0)
- Net calories
- Remaining calories
- Progress bar

### 5A. Log Food (Track Calories Eaten)
**From dashboard, clicks "Add Food"**
↓
**Food entry screen opens**
- Enter food name
- Select meal type (Breakfast/Lunch/Dinner/Snack)
- Enter calories
↓
**Clicks "Add"**
↓
**Returns to dashboard**
- Food appears in today's log
- "Calories eaten" updates
- Progress bar updates

**Repeat as needed throughout the day**

### 5B. Log Exercise (Track Calories Burned)
**From dashboard, clicks "Add Activity"**
↓
**Activity entry screen opens**
- Select activity from dropdown (Walking, Running, Basketball, etc.)
- Enter minutes performed
- App calculates calories burned automatically
↓
**Clicks "Add"**
↓
**Returns to dashboard**
- Activity appears in today's log
- "Calories burned" updates
- Net calories update
- Progress bar updates

**Repeat as needed throughout the day**

### 6. View Progress Throughout Day
**User checks dashboard multiple times**
↓
**Progress updates in real-time:**
- See how much they can still eat
- See if they're on track with goal
- Visual feedback via colored progress bar

### 7. End of Day
**User reviews day's totals**
- View all food entries
- View all activities
- Check final numbers against goal
↓
**Data automatically saved to history**

## Returning User Flow

### Daily Return
**User opens app**
↓
**Dashboard loads with:**
- Today's fresh tracking (new day)
- User profile remembered
- Goal settings remembered
↓
**Continues with normal daily tracking (steps 5-7)**

### Update Profile/Goals
**From dashboard, clicks "Settings" or "Profile"**
↓
**Can update:**
- Weight (if changed)
- Activity level
- Goal type
- Calorie target
↓
**Recalculates BMR/TDEE if needed**
↓
**Returns to dashboard with updated targets**

## Key User Paths Summary

```
FIRST TIME:
Welcome → Profile Setup → Goal Selection → Dashboard → Daily Tracking

DAILY USE:
Dashboard → Add Food/Activity → View Progress → Repeat

UPDATE SETTINGS:
Dashboard → Settings → Update Info → Dashboard (with new targets)

QUICK CHECK:
Open App → See Dashboard Summary → Close App
```

## User Actions at Each Step

| Screen | User Can... |
|--------|-------------|
| Welcome | Start setup |
| Profile Setup | Enter personal info, calculate BMR |
| Goal Selection | Choose weight goal, set calorie target |
| Dashboard | View progress, add food, add activity, access settings |
| Add Food | Enter food details, save entry, cancel |
| Add Activity | Select activity, enter duration, save entry, cancel |
| Settings | Update profile, change goals, view history |

## Flow Principles
- **Minimal clicks**: 2-3 taps to log anything
- **Always return to dashboard**: Central hub for all actions
- **Clear progress feedback**: User always knows where they stand
- **No dead ends**: Every screen has clear next action
- **Data persists**: Nothing lost on refresh or close
