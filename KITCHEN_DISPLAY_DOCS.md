# Kitchen Display System (Cucina) - Complete Implementation Guide

## Overview

The Kitchen Display System (KDS) is a real-time order management interface for kitchen staff. It displays pending and in-progress orders with:
- **Auto-sorted queue** - Oldest orders first (wait time)
- **Urgency indicators** - Pulsing red border when order exceeds 10 minutes
- **Source badges** - Shows order origin (App/Waiter/Desk)
- **Audio notifications** - Chimes and alerts for key events
- **One-tap ready button** - Marks order complete and notifies waiter

---

## Architecture

### Directory Structure

```
features/kitchen/
├── hooks/
│   ├── useKitchenOrders.ts       # Fetch and manage order lifecycle
│   └── index.ts                  # Barrel export
├── stores/
│   ├── kitchen.store.ts          # Zustand state (UI preferences)
│   └── index.ts                  # Barrel export
├── components/
│   ├── OrderCard.tsx             # Visual order display
│   └── index.ts                  # Barrel export
├── services/
│   ├── audioNotifications.ts     # Sound alerts
│   └── index.ts                  # Barrel export

app/(kitchen)/
├── _layout.tsx                   # Router stack
└── index.tsx                      # Main KDS screen
```

---

## Core Components

### 1. **OrderCard Component**

Displays a single order in the queue with visual hierarchy based on urgency.

```typescript
<OrderCard
  orderId="order-123"
  displayName="Tavolo #5"
  waitTimeSeconds={450}
  isUrgent={false}
  itemCount={3}
  status="pending"
  source="waiter"
  notes="Extra napkins"
  totalAmount={45.50}
  onMarkReady={() => handleReady()}
  isSelected={false}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `orderId` | string | Unique order ID |
| `displayName` | string | "Tavolo #X", "Asporto", etc. |
| `waitTimeSeconds` | number | Seconds since order was placed |
| `isUrgent` | boolean | True if waiting > 10 minutes |
| `itemCount` | number | Number of dishes to prepare |
| `status` | OrderStatus | Current order state |
| `source` | 'app' \| 'waiter' \| 'desk' | Order origin |
| `notes` | string | Special instructions |
| `totalAmount` | number | Order total (€) |
| `onMarkReady` | () => void | Callback when marking ready |
| `isSelected` | boolean | Visual selection state |

**Visual States:**

| State | Border | Background | Icon |
|-------|--------|-----------|------|
| Normal | Gray #E5E7EB | White | Standard |
| Selected | Indigo #6366F1 | Light blue | Highlighted |
| Urgent | Red #DC2626 | Light red | Pulsing ring |

**Display Sections:**

1. **Header** - Table/Order name, source badge, item count
2. **Wait Time** - Large, red text if urgent
3. **Status Badge** - "⏱️ In Attesa" or "👨‍🍳 In Preparazione"
4. **Items Preview** - "X dishes in order"
5. **Notes** (if any) - Yellow highlight box
6. **Footer** - Amount + ✓ Pronto button

---

## Key Hooks

### 2. **useKitchenOrders()**

Manages order lifecycle and real-time updates.

```typescript
const {
  orders,                    // Array of OrderWithMetrics
  loading,                   // Boolean
  error,                     // Error string or null
  markOrderReady,            // Function
  markOrderPreparing,        // Function
  getOrdersBySource,         // Function
  formatWaitTime,            // Function
  refreshOrders,             // Function
} = useKitchenOrders();
```

**Features:**

- ✅ Auto-fetch pending + preparing orders
- ✅ Track wait time in seconds (updates every 2s)
- ✅ Calculate urgency (> 10 minutes = urgent)
- ✅ Poll for updates every 30 seconds
- ✅ Sort by wait time (oldest first)

**Usage Examples:**

```typescript
// Mark order as ready (removes from queue, notifies waiter)
await markOrderReady('order-123');

// Mark order as in-progress (if accidentally selected)
await markOrderPreparing('order-456');

// Get orders from specific source
const waiterOrders = getOrdersBySource('waiter');
const appOrders = getOrdersBySource('app');
const allOrders = getOrdersBySource('all');

// Format wait time for display
const formatted = formatWaitTime(450); // "7m 30s"
```

**Metrics Calculated:**

```typescript
interface OrderWithMetrics {
  id: string;
  table_id?: string;
  order_type: 'dinein' | 'pickup' | 'delivery';
  order_source: 'app' | 'waiter' | 'desk';
  status: 'pending' | 'preparing' | 'ready' | ...;
  created_at: string;
  order_items: any[];
  
