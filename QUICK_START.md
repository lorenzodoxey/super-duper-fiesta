# ⚡ QUICK START - Fix Your Production App in 5 Minutes

## The Problem
Your app is deployed on Vercel but appointments won't save. **This is because Vercel doesn't have your Firebase credentials.**

## The Solution
Add your Firebase environment variables to Vercel and redeploy.

---

## Step-by-Step (5 minutes)

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com
2. Log in with your GitHub account
3. Click on your `super-duper-fiesta` project

### Step 2: Add Environment Variables
1. Click **Settings** (top nav)
2. Click **Environment Variables** (left sidebar)
3. You'll see an input box that says "Name"

### Step 3: Add Each Variable
For each of these 7 variables, click "Add New" and fill in:

```
VITE_GOOGLE_MAPS_API_KEY = AIzaSyAsRJXlNHxCG1CslnYXi3CSBy7P3EN_qQM

VITE_FIREBASE_API_KEY = AIzaSyBT0hPcH40tkmW4SJsJhQj15hb6WCPtmPg

VITE_FIREBASE_AUTH_DOMAIN = mhm-map-scheduler.firebaseapp.com

VITE_FIREBASE_PROJECT_ID = mhm-map-scheduler

VITE_FIREBASE_STORAGE_BUCKET = mhm-map-scheduler.firebasestorage.app

VITE_FIREBASE_MESSAGING_SENDER_ID = 339287442770

VITE_FIREBASE_APP_ID = 1:339287442770:web:2d30bda5050d327afae68b
```

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (...) on the right
4. Click **Redeploy**
5. Wait for it to finish (usually 1-2 minutes)

### Step 5: Test
1. Visit your Vercel app URL
2. Enter your rep name
3. Create an appointment
4. **It should save now!** ✅
5. Refresh the page - the appointment should still be there

---

## How to Verify It Worked

### Check #1: Browser
- Create an appointment
- See if it saves without error
- See if it still there after refresh

### Check #2: Firebase Console
1. Go to https://console.firebase.google.com
2. Click your `mhm-map-scheduler` project
3. Go to **Firestore Database**
4. Click the **appointments** collection
5. You should see your test appointment there

### Check #3: Error Messages
- If something fails, you'll now see a helpful error message
- Previous errors will show in browser console

---

## What If It Still Doesn't Work?

### Checklist:
- [ ] All 7 environment variables are in Vercel
- [ ] No typos in variable names (case-sensitive!)
- [ ] No typos in values
- [ ] You clicked **Save** for each variable
- [ ] You clicked **Redeploy** on the deployment
- [ ] You waited 2+ minutes for redeploy to finish
- [ ] You're visiting the Vercel URL (not localhost)
- [ ] You cleared browser cache (Ctrl+Shift+Delete)

### Still broken?
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check if "mhm-map-scheduler" appears
5. Look for "Permission denied" or "not found"

---

## 🎉 Success!

Your app is now production-ready and appointment saving works!

**Next Steps** (Optional but Recommended):
- [ ] Read `PRODUCTION_CHECKLIST.md` for security improvements
- [ ] Add Firebase Authentication
- [ ] Enable backup procedures
- [ ] Setup monitoring/alerts

---

**Having issues?** Check the error banner at the top of your app - it now shows helpful messages!
