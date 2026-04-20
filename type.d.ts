// ============================================
// CURRY & BURGER: Comprehensive Type Definitions
// ============================================

export interface BaseDocument {
  $id: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============ AUTH & PROFILES ============
export type UserRole = 'customer' | 'waiter' | 'kitchen' | 'admin' | 'desk';

export interface User extends BaseDocument {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

// ============ MENU ITEMS ============
export interface Category extends BaseDocument {
  name: string;
  description: string;
  display_order?: number;
}

export interface Customization extends BaseDocument {
  name: string;
  price: number;
  type: 'topping' | 'side' | 'size' | 'crust' | 'spice';
}

export interface MenuItem extends BaseDocument {
  name: string;
  price: number;
  image_url: string;
  description: string;
  calories: number;
  protein: number;
  rating: number;
  category_id?: string;
  is_available?: boolean;
  spice_level?: number;
}

// ============ RESTAURANT OPERATIONS ============
export interface Room extends BaseDocument {
  name: string;
  description: string;
}

export interface RestaurantTable extends BaseDocument {
  room_id: string;
  table_number: number;
  capacity: number;
  status: 'empty' | 'occupied' | 'reserved';
}

// ============ ORDERS ============
export type OrderSource = 'app' | 'waiter' | 'desk';
export type OrderType = 'pickup' | 'delivery' | 'dinein';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

export interface OrderItemCustomization {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface OrderItem extends BaseDocument {
  order_id?: string;
  menu_item_id?: string;
  item_name: string;
  item_price: number;
  quantity: number;
  customizations?: OrderItemCustomization[];
  notes?: string;
}

export interface Order extends BaseDocument {
  customer_id?: string;
  waiter_id?: string;
  room_id?: string;
  table_id?: string;
  source: OrderSource;
  type: OrderType;
  status: OrderStatus;
  total: number;
  discount_amount?: number;
  notes?: string;
  items?: OrderItem[];
  placed_at: string;
  prepared_at?: string;
  served_at?: string;
  paid_at?: string;
}

// ============ LOYALTY & REWARDS ============
export interface LoyaltyTransaction extends BaseDocument {
  customer_id: string;
  points: number;
  type: 'earn' | 'redeem';
  related_order_id?: string;
}

export interface Coupon extends BaseDocument {
  code: string;
  discount_amount?: number;
  discount_percentage?: number;
  minimum_spend?: number;
  max_uses?: number;
  times_used: number;
  is_single_use: boolean;
  expires_at?: string;
  created_by?: string;
}

// ============ CART (LOCAL STATE) ============
export interface CartCustomization {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface CartItemType {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  customizations?: CartCustomization[];
}

export interface CartStore {
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, 'quantity'>) => void;
  removeItem: (id: string, customizations: CartCustomization[]) => void;
  increaseQty: (id: string, customizations: CartCustomization[]) => void;
  decreaseQty: (id: string, customizations: CartCustomization[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ============ COMPONENT PROPS ============
export interface TabBarIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

export interface PaymentInfoStripeProps {
  label: string;
  value: string;
  labelStyle?: string;
  valueStyle?: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomHeaderProps {
  title?: string;
}

export interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

// ============ FUNCTION PARAMETERS ============
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface GetMenuParams {
  category?: string;
  query?: string;
  limit?: number;
}
