// Database schema for OrderPote

// Tables to be created in Turso:

/*
-- Users table (Sellers)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Store settings
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  phone TEXT NOT NULL,
  approval_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- KPay, Wave Money, AYA Pay, CB Pay, KBZ iBanking
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product variants
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL, -- e.g., "Size: M, Color: Black"
  price INTEGER NOT NULL, -- in pyas
  stock INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product bundles
CREATE TABLE IF NOT EXISTS product_bundles (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  bundle_product_id TEXT NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (bundle_product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Recommended products
CREATE TABLE IF NOT EXISTS recommended_products (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  recommended_product_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (recommended_product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_region TEXT NOT NULL,
  customer_township TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  delivery_status TEXT DEFAULT 'pending', -- pending, preparing, shipped, delivered
  payment_screenshot_url TEXT,
  delivery_service TEXT,
  tracking_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Page views (analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
*/

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  is_seller: boolean;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  phone: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  provider: string;
  account_name: string;
  account_number: string;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  store_id: string;
  name: string;
  description?: string;
  slug: string;
  cover_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  variant_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_region: string;
  customer_township: string;
  quantity: number;
  total_price: number;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_status: 'pending' | 'preparing' | 'shipped' | 'delivered';
  payment_screenshot_url?: string;
  delivery_service?: string;
  tracking_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: string;
  product_id: string;
  viewed_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}
