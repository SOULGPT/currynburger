/**
 * Firebase Data Seeding Script
 *
 * Run this script to seed your Firebase database with initial data:
 * - Menu categories
 * - Sample menu items
 * - Default settings
 * - Admin user
 *
 * Usage: npm run seed-data
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()

// Restaurant ID
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "curry-burger-main"

// Categories to seed
const categories = [
  { name: "In evidenza", order: 0, description: "Featured items" },
  { name: "Burger", order: 1, description: "Delicious burgers" },
  { name: "Wrap", order: 2, description: "Fresh wraps" },
  { name: "French Tacos", order: 3, description: "French-style tacos" },
  { name: "Naan Combo", order: 4, description: "Naan combos" },
  { name: "Grigliate", order: 5, description: "Grilled specialties" },
  { name: "Chicken Combo", order: 6, description: "Chicken combos" },
  { name: "Insalate", order: 7, description: "Fresh salads" },
  { name: "Snaks", order: 8, description: "Snacks and sides" },
  { name: "Sauces", order: 9, description: "Delicious sauces" },
  { name: "Drinks", order: 10, description: "Beverages" },
]

// Sample menu items
const menuItems = [
  {
    name: "Tikka Burger",
    description: "Grilled chicken tikka with mint chutney, onions, and fresh vegetables",
    priceEur: 9.99,
    categoryId: "burger",
    imageUrl: "/tikka-chicken-burger--professional-food-photograph.jpg",
    published: true,
    available: true,
    orderCount: 45,
  },
  {
    name: "Doppio Hamburger",
    description: "Double beef patty with special curry sauce, lettuce, tomato, and cheese",
    priceEur: 11.5,
    categoryId: "burger",
    imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
    published: true,
    available: true,
    orderCount: 67,
  },
  {
    name: "Chicken Nuggets 6pz",
    description: "Crispy golden nuggets with your choice of dipping sauce",
    priceEur: 6.5,
    categoryId: "snaks",
    imageUrl: "/crispy-chicken-nuggets--professional-food-photogra.jpg",
    published: true,
    available: true,
    orderCount: 89,
  },
  {
    name: "Family Burger Deal",
    description: "4 burgers, 4 drinks, large fries - perfect for the family",
    priceEur: 39.99,
    categoryId: "in-evidenza",
    imageUrl: "/family-burger-meal-deal--professional-food-photogr.jpg",
    published: true,
    available: true,
    orderCount: 123,
  },
]

// Default settings
const settings = {
  restaurantName: "Curry&Burger",
  restaurantId: RESTAURANT_ID,
  currency: "EUR",
  taxRate: 0.21,
  deliveryFee: 3.5,
  minOrderAmount: 10.0,
  loyaltyPointsRate: 0.1, // 10 cents = 1 point
  maintenanceMode: false,
  announcement: "",
}

// Ingredients
const ingredients = [
  {
    name: "Special Curry Sauce",
    category: "Sauce",
    priceAdjustment: 0.5,
    default: false,
    optional: true,
    active: true,
  },
  {
    name: "Extra Cheese",
    category: "Cheese",
    priceAdjustment: 1.0,
    default: false,
    optional: true,
    active: true,
  },
  {
    name: "Lettuce",
    category: "Veggie",
    priceAdjustment: 0.0,
    default: true,
    optional: true,
    active: true,
  },
  {
    name: "Tomato",
    category: "Veggie",
    priceAdjustment: 0.0,
    default: true,
    optional: true,
    active: true,
  },
  {
    name: "Onions",
    category: "Veggie",
    priceAdjustment: 0.0,
    default: true,
    optional: true,
    active: true,
  },
]

// Deals to seed
const deals = [
  {
    title: "Family Feast Deal",
    description: "Perfect for the whole family - 4 burgers, 4 drinks, and large fries",
    imageUrl: "/family-burger-meal-deal--professional-food-photogr.jpg",
    priceEur: 39.99,
    originalPriceEur: 54.99,
    discount: "Save €15",
    category: "Family Deal",
    active: true,
    items: [
      {
        id: "burgers",
        name: "Choose Your Burgers (4x)",
        category: "Burger",
        imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
        required: true,
        options: [
          {
            id: "double",
            name: "Doppio Hamburger",
            priceEur: 0,
            imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
          },
          {
            id: "tikka",
            name: "Tikka Burger",
            priceEur: 2,
            imageUrl: "/tikka-chicken-burger--professional-food-photograph.jpg",
          },
        ],
      },
      {
        id: "fries",
        name: "Large Fries",
        category: "Sides",
        imageUrl: "/crispy-french-fries.png",
        required: true,
        options: [{ id: "regular", name: "Regular Fries", priceEur: 0, imageUrl: "/crispy-french-fries.png" }],
      },
      {
        id: "drinks",
        name: "Choose Your Drinks (4x)",
        category: "Beverages",
        imageUrl: "/assorted-soft-drinks.png",
        required: true,
        options: [
          { id: "coke", name: "Coca Cola", priceEur: 0, imageUrl: "/assorted-soft-drinks.png" },
          { id: "sprite", name: "Sprite", priceEur: 0, imageUrl: "/assorted-soft-drinks.png" },
        ],
      },
    ],
  },
]

// Promotions to seed
const promotions = [
  {
    title: "Weekend Special",
    description: "Buy 2 burgers, get 1 free every weekend!",
    imageUrl: "/double-burger-with-curry-sauce--professional-food-.jpg",
    discount: "BOGO",
    priority: 10,
    active: true,
  },
  {
    title: "Lunch Combo",
    description: "Any burger + fries + drink for just €9.99",
    imageUrl: "/tikka-chicken-burger--professional-food-photograph.jpg",
    discount: "20% OFF",
    priority: 8,
    active: true,
  },
  {
    title: "New Customer Welcome",
    description: "Get €5 off your first order over €20",
    imageUrl: "/family-burger-meal-deal--professional-food-photogr.jpg",
    discount: "€5 OFF",
    priority: 5,
    active: true,
  },
]

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n")

  try {
    // Seed categories
    console.log("📂 Seeding categories...")
    const categoryIdMap: { [key: string]: string } = {}

    for (const category of categories) {
      const docRef = await db.collection("menu_categories").add({
        ...category,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      categoryIdMap[category.name.toLowerCase().replace(" ", "-")] = docRef.id
      console.log(`   ✓ Created category: ${category.name}`)
    }

    // Seed menu items
    console.log("\n🍔 Seeding menu items...")
    for (const item of menuItems) {
      const categoryId = categoryIdMap[item.categoryId] || categoryIdMap["burger"]
      await db.collection("menu_items").add({
        ...item,
        categoryId,
        customizable: true,
        ingredients: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      console.log(`   ✓ Created menu item: ${item.name}`)
    }

    // Seed ingredients
    console.log("\n🥬 Seeding ingredients...")
    for (const ingredient of ingredients) {
      await db.collection("ingredients").add({
        ...ingredient,
        restaurantId: RESTAURANT_ID,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      console.log(`   ✓ Created ingredient: ${ingredient.name}`)
    }

    // Seed deals
    console.log("\n🎯 Seeding deals...")
    for (const deal of deals) {
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30) // Valid for 30 days

      await db.collection("deals").add({
        ...deal,
        validUntil: Timestamp.fromDate(validUntil),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      console.log(`   ✓ Created deal: ${deal.title}`)
    }

    // Seed promotions
    console.log("\n🎉 Seeding promotions...")
    for (const promotion of promotions) {
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 14) // Valid for 14 days

      await db.collection("promotions").add({
        ...promotion,
        validUntil: Timestamp.fromDate(validUntil),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      console.log(`   ✓ Created promotion: ${promotion.title}`)
    }

    // Seed settings
    console.log("\n⚙️  Creating default settings...")
    await db
      .collection("settings")
      .doc("general")
      .set({
        ...settings,
        updatedAt: Timestamp.now(),
      })
    console.log("   ✓ Settings created")

    console.log("\n✅ Database seeding completed successfully!")
    console.log("\n📝 Next steps:")
    console.log("   1. Create an admin user in Firebase Authentication")
    console.log('   2. Add a document in "users" collection with role: "admin"')
    console.log("   3. Deploy Firestore rules: firebase deploy --only firestore:rules")
    console.log("   4. Deploy Firestore indexes: firebase deploy --only firestore:indexes")
    console.log("   5. Deploy your app to Vercel")
    console.log("   6. Test the admin dashboard and deals page")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }

  process.exit(0)
}

// Run the seeding
seedDatabase()
