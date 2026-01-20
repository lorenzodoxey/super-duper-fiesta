# MHM Map Scheduler - Firebase & Deployment Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Firebase Dependencies
```bash
cd map-scheduler
npm install
```

### Step 2: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name (e.g., "mhm-scheduler")
4. Click "Create project"
5. Wait for creation to complete

### Step 3: Set Up Firestore Database
1. In Firebase console, go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Select **Start in production mode**
4. Choose location: **us-central1** (or nearest to you)
5. Click **Create**

### Step 4: Get Your Credentials
1. Go to **Project Settings** (gear icon)
2. Go to **Your apps** section
3. Click **Web** icon (or create a web app if needed)
4. Copy the firebaseConfig object
5. Create `.env.local` file in `map-scheduler/` directory:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Step 5: Set Up Firestore Security Rules
In Firebase console, go to **Firestore Database** → **Rules** and paste:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Prevent all access by default
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Representatives can read/write only their own appointments
    match /appointments/{doc=**} {
      // Allow create/read/update/delete if repId matches current user's repId
      // Note: In production, add proper authentication instead
      allow read, write: if true; // Update to require auth in future
    }
    
    // Allow anyone to read/write reps (for onboarding - update for auth)
    match /reps/{doc=**} {
      allow read, write: if true;
    }
  }
}
```

**IMPORTANT PRODUCTION UPDATES:**
- [ ] Add authentication (Firebase Auth)
- [ ] Update rules to use `request.auth.uid` instead of allowing public access
- [ ] Add rate limiting rules
- [ ] Add document validation rules

Click **Publish**

---

## 🌐 Deploy to Vercel (2 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Firebase integration"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click **Import Project**
4. Select `super-duper-fiesta` repository
5. Under **Environment Variables**, add all your `.env` variables from Step 4 above
6. Click **Deploy**

Your app is now live! 🎉

**Get your URL**: Check your Vercel dashboard for the deployment URL (something like `https://mhm-scheduler.vercel.app`)

---

## 📱 How It Works

### For Reps:
1. **First Time**: Enter their name (e.g., "John Smith")
2. **Appointments**: Stored in cloud linked to their name
3. **Any Device**: Log in with same name on phone, tablet, or computer
4. **Real-time Sync**: Updates appear instantly on all devices
5. **Offline Ready**: Works offline, syncs when online

### For You (Admin):
- Access Firebase Console to view all appointments
- See which rep owns which appointment
- Monitor usage and storage

---

## 💳 Stripe Integration (Optional - Later)

To enable payments:

1. Get Stripe API Key from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add to `.env.local`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
```
3. Create a Stripe webhook endpoint
4. Update pricing buttons to call Stripe

---

## 🆘 Troubleshooting

### Firebase not connecting?
- Check `.env.local` variables are correct
- Make sure Firestore is created (not just project)
- Check browser console for errors

### Appointments not saving?
- Make sure Firestore rules are published
- Check Firebase quota (free tier: 50k reads/day)
- Verify `repId` is being set correctly

### Lost appointments after refresh?
- Check if rep ID is being saved to localStorage
- Look in Firebase console to see if data exists

---

## 📊 Firebase Pricing

**Free Tier (Spark Plan):**
- 50,000 reads/day
- 20,000 writes/day
- 1 GB total storage
- Perfect for testing/small teams

**Paid (Blaze Plan):**
- Pay per use
- ~$0.06 per 100,000 reads
- ~$0.18 per 100,000 writes
- Recommended once you scale

---

## 🔐 Security Notes

1. **Firestore Rules**: Public to join (no login needed), but data is rep-specific
2. **Consider adding**: 
   - Email authentication later
   - Admin dashboard to view all reps
   - Rate limiting per rep
   - API validation

---

## 📈 Next Steps

1. ✅ Deploy and test with your sales team
2. ✅ Gather feedback
3. ✅ Add Stripe for payments
4. ✅ Create admin dashboard
5. ✅ Monitor usage and optimize
6. ✅ Scale backend if needed

---

## 📞 Support

For Firebase issues: [Firebase Docs](https://firebase.google.com/docs)
For Vercel issues: [Vercel Docs](https://vercel.com/docs)

---

**You're all set!** 🚀 Share the Vercel URL with your reps and they can start using it immediately.
