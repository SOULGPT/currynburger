import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { CreateUserParams, GetMenuParams, SignInParams, User, MenuItem, Category, UserRole } from '@/type';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// In-memory storage as fallback for Expo
const memoryStorage: Record<string, string> = {};

const customStorage = {
  getItem: async (key: string) => {
    try {
      return memoryStorage[key] || null;
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      memoryStorage[key] = value;
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      delete memoryStorage[key];
    } catch (error) {
      console.warn('Storage removeItem error:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: false,  // Disable persistent session to avoid AsyncStorage issues
    detectSessionInUrl: false,
  },
});

const normalizeRow = <T extends { id: string }>(row: T) => ({ $id: row.id, ...row });

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Unable to create user');

  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  const { error: profileError } = await supabase.from('profiles').insert([
    { id: data.user.id, email, full_name: name, avatar },
  ]);

  if (profileError) throw new Error(profileError.message);

  return { $id: data.user.id, name, email, avatar };
};

export const signIn = async ({ email, password }: SignInParams) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
};

export const signInWithOAuth = async (provider: 'google' | 'apple') => {
  const redirectTo = Linking.createURL('/');
  const {
    data,
    error,
  } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) throw new Error(error.message);
  if (data?.url) {
    await WebBrowser.openBrowserAsync(data.url);
  }

  return data;
};

export const signInWithGoogle = async () => signInWithOAuth('google');
export const signInWithApple = async () => signInWithOAuth('apple');

export const getCurrentUser = async (): Promise<User> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw new Error(sessionError.message);
  if (!session?.user) throw new Error('No authenticated user');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar, role')
    .eq('id', session.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error('No profile found');

  const role: UserRole = (profile.role as UserRole) || 'customer';

  return {
    $id: profile.id,
    name: profile.full_name,
    email: profile.email,
    avatar: profile.avatar,
    role,
  };
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  let builder = supabase.from('menu_items').select('*');

  if (category) builder = builder.eq('category_id', category);
  if (query) builder = builder.ilike('name', `%${query}%`);

  const { data, error } = await builder;
  if (error) throw new Error(error.message);

  return (data ?? []).map((item: any) => normalizeRow(item)) as MenuItem[];
};

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw new Error(error.message);

  return (data ?? []).map((item: any) => normalizeRow(item)) as Category[];
};

// ============== ORDER MANAGEMENT ==============

export const createOrder = async ({
  userId,
  items,
  tableId,
  roomId,
  type = 'dinein',
  source = 'app',
  notes = '',
  totalAmount,
}: {
  userId: string;
  items: Array<{ menuItemId: string; quantity: number; customizations?: Record<string, string>; notes?: string }>;
  tableId?: string;
  roomId?: string;
  type?: 'dinein' | 'pickup' | 'delivery';
  source?: 'app' | 'waiter' | 'desk';
  notes?: string;
  totalAmount: number;
}) => {
  // 1. Create order record
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: userId,
        table_id: tableId,
        room_id: roomId,
        order_type: type,
        order_source: source,
        status: 'pending',
        total_amount: totalAmount,
        notes,
      },
    ])
    .select()
    .single();

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);
  if (!order) throw new Error('Order creation returned no data');

  // 2. Create order items with pricing snapshot
  const orderItems = await Promise.all(
    items.map(async (item) => {
      // Lock in price at order time
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('price')
        .eq('id', item.menuItemId)
        .single();

      return {
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price_at_order: menuItem?.price || 0,
        customizations: item.customizations || {},
        notes: item.notes || '',
      };
    })
  );

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw new Error(`Failed to add items: ${itemsError.message}`);

  return normalizeRow(order);
};

export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update order: ${error.message}`);
  return normalizeRow(data);
};

export const getOrdersByStatus = async (
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return data ?? [];
};

export const getOrdersForTable = async (tableId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('table_id', tableId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch table orders: ${error.message}`);
  return data ?? [];
};

export const getUserOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch user orders: ${error.message}`);
  return data ?? [];
};

export const cancelOrder = async (orderId: string) => {
  // Only allow cancellation if order is still pending
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single();

  if (fetchError) throw new Error('Order not found');
  if (order.status !== 'pending') throw new Error('Can only cancel pending orders');

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to cancel order: ${error.message}`);
  return normalizeRow(data);
};

// ============== TABLE MANAGEMENT ==============

export const getTables = async (roomId: string) => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('room_id', roomId)
    .order('position', { ascending: true });

  if (error) throw new Error(`Failed to fetch tables: ${error.message}`);
  return data ?? [];
};

