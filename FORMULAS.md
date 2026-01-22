# Hawk Fuel - Calculation Formulas

## Unit Conversions

### Weight: Pounds to Kilograms
```
weight_kg = weight_lbs ÷ 2.20462
```

**Example:**
```
165 lbs ÷ 2.20462 = 74.84 kg
```

### Height: Feet & Inches to Centimeters
```
total_inches = (feet × 12) + inches
height_cm = total_inches × 2.54
```

**Example:**
```
5 feet 10 inches
= (5 × 12) + 10
= 60 + 10
= 70 inches
= 70 × 2.54
= 177.8 cm
```

---

## BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation

### Formula for Men
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
```

### Formula for Women
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### What BMR Means
The number of calories your body burns at complete rest just to stay alive (breathing, circulation, cell production, etc.).

---

## Example Calculation: Male Student

### Given Inputs
```
Age: 16 years
Sex: Male
Height: 5 feet 10 inches
Weight: 165 lbs
```

### Step 1: Convert Weight to Kilograms
```
weight_kg = 165 ÷ 2.20462
weight_kg = 74.84 kg
```

### Step 2: Convert Height to Centimeters
```
total_inches = (5 × 12) + 10 = 70 inches
height_cm = 70 × 2.54 = 177.8 cm
```

### Step 3: Calculate BMR (Male Formula)
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5

BMR = (10 × 74.84) + (6.25 × 177.8) - (5 × 16) + 5

BMR = 748.4 + 1,111.25 - 80 + 5

BMR = 1,784.65 calories/day
```

**Rounded Result: 1,785 cal/day**

---

## Example Calculation: Female Student

### Given Inputs
```
Age: 15 years
Sex: Female
Height: 5 feet 4 inches
Weight: 130 lbs
```

### Step 1: Convert Weight to Kilograms
```
weight_kg = 130 ÷ 2.20462
weight_kg = 58.97 kg
```

### Step 2: Convert Height to Centimeters
```
total_inches = (5 × 12) + 4 = 64 inches
height_cm = 64 × 2.54 = 162.56 cm
```

### Step 3: Calculate BMR (Female Formula)
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

BMR = (10 × 58.97) + (6.25 × 162.56) - (5 × 15) - 161

BMR = 589.7 + 1,016 - 75 - 161

BMR = 1,369.7 calories/day
```

**Rounded Result: 1,370 cal/day**

---

## Maintenance Calories (TDEE - Total Daily Energy Expenditure)

### Formula
```
TDEE = BMR × Activity_Multiplier
```

### Activity Multipliers

| Activity Level | Description | Multiplier |
|----------------|-------------|------------|
| **Sedentary** | Little or no exercise, desk job | **1.2** |
| **Lightly Active** | Light exercise 1-3 days/week | **1.375** |
| **Moderately Active** | Moderate exercise 3-5 days/week | **1.55** |
| **Very Active** | Hard exercise 6-7 days/week | **1.725** |
| **Extra Active** | Athlete or very physical job | **1.9** |

---

## Example: Maintenance Calories

### Male Student (from above)
```
BMR: 1,785 cal/day
Activity Level: Moderately Active (exercises 4 days/week)
Activity Multiplier: 1.55

TDEE = 1,785 × 1.55
TDEE = 2,766.75 calories/day
```

**Rounded Result: 2,767 cal/day**

This is the number of calories to eat daily to **maintain current weight**.

### Female Student (from above)
```
BMR: 1,370 cal/day
Activity Level: Lightly Active (exercises 2 days/week)
Activity Multiplier: 1.375

TDEE = 1,370 × 1.375
TDEE = 1,883.75 calories/day
```

**Rounded Result: 1,884 cal/day**

---

## Weight Loss (Calorie Deficit)

### Formula
```
Daily_Target = TDEE - Deficit_Amount
```

### Deficit Recommendations

| Deficit | Weight Loss Rate | Use Case |
|---------|------------------|----------|
| **-250 cal/day** | ~0.5 lbs/week | Slow, sustainable |
| **-500 cal/day** | ~1 lb/week | **Recommended** |
| **-750 cal/day** | ~1.5 lbs/week | Aggressive (consult coach) |

### Science Behind It
```
1 pound of body fat = approximately 3,500 calories

