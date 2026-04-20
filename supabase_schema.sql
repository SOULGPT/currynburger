-- =============================================
-- SUPABASE FOOD ORDERING APP SCHEMA
-- Copy and paste this entire SQL into your Supabase SQL Editor
-- =============================================

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Drop tables if they exist (CASCADE to drop dependent objects)
DROP TABLE IF EXISTS menu_customizations CASCADE;
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

-- Create policy for categories (public read)
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Create customizations table
CREATE TABLE customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topping', 'side', 'size', 'crust')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on customizations
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view customizations" ON customizations;

-- Create policy for customizations (public read)
CREATE POLICY "Anyone can view customizations" ON customizations
  FOR SELECT USING (true);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;

-- Create policy for menu_items (public read)
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

-- Create menu_customizations junction table
CREATE TABLE menu_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  customization_id UUID REFERENCES customizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(menu_id, customization_id)
);

-- Enable RLS on menu_customizations
ALTER TABLE menu_customizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view menu customizations" ON menu_customizations;

-- Create policy for menu_customizations (public read)
CREATE POLICY "Anyone can view menu customizations" ON menu_customizations
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_customizations_menu_id ON menu_customizations(menu_id);
CREATE INDEX idx_menu_customizations_customization_id ON menu_customizations(customization_id);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Burgers', 'Juicy grilled burgers'),
  ('Pizzas', 'Oven-baked cheesy pizzas'),
  ('Burritos', 'Rolled Mexican delights'),
  ('Sandwiches', 'Stacked and stuffed sandwiches'),
  ('Wraps', 'Rolled up wraps packed with flavor'),
  ('Bowls', 'Balanced rice and protein bowls');

-- Insert sample customizations
INSERT INTO customizations (name, price, type) VALUES
  ('Extra Cheese', 25.00, 'topping'),
  ('Jalapeños', 20.00, 'topping'),
  ('Onions', 10.00, 'topping'),
  ('Olives', 15.00, 'topping'),
  ('Mushrooms', 18.00, 'topping'),
  ('Tomatoes', 10.00, 'topping'),
  ('Bacon', 30.00, 'topping'),
  ('Avocado', 35.00, 'topping'),
  ('Coke', 30.00, 'side'),
  ('Fries', 35.00, 'side'),
  ('Garlic Bread', 40.00, 'side'),
  ('Chicken Nuggets', 50.00, 'side'),
  ('Iced Tea', 28.00, 'side'),
  ('Salad', 33.00, 'side'),
  ('Potato Wedges', 38.00, 'side'),
  ('Mozzarella Sticks', 45.00, 'side'),
  ('Sweet Corn', 25.00, 'side'),
  ('Choco Lava Cake', 42.00, 'side');

