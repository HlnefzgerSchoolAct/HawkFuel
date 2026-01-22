# 🔥 Hawk Fuel - Calorie & Activity Tracker

A modern Progressive Web App (PWA) built with React for tracking calories, calculating BMR/TDEE, and monitoring daily activities using the MET system.

**✨ NEW: Daily calorie tracking with localStorage! Log food, exercise, and track your progress in real-time.**

---

## 🎯 Features

### Core Features
- 📊 **BMR & TDEE Calculator** - Based on Mifflin-St Jeor equation
- 🎯 **Goal Setting** - Maintenance, weight loss, or weight gain
- 🏃 **Activity Tracking** - MET-based calorie burn calculator
- 💪 **6 Activities** - Walking, Running, Weight Lifting, Wrestling, Football, Cycling

### NEW: Daily Calorie Tracking
- 🍽️ **Food Logging** - Track everything you eat
- 🔥 **Exercise Logging** - Track calories burned
- 📈 **Real-time Totals** - See remaining calories instantly
- 💾 **localStorage** - All data persists (survives browser refresh!)
- 🌅 **Daily Reset** - Automatically resets at midnight
- 💡 **Smart Guidance** - Know exactly how much to eat/burn

---

## 📁 Project Structure

```
Hawk Fuel/
├── public/                    # Static files
│   ├── index.html            # Main HTML template
│   ├── manifest.json         # PWA manifest
│   ├── robots.txt            # Search engine rules
│   ├── favicon.ico           # App icon (add your own)
│   ├── logo192.png           # PWA icon 192x192 (add your own)
│   └── logo512.png           # PWA icon 512x512 (add your own)
│
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── UserProfile.js    # User info input form
│   │   ├── UserProfile.css   # Styling for user form
│   │   ├── ActivityTracker.js # Activity logging
│   │   ├── ActivityTracker.css # Activity styling
│   │   ├── Results.js        # Calculation results
│   │   ├── Results.css       # Results styling
│   │   ├── Dashboard.js      # Daily calorie tracker (NEW!)
│   │   └── Dashboard.css     # Dashboard styling (NEW!)
│   │
│   ├── utils/                # Utility functions (NEW!)
│   │   └── localStorage.js   # localStorage operations (NEW!)
│   │
│   ├── App.js                # Main app component
│   ├── App.css               # App-level styling
│   ├── index.js              # React entry point
│   ├── index.css             # Global styling
│   ├── serviceWorkerRegistration.js  # PWA service worker
│   ├── reportWebVitals.js    # Performance monitoring
│   ├── App.test.js           # Tests
│   └── setupTests.js         # Test configuration
│
├── package.json              # Dependencies and scripts
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── CALORIE_TRACKING_GUIDE.md # Daily tracking guide (NEW!)
├── FEATURE_LIST.md          # Feature documentation
├── FORMULAS.md              # Calculation formulas
├── MET_SYSTEM_GUIDE.md      # MET system guide
└── activity-calories.html   # Standalone calculator demo
```

---

## 🚀 Getting Started (Step-by-Step)

### Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/
2. Choose the **LTS version** (recommended)
3. Run the installer
4. Verify installation by opening Command Prompt and typing:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies

Open your terminal in VS Code and run:

```bash
npm install
```

This will install all required packages listed in `package.json`.

**What gets installed:**
- `react` - The React library
- `react-dom` - React DOM rendering
- `react-scripts` - Build tools and configuration
- `web-vitals` - Performance monitoring
- Testing libraries

### Step 3: Start the Development Server

```bash
npm start
```

This will:
- Start the development server
- Open your browser to http://localhost:3000
- Enable hot reloading (changes appear instantly)

### Step 4: Build for Production

When ready to deploy:

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## 📦 Required Packages (Already in package.json)

### Core Dependencies:
- **react** (^18.2.0) - UI library
- **react-dom** (^18.2.0) - DOM rendering
- **react-scripts** (5.0.1) - Build configuration
- **web-vitals** (^3.5.0) - Performance metrics