Daily deficit × 7 days = Weekly calorie deficit
Weekly deficit ÷ 3,500 = Pounds lost per week

Example:
-500 cal/day × 7 days = -3,500 cal/week
-3,500 ÷ 3,500 = 1 lb/week
```

### Example: Male Student Wants to Lose Weight
```
TDEE: 2,767 cal/day
Goal: Lose 1 lb/week
Deficit: -500 cal/day

Daily_Target = 2,767 - 500
Daily_Target = 2,267 cal/day
```

**He should eat 2,267 calories per day to lose ~1 lb/week**

### Example: Female Student Wants to Lose Weight
```
TDEE: 1,884 cal/day
Goal: Lose 0.5 lb/week
Deficit: -250 cal/day

Daily_Target = 1,884 - 250
Daily_Target = 1,634 cal/day
```

**She should eat 1,634 calories per day to lose ~0.5 lb/week**

---

## Weight Gain (Calorie Surplus)

### Formula
```
Daily_Target = TDEE + Surplus_Amount
```

### Surplus Recommendations

| Surplus | Weight Gain Rate | Use Case |
|---------|------------------|----------|
| **+250 cal/day** | ~0.5 lbs/week | Lean muscle gain |
| **+500 cal/day** | ~1 lb/week | **Recommended** |
| **+750 cal/day** | ~1.5 lbs/week | Bulking (consult coach) |

### Example: Male Student Wants to Gain Muscle
```
TDEE: 2,767 cal/day
Goal: Gain 1 lb/week
Surplus: +500 cal/day

Daily_Target = 2,767 + 500
Daily_Target = 3,267 cal/day
```

**He should eat 3,267 calories per day to gain ~1 lb/week**

### Example: Female Student Wants to Gain Muscle
```
TDEE: 1,884 cal/day
Goal: Gain 0.5 lb/week
Surplus: +250 cal/day

