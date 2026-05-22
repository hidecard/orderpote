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
import SeoMeta from './components/common/SeoMeta';
import type { SeoMetaProps } from './components/common/SeoMeta';
import { getStoreByUserId } from './lib/db';
import { isAdminUser } from './lib/admin';
import type { Store } from './lib/schema';
import './index.css'
import './App.css'

const defaultPageDescription =
  'Create product links, accept mobile banking payments, and manage orders in one dashboard built for Myanmar sellers.';

function withSeo(element: ReactNode, meta: SeoMetaProps) {
  return (
    <>
      <SeoMeta {...meta} />
      {element}
    </>
  );
}

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
  return withSeo(
    <CheckoutForm productSlug={productSlug} variantId={variantId} quantity={quantity} />,
    {
      title: 'Checkout | OrderPote',
      description: 'Complete your order securely through OrderPote.',
      noIndex: true,
    }
  );
}

function OrderTrackingWrapper() {
  const { orderId } = useParams<{ orderId: string }>();
  return withSeo(<OrderTracking orderId={orderId || ''} />, {
    title: 'Track Order | OrderPote',
    description: 'Check the latest status of your OrderPote order.',
    noIndex: true,
  });
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={withSeo(<LandingPage />, {
              title: 'OrderPote | Social Commerce Order Management',
              description: defaultPageDescription,
            })}
          />
          <Route
            path="/register"
            element={withSeo(<RegisterForm />, {
              title: 'Create Seller Account | OrderPote',
              description: 'Start selling online with OrderPote and manage product links, payments, and orders in one place.',
            })}
          />
          <Route
            path="/login"
            element={withSeo(<LoginForm />, {
              title: 'Login | OrderPote',
              description: 'Log in to your OrderPote seller dashboard.',
              noIndex: true,
            })}
          />
          
          {/* Onboarding */}
          <Route
            path="/become-seller"
            element={withSeo(<BecomeSeller />, {
              title: 'Become a Seller | OrderPote',
              description: 'Set up your OrderPote seller profile and start receiving online orders.',
            })}
          />
          <Route
            path="/seller-pending"
            element={withSeo(<SellerPending />, {
              title: 'Seller Approval Pending | OrderPote',
              description: 'Your OrderPote seller account is waiting for approval.',
              noIndex: true,
            })}
          />
          <Route
            path="/wallet-setup"
            element={withSeo(<WalletSetup />, {
              title: 'Wallet Setup | OrderPote',
              description: 'Add mobile wallet information for receiving OrderPote payments.',
              noIndex: true,
            })}
          />
          <Route path="/admin" element={<Navigate to="/admin/store-approvals" replace />} />
          <Route
            path="/admin/store-approvals"
            element={withSeo(
              <AdminAccessGate>
                <DashboardLayout title="Store Approvals">
                  <StoreApproval />
                </DashboardLayout>
              </AdminAccessGate>,
              {
                title: 'Store Approvals | OrderPote',
                description: 'Review and approve seller stores in the OrderPote admin dashboard.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/admin/sellers"
            element={withSeo(
              <AdminAccessGate>
                <DashboardLayout title="Seller Management">
                  <SellerManagement />
                </DashboardLayout>
              </AdminAccessGate>,
              {
                title: 'Seller Management | OrderPote',
                description: 'Manage seller accounts in the OrderPote admin dashboard.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/admin/plans"
            element={withSeo(
              <AdminAccessGate>
                <DashboardLayout title="Plan Management">
                  <PlanManagement />
                </DashboardLayout>
              </AdminAccessGate>,
              {
                title: 'Plan Management | OrderPote',
                description: 'Manage subscription plans in the OrderPote admin dashboard.',
                noIndex: true,
              }
            )}
          />
          
          {/* Seller Dashboard Routes */}
          <Route
            path="/dashboard"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Dashboard">
                  <Dashboard />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Dashboard | OrderPote',
                description: 'View seller performance, revenue, and order activity in OrderPote.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/products"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Products">
                  <ProductList />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Products | OrderPote',
                description: 'Create and manage product links for your OrderPote store.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/discounts"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Discounts">
                  <Discounts />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Discounts | OrderPote',
                description: 'Create and manage discounts for your OrderPote products.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/products/add"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Add Product">
                  <AddProductForm />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Add Product | OrderPote',
                description: 'Add a new product and generate a shareable OrderPote product link.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/products/edit/:productId"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Edit Product">
                  <EditProductForm />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Edit Product | OrderPote',
                description: 'Update product details, variants, images, and availability in OrderPote.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/product-traffic"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Product Traffic">
                  <ProductTrafficPage />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Product Traffic | OrderPote',
                description: 'Review product link visits and buyer traffic in OrderPote.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/orders"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Orders">
                  <OrderList />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Orders | OrderPote',
                description: 'Manage customer orders and payment checks in OrderPote.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/orders/:orderId"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Order Details">
                  <OrderDetailWrapper />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Order Details | OrderPote',
                description: 'Review order details, buyer information, and payment status in OrderPote.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/notifications"
            element={withSeo(
              <PrivateAccessGate>
                <DashboardLayout title="Notifications">
                  <NotificationsPage />
                </DashboardLayout>
              </PrivateAccessGate>,
              {
                title: 'Notifications | OrderPote',
                description: 'View OrderPote account and order notifications.',
                noIndex: true,
              }
            )}
          />
          <Route
            path="/store-settings"
            element={withSeo(
              <SellerAccessGate>
                <DashboardLayout title="Store Settings">
                  <StoreSettings />
                </DashboardLayout>
              </SellerAccessGate>,
              {
                title: 'Store Settings | OrderPote',
                description: 'Manage your OrderPote store profile, logo, and payment information.',
                noIndex: true,
              }
            )}
          />
          
          {/* Buyer Routes */}
          <Route path="/order/:slug" element={<ProductLandingPageWrapper />} />
          <Route path="/checkout" element={<CheckoutFormWrapper />} />
          <Route path="/order-tracking/:orderId" element={<OrderTrackingWrapper />} />
          <Route
            path="/my-orders"
            element={withSeo(<MyOrders />, {
              title: 'My Orders | OrderPote',
              description: 'Find and review your recent OrderPote orders.',
              noIndex: true,
            })}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
