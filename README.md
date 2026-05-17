# OrderPote

OrderPote is a comprehensive e-commerce platform designed for Myanmar sellers to easily create product links, accept payments via mobile banking, and manage orders through a simple dashboard.

## Features

### Seller Web Dashboard
- **Authentication & Onboarding**: Phone/Google sign-in with OTP verification, multi-wallet setup (KPay, Wave Money, AYA Pay, CB Pay, KBZ iBanking), store settings configuration
- **Product Management**: Drag-and-drop multi-image upload, rich-text descriptions, dynamic variant matrix (size, color), real-time stock tracking, product bundling, link status toggle, QR code generation
- **Dashboard & Analytics**: KPI scorecards (revenue, orders, pending), sales charts (line & pie charts), link traffic tracker
- **Order Management**: Live order table with smart filters, screenshot verification lightbox, fulfillment operations, bulk export to Excel/CSV

### Buyer Mobile Web App
- **Product Landing Page**: Mobile-optimized carousel, smart variant selector, social proof (reviews & ratings)
- **Checkout & Payment**: One-click clipboard copy for wallet numbers, hierarchical address dropdowns (region/township), client-side image compression
- **Order Tracking**: Real-time status timeline, PDF generation & export, fulfillment link integrations, cookie-based local history

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Database**: Turso (libsql://orderpote-hidecatd.aws-ap-northeast-1.turso.io)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd orderpote
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Turso auth token:
```
VITE_TURSO_AUTH_TOKEN=your_turso_auth_token_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Database Setup

The database schema is defined in `src/lib/schema.ts`. To set up your Turso database:

1. Create a Turso account at https://turso.tech
2. Create a new database
3. Run the SQL schema from `src/lib/schema.ts` in your Turso dashboard
4. Copy your database URL and auth token
5. Update `src/lib/turso.ts` with your credentials

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── buyer/          # Buyer-facing components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   ├── orders/         # Order management components
│   └── products/       # Product management components
├── context/           # React context providers
├── lib/               # Utilities and database configuration
├── pages/             # Page components
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Modules

### Module 1: Authentication & Onboarding
- Phone/Google sign-in with OTP verification
- Multi-wallet storage (KPay, Wave Money, AYA Pay, CB Pay, KBZ iBanking)
- Primary account selector
- Store settings (name, logo, phone)

### Module 2: Product Listing & Inventory
- Drag-and-drop multi-image upload
- Rich-text product description
- Dynamic variant matrix (size, color, price, stock)
- Real-time stock counter
- Product bundling & cross-selling
- Link status toggle (Active/Inactive)
- QR code generation

### Module 3: Dashboard & Analytics
- KPI scorecards (revenue, orders, pending)
- Sales analytical charts (line & pie charts)
- Link traffic tracker (page views per product)

### Module 4: Order Management
- Advanced live order table with smart filters
- Screenshot verification lightbox
- Fulfillment operations (delivery service, tracking ID)
- One-click bulk export (Excel/CSV)

### Module 5: Buyer Product Landing Page
- Mobile-optimized image carousel
- Smart variant selector with live price calculation
- Social proof (reviews & ratings)

### Module 6: Checkout & Payment
- One-click clipboard copy for wallet numbers
- Hierarchical address dropdowns (region/township)
- Client-side image compression for screenshots

### Module 7: Order Tracking
- Real-time status timeline (Pending → Paid → Preparing → Delivered)
- PDF generation & export
- Fulfillment link integrations
- Cookie-based local order history

## License

MIT