  // Calculated metrics:
  waitTimeSeconds: number;        // Seconds since placed
  isUrgent: boolean;              // True if > 600 seconds (10m)
  displayName: string;            // Formatted name
}
```

---

## State Management

### 3. **useKitchenStore()**

Zustand store for UI preferences (not order data).

```typescript
const {
  selectedOrderId,           // Currently selected order
  sortBy,                    // 'wait_time' | 'urgency' | 'order_type'
  filterSource,              // 'all' | 'app' | 'waiter' | 'desk'
  isPaused,                  // Boolean - pause updates
  selectOrder,               // Function
  setSortBy,                 // Function
  setFilterSource,           // Function
  togglePause,               // Function
} = useKitchenStore();
```

**Purpose:**
- Remember user preferences
- Select order for detailed view (future feature)
- Pause queue during maintenance/break

---

## Services

### 4. **kitchenAudioService**

Singleton service for audio notifications.

```typescript
import { kitchenAudioService } from '@/features/kitchen/services';

// Initialize (call on screen load)
await kitchenAudioService.initialize();

// Play chime (order marked ready)
await kitchenAudioService.playChime();

// Play alert (new urgent order)
await kitchenAudioService.playAlert();

// Play urgent alert (very old order)
await kitchenAudioService.playUrgentAlert();

// Cleanup (call on screen unload)
await kitchenAudioService.cleanup();
```

**Triggers:**
- ✅ Chime: When waiter marks "✓ Pronto"
- ✅ Alert: When new order arrives
- ✅ Urgent: When order exceeds 10 minutes

---

## Main Screen Flow

### 5. **Kitchen Display Queue** (`/app/(kitchen)/index.tsx`)

Full-screen order management interface.

**Layout:**

```
┌─────────────────────────────────┐
│ 🍳 Cucina        [14 ordini]    │ ← Header (title + count)
├─────────────────────────────────┤
│ [📋 Tutti] [👨‍💼] [📱] [🪑] [⏸]   │ ← Controls (filters + pause)
├─────────────────────────────────┤
│ In Attesa: 8  |  In Prep: 5  |  │ ← Status bars
│ Urgenti: 2                       │
├─────────────────────────────────┤
│ ┌────────────────────────────┐  │
│ │ Tavolo #5          7m 30s  │  │
│ │ 👨‍💼 Cameriere  3 articoli  │  │
│ │ ⏱️ In Attesa                │  │
│ │ • Chef's note...           │  │
│ │ €45.50      [✓ Pronto]     │  │
│ └────────────────────────────┘  │
│                                  │
│ ┌────────────────────────────┐  │ ← More orders
│ │ 🥡 Asporto        3m 20s   │  │
│ │ 📱 App         2 articoli  │  │
│ │ ...                        │  │
│ └────────────────────────────┘  │
└─────────────────────────────────┘
```

**Header:**
- Title: "🍳 Cucina"
- Subtitle: "Display Ordini"
- Order count (large, orange)

**Controls Bar:**
- Filter buttons: "📋 Tutti", "👨‍💼 Cameriere", "📱 App", "🪑 Bancone"
- Pause button (⏸/▶) - freeze queue during break

**Status Bars:**
- "In Attesa" - Pending orders (orange count)
- "In Preparazione" - Processing orders (blue count)
- "Urgenti" - Orders > 10 minutes (red count)

**Order Queue:**
- Sorted by wait time (oldest first)
- Tap card to select (light blue highlight)
- Tap ✓ Pronto to mark ready

**Behaviors:**
- Auto-refresh every 2 seconds (wait time)
- Full reload every 30 seconds (new orders)
- Play chime on urgent order appearance
- Update counts in real-time
- Empty state: "✓ Nessun ordine in attesa"

---

## Data Flow

```
┌──────────────────────────┐
│  Waiter sends order      │
│  via /(waiter)/confirm   │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  Order created in DB     │
│  status='pending'        │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  useKitchenOrders loads  │
│  pending orders          │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  Calculate metrics:      │
│  - waitTimeSeconds       │
│  - isUrgent (>10m)       │
│  - displayName           │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  Render OrderCards       │
│  sorted by wait time     │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  Kitchen taps            │
│  ✓ Pronto button         │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  markOrderReady('id')    │
│  → updateOrderStatus()   │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  Order removed from      │
│  KDS queue               │
│  status='ready'          │
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────┐
│  Waiter app updates:     │
│  Table shows green       │
│  notification sent       │
└──────────────────────────┘
```

---

## API Integration

### OrdersByStatus Endpoint

```typescript
// In lib/supabase.ts
await getOrdersByStatus('pending');  // Returns: Order[]
await getOrdersByStatus('preparing'); // Returns: Order[]
await updateOrderStatus(orderId, 'ready'); // Updates status
```

**Response Structure:**

```json
[
  {
    "id": "order-123",
    "table_id": "table-5",
    "room_id": "room-1",
    "user_id": "user-456",
    "order_type": "dinein",
    "order_source": "waiter",
    "status": "pending",
    "total_amount": 45.50,
    "notes": "Extra sauce",
    "created_at": "2026-04-20T14:30:00Z",
    "order_items": [
      {
        "id": "item-1",
        "menu_item_id": "pizza-1",
        "quantity": 2,
        "price_at_order": 20.00,
        "customizations": {"Size": "Large"}
      }
    ]
  }
]
```

---

## Common Tasks

### Task 1: View All Pending Orders
```
1. Open app → Navigate to /(kitchen)
2. Ensure filter is on "📋 Tutti"
3. See all pending + preparing orders
4. Orders sorted by wait time (oldest top)
```

### Task 2: Find Orders by Source
```
1. Tap filter button:
   - 📋 Tutti = all sources
   - 👨‍💼 Cameriere = waiter orders
   - 📱 App = mobile orders
   - 🪑 Bancone = desk orders
