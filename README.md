# MHM Map Scheduler

A production-ready appointment scheduling app for sales representatives with Google Maps integration.

## 🚀 Quick Start

### **Appointments Won't Save?** 
👉 Follow the [5-Minute Quick Start Guide](QUICK_START.md)

The issue is that your Vercel deployment needs Firebase environment variables. The guide walks you through adding them in 5 minutes.

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fix saving issue (5 min)
- **[PRODUCTION_CHECKLIST.md](map-scheduler/PRODUCTION_CHECKLIST.md)** - Complete deployment guide
- **[PRODUCTION_SUMMARY.md](PRODUCTION_SUMMARY.md)** - What's been implemented
- **[map-scheduler/FIREBASE_SETUP.md](map-scheduler/FIREBASE_SETUP.md)** - Firebase configuration

## 📁 Project Structure

```
super-duper-fiesta/
├── map-scheduler/           # Main React app
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Firebase & geocoding utilities
│   │   └── App.tsx          # Main app with error handling
│   ├── FIREBASE_SETUP.md    # Firebase configuration
│   └── package.json
├── QUICK_START.md           # 5-minute fix guide
├── PRODUCTION_SUMMARY.md    # Implementation summary
└── README.md
```

## ✨ Features

- 📍 Interactive map with appointment markers
- 📅 Calendar-based scheduling
- 🗺️ Distance calculation between appointments
- 💾 Cloud storage with Firebase Firestore
- ⚡ Real-time error handling and user feedback
- 🔄 Loading states and data validation
- 📱 Responsive mobile design

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Firebase Firestore
- **Maps**: Google Maps API
- **Hosting**: Vercel
- **Styling**: CSS with CSS variables

## 📦 Getting Started (Local Development)

```bash
cd map-scheduler
npm install
npm run dev
```

Then create a `.env.local` file with your Firebase credentials (see [FIREBASE_SETUP.md](map-scheduler/FIREBASE_SETUP.md)).

## 🔐 Security

- Error logging with sensitive data protection
- Input validation on all Firebase operations
- Environment variables properly secured
- Ready for authentication integration

## 🐛 Error Handling

The app now includes:
- User-friendly error messages
- Automatic error logging for debugging
- Visual error notifications
- Loading states for all async operations

See [PRODUCTION_SUMMARY.md](PRODUCTION_SUMMARY.md) for what's been implemented.

## 📋 Next Steps

1. **Fix the saving issue**: Follow [QUICK_START.md](QUICK_START.md)
2. **Secure your deployment**: Check [PRODUCTION_CHECKLIST.md](map-scheduler/PRODUCTION_CHECKLIST.md) Phase 2
3. **Enable backups**: Check [PRODUCTION_CHECKLIST.md](map-scheduler/PRODUCTION_CHECKLIST.md) Phase 3
4. **Monitor usage**: Setup alerts and monitoring

## 📞 Support

- **Firebase issues?** Check the [FIREBASE_SETUP.md](map-scheduler/FIREBASE_SETUP.md)
- **Deployment issues?** See the [PRODUCTION_CHECKLIST.md](map-scheduler/PRODUCTION_CHECKLIST.md) troubleshooting section
- **Quick fix needed?** Start with [QUICK_START.md](QUICK_START.md)

---

**Status**: Ready for production deployment ✅  
**Last Updated**: January 2025
