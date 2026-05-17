import turso from './turso';
import type { Product, ProductVariant, ProductImage, Review, Order, Wallet, User } from './schema';

// Product queries
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM products WHERE slug = ? AND is_active = 1',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as Product;
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
    args: [productId],
  });
  return result.rows as ProductImage[];
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM product_variants WHERE product_id = ?',
    args: [productId],
  });
  return result.rows as ProductVariant[];
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
    args: [productId],
  });
  return result.rows as Review[];
}

// Order queries
export async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM orders WHERE id = ?',
    args: [orderId],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as Order;
}

export async function getOrdersByCustomerPhone(phone: string): Promise<Order[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC',
    args: [phone],
  });
  return result.rows as Order[];
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
  const id = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: `INSERT INTO orders (id, product_id, variant_id, customer_name, customer_phone, customer_address, customer_region, customer_township, quantity, total_price, payment_status, delivery_status, payment_screenshot_url, delivery_service, tracking_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      order.product_id,
      order.variant_id || null,
      order.customer_name,
      order.customer_phone,
      order.customer_address,
      order.customer_region,
      order.customer_township,
      order.quantity,
      order.total_price,
      order.payment_status,
      order.delivery_status,
      order.payment_screenshot_url || null,
      order.delivery_service || null,
      order.tracking_id || null,
      now,
      now,
    ],
  });
  
  return { ...order, id, created_at: now, updated_at: now };
}

// Wallet queries
export async function getPrimaryWallet(userId: string): Promise<Wallet | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM wallets WHERE user_id = ? AND is_primary = 1',
    args: [userId],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as Wallet;
}

export async function getWalletsByUserId(userId: string): Promise<Wallet[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM wallets WHERE user_id = ?',
    args: [userId],
  });
  return result.rows as Wallet[];
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as User;
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: 'INSERT INTO users (id, email, password, name, phone, is_seller, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, user.email, user.password, user.name, user.phone || null, user.is_seller ? 1 : 0, now, now],
  });
  
  return { ...user, id, created_at: now, updated_at: now };
}

export async function updateUserSellerStatus(userId: string, isSeller: boolean): Promise<void> {
  await turso.execute({
    sql: 'UPDATE users SET is_seller = ?, updated_at = ? WHERE id = ?',
    args: [isSeller ? 1 : 0, new Date().toISOString(), userId],
  });
}

// Dashboard queries
export async function getDashboardStats(userId: string) {
  const revenueResult = await turso.execute({
    sql: 'SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE payment_status = ?',
    args: ['paid'],
  });
  
  const ordersResult = await turso.execute({
    sql: 'SELECT COUNT(*) as count FROM orders',
    args: [],
  });
  
  const pendingResult = await turso.execute({
    sql: 'SELECT COUNT(*) as count FROM orders WHERE payment_status = ?',
    args: ['pending'],
  });
  
  const viewsResult = await turso.execute({
    sql: 'SELECT COUNT(*) as count FROM page_views',
    args: [],
  });
  
  return {
    totalRevenue: Number(revenueResult.rows[0].total),
    totalOrders: Number(ordersResult.rows[0].count),
    pendingOrders: Number(pendingResult.rows[0].count),
    totalViews: Number(viewsResult.rows[0].count),
  };
}

export async function getSalesData(days: number = 7) {
  const result = await turso.execute({
    sql: `SELECT DATE(created_at) as date, SUM(total_price) as sales FROM orders WHERE payment_status = ? AND created_at >= date('now', '-' || ? || ' days') GROUP BY DATE(created_at) ORDER BY date`,
    args: ['paid', days],
  });
  
  return result.rows.map((row: any) => ({
    name: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: Number(row.sales),
  }));
}

export async function getTopProducts(limit: number = 5) {
  const result = await turso.execute({
    sql: `SELECT p.name, COUNT(o.id) as value FROM products p LEFT JOIN orders o ON p.id = o.product_id GROUP BY p.id ORDER BY value DESC LIMIT ?`,
    args: [limit],
  });
  
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
  return result.rows.map((row: any, index: number) => ({
    name: row.name,
    value: Number(row.value),
    color: colors[index % colors.length],
  }));
}

export async function getProductViews(limit: number = 10) {
  const result = await turso.execute({
    sql: `SELECT p.name, COUNT(pv.id) as views, COUNT(o.id) as orders FROM products p LEFT JOIN page_views pv ON p.id = pv.product_id LEFT JOIN orders o ON p.id = o.product_id GROUP BY p.id ORDER BY views DESC LIMIT ?`,
    args: [limit],
  });
  
  return result.rows.map((row: any) => ({
    name: row.name,
    views: Number(row.views),
    orders: Number(row.orders),
  }));
}

// Page view tracking
export async function trackPageView(productId: string) {
  const id = `pv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await turso.execute({
    sql: 'INSERT INTO page_views (id, product_id, viewed_at) VALUES (?, ?, ?)',
    args: [id, productId, new Date().toISOString()],
  });
}

