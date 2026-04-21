# 🔥 Complete Firebase & Firestore Guide - Curry&Burger App

**Last Updated**: January 2025  
**App Version**: Production Ready  
**Firebase SDK**: v10+

This is the master reference document for all Firebase configuration, Firestore database schema, indexes, security rules, and deployment instructions for the Curry&Burger restaurant ordering app.

---

## 📑 Table of Contents

1. [Firebase Project Setup](#1-firebase-project-setup)
2. [Environment Variables](#2-environment-variables)
3. [Complete Firestore Schema](#3-complete-firestore-schema)
4. [Firestore Indexes](#4-firestore-indexes)
5. [Security Rules](#5-security-rules)
6. [Firebase Storage](#6-firebase-storage)
7. [Authentication Setup](#7-authentication-setup)
8. [Real-time Listeners](#8-real-time-listeners)
9. [Cloud Functions](#9-cloud-functions)
10. [Data Initialization](#10-data-initialization)
11. [Testing & Validation](#11-testing--validation)
12. [Production Deployment](#12-production-deployment)
13. [Monitoring & Analytics](#13-monitoring--analytics)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Project Name: `Curry&Burger` (or your preferred name)
4. Project ID: `curry-burger-main` (must match `NEXT_PUBLIC_RESTAURANT_ID`)
5. Enable Google Analytics (recommended)
6. Select Analytics location
7. Click "Create Project"

### 1.2 Enable Required Services

**Firestore Database**:
- Go to Firestore Database → Create Database
- Start in **Production Mode**
- Location: `us-central1` (or nearest to your users)

**Authentication**:
- Go to Authentication → Get Started
- Enable Email/Password provider
- Enable Google provider (optional)

**Storage**:
- Go to Storage → Get Started
- Start in **Production Mode**
- Same location as Firestore

**Hosting** (optional):
- Go to Hosting → Get Started
- Follow setup instructions

---

## 2. Environment Variables

### 2.1 Required Environment Variables

Add these to your `.env.local` (development) and Vercel Environment Variables (production):

```env
# ============================================
# CLIENT-SIDE VARIABLES (NEXT_PUBLIC_*)
# ============================================
# These are exposed to the browser

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=curry-burger-main.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=curry-burger-main
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=curry-burger-main.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_RESTAURANT_ID=curry-burger-main

# ============================================
# SERVER-SIDE VARIABLES (FIREBASE_ADMIN_*)
# ============================================
# These are NEVER exposed to the browser
# Used for Firebase Admin SDK in API routes

FIREBASE_ADMIN_PROJECT_ID=curry-burger-main
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@curry-burger-main.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 2.2 How to Get Firebase Config

**Client-side config**:
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy the config object values

**Admin SDK credentials**:
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract `project_id`, `client_email`, `private_key`

**⚠️ SECURITY WARNING**:
- NEVER commit `.env.local` to git
- NEVER expose `FIREBASE_ADMIN_PRIVATE_KEY` in client code
- Store production secrets in Vercel Environment Variables (encrypted)
- Rotate service account keys every 90 days

---

## 3. Complete Firestore Schema

### 3.1 Collections Overview

```
Firestore Root
├── users/                      # User profiles and authentication
├── menu_categories/            # Menu categories (Burger, Wrap, etc.)
├── menu_items/                 # All menu items
├── ingredients/                # Ingredients for customization
├── meal_templates/             # Meal combo templates
├── orders/                     # Customer orders
├── promotions/                 # Active promotions and deals
├── coupons/                    # Discount coupons
├── branches/                   # Restaurant branch locations
└── loyalty_transactions/       # Loyalty points history
```

### 3.2 Detailed Schema

#### **Collection: `users`**

```typescript
users/{userId}  // userId matches Firebase Auth UID
{
  id: string                    // Same as document ID
  name: string                  // "John Doe"
  email: string                 // "john@example.com"
  phone?: string                // "+393331234567"
  role: string                  // "customer" | "staff" | "admin"
  loyaltyPoints: number         // 150
  addresses: Address[]          // Array of saved addresses
  favorites: string[]           // Array of menu item IDs
  createdAt: Timestamp          // Account creation date
  updatedAt: Timestamp          // Last profile update
}

// Address sub-object
Address {
  id: string                    // Unique address ID
  label: string                 // "Home", "Work", "Office"
  street: string                // "Via Roma 123"
  city: string                  // "Milano"
  postalCode: string            // "20100"
  lat?: number                  // 45.4642
  lng?: number                  // 9.1900
  isDefault: boolean            // true
}
```

#### **Collection: `menu_categories`**

```typescript
menu_categories/{categoryId}
{
  id: string                    // "burgers"
  name: string                  // "Burger"
  description?: string          // "Delicious burgers"
  order: number                 // 1 (for sorting)
  imageUrl?: string             // "https://..."
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### **Collection: `menu_items`**

```typescript
menu_items/{itemId}
{
  id: string                    // "classic-burger"
  categoryId: string            // "burgers"
  name: string                  // "Classic Burger"
  description?: string          // "Beef patty with lettuce..."
  priceEur: number              // 8.50
  imageUrl: string              // "https://..."
  available: boolean            // true
  published: boolean            // true (visible to customers)
  orderCount: number            // 245 (for popular items)
  notes?: string                // "Contains gluten"
  customizable: boolean         // true (can be customized)
  ingredients?: string[]        // ["ing_001", "ing_002"] (ingredient IDs)
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### **Collection: `ingredients`**

```typescript
ingredients/{ingredientId}
{
  id: string                    // "ing_001"
  name: string                  // "Extra Cheese"
  imageUrl?: string             // "https://..."
  priceAdjustment: number       // 1.50 (€1.50 extra)
  category: string              // "Cheese" | "Sauce" | "Veggie" | "Patty" | "Bread" | "Drink" | "Side" | "Other"
  default: boolean              // false (not included by default)
  optional: boolean             // true (can be added/removed)
  restaurantId: string          // "curry-burger-main"
  active: boolean               // true
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### **Collection: `meal_templates`**

```typescript
meal_templates/{templateId}
{
  id: string                    // "combo_001"
  name: string                  // "Classic Combo"
  mainItemId: string            // "classic-burger"
  sideCategory?: string         // "Side" (ingredient category)
  drinkCategory?: string        // "Drink" (ingredient category)
  includedDefaults: string[]    // ["ing_001", "ing_002"] (default ingredients)
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### **Collection: `orders`**

```typescript
orders/{orderId}
{
  id: string                    // Auto-generated
  userId: string                // User who placed the order
  branchId: string              // Branch ID (for multi-location)
  items: CartItem[]             // Array of ordered items
  totalEur: number              // 25.50 (final total)
  status: OrderStatus           // "placed" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled"
  type: string                  // "pickup" | "delivery" | "dinein"
  tableNumber?: string          // "5" (for dine-in orders)
  address?: Address | null      // Delivery address (null for pickup/dinein)
  paymentStatus: string         // "pending" | "paid" | "failed" | "refunded"
  paymentMethod: string         // "card" | "cash_on_delivery" | "pay_at_restaurant" | "counter"
  couponCode?: string | null    // "WELCOME10"
  discount?: number             // 2.50 (discount amount)
  loyaltyPointsUsed?: number    // 50
  loyaltyPointsEarned?: number  // 25
  estimatedTime?: Timestamp     // Estimated delivery/pickup time
  courierLocation?: {           // Live courier tracking
    lat: number
    lng: number
  }
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp          // Order placed time
  updatedAt: Timestamp          // Last status update
}

// CartItem sub-object
CartItem {
  id: string                    // Unique cart item ID
  menuItem: MenuItem            // Full menu item object
  quantity: number              // 2
  customizations: SelectedCustomization[]  // Legacy customizations
  ingredientCustomizations?: IngredientCustomization[]  // New ingredient-based customizations
  totalPrice: number            // 17.00 (item price × quantity + customizations)
}

// IngredientCustomization sub-object
IngredientCustomization {
  ingredientId: string          // "ing_001"
  ingredientName: string        // "Extra Cheese"
  quantity: number              // 2 (double cheese)
  priceAdjustment: number       // 1.50 (per unit)
}
```

#### **Collection: `promotions`**

```typescript
promotions/{promotionId}
{
  id: string                    // "promo_001"
  title: string                 // "Family Meal Deal"
  description: string           // "Save 20% on family meals"
  imageUrl: string              // "https://..."
  discount: string              // "20%" or "€5 off"
  validFrom: Timestamp          // Start date
  validUntil: Timestamp         // End date
  active: boolean               // true
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
}
```

#### **Collection: `coupons`**

```typescript
coupons/{couponId}
{
  id: string                    // "coupon_001"
  code: string                  // "WELCOME10" (unique)
  discountType: string          // "percentage" | "fixed"
  discountValue: number         // 10 (10% or €10)
  validFrom: Timestamp          // Start date
  validTo: Timestamp            // End date
  active: boolean               // true
  minOrderAmount?: number       // 20.00 (minimum order for coupon)
  maxDiscount?: number          // 5.00 (max discount cap)
  usageLimit?: number           // 100 (total uses allowed)
  usageCount: number            // 45 (current usage count)
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
}
```

#### **Collection: `branches`**

```typescript
branches/{branchId}
{
  id: string                    // "branch_001"
  name: string                  // "Curry&Burger Milano Centro"
  address: string               // "Via Roma 123, Milano"
  phone: string                 // "+39 02 1234567"
  lat: number                   // 45.4642
  lng: number                   // 9.1900
  openHours: {                  // Opening hours
    monday: { open: "10:00", close: "22:00" }
    tuesday: { open: "10:00", close: "22:00" }
    // ... other days
  }
  isActive: boolean             // true
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
}
```

#### **Collection: `loyalty_transactions`**

```typescript
loyalty_transactions/{transactionId}
{
  id: string                    // Auto-generated
  userId: string                // User ID
  pointsDelta: number           // +25 (earned) or -50 (redeemed)
  reason: string                // "Order #12345" or "Redeemed for discount"
  orderId?: string              // "order_123" (if related to order)
  restaurantId: string          // "curry-burger-main"
  createdAt: Timestamp
}
```

---

## 4. Firestore Indexes

### 4.1 Why Indexes Are Needed

Firestore requires composite indexes for queries that:
- Filter on multiple fields
- Order by a field different from the filter field
- Use array-contains with other filters

### 4.2 Required Composite Indexes

**Index 1: Menu Items by Restaurant, Category, and Published Status**
```
Collection: menu_items
Fields:
  - restaurantId (Ascending)
  - category (Ascending)
  - published (Ascending)
  - createdAt (Descending)
```

**Index 2: Popular Menu Items**
```
Collection: menu_items
Fields:
  - restaurantId (Ascending)
  - published (Ascending)
  - orderCount (Descending)
```

**Index 3: Orders by User and Date**
```
Collection: orders
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**Index 4: Orders by Restaurant and Status**
```
Collection: orders
Fields:
  - restaurantId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
```

**Index 5: Orders by Restaurant and Date**
```
Collection: orders
Fields:
  - restaurantId (Ascending)
  - createdAt (Descending)
```

**Index 6: Orders by Type (Delivery/Pickup/Dine-in)**
```
Collection: orders
Fields:
  - restaurantId (Ascending)
  - type (Ascending)
  - createdAt (Descending)
```

**Index 7: Active Promotions**
```
Collection: promotions
Fields:
  - restaurantId (Ascending)
  - active (Ascending)
  - validUntil (Descending)
```

**Index 8: Loyalty Transactions by User**
```
Collection: loyalty_transactions
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**Index 9: Ingredients by Category**
```
Collection: ingredients
Fields:
  - restaurantId (Ascending)
  - category (Ascending)
  - active (Ascending)
```

### 4.3 How to Create Indexes

**Method 1: Firebase Console (Manual)**
1. Go to Firebase Console → Firestore → Indexes
2. Click "Create Index"
3. Select collection and fields
4. Click "Create"

**Method 2: Auto-create from Error**
1. Run your app and trigger the query
2. Check browser console for error
3. Click the provided link to auto-create index
4. Wait 2-5 minutes for index to build

**Method 3: Deploy from JSON (Recommended)**
```bash
# The firestore.indexes.json file is already in your project
firebase deploy --only firestore:indexes
```

### 4.4 Index Status

Check index build status:
- Firebase Console → Firestore → Indexes
- Status: "Building" → "Enabled" (usually 2-5 minutes)

---

## 5. Security Rules

### 5.1 Complete Firestore Rules

The `firestore.rules` file in your project contains all security rules. Key rules:

**Public Read Rules**:
- ✅ Anyone can read published menu items
- ✅ Anyone can read active promotions
- ✅ Anyone can read branch information
- ✅ Anyone can read ingredients (for menu display)

**Authenticated User Rules**:
- ✅ Users can create orders with their own userId
- ✅ Users can read their own orders
- ✅ Users can read/update their own profile
- ✅ Users can read active coupons

**Admin/Staff Rules**:
- ✅ Admin can create/update/delete menu items
- ✅ Admin can create/update/delete promotions
- ✅ Admin can create/update/delete coupons
- ✅ Admin can create/update/delete ingredients
- ✅ Staff can read all orders
- ✅ Staff can update order status and payment status
- ✅ Admin can delete orders

**Security Validations**:
- ✅ Order type must be "delivery", "pickup", or "dinein"
- ✅ Order must have required fields (userId, items, totalEur, status, type, paymentMethod)
- ✅ Users cannot create orders for other users
- ✅ Only staff can update order status
- ✅ Only admin can delete data

### 5.2 Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Initialize Firestore (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 5.3 Test Security Rules

**Firebase Console → Firestore → Rules → Playground**

Test scenarios:
```javascript
// Test 1: Customer can read published item
Auth: { uid: "user123" }
Path: /menu_items/item1
Operation: get
Data: { published: true }
Result: ✅ ALLOW

// Test 2: Customer cannot read unpublished item
Auth: { uid: "user123" }
Path: /menu_items/item2
Operation: get
Data: { published: false }
Result: ❌ DENY

// Test 3: Customer can create order with own userId
Auth: { uid: "user123" }
Path: /orders/order1
Operation: create
Data: { userId: "user123", items: [...], totalEur: 25.50, status: "placed", type: "delivery", paymentMethod: "card" }
Result: ✅ ALLOW

// Test 4: Customer cannot create order for another user
Auth: { uid: "user123" }
Path: /orders/order2
Operation: create
Data: { userId: "user456", ... }
Result: ❌ DENY

// Test 5: Staff can update order status
Auth: { uid: "staff123" }
Path: /orders/order1
Operation: update
Data: { status: "preparing" }
User Data: { role: "staff" }
Result: ✅ ALLOW
```

---

## 6. Firebase Storage

### 6.1 Storage Structure

```
gs://curry-burger-main.appspot.com/
├── menu-items/
│   ├── burgers/
│   │   ├── classic-burger.jpg
│   │   ├── cheese-burger.jpg
│   │   └── ...
│   ├── wraps/
│   ├── tacos/
│   └── ...
├── promotions/
│   ├── family-deal.jpg
│   ├── lunch-special.jpg
│   └── ...
├── ingredients/
│   ├── extra-cheese.jpg
│   ├── bacon.jpg
│   └── ...
└── user-uploads/
    └── {userId}/
        └── profile-pic.jpg
```

### 6.2 Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read for menu items and promotions
    match /menu-items/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /promotions/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /ingredients/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User uploads (profile pictures, etc.)
    match /user-uploads/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6.3 Deploy Storage Rules

```bash
firebase deploy --only storage
```

---

## 7. Authentication Setup

### 7.1 Enable Auth Providers

**Firebase Console → Authentication → Sign-in method**

Enable:
- ✅ Email/Password (required)
- ✅ Google (recommended)
- ⬜ Apple (optional)
- ⬜ Phone (optional)

### 7.2 Configure Authorized Domains

**Firebase Console → Authentication → Settings → Authorized domains**

Add:
- `localhost` (for development)
- `your-app.vercel.app` (Vercel preview/production)
- `your-custom-domain.com` (if using custom domain)

### 7.3 Create Admin User

**Method 1: Firebase Console**
1. Authentication → Users → Add User
2. Email: `admin@curryanburger.com`
3. Password: (set secure password)
4. Copy the User UID
5. Go to Firestore → `users` collection
6. Create document with ID = User UID
7. Set fields:
```json
{
  "email": "admin@curryanburger.com",
  "name": "Admin User",
  "role": "admin",
  "loyaltyPoints": 0,
  "addresses": [],
  "favorites": [],
  "createdAt": [current timestamp],
  "updatedAt": [current timestamp]
}
```

**Method 2: Admin SDK (Programmatic)**
```typescript
// In an API route or script
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const auth = getAuth()
const db = getFirestore()

// Create auth user
const userRecord = await auth.createUser({
  email: 'admin@curryanburger.com',
  password: 'SecurePassword123!',
  displayName: 'Admin User'
})

// Create Firestore user document
await db.collection('users').doc(userRecord.uid).set({
  email: 'admin@curryanburger.com',
  name: 'Admin User',
  role: 'admin',
  loyaltyPoints: 0,
  addresses: [],
  favorites: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 8. Real-time Listeners

### 8.1 Customer App Listeners

**Menu Items** (`hooks/use-menu-items.ts`):
```typescript
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const q = query(
  collection(db, 'menu_items'),
  where('restaurantId', '==', restaurantId),
  where('published', '==', true)
)

const unsubscribe = onSnapshot(q, (snapshot) => {
  const items = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setMenuItems(items)
})
```

**User Orders** (`components/orders/orders-list.tsx`):
```typescript
const q = query(
  collection(db, 'orders'),
  where('userId', '==', currentUser.uid),
  orderBy('createdAt', 'desc')
)

const unsubscribe = onSnapshot(q, (snapshot) => {
  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setOrders(orders)
})
```

**Promotions** (`components/deals/deals-content.tsx`):
```typescript
const q = query(
  collection(db, 'promotions'),
  where('restaurantId', '==', restaurantId),
  where('active', '==', true)
)

const unsubscribe = onSnapshot(q, (snapshot) => {
  const promos = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setPromotions(promos)
})
```

### 8.2 Admin App Listeners

**All Orders** (`components/admin/orders-manager.tsx`):
```typescript
const q = query(
  collection(db, 'orders'),
  where('restaurantId', '==', restaurantId),
  orderBy('createdAt', 'desc')
)

const unsubscribe = onSnapshot(q, (snapshot) => {
  const orders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setOrders(orders)
  
  // Play sound for new orders
  if (snapshot.docChanges().some(change => change.type === 'added')) {
    playNotificationSound()
  }
})
```

**All Menu Items** (`components/admin/menu-manager.tsx`):
```typescript
const q = query(
  collection(db, 'menu_items'),
  where('restaurantId', '==', restaurantId),
  orderBy('createdAt', 'desc')
)

const unsubscribe = onSnapshot(q, (snapshot) => {
  const items = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setMenuItems(items)
})
```

### 8.3 Cleanup Listeners

Always cleanup listeners to prevent memory leaks:

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Handle updates
  })
  
  // Cleanup on unmount
  return () => unsubscribe()
}, [])
```

---

## 9. Cloud Functions

### 9.1 Order Processing Function

**Purpose**: Increment orderCount when order is placed

**Location**: `app/api/orders/route.ts` (Next.js API route)

```typescript
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  const orderData = await request.json()
  
  // Create order
  const orderRef = await db.collection('orders').add({
    ...orderData,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })
  
  // Increment orderCount for each item
  const batch = db.batch()
  for (const item of orderData.items) {
    const itemRef = db.collection('menu_items').doc(item.menuItem.id)
    batch.update(itemRef, {
      orderCount: FieldValue.increment(item.quantity)
    })
  }
  await batch.commit()
  
  return Response.json({ orderId: orderRef.id })
}
```

### 9.2 Payment Confirmation Function

**Purpose**: Generate invoice when payment is confirmed

**Location**: `components/admin/orders-manager.tsx`

```typescript
const confirmPayment = async (orderId: string) => {
  // Update payment status
  await updateDoc(doc(db, 'orders', orderId), {
    paymentStatus: 'paid',
    updatedAt: new Date()
  })
  
  // Generate invoice (handled client-side with jsPDF)
  generateInvoice(order)
}
```

---

## 10. Data Initialization

### 10.1 Sample Data Script

Run the initialization script to populate your database:

**Location**: `scripts/initialize-firebase-data.ts`

**What it creates**:
- 13 menu categories
- 80+ menu items
- 3 sample branches
- 5 sample promotions
- 2 sample coupons
- 20+ ingredients
- Admin user

**How to run**:
1. Ensure environment variables are set
2. Run from v0 interface or locally:
```bash
npx tsx scripts/initialize-firebase-data.ts
```

### 10.2 Manual Data Entry

If you prefer manual entry, use Firebase Console:

1. Go to Firestore Database
2. Create each collection
3. Add documents with the schema from Section 3
4. Ensure `restaurantId` matches `NEXT_PUBLIC_RESTAURANT_ID`

---

## 11. Testing & Validation

### 11.1 Test Real-time Sync

**Test 1: Menu Updates**
1. Admin: Edit menu item → Save
2. Customer: Open menu page (no refresh)
3. Expected: Changes appear instantly

**Test 2: Order Creation**
1. Customer: Place order
2. Admin: Open orders dashboard
3. Expected: New order appears with sound notification

**Test 3: Order Status Updates**
1. Admin: Update order status to "preparing"
2. Customer: Open order tracking page
3. Expected: Status updates instantly

**Test 4: Promotions**
1. Admin: Create new promotion
2. Customer: Open deals page
3. Expected: New promotion appears instantly

### 11.2 Test Security Rules

**Test 1: Unauthorized Access**
```typescript
// Try to read unpublished item as customer
const itemRef = doc(db, 'menu_items', 'unpublished-item')
const itemSnap = await getDoc(itemRef)
// Expected: Permission denied error
```

**Test 2: Cross-user Access**
```typescript
// Try to read another user's order
const orderRef = doc(db, 'orders', 'other-user-order')
const orderSnap = await getDoc(orderRef)
// Expected: Permission denied error
```

**Test 3: Admin Access**
```typescript
// Admin should be able to read all data
const itemsRef = collection(db, 'menu_items')
const itemsSnap = await getDocs(itemsRef)
// Expected: Success (all items returned)
```

### 11.3 Test Payment Flow

**Test 1: Cash Payment**
1. Customer: Place order with "Pay at Restaurant"
2. Expected: `paymentStatus: "pending"`
3. Admin: Confirm payment
4. Expected: `paymentStatus: "paid"`, invoice generated

**Test 2: Online Payment**
1. Customer: Place order with "Card"
2. Expected: `paymentStatus: "paid"` immediately

### 11.4 Test Dine-in Flow

**Test 1: QR Code Scan**
1. Generate QR code for Table 5
2. Scan QR code
3. Expected: App opens with `?mode=dinein&table=5`
4. Place order
5. Expected: Order has `type: "dinein"`, `tableNumber: "5"`

---

## 12. Production Deployment

### 12.1 Pre-deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] All indexes created and enabled
- [ ] Sample data populated
- [ ] Admin user created with correct role
- [ ] Authentication providers enabled
- [ ] Authorized domains configured
- [ ] Real-time sync tested
- [ ] Order flow tested end-to-end
- [ ] Payment methods tested
- [ ] Security rules tested
- [ ] Mobile responsive tested

### 12.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 12.3 Post-deployment Verification

1. **Test Production URL**:
   - Browse menu
   - Place test order
   - Check admin dashboard

2. **Monitor Firestore Usage**:
   - Firebase Console → Firestore → Usage
   - Check read/write operations
   - Verify no excessive reads

3. **Check Error Logs**:
   - Vercel Dashboard → Logs
   - Firebase Console → Firestore → Rules (violations)

---

## 13. Monitoring & Analytics

### 13.1 Firebase Console Monitoring

**Firestore Usage**:
- Go to Firestore → Usage
- Monitor: Reads, Writes, Deletes, Storage

**Authentication**:
- Go to Authentication → Users
- Monitor: Sign-ups, Active users

**Storage**:
- Go to Storage → Usage
- Monitor: Files, Bandwidth

### 13.2 Set Up Alerts

**Firebase Console → Project Settings → Integrations**

Set alerts for:
- High read/write usage (>80% of quota)
- Security rule violations
- Authentication failures
- Storage quota exceeded

### 13.3 Analytics Dashboard

**Admin Dashboard** (`components/admin/analytics-dashboard.tsx`):
- Total Revenue (real-time)
- Total Orders (real-time)
- Completed Orders (real-time)
- Total Customers (real-time)
- Average Order Value (real-time)
- Invoices Paid/Pending (real-time)

All metrics use `onSnapshot()` for real-time updates.

---

## 14. Troubleshooting

### 14.1 Common Issues

**Issue: "Missing or insufficient permissions"**

Solution:
1. Check Firestore rules are deployed
2. Verify user is authenticated
3. Check user has correct `role` in Firestore
4. Test rules in Firebase Console → Rules Playground

**Issue: "Index not found"**

Solution:
1. Check browser console for index creation link
2. Click link to auto-create index
3. Wait 2-5 minutes for index to build
4. Or deploy indexes: `firebase deploy --only firestore:indexes`

**Issue: "Menu items not appearing"**

Solution:
1. Check `published: true` in menu items
2. Verify `restaurantId` matches `NEXT_PUBLIC_RESTAURANT_ID`
3. Check browser console for errors
4. Verify Firestore rules allow read access

**Issue: "Orders not syncing to admin"**

Solution:
1. Verify admin user has `role: "admin"` in Firestore
2. Check Firestore rules allow admin to read orders
3. Check browser console for real-time listener errors
4. Verify `restaurantId` matches in orders

**Issue: "Images not loading"**

Solution:
1. Check Storage rules are deployed
2. Verify image URLs are public
3. Check CORS settings in Storage
4. Verify image files exist in Storage

**Issue: "Real-time updates not working"**

Solution:
1. Check `onSnapshot()` listeners are set up correctly
2. Verify cleanup functions are called on unmount
3. Check browser console for listener errors
4. Test with Firebase Emulator locally

**Issue: "Payment confirmation not working"**

Solution:
1. Check admin has permission to update `paymentStatus`
2. Verify Firestore rules allow status updates
3. Check browser console for errors
4. Test with different payment methods

**Issue: "Dine-in orders not showing table number"**

Solution:
1. Verify URL params are being read correctly
2. Check `tableNumber` is included in order data
3. Verify Firestore rules allow `tableNumber` field
4. Check admin orders manager displays table number

### 14.2 Debug Mode

Enable debug logging:

```typescript
// In lib/firebase.ts
import { setLogLevel } from 'firebase/firestore'

if (process.env.NODE_ENV === 'development') {
  setLogLevel('debug')
}
```

### 14.3 Firebase Emulator (Local Testing)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

Update `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_HOST=localhost:8080
```

---

## 🎉 Conclusion

You now have a complete reference for all Firebase and Firestore configuration for the Curry&Burger app. This guide covers:

- ✅ Complete Firestore schema with all collections
- ✅ All required indexes for optimal query performance
- ✅ Comprehensive security rules with role-based access
- ✅ Real-time listeners for instant sync
- ✅ Payment confirmation and invoice generation
- ✅ Dine-in ordering with QR codes
- ✅ Ingredient-based meal customization
- ✅ Production deployment checklist
- ✅ Monitoring and troubleshooting

For specific features, refer to:
- `FIREBASE_SETUP_GUIDE.md` - Initial setup instructions
- `DINE_IN_SETUP_GUIDE.md` - Dine-in ordering setup
- `PRODUCTION_DEPLOYMENT.md` - Production deployment guide
- `REALTIME_SYNC_GUIDE.md` - Real-time sync troubleshooting

**Need Help?**
- Check browser console for specific errors
- Check Firebase Console for rule violations
- Test with Firebase Emulator locally
- Review security rules in Rules Playground

Happy cooking! 🍔🍛