2. Queue updates instantly
```

### Task 3: Mark Order Ready
```
1. Find order in queue
2. Tap ✓ Pronto button
3. Hear kitchen chime 🔔
4. Order disappears from queue
5. Waiter's table shows green
6. Waiter can deliver
```

### Task 4: Check Wait Time
```
1. Look at large number in top-right of each card
2. Format: MM or MMmSSs (e.g., "7m 30s")
3. Red text = urgent (> 10 minutes)
4. Auto-updating every 2 seconds
```

### Task 5: Pause Queue During Break
```
1. Tap ⏸ button (top right)
2. Button turns red
3. Updates freeze (no new orders rendered)
4. Tap ▶ to resume
```

---

## Status Transitions

```
pending
   ↓
   ├→ preparing (via markOrderPreparing)
   │     ↓
   │     └→ ready (via markOrderReady) → served → paid
   └→ cancelled
```

**Kitchen View Scope:**
- ✅ Sees: pending + preparing
- ❌ Doesn't see: ready, served, paid, cancelled
- ✅ Actions: Mark ready (only)

---

## Error Handling

All errors caught and displayed:

```typescript
try {
  await markOrderReady(orderId);
} catch (error) {
  Alert.alert('Errore', error.message);
}
```

**Common Errors:**
- Network timeout → Retry
- Order not found → Refresh screen
- Permission denied → Check role

---

## Performance Optimizations

1. **Polling Strategy:**
   - Local updates every 2 seconds (wait time only)
   - Full refresh every 30 seconds (new orders)
   - Prevents excessive API calls

2. **Memoization:**
   - OrderCard component memoized with React.memo
   - Prevents unnecessary re-renders

3. **Filtering:**
   - Client-side filtering (no API calls)
   - Instant filter response

---

## Styling System

**Colors:**
- Primary: #6366F1 (Indigo)
- Success: #22C55E (Green)
- Warning: #F59E0B (Amber)
- Danger: #DC2626 (Red)
- Neutral: #E5E7EB → #1F2937 (Gray scale)

**Spacing:**
- 8px base unit (12, 16, 24px)
- Consistent padding/margin

**Typography:**
- Bold: fontWeight '700' (titles)
- Semi: fontWeight '600' (labels)
- Regular: fontWeight '400' (text)

---

## Future Enhancements

1. **Supabase Subscriptions** - Replace polling with real-time
2. **Drag & Drop** - Reorder queue manually
3. **Order Details** - Expand to show all items + customizations
4. **Print Tickets** - Print order receipts
5. **Video Feed** - Monitor front-of-house from kitchen
6. **Timer Alerts** - Customize alert times per dish type
7. **Multiple Displays** - Station-specific queues (pizzas, curry, etc.)
8. **Voice Commands** - "Tavolo 5 ready" voice prompt

---

## Testing Checklist

- [ ] Orders load and display correctly
- [ ] Wait time updates every 2 seconds
- [ ] Urgency indicator appears after 10 minutes
- [ ] Filters work instantly
- [ ] Pause button stops updates
- [ ] ✓ Pronto button removes order
- [ ] Audio chimes play (if enabled)
- [ ] Status counts update in real-time
- [ ] Empty state shows when no orders
- [ ] Sorting by wait time is correct
- [ ] Source badges display correctly
- [ ] Notes display yellow box
- [ ] No console errors
- [ ] TypeScript compilation passes

---

## Troubleshooting

**Orders not loading?**
- Check network connection
- Verify Supabase credentials
- Refresh screen manually

**Chime not playing?**
- Check device volume (not muted)
- Verify audio permissions
- Check browser/OS sound settings

**Status not updating?**
- Wait 2 seconds for local update
- Wait up to 30 seconds for server sync
- Manually refresh if stuck

**Filter not working?**
- Ensure filter button is clickable
- Try refreshing screen
- Check for JavaScript errors
