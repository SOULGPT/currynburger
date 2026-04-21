# Database Collections Status

This document shows the current status of all Firebase Firestore collections for the Curry&Burger app.

## Collections Summary

| Collection | Status | Records | Purpose | Admin Manager |
|------------|--------|---------|---------|---------------|
| menu_items | ✅ Exists | Variable | Menu items (burgers, wraps, etc.) | Menu Manager |
| menu_categories | ✅ Exists | ~10 | Menu categories | Menu Manager |
| ingredients | ✅ Exists | Variable | Customizable ingredients | Ingredients Manager |
| orders | ✅ Exists | Variable | Customer orders | Orders Manager |
| users | ✅ Exists | Variable | User accounts and profiles | Customers Manager |
| coupons | ✅ Exists | Variable | Discount coupons | Coupon Manager |
| promotions | ✅ Exists | Variable | Marketing promotions | Deals & Promotions |
| deals | ⚠️ Needs Data | 0 | Special deal bundles | Deals & Promotions |
| banners | ⚠️ Needs Data | 0 | Homepage banners | Deals & Promotions |
| branches | ✅ Exists | Variable | Restaurant locations | Branch Manager |
| loyalty_transactions | ✅ Exists | Variable | Loyalty points history | Auto-generated |
| meal_templates | ✅ Exists | Variable | Pre-configured meal combos | Meal Templates |
| restaurants | ⚠️ Optional | 1 | Restaurant metadata | Settings |

## Missing Collections

Based on your screenshot, you need to create:

1. **deals** - Special deal bundles (Family Feast, Lunch Special, etc.)
2. **banners** - Homepage promotional banners

## How to Create Missing Collections

### Option 1: Run the Script (Recommended)

```bash
npm run create-collections
```

This will automatically create the `deals` and `banners` collections with sample data.

### Option 2: Manual Creation

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Enter collection name: `deals`
4. Add your first document with these fields:
   - title (string)
   - description (string)
   - imageUrl (string)
   - priceEur (number)
   - originalPriceEur (number)
   - discount (string)
   - category (string)
   - active (boolean)
   - validUntil (timestamp)
   - items (array)
   - createdAt (timestamp)
   - updatedAt (timestamp)

5. Repeat for `banners` collection

## Collection Details

### deals Collection

**Purpose:** Store special meal deals and combo offers

**Schema:**
```typescript
{
  id: string
  title: string                 // e.g., "Family Feast Deal"
  description: string           // Deal description
  imageUrl: string              // Deal image URL
  priceEur: number              // Deal price
  originalPriceEur: number      // Original price
  discount: string              // e.g., "Save €15"
  category: string              // e.g., "Family Deals"
  active: boolean               // Is deal active?
  validUntil: Timestamp         // Expiration date
  items: DealItem[]             // Items included
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:**
- `active + validUntil` (for querying active deals)
- `active + category` (for filtering by category)

**Security:**
- Read: Public
- Write: Admin only

---

### banners Collection

**Purpose:** Homepage promotional banners

**Schema:**
```typescript
{
  id: string
  title: string                 // Banner title
  description: string           // Banner description
  imageUrl: string              // Banner image URL
  ctaText: string               // Call-to-action text
  ctaLink: string               // Link URL
  active: boolean               // Is banner active?
  order: number                 // Display order
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:**
- `active + order` (for displaying banners in order)

**Security:**
- Read: Public
- Write: Admin only

---

## Verification Checklist

After creating the missing collections:

- [ ] Run `npm run create-collections` or manually create collections
- [ ] Verify collections appear in Firebase Console
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Check that indexes build successfully (can take a few minutes)
- [ ] Test admin panel can create/edit deals and banners
- [ ] Verify deals appear on the Deals page
- [ ] Verify banners appear on the homepage

## Database Size Estimates

| Collection | Expected Size | Growth Rate |
|------------|---------------|-------------|
| menu_items | 50-200 | Slow |
| menu_categories | 10-20 | Very Slow |
| ingredients | 30-100 | Slow |
| orders | 1000s+ | Fast |
| users | 100s-1000s | Medium |
| coupons | 10-50 | Slow |
| promotions | 5-20 | Medium |
| deals | 5-30 | Slow |
| banners | 3-10 | Very Slow |
| branches | 1-10 | Very Slow |
| loyalty_transactions | 1000s+ | Fast |

## Next Steps

1. Create the missing collections using the script
2. Deploy updated rules and indexes
3. Test the admin panel functionality
4. Add real menu items and deals
5. Configure branch locations
6. Set up your first admin user

## Troubleshooting

### "Missing or insufficient permissions" error

Make sure:
- You're logged in as an admin user
- Your user document has `role: "admin"` in Firestore
- Firestore rules are deployed

### "Index not found" error

Run:
```bash
firebase deploy --only firestore:indexes
```

Wait for indexes to build (check status in Firebase Console)

### Collections not appearing in admin panel

1. Clear browser cache
2. Check Firebase Console to verify collections exist
3. Check browser console for JavaScript errors
4. Verify environment variables are correct

---

**Last Updated:** December 2025
