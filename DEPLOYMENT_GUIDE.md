# Firebase Deployment Guide - Curry&Burger App

Complete guide for deploying the Curry&Burger restaurant app to production.

---

## Prerequisites

1. Firebase CLI installed globally
   ```bash
   npm install -g firebase-tools
   ```

2. Firebase project created in Firebase Console
3. Vercel account for hosting Next.js app
4. All environment variables ready

---

## Step 1: Firebase CLI Setup

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase (if not already done)
```bash
firebase init
```

Select:
- Firestore (Database & Rules)
- Storage
- Hosting (optional)

### Link to your Firebase project
```bash
firebase use --add
# Select your project ID and give it an alias (e.g., "production")
```

---

## Step 2: Deploy Firestore Rules & Indexes

### Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

This deploys the `firestore.rules` file to production.

### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

This creates all composite indexes defined in `firestore.indexes.json`.

**Important:** Index creation can take 5-15 minutes. Monitor progress:
```bash
firebase firestore:indexes
```

---

## Step 3: Deploy Storage Rules

```bash
firebase deploy --only storage
```

This deploys the `storage.rules` file for Firebase Storage security.

---

## Step 4: Seed Initial Data

### Option A: Using Firebase Console
1. Go to Firebase Console → Firestore Database
2. Manually create collections and documents using the schema in `FIREBASE_SCHEMA.md`

### Option B: Using Admin SDK (Recommended)
Run the seeding script (see `scripts/seed-firebase.ts`):

```bash
npm run seed-data
```

This will create:
- Default menu categories
- Sample menu items
- Initial settings
- Sample deals and promotions
- Admin user

---

## Step 5: Environment Variables

### Vercel Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

#### Firebase Client (Public - All Environments)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

#### Firebase Admin (Server-side - Production Only)
```
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

#### App Configuration
```
NEXT_PUBLIC_RESTAURANT_ID=curry-burger-main
```

#### Stripe (if using payments)
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Step 6: Deploy to Vercel

### Connect GitHub Repository
1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Vercel auto-detects Next.js configuration

### Configure Build Settings
- Framework Preset: **Next.js**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### Deploy
```bash
vercel --prod
```

Or push to `main` branch for automatic deployment.

---

## Step 7: Verify Deployment

### Check Firestore Rules
```bash
firebase firestore:rules
```

### Check Indexes
```bash
firebase firestore:indexes
```

### Test App Functionality
1. Visit your deployed URL
2. Test customer flow:
   - Browse menu
   - Add items to cart
   - View deals and promotions page
   - Apply coupon codes
   - Place order (guest or authenticated)
3. Test admin dashboard:
   - Login as admin
   - Manage menu items
   - Manage deals and promotions
   - View orders in real-time
   - Check analytics

---

## Step 8: Enable Firestore Backups (Recommended)

### Automated Daily Backups
1. Go to Firebase Console → Firestore Database
2. Click "Backups" tab
3. Enable automatic backups
4. Set retention policy (recommended: 30 days)

### Manual Export (Alternative)
```bash
gcloud firestore export gs://[BUCKET_NAME]/[EXPORT_FOLDER]
```

---

## Step 9: Monitoring & Analytics

### Enable Firebase Analytics
1. Firebase Console → Analytics
2. Enable Google Analytics
3. Link Analytics account

### Setup Error Monitoring
1. Add Sentry or similar service
2. Configure error reporting in `app/layout.tsx`

### Performance Monitoring
1. Firebase Console → Performance
2. Enable Performance Monitoring
3. Add performance traces for critical paths

---

## Production Checklist

- [ ] Firestore rules deployed and tested
- [ ] Firestore indexes created (all green)
- [ ] Storage rules deployed
- [ ] Environment variables set in Vercel
- [ ] Initial data seeded
- [ ] Admin user created
- [ ] Menu items populated
- [ ] Categories configured
- [ ] Deals and promotions added
- [ ] Branch locations added
- [ ] Test order placed successfully
- [ ] Real-time updates working
- [ ] Admin dashboard accessible
- [ ] Deals page displaying correctly
- [ ] Analytics collecting data
- [ ] Backups enabled
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] CORS configured for API routes

---

## Rollback Procedure

### Rollback Firestore Rules
```bash
# Deploy previous version from Git
git checkout [PREVIOUS_COMMIT]
firebase deploy --only firestore:rules
git checkout main
```

### Rollback Vercel Deployment
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

---

## Maintenance

### Update Menu Items
Use admin dashboard or Firebase Console.

### Monitor Performance
- Check Vercel Analytics
- Review Firebase usage quotas
- Monitor Firestore read/write operations

### Security Audits
- Review Firestore rules monthly
- Check for unused collections
- Audit user roles and permissions

---

## Troubleshooting

### Firestore Permission Denied
- Check security rules match schema
- Verify user authentication token
- Check user role in `users` collection

### Indexes Not Working
- Wait for index creation to complete
- Check Firebase Console for index status
- Verify query matches index definition

### Real-time Updates Not Working
- Check `onSnapshot` listeners in code
- Verify Firestore rules allow reads
- Check browser console for errors

### Images Not Loading
- Verify Storage rules allow public read
- Check image URLs are valid
- Confirm Firebase Storage quota not exceeded

---

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs

---

Generated: December 2025
Version: 1.0.0