### Dev Dependencies:
- **@testing-library/react** - React testing utilities
- **@testing-library/jest-dom** - Jest matchers
- **@testing-library/user-event** - User interaction simulation

---

## 🎯 Features

### 1. User Profile Setup
- Age, gender, height, weight input
- Activity level selection
- Goal setting (maintain/lose/gain weight)
- Custom calorie adjustments

### 2. BMR Calculation
- Mifflin-St Jeor equation
- Gender-specific formulas
- Automatic unit conversions

### 3. TDEE Calculation
- Activity level multipliers
- Maintenance calorie calculation

### 4. Activity Tracking
- MET-based calorie burn
- 6 pre-loaded activities:
  - Walking (3.5 METs)
  - Running (10.0 METs)
  - Weight Lifting (5.0 METs)
  - Wrestling (6.0 METs)
  - Football Practice (8.0 METs)
  - Cycling (7.5 METs)

### 5. Personalized Results
- Daily calorie target
- Activity breakdown
- Total calories burned
- Adjusted daily intake

### 6. Daily Calorie Tracking (NEW!)
- 🍽️ **Food logging** with calorie input
- 🏃 **Exercise logging** with calories burned
- 📊 **Real-time summary cards** showing:
  - Daily target
  - Total eaten
  - Total burned
  - Remaining calories
- 💾 **localStorage persistence** - data survives browser refresh
- 🌅 **Automatic daily reset** at midnight
- 💡 **Smart guidance** - tells you exactly how much to eat/burn
- 📈 **Progress tracking** - see if you're on target, under, or over

**See [CALORIE_TRACKING_GUIDE.md](CALORIE_TRACKING_GUIDE.md) for detailed usage instructions!**

---

## 🎯 How to Use Hawk Fuel

### First Time Setup (Steps 1-3)

**Step 1: User Profile**
1. Enter your age, gender, height, and weight
2. Select your activity level (sedentary to extra active)
3. Choose your goal (maintain, lose, or gain weight)
4. Set custom calorie adjustment if needed
5. Click "Next"

**Step 2: Activity Tracker**
1. Select activities you'll do today
2. Enter minutes for each activity
3. See live calorie burn calculations
4. Click "Calculate Results"

**Step 3: Results**
1. View your BMR (Basal Metabolic Rate)
2. See your TDEE (Total Daily Energy Expenditure)
3. Check your daily calorie target
4. Review activity breakdown
5. Click "Continue to Daily Tracker"

### Daily Usage (Step 4: Dashboard)

**Every Day:**
1. **Log Food** 
   - Enter food name (e.g., "Grilled chicken")
   - Enter calories (e.g., 250)
   - Click "+ Add Food"
   - Repeat for all meals/snacks

2. **Log Exercise**
   - Enter exercise name (e.g., "Running")
   - Enter calories burned (e.g., 400)
   - Click "+ Add Exercise"
   - Repeat for all workouts

3. **Monitor Progress**
   - Check summary cards at top
   - See remaining calories
   - Follow guidance messages
   - Stay on target!

4. **Delete Mistakes**
   - Click ✕ button next to any entry
   - Totals update automatically

**All data saves automatically! Close browser and come back - it's still there.**

**Next day:** Food and exercise logs reset automatically at midnight. Your profile and daily target stay saved.

---

## 💻 Available Scripts

### `npm start`
Runs the app in development mode.  
Open http://localhost:3000 to view it in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.  
The build is optimized and ready to deploy.

### `npm run eject`
⚠️ **One-way operation!** Ejects from Create React App for full control.

---

## 📱 PWA Features

This app is a Progressive Web App (PWA), which means:

✅ **Install on mobile/desktop** - Add to home screen  
✅ **Offline capability** - Works without internet (after first load)  
✅ **Fast loading** - Cached resources  
✅ **App-like experience** - Full screen mode  

