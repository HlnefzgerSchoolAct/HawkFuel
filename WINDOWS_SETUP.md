# 🪟 Windows Setup Guide for Hawk Fuel

## For Complete Beginners - Step by Step

---

## ✅ Step 1: Install Node.js

### Why?
Node.js includes `npm`, which we need to install React and run the project.

### How to Install:

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Click the **LTS** button (recommended version)
   - Download will start automatically

2. **Run the Installer:**
   - Open the downloaded `.msi` file
   - Click "Next" through all steps
   - **Important:** Check the box that says "Automatically install the necessary tools"
   - Click "Install"
   - Wait for completion (may take a few minutes)

3. **Verify Installation:**
   - Press `Win + R`
   - Type `cmd` and press Enter
   - In the black window, type:
     ```
     node --version
     ```
   - You should see something like: `v20.11.0`
   - Then type:
     ```
     npm --version
     ```
   - You should see something like: `10.2.4`

✅ **If you see version numbers, Node.js is installed!**

---

## ✅ Step 2: Open Project in VS Code

### If You Don't Have VS Code:
1. Download from: https://code.visualstudio.com/
2. Install it (click Next through everything)

### Open Hawk Fuel Project:
1. Open VS Code
2. Click **File** → **Open Folder**
3. Navigate to your Hawk Fuel folder
4. Click **Select Folder**

---

## ✅ Step 3: Open Terminal in VS Code

