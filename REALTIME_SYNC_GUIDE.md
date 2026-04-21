# Real-Time Sync Implementation Guide

## Overview
This Curry&Burger app now features **real-time synchronization** between the Admin Panel and Customer App using Firebase Firestore.

## How It Works

### 1. Firebase Integration
- **Admin Panel** writes menu items, offers, and data to Firestore
- **Customer App** listens to Firestore changes in real-time using `onSnapshot`
- Changes appear **instantly** without page refresh

### 2. Key Features

#### Menu Management
- Admin adds/edits/deletes menu items → Changes sync immediately to customer app
- `published` field controls visibility (unpublished items hidden from customers)
- `orderCount` field tracks popularity for "Popular Items" section

#### Popular Items
- Automatically updates based on actual order data
- Each order increments the `orderCount` for ordered items
- Featured section shows top 4 most-ordered items

#### Real-Time Listeners
All customer-facing components use real-time subscriptions:
- `useMenuItems()` - Menu items with live updates
- `useMenuCategories()` - Category list with live updates
- `subscribeToMenuItems()` - Core Firebase listener

### 3. Setup Instructions

#### Step 1: Configure Firebase
Add these environment variables in the v0 UI (Vars section):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### Step 2: Initialize Data
1. Go to `/admin` (Admin Dashboard)
2. Click "Initialize Data" button on the dashboard
3. This migrates static menu data to Firebase (one-time operation)

#### Step 3: Verify Sync
1. Open Admin Panel in one browser tab
2. Open Customer App in another tab
3. Add/edit a menu item in Admin
4. Watch it appear instantly in Customer App

### 4. Firebase Collections

#### `menu_items`
```typescript
{
  id: string
  categoryId: string
  name: string
  description: string
  priceEur: number
  imageUrl: string
  available: boolean
  published: boolean        // Controls customer visibility
  orderCount: number        // Tracks popularity
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `menu_categories`
```typescript
{
  id: string
  name: string
  description: string
  order: number
  createdAt: timestamp
}
```

#### `orders`
```typescript
{
  id: string
  userId: string
  items: CartItem[]
  totalEur: number
  status: OrderStatus
  // ... other fields
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 5. Key Files

#### Firebase Services
- `lib/firebase-menu.ts` - Menu CRUD operations with real-time listeners
- `lib/firebase.ts` - Firebase client configuration
- `lib/firebase-admin.ts` - Firebase admin SDK

#### Hooks
- `hooks/use-menu-items.ts` - Real-time menu items hook
- `hooks/use-menu-categories.ts` - Real-time categories hook

#### Components
- `components/admin/menu-manager.tsx` - Admin menu management with real-time updates
- `components/menu/menu-items-grid.tsx` - Customer menu display with live data
- `components/home/featured-items.tsx` - Popular items based on order count
- `components/firebase-data-initializer.tsx` - One-time data migration tool

### 6. Troubleshooting

#### Changes not syncing?
1. Check Firebase environment variables are set correctly
2. Verify Firebase project has Firestore enabled
3. Check browser console for Firebase errors
4. Ensure both apps use the same Firebase project

#### Popular Items not showing?
1. Place some test orders first
2. Check that `orderCount` is being incremented in Firestore
3. Verify orders are writing to the `orders` collection

#### "No order data available yet" message?
- This is normal for new installations
- Popular items appear after orders are placed
- Each order increments the `orderCount` field

### 7. Security Rules (Recommended)

Add these Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Menu items - read for all, write for admin only
    match /menu_items/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - read/write for authenticated users
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      (request.auth.uid == resource.data.userId || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## Summary

✅ **Real-time sync** between Admin and Customer apps  
✅ **Published/unpublished** control for menu items  
✅ **Popular items** auto-update from order data  
✅ **No manual refresh** needed - changes appear instantly  
✅ **Offline support** with fallback to static data  

The app is now production-ready with full real-time capabilities!
