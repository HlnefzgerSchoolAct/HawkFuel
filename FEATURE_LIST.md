# Hawk Fuel - Feature List

## Core Features

### 1. User Profile Setup
- **Personal Information**
  - Age (years)
  - Gender (Male/Female)
  - Height (inches or cm)
  - Weight (lbs or kg)
  - Activity level (Sedentary, Lightly Active, Moderately Active, Very Active, Extra Active)

### 2. BMR Calculation
- **Mifflin-St Jeor Equation** (most accurate for modern populations)
  - Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
  - Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
- Display explanation of what BMR means

### 3. Maintenance Calories Calculation
- **TDEE (Total Daily Energy Expenditure)**
  - Sedentary (little/no exercise): BMR × 1.2
  - Lightly Active (1-3 days/week): BMR × 1.375
  - Moderately Active (3-5 days/week): BMR × 1.55
  - Very Active (6-7 days/week): BMR × 1.725
  - Extra Active (athlete/physical job): BMR × 1.9

### 4. Goal Setting
- **Goal Types**
  - Maintain weight (TDEE calories)
  - Lose weight (TDEE - 250 to 500 calories) - Deficit
  - Gain weight (TDEE + 250 to 500 calories) - Surplus
- **Custom deficit/surplus slider**
  - Range: -750 to +750 calories
  - Default recommendations shown
- Display target daily calorie goal

### 5. Daily Activity Tracking
- **Preset Physical Activities** (with MET values)
  - Walking (3.5 METs)
  - Running (8.0 METs)
  - Basketball (6.5 METs)
  - Soccer (7.0 METs)
  - Weight Training (6.0 METs)
  - Swimming (6.0 METs)
  - Cycling (7.5 METs)
  - Yoga (2.5 METs)
  - HIIT Training (8.0 METs)
  - Sports Practice (5.0 METs)
- **Activity Input**
  - Select activity from dropdown
  - Enter duration in minutes
  - Calculate calories burned: (MET × weight in kg × duration in hours)
- **Daily activity log**
  - List all activities for the day
  - Show total calories burned
  - Allow deletion of logged activities

### 6. Food/Calorie Intake Tracking
- **Quick Entry**
  - Manual calorie entry (name + calories)
  - Meal categories (Breakfast, Lunch, Dinner, Snacks)
- **Daily food log**
  - List all foods eaten
  - Show total calories consumed
  - Allow deletion of logged items

### 7. Daily Progress Dashboard
- **Visual Displays**
  - Calorie goal (target)
  - Calories eaten (food intake)
  - Calories burned (exercise)
  - Net calories (eaten - burned)
  - Remaining calories (goal - net)
- **Progress Bar**
  - Visual bar showing progress toward goal
  - Color-coded (green = on track, yellow = close, red = over/under)
- **Daily Summary Card**
  - Clear breakdown of the day's numbers

### 8. Data Persistence
- **Local Storage**
  - Save user profile
  - Save daily logs (7-day history minimum)
  - Preserve data across sessions

### 9. Progressive Web App Features
- **Installable**
  - Add to home screen capability
  - App icon and splash screen
- **Offline Capable**
  - Service worker for offline functionality
  - Cache key resources
- **Responsive Design**
  - Mobile-first approach
  - Works on phones, tablets, and desktop

## Optional/Future Features
- Weekly/monthly progress charts
- Weight tracking over time
- Macro tracking (protein, carbs, fats)
- Water intake tracking
- Food database/search
- Barcode scanner
- Social features (coach view)
- Export data to CSV
- Dark mode

## Technical Requirements
- Pure HTML, CSS, JavaScript (beginner-friendly)
- No backend required (all client-side)
- Modern browser support
- Progressive enhancement approach
