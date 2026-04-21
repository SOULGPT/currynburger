# Firebase Security Rules - Complete Guide

## Firestore Rules (firestore.rules)

These rules are already configured in your project. Copy the content from `firestore.rules` file.

### Key Features:
- **Public menu access**: Customers can browse menu items, categories, deals, and promotions without authentication
- **Admin-only writes**: Only admin users can add, edit, or delete menu items, categories, promotions, and deals
- **Order security**: Users can only create and view their own orders; staff can view and update all orders
- **Role-based access**: Uses user roles (admin, staff, customer) stored in Firestore users collection

### Deploy Firestore Rules:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### Verify Rules in Firebase Console:
1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Click "Firestore Database" in left menu
4. Click "Rules" tab
5. Verify the rules match your `firestore.rules` file
6. Click "Publish" if needed

---

## Storage Rules (storage.rules)

These rules control Firebase Storage access for uploaded images.

### Key Features:
- **Public image read**: All users can view menu images, deal images, promotion images
- **Admin upload**: Only admins can upload images for menu items, deals, promotions, ingredients
- **5MB size limit**: Images must be under 5MB
- **Image type validation**: Only image files allowed (image/jpeg, image/png, etc.)
- **User profiles**: Users can upload their own profile images

### Deploy Storage Rules:

```bash
# Using Firebase CLI
firebase deploy --only storage

# Or deploy everything
firebase deploy
```

### Verify Rules in Firebase Console:
1. Go to Firebase Console
2. Select your project
3. Click "Storage" in left menu
4. Click "Rules" tab
5. Verify the rules match your `storage.rules` file
6. Click "Publish" if needed

---

## Complete Deployment Command

To deploy both Firestore and Storage rules at once:

```bash
firebase deploy --only firestore:rules,storage
```

---

## Testing the Rules

### Test Menu Item Read (Customer):
1. Open customer app (not logged in)
2. Navigate to /menu
3. Should see all published menu items
4. Check browser console - should NOT see any permission errors

### Test Menu Item Write (Admin):
1. Log in as admin
2. Go to /admin
3. Add a new menu item
4. Should save successfully
5. Check customer app - item should appear instantly

### Test Image Upload (Admin):
1. Log in as admin
2. Go to /admin menu manager
3. Click "Add Item"
4. Upload an image
5. Should upload successfully to Firebase Storage
6. Image should display in customer app

---

## Common Issues

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy the Firestore rules with `firebase deploy --only firestore:rules`

### Issue: "403 Forbidden" on image upload
**Solution**: Deploy the Storage rules with `firebase deploy --only storage`

### Issue: Admin can't upload images
**Solution**: 
1. Verify user has `role: 'admin'` in Firestore users collection
2. Check Storage rules are deployed
3. Verify image is under 5MB and is valid image type

### Issue: Customer can't see menu items
**Solution**:
1. Check items have `published: true` in Firestore
2. Verify Firestore rules allow `read: if true` for menu_items
3. Check browser console for errors

---

## Production Checklist

Before going live, verify:

- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Storage rules deployed (`firebase deploy --only storage`)
- [ ] Admin user exists with `role: 'admin'` in users collection
- [ ] Test adding menu item as admin
- [ ] Test viewing menu as unauthenticated customer
- [ ] Test uploading images as admin
- [ ] Test creating order as authenticated user
- [ ] No permission errors in browser console
- [ ] Real-time sync working (add item in admin, appears in customer instantly)

---

## Rules Files Location

Your project has these files:
- `firestore.rules` - Firestore Database security rules
- `storage.rules` - Firebase Storage security rules

Both files are ready to deploy!