export const getTableStatus = async (tableId: string) => {
  // Check if table has any active orders
  const { data: orders } = await supabase
    .from('orders')
    .select('status')
    .eq('table_id', tableId)
    .neq('status', 'paid')
    .neq('status', 'cancelled');

  const hasActiveOrders = orders && orders.length > 0;
  const anyReady = orders?.some((o) => o.status === 'ready');

  return {
    tableId,
    occupied: hasActiveOrders,
    ready: anyReady,
    orders: orders ?? [],
  };
};

export const getRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch rooms: ${error.message}`);
  return data ?? [];
};

// ============== LOYALTY SYSTEM ==============

export const earnLoyaltyPoints = async (userId: string, amount: number) => {
  // 1 point per €1 spent
  const points = Math.floor(amount);

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .insert([
      {
        user_id: userId,
        points,
        transaction_type: 'earn',
        description: `€${amount.toFixed(2)} spent`,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to earn points: ${error.message}`);
  return data;
};

export const redeemPoints = async (userId: string, points: number) => {
  // 50 points = €5 discount
  if (points < 50) throw new Error('Minimum 50 points required to redeem');

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .insert([
      {
        user_id: userId,
        points: -points,
        transaction_type: 'redeem',
        description: `Redeemed for €${(points / 10).toFixed(2)} discount`,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(`Failed to redeem points: ${error.message}`);
  return (points / 10).toFixed(2); // Return discount amount
};

export const getLoyaltyScore = async (userId: string) => {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('user_id', userId);

  if (error) throw new Error(`Failed to fetch loyalty score: ${error.message}`);

  const totalPoints = (data ?? []).reduce((sum, t) => sum + t.points, 0);
  return Math.max(0, totalPoints); // Prevent negative points
};

export const getLoyaltyHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to fetch history: ${error.message}`);
  return data ?? [];
};

// ============== COUPON SYSTEM ==============

export const validateCoupon = async (code: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error) throw new Error('Invalid coupon code');

  // Check expiration
  const expiryDate = new Date(data.expiry_date);
  if (new Date() > expiryDate) throw new Error('Coupon has expired');

  // Check usage if single-use
  if (!data.is_unlimited) {
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', data.id);

    if (countError) throw new Error('Failed to check coupon usage');
    if (count && count > 0) throw new Error('Coupon has already been used');
  }

  return {
    id: data.id,
    code: data.code,
    discountPercent: data.discount_percent,
    discountFixed: data.discount_fixed_amount,
    minSpend: data.min_spend_amount,
    description: data.description,
  };
};

export const applyCoupon = async (orderId: string, couponId: string, orderAmount: number) => {
  // Validate minimum spend
  const { data: coupon, error: fetchError } = await supabase
    .from('coupons')
    .select('code, discount_percent, discount_fixed_amount, min_spend_amount')
    .eq('id', couponId)
    .single();

  if (fetchError) throw new Error('Coupon not found');

  if (coupon.min_spend_amount && orderAmount < coupon.min_spend_amount) {
    throw new Error(`Minimum spend of €${coupon.min_spend_amount.toFixed(2)} required`);
  }

  // Calculate discount
  const percentDiscount = coupon.discount_percent ? (orderAmount * coupon.discount_percent) / 100 : 0;
  const totalDiscount = Math.max(percentDiscount, coupon.discount_fixed_amount || 0);

  // Apply coupon to order
  const { data, error } = await supabase
    .from('orders')
    .update({ coupon_id: couponId, discount_amount: totalDiscount })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(`Failed to apply coupon: ${error.message}`);

  return {
    code: coupon.code || '',
    discount: totalDiscount,
    newTotal: Math.max(0, orderAmount - totalDiscount),
  };
};

// ============== ADMIN FUNCTIONS ==============

export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) throw new Error('User not found');
  return data.role;
};

export const hasAccess = async (userId: string, requiredRole: string) => {
  const role = await getUserRole(userId);
  const roleHierarchy: Record<string, number> = {
    customer: 0,
    waiter: 1,
    desk: 2,
    kitchen: 1,
    admin: 3,
  };

  return (roleHierarchy[role] || 0) >= roleHierarchy[requiredRole];
};

export const getMenuItemCustomizations = async (menuItemId: string) => {
  const { data, error } = await supabase
    .from('customizations')
    .select('*')
    .eq('menu_item_id', menuItemId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error('Failed to fetch customizations');
  return data ?? [];
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};
