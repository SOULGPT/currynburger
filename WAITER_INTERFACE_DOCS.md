# Waiter Interface (Cameriere) - Implementation Guide

## Overview

The Waiter Interface is a complete order-taking system for restaurant staff. It provides:
- **Real-time table grid** showing status of all tables and rooms
- **Menu browsing** with live prices and availability
- **Order customization** with item notes and special requests
- **Order confirmation** with final review before sending to kitchen
- **Support for both dine-in and takeaway** orders

---

## Architecture

### Directory Structure

```
features/waiter/
├── hooks/
│   ├── useTables.ts              # Load rooms and table data
│   ├── useWaiterOrders.ts        # Fetch and subscribe to orders
│   └── index.ts                  # Barrel export
├── stores/
│   ├── waiterOrder.store.ts      # Zustand store for order-building
│   └── index.ts                  # Barrel export
├── components/
│   ├── TableCard.tsx             # Visual table status indicator
│   └── index.ts                  # Barrel export

app/(waiter)/
├── _layout.tsx                   # Router stack configuration
├── index.tsx                      # Table grid main screen
├── order-browser.tsx              # Menu selection screen
└── order-confirmation.tsx         # Order review & send screen
```

---

## Core Components

### 1. **TableCard Component**
Displays a single table with status indicators.

**Props:**
```typescript
interface TableCardProps {
  tableId: string;
  tableNumber: number;
  capacity: number;
  onPress: () => void;
  activeTableId?: string;
}
```

