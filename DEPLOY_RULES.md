# Deploy Firestore Rules

The permission errors are happening because the Firestore rules need to be deployed to Firebase.

## Quick Fix - Deploy Rules via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **Curry&Burger**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Delete all existing rules
6. Copy and paste the entire content from your `firestore.rules` file
7. Click **Publish**

## Verify Deployment

After publishing:
1. Refresh your app
2. Go to Admin Dashboard
3. Try creating a banner or deal
4. Check browser console - you should NOT see permission errors anymore

## Current Rules Summary

The updated rules allow:
- **Anyone** can read: menu items, categories, deals, promotions, banners, branches
- **Authenticated users** can write to admin collections (deals, banners, promotions, menu items)
- **Orders** can be created by anyone (for guest checkout)

## For Production

Before going live, update `isAdminOrDevMode()` back to check for admin role:

```javascript
function isAdminOrDevMode() {
  return isAuthenticated() &&
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

Then set your admin user's role in Firestore:
1. Go to Firestore Database > users collection
2. Find your user document
3. Add field: `role` = `admin`
