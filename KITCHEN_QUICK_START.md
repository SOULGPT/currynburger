# Kitchen Display System - Quick Start

## 🚀 Quick Access

**Route:** `/(kitchen)` 
**Purpose:** Real-time order queue for kitchen staff
**Role Required:** `kitchen` or `admin`

---

## 📱 User Interface

### Main Screen Sections

**1. Header** - Title + Order Count
- "🍳 Cucina" title
- Total orders (large orange number)
- Tap to refresh (future)

**2. Controls Bar** - Filters + Pause
- Filter buttons: Tutti / Cameriere / App / Bancone
- Pause button (⏸) - freeze updates during break

**3. Status Bars** - Quick Overview
```
In Attesa: 8  |  In Preparazione: 5  |  Urgenti: 2
```

**4. Order Queue** - Sortable Cards
- Each order = 1 card
- Auto-sorted by wait time (oldest first)
- Tap to select (light blue highlight)

---

## 🎨 Order Card Display

```
┌─────────────────────────────────┐
│ ┌─ Urgency Ring (red, pulsing)  │
│ │                               │
│ │ Tavolo #5          7m 30s     │
│ │ 👨‍💼 Cameriere  3 articoli    │ ← Source badge
│ │                               │
│ │ ⏱️ In Attesa                   │ ← Status
│ │                               │
│ │ • Chef's special instructions │ ← Notes (if any)
│ │                               │
│ │ €45.50      [✓ Pronto]        │ ← Price + Ready
│ └─────────────────────────────────┘
```

### Color Coding

| Color | Meaning |
|-------|---------|
| 🟦 Gray | Normal order |
| 🟪 Indigo (border) | Selected order |
| 🟥 Red (pulsing) | Urgent (>10 min) |
| 🟨 Yellow (box) | Special notes |

---

## 🎯 Common Actions

### Action 1: View All Orders
```
1. Tap "📋 Tutti" filter
2. See all pending + preparing orders
3. Orders auto-sorted by wait time
```

### Action 2: Filter by Source
```
Buttons at top:
- 👨‍💼 Show only waiter orders
- 📱 Show only app orders
- 🪑 Show only desk orders
```

### Action 3: Mark Order Ready
```
1. Find card in queue
2. Tap green [✓ Pronto] button
3. 🔔 Kitchen chime plays
4. Order disappears
5. Waiter notified
```

### Action 4: Select Order
```
1. Tap anywhere on card
2. Card highlights (blue border)
3. For future: expand to see details
```

### Action 5: Pause Queue
```
1. Tap ⏸ button (top right)
2. Updates freeze (no new orders load)
3. Tap ▶ to resume
4. Useful during shift changes/breaks
```

---

## ⏱️ Understanding Wait Times

```
0 - 5 min:   🟩 Green light    "On track"
5 - 10 min:  🟨 Yellow light   "Getting slow"
10+ min:     🔴 Red light      "URGENT" (pulsing)
```

- Wait time shown in **top-right of card**
- Format: `7m 30s` (7 minutes, 30 seconds)
- Updates every 2 seconds automatically
- Red text = urgent

---

## 📊 Status Indicators

**Two possible statuses for kitchen:**

1. **⏱️ In Attesa** (Awaiting)
   - Order just received
   - Not started yet
   - Most common

2. **👨‍🍳 In Preparazione** (Preparing)
   - Kitchen started on it
   - Partial progress
   - Less common

**Once marked ready:**
- Order disappears from queue
- Waiter sees green notification
- Waiter delivers to customer

---

## 📱 Source Badges

Shows where order came from:

| Badge | Meaning | Priority |
|-------|---------|----------|
| 📱 App | Mobile customer | Medium |
| 👨‍💼 Cameriere | Waiter typed | High |
| 🪑 Bancone | Front desk | Medium |

(All get same treatment in queue)

---

## 🔊 Audio Notifications

Three types of sounds:

1. **Chime** 🔔
   - When you tap "✓ Pronto"
   - Confirms order marked ready

2. **Alert** 📢
   - When new order arrives
   - Gets your attention

3. **Urgent Alert** ⚠️
   - When order exceeds 10 minutes
   - Different tone = more urgent

**Note:** Requires volume up, not muted

---

## 🔄 Real-time Updates

**How updates work:**

- **Wait time:** Updates every 2 seconds (locally)
- **New orders:** Every 30 seconds (from server)
- **Manual:** Tap screen to refresh instantly
- **Paused:** No updates if ⏸ button active

---

## ✅ Workflow Example

```
9:00 AM - Kitchen Opens
├─ No orders yet ✓

9:05 AM - First Order Arrives
├─ "Tavolo #5" appears (0s)
├─ 3 items to prepare
├─ Status: In Attesa

9:07 AM - Still Preparing
├─ Wait time: 2m
├─ Order still visible (not urgent yet)

9:12 AM - Ready for Pickup  
├─ Wait time: 7m
├─ Tap [✓ Pronto]
├─ 🔔 Chime plays
├─ Order disappears (marked ready)

9:13 AM - Waiter Notified
├─ Table shows green light
├─ Waiter brings food
├─ Customer happy!
```

---

## ⚠️ Urgent Orders

**What makes an order urgent?**
- Ordered > 10 minutes ago
- Still not marked ready
- Pulsing RED border appears

**What to do:**
1. See red pulsing card
2. Prioritize prep immediately
3. Mark ready ASAP
4. Reduce wait time for next orders

---

## 🆘 Troubleshooting

**Orders not showing?**
- Check internet connection
- Wait 30 seconds for server sync
- Refresh screen
- Check if "Paused" (⏸) is active

**Chime won't play?**
- Volume must be ON
- Device not in silent mode
- Check browser permissions

**Order stuck in queue?**
- Try refreshing screen
- Check if order actually ready
- Verify "Pronto" button click worked

**Filter not working?**
- Try clicking button again
- Refresh page
- Check browser console for errors

---

## 🎮 Keyboard Shortcuts (Future)

Planned shortcuts for faster workflow:
- `P` - Mark ready
- `Space` - Pause/Resume
- `1-4` - Switch filters
- `R` - Refresh queue

(Coming soon!)

---

## 📞 Need Help?

Common questions:

**Q: Can I delete/cancel orders?**
A: Only waiter can cancel before prep. Once in KDS, mark ready only.

**Q: How do I handle mistakes?**
A: Tap Pronto anyway, notify waiter immediately.

**Q: How many screens should we use?**
A: One main display. Future: Multiple displays by station.

**Q: Can I customize wait times?**
A: Currently 10 minutes for urgency. Future: Per-dish-type settings.

---

## 💡 Tips & Tricks

1. **Speed** - Tap Pronto as soon as plating done
2. **Pause** - Use ⏸ during break periods
3. **Filters** - Focus on specific order types
4. **Source** - Note badge to prioritize if needed
5. **Notes** - Read yellow box carefully (allergies, etc.)

---

**Full technical docs:** See `KITCHEN_DISPLAY_DOCS.md` for architecture, API, and advanced features.