### To Use as PWA:

**On Mobile (Chrome/Safari):**
1. Open the app in your browser
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. Follow the prompts

**On Desktop (Chrome/Edge):**
1. Open the app
2. Look for install icon in address bar
3. Click "Install"

---

## 🎨 Customization Tips

### Change Colors:

Edit the gradient colors in CSS files:

```css
/* Current: Purple gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your preference */
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### Add More Activities:

Edit `src/components/ActivityTracker.js`:

```javascript
const ACTIVITIES = [
  { id: 'swimming', name: 'Swimming', met: 6.0, emoji: '🏊' },
  // Add more here
];
```

### Change Formulas:

Edit `src/components/Results.js` to modify calculations.

---

## 🔧 Troubleshooting

### Problem: `npm install` fails

**Solution:**
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

### Problem: Port 3000 already in use

**Solution:**
Set a different port in Windows:
```bash
set PORT=3001 && npm start
```

### Problem: Changes not appearing

**Solution:**
1. Stop the server (Ctrl+C)
2. Clear browser cache
3. Run `npm start` again

### Problem: Build fails

**Solution:**
1. Check for syntax errors in console
2. Ensure all imports are correct
3. Run `npm run build` again

---

## 📚 Learning Resources

### React Basics:
- [Official React Tutorial](https://react.dev/learn)
- [React Docs](https://react.dev)

### JavaScript:
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/)

### CSS:
- [MDN CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)

### PWA:
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## 🗂️ File Descriptions

### Configuration Files:

- **package.json** - Project metadata and dependencies
- **.gitignore** - Files to exclude from Git
- **public/manifest.json** - PWA configuration

### Entry Point:

- **src/index.js** - React entry point, renders App

### Main App:

- **src/App.js** - Main component with routing logic
- **src/App.css** - Global app styling

### Components:

1. **UserProfile.js** - Collects user information
2. **ActivityTracker.js** - Logs daily activities
3. **Results.js** - Displays calculations

### Utilities:

- **serviceWorkerRegistration.js** - Enables offline functionality
- **reportWebVitals.js** - Performance monitoring

---

## 🚀 Deployment Options

### Option 1: GitHub Pages
```bash
npm install --save gh-pages
# Add to package.json: "homepage": "https://yourusername.github.io/Hawk Fuel"
npm run build
npx gh-pages -d build
```

### Option 2: Netlify
1. Sign up at netlify.com
2. Drag and drop `build` folder
3. Done!

### Option 3: Vercel
1. Sign up at vercel.com
2. Import GitHub repository
3. Deploy automatically

---

## ✅ Next Steps

1. ✅ Install Node.js and npm
2. ✅ Run `npm install`
3. ✅ Run `npm start`
4. 📝 Customize colors and branding
5. 🎨 Add your own icons (logo192.png, logo512.png, favicon.ico)
6. 🧪 Test the app on your phone
7. 🚀 Build and deploy

---

## 🐛 Common Beginner Questions

**Q: What is React?**  
A: React is a JavaScript library for building user interfaces. It breaks your UI into reusable components.

**Q: What is a component?**  
A: A component is a reusable piece of UI code. Think of it like a LEGO block - you combine them to build your app.

**Q: What does `npm` do?**  
A: npm (Node Package Manager) installs and manages JavaScript packages (libraries) your project needs.

**Q: Can I use this offline?**  
A: Yes! After the first load, the PWA features allow offline use.

**Q: How do I add new features?**  
A: Create a new component in `src/components/` and import it into `App.js`.

---

## 📞 Need Help?

- Check `FORMULAS.md` for calculation details
- Check `MET_SYSTEM_GUIDE.md` for activity tracking
- Check `FEATURE_LIST.md` for feature documentation
- Open an issue on GitHub
- Ask in React community forums

---

## 📄 License

See LICENSE file for details.

---

## 🎉 You're Ready!

Run `npm start` and start building! 🚀