-- Insert sample menu items
INSERT INTO menu_items (name, description, image_url, price, rating, calories, protein, category_id) VALUES
  ('Classic Cheeseburger', 'Beef patty, cheese, lettuce, tomato', 'https://static.vecteezy.com/system/resources/previews/044/844/600/large_2x/homemade-fresh-tasty-burger-with-meat-and-cheese-classic-cheese-burger-and-vegetable-ai-generated-free-png.png', 25.99, 4.5, 550, 25, (SELECT id FROM categories WHERE name = 'Burgers')),
  ('Pepperoni Pizza', 'Loaded with cheese and pepperoni slices', 'https://static.vecteezy.com/system/resources/previews/023/742/417/large_2x/pepperoni-pizza-isolated-illustration-ai-generative-free-png.png', 30.99, 4.7, 700, 30, (SELECT id FROM categories WHERE name = 'Pizzas')),
  ('Bean Burrito', 'Stuffed with beans, rice, salsa', 'https://static.vecteezy.com/system/resources/previews/055/133/581/large_2x/deliciously-grilled-burritos-filled-with-beans-corn-and-fresh-vegetables-served-with-lime-wedge-and-cilantro-isolated-on-transparent-background-free-png.png', 20.99, 4.2, 480, 18, (SELECT id FROM categories WHERE name = 'Burritos')),
  ('BBQ Bacon Burger', 'Smoky BBQ sauce, crispy bacon, cheddar', 'https://static.vecteezy.com/system/resources/previews/060/236/245/large_2x/a-large-hamburger-with-cheese-onions-and-lettuce-free-png.png', 27.50, 4.8, 650, 29, (SELECT id FROM categories WHERE name = 'Burgers')),
  ('Chicken Caesar Wrap', 'Grilled chicken, lettuce, Caesar dressing', 'https://static.vecteezy.com/system/resources/previews/048/930/603/large_2x/caesar-wrap-grilled-chicken-isolated-on-transparent-background-free-png.png', 21.50, 4.4, 490, 28, (SELECT id FROM categories WHERE name = 'Wraps')),
  ('Grilled Veggie Sandwich', 'Roasted veggies, pesto, cheese', 'https://static.vecteezy.com/system/resources/previews/047/832/012/large_2x/grilled-sesame-seed-bread-veggie-sandwich-with-tomato-and-onion-free-png.png', 19.99, 4.1, 420, 19, (SELECT id FROM categories WHERE name = 'Sandwiches')),
  ('Double Patty Burger', 'Two juicy beef patties and cheese', 'https://static.vecteezy.com/system/resources/previews/060/359/627/large_2x/double-cheeseburger-with-lettuce-tomatoes-cheese-and-sesame-bun-free-png.png', 32.99, 4.9, 720, 35, (SELECT id FROM categories WHERE name = 'Burgers')),
  ('Paneer Tikka Wrap', 'Spicy paneer, mint chutney, veggies', 'https://static.vecteezy.com/system/resources/previews/057/913/530/large_2x/delicious-wraps-a-tantalizing-array-of-wraps-filled-with-vibrant-vegetables-succulent-fillings-and-fresh-ingredients-artfully-arranged-for-a-mouthwatering-culinary-experience-free-png.png', 23.99, 4.6, 470, 20, (SELECT id FROM categories WHERE name = 'Wraps')),
  ('Mexican Burrito Bowl', 'Rice, beans, corn, guac, salsa', 'https://static.vecteezy.com/system/resources/previews/057/466/374/large_2x/healthy-quinoa-bowl-with-avocado-tomato-and-black-beans-ingredients-free-png.png', 26.49, 4.7, 610, 24, (SELECT id FROM categories WHERE name = 'Bowls')),
  ('Spicy Chicken Sandwich', 'Crispy chicken, spicy sauce, pickles', 'https://static.vecteezy.com/system/resources/previews/051/814/008/large_2x/a-grilled-chicken-sandwich-with-lettuce-and-tomatoes-free-png.png', 24.99, 4.3, 540, 26, (SELECT id FROM categories WHERE name = 'Sandwiches')),
  ('Classic Margherita Pizza', 'Tomato, mozzarella, fresh basil', 'https://static.vecteezy.com/system/resources/previews/058/700/845/large_2x/free-isolated-on-transparent-background-delicious-pizza-topped-with-fresh-tomatoes-basil-and-melted-cheese-perfect-for-food-free-png.png', 26.99, 4.1, 590, 21, (SELECT id FROM categories WHERE name = 'Pizzas')),
  ('Protein Power Bowl', 'Grilled chicken, quinoa, veggies', 'https://static.vecteezy.com/system/resources/previews/056/106/379/large_2x/top-view-salad-with-chicken-avocado-tomatoes-and-lettuce-free-png.png', 29.99, 4.8, 580, 38, (SELECT id FROM categories WHERE name = 'Bowls')),
  ('Paneer Burrito', 'Paneer cubes, spicy masala, rice, beans', 'https://static.vecteezy.com/system/resources/previews/056/565/254/large_2x/burrito-with-cauliflower-and-vegetables-free-png.png', 24.99, 4.2, 510, 22, (SELECT id FROM categories WHERE name = 'Burritos')),
  ('Chicken Club Sandwich', 'Grilled chicken, lettuce, cheese, tomato', 'https://static.vecteezy.com/system/resources/previews/060/364/135/large_2x/a-flavorful-club-sandwich-with-turkey-bacon-and-fresh-vegetables-sliced-and-isolated-on-a-transparent-background-free-png.png', 27.49, 4.5, 610, 31, (SELECT id FROM categories WHERE name = 'Sandwiches'));

-- Insert menu customizations (linking menu items to available customizations)
INSERT INTO menu_customizations (menu_id, customization_id)
SELECT m.id, c.id
FROM menu_items m
CROSS JOIN customizations c
WHERE m.name IN ('Classic Cheeseburger', 'Pepperoni Pizza', 'Bean Burrito', 'BBQ Bacon Burger', 'Chicken Caesar Wrap', 'Grilled Veggie Sandwich', 'Double Patty Burger', 'Paneer Tikka Wrap', 'Mexican Burrito Bowl', 'Spicy Chicken Sandwich', 'Classic Margherita Pizza', 'Protein Power Bowl', 'Paneer Burrito', 'Chicken Club Sandwich');