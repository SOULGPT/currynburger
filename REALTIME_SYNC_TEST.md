# Real-Time Sync Testing Guide

## Quick Test

1. **Open TWO browser windows side-by-side:**
   - Window A: Admin dashboard at `/admin` 
   - Window B: Customer menu at `/menu`

2. **Open browser console (F12) in BOTH windows**

3. **In Admin window, add a new item:**
   - Click "Add New Item"
   - Fill in: Name, Category, Price, Upload Image
   - Click "Add Item"

4. **Watch BOTH consoles:**

**Admin Console Should Show:**
```
[v0 Admin] ➕ Adding new menu item: Test Burger
[v0 Admin] Item data: {...}
[v0 Admin] ✅ Item added to Firestore! Document ID: abc123
[v0 Admin] 🔥 onSnapshot listeners should trigger NOW
[v0 Firebase] 🔥 SNAPSHOT RECEIVED! Total docs: X+1
```

**Customer Console Should Show (within 1-2 seconds):**
```
[v0 Firebase] 🔥 SNAPSHOT RECEIVED! Total docs: X+1
[v0 Firebase] 📦 Item: abc123 | Test Burger | published: true
[v0 Customer] 📥 Received snapshot callback with X+1 items
[v0 Customer] ✅ Using X+1 items from Firestore
```

5. **Check Customer Window:**
   - New item should appear WITHOUT REFRESH
   - Image should be visible
   - Price should be correct

## If It Doesn't Work

### Check 1: Firestore Rules Deployed?
```bash
firebase deploy --only firestore:rules
```

### Check 2: Firebase Console
- Go to Firebase Console → Firestore Database
- Verify the item exists in `menu_items` collection
- Check `published: true` is set

### Check 3: Console Errors
- Look for red errors in browser console
- Common: "Missing or insufficient permissions" → Deploy rules
- Common: "Firebase not configured" → Check env vars in Vars section

### Check 4: Hard Refresh
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)

## Success Criteria

✅ Admin adds item → Item appears in customer menu within 2 seconds
✅ Admin edits item → Customer sees update immediately
✅ Admin deletes item → Item disappears from customer menu instantly
✅ NO manual refresh needed
✅ Works across multiple devices/browsers simultaneously

## Production Ready!

Once you see real-time updates working, your app is ready for public launch with enterprise-grade real-time synchronization!
