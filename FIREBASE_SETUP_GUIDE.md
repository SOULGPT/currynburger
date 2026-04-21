# 🔥 Complete Firebase Setup Guide for Curry&Burger App

This guide will walk you through setting up all Firebase collections, indexes, security rules, and sample data to make your app work in real-time.

---

## 📋 Prerequisites

1. Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
2. Environment variables added to your Vercel project (see below)
3. Firebase CLI installed: `npm install -g firebase-tools`

---

## 🔐 Step 1: Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

### Client-side (NEXT_PUBLIC_*)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_RESTAURANT_ID=curry-burger-main
```

### Server-side (Admin SDK)
```env
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

**How to get Admin SDK credentials:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy `project_id`, `client_email`, and `private_key` to environment variables

---

## 🗄️ Step 2: Firestore Database Setup

### 2.1 Create Firestore Database

1. Go to Firebase Console → Firestore Database
2. Click "Create Database"
3. Choose **Production Mode** (we'll add rules next)
4. Select your preferred location (e.g., `us-central1`)

### 2.2 Firestore Collections Structure

Create these collections manually or use the initialization script (Step 5):

#### **Collection: `restaurants`**
```
restaurants/
  └── {restaurantId}/          (e.g., "curry-burger-main")
      ├── name: string
      ├── address: string
      ├── phone: string
      ├── email: string
      └── settings: map
```

#### **Collection: `menu_categories`**
```
menu_categories/
  └── {categoryId}/
      ├── name: string          (e.g., "Burger", "Wrap")
      ├── description: string
      ├── order: number         (for sorting)
      ├── restaurantId: string
      └── createdAt: timestamp
```

#### **Collection: `menu_items`**
```
menu_items/
  └── {itemId}/
      ├── name: string
      ├── description: string
      ├── price_eur: number
      ├── category: string
      ├── image_url: string
      ├── available: boolean
      ├── published: boolean
      ├── orderCount: number    (for popular items)
      ├── restaurantId: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

#### **Collection: `users`**
```
users/
  └── {userId}/               (matches Firebase Auth UID)
      ├── name: string
      ├── email: string
      ├── phone: string
      ├── role: string        ("customer", "staff", "admin")
      ├── loyalty_points: number
      ├── addresses: array
      ├── favorites: array
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

#### **Collection: `orders`**
```
orders/
  └── {orderId}/
      ├── user_id: string
      ├── restaurantId: string
      ├── items: array        [{id, name, price, quantity, customizations}]
      ├── total_eur: number
      ├── status: string      ("placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled")
      ├── type: string        ("pickup", "delivery")
      ├── paymentMethod: string ("card", "cash_on_delivery", "pay_at_restaurant")
      ├── paymentStatus: string ("pending", "paid", "failed")
      ├── address: map        (for delivery orders)
      ├── customerName: string
      ├── customerPhone: string
      ├── notes: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

#### **Collection: `promotions`**
```
promotions/
  └── {promotionId}/
      ├── title: string
      ├── description: string
      ├── image_url: string
      ├── discount: string    (e.g., "20%", "€5 off")
      ├── code: string        (optional coupon code)
      ├── valid_from: timestamp
      ├── valid_until: timestamp
      ├── active: boolean
      ├── restaurantId: string
      └── createdAt: timestamp
```

#### **Collection: `branches`**
```
branches/
  └── {branchId}/
      ├── name: string
      ├── address: string
      ├── phone: string
      ├── lat: number
      ├── lng: number
      ├── open_hours: map
      ├── restaurantId: string
      └── createdAt: timestamp
```

#### **Collection: `loyalty_transactions`**
```
loyalty_transactions/
  └── {transactionId}/
      ├── user_id: string
      ├── points_delta: number  (positive for earn, negative for redeem)
      ├── reason: string
      ├── order_id: string      (optional)
      ├── restaurantId: string
      └── createdAt: timestamp
```

---

## 🔍 Step 3: Firestore Indexes

### 3.1 Required Composite Indexes

Go to Firebase Console → Firestore → Indexes → Composite tab → Add Index

**Index 1: Menu Items by Restaurant and Category**
- Collection: `menu_items`
- Fields:
  - `restaurantId` (Ascending)
  - `category` (Ascending)
  - `published` (Ascending)
  - `createdAt` (Descending)

**Index 2: Orders by User and Date**
- Collection: `orders`
- Fields:
  - `user_id` (Ascending)
  - `createdAt` (Descending)

**Index 3: Orders by Restaurant and Status**
- Collection: `orders`
- Fields:
  - `restaurantId` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)

**Index 4: Popular Items (Order Count)**
- Collection: `menu_items`
- Fields:
  - `restaurantId` (Ascending)
  - `published` (Ascending)
  - `orderCount` (Descending)

**Index 5: Active Promotions**
- Collection: `promotions`
- Fields:
  - `restaurantId` (Ascending)
  - `active` (Ascending)
  - `valid_until` (Descending)

### 3.2 Auto-Generated Indexes

These will be created automatically when you run queries. If you see errors in the console, Firebase will provide a link to create the missing index.

---

## 🔒 Step 4: Security Rules

### 4.1 Deploy Firestore Rules

The `firestore.rules` file is already in your project. Deploy it:

```bash
firebase login
firebase init firestore  # Select your project
firebase deploy --only firestore:rules
```

### 4.2 Verify Rules

Go to Firebase Console → Firestore → Rules and verify they match the `firestore.rules` file.

**Key Rules Summary:**
- ✅ Anyone can read published menu items and active promotions
- ✅ Authenticated users can create orders and manage their profile
- ✅ Users can only read/update their own data
- ✅ Admin/staff can manage all data
- ✅ Role-based access control enforced

---

## 🗂️ Step 5: Initialize Sample Data

### 5.1 Run the Initialization Script

I've created a script to populate your database with sample data. Run it from the v0 interface:

1. Make sure Firebase environment variables are set
2. The script will create:
   - Restaurant document
   - All menu categories (13 categories)
   - All menu items (80+ items from your menu)
   - Sample branches
   - Sample promotions
   - Admin user

### 5.2 Manual Data Entry (Alternative)

If you prefer to add data manually:

1. Go to Firestore Console
2. Create each collection
3. Add documents with the structure shown in Step 2.2
4. Make sure to include `restaurantId: "curry-burger-main"` in all documents

---

## 🖼️ Step 6: Firebase Storage Setup

### 6.1 Create Storage Bucket

1. Go to Firebase Console → Storage
2. Click "Get Started"
3. Choose **Production Mode**
4. Select same location as Firestore

### 6.2 Deploy Storage Rules

The `storage.rules` file is in your project. Deploy it:

```bash
firebase deploy --only storage
```

### 6.3 Upload Menu Images

Create these folders in Storage:
```
menu-items/
  ├── burgers/
  ├── wraps/
  ├── tacos/
  ├── snacks/
  └── ...

promotions/
  └── banners/
```

Upload your food images and update `image_url` fields in Firestore with the public URLs.

---

## 🔐 Step 7: Authentication Setup

### 7.1 Enable Auth Providers

Go to Firebase Console → Authentication → Sign-in method

Enable these providers:
- ✅ **Email/Password** (required)
- ✅ **Google** (recommended)
- ⬜ **Apple** (optional)

### 7.2 Configure Authorized Domains

Go to Authentication → Settings → Authorized domains

Add:
- `localhost` (for development)
- Your Vercel domain (e.g., `your-app.vercel.app`)
- Your custom domain (if any)

### 7.3 Create Admin User

1. Go to Authentication → Users → Add User
2. Create user with email/password
3. Copy the User UID
4. Go to Firestore → `users` collection
5. Create document with ID = User UID
6. Set fields:
   ```json
   {
     "email": "admin@curryanburger.com",
     "name": "Admin User",
     "role": "admin",
     "loyalty_points": 0,
     "createdAt": [current timestamp]
   }
   ```

---

## ✅ Step 8: Testing Real-Time Sync

### 8.1 Test Menu Updates

1. **Admin Panel**: Log in as admin → Menu Management → Edit an item
2. **Customer App**: Open menu page in another browser/tab
3. **Expected**: Changes appear instantly without refresh

### 8.2 Test Order Flow

1. **Customer App**: Add items to cart → Checkout → Place order
2. **Admin Panel**: Orders Management
3. **Expected**: New order appears immediately with sound notification

### 8.3 Test Promotions

1. **Admin Panel**: Offers & Promotions → Create new promotion
2. **Customer App**: Go to Deals page
3. **Expected**: New promotion appears instantly

### 8.4 Test Popular Items

1. **Customer App**: Place several orders with specific items
2. **Home Page**: Check "Popular Items" section
3. **Expected**: Items with highest `orderCount` appear first

---

## 🐛 Troubleshooting

### Issue: "Missing or insufficient permissions"

**Solution:**
1. Check Firestore rules are deployed
2. Verify user is authenticated
3. Check user has correct `role` in Firestore `users` collection

### Issue: "Index not found"

**Solution:**
1. Check browser console for index creation link
2. Click the link to auto-create the index
3. Wait 2-3 minutes for index to build

### Issue: "Menu items not appearing"

**Solution:**
1. Check `published: true` in menu items
2. Verify `restaurantId` matches `NEXT_PUBLIC_RESTAURANT_ID`
3. Check browser console for errors

### Issue: "Orders not syncing to admin"

**Solution:**
1. Verify admin user has `role: "admin"` in Firestore
2. Check Firestore rules allow admin to read orders
3. Check browser console for real-time listener errors

### Issue: "Images not loading"

**Solution:**
1. Check Storage rules are deployed
2. Verify image URLs are public
3. Check CORS settings in Storage

---

## 📊 Step 9: Monitoring & Analytics

### 9.1 Enable Firestore Monitoring

Go to Firebase Console → Firestore → Usage

Monitor:
- Read/Write operations
- Document count
- Storage size

### 9.2 Set Up Alerts

Go to Firebase Console → Project Settings → Integrations

Set up alerts for:
- High read/write usage
- Security rule violations
- Authentication failures

---

## 🚀 Step 10: Production Checklist

Before launching:

- [ ] All environment variables set in Vercel
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed
- [ ] All indexes created
- [ ] Sample data populated
- [ ] Admin user created with correct role
- [ ] Authentication providers enabled
- [ ] Authorized domains configured
- [ ] Real-time sync tested (menu, orders, promotions)
- [ ] Order flow tested end-to-end
- [ ] Payment methods tested
- [ ] Admin dashboard tested
- [ ] Mobile responsive tested
- [ ] Security rules tested (users can't access others' data)

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for specific error messages
2. Check Firebase Console → Firestore → Usage for rule violations
3. Verify all environment variables are set correctly
4. Test with Firebase Emulator locally first
5. Check the `REALTIME_SYNC_GUIDE.md` for sync-specific issues

---

## 🎉 You're Ready!

Once all steps are complete, your Curry&Burger app will have:
- ✅ Real-time menu updates
- ✅ Live order tracking
- ✅ Instant promotion sync
- ✅ Popular items based on actual orders
- ✅ Secure role-based access
- ✅ Complete admin dashboard
- ✅ Customer ordering system

Happy cooking! 🍔🍛
