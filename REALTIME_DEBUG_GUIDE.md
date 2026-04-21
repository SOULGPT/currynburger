# Real-Time Sync Debug Guide

## Testing Steps

### 1. Open Browser Console (F12)

Make sure you see these logs when the page loads:

**Customer Page (menu page):**
```
[v0 Customer] 🚀 useMenuItems hook mounting - setting up subscription
[v0 Firebase] 🔄 Setting up REAL-TIME listener on menu_items collection
[v0 Firebase] ✅ Listener setup complete
[v0 Firebase] 🔥 SNAPSHOT RECEIVED! Total docs: X
[v0 Customer] 📥 Received snapshot callback with X items
[v0 Customer] ✅ Using X items from Firestore
```

**Admin Page:**
```
[v0 Firebase] 🔄 Setting up REAL-TIME listener on menu_items collection
[v0 Firebase] ✅ Listener setup complete
[v0 Firebase] 🔥 SNAPSHOT RECEIVED! Total docs: X
```

### 2. Add New Item in Admin

When you click "Add Item" and save, you should see:

**Admin Console:**
```
[v0 Admin] ➕ Adding new menu item: Test Burger
[v0 Admin] Item data: {...}
[v0 Admin] Writing to Firestore with data: {...}
[v0 Admin] ✅ Item added to Firestore! Document ID: abc123
[v0 Admin] 🔥 onSnapshot listeners should trigger NOW on all connected clients
[v0 Firebase] 🔥 SNAPSHOT RECEIVED! Total docs: X+1
[v0 Firebase] 📦 Item: abc123 | Test Burger | published: true
```

**Customer Console (SHOULD update automatically):**
```
[v0 Firebase] 🔥 SNAPSHOT RECEIVED! Total docs: X+1
[v0 Firebase] 📦 Item: abc123 | Test Burger | published: true
[v0 Customer] 📥 Received snapshot callback with X+1 items
[v0 Customer] ✅ Using X+1 items from Firestore
```

### 3. If NO Customer Update

Check these:

1. **Firestore Rules Not Deployed**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Check Firebase Console**
   - Go to Firestore Database
   - Look for `menu_items` collection
   - Verify the item was actually saved
   - Check if `published: true` is set

3. **Check Browser Console for Errors**
   - Look for red error messages
   - Check for `403 Forbidden` or permission errors

4. **Hard Refresh Customer Page**
   - Windows/Linux: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

5. **Check Network Tab**
   - Open DevTools → Network tab
   - Look for `firestore` requests
   - Should see `200 OK` responses

## Common Issues

### Issue: "Missing or insufficient permissions"

**Solution:** Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### Issue: Items show in admin but not customer

**Problem:** Customer is filtering `published: false` items

**Solution:** Make sure new items have `published: true` (they should by default)

### Issue: No snapshot logs at all

**Problem:** Firebase not configured or listener not set up

**Solution:** 
1. Check env vars are set correctly
2. Check browser console for Firebase init errors
3. Make sure `isFirebaseConfigured()` returns true

## Success Criteria

✅ Admin adds item → Console shows "Item added to Firestore"
✅ Admin console shows snapshot received with new item
✅ Customer console shows snapshot received with new item (within 1-2 seconds)
✅ Customer UI updates without manual refresh
✅ Item appears in correct category
✅ Item shows correct price and image

## Production Ready

Once you see all the logs flowing correctly and items appearing instantly on customer pages without refresh, your real-time sync is working perfectly and the app is ready for production!
