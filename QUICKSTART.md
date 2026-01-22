# ⚡ Quick Start Guide - Hawk Fuel

## 🎯 For Complete Beginners

This is a **3-step guide** to get Hawk Fuel running on your Windows computer.

---

## ✅ Prerequisites

Before starting, make sure you have:
- ✅ Windows 10 or 11
- ✅ Internet connection
- ✅ VS Code installed (download from https://code.visualstudio.com/)

---

## 📋 Step 1: Install Node.js (5 minutes)

### Download and Install:

1. Go to: **https://nodejs.org/**
2. Click the **green "LTS" button** (left side)
3. Run the downloaded file
4. Click "Next" → "Next" → "Install"
5. Wait for installation to complete
6. Click "Finish"

### Verify It Worked:

1. Press `Windows Key + R`
2. Type: `cmd`
3. Press Enter
4. Type: `node --version`
5. You should see: `v20.x.x` or similar

✅ **Done!** Node.js is installed.

---

## 📋 Step 2: Install Dependencies (3 minutes)

### In VS Code:

1. **Open the Hawk Fuel folder:**
   - File → Open Folder
   - Select the Hawk Fuel folder
   - Click "Select Folder"

2. **Open Terminal:**
   - Press: `Ctrl + ` (backtick key, above Tab)
   - Or: View → Terminal

3. **Install Packages:**
   - Type: `npm install`
   - Press Enter
   - **Wait 2-3 minutes** (lots of text will scroll)
   - When done, you'll see a blinking cursor

✅ **Done!** All packages installed.

---

## 📋 Step 3: Start the App (10 seconds)

### In the Same Terminal:

1. Type: `npm start`
2. Press Enter
3. Wait ~10 seconds
4. Browser opens automatically!

✅ **Done!** Your app is running at http://localhost:3000

---

## 🎉 Success!

You should see:
- 🔥 Purple gradient background
- "Hawk Fuel" header at the top
- A form asking for your age, gender, height, weight
- 3-step progress bar

---

## 🛠️ Common First-Time Issues

### Issue: "npm is not recognized"
**Cause:** Node.js not installed or computer needs restart  
**Fix:** 
1. Restart your computer
2. Try `npm install` again

### Issue: Red error text during install
**Cause:** Normal! Some warnings are okay  
**Fix:** As long as it finishes, you're good. Try `npm start`

### Issue: Browser doesn't open
**Cause:** Server started but browser didn't launch  
**Fix:** Manually open browser and go to: http://localhost:3000

### Issue: "Port 3000 in use"
**Cause:** Another program is using that port  
**Fix:** Type: `set PORT=3001 && npm start`

---

## 📝 Daily Usage

### Starting Work:
```bash
npm start
```

### Stopping the Server:
- Press: `Ctrl + C` in terminal
- Type: `Y`
- Press Enter

### Making Changes:
1. Edit any file in `src/` folder
2. Save (`Ctrl + S`)
3. Browser refreshes automatically!

---

## 🎨 Try This First!

### Change the App Color:

1. Open: `src/App.css`
2. Find line 8 (approximately):
   ```css
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   ```
3. Change to:
   ```css
   background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
   ```
4. Save (`Ctrl + S`)
5. Watch your app turn green! 🎨

---

## 📚 What to Learn Next

### Day 1: ✅ Get it running (you just did this!)

### Day 2: Explore the files
- Open `src/App.js` - Read the code
- Open `src/components/UserProfile.js` - See how forms work
- Open any `.css` file - Play with colors

### Day 3: Make small changes
- Change text in components
- Modify colors
- Add your name to the header

### Week 2: Learn React
- Read: https://react.dev/learn
- Watch: "React for Beginners" on YouTube
- Practice: Build your own component

---

## 📞 Need Help?

1. **Check README.md** - Detailed documentation
2. **Check WINDOWS_SETUP.md** - Windows-specific help
3. **Check FOLDER_STRUCTURE.md** - Understand file organization
4. **Google the error** - Copy/paste error messages
5. **Stack Overflow** - Search for solutions

---

## 🎯 Next Steps

After getting it running:

1. ✅ Play with the app - Enter your info, track activities
2. 📖 Read `README.md` for full documentation
3. 🎨 Customize colors and text
4. 📚 Learn React basics
5. 🚀 Build your own features!

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + `` | Open/close terminal |
| `Ctrl + S` | Save file |
| `Ctrl + P` | Quick file open |
| `Ctrl + /` | Comment/uncomment |
| `Ctrl + C` | Stop server (in terminal) |
| `F5` | Refresh browser |

---

## 🎉 You Did It!

Your Hawk Fuel app is now running!

**Type this in terminal:**
```bash
npm start
```

**Browser opens to:** http://localhost:3000

Happy coding! 🚀

---

## 📖 More Resources

- 📘 Full Setup Guide: `README.md`
- 🪟 Windows Help: `WINDOWS_SETUP.md`
- 📁 File Guide: `FOLDER_STRUCTURE.md`
- 🧮 Formulas: `FORMULAS.md`
- 🏃 MET System: `MET_SYSTEM_GUIDE.md`