**Status Colors:**
- **Gray** (#9CA3AF) - Empty
- **Orange** (#F97316) - Occupied
- **Amber** (#FBBF24) - In Kitchen (preparing)
- **Green** (#22C55E) - Ready for Pickup (pulsing)

**Features:**
- Shows order count badge
- Pulsing animation when ready
- Tap to start order

---

## Key Hooks

### 2. **useTables()**
Manages all table and room data.

```typescript
const {
  rooms,                    // Array of Room objects
  tables,                   // Array of all tables
  tableStatus,              // Status map by tableId
  loading,                  // Loading state
  error,                    // Error message if any
  updateTableStatus,        // Update table occupied/ready status
  getTablesForRoom,         // Get tables filtered by roomId
} = useTables();
```

**Auto-refreshes:** Every 5 seconds

---

### 3. **useWaiterOrders()**
Fetches orders for a specific table or all pending orders.

```typescript
const {
  orders,                   // Array of Order objects
  loading,                  // Loading state
  error,                    // Error message if any
  getTableOrderStatus,      // Returns: 'empty' | 'occupied' | 'preparing' | 'ready'
} = useWaiterOrders(tableId);
```

**Auto-refreshes:** Every 5 seconds for specific table, every 3 seconds for all pending

---

### 4. **useOrdersByStatus()**
Filters orders by status (pending, preparing, ready, served).

```typescript
const {
  orders,                   // Array of filtered Order objects
  loading,                  // Loading state
  error,                    // Error message if any
} = useOrdersByStatus('pending');
```

---

## State Management

### 5. **useWaiterOrderStore()**
Zustand store for building orders.

```typescript
const {
  // State
  tableId,                  // Currently selected table
  roomId,                   // Room of selected table
  items,                    // Array of OrderLineItem
  type,                     // 'dinein' or 'pickup'
  notes,                    // Order-level notes
  totalAmount,              // Subtotal of all items

  // Actions
  startOrder,               // Initialize new order
  addItem,                  // Add item with customizations
  removeItem,               // Remove item by menuItemId
  updateItem,               // Modify item quantity/customs
  setOrderType,             // Toggle between dinein/pickup
  setOrderNotes,            // Set order-level notes
  clearOrder,               // Reset after sending
  getSubtotal,              // Calculate total
  getTotalItems,            // Count of items
} = useWaiterOrderStore();
```

---

## Screen Flow

### Screen 1: **Table Grid** (`index.tsx`)
Main entry point showing all tables organized by room.

**Key Features:**
- Visual table grid with layout preservation
- Status indicators with color coding
- Mode toggle: "Al Tavolo" (Dine-in) vs "Asporto" (Takeaway)
- Order count badges on occupied tables
- Status legend

**Interaction:**
1. Tap "Al Tavolo" or "Asporto" mode
2. If dine-in: Tap a table → Navigate to order-browser
3. If takeaway: Tap "Nuovo Ordine Asporto" → Navigate to order-browser

---

### Screen 2: **Order Browser** (`order-browser.tsx`)
Menu catalog with search and filtering.

**Key Features:**
- Category filtering (scrollable horizontal tabs)
- Real-time search across all items
- Item price display
- Customization modal with:
  - Item quantity controls (± buttons)
  - Customization options (if any)
  - Notes field for special requests
  - Total price calculation
- Item cart badge showing count

**Item Addition Flow:**
1. Tap menu item → Opens customization modal
2. Adjust quantity (default: 1)
3. Select customizations (if available)
4. Add notes/special requests
5. Tap "Aggiungi" → Item added to order

---

### Screen 3: **Order Confirmation** (`order-confirmation.tsx`)
Final review before sending to kitchen.

**Key Features:**
- Display all items with:
  - Quantity × Name
  - Item price × quantity
  - Customizations (if any)
  - Special notes (if any)
- Remove item button (✕) for each line item
- Order-level notes field
- Order info card showing:
  - Table number / "Asporto"
  - Service type (Al Tavolo / Asporto)
  - Item count
- Total amount display
- Cancel / Send buttons

**Final Actions:**
1. Review all items
2. Add order-level notes if needed (e.g., "Rush order", "Special occasion")
3. Tap "Invia in Cucina" → Order created in database
4. Order sent to Kitchen Display System (KDS)
5. Waiter table grid updates automatically

---

## Integration with Backend

### Orders API (`lib/supabase.ts`)

```typescript
// Create an order with items
await createOrder({
  userId: currentUser.$id,
  items: [
    {
      menuItemId: "menu-1",
      quantity: 2,
      customizations: { "Size": "Large", "Spice": "Extra" },
      notes: "No onions"
    }
  ],
  tableId: "table-5",
  roomId: "room-1",
  type: "dinein",
  source: "waiter",           // Mark as waiter order
  notes: "Customer birthday - surprise with dessert",
  totalAmount: 24.50
});

// Check table orders
const orders = await getOrdersForTable(tableId);

// Update order status (when kitchen marks ready)
await updateOrderStatus(orderId, 'ready');

// Get all pending orders for kitchen display
const pendingOrders = await getOrdersByStatus('pending');
```

---

## Real-time Status Updates

### Current Implementation
- **Polling interval:** 5 seconds for table status, 3 seconds for orders
- **Future Enhancement:** Supabase real-time subscriptions for instant updates

### Status Propagation
```
Waiter sends order
    ↓
Order created with status='pending'
    ↓
Kitchen sees in KDS queue
    ↓
Kitchen marks ready (status='ready')
    ↓
Waiter table grid shows pulsing green
    ↓
Waiter notified to call customer
    ↓
Waiter marks served (status='served')
    ↓
Desk handles payment (status='paid')
```

---

## Error Handling

All screens include error boundaries and try-catch blocks:

```typescript
if (loading) {
  return <ActivityIndicator />;
}

if (error) {
  return (
    <View>
      <Text>Errore: {error}</Text>
      <Button onPress={() => retry()} title="Riprova" />
    </View>
  );
}
```

---

## Styling System

All screens use consistent styling:
- **Primary Color:** #6366F1 (Indigo - Call-to-action buttons)
- **Success Color:** #22C55E (Green - Order ready/serve)
- **Warning Color:** #F97316 (Orange - Table occupied)
- **Text Colors:** #1F2937 (dark), #6B7280 (medium), #9CA3AF (light)
- **Spacing:** 8px base unit (12, 16, 24px common)
- **Border Radius:** 8px for cards, 6px for buttons
- **Shadows:** Subtle elevation on cards

---

## Usage Example

```typescript
import { router } from 'expo-router';
import { useTables } from '@/features/waiter/hooks';
import { useWaiterOrderStore } from '@/features/waiter/stores';

export default function MyWaiterApp() {
  const { rooms, getTablesForRoom } = useTables();
  const { startOrder, addItem } = useWaiterOrderStore();

  const handleTablePress = (tableId: string, roomId: string) => {
    // Initialize order for this table
    startOrder(tableId, roomId);

    // Navigate to menu
    router.push({
      pathname: '/(waiter)/order-browser',
      params: { tableId, roomId }
    });
  };

  // ... rest of component
}
```

---

## Testing Checklist

- [ ] Can navigate between empty/occupied tables
- [ ] Order total calculates correctly as items added
- [ ] Customizations display properly in confirmation
- [ ] Order notes field accepts special characters
- [ ] Sending order creates entry in database
- [ ] Table status updates after order sent
- [ ] Can remove items before confirmation
- [ ] Mode toggle switches between dine-in/takeaway
- [ ] All buttons are properly styled and clickable
- [ ] No TypeScript errors in build
- [ ] No console errors or warnings

---

## Future Enhancements

1. **Real-time Subscriptions** - Replace polling with Supabase subscriptions
2. **Sound Notifications** - Chime when table ready for pickup
3. **Order Modifications** - Edit existing orders
4. **Tab Persistence** - Save current order if app crashes
5. **Offline Mode** - Queue orders locally when offline
6. **Voice Commands** - "Order sent to kitchen" voice feedback
7. **Split Bills** - Divide single table order for payment
8. **Item Presets** - Save common order combinations
