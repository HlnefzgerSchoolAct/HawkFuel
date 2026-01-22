# 📊 Weekly Graph Feature - Complete Guide

## Overview

Hawk Fuel now includes a **7-day line graph** that visualizes your calorie trends over the past week!

**What it shows:**
- 🔴 **Red line** - Calories eaten each day
- 🟠 **Orange line** - Calories burned through exercise
- 🔵 **Blue dashed line** - Your daily target (goal)

---

## 📚 Table of Contents

1. [How to Use](#how-to-use)
2. [Data Structure Explained](#data-structure-explained)
3. [How Data Updates](#how-data-updates)
4. [Technical Implementation](#technical-implementation)
5. [Chart.js Library](#chartjs-library)
6. [Code Walkthrough](#code-walkthrough)
7. [Customization Guide](#customization-guide)

---

## How to Use

### Viewing the Graph

1. **Open Dashboard** - Complete setup steps 1-3, then go to Dashboard
2. **Graph appears at top** - Shows last 7 days of data
3. **Hover over points** - See exact calorie values for each day
4. **Track trends** - Identify patterns in your eating/exercise habits

### Reading the Graph

**X-Axis (Horizontal):** Days of the week (Sun, Mon, Tue, etc.)
**Y-Axis (Vertical):** Calorie amounts (0 to max)

**Example:**
```
If Wednesday shows:
- Red line at 2100 = You ate 2100 calories
- Orange line at 450 = You burned 450 calories
- Blue line at 2000 = Your target was 2000 calories

Net intake: 2100 - 450 = 1650 calories (under target ✅)
```

### Understanding Patterns

**Good patterns:**
- 🟢 Red line close to blue target = Consistent eating
- 🟢 Orange line steady = Regular exercise
- 🟢 Lines smooth (not jagged) = Stable routine

**Watch for:**
- 🟡 Red line frequently above blue = Eating over target
- 🟡 Red line at 0 = Forgot to log food
- 🟡 Orange line at 0 = No exercise logged

---

## Data Structure Explained

### Storage in localStorage

**Key:** `hawkfuel_weekly_history`

**Format:** JSON object with dates as keys

```javascript
{
  "2026-01-16": { 
    eaten: 2100,   // Total calories eaten that day
    burned: 450,   // Total calories burned that day
    target: 2000   // Daily target for that day
  },
  "2026-01-17": { 
    eaten: 1950, 
    burned: 300, 
    target: 2000 
  },
  "2026-01-18": { 
    eaten: 2200, 
    burned: 500, 
    target: 2000 
  },
  "2026-01-19": { 
    eaten: 1800, 
    burned: 200, 
    target: 2000 
  },
  "2026-01-20": { 
    eaten: 2050, 
    burned: 400, 
    target: 2000 
  },
  "2026-01-21": { 
    eaten: 1900, 
    burned: 350, 
    target: 2000 
  },
  "2026-01-22": { 
    eaten: 2000, 
    burned: 300, 
    target: 2000 
  }
}
```

### Why This Structure?

**Date as key (YYYY-MM-DD):**
- ✅ Sorts correctly alphabetically
- ✅ No timezone confusion
- ✅ International standard (ISO 8601)
- ✅ Easy to look up specific dates

**Values as object:**
- ✅ Groups related data together
- ✅ Easy to add new fields later
- ✅ Clear what each number means

### Chart.js Data Format

The graph component converts the above into Chart.js format:

```javascript
{
  // X-axis labels (days of week)
  labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'],
  
  // Y-axis data (three lines)
  datasets: [
    {
      label: 'Calories Eaten',
      data: [2100, 1950, 2200, 1800, 2050, 1900, 2000],
      borderColor: 'rgb(231, 76, 60)',        // Red
      backgroundColor: 'rgba(231, 76, 60, 0.1)', // Light red fill
      tension: 0.3  // Curve smoothness
    },
    {
      label: 'Calories Burned',
      data: [450, 300, 500, 200, 400, 350, 300],
      borderColor: 'rgb(243, 156, 18)',       // Orange
      backgroundColor: 'rgba(243, 156, 18, 0.1)',
      tension: 0.3
    },
    {
      label: 'Target Calories',
      data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
      borderColor: 'rgb(52, 152, 219)',       // Blue
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      tension: 0.3,
      borderDash: [5, 5]  // Dashed line
    }
  ]
}
```

---

## How Data Updates

### The Complete Flow

```
┌─────────────────────────────────────────────────────────┐
│ USER ACTION: Logs food or exercise                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Dashboard.js: addFoodEntry() or addExerciseEntry()      │
│ - Saves to food_log or exercise_log                     │
│ - Updates foodLog or exerciseLog state                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ useEffect Hook: Detects state change                    │
│ - foodLog or exerciseLog changed!                       │
│ - Triggers calculateTotals()                            │
│ - Triggers saveDailyDataToHistory() ← NEW!              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ saveDailyDataToHistory() function                       │
│ 1. Get today's date (YYYY-MM-DD)                        │
│ 2. Calculate today's totals:                            │
│    - eaten = getTotalCaloriesEaten()                    │
│    - burned = getTotalCaloriesBurned()                  │
│    - target = loadDailyTarget()                         │
│ 3. Load existing weekly_history                         │
│ 4. Update today's data: history[today] = {...}          │
│ 5. Keep only last 7 days (delete older)                 │
│ 6. Save back to localStorage                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ WeeklyGraph component: Detects change                   │
│ - onRefresh prop changed (counts food + exercise)       │
│ - Calls loadGraphData()                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ getWeeklyGraphData() function                           │
│ 1. Load weekly_history from localStorage                │
│ 2. Get last 7 days (including today)                    │
│ 3. Create day labels (Sun, Mon, Tue, etc.)              │
│ 4. Extract data for each dataset                        │
│ 5. Format for Chart.js                                  │
│ 6. Return chartData object                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Chart.js renders the graph                              │
│ - Three lines drawn                                     │
│ - Tooltips configured                                   │
│ - Axes labeled                                          │
│ - User sees updated graph! ✅                            │
└─────────────────────────────────────────────────────────┘
```

### Step-by-Step Example

**Scenario:** User logs breakfast on Wednesday

1. **User inputs:**
   - Food: "Oatmeal"
   - Calories: 300

2. **Dashboard calls:**
   ```javascript
   addFoodEntry({ name: 'Oatmeal', calories: 300 })
   ```

3. **localStorage updates:**
   ```javascript
   hawkfuel_food_log: [
     { id: 1234567890, name: 'Oatmeal', calories: 300, timestamp: '...' }
   ]
   ```

4. **State updates:**
   ```javascript
   setFoodLog([...prev, newEntry])
   ```

5. **useEffect triggers:**
   ```javascript
   useEffect(() => {
     calculateTotals();        // Update summary cards
     saveDailyDataToHistory(); // Update weekly history ← NEW!
   }, [foodLog])
   ```

6. **saveDailyDataToHistory executes:**
   ```javascript
   const today = "2026-01-22"
   const eaten = 300  // Just this entry so far
   const burned = 0   // No exercise yet
   const target = 2000
   
   history["2026-01-22"] = { eaten: 300, burned: 0, target: 2000 }
   localStorage.setItem('hawkfuel_weekly_history', JSON.stringify(history))
   ```

7. **Graph refreshes:**
   - Detects data change
   - Reloads from localStorage
   - Wednesday's red line shows 300 calories
   - Blue target line shows 2000 calories

8. **User logs more food:**
   - Process repeats
   - Wednesday's data updates: `eaten: 300 + 450 = 750`
   - Graph updates automatically

---

## Technical Implementation

### Files Created/Modified

**New Files:**
1. `src/components/WeeklyGraph.js` - Graph component (370 lines)
2. `src/components/WeeklyGraph.css` - Graph styling (150 lines)

**Modified Files:**
1. `src/utils/localStorage.js` - Added history functions (180 lines added)
2. `src/components/Dashboard.js` - Integrated graph component

### Dependencies Added

```json
{
  "chart.js": "^4.x.x",
  "react-chartjs-2": "^5.x.x"
}
```

**Installed via:**
```bash
npm install chart.js react-chartjs-2
```

---

## Chart.js Library

### What is Chart.js?

**Chart.js** is the most popular JavaScript charting library:
- ⭐ 60,000+ GitHub stars
- 📦 Lightweight (40kb minified)
- 📊 8 chart types (Line, Bar, Pie, etc.)
- 📱 Fully responsive
- ♿ Accessible
- 🎨 Highly customizable
- 📚 Excellent documentation

**react-chartjs-2** is a React wrapper that makes Chart.js work seamlessly with React components.

### Why Chart.js?

**For beginners:**
- ✅ Simple API
- ✅ Great documentation
- ✅ Lots of examples
- ✅ Active community
- ✅ Easy to customize

**Alternatives considered:**
- Recharts - More complex, React-specific
- D3.js - Too advanced for beginners
- ApexCharts - Less popular, heavier

### Chart.js Components Used

In WeeklyGraph.js, we register these modules:

```javascript
ChartJS.register(
  CategoryScale,    // X-axis (categories like days)
  LinearScale,      // Y-axis (numbers like calories)
  PointElement,     // Dots on the line
  LineElement,      // Lines connecting dots
  Title,            // Chart title
  Tooltip,          // Hover info boxes
  Legend,           // Color key
  Filler            // Shaded area under lines
);
```

**Why register?**
Chart.js uses a modular system. You only load what you need, keeping bundle size small.

### Line Chart Anatomy

```
┌────────────────────────────────────────────────┐
│            7-Day Calorie Trends                │  ← Title
│  🔴 Eaten  🟠 Burned  🔵 Target                │  ← Legend
├────────────────────────────────────────────────┤
│ 2500                                    ◄      │
│ 2000        🔵━━━━━━━━━━━━━━━━━━━━━    ◄ Y-Axis
│ 1500   🔴●━━●━━●━━●━━●━━●━━●          │  (Calories)
│ 1000                                    ◄      │
│  500      🟠●━●━●━●━●━●━●━●            ◄      │
│    0                                    ◄      │
│     Sun Mon Tue Wed Thu Fri Sat               │
│     ▲─────────────────────────────▲           │
│            X-Axis (Days)                       │
└────────────────────────────────────────────────┘
```

---

## Code Walkthrough

### localStorage.js Functions

#### 1. saveDailyDataToHistory()

**Purpose:** Save today's totals to weekly history

```javascript
export const saveDailyDataToHistory = () => {
  // STEP 1: Get today's date
  const today = getTodaysDate(); // "2026-01-22"
  
  // STEP 2: Calculate today's totals
  const eaten = getTotalCaloriesEaten();   // Sum all food
  const burned = getTotalCaloriesBurned(); // Sum all exercise
  const target = loadDailyTarget();         // Get target
  
  // STEP 3: Load existing history
  const history = loadWeeklyHistory();
  // { "2026-01-21": {...}, "2026-01-20": {...}, ... }
  
  // STEP 4: Add/update today's data
  history[today] = {
    eaten: eaten,
    burned: burned,
    target: target
  };
  
  // STEP 5: Keep only last 7 days
  const dates = Object.keys(history).sort(); // Sort dates
  if (dates.length > 7) {
    const datesToKeep = dates.slice(-7); // Last 7
    const newHistory = {};
    datesToKeep.forEach(date => {
      newHistory[date] = history[date];
    });
    saveWeeklyHistory(newHistory);
  } else {
    saveWeeklyHistory(history);
  }
};
```

**Key Points:**
- Called every time food or exercise is logged
- Updates today's entry (doesn't duplicate)
- Automatically removes data older than 7 days
- Handles missing days gracefully

#### 2. getWeeklyGraphData()

**Purpose:** Convert history to Chart.js format

```javascript
export const getWeeklyGraphData = () => {
  // STEP 1: Load history
  const history = loadWeeklyHistory();
  
  // STEP 2: Calculate last 7 days
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  // Result: ['2026-01-16', '2026-01-17', ..., '2026-01-22']
  
  // STEP 3: Create day labels
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const labels = last7Days.map(dateStr => {
    const date = new Date(dateStr + 'T12:00:00');
    return dayNames[date.getDay()];
  });
  // Result: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']
  
  // STEP 4: Extract data
  const eatenData = [];
  const burnedData = [];
  const targetData = [];
  
  last7Days.forEach(dateStr => {
    const dayData = history[dateStr];
    if (dayData) {
      eatenData.push(dayData.eaten);
      burnedData.push(dayData.burned);
      targetData.push(dayData.target);
    } else {
      eatenData.push(0);
      burnedData.push(0);
      targetData.push(0);
    }
  });
  
  // STEP 5: Format for Chart.js
  return {
    labels: labels,
    datasets: [
      {
        label: 'Calories Eaten',
        data: eatenData,
        borderColor: 'rgb(231, 76, 60)',
        // ... more config
      },
      // ... other datasets
    ]
  };
};
```

**Key Points:**
- Always returns 7 days (even if some are empty)
- Missing days show as 0 (visible gap in graph)
- Day names calculated from dates (handles week boundaries)
- Colors match dashboard summary cards

### WeeklyGraph.js Component

#### Component Structure

```javascript
function WeeklyGraph({ onRefresh }) {
  // STATE: Hold graph data
  const [graphData, setGraphData] = useState(null);
  
  // EFFECT: Load data when component mounts
  useEffect(() => {
    loadGraphData();
  }, [onRefresh]);
  
  // FUNCTION: Fetch and format data
  const loadGraphData = () => {
    const data = getWeeklyGraphData();
    setGraphData(data);
  };
  
  // OPTIONS: Configure chart appearance
  const options = {
    responsive: true,
    plugins: { ... },
    scales: { ... }
  };
  
  // RENDER: Show chart or loading
  return (
    <div className="weekly-graph">
      {graphData ? (
        <Line data={graphData} options={options} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
```

#### Chart Options Explained

```javascript
const options = {
  // RESPONSIVE: Resize with container
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2, // Width:Height = 2:1
  
  plugins: {
    // LEGEND: Color key at top
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true, // Circles instead of squares
        padding: 15
      }
    },
    
    // TITLE: Main heading
    title: {
      display: true,
      text: '7-Day Calorie Trends',
      font: { size: 18, weight: 'bold' }
    },
    
    // TOOLTIP: Hover boxes
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.parsed.y.toLocaleString() + ' cal';
        }
      }
    }
  },
  
  scales: {
    // Y-AXIS: Calories
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return value.toLocaleString() + ' cal';
        }
      }
    },
    
    // X-AXIS: Days
    x: {
      grid: { display: false } // No vertical lines
    }
  }
};
```

---

## Customization Guide

### Change Colors

**In getWeeklyGraphData() function:**

```javascript
// Current colors
borderColor: 'rgb(231, 76, 60)',  // Red for eaten

// Change to green
borderColor: 'rgb(46, 204, 113)',
```

**Color palette:**
```javascript
// Flat UI Colors (recommended)
Red:    'rgb(231, 76, 60)'
Orange: 'rgb(243, 156, 18)'
Yellow: 'rgb(241, 196, 15)'
Green:  'rgb(46, 204, 113)'
Blue:   'rgb(52, 152, 219)'
Purple: 'rgb(155, 89, 182)'
Gray:   'rgb(149, 165, 166)'
```

### Change Graph Type

**Bar chart instead of line:**

```javascript
// In WeeklyGraph.js
import { Bar } from 'react-chartjs-2'; // Instead of Line

// In render
<Bar data={graphData} options={options} />
```

### Add More Data

**Add net calories line:**

```javascript
// In getWeeklyGraphData()
const netData = [];
last7Days.forEach(dateStr => {
  const dayData = history[dateStr];
  if (dayData) {
    netData.push(dayData.eaten - dayData.burned);
  } else {
    netData.push(0);
  }
});

// Add to datasets
{
  label: 'Net Calories',
  data: netData,
  borderColor: 'rgb(155, 89, 182)', // Purple
  tension: 0.3
}
```

### Change Time Range

**Show last 14 days instead of 7:**

```javascript
// In getWeeklyGraphData()
for (let i = 13; i >= 0; i--) { // Changed from 6 to 13
  // ...
}

// In saveDailyDataToHistory()
if (dates.length > 14) { // Changed from 7 to 14
  const datesToKeep = dates.slice(-14);
  // ...
}
```

---

## Testing Guide

### Test Scenarios

**1. Empty state (first day):**
- Expected: Graph shows only today with data, other 6 days at 0

**2. Add food:**
- Log breakfast
- Expected: Red line increases for today

**3. Add exercise:**
- Log workout
- Expected: Orange line increases for today

**4. Refresh page:**
- Close and reopen browser
- Expected: Graph still shows same data

**5. New day:**
- Change computer date to tomorrow
- Expected: Previous day's data visible, new day starts at 0

**6. 7+ days:**
- Manually add data for 10 days
- Expected: Only last 7 days shown

### Verification Checklist

✅ Graph loads on Dashboard
✅ Shows last 7 days (even if some empty)
✅ Red line matches calories eaten
✅ Orange line matches calories burned
✅ Blue line shows target
✅ Hover tooltips work
✅ Data persists after refresh
✅ Updates when logging food/exercise
✅ Responsive on mobile
✅ No console errors

---

## Troubleshooting

### Graph not showing

**Check:**
1. Are Chart.js packages installed? `npm list chart.js`
2. Any console errors? Open DevTools (F12)
3. Is WeeklyGraph imported in Dashboard?

**Solution:**
```bash
npm install chart.js react-chartjs-2
```

### Data not updating

**Check:**
1. Is saveDailyDataToHistory() being called?
2. Check localStorage: DevTools → Application → Local Storage
3. Look for 'hawkfuel_weekly_history' key

**Debug:**
```javascript
// Add to Dashboard.js useEffect
console.log('Saving daily data...', { foodLog, exerciseLog });
saveDailyDataToHistory();
```

### Wrong day labels

**Cause:** Timezone issues with Date object

**Solution:** Already handled in code by adding 'T12:00:00' to dateString:
```javascript
const date = new Date(dateStr + 'T12:00:00');
```

### Lines too jagged/straight

**Adjust tension:**
```javascript
tension: 0.3 // Default (slight curve)
tension: 0   // Straight lines
tension: 0.5 // More curved
```

---

## Performance Considerations

### Bundle Size

**Impact:**
- Chart.js: ~40kb gzipped
- react-chartjs-2: ~5kb gzipped
- Total: ~45kb added

**Acceptable for this app** (total bundle still under 200kb)

### Rendering Performance

- Graph re-renders only when data changes
- Chart.js uses Canvas (hardware accelerated)
- No performance issues with 7 data points

### localStorage Size

**Per entry:** ~100 bytes
**7 days:** ~700 bytes
**Total Hawk Fuel data:** ~5-10KB

**Well within limits** (localStorage max: 5-10MB per domain)

---

## Future Enhancements

### Ideas for Practice

1. **Monthly view**
   - Show last 30 days
   - Add date range selector

2. **Compare weeks**
   - Show this week vs last week
   - Highlight improvements

3. **Export graph**
   - Download as image
   - Print functionality

4. **Goal line**
   - Add weight loss/gain projection
   - Show if on track

5. **Annotations**
   - Mark special days (cheat days, sick days)
   - Add notes to data points

6. **Multiple charts**
   - Macros (protein, carbs, fats)
   - Water intake
   - Weight trend

---

## Summary

### What You Learned

**React Concepts:**
- ✅ Component integration
- ✅ useEffect for data loading
- ✅ Props for triggering updates
- ✅ Conditional rendering

**JavaScript Concepts:**
- ✅ Date manipulation
- ✅ Array methods (map, filter, sort, slice)
- ✅ Object operations
- ✅ Data transformation

**Chart.js:**
- ✅ Module registration
- ✅ Dataset configuration
- ✅ Options customization
- ✅ Responsive design

**Data Management:**
- ✅ localStorage structure
- ✅ Historical data storage
- ✅ Data retention policies
- ✅ Format conversion

### Key Takeaways

1. **Data structure matters** - Well-designed data makes everything easier
2. **Libraries save time** - Chart.js handles complex rendering
3. **User experience** - Visual data is more useful than numbers
4. **Modularity** - Graph component is independent and reusable

---

## Resources

### Chart.js Documentation
- [Official Docs](https://www.chartjs.org/docs/latest/)
- [Examples](https://www.chartjs.org/docs/latest/samples/information.html)
- [React Integration](https://react-chartjs-2.js.org/)

### Learning More
- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [Chart.js Tutorials](https://www.youtube.com/results?search_query=chart.js+tutorial)

---

**Congratulations!** You now have a fully functional 7-day calorie tracking graph! 📊🎉
