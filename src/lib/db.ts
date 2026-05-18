import turso from './turso';
import type { Product, ProductVariant, ProductImage, Review, Order, Wallet, User, Store } from './schema';

const rowAs = <T>(row: unknown): T => row as T;
const rowsAs = <T>(rows: unknown): T[] => rows as T[];

type CountRow = { count: number | string };
type RevenueRow = { total: number | string | null };
type SalesRow = { date: string; sales: number | string | null };
type TopProductRow = { name: string; value: number | string };
type ProductViewRow = { name: string; views: number | string; orders: number | string };

// Product queries
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM products WHERE slug = ? AND is_active = 1',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return rowAs<Product>(result.rows[0]);
}

export async function getProductById(productId: string): Promise<Product | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM products WHERE id = ?',
    args: [productId],
  });
  if (result.rows.length === 0) return null;
  return rowAs<Product>(result.rows[0]);
}

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
    args: [productId],
  });
  return rowsAs<ProductImage>(result.rows);
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM product_variants WHERE product_id = ?',
    args: [productId],
  });
  return rowsAs<ProductVariant>(result.rows);
}

export async function getProductVariantById(variantId: string): Promise<ProductVariant | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM product_variants WHERE id = ?',
    args: [variantId],
  });
  if (result.rows.length === 0) return null;
  return rowAs<ProductVariant>(result.rows[0]);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
    args: [productId],
  });
  return rowsAs<Review>(result.rows);
}

// Order queries
export async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM orders WHERE id = ?',
    args: [orderId],
  });
  if (result.rows.length === 0) return null;
  return rowAs<Order>(result.rows[0]);
}

export async function getOrdersByCustomerPhone(phone: string): Promise<Order[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC',
    args: [phone],
  });
  return rowsAs<Order>(result.rows);
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
  return rowAs<Wallet>(result.rows[0]);
}

export async function getWalletsByUserId(userId: string): Promise<Wallet[]> {
  const result = await turso.execute({
    sql: 'SELECT * FROM wallets WHERE user_id = ?',
    args: [userId],
  });
  return rowsAs<Wallet>(result.rows);
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  if (result.rows.length === 0) return null;
  return rowAs<User>(result.rows[0]);
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
    sql: `
      SELECT COALESCE(SUM(o.total_price), 0) as total
      FROM orders o
      INNER JOIN products p ON o.product_id = p.id
      WHERE o.payment_status = ? AND p.user_id = ?
    `,
    args: ['paid', userId],
  });
  
  const ordersResult = await turso.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM orders o
      INNER JOIN products p ON o.product_id = p.id
      WHERE p.user_id = ?
    `,
    args: [userId],
  });
  
  const pendingResult = await turso.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM orders o
      INNER JOIN products p ON o.product_id = p.id
      WHERE o.payment_status = ? AND p.user_id = ?
    `,
    args: ['pending', userId],
  });
  
  const viewsResult = await turso.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM page_views pv
      INNER JOIN products p ON pv.product_id = p.id
      WHERE p.user_id = ?
    `,
    args: [userId],
  });

  const revenue = rowAs<RevenueRow>(revenueResult.rows[0]);
  const orders = rowAs<CountRow>(ordersResult.rows[0]);
  const pending = rowAs<CountRow>(pendingResult.rows[0]);
  const views = rowAs<CountRow>(viewsResult.rows[0]);
  
  return {
    totalRevenue: Number(revenue.total),
    totalOrders: Number(orders.count),
    pendingOrders: Number(pending.count),
    totalViews: Number(views.count),
  };
}

export async function getSalesData(userId: string, days: number = 7) {
  const result = await turso.execute({
    sql: `
      SELECT DATE(o.created_at) as date, SUM(o.total_price) as sales
      FROM orders o
      INNER JOIN products p ON o.product_id = p.id
      WHERE o.payment_status = ? AND p.user_id = ? AND o.created_at >= date('now', '-' || ? || ' days')
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `,
    args: ['paid', userId, days],
  });
  
  return rowsAs<SalesRow>(result.rows).map((row) => ({
    name: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: Number(row.sales),
  }));
}

export async function getTopProducts(userId: string, limit: number = 5) {
  const result = await turso.execute({
    sql: `
      SELECT p.name, COUNT(o.id) as value
      FROM products p
      LEFT JOIN orders o ON p.id = o.product_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY value DESC
      LIMIT ?
    `,
    args: [userId, limit],
  });
  
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];
  return rowsAs<TopProductRow>(result.rows).map((row, index) => ({
    name: row.name,
    value: Number(row.value),
    color: colors[index % colors.length],
  }));
}

export async function getProductViews(userId: string, limit: number = 10) {
  const result = await turso.execute({
    sql: `
      SELECT p.name, COUNT(DISTINCT pv.id) as views, COUNT(DISTINCT o.id) as orders
      FROM products p
      LEFT JOIN page_views pv ON p.id = pv.product_id
      LEFT JOIN orders o ON p.id = o.product_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY views DESC
      LIMIT ?
    `,
    args: [userId, limit],
  });
  
  return rowsAs<ProductViewRow>(result.rows).map((row) => ({
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
  return rowsAs<Product>(result.rows);
}

export async function updateProductActiveStatus(productId: string, isActive: boolean): Promise<void> {
  await turso.execute({
    sql: 'UPDATE products SET is_active = ?, updated_at = ? WHERE id = ?',
    args: [isActive ? 1 : 0, new Date().toISOString(), productId],
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM products WHERE id = ?',
    args: [productId],
  });
}

// Create store
export async function createStore(store: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
  const id = `store-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await turso.execute({
    sql: `
      INSERT INTO stores (
        id,
        user_id,
        name,
        logo_url,
        contact_person,
        phone,
        category,
        address,
        description,
        approval_status,
        rejection_reason,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      store.user_id,
      store.name,
      store.logo_url || null,
      store.contact_person,
      store.phone,
      store.category,
      store.address,
      store.description,
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
  return rowAs<Store>(result.rows[0]);
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
  return rowsAs<Store>(result.rows);
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
  return rowsAs<Order>(result.rows);
}

export async function getOrdersBySellerId(userId: string): Promise<Order[]> {
  const result = await turso.execute({
    sql: `
      SELECT o.*
      FROM orders o
      INNER JOIN products p ON o.product_id = p.id
      WHERE p.user_id = ?
      ORDER BY o.created_at DESC
    `,
    args: [userId],
  });
  return rowsAs<Order>(result.rows);
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
