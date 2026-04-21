# Firestore Security Rules Updated

## Changes Made

### Order Creation Permission Fix

The Firestore security rules have been updated to fix the "missing or insufficient permissions" error that customers were experiencing during checkout.

**Problem:**
- Guest users couldn't place orders because the rules only allowed authenticated Firebase users
- The rule checked `request.resource.data.userId == request.auth.uid` which failed for guests

**Solution:**
1. Added `isValidGuestOrder()` function to validate guest orders
2. Guest orders must have:
   - `userId` starting with `guest-`
   - Required fields: `userEmail`, `userName`, `items`, `totalEur`, `status`, `type`
3. Updated order creation rules to allow EITHER:
   - Authenticated users creating their own orders, OR
   - Valid guest orders

### Deployment Instructions

To deploy the updated Firestore rules to production:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules

# Or deploy from Firebase Console
# 1. Go to Firebase Console > Firestore Database > Rules
# 2. Copy the contents of firestore.rules
# 3. Click "Publish"
```

### Testing

After deploying, test the following scenarios:

1. **Guest Checkout**: Continue as guest → Add items → Checkout → Should work
2. **Authenticated Checkout**: Sign in → Add items → Checkout → Should work  
3. **Admin Access**: Sign in as admin → View all orders → Should work

### Security Notes

- Guest orders are validated to ensure required fields are present
- Guests can only read their own orders (by email match)
- Authenticated users can read their own orders
- Admin/staff can read and manage all orders
- All menu items and ingredients remain publicly readable
