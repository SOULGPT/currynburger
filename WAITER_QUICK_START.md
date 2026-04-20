# Waiter Interface - Quick Start Guide

## 🚀 Getting Started

### 1. **Access the Waiter App**
The waiter interface is available at `app/(waiter)/` routes:
- **Table Grid**: `/(waiter)` - Main entry point with table layout
- **Order Browser**: `/(waiter)/order-browser` - Menu selection
- **Order Confirmation**: `/(waiter)/order-confirmation` - Final review

### 2. **Basic Flow**
```
1. Open app → Use role-based routing to access /(waiter)
2. See table grid with Room A (9 tables) and Room B (12 tables)
3. Tap table or select "Asporto" mode
4. Browse menu by category or search
5. Select items, customize, add notes
6. Review order and send to kitchen
7. Kitchen receives and marks ready
8. Customer notified, waiter delivers
```

---

## 📱 User Interface

### Table Grid Screen

**Header:**
- Title: "Cameriere"
- Subtitle: "Sala Ristorante"

**Mode Toggle:**
- 🪑 **Al Tavolo** (Dine-in) - Shows table grid
- 🥡 **Asporto** (Takeaway) - Direct menu for takeout

**Table Status Colors:**
| Color | Status | Meaning |
|-------|--------|---------|
| Gray | Empty | Available table |
| Orange | Occupied | Active order |
| Amber | In Cucina | Order in kitchen |
| Green | Pronto | Ready for pickup |

**Table Card Info:**
- Table number with # prefix
- Capacity (e.g., "4 posti")
- Current status label
- Order count badge (if occupied)

---

### Order Browser Screen

**Top Section:**
- Back button
- "Tavolo #X" or "Asporto" header
- Item count badge

