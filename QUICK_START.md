# 🚀 Quick Start Guide - Curry&Burger App

Get your app running in 15 minutes!

## Step 1: Firebase Project (5 min)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project → Name it "Curry&Burger"
3. Enable Google Analytics (optional)
4. Wait for project creation

## Step 2: Enable Services (3 min)

### Firestore
1. Click "Firestore Database" → "Create Database"
2. Choose "Production mode" → Select location → Create

### Authentication
1. Click "Authentication" → "Get Started"
2. Enable "Email/Password" provider
3. Enable "Google" provider (optional)

### Storage
1. Click "Storage" → "Get Started"
2. Choose "Production mode" → Done

## Step 3: Get Credentials (2 min)

### Client Credentials
1. Project Settings (⚙️) → General
2. Scroll to "Your apps" → Web app
3. Copy all config values

### Admin Credentials
1. Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file

## Step 4: Add to Vercel (3 min)

1. Go to your Vercel project → Settings → Environment Variables
2. Add these variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_RESTAURANT_ID=curry-burger-main

FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

3. Redeploy your app

## Step 5: Initialize Data (2 min)

1. In v0, run the initialization script from the Scripts panel
2. Wait for "🎉 Firebase initialization complete!"
3. Check Firestore Console - you should see collections with data

## Step 6: Create Admin User (2 min)

1. Firebase Console → Authentication → Add User
2. Email: `admin@curryanburger.com`, Password: (your choice)
3. Copy the User UID
4. Firestore → `users` collection → Add document
5. Document ID: (paste UID)
6. Fields:
   ```
   email: admin@curryanburger.com
   name: Admin User
   role: admin
   loyalty_points: 0
   ```

## Step 7: Deploy Rules (1 min)

```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
```

## ✅ Done! Test Your App

1. **Customer App**: Browse menu, add to cart, place order
2. **Admin Panel**: `/admin` - manage orders, menu, promotions
3. **Real-time**: Open both in different tabs - see instant sync!

## 🐛 Troubleshooting

**Can't see menu items?**
- Check `published: true` in Firestore
- Verify `restaurantId` matches env variable

**Orders not appearing?**
- Check admin user has `role: "admin"`
- Check Firestore rules are deployed

**Need detailed help?**
- See `FIREBASE_SETUP_GUIDE.md` for complete documentation
- Check browser console for specific errors

## 🎉 You're Live!

Your Curry&Burger app is now running with real-time Firebase sync!
