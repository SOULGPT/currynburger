-- =============================================
-- CURRY & BURGER - COMPREHENSIVE SCHEMA v2.1
-- Restaurant Management System
-- =============================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS customizations CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  role TEXT CHECK (role IN ('customer', 'waiter', 'kitchen', 'admin', 'desk')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create customizations table
CREATE TABLE customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topping', 'side', 'size', 'crust', 'spice')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2),
  calories INTEGER,
  protein INTEGER,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tables table
CREATE TABLE tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  capacity INTEGER,
  status TEXT DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  waiter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('app', 'waiter', 'desk')),
  type TEXT NOT NULL CHECK (type IN ('pickup', 'delivery', 'dinein')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
  total DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  prepared_at TIMESTAMP WITH TIME ZONE,
  served_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  customizations JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create loyalty_transactions table
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earn', 'redeem')),
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create coupons table
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_amount DECIMAL(10,2),
  discount_percentage DECIMAL(5,2),
  minimum_spend DECIMAL(10,2),
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  is_single_use BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Menu Items
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

-- Customizations
DROP POLICY IF EXISTS "Anyone can view customizations" ON customizations;
CREATE POLICY "Anyone can view customizations" ON customizations
  FOR SELECT USING (true);

-- Orders - Customers can view their own, Staff can view all
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = customer_id OR
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'waiter', 'kitchen', 'desk'))
  );

-- Rooms - Staff only
DROP POLICY IF EXISTS "Staff can view rooms" ON rooms;
CREATE POLICY "Staff can view rooms" ON rooms
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'waiter', 'kitchen', 'desk'))
  );

-- Tables - Staff only
DROP POLICY IF EXISTS "Staff can view tables" ON tables;
CREATE POLICY "Staff can view tables" ON tables
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'waiter', 'kitchen', 'desk'))
  );

-- Create Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_placed_at ON orders(placed_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tables_room_id ON tables(room_id);
CREATE INDEX idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);

-- Insert sample data
INSERT INTO categories (name, description, display_order) VALUES
  ('Burgers', 'Juicy grilled burgers', 1),
  ('Pizzas', 'Oven-baked cheesy pizzas', 2),
  ('Curries', 'Authentic curries', 3),
  ('Burritos', 'Rolled Mexican delights', 4),
  ('Sandwiches', 'Stacked and stuffed sandwiches', 5),
  ('Wraps', 'Rolled up wraps packed with flavor', 6),
  ('Bowls', 'Balanced rice and protein bowls', 7);

INSERT INTO customizations (name, price, type) VALUES
  ('Extra Cheese', 25.00, 'topping'),
  ('Jalapeños', 20.00, 'topping'),
  ('Onions', 10.00, 'topping'),
  ('Bacon', 30.00, 'topping'),
  ('Avocado', 35.00, 'topping'),
  ('Fries', 35.00, 'side'),
  ('Garlic Bread', 40.00, 'side'),
  ('Salad', 33.00, 'side'),
  ('Small', 0.00, 'size'),
  ('Medium', 10.00, 'size'),
  ('Large', 20.00, 'size'),
  ('Mild', 0.00, 'spice'),
  ('Medium Heat', 0.00, 'spice'),
  ('Spicy', 0.00, 'spice'),
  ('Extra Hot', 50.00, 'spice');

INSERT INTO rooms (name, description) VALUES
  ('Room A', 'Main dining area with 9 tables'),
  ('Room B', 'VIP section with 12 tables');

INSERT INTO tables (room_id, table_number, capacity) VALUES
  ((SELECT id FROM rooms WHERE name = 'Room A'), 1, 2),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 2, 2),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 3, 4),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 4, 4),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 5, 6),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 6, 2),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 7, 4),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 8, 4),
  ((SELECT id FROM rooms WHERE name = 'Room A'), 9, 2),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 1, 2),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 2, 2),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 3, 4),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 4, 4),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 5, 6),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 6, 2),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 7, 4),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 8, 4),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 9, 2),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 10, 4),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 11, 4),
  ((SELECT id FROM rooms WHERE name = 'Room B'), 12, 2);

INSERT INTO menu_items (name, description, image_url, price, rating, calories, protein, category_id, spice_level) VALUES
  ('Classic Cheeseburger', 'Beef patty, cheese, lettuce, tomato', 'https://static.vecteezy.com/system/resources/previews/044/844/600/large_2x/homemade-fresh-tasty-burger-with-meat-and-cheese-classic-cheese-burger-and-vegetable-ai-generated-free-png.png', 25.99, 4.5, 550, 25, (SELECT id FROM categories WHERE name = 'Burgers'), 0),
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken', 'https://via.placeholder.com/300', 35.99, 4.8, 450, 35, (SELECT id FROM categories WHERE name = 'Curries'), 1),
  ('Chicken Tikka Masala', 'Grilled chicken in fragrant tomato sauce', 'https://via.placeholder.com/300', 38.99, 4.9, 480, 38, (SELECT id FROM categories WHERE name = 'Curries'), 2);

-- Create coupons
INSERT INTO coupons (code, discount_amount, minimum_spend, max_uses, is_single_use) VALUES
  ('WELCOME10', 10.00, 20.00, NULL, false),
  ('FIRST5', 5.00, 15.00, 100, false),
  ('VIP20', 20.00, 50.00, NULL, true);