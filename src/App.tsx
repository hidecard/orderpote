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
  'Product Link များဖန်တီးပါ၊ Mobile Banking ဖြင့် ငွေပေးချေမှုများကို လက်ခံပါ၊ အော်ဒါများကို တစ်နေရာတည်းတွင် စနစ်တကျ စီမံခန့်ခွဲပါ။';

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
      title: 'အော်ဒါတင်ရန် | OrderPote',
      description: 'OrderPote မှတစ်ဆင့် သင့်အော်ဒါကို လုံခြုံစွာ ပြီးမြောက်အောင်လုပ်ပါ။',
      noIndex: true,
    }
  );
}

function OrderTrackingWrapper() {
  const { orderId } = useParams<{ orderId: string }>();
  return withSeo(<OrderTracking orderId={orderId || ''} />, {
    title: 'အော်ဒါလိုက်လိုက်ရန် | OrderPote',
    description: 'သင့် OrderPote အော်ဒါ၏ နောက်ဆုံးအခြေအနေကို စစ်ဆေးပါ။',
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
              title: 'OrderPote | Social Commerce အော်ဒါစီမံခန့်ခွဲမှုစနစ်',
              description: defaultPageDescription,
            })}
          />
          <Route
            path="/register"
            element={withSeo(<RegisterForm />, {
              title: 'ရောင်းချသူ အကောင့်ဖွင့်ရန် | OrderPote',
              description: 'OrderPote ဖြင့် အွန်လိုင်းမှ စတင်ရောင်းချပါ။ Product Link များ၊ ငွေပေးချေမှုများနှင့် အော်ဒါများကို တစ်နေရာတည်းတွင် စီမံခန့်ခွဲပါ။',
            })}
          />
          <Route
            path="/login"
            element={withSeo(<LoginForm />, {
              title: 'အကောင့်ဝင်ရန် | OrderPote',
              description: 'OrderPote ရောင်းချသူ Dashboard သို့ ဝင်ရောက်ပါ။',
              noIndex: true,
            })}
          />
          
          {/* Onboarding */}
          <Route
            path="/become-seller"
            element={withSeo(<BecomeSeller />, {
              title: 'ရောင်းချသူဖြစ်ရန် | OrderPote',
              description: 'OrderPote ရောင်းချသူ Profile တည်ဆောက်ပြီး အွန်လိုင်းအော်ဒါများ လက်ခံရန် စတင်ပါ။',
            })}
          />
          <Route
            path="/seller-pending"
            element={withSeo(<SellerPending />, {
              title: 'ရောင်းချသူ အတည်ပြုစောင့်ဆိုင်းဆဲ | OrderPote',
              description: 'သင့် OrderPote ရောင်းချသူ အကောင့်ကို အတည်ပြုရန် စောင့်ဆိုင်းနေပါသည်။',
              noIndex: true,
            })}
          />
          <Route
            path="/wallet-setup"
            element={withSeo(<WalletSetup />, {
              title: 'Wallet တည်ဆောက်ရန် | OrderPote',
              description: 'OrderPote ငွေပေးချေမှုများ လက်ခံရန် Mobile Wallet အချက်အလက်များ ထည့်ပါ။',
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
                title: 'ဆိုင်အတည်ပြုမှုများ | OrderPote',
                description: 'OrderPote Admin Dashboard တွင် ရောင်းချသူဆိုင်များကို စစ်ဆေးအတည်ပြုပါ။',
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
                title: 'ရောင်းချသူစီမံခန့်ခွဲမှု | OrderPote',
                description: 'OrderPote Admin Dashboard တွင် ရောင်းချသူအကောင့်များကို စီမံခန့်ခွဲပါ။',
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
                title: 'ပလန်စီမံခန့်ခွဲမှု | OrderPote',
                description: 'OrderPote Admin Dashboard တွင် စာချုပ်ပလန်များကို စီမံခန့်ခွဲပါ။',
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
                description: 'OrderPote တွင် ရောင်းချသူစွမ်းဆောင်ရည်၊ ဝင်ငွေနှင့် အော်ဒါလှုပ်ရှားမှုများကို ကြည့်ရှုပါ။',
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
                title: 'ပစ္စည်းများ | OrderPote',
                description: 'သင့် OrderPote ဆိုင်အတွက် Product Link များဖန်တီးနှင့် စီမံခန့်ခွဲပါ။',
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
                title: 'လျှော့ဈေးများ | OrderPote',
                description: 'သင့် OrderPote ပစ္စည်းများအတွက် လျှော့ဈေးများဖန်တီးနှင့် စီမံခန့်ခွဲပါ။',
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
                title: 'ပစ္စည်းထည့်ရန် | OrderPote',
                description: 'ပစ္စည်းအသစ်ထည့်ပြီး မျှဝေနိုင်သော OrderPote Product Link ဖန်တီးပါ။',
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
                title: 'ပစ္စည်းပြင်ဆင်ရန် | OrderPote',
                description: 'OrderPote တွင် ပစ္စည်းအသေးစိတ်၊ အမျိုးအစားများ၊ ပုံများနှင့် ရရှိနိုင်မှုကို အပ်ဒိတ်လုပ်ပါ။',
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
                title: 'ပစ္စည်းလာရောက်မှု | OrderPote',
                description: 'OrderPote တွင် Product Link လှုပ်ရှားမှုနှင့် ဝယ်သူလာရောက်မှုများကို ကြည့်ရှုပါ။',
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
                title: 'အော်ဒါများ | OrderPote',
                description: 'OrderPote တွင် ဖောက်သည်အော်ဒါများနှင့် ငွေပေးချေမှုစစ်ဆေးမှုများကို စီမံခန့်ခွဲပါ။',
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
                title: 'အော်ဒါအသေးစိတ် | OrderPote',
                description: 'OrderPote တွင် အော်ဒါအသေးစိတ်၊ ဝယ်သူအချက်အလက်နှင့် ငွေပေးချေမှုအခြေအနေကို ကြည့်ရှုပါ။',
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
                title: 'အသိပေးချက်များ | OrderPote',
                description: 'OrderPote အကောင့်နှင့် အော်ဒါအသိပေးချက်များကို ကြည့်ရှုပါ။',
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
                title: 'ဆိုင်ဆက်တင်များ | OrderPote',
                description: 'သင့် OrderPote ဆိုင် Profile၊ Logo နှင့် ငွေပေးချေမှုအချက်အလက်များကို စီမံခန့်ခွဲပါ။',
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
              title: 'ကျွန်ုပ်၏အော်ဒါများ | OrderPote',
              description: 'သင့် OrderPote အော်ဒါများကို ရှာဖွေပြီး ကြည့်ရှုပါ။',
              noIndex: true,
            })}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
