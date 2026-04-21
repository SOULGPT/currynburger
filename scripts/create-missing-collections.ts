import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createMissingCollections() {
  console.log("Creating missing collections...\n")

  try {
    // Create deals collection with sample data
    console.log("1. Creating deals collection...")
    const deal1 = await addDoc(collection(db, "deals"), {
      title: "Family Feast Deal",
      description: "Perfect for the whole family - 4 burgers, 4 drinks, and large fries",
      imageUrl: "/family-burger-feast.jpg",
      priceEur: 39.99,
      originalPriceEur: 54.99,
      discount: "Save €15",
      category: "Family Deals",
      active: true,
      validUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
      items: [
        {
          id: "burgers",
          name: "Choose Your Burgers (4x)",
          category: "main",
          imageUrl: "/classic-beef-burger.png",
          required: true,
          options: [
            { id: "classic", name: "Classic Burger", priceEur: 0, imageUrl: "/classic-burger.png" },
            { id: "cheese", name: "Cheeseburger", priceEur: 0, imageUrl: "/classic-cheeseburger.png" },
            { id: "double", name: "Double Burger", priceEur: 2, imageUrl: "/double-burger.png" },
          ],
        },
        {
          id: "drinks",
          name: "Choose Your Drinks (4x)",
          category: "drinks",
          imageUrl: "/assorted-drinks.png",
          required: true,
          options: [
            { id: "cola", name: "Coca-Cola", priceEur: 0, imageUrl: "/refreshing-cola.png" },
            { id: "sprite", name: "Sprite", priceEur: 0, imageUrl: "/sparkling-sprite.png" },
            { id: "water", name: "Water", priceEur: 0, imageUrl: "/clear-water-ripples.png" },
          ],
        },
        {
          id: "fries",
          name: "Large Fries",
          category: "sides",
          imageUrl: "/large-fries.jpg",
          required: true,
          options: [
            { id: "regular", name: "Regular Fries", priceEur: 0, imageUrl: "/golden-crispy-fries.png" },
            { id: "curly", name: "Curly Fries", priceEur: 1, imageUrl: "/curly-fries.jpg" },
          ],
        },
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log("✅ Created Family Feast Deal:", deal1.id)

    const deal2 = await addDoc(collection(db, "deals"), {
      title: "Lunch Special",
      description: "Perfect lunch combo - burger, fries, and drink",
      imageUrl: "/lunch-burger-combo.jpg",
      priceEur: 9.99,
      originalPriceEur: 14.99,
      discount: "Save €5",
      category: "Lunch Deals",
      active: true,
      validUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      items: [
        {
          id: "burger",
          name: "Choose Your Burger",
          category: "main",
          imageUrl: "/classic-beef-burger.png",
          required: true,
          options: [
            { id: "classic", name: "Classic Burger", priceEur: 0, imageUrl: "/classic-burger.png" },
            { id: "cheese", name: "Cheeseburger", priceEur: 0, imageUrl: "/classic-cheeseburger.png" },
            { id: "chicken", name: "Chicken Burger", priceEur: 1, imageUrl: "/delicious-chicken-burger.png" },
          ],
        },
        {
          id: "fries",
          name: "Fries",
          category: "sides",
          imageUrl: "/golden-crispy-fries.png",
          required: true,
          options: [{ id: "regular", name: "Regular Fries", priceEur: 0, imageUrl: "/golden-crispy-fries.png" }],
        },
        {
          id: "drink",
          name: "Choose Your Drink",
          category: "drinks",
          imageUrl: "/refreshing-summer-drink.png",
          required: true,
          options: [
            { id: "cola", name: "Coca-Cola", priceEur: 0, imageUrl: "/refreshing-cola.png" },
            { id: "sprite", name: "Sprite", priceEur: 0, imageUrl: "/sparkling-sprite.png" },
            { id: "water", name: "Water", priceEur: 0, imageUrl: "/clear-water-ripples.png" },
          ],
        },
      ],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log("✅ Created Lunch Special:", deal2.id)

    // Create banners collection with sample data
    console.log("\n2. Creating banners collection...")
    const banner1 = await addDoc(collection(db, "banners"), {
      title: "Summer Special",
      description: "Get 20% off all burgers this summer",
      imageUrl: "/summer-burger-banner.jpg",
      ctaText: "Order Now",
      ctaLink: "/menu",
      active: true,
      order: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log("✅ Created Summer Special Banner:", banner1.id)

    const banner2 = await addDoc(collection(db, "banners"), {
      title: "New Menu Items",
      description: "Try our delicious new curry burgers",
      imageUrl: "/curry-burger-banner.jpg",
      ctaText: "Explore Menu",
      ctaLink: "/menu",
      active: true,
      order: 2,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log("✅ Created New Menu Banner:", banner2.id)

    console.log("\n✅ All missing collections created successfully!")
    console.log("\nNext steps:")
    console.log("1. Verify collections in Firebase Console")
    console.log("2. Update Firestore rules if needed")
    console.log("3. Deploy indexes: firebase deploy --only firestore:indexes")
  } catch (error) {
    console.error("❌ Error creating collections:", error)
    throw error
  }
}

// Run the script
createMissingCollections()
  .then(() => {
    console.log("\n🎉 Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error)
    process.exit(1)
  })
