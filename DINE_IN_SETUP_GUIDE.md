# Dine-In Ordering System Setup Guide

## Overview

The Curry&Burger app now supports **Dine-In Ordering** where customers can scan QR codes at restaurant tables to order directly from their phones without downloading an app.

## How It Works

### Customer Flow

1. **Customer sits at a table** (e.g., Table #5)
2. **Scans QR code** on the table
3. **App opens instantly** with URL: `https://yourapp.com/?mode=dinein&branchId=001&table=5`
4. **Browses menu** and customizes meals
5. **Places order** - automatically includes table number
6. **Pays at counter** when ready

### Admin Flow

1. **Order appears instantly** in Admin Dashboard under "Dine-In Orders" tab
2. **Shows table number** prominently
3. **Kitchen prepares** the order
4. **Customer pays at counter**
5. **Admin marks payment as collected**
6. **Analytics and invoices update automatically**

## Setup Instructions

### 1. Deploy Firestore Rules

The updated `firestore.rules` file now allows the "dinein" order type. Deploy it to Firebase:

```bash
firebase deploy --only firestore:rules
```

### 2. Generate QR Codes for Tables

1. Go to **Admin Dashboard** → **QR Code Generator**
2. Select your **Branch ID** (e.g., "001")
3. Enter **Table Number** (e.g., "5")
4. Click **Generate QR Code**
5. **Download** the QR code image
6. **Print** and place on the table

**QR Code URL Format:**
```
https://yourapp.com/?mode=dinein&branchId={branchId}&table={tableNumber}
```

### 3. Test the Flow

1. **Scan a QR code** with your phone
2. **Verify** the app opens with dine-in mode
3. **Place a test order**
4. **Check Admin Dashboard** → Dine-In Orders tab
5. **Verify** table number is displayed
6. **Mark payment as collected**
7. **Check Analytics** to ensure revenue updates

## Features

### Customer App

- ✅ Automatic dine-in mode detection from URL params
- ✅ Table number automatically included in order
- ✅ No delivery fee for dine-in orders
- ✅ "Pay at Counter" payment method
- ✅ Success message: "Order sent to kitchen! Table {X} - Please pay at counter"

### Admin Dashboard

- ✅ **Three order tabs**: Delivery, Pickup, Dine-In
- ✅ **Table number badge** for dine-in orders
- ✅ **Real-time order sync** with onSnapshot listeners
- ✅ **Payment confirmation** button for cash orders
- ✅ **QR Code Generator** for creating table QR codes
- ✅ **Analytics integration** - dine-in orders included in revenue

### Analytics

- ✅ Total Revenue (includes dine-in paid orders)
- ✅ Total Orders (all types)
- ✅ Completed Orders
- ✅ Pending Payments
- ✅ Real-time updates

## Database Schema

### Order Document (Dine-In)

```typescript
{
  id: string
  userId: string
  branchId: string // From QR code
  tableNumber: string // From QR code (e.g., "5")
  type: "dinein"
  items: CartItem[]
  totalEur: number
  status: "placed" | "preparing" | "ready" | "delivered"
  paymentStatus: "pending" | "paid"
  paymentMethod: "Counter"
  createdAt: Date
  updatedAt: Date
}
```

## Firestore Security Rules

The rules now allow:
- ✅ Order type: `"delivery"`, `"pickup"`, or `"dinein"`
- ✅ Optional `tableNumber` field for dine-in orders
- ✅ Staff can update `paymentStatus` to mark cash collected

## QR Code Best Practices

1. **Print on durable material** (laminated cards or table tents)
2. **Place prominently** on each table
3. **Include instructions**: "Scan to Order"
4. **Test regularly** to ensure QR codes work
5. **Update if URL changes**

## Troubleshooting

### QR Code Not Working

- Verify the URL format is correct
- Check that the app is deployed and accessible
- Ensure Firebase environment variables are set

### Orders Not Appearing in Admin

- Check Firebase connection
- Verify Firestore rules are deployed
- Check browser console for errors

### Payment Not Updating

- Ensure admin has proper permissions
- Check that `paymentStatus` field exists in order
- Verify Firestore rules allow status updates

## Next Steps

1. **Generate QR codes** for all tables
2. **Print and laminate** QR codes
3. **Train staff** on payment confirmation process
4. **Monitor analytics** to track dine-in performance
5. **Collect customer feedback**

## Support

For issues or questions, check:
- Firebase Console for errors
- Browser console for client-side errors
- Admin Dashboard analytics for order flow

---

**Your dine-in ordering system is now ready!** 🎉

Customers can scan QR codes, order instantly, and pay at the counter while you track everything in real-time.
