/**
 * Script to create an admin user in Firestore
 * Run this after deploying your app to create the first admin
 *
 * Usage:
 * 1. Set your Firebase Admin credentials as environment variables
 * 2. Run: npm run create-admin
 */

import admin from "firebase-admin"

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = admin.firestore()
const auth = admin.auth()

async function createAdminUser(email: string, password: string, name: string) {
  try {
    console.log("Creating admin user...")

    // Create authentication user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    })

    console.log(`✅ Auth user created with UID: ${userRecord.uid}`)

    // Create Firestore user document with admin role
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role: "admin",
      loyaltyPoints: 0,
      addresses: [],
      favorites: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log("✅ Admin user document created in Firestore")
    console.log(`\n🎉 Admin user created successfully!`)
    console.log(`Email: ${email}`)
    console.log(`UID: ${userRecord.uid}`)
    console.log(`\nYou can now sign in with this account.`)
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    throw error
  }
}

// Run the script
const adminEmail = process.env.ADMIN_EMAIL || "admin@curryandburger.com"
const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!"
const adminName = process.env.ADMIN_NAME || "Admin User"

createAdminUser(adminEmail, adminPassword, adminName)
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
