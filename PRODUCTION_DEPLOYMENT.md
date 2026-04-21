# Production Deployment Guide - Curry&Burger App

## P0 Launch Checklist

### 1. Environment & Project Setup

**Firebase Project ID**: `curry-burger-main` (update in `.env`)

**Required Environment Variables**:
```bash
# Client-side (NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=curry-burger-main
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_RESTAURANT_ID=curry-burger-main

# Server-side (Admin SDK)
FIREBASE_ADMIN_PROJECT_ID=curry-burger-main
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@curry-burger-main.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Where to store secrets**:
- Development: `.env.local` (gitignored)
- Production: Vercel Environment Variables (encrypted)

### 2. Firestore Schema Implementation

**Collections Structure**:

```
/restaurants/{restaurantId}/items/{itemId}
  - title: string
  - description: string
  - price: number
  - imageUrl: string
  - published: boolean
  - categoryId: string
  - orderCount: number
  - createdAt: timestamp
  - updatedAt: timestamp

/restaurants/{restaurantId}/offers/{offerId}
  - title: string
  - discountPercent: number
  - startsAt: timestamp
  - endsAt: timestamp
  - active: boolean
  - createdAt: timestamp
  - imageUrl: string (optional)
  - description: string (optional)

/orders/{orderId}
  - restaurantId: string
  - userId: string
  - items: array[{itemId, name, qty, price}]
  - total: number
  - status: string
  - type: "pickup" | "delivery"
  - createdAt: timestamp
  - customerContact: {name, email, phone}
  - deliveryAddress: {street, city, postalCode} (optional)
  - metadata: object (optional)

/users/{userId}
  - name: string
  - email: string
  - role: "customer" | "staff" | "admin"
  - loyaltyPoints: number
  - createdAt: timestamp
```

### 3. Real-time Listeners

**Customer App** (`lib/firebase-schema.ts`):
- `subscribeToPublishedItems()` - Only published items
- `subscribeToActiveOffers()` - Only active offers
- `subscribeToUserOrders()` - User's own orders

**Admin App**:
- `subscribeToAllItems()` - All items (including unpublished)
- `subscribeToRestaurantOrders()` - All restaurant orders

### 4. Order Processing Flow

**API Route**: `/app/api/orders/route.ts`

When order is created:
1. ✅ Create order document in `/orders/{orderId}`
2. ✅ Increment `orderCount` for each item using `FieldValue.increment()`
3. ⚠️ TODO: Mirror to `/adminOrders/{restaurantId}/{orderId}` (optional)
4. ⚠️ TODO: Send FCM push notification to admin devices
5. ✅ Return orderId to client

**Retry Logic**: Firestore transactions are atomic - if any step fails, entire operation rolls back.

### 5. Firestore Security Rules

**Deploy Rules**:
```bash
firebase deploy --only firestore:rules
```

**Key Rules**:
- ✅ Only admins can create/update/delete menu items
- ✅ Only published items visible to customers
- ✅ Users can only create orders with their own userId
- ✅ Users can only read their own orders
- ✅ Staff can read all orders and update status
- ✅ Role-based access control via `/users/{uid}.role`

**Test Rules** (Firebase Console → Firestore → Rules → Playground):
```javascript
// Test: Customer can read published item
auth: {uid: "user123"}
path: /restaurants/curry-burger-main/items/item1
operation: get
data: {published: true}
// Should: ALLOW

// Test: Customer cannot read unpublished item
auth: {uid: "user123"}
path: /restaurants/curry-burger-main/items/item2
operation: get
data: {published: false}
// Should: DENY

// Test: Customer can create order with own userId
auth: {uid: "user123"}
path: /orders/order1
operation: create
data: {userId: "user123", ...}
// Should: ALLOW

// Test: Customer cannot create order for another user
auth: {uid: "user123"}
path: /orders/order2
operation: create
data: {userId: "user456", ...}
// Should: DENY
```

### 6. Secrets & Security

**⚠️ CRITICAL - Service Account Key Security**:

1. **Revoke exposed keys immediately**:
   ```bash
   # Firebase Console → Project Settings → Service Accounts
   # Delete any compromised service accounts
   # Generate new key
   ```

2. **Store keys securely**:
   - ❌ NEVER commit to git
   - ❌ NEVER expose in client-side code
   - ✅ Use Vercel Environment Variables (encrypted)
   - ✅ Use GCP Secret Manager for production
   - ✅ Rotate keys every 90 days

3. **Least-privilege IAM**:
   ```bash
   # Service account should only have:
   - Cloud Datastore User
   - Firebase Admin SDK Administrator Service Agent
   ```

4. **Admin SDK usage**:
   - ✅ Only in API routes (`/app/api/*`)
   - ✅ Only in server components
   - ❌ NEVER in client components

### 7. Popular Items / Analytics

**Implementation**:
- `orderCount` field on each item
- Incremented atomically on order creation
- Query: `orderBy('orderCount', 'desc').limit(4)`

**Optional Analytics Collection**:
```
/analytics/popularItems/{restaurantId}/{itemId}
  - orderCount: number
  - lastOrdered: timestamp
```

### 8. SSR & Caching (Next.js)

**Current Setup**:
- Client-side real-time listeners (`onSnapshot`)
- No SSR/ISR caching issues

**If using SSR/ISR**:
```typescript
// Option 1: Client-side revalidation
'use client'
useEffect(() => {
  const unsubscribe = subscribeToPublishedItems(setItems)
  return unsubscribe
}, [])

// Option 2: Admin-triggered revalidation
// POST /api/revalidate?path=/menu
export async function POST(request: NextRequest) {
  revalidatePath('/menu')
  return NextResponse.json({ revalidated: true })
}
```

## Deployment Steps

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. Set Environment Variables
```bash
# Vercel Dashboard → Project → Settings → Environment Variables
# Add all NEXT_PUBLIC_* and FIREBASE_ADMIN_* variables
```

### 4. Initialize Data
```bash
# Run data initializer (admin dashboard)
# Or use Firebase Console to import data
```

### 5. Test Production
- [ ] Customer can browse published items
- [ ] Customer can create orders
- [ ] Admin can manage items
- [ ] Admin can see orders in real-time
- [ ] Order counts increment correctly
- [ ] Security rules block unauthorized access

## Monitoring

**Firebase Console**:
- Firestore → Usage → Monitor read/write operations
- Authentication → Users → Monitor sign-ups
- Storage → Usage → Monitor file uploads

**Vercel Dashboard**:
- Analytics → Monitor page views
- Logs → Monitor API route errors
- Speed Insights → Monitor performance

## Support

**Issues**:
- Check browser console for errors
- Check Vercel logs for API errors
- Check Firebase Console for rule violations

**Contact**: [Your contact info]
