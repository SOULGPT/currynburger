// ... existing code ...

### 11. deals/{dealId}

Special deal bundles (meal combos, family deals).

```typescript
{
  id: string                    // Auto-generated document ID
  title: string                 // Deal title
  description: string           // Deal description
  imageUrl: string              // Deal image
  priceEur: number              // Deal price
  originalPriceEur: number      // Original price (before discount)
  discount: string              // Discount label (e.g., "Save €15")
  category: string              // Deal category
  active: boolean               // Currently active
  validUntil: Timestamp         // Expiration date
  items: DealItem[]             // Items included in deal
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**DealItem Sub-object:**
```typescript
{
  id: string
  name: string                  // Item name (e.g., "Choose Your Burgers (4x)")
  category: string              // Item category
  imageUrl: string
  required: boolean
  options: DealItemOption[]     // Available choices
}

// DealItemOption
{
  id: string
  name: string
  priceEur: number              // Additional price
  imageUrl: string
}
```

**Indexes:**
- `active` (ascending) + `validUntil` (descending)

---

### 12. promotions/{promotionId}

Marketing promotions and special offers.

```typescript
{
  id: string                    // Auto-generated document ID
  title: string                 // Promotion title
  description: string           // Promotion description
  imageUrl: string              // Promotion image
  discount: string              // Discount label (e.g., "20% OFF", "BOGO")
  active: boolean               // Currently active
  validUntil: Timestamp         // Expiration date
  priority: number              // Display priority (higher = shown first)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes:**
- `active` (ascending) + `priority` (descending)
- `active` (ascending) + `validUntil` (descending)

---

// ... existing code ...
```

```rules file="firestore.rules"
// ... existing code ...

    // ============================================
    // DEALS COLLECTION
    // ============================================
    
    match /deals/{dealId} {
      // Everyone can read active deals
      allow read: if true;
      
      // Only admins can manage deals
      allow create, update, delete: if isAdmin();
    }

    // ============================================
    // PROMOTIONS COLLECTION
    // ============================================
    
    match /promotions/{promotionId} {
      // Everyone can read active promotions
      allow read: if true;
      
      // Only admins can manage promotions
      allow create, update, delete: if isAdmin();
    }

    // ============================================
    // FALLBACK: DENY ALL OTHER ACCESS
    // ============================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
