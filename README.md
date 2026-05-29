# OrderPote (အော်ဒါပို့)

OrderPote is a Myanmar-focused e-commerce and order management platform for online sellers. Sellers can create product landing pages, accept mobile banking payments, manage orders, track product traffic, and run discounts from one dashboard.

OrderPote သည် မြန်မာ Online Seller များအတွက် Product Link များဖန်တီးခြင်း၊ Mobile Banking Payment လက်ခံခြင်း၊ အော်ဒါစီမံခြင်း၊ Discount Code များအသုံးပြုခြင်းနှင့် Product Traffic စောင့်ကြည့်ခြင်းတို့ကို တစ်နေရာတည်းတွင် ပြုလုပ်နိုင်သော platform ဖြစ်ပါသည်။

## Feature Update

### Seller Features

- Seller registration and store approval flow
- Store profile, logo, contact information, category, address, and description settings
- Wallet setup for KPay, Wave Money, AYA Pay, CB Pay, KBZ iBanking, and other payment accounts
- **Dynamic Custom Attributes** - Define custom product attributes (e.g., "အလေးချိန်", "Volume", "အရသာ") with values (e.g., "1 Kg, 5 Kg") instead of hardcoded Size/Color
- **Auto Variant Matrix Generator** - Automatically generates all possible variant combinations from custom attributes in a table format
- Product creation, editing, active/inactive status, product images, variants, price, stock, cost price (COGS), and public product links
- Product landing pages for buyers at `/order/:slug` with dynamic attribute labels
- **Supplier Directory** - Register and manage supplier details (name, contact person, phone, email, address, notes)
- **Purchase Order Intake** - Create purchase orders to add stock to variants with moving average COGS calculation
- Product traffic analytics for seller product views
- Coupon and discount code management
- Cash on Delivery (COD) setting so buyers can checkout without a payment screenshot
- Township-based delivery fees that are automatically added during checkout
- Order list, order detail, payment status, delivery status, delivery service, and tracking ID management
- Order batch processing with smart packing slips, pick lists, township sorting, and address labels with QR codes
- Notifications for seller activity
- Device management and login history for seller accounts
- Profile settings and password update

### Buyer Features

- Public product page without account login
- **Dynamic attribute selection** - Select from seller-defined custom attributes (e.g., weight, volume, flavor) with real-time price and stock updates
- Variant and quantity selection (traditional Size/Color or custom attributes)
- Checkout with customer name, phone, address, region, township, and payment screenshot
- COD checkout when the seller enables Cash on Delivery
- Automatic delivery fee calculation after selecting region and township
- Order tracking page
- My Orders lookup by customer phone
- Digital receipt view and PDF receipt download
- Myanmar language support in buyer-facing pages and SEO metadata

### Admin Features

- Admin-only access by configured admin email
- Store approval and rejection workflow
- Seller management for subscription assignment, trial start, and subscription cancellation
- Plan management for monthly/yearly prices, trial days, and descriptions
- Admin profile settings

### Recent Updates

- **Dynamic Custom Attributes Feature** - Sellers can now create unlimited custom attributes (not just Size/Color) for products like Grocery, Cosmetics, Food & Beverage
- **Auto Variant Matrix Generator** - Frontend JavaScript automatically generates all possible variant combinations from custom attributes
- **Supplier & Purchase Order Management** - Suppliers directory and PO intake flow for stock management with moving average COGS calculation
- **Live Price & Stock Updates** - Buyer landing page updates price and stock in real-time when selecting different attribute values
- **Staff Management** has been removed from the app.
- Seller access now depends on the seller's own store record only.
- Device tracking now records seller account usage only.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Recharts
- Turso / LibSQL
- Vercel serverless API for dynamic Open Graph metadata

## Key Features Explained

### Dynamic Custom Attributes System

Unlike traditional e-commerce platforms that hardcode Size and Color, OrderPote allows sellers to define unlimited custom attributes:

**For Sellers:**
- Define custom attribute names (e.g., "အလေးချိန်", "Volume", "အရသာ", "အရည်")
- Add multiple values for each attribute (e.g., "1 Kg, 5 Kg, 10 Kg" or "100 ml, 500 ml, 1 L")
- Auto-generate all possible variant combinations using Cartesian product algorithm
- Set individual selling price, stock quantity, and cost price (COGS) for each variant
- Works for any product type: Grocery, Cosmetics, Food & Beverage, Electronics, etc.

**For Buyers:**
- See dynamic attribute labels based on seller's definitions
- Select attribute values with real-time price and stock updates
- Clear visual feedback for out-of-stock variants

### Purchase Order & Supplier Management

**Supplier Directory:**
- Register suppliers with name, contact person, phone, email, address, and notes
- Centralized supplier management for all purchase orders

**Purchase Order Intake:**
- Create purchase orders to add stock to product variants
- Select supplier, product, and variant
- Enter quantity and unit cost
- System automatically:
  - Updates variant stock quantity
  - Calculates moving average COGS: `(Current Stock × Current Cost + New Qty × New Cost) / (Current Stock + New Qty)`
  - Records purchase order history for tracking
- Track cost of goods sold accurately over time

## Project Structure

