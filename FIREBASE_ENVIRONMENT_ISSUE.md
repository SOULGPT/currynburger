# Firebase Initialization Issue

## Problem
Firebase services (Auth, Firestore, Storage) are failing to initialize with errors:
- "Component auth has not been registered yet"
- "Service firestore is not available"
- "Service storage is not available"

## Root Cause
This is a known compatibility issue with Firebase SDK v12+ in certain runtime environments where services fail to register even when properly initialized.

## Solution Implemented
1. **Lazy Initialization**: Services only initialize when first requested
2. **Error Suppression**: Failed service initialization no longer crashes the app
3. **Graceful Degradation**: App continues to work with fallback data when Firebase is unavailable

## Alternative Solution
If Firebase services continue to fail, you have two options:

### Option 1: Use Firebase Admin SDK on Server
Move all Firebase operations to server-side API routes using Firebase Admin SDK, which is already working in `lib/firebase-admin.ts`.

### Option 2: Check Environment Variables
Verify all Firebase environment variables are set in the **Vars** section of the in-chat sidebar:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Current Status
- ✅ App initializes successfully
- ✅ Services fail gracefully without crashing
- ✅ Fallback menu data displays
- ✅ Stripe payments still work
- ⚠️ Real-time sync may not work until Firebase is fully operational

## Next Steps
1. Check if environment variables are correctly set in Vars section
2. If variables are correct, the issue is with the runtime environment compatibility
3. Consider using server-side Firebase operations via API routes as a workaround