// Create product
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: 'INSERT INTO products (id, user_id, store_id, name, description, slug, cover_image_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      product.user_id,
      product.store_id,
      product.name,
      product.description || null,
      product.slug,
      product.cover_image_url || null,
      product.is_active ? 1 : 0,
      now,
      now,
    ],
  });
  
  return { ...product, id, created_at: now, updated_at: now };
}

// Create product image
export async function createProductImage(image: Omit<ProductImage, 'id' | 'created_at'>): Promise<ProductImage> {
  const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: 'INSERT INTO product_images (id, product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, image.product_id, image.image_url, image.sort_order, now],
  });
  
  return { ...image, id, created_at: now };
}

// Create product variant
export async function createProductVariant(variant: Omit<ProductVariant, 'id' | 'created_at'>): Promise<ProductVariant> {
  const id = `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: 'INSERT INTO product_variants (id, product_id, name, price, stock, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, variant.product_id, variant.name, variant.price, variant.stock, now],
  });
  
  return { ...variant, id, created_at: now };
}

// Get products by user ID
export async function getProductsByUserId(userId: string): Promise<Product[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
  return result.rows as Product[];
}

// Create store
export async function createStore(store: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
  const id = `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: 'INSERT INTO stores (id, user_id, name, logo_url, phone, approval_status, rejection_reason, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      store.user_id,
      store.name,
      store.logo_url || null,
      store.phone,
      store.approval_status,
      store.rejection_reason || null,
      now,
      now,
    ],
  });
  
  return { ...store, id, created_at: now, updated_at: now };
}

// Get store by user ID
export async function getStoreByUserId(userId: string): Promise<Store | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM stores WHERE user_id = ?',
    args: [userId],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as Store;
}

// Update store approval status
export async function updateStoreApprovalStatus(storeId: string, status: 'pending' | 'approved' | 'rejected', rejectionReason?: string): Promise<void> {
  await turso.execute({
    sql: 'UPDATE stores SET approval_status = ?, rejection_reason = ?, updated_at = ? WHERE id = ?',
    args: [status, rejectionReason || null, new Date().toISOString(), storeId],
  });
}

// Get all pending stores (for admin)
export async function getPendingStores(): Promise<Store[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM stores WHERE approval_status = ?',
    args: ['pending'],
  });
  return result.rows as Store[];
}

// Create wallet
export async function createWallet(wallet: Omit<Wallet, 'id' | 'created_at'>): Promise<Wallet> {
  const id = `wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: 'INSERT INTO wallets (id, user_id, provider, account_name, account_number, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      wallet.user_id,
      wallet.provider,
      wallet.account_name,
      wallet.account_number,
      wallet.is_primary ? 1 : 0,
      now,
    ],
  });
  
  return { ...wallet, id, created_at: now };
}

// Get all orders (for seller dashboard)
export async function getAllOrders(): Promise<Order[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM orders ORDER BY created_at DESC',
    args: [],
  });
  return result.rows as Order[];
}

// Update order payment status
export async function updateOrderPaymentStatus(orderId: string, status: 'pending' | 'paid' | 'failed'): Promise<void> {
  await turso.execute({
    sql: 'UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?',
    args: [status, new Date().toISOString(), orderId],
  });
}

// Update order delivery status
export async function updateOrderDeliveryStatus(orderId: string, status: 'pending' | 'preparing' | 'shipped' | 'delivered', deliveryService?: string, trackingId?: string): Promise<void> {
  await turso.execute({
    sql: 'UPDATE orders SET delivery_status = ?, delivery_service = ?, tracking_id = ?, updated_at = ? WHERE id = ?',
    args: [status, deliveryService || null, trackingId || null, new Date().toISOString(), orderId],
  });
}
