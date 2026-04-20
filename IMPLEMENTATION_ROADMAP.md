# Curry & Burger - Implementation Roadmap

## Phase 1: Core Infrastructure ✅ (Completed)
- [x] Database schema with roles and multi-interface support
- [x] Updated type definitions for all features
- [x] Authentication with role-based access
- [x] Customer app foundation

## Phase 2: Waiter Interface (Cameriere) - IN PROGRESS
### Files to Create:
- `app/(waiter)/_layout.tsx` - Waiter app layout
- `app/(waiter)/table-grid.tsx` - Table visualization (Room A: 9 tables, Room B: 12 tables)
- `app/(waiter)/order-browser.tsx` - Menu browsing with prices
- `app/(waiter)/order-confirmation.tsx` - Customization & notes screen
- `features/waiter/hooks/useTables.ts` - Real-time table status
- `features/waiter/hooks/useWaiterOrders.ts` - Order sync

### Key Features:
- Table grid with color coding:
  - Empty: Gray
  - Occupied: Orange
  - Ready for pickup: Pulsing Green
- Mode toggle: "Al Tavolo" (Dine-in) vs "Asporto" (Takeaway)
- Real-time order sending to Kitchen, Desk, TV
- Support for notes on each item

### Components to Create:
- TableCard component with status indicators
- OrderLineItem with customization UI
- ModeToggle button

## Phase 3: Kitchen Display (Cucina) - PLANNED
### Files to Create:
- `app/(kitchen)/_layout.tsx`
- `app/(kitchen)/order-queue.tsx`
- `features/kitchen/hooks/useKitchenOrders.ts`
- `features/kitchen/hooks/useOrderSound.ts`

### Key Features:
- Order queue sorted by wait time
- Source badges: 🌐 App, 🥡 Takeaway, 🪑 Table #
- Pulsing urgency ring on oldest order
- One-tap ready button (green circle)
- Triggers: Chime sound, waiter tablet green pulse, desk update

### Components:
- OrderCard with urgency indicator
- OrderQueueList
- ReadyButton
- Audio context for chime

## Phase 4: Front Desk (Bancone) - PLANNED
### Files to Create:
- `app/(admin)/dashboard.tsx`
- `app/(admin)/orders-management.tsx`
- `features/admin/components/FinancialTicker.tsx`
- `features/admin/components/OrderList.tsx`
- `features/admin/hooks/useDashboardStats.ts`

### Key Features:
- Financial ticker: Active Revenue + Today's Total
- Order list filterable by status
- Billing breakdown for payment processing
- Mark as served action
- Revenue tracking

### Real-time Statistics:
- Active unpaid orders total
- Daily revenue counter
- Order status breakdown

## Phase 5: Display TV (Customer Takeaway) - PLANNED
### Files to Create:
- `app/(display)/_layout.tsx`
- `app/(display)/order-display.tsx`
- `features/display/hooks/useDisplayOrders.ts`

### Key Features:
- Shows takeaway orders ONLY
- Status animations:
  - Preparing: Name + Steam animation
  - Ready: Name + Green Checkmark + "Ritira!" + Chime sound
- Marketing bar with:
  - Social media handles (Instagram, Facebook, TikTok)
  - Google Review QR Code
  - Rotating brand badges

## Phase 6: Admin Menu Management - PLANNED
### Files to Create:
- `app/(admin)/menu-management.tsx`
- `features/admin/pages/MenuEditor.tsx`
- `features/admin/hooks/useMenuManagement.ts`
- `features/admin/components/MediaUpload.tsx`

### Key Features:
- Real-time CRUD operations
- Instant sync without page refresh
- Toggle availability per item
- Update prices, spice levels
- Media management (Vercel Blob integration)

## Phase 7: Customer Features - PLANNED
### Files to Create:
- `app/(customer)/burger-builder.tsx`
- `app/(customer)/curry-customizer.tsx`
- `app/(customer)/loyalty-club.tsx`
- `app/(customer)/order-tracking.tsx`
- `app/(customer)/apply-coupon.tsx`

### Key Features:
- Burger builder
- Curry customization
- Loyalty points: 1 point per €1 spent
- Redeem: 50 points = €5 discount
- Coupon system with:
  - Admin-controlled codes
  - Single-use or unlimited
  - Minimum spend rules
  - Expiration dates
- Real-time order tracking (Placed → Preparing → Ready → Delivered)

## Phase 8: Real-time Features - PLANNED
### Files to Create:
- `services/realtimeSubscriptions.ts`
- `hooks/useOrderSubscription.ts`
- `hooks/useTableStatusSubscription.ts`
- `hooks/useLiveNotifications.ts`

### Key Features:
- Supabase real-time subscriptions
- Order status updates
- Table status changes
- Price updates across all clients
- Sound notifications

## Database Tables Created ✅
✅ profiles (with role: customer|waiter|kitchen|admin|desk)
✅ categories
✅ customizations  
✅ menu_items
✅ rooms
✅ tables
✅ orders
✅ order_items
✅ loyalty_transactions
✅ coupons

## Next Steps:

1. **Run the schema**: Copy `supabase_schema_v2.sql` to your Supabase SQL Editor
2. **Start with Waiter Interface**: It's the most complex and used most frequently
3. **Then Kitchen Display**: Highest impact for operations
4. **Then Customer App**: Drive revenue
5. **Finally Admin Dashboard**: For management

## Architecture Notes:

```
┌─────────────────────────────────────────────────┐
│          Customer App (Existing)                │
│  ├─ Browse menu                                 │
│  ├─ Customize items                            │
│  ├─ Track orders                               │
│  └─ Loyalty + Coupons                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        Waiter App (Cameriere)                   │
│  ├─ Table grid (Room A + B)                    │
│  ├─ Order taking                               │
│  ├─ Mode toggle                                │
│  └─ Send to kitchen                            │
└─────────────────────────────────────────────────┘

        ↓ Sends Orders ↓

┌─────────────────────────────────────────────────┐
│     Kitchen Display (Cucina)                    │
│  ├─ Order queue                                │
│  ├─ Urgency indicators                         │
│  ├─ Ready button                               │
│  └─ Notifications                              │
└─────────────────────────────────────────────────┘

        ↓ Updates Status ↓

┌─────────────────────────────────────────────────┐
│     Front Desk (Bancone)                        │
│  ├─ Financial tracking                         │
│  ├─ Order management                           │
│  ├─ Billing                                    │
│  └─ Revenue reports                            │
└─────────────────────────────────────────────────┘

        ↓ Display Updates ↓

┌─────────────────────────────────────────────────┐
│      TV Display (Public)                        │
│  ├─ Takeaway orders only                       │
│  ├─ Status animations                          │
│  └─ Marketing                                  │
└─────────────────────────────────────────────────┘
```

## Key Business Rules:
- Prices locked at order time
- Cancellation: Within 5 minutes unless marked "Preparing"
- TV Privacy: No table numbers shown
- Admin Master Override: Can change any status
- Loyalty: 1 point per €1, redeem at 50 points = €5
