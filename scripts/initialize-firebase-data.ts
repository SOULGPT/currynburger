/**
 * Firebase Data Initialization Script
 *
 * This script populates your Firestore database with all necessary
 * collections and sample data for the Curry&Burger app.
 *
 * Run this script ONCE after setting up your Firebase project.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID || "curry-burger-main"

console.log("🔥 Starting Firebase data initialization...")
console.log(`📍 Restaurant ID: ${RESTAURANT_ID}`)

// Restaurant data
const restaurantData = {
  name: "Curry&Burger",
  address: "123 Main Street, City, Country",
  phone: "+1234567890",
  email: "info@curryanburger.com",
  settings: {
    currency: "EUR",
    taxRate: 0.1,
    deliveryFee: 3.99,
    minOrderAmount: 10.0,
  },
  createdAt: Timestamp.now(),
}

// Menu categories
const categories = [
  { name: "In evidenza", description: "Our featured items", order: 1 },
  { name: "Burger", description: "Tutti i burger hanno incluso patatine e bibita a scelta", order: 2 },
  { name: "Wrap", description: "Tutti i wrap hanno incluso patatine e bibita a scelta", order: 3 },
  { name: "French Tacos", description: "Tutti i french tacos hanno incluso patatine e bibita a scelta", order: 4 },
  { name: "Naan Combo", description: "Tutti i naan combo hanno incluso patatine e bibita a scelta", order: 5 },
  { name: "Grigliate", description: "Grilled specialties", order: 6 },
  { name: "Chicken Combo", description: "Tutti i chicken combo hanno incluso patatine e bibita a scelta", order: 7 },
  { name: "Insalate", description: "Fresh salads", order: 8 },
  { name: "Snaks", description: "Appetizers and snacks", order: 9 },
  { name: "Family Deal", description: "Perfect for sharing", order: 10 },
  { name: "Dolci", description: "Desserts", order: 11 },
  { name: "Bevande", description: "Drinks", order: 12 },
  { name: "Patatine", description: "Fries and sides", order: 13 },
]

// Menu items (all 80+ items from your menu)
const menuItems = [
  // In evidenza
  {
    category: "In evidenza",
    name: "Doppio Hamburger",
    price_eur: 11.5,
    description: "Double beef patty burger with cheese, lettuce, tomato",
  },
  {
    category: "In evidenza",
    name: "Chicken Royal",
    price_eur: 11.5,
    description: "Crispy chicken burger with royal sauce",
  },
  { category: "In evidenza", name: "Tikka Burger", price_eur: 9.99, description: "Spicy tikka chicken burger" },
  { category: "In evidenza", name: "Chicken Nuggets 6pz", price_eur: 6.5, description: "Crispy chicken nuggets" },
  { category: "In evidenza", name: "Camember Bites 6pz", price_eur: 5.99, description: "Fried camembert cheese bites" },

  // Burger
  {
    category: "Burger",
    name: "Doppio Hamburger",
    price_eur: 11.5,
    description: "Double beef patty burger with fries and drink",
  },
  {
    category: "Burger",
    name: "Chicken Royal",
    price_eur: 11.5,
    description: "Crispy chicken burger with fries and drink",
  },
  {
    category: "Burger",
    name: "Tikka Burger",
    price_eur: 9.99,
    description: "Spicy tikka chicken burger with fries and drink",
  },

  // Wrap
  { category: "Wrap", name: "Chicken Wrap", price_eur: 9.5, description: "Grilled chicken wrap with fries and drink" },
  { category: "Wrap", name: "Tikka Wrap", price_eur: 9.99, description: "Spicy tikka wrap with fries and drink" },
  { category: "Wrap", name: "Veggie Wrap", price_eur: 8.99, description: "Vegetarian wrap with fries and drink" },

  // French Tacos
  {
    category: "French Tacos",
    name: "Classic Tacos",
    price_eur: 9.99,
    description: "Classic French tacos with fries and drink",
  },
  {
    category: "French Tacos",
    name: "Spicy Chicken Tacos",
    price_eur: 10.5,
    description: "Spicy chicken tacos with fries and drink",
  },
  {
    category: "French Tacos",
    name: "Mix Tacos",
    price_eur: 11.0,
    description: "Mixed meat tacos with fries and drink",
  },

  // Naan Combo
  {
    category: "Naan Combo",
    name: "Naan Chicken Combo",
    price_eur: 10.5,
    description: "Chicken with naan bread, fries and drink",
  },
  {
    category: "Naan Combo",
    name: "Naan Beef Combo",
    price_eur: 10.99,
    description: "Beef with naan bread, fries and drink",
  },
  {
    category: "Naan Combo",
    name: "Naan Veggie Combo",
    price_eur: 9.99,
    description: "Vegetarian with naan bread, fries and drink",
  },

  // Grigliate
  { category: "Grigliate", name: "Chicken Grigliata", price_eur: 12.99, description: "Grilled chicken platter" },
  { category: "Grigliate", name: "Beef Grigliata", price_eur: 13.5, description: "Grilled beef platter" },
  { category: "Grigliate", name: "Mixed Grigliata", price_eur: 15.99, description: "Mixed grilled meats platter" },
  { category: "Grigliate", name: "Lamb Grigliata", price_eur: 14.99, description: "Grilled lamb platter" },
  { category: "Grigliate", name: "Veggie Grigliata", price_eur: 11.99, description: "Grilled vegetables platter" },
  { category: "Grigliate", name: "BBQ Grigliata", price_eur: 13.99, description: "BBQ grilled meats platter" },

  // Chicken Combo
  {
    category: "Chicken Combo",
    name: "Classic Chicken Combo",
    price_eur: 11.5,
    description: "Classic fried chicken with fries and drink",
  },
  {
    category: "Chicken Combo",
    name: "Spicy Chicken Combo",
    price_eur: 11.99,
    description: "Spicy fried chicken with fries and drink",
  },
  {
    category: "Chicken Combo",
    name: "BBQ Chicken Combo",
    price_eur: 12.5,
    description: "BBQ chicken with fries and drink",
  },
  {
    category: "Chicken Combo",
    name: "Grilled Chicken Combo",
    price_eur: 12.99,
    description: "Grilled chicken with fries and drink",
  },

  // Insalate
  { category: "Insalate", name: "Caesar Salad", price_eur: 8.5, description: "Classic Caesar salad" },
  { category: "Insalate", name: "Chicken Salad", price_eur: 9.0, description: "Fresh salad with grilled chicken" },

  // Snaks
  { category: "Snaks", name: "Chicken Nuggets 6pz", price_eur: 6.5, description: "Crispy chicken nuggets" },
  { category: "Snaks", name: "Camember Bites 6pz", price_eur: 5.99, description: "Fried camembert cheese bites" },
  { category: "Snaks", name: "Mozzarella Sticks", price_eur: 5.99, description: "Fried mozzarella sticks" },
  { category: "Snaks", name: "Onion Rings", price_eur: 4.99, description: "Crispy onion rings" },
  { category: "Snaks", name: "Jalapeño Poppers", price_eur: 5.5, description: "Spicy jalapeño poppers" },
  { category: "Snaks", name: "Cheese Balls", price_eur: 5.99, description: "Fried cheese balls" },
  { category: "Snaks", name: "Mini Chicken Wings", price_eur: 6.99, description: "Crispy chicken wings" },

  // Family Deal
  {
    category: "Family Deal",
    name: "Family Burger Deal",
    price_eur: 39.99,
    description: "4 burgers, large fries, 4 drinks",
  },
  {
    category: "Family Deal",
    name: "Family Chicken Deal",
    price_eur: 42.99,
    description: "12 pieces chicken, large fries, 4 drinks",
  },
  {
    category: "Family Deal",
    name: "Family Mix Grill",
    price_eur: 44.99,
    description: "Mixed grill platter for 4 people",
  },
  {
    category: "Family Deal",
    name: "Family Tacos Pack",
    price_eur: 38.99,
    description: "4 tacos, large fries, 4 drinks",
  },

  // Dolci
  { category: "Dolci", name: "Chocolate Brownie", price_eur: 4.5, description: "Rich chocolate brownie" },
  { category: "Dolci", name: "Tiramisu", price_eur: 4.99, description: "Classic Italian tiramisu" },
  { category: "Dolci", name: "Cheesecake", price_eur: 4.99, description: "Creamy cheesecake" },

  // Bevande
  { category: "Bevande", name: "Acqua Naturale 50cl", price_eur: 1.5, description: "Still water 50cl" },
  { category: "Bevande", name: "Acqua Frizzante 50cl", price_eur: 1.5, description: "Sparkling water 50cl" },
  { category: "Bevande", name: "Coca Cola", price_eur: 2.5, description: "Coca Cola" },
  { category: "Bevande", name: "Coca Cola Zero", price_eur: 2.5, description: "Coca Cola Zero" },
  { category: "Bevande", name: "Thè Limone", price_eur: 2.5, description: "Lemon iced tea" },
  { category: "Bevande", name: "Thè Pesca", price_eur: 2.5, description: "Peach iced tea" },
  { category: "Bevande", name: "Sprite", price_eur: 2.5, description: "Sprite" },
  { category: "Bevande", name: "Fanta", price_eur: 2.5, description: "Fanta" },
  { category: "Bevande", name: "Lemon Soda Mojito", price_eur: 2.5, description: "Lemon mojito soda" },
  { category: "Bevande", name: "Coca Cola 1.5L", price_eur: 4.0, description: "Coca Cola 1.5L" },
  { category: "Bevande", name: "Sprite 1.5L", price_eur: 4.0, description: "Sprite 1.5L" },
  { category: "Bevande", name: "Thè Pesca 1.5L", price_eur: 4.0, description: "Peach iced tea 1.5L" },
  { category: "Bevande", name: "Acqua Naturale 1L", price_eur: 2.5, description: "Still water 1L" },
  { category: "Bevande", name: "Acqua Frizzante 1L", price_eur: 2.5, description: "Sparkling water 1L" },
  { category: "Bevande", name: "Fanta 1.5L", price_eur: 4.0, description: "Fanta 1.5L" },

  // Patatine
  { category: "Patatine", name: "Patate Fritte", price_eur: 2.99, description: "Classic French fries" },
  { category: "Patatine", name: "Patate Dipper", price_eur: 3.99, description: "Dipper fries" },
  { category: "Patatine", name: "Patate Smile", price_eur: 3.99, description: "Smile fries" },
  { category: "Patatine", name: "Patate Spirale", price_eur: 3.99, description: "Spiral fries" },
  { category: "Patatine", name: "Patate Wedges", price_eur: 3.99, description: "Potato wedges" },
  {
    category: "Patatine",
    name: "Loaded Fries",
    price_eur: 7.99,
    description: "Fries with fried chicken, mozzarella, ketchup, mayo and samurai sauce",
  },
]

// Sample branches
const branches = [
  {
    name: "Curry&Burger Downtown",
    address: "123 Main Street, Downtown",
    phone: "+1234567890",
    lat: 40.7128,
    lng: -74.006,
    open_hours: {
      monday: "11:00-23:00",
      tuesday: "11:00-23:00",
      wednesday: "11:00-23:00",
      thursday: "11:00-23:00",
      friday: "11:00-00:00",
      saturday: "11:00-00:00",
      sunday: "12:00-22:00",
    },
  },
  {
    name: "Curry&Burger Westside",
    address: "456 West Avenue, Westside",
    phone: "+1234567891",
    lat: 40.7589,
    lng: -73.9851,
    open_hours: {
      monday: "11:00-23:00",
      tuesday: "11:00-23:00",
      wednesday: "11:00-23:00",
      thursday: "11:00-23:00",
      friday: "11:00-00:00",
      saturday: "11:00-00:00",
      sunday: "12:00-22:00",
    },
  },
]

// Sample promotions
const promotions = [
  {
    title: "Grand Opening Special",
    description: "Get 20% off your first order!",
    image_url: "/restaurant-grand-opening-banner.jpg",
    discount: "20%",
    code: "WELCOME20",
    valid_from: Timestamp.now(),
    valid_until: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
    active: true,
  },
  {
    title: "Family Deal Tuesday",
    description: "Every Tuesday - Family deals at special prices!",
    image_url: "/family-meal-deal-banner.jpg",
    discount: "€10 off",
    code: "FAMILY10",
    valid_from: Timestamp.now(),
    valid_until: Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)), // 90 days
    active: true,
  },
]

async function initializeData() {
  try {
    // 1. Create restaurant document
    console.log("\n📝 Creating restaurant document...")
    await db.collection("restaurants").doc(RESTAURANT_ID).set(restaurantData)
    console.log("✅ Restaurant created")

    // 2. Create menu categories
    console.log("\n📝 Creating menu categories...")
    for (const category of categories) {
      await db.collection("menu_categories").add({
        ...category,
        restaurantId: RESTAURANT_ID,
        createdAt: Timestamp.now(),
      })
    }
    console.log(`✅ Created ${categories.length} categories`)

    // 3. Create menu items
    console.log("\n📝 Creating menu items...")
    for (const item of menuItems) {
      await db.collection("menu_items").add({
        ...item,
        available: true,
        published: true,
        orderCount: 0,
        restaurantId: RESTAURANT_ID,
        image_url: `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(item.name)}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    }
    console.log(`✅ Created ${menuItems.length} menu items`)

    // 4. Create branches
    console.log("\n📝 Creating branches...")
    for (const branch of branches) {
      await db.collection("branches").add({
        ...branch,
        restaurantId: RESTAURANT_ID,
        createdAt: Timestamp.now(),
      })
    }
    console.log(`✅ Created ${branches.length} branches`)

    // 5. Create promotions
    console.log("\n📝 Creating promotions...")
    for (const promotion of promotions) {
      await db.collection("promotions").add({
        ...promotion,
        restaurantId: RESTAURANT_ID,
        createdAt: Timestamp.now(),
      })
    }
    console.log(`✅ Created ${promotions.length} promotions`)

    console.log("\n🎉 Firebase initialization complete!")
    console.log("\n📋 Next steps:")
    console.log("1. Create an admin user in Firebase Authentication")
    console.log('2. Add a document in the "users" collection with the admin UID and role: "admin"')
    console.log("3. Deploy Firestore rules: firebase deploy --only firestore:rules")
    console.log("4. Create required indexes (see FIREBASE_SETUP_GUIDE.md)")
    console.log("5. Test the app!")
  } catch (error) {
    console.error("❌ Error initializing data:", error)
    throw error
  }
}

// Run the initialization
initializeData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
