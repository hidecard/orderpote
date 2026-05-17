import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import WalletSetup from './components/auth/WalletSetup';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import AddProductForm from './components/products/AddProductForm';
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';
import ProductLandingPage from './components/buyer/ProductLandingPage';
import CheckoutForm from './components/buyer/CheckoutForm';
import OrderTracking from './components/buyer/OrderTracking';
import MyOrders from './components/buyer/MyOrders';
import './index.css'
import './App.css'
// Wrapper components to handle route parameters
function OrderDetailWrapper() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = () => window.location.href = '/orders';
  return <OrderDetail orderId={orderId || ''} onBack={navigate} />;
}

function ProductLandingPageWrapper() {
  const { slug } = useParams<{ slug: string }>();
  return <ProductLandingPage slug={slug || ''} />;
}

function CheckoutFormWrapper() {
  const searchParams = new URLSearchParams(window.location.search);
  const productSlug = searchParams.get('product') || '';
  const variantId = searchParams.get('variant') || '';
  const quantity = parseInt(searchParams.get('quantity') || '1');
  return <CheckoutForm productSlug={productSlug} variantId={variantId} quantity={quantity} />;
}

function OrderTrackingWrapper() {
  const { orderId } = useParams<{ orderId: string }>();
  return <OrderTracking orderId={orderId || ''} />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          
          {/* Onboarding */}
          <Route path="/wallet-setup" element={<WalletSetup />} />
          
          {/* Seller Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout title="Dashboard">
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/products"
            element={
              <DashboardLayout title="Products">
                <ProductList />
              </DashboardLayout>
            }
          />
          <Route
            path="/products/add"
            element={
              <DashboardLayout title="Add Product">
                <AddProductForm />
              </DashboardLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <DashboardLayout title="Orders">
                <OrderList />
              </DashboardLayout>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <DashboardLayout title="Order Details">
                <OrderDetailWrapper />
              </DashboardLayout>
            }
          />
          
          {/* Buyer Routes */}
          <Route path="/order/:slug" element={<ProductLandingPageWrapper />} />
          <Route path="/checkout" element={<CheckoutFormWrapper />} />
          <Route path="/order-tracking/:orderId" element={<OrderTrackingWrapper />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