Daily_Target = 1,884 + 250
Daily_Target = 2,134 cal/day
```

**She should eat 2,134 calories per day to gain ~0.5 lb/week**

---

## Calories Burned from Exercise (MET System)

### What is MET?

**MET = Metabolic Equivalent of Task**

A MET is a way to measure how much energy your body uses during physical activity compared to sitting at rest.

- **1 MET** = Sitting quietly, watching TV (your resting metabolic rate)
- **3 METs** = Activity burns 3 times more calories than resting
- **8 METs** = Activity burns 8 times more calories than resting

**Higher MET value = More intense activity = More calories burned**

### Calorie Burn Formula
```
Calories_Burned = MET × weight_kg × duration_hours
```

**Alternative (when using minutes):**
```
Calories_Burned = MET × weight_kg × (duration_minutes ÷ 60)
```

**MET** = Metabolic Equivalent of Task (how many times more energy than resting)

### MET Table for Common Student Activities

| Activity | MET Value | Intensity Level |
|----------|-----------|-----------------|
| **Walking (3 mph, moderate pace)** | **3.5** | Light |
| **Running (6 mph, jogging)** | **10.0** | Vigorous |
| **Weight Lifting (moderate effort)** | **5.0** | Moderate |
| **Weight Lifting (vigorous effort)** | **6.0** | Vigorous |
| **Wrestling (practice or match)** | **6.0** | Vigorous |
| **Football Practice** | **8.0** | Vigorous |
| Cycling (moderate pace) | 7.5 | Moderate |
| Basketball | 6.5 | Moderate-Vigorous |
| Soccer | 7.0 | Vigorous |
| Swimming (moderate) | 6.0 | Moderate |
| Yoga | 2.5 | Light |
| HIIT Training | 8.0 | Vigorous |
| Sports Practice (general) | 5.0 | Moderate |

---

## Example Calculations: Activity Calories

### Example 1: Walking

**Given:**
```
Activity: Walking (3 mph)
MET Value: 3.5
Student Weight: 165 lbs
Duration: 30 minutes
```

**Step 1: Convert weight to kg**
```
weight_kg = 165 ÷ 2.20462
weight_kg = 74.84 kg
```

**Step 2: Convert minutes to hours**
```
duration_hours = 30 ÷ 60
duration_hours = 0.5 hours
```

**Step 3: Calculate calories burned**
```
Calories = MET × weight_kg × duration_hours
Calories = 3.5 × 74.84 × 0.5
Calories = 130.97
```

**Result: 131 calories burned**

---

### Example 2: Running

**Given:**
```
Activity: Running (6 mph)
MET Value: 10.0
Student Weight: 150 lbs
Duration: 20 minutes
```

**Step 1: Convert weight to kg**
```
weight_kg = 150 ÷ 2.20462
weight_kg = 68.04 kg
```

**Step 2: Convert minutes to hours**
```
duration_hours = 20 ÷ 60
duration_hours = 0.333 hours
```

**Step 3: Calculate calories burned**
```
Calories = 10.0 × 68.04 × 0.333
Calories = 226.57
```

**Result: 227 calories burned**

---

### Example 3: Weight Lifting

**Given:**
```
Activity: Weight Lifting (moderate)
MET Value: 5.0
Student Weight: 180 lbs
Duration: 45 minutes
```

**Step 1: Convert weight to kg**
```
weight_kg = 180 ÷ 2.20462
weight_kg = 81.65 kg
```

**Step 2: Convert minutes to hours**
```
duration_hours = 45 ÷ 60
duration_hours = 0.75 hours
```

**Step 3: Calculate calories burned**
```
Calories = 5.0 × 81.65 × 0.75
Calories = 306.19
```

**Result: 306 calories burned**

---

### Example 4: Wrestling Practice

**Given:**
```
Activity: Wrestling
MET Value: 6.0
Student Weight: 155 lbs
Duration: 90 minutes
```

**Step 1: Convert weight to kg**
```
weight_kg = 155 ÷ 2.20462
weight_kg = 70.31 kg
```

**Step 2: Convert minutes to hours**
```
duration_hours = 90 ÷ 60
duration_hours = 1.5 hours
```

**Step 3: Calculate calories burned**
```
Calories = 6.0 × 70.31 × 1.5
Calories = 632.79
```

**Result: 633 calories burned**

---

### Example 5: Football Practice

**Given:**
```
Activity: Football Practice
MET Value: 8.0
Student Weight: 190 lbs
Duration: 90 minutes (1 hour 30 min)
```

**Step 1: Convert weight to kg**
```
weight_kg = 190 ÷ 2.20462
weight_kg = 86.18 kg
```

**Step 2: Convert minutes to hours**
```
duration_hours = 90 ÷ 60
duration_hours = 1.5 hours
```

**Step 3: Calculate calories burned**
```
Calories = 8.0 × 86.18 × 1.5
Calories = 1,034.16
```

**Result: 1,034 calories burned**

---

### Example 6: Multiple Activities in One Day

**Given:**
```
Student Weight: 150 lbs (68.04 kg)

Daily Activities:
- Walking to school: 20 minutes
- Weight lifting: 45 minutes
- Running: 15 minutes
```

**Walking Calculation:**
```
3.5 METs × 68.04 kg × (20 ÷ 60) hours
= 3.5 × 68.04 × 0.333
= 79.38 calories
```

**Weight Lifting Calculation:**
```
5.0 METs × 68.04 kg × (45 ÷ 60) hours
= 5.0 × 68.04 × 0.75
= 255.15 calories
```

**Running Calculation:**
```
10.0 METs × 68.04 kg × (15 ÷ 60) hours
= 10.0 × 68.04 × 0.25
= 170.10 calories
```

**Total Calories Burned:**
```
79.38 + 255.15 + 170.10 = 504.63 calories
```

**Result: 505 calories burned total**

---

## Why Use MET Values?

### Advantages:
1. **Scientifically Validated** - Based on extensive research
2. **Accounts for Body Weight** - Heavier people burn more calories
3. **Easy to Understand** - Simple multiplication formula
4. **Standardized** - Consistent across different apps and calculators
5. **Comprehensive** - MET values exist for hundreds of activities

### How METs Are Determined:
Scientists measure oxygen consumption during activities in laboratory settings. The more oxygen your body uses, the more calories you burn.

```
1 MET = 3.5 mL of oxygen per kg of body weight per minute
```

### Example: Male Student Runs for 30 Minutes
```
Activity: Running
MET: 8.0
Weight: 74.84 kg (from earlier conversion)
Duration: 30 minutes

