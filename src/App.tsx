import { BrowserRouter as Router, Navigate, Routes, Route, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import WalletSetup from './components/auth/WalletSetup';
import BecomeSeller from './components/auth/BecomeSeller';
import SellerPending from './components/auth/SellerPending';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './components/dashboard/Dashboard';
import Discounts from './components/dashboard/Discounts';
import ProductList from './components/products/ProductList';
import AddProductForm from './components/products/AddProductForm';
import EditProductForm from './components/products/EditProductForm';
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';
import StoreApproval from './components/admin/StoreApproval';
import SellerManagement from './components/admin/SellerManagement';
import PlanManagement from './components/admin/PlanManagement';
import NotificationsPage from './components/notifications/NotificationsPage';
import ProductTrafficPage from './pages/ProductTraffic';
import ProductLandingPage from './components/buyer/ProductLandingPage';
import CheckoutForm from './components/buyer/CheckoutForm';
import OrderTracking from './components/buyer/OrderTracking';
import MyOrders from './components/buyer/MyOrders';
import StoreSettings from './components/dashboard/StoreSettings';
import { getStoreByUserId } from './lib/db';
import { isAdminUser } from './lib/admin';
import type { Store } from './lib/schema';
import './index.css'
import './App.css'

function SellerAccessGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [isCheckingStore, setIsCheckingStore] = useState(true);

  useEffect(() => {
    async function checkStore() {
      if (!user) {
        setIsCheckingStore(false);
        return;
      }

      try {
        const currentStore = await getStoreByUserId(user.id);
        setStore(currentStore);
      } finally {
        setIsCheckingStore(false);
      }
    }

    checkStore();
  }, [user]);

  if (isLoading || isCheckingStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_seller || !store) return <Navigate to="/become-seller" replace />;
  if (store.approval_status !== 'approved') return <Navigate to="/seller-pending" replace />;

  return children;
}

function AdminAccessGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/dashboard" replace />;

  return children;
}

function PrivateAccessGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

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
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/seller-pending" element={<SellerPending />} />
          <Route path="/wallet-setup" element={<WalletSetup />} />
          <Route path="/admin" element={<Navigate to="/admin/store-approvals" replace />} />
          <Route
            path="/admin/store-approvals"
            element={
              <AdminAccessGate>
                <DashboardLayout title="Store Approvals">
                  <StoreApproval />
                </DashboardLayout>
              </AdminAccessGate>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <AdminAccessGate>
                <DashboardLayout title="Seller Management">
                  <SellerManagement />
                </DashboardLayout>
              </AdminAccessGate>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <AdminAccessGate>
                <DashboardLayout title="Plan Management">
                  <PlanManagement />
                </DashboardLayout>
              </AdminAccessGate>
            }
          />
          
          {/* Seller Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Dashboard">
                  <Dashboard />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/products"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Products">
                  <ProductList />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/discounts"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Discounts">
                  <Discounts />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/products/add"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Add Product">
                  <AddProductForm />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/products/edit/:productId"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Edit Product">
                  <EditProductForm />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/product-traffic"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Product Traffic">
                  <ProductTrafficPage />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/orders"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Orders">
                  <OrderList />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Order Details">
                  <OrderDetailWrapper />
                </DashboardLayout>
              </SellerAccessGate>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateAccessGate>
                <DashboardLayout title="Notifications">
                  <NotificationsPage />
                </DashboardLayout>
              </PrivateAccessGate>
            }
          />
          <Route
            path="/store-settings"
            element={
              <SellerAccessGate>
                <DashboardLayout title="Store Settings">
                  <StoreSettings />
                </DashboardLayout>
              </SellerAccessGate>
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