### Method 1:
- Press `Ctrl + ` (that's the backtick key, usually above Tab)

### Method 2:
- Click **Terminal** menu → **New Terminal**

### Method 3:
- Click **View** menu → **Terminal**

You should see a panel at the bottom of VS Code with a command line.

---

## ✅ Step 4: Install Project Dependencies

In the terminal, type:

```bash
npm install
```

Press **Enter** and wait.

### What's Happening?
- npm is downloading all required packages
- This might take 2-5 minutes
- You'll see lots of text scrolling - that's normal!
- When done, you'll see your cursor blinking again

### Troubleshooting:

**Problem:** "npm is not recognized"  
**Solution:** Node.js isn't installed properly. Restart your computer and try Step 1 again.

**Problem:** Installation fails with errors  
**Solution:** 
1. Close VS Code
2. Delete the `node_modules` folder (if it exists)
3. Open VS Code again
4. Run `npm install` again

---

## ✅ Step 5: Start the Development Server

In the same terminal, type:

```bash
npm start
```

Press **Enter**.

### What's Happening?
- React development server is starting
- Your default browser will open automatically
- You'll see Hawk Fuel running at http://localhost:3000
- **Don't close the terminal!** The server needs to keep running

### You Should See:
- A beautiful purple gradient app
- "Hawk Fuel" header
- A form asking for your information

🎉 **Congratulations! Your app is running!**

---

## 🔄 Daily Workflow

### Starting Your Work:
1. Open VS Code
2. Open the Hawk Fuel folder
3. Open terminal (`Ctrl + backtick`)
4. Type: `npm start`
5. Browser opens automatically
6. Start coding!

### Making Changes:
1. Edit any file in the `src/` folder
2. **Save the file** (Ctrl + S)
3. Browser automatically refreshes
4. See your changes instantly!

### Stopping the Server:
- In the terminal, press: `Ctrl + C`
- Type `Y` when asked
- Server stops

---

## 📁 Where to Make Changes

### Want to change colors?
- Edit files ending in `.css`
- Example: `src/App.css`, `src/components/UserProfile.css`

### Want to change text?
- Edit files ending in `.js`
- Look for text inside quotes like `"Hello World"`

### Want to add activities?
- Open: `src/components/ActivityTracker.js`
- Find the `ACTIVITIES` array
- Add new activities following the pattern

---

## 🎨 Easy Customizations for Beginners

### Change the App Title:
1. Open `public/index.html`
2. Find: `<title>Hawk Fuel - Calorie Tracker</title>`
3. Change to whatever you want
4. Save

### Change the Main Color:
1. Open `src/App.css`
2. Find: `#667eea` (purple color)
3. Replace with your color code
   - Get colors from: https://flatuicolors.com/
4. Save and see changes instantly!

### Change Activity Names:
1. Open `src/components/ActivityTracker.js`
2. Find the `ACTIVITIES` array
3. Change the `name` property
4. Save

---

## 🐛 Common Windows Issues

### Issue 1: "Scripts disabled"
**Error:** "running scripts is disabled on this system"

**Fix:**
1. Open PowerShell as Administrator (search "PowerShell" → Right-click → Run as Admin)
2. Type: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Type `Y` and press Enter
4. Close PowerShell
5. Try `npm start` again

### Issue 2: Port 3000 in use
**Error:** "Port 3000 is already in use"

**Fix - Option 1:**
1. Press `Ctrl + C` in terminal
2. Close any other terminals
3. Try `npm start` again

**Fix - Option 2:**
1. In terminal, type: `set PORT=3001 && npm start`
2. App will open on port 3001 instead

### Issue 3: Can't find files
**Error:** "Cannot find module 'react'"

**Fix:**
1. Make sure you're in the right folder
2. In terminal, type: `cd /d C:\path\to\Hawk Fuel`
3. Run `npm install` again

---

## 📝 Terminal Commands Cheat Sheet

```bash
# Install packages
npm install

# Start development server
npm start

# Stop the server
Ctrl + C (then type Y)

# Build for production
npm run build

# Run tests
npm test

# See current folder
cd

# Change folder
cd folder-name

# Go back one folder
cd ..

# List files in current folder
dir

# Clear terminal
cls
```

---

## 🚀 Building for Production (When Done)

### Create Production Build:
```bash
npm run build
```

### What You Get:
- A `build/` folder appears
- Contains optimized, compressed files
- Ready to upload to a web host
- Much smaller and faster than development version

### Where to Deploy:
1. **Netlify** (Easiest for beginners)
   - Go to: https://www.netlify.com/
   - Drag and drop the `build` folder
   - Get a free URL instantly!

2. **GitHub Pages** (Free)
   - Push code to GitHub
   - Enable GitHub Pages in settings
   - Your app is live!

3. **Vercel** (Fast and free)
   - Go to: https://vercel.com/
   - Import your GitHub repo
   - Automatic deployment!

---

## 🎓 Learning Path for Beginners

### Week 1: Get Comfortable
- ✅ Install everything
- ✅ Run the app
- ✅ Change colors and text
- ✅ Understand the file structure

### Week 2: Learn React Basics
- 📚 Read: https://react.dev/learn
- 🎬 Watch: React tutorials on YouTube
- 💡 Understand: Components, Props, State

### Week 3: Customize Your App
- 🎨 Add your own activities
- 🔧 Modify calculations
- 🌈 Create your own theme

### Week 4: Advanced Features
- 📱 Test PWA features
- 🚀 Deploy online
- 🎉 Share with friends!

---

## 📞 Getting Help

### If Something Breaks:

1. **Read the error message** - It usually tells you what's wrong
2. **Check the README.md** - Solutions might be there
3. **Google the error** - Copy/paste into Google
4. **Check your code** - Did you save all files?
5. **Restart everything** - Close VS Code, open again, `npm start`

### Useful Resources:
- React Docs: https://react.dev/
- Stack Overflow: https://stackoverflow.com/
- YouTube: Search "React tutorial for beginners"
- VS Code Tips: https://code.visualstudio.com/docs

---

## ✨ Pro Tips for Windows Users

1. **Use VS Code's integrated terminal** - Don't use Command Prompt separately
2. **Save often** - Press `Ctrl + S` frequently
3. **Auto-save** - Go to File → Auto Save (enable it!)
4. **Extensions** - Install "ES7+ React/Redux/React-Native snippets" in VS Code
5. **Prettier** - Install "Prettier" extension for auto-formatting
6. **Keyboard shortcuts:**
   - `Ctrl + P` - Quick file open
   - `Ctrl + Shift + F` - Search in all files
   - `Ctrl + /` - Comment/uncomment code
   - `Alt + Up/Down` - Move line up/down

---

## 🎉 You're All Set!

Run this command to start:
```bash
npm start
```

Happy coding! 🚀