Calories_Burned = 8.0 × 74.84 × (30 ÷ 60)
Calories_Burned = 8.0 × 74.84 × 0.5
Calories_Burned = 298.72 calories
```

**Rounded Result: 299 calories burned**

### Example: Female Student Does Yoga for 45 Minutes
```
Activity: Yoga
MET: 2.5
Weight: 58.97 kg (from earlier conversion)
Duration: 45 minutes

Calories_Burned = 2.5 × 58.97 × (45 ÷ 60)
Calories_Burned = 2.5 × 58.97 × 0.75
Calories_Burned = 110.57 calories
```

**Rounded Result: 111 calories burned**

---

## Daily Net Calories

### Formula
```
Net_Calories = Calories_Eaten - Calories_Burned_From_Exercise
```

### Example: Male Student's Day
```
Daily Target (for weight loss): 2,267 cal
Calories Eaten (food logged): 2,100 cal
Calories Burned (30 min running): 299 cal

Net_Calories = 2,100 - 299
Net_Calories = 1,801 cal

Remaining for the day = 2,267 - 1,801 = 466 cal
```

**He can eat 466 more calories and still meet his goal.**

### Example: Female Student's Day
```
Daily Target (for maintenance): 1,884 cal
Calories Eaten (food logged): 1,650 cal
Calories Burned (45 min yoga): 111 cal

Net_Calories = 1,650 - 111
Net_Calories = 1,539 cal

Remaining for the day = 1,884 - 1,539 = 345 cal
```

**She can eat 345 more calories and maintain her weight.**

---

## Complete Workflow Summary

### Input Collection
1. Get age (years)
2. Get sex (male/female)
3. Get height (feet and inches)
4. Get weight (lbs)
5. Get activity level (sedentary to extra active)
6. Get goal (maintain/lose/gain)
7. Get deficit or surplus amount (if applicable)

### Calculation Steps
1. **Convert units**
   - Weight: lbs → kg
   - Height: feet & inches → cm

2. **Calculate BMR**
   - Use male or female Mifflin-St Jeor formula

3. **Calculate TDEE (Maintenance)**
   - BMR × Activity Multiplier

4. **Calculate Daily Target**
   - Maintain: TDEE + 0
   - Lose: TDEE - Deficit
   - Gain: TDEE + Surplus

5. **Track Daily Progress**
   - Log food (calories eaten)
   - Log exercise (calculate calories burned)
   - Calculate net calories (eaten - burned)
   - Calculate remaining (target - net)

---

## JavaScript Implementation Notes

### Rounding Rules
- BMR: Round to nearest whole number
- TDEE: Round to nearest whole number
- Daily Target: Round to nearest whole number
- Calories Burned: Round to nearest whole number

### Variable Names (for coding)
```javascript
// Inputs
let age = 16;
let sex = "male"; // or "female"
let heightFeet = 5;
let heightInches = 10;
let weightLbs = 165;
let activityLevel = "moderately_active";
let goalType = "lose"; // "maintain", "lose", "gain"
let adjustment = -500; // deficit or surplus

// Conversions
let weightKg = weightLbs / 2.20462;
let totalInches = (heightFeet * 12) + heightInches;
let heightCm = totalInches * 2.54;

// BMR calculation
let bmr;
if (sex === "male") {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
} else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
}
bmr = Math.round(bmr);

// Activity multipliers
const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
};

// TDEE calculation
let tdee = bmr * activityMultipliers[activityLevel];
tdee = Math.round(tdee);

// Daily target
let dailyTarget = tdee + adjustment;
dailyTarget = Math.round(dailyTarget);

// Exercise calories burned
let caloriesBurned = met * weightKg * (durationMinutes / 60);
caloriesBurned = Math.round(caloriesBurned);

// Net calories
let netCalories = caloriesEaten - caloriesBurned;

