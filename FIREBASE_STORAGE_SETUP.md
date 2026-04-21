# Firebase Storage Setup Guide

## Deploy Storage Security Rules

To enable image uploads in the admin interface, you need to deploy the Firebase Storage security rules.

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)

```bash
firebase init storage
```

Select your Firebase project when prompted.

### Step 4: Deploy Storage Rules

```bash
firebase deploy --only storage
```

Or deploy all rules at once:

```bash
firebase deploy --only firestore:rules,storage:rules
```

## Verify Deployment

After deploying, you can verify the rules in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **fumiav2**
3. Navigate to **Storage** → **Rules**
4. You should see the deployed rules

## Storage Structure

The app uses the following storage paths:

```
/menu-items/          - Menu item product images
/deals/               - Deal/offer images
/promotions/          - Promotion banner images
/ingredients/         - Ingredient images
/users/{userId}/      - User profile images
```

## Security Rules Summary

- **Public Read**: All images are publicly readable for display in the app
- **Admin Write**: Only admin users can upload/delete images
- **File Validation**: Max 5MB file size, image types only
- **User Images**: Users can only upload to their own folder

## Testing Upload

After deploying, test the image upload in the admin dashboard:

1. Login as admin
2. Go to Menu Manager
3. Add/Edit a menu item
4. Click the image upload area
5. Select an image (max 5MB, jpg/png/webp)
6. Save the item

The image should upload successfully and display in real-time.

## Troubleshooting

### 403 Unauthorized Error

If you still get 403 errors after deploying:

1. Clear browser cache
2. Logout and login again to get fresh auth token
3. Verify the user has `role: "admin"` in Firestore users collection
4. Check Firebase Console → Storage → Rules to confirm deployment

### CORS Issues

If images don't load, configure CORS:

```bash
gsutil cors set cors.json gs://fumiav2.firebasestorage.app
```

Create `cors.json`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

## Admin User Setup

Ensure your admin user has the correct role in Firestore:

```javascript
// In Firestore users collection
{
  "userId": "your-admin-uid",
  "role": "admin",
  "email": "admin@curryburger.com",
  "name": "Admin User"
}