```text
api/                         Vercel serverless functions
public/                      Static assets
src/App.tsx                  App routes and access gates
src/components/admin/        Admin dashboard screens
src/components/auth/         Login, register, seller onboarding
src/components/buyer/        Buyer product, checkout, tracking, receipts
src/components/dashboard/    Seller dashboard screens
src/components/layout/       Dashboard shell and sidebar
src/components/orders/       Seller order management
src/components/products/     Product management
src/lib/                     Database, schema, admin helpers
src/pages/                   Page-level screens
```

## Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/hidecard/orderpote.git
cd orderpote
```

### 2. Install dependencies

Use the package manager already used by your workflow.

```bash
npm install
```

or:

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_TURSO_AUTH_TOKEN=your_turso_auth_token_here
```

The Turso database URL is currently configured in `src/lib/turso.ts`.

### 4. Run the development server

```bash
npm run dev
```

or:

```bash
pnpm dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## Usage Guide

### Seller Flow

1. Go to `/register` and create an account.
2. Go through `/become-seller` to create store information.
3. Wait for admin approval at `/seller-pending`.
4. After approval, use `/dashboard` to manage the store.
5. Add payment accounts in `/wallet-setup`.
6. Create products in `/products/add`:
   - Choose between traditional Size/Color variants or **Dynamic Custom Attributes**
   - For custom attributes: define attribute names (e.g., "အလေးချိန်", "Volume") and values (e.g., "1 Kg, 5 Kg")
   - The system auto-generates all variant combinations in a table
   - Set selling price, stock quantity, and cost price (COGS) for each variant
7. Manage suppliers and create purchase orders in `/purchase-orders/create`:
   - Register suppliers with contact details
   - Select supplier, product, and variant
   - Enter quantity and unit cost
   - System automatically updates stock and calculates moving average COGS
8. Share the generated product link, usually `/order/:slug`.
9. Manage incoming orders in `/orders`.
10. Use `/orders/processing` to batch process orders, generate packing slips, and print address labels.
11. Use `/discounts` for coupon codes and `/product-traffic` for view analytics.
12. Use `/financial-dashboard` to track profit, COGS, and export financial reports.
13. Enable COD and edit township delivery fees in `/store-settings`.

### Buyer Flow

1. Open a product link at `/order/:slug`.
2. Choose variant and quantity:
   - For products with custom attributes: select from dynamic attribute labels (e.g., weight, flavor)
   - Price and stock update in real-time based on selection
   - For traditional products: select Size and/or Color
3. Continue to checkout.
4. Select prepaid payment or COD if the seller allows it.
5. Choose region and township so the delivery fee is added automatically.
6. Upload payment screenshot for prepaid orders, then submit the order. COD orders do not require a screenshot.
7. Track the order at `/order-tracking/:orderId`.
8. Use `/my-orders` to find orders by phone number.

### Admin Flow

1. Login using the admin email configured in `src/lib/admin.ts`.
2. Review stores at `/admin/store-approvals`.
3. Manage sellers at `/admin/sellers`.
4. Manage subscription plans at `/admin/plans`.
5. Update admin profile at `/admin/profile`.

## Main Routes

### Public Routes

- `/` - Landing page
- `/register` - User registration
- `/login` - Login
- `/order/:slug` - Buyer product landing page
- `/checkout` - Buyer checkout
- `/order-tracking/:orderId` - Buyer order tracking
- `/my-orders` - Buyer order lookup

### Seller Routes

- `/dashboard` - Seller dashboard
- `/products` - Product list
- `/products/add` - Add product (with Dynamic Custom Attributes support)
- `/products/edit/:productId` - Edit product
- `/discounts` - Coupon and discount management
- `/product-traffic` - Product view analytics
- `/financial-dashboard` - Financial dashboard with profit calculator and COGS tracking
- `/orders` - Order list
- `/orders/processing` - Order batch processing with packing slips and address labels
- `/orders/:orderId` - Order detail
- `/purchase-orders/create` - Create purchase orders for stock intake with supplier management
- `/notifications` - Notifications
- `/store-settings` - Store settings
- `/profile-settings` - Seller profile settings
- `/device-management` - Seller device login history
- `/wallet-setup` - Payment wallet setup

### Admin Routes

- `/admin` - Redirects to store approvals
- `/admin/store-approvals` - Approve or reject stores
- `/admin/sellers` - Manage seller subscriptions
- `/admin/plans` - Manage subscription plans
- `/admin/profile` - Admin profile settings

## Database Notes

The app uses Turso / LibSQL. Main data models include:

- Users
- Stores
- Wallets
- Products
- Product images
- Product variants (with custom attributes support via `attributes_json` field)
- **Product attributes** (custom attribute definitions for dynamic variants)
- Orders
- Coupon codes
- Page views
- Reviews
- Notifications
- Plans
- Subscriptions
- Subscription payment logs
- Devices
- Device usage
- **Suppliers** (supplier directory for purchase orders)
- **Purchase orders** (stock intake with moving average COGS calculation)

Schema reference and TypeScript interfaces live in `src/lib/schema.ts`. Database helper functions live in `src/lib/db.ts`.

## Quality Checks

Run a production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Note: lint may report existing React hook and TypeScript lint issues in unrelated files until those files are cleaned up.

## Deployment Notes

This project is Vite-based and includes Vercel configuration. For Vercel deployment:

1. Set `VITE_TURSO_AUTH_TOKEN` in the Vercel project environment variables.
2. Deploy the repository.
3. Confirm the serverless API under `api/` is deployed for dynamic metadata support.

## License

MIT