// Remaining calories
let remainingCalories = dailyTarget - netCalories;
```

---

## Validation Rules

### Age
- Minimum: 13 years
- Maximum: 100 years
- Typical student: 14-18 years

### Height
- Minimum: 4'0" (48 inches / 122 cm)
- Maximum: 7'0" (84 inches / 213 cm)
- Typical student: 5'0" - 6'2"

### Weight
- Minimum: 80 lbs (36 kg)
- Maximum: 400 lbs (181 kg)
- Typical student: 100-220 lbs

### Activity Level
- Must select one of the 5 options
- Default suggestion: Moderately Active (for student athletes)

### Deficit/Surplus
- Minimum deficit: -750 cal/day
- Maximum surplus: +750 cal/day
- Recommended range: ±250 to ±500

### Exercise Duration
- Minimum: 1 minute
- Maximum: 300 minutes (5 hours)
- Typical: 30-60 minutes

### Food Calories
- Minimum: 1 calorie
- Maximum: 5,000 calories (per entry)
- Typical meal: 400-800 calories

---

## Error Handling

### Invalid Inputs
```
if (age < 13 || age > 100) {
    throw "Age must be between 13 and 100";
}

if (heightFeet < 3 || heightFeet > 8) {
    throw "Height must be realistic";
}

if (heightInches < 0 || heightInches > 11) {
    throw "Inches must be between 0 and 11";
}

if (weightLbs < 50 || weightLbs > 500) {
    throw "Weight must be between 50 and 500 lbs";
}
```

### Division by Zero
Not applicable in these formulas - all divisions are by constants.

### Extreme Results
```
// BMR should be reasonable
if (bmr < 800 || bmr > 3500) {
    console.warn("BMR seems unusual - verify inputs");
}

// TDEE check
if (tdee < 1000 || tdee > 6000) {
    console.warn("TDEE seems unusual - verify inputs");
}

// Daily target shouldn't be too low
if (dailyTarget < 1200) {
    console.warn("Daily target is very low - consult a professional");
}
```

---

## Example Scenarios for Testing

### Scenario 1: Small Female Student
```
Age: 14
Sex: Female
Height: 5'2" (62 inches / 157.48 cm)
Weight: 110 lbs (49.9 kg)
Activity: Lightly Active (1.375)
Goal: Maintain

BMR = (10 × 49.9) + (6.25 × 157.48) - (5 × 14) - 161
    = 499 + 984.25 - 70 - 161
    = 1,252 cal/day

TDEE = 1,252 × 1.375 = 1,722 cal/day
Target = 1,722 cal/day (maintenance)
```

### Scenario 2: Large Male Student
```
Age: 17
Sex: Male
Height: 6'3" (75 inches / 190.5 cm)
Weight: 200 lbs (90.72 kg)
Activity: Very Active (1.725)
Goal: Gain muscle (+500)

BMR = (10 × 90.72) + (6.25 × 190.5) - (5 × 17) + 5
    = 907.2 + 1,190.625 - 85 + 5
    = 2,018 cal/day

TDEE = 2,018 × 1.725 = 3,481 cal/day
Target = 3,481 + 500 = 3,981 cal/day
```

### Scenario 3: Average Student Losing Weight
```
Age: 16
Sex: Female
Height: 5'6" (66 inches / 167.64 cm)
Weight: 150 lbs (68.04 kg)
Activity: Moderately Active (1.55)
Goal: Lose weight (-500)

BMR = (10 × 68.04) + (6.25 × 167.64) - (5 × 16) - 161
    = 680.4 + 1,047.75 - 80 - 161
    = 1,487 cal/day

TDEE = 1,487 × 1.55 = 2,305 cal/day
Target = 2,305 - 500 = 1,805 cal/day
```

---

## References

### Mifflin-St Jeor Equation
- Published: 1990
- Considered more accurate than Harris-Benedict equation
- Validated for modern populations
- Source: MD Mifflin, ST St Jeor, et al. "A new predictive equation for resting energy expenditure in healthy individuals." The American Journal of Clinical Nutrition, 1990.

### MET Values
- Source: Ainsworth BE, et al. "2011 Compendium of Physical Activities." Medicine & Science in Sports & Exercise, 2011.

### Safe Weight Loss/Gain Rates
- CDC Recommendation: 1-2 lbs per week for weight loss
- Academy of Nutrition and Dietetics: 0.5-1 lb per week for healthy weight gain
