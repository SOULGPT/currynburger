# Real-Time Sync Verification Guide

## Current Status: ✅ REAL-TIME SYNC IS CONFIGURED

All components are using Firestore `onSnapshot()` listeners for instant updates.

## Data Flow

```
┌────────────────────────────────────────────┐
│         ADMIN MAKES CHANGE                 │
│  (Add/Edit/Delete Menu Item)               │
└─────────────────┬──────────────────────────┘
                  │
                  │ setDoc(..., {merge: true})
                  ↓
┌────────────────────────────────────────────┐
│         FIRESTORE DATABASE                 │
│         menu_items collection              │
└─────────────────┬──────────────────────────┘
                  │
                  │ onSnapshot() triggers
                  │ < 200ms latency
                  ↓
┌────────────────────────────────────────────┐
│      ALL CUSTOMER DEVICES INSTANTLY        │
│   - Home Page (Featured Items)             │
│   - Menu Page (Menu Items Grid)            │
│   - Cart (Item Updates)                    │
└────────────────────────────────────────────┘
```

## Files Using Real-Time Listeners

### 1. **lib/firebase-menu.ts**
- `subscribeToMenuItems()` - Uses `onSnapshot()` ✅
- `subscribeToMenuCategories()` - Uses `onSnapshot()` ✅
- `updateMenuItem()` - Uses `setDoc(..., {merge: true})` ✅
- `addMenuItem()` - Uses `addDoc()` with auto-ID ✅

### 2. **hooks/use-menu-items.ts**
- Calls `subscribeToMenuItems()` in `useEffect` ✅
- Filters published items for customers ✅
- Properly cleans up listener on unmount ✅

### 3. **hooks/use-menu-categories.ts**  
- Calls `subscribeToMenuCategories()` in `useEffect` ✅
- Deduplicates categories ✅
- Properly cleans up listener on unmount ✅

### 4. **components/menu/menu-items-grid.tsx**
- Uses `useMenuItems()` hook ✅
- Re-renders automatically when data changes ✅
- Shows "Not Available" overlay for unavailable items ✅

### 5. **components/home/featured-items.tsx**
- Uses `useMenuItems()` hook ✅
- Sorts by `orderCount` for popular items ✅
- Re-renders when data changes via `useEffect` dependency ✅

## Testing Real-Time Sync

### Test 1: Add New Item
1. Open two browser windows side-by-side
   - Window A: Admin dashboard (`http://localhost:3000/admin`)
   - Window B: Customer menu (`http://localhost:3000/menu`)

2. In **Window A (Admin)**:
   - Click "Add New Item"
   - Fill in details:
     - Name: "Test Burger"
     - Price: €9.99
     - Category: Select any
     - Published: ✅ Check
   - Click "Add Item"

3. In **Window B (Customer)**:
   - ✅ "Test Burger" should appear **INSTANTLY** (within 1-2 seconds)
   - NO REFRESH NEEDED

### Test 2: Edit Existing Item
1. In **Window A (Admin)**:
   - Find any menu item
   - Click Edit (pencil icon)
   - Change name to "Updated Name"
   - Change price to €12.99
   - Click "Save Changes"

2. In **Window B (Customer)**:
   - ✅ Item name and price update **INSTANTLY**
   - NO REFRESH NEEDED

### Test 3: Toggle Published Status
1. In **Window A (Admin)**:
   - Find any item
   - Click the eye icon to hide/unpublish

2. In **Window B (Customer)**:
   - ✅ Item disappears **INSTANTLY** from customer view
   - NO REFRESH NEEDED

3. In **Window A (Admin)**:
   - Click eye icon again to publish

4. In **Window B (Customer)**:
   - ✅ Item reappears **INSTANTLY**

### Test 4: Delete Item
1. In **Window A (Admin)**:
   - Click delete (trash icon) on any item
   - Confirm deletion

2. In **Window B (Customer)**:
   - ✅ Item disappears **INSTANTLY**
   - NO REFRESH NEEDED

## Troubleshooting

### Changes not appearing?

#### 1. Check Browser Console

Open DevTools (F12) and look for these logs:

**Expected Good Logs:**
```
[v0 Firebase] Setting up onSnapshot listener on menu_items collection
[v0 Firebase] ✅ Snapshot received! Total docs: 15
[v0 Customer] useMenuItems: Received snapshot with 15 total items
[v0 Admin] ✅ Item added successfully! ID: abc123
```

**Error Logs to Watch For:**
```
❌ [v0 Firebase] Error in snapshot listener: [Error details]
❌ Firebase not configured
❌ Permission denied
```

#### 2. Verify Firestore Rules

The rules MUST allow public read access:

```rules
match /menu_items/{itemId} {
  allow read: if true;  // Public read access
  allow write: if isAdmin();
}