**Category Tabs:**
- Scrollable horizontal filter
- Tap to show items in category
- Active tab highlighted in indigo (#6366F1)

**Search Bar:**
- Real-time search across all items
- Filters by name

**Menu Items:**
- Item name and description
- Price in €
- Tap to customize

**Customization Modal:**
- Item name
- Current price
- Quantity (−/+/value)
- Customization options (if any)
- Notes field (text area)
- Cancel / Add buttons

---

### Order Confirmation Screen

**Order Info Card:**
- Table / "Asporto" indicator
- Service type (Al Tavolo / Asporto)
- Item count

**Order Items:**
- Quantity × Name
- Price × quantity
- Customizations (bullet list)
- Special notes (yellow box)

**Order-level Notes:**
- Optional notes field
- Example: "Rush order", "Customer birthday"

**Total Section:**
- "TOTALE" label
- Large price display (€X.XX)

**Buttons:**
- Cancel (gray) - Back to browser
- Invia in Cucina (green) - Send order

---

## 🔧 Component Reference

### **TableCard Component**
```typescript
<TableCard
  tableId="table-5"
  tableNumber={5}
  capacity={4}
  onPress={() => handleTablePress()}
  activeTableId="table-5"
/>
```

### **useWaiterOrderStore Hook**
```typescript
const { items, totalAmount, addItem, removeItem } = useWaiterOrderStore();

// Scenario 1: Add item with customizations
addItem({
  menuItemId: "pizza-1",
  name: "Margherita",
  price: 12.50,
  quantity: 2,
  customizations: { "Size": "Large", "Crust": "Thin" },
  notes: "No onions"
});

// Scenario 2: Update quantity
updateItem("pizza-1", { quantity: 3 });

// Scenario 3: Remove item
removeItem("pizza-1");
```

### **useTables Hook**
```typescript
const { rooms, tables, tableStatus, loading, getTablesForRoom } = useTables();

// Get tables in specific room
const roomATables = getTablesForRoom("room-1");

// Check table status
console.log(tableStatus["table-5"]); // { occupied: true, ready: false, orders: [] }
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────┐
│   Waiter selects table  │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│  Browse menu + customize│
│  Zustand store builds   │
│  order in memory        │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Review order details    │
│ Confirm + send          │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ createOrder() API call  │
│ Data → Supabase         │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Kitchen Display Updates │
│ Shows pending orders    │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Kitchen marks READY     │
│ Waiter sees green light │
└──────────┬──────────────┘
           │
           ↓
┌─────────────────────────┐
│ Waiter delivers order   │
│ Marks SERVED in app     │
└─────────────────────────┘
```

---

## 💾 Data Storage

### Zustand Store (In-Memory)
```typescript
// Current order being built
{
  tableId: "table-5",
  roomId: "room-1",
  items: [
    {
      menuItemId: "pizza-1",
      name: "Margherita",
      price: 12.50,
      quantity: 2,
      customizations: { "Size": "Large" },
      notes: "Extra cheese"
    }
  ],
  type: "dinein",
  notes: "Customer VIP",
  totalAmount: 25.00
}
```

### Supabase Database (Persistent)
```sql
-- Order saved with items
INSERT INTO orders (
  user_id, table_id, room_id,
  order_type, order_source,
  status, total_amount, notes
) VALUES (...);

-- Items linked to order
INSERT INTO order_items (
  order_id, menu_item_id,
  quantity, price_at_order,
  customizations, notes
) VALUES (...);
```

---

## 🎯 Common Tasks

### **Task 1: Take a Dine-in Order**
```
1. Open app → Navigate to /(waiter)
2. Ensure "🪑 Al Tavolo" mode is active
3. Tap Table #5
4. Browse menu (search or categories)
5. Tap "Margherita" → Modal opens
6. Set quantity to 2
7. Add note: "Extra cheese"
8. Tap "Aggiungi" → Item added
9. Tap "Conferma Ordine"
10. Review all items
11. Tap "Invia in Cucina"
12. ✓ Order sent!
```

### **Task 2: Take a Takeaway Order**
```
1. Open app
2. Tap "🥡 Asporto" tab
3. Tap "Nuovo Ordine Asporto"
4. Select items as normal
5. Review and send
6. Customer gets order #
```

### **Task 3: Check Table Status**
```
1. Table Grid shows real-time status
2. Gray = Empty (available)
3. Orange = Occupied (has order)
4. Amber = In Kitchen (preparing)
5. Green (pulsing) = Ready (call customer)
```

### **Task 4: Add Multiple Items**
```
1. Browse menu
2. Select item → Customize → Add
3. Item added to cart (badge shows count)
4. Continue selecting more items
5. Each item added independently
6. All appear in confirmation
```

---

## ⚠️ Error Handling

### Network Error
**Problem:** "Failed to load tables"
**Solution:** Check internet connection, tap "Riprova"

### Order Send Failed
**Problem:** "Impossibile inviare l'ordine"
**Solution:** Check if table still exists, try again

### Customization Not Loading
**Problem:** Modal shows no options
**Solution:** Item may not have customizations - just add it normally

---

## 🔄 Real-time Updates

### Current Behavior
- Table status updates every 5 seconds
- Order status updates every 3 seconds
- Manual refresh possible with reload

### Future Enhancement
- Supabase real-time subscriptions
- Instant kitchen notifications
- Zero-latency status updates

---

## 📝 Notes & Special Features

### Order Notes Examples
- "Urgente" - Rush order (kitchen priority)
- "Compleanno" - Birthday (surprise dessert)
- "Senza glutine" - Gluten-free
- "Vegetariano" - Substitutions available
- "Cliente VIP" - Priority service

### Customization Examples
- Size: Small, Medium, Large
- Crust: Thin, Thick, Stuffed
- Spice Level: Mild, Medium, Hot, Extra
- Toppings: Add/Remove/Substitute

---

## 🐛 Troubleshooting

**Table not updating?**
- Refresh page (F5)
- Check database connection
- Verify Supabase credentials

**Items not showing?**
- Check category selection
- Try search function
- Verify menu items exist in database

**Order won't send?**
- Ensure at least 1 item selected
- Check user authentication
- Verify order data is valid

---

## 💡 Tips & Tricks

1. **Speed**: Use search to find items faster than scrolling
2. **Bulk Orders**: Add multiple quantities of same item
3. **Notes**: Always add table number or customer name in notes
4. **Categories**: Organize by type (Pizzas, Burgers, Curry, Drinks)
5. **Mobile**: Use landscape mode for better table visibility

---

## 🚀 Next Steps

After implementing waiter interface:
1. ✅ Build Kitchen Display System (see KDS docs)
2. Add real-time notifications
3. Implement split bills feature
4. Add voice commands
5. Create admin menu management

---

**Questions?** Check `WAITER_INTERFACE_DOCS.md` for comprehensive technical details.
