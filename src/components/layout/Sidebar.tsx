import { LayoutDashboard, Package, ShoppingCart, Wallet, LogOut, ShieldCheck, Store as StoreIcon, Bell, BarChart, CreditCard, Tag, User, Users, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/admin';
import { getUnreadNotificationCount } from '../../lib/db';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = isAdminUser(user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      if (!user) return;
      try {
        const count = await getUnreadNotificationCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    }

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const menuItems = isAdmin
    ? [
        { icon: Bell, label: 'အကြောင်းကြားချက်များ', path: '/notifications' },
        { icon: ShieldCheck, label: 'ဆိုင်ခွင့်အတည်ပြုမှုများ', path: '/admin/store-approvals' },
        { icon: Package, label: 'ရောင်းချသူများစီမံခန့်ခွဲမှု', path: '/admin/sellers' },
        { icon: CreditCard, label: 'အစီအစဉ်များစီမံခန့်ခွဲမှု', path: '/admin/plans' },
        { icon: User, label: 'Admin ပရိုဖိုင်', path: '/admin/profile' },
      ]
    : [
        { icon: LayoutDashboard, label: 'ဒက်ရှ်ဘုတ်', path: '/dashboard' },
        { icon: Package, label: 'ပစ္စည်းများ', path: '/products' },
        { icon: Tag, label: 'လျှော့ဈေးများ', path: '/discounts' },
        { icon: BarChart, label: 'ပစ္စည်းလာရောက်မှု', path: '/product-traffic' },
        { icon: ShoppingCart, label: 'အော်ဒါများ', path: '/orders' },
        { icon: Bell, label: 'အကြောင်းကြားချက်များ', path: '/notifications' },
        { icon: StoreIcon, label: 'ဆိုင်ဆက်တင်များ', path: '/store-settings' },
        { icon: Users, label: 'ဝန်ထမ်းစီမံခန့်ခွဲမှု', path: '/staff-management' },
        { icon: Smartphone, label: 'ကိရိယာစီမံခန့်ခွဲမှု', path: '/device-management' },
        { icon: User, label: 'ပရိုဖိုင်ဆက်တင်များ', path: '/profile-settings' },
        { icon: Wallet, label: 'ငွေပေးချေမှုအိတ်', path: '/wallet-setup' },
      ];

  return (
    <aside className="relative flex w-full max-w-xs min-h-0 flex-col border-r border-gray-200 bg-white p-4 md:h-screen md:w-64 md:sticky md:top-0 md:self-start">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a7f8c]">OrderPote</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto pr-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#1a7f8c]/10 text-[#1a7f8c] font-bold' 
                  : 'text-gray-700 hover:bg-[#1a7f8c]/5 hover:text-[#1a7f8c]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.path === '/notifications' && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="w-5 h-5" />
          <span>အကောင့်ထွက်မည်</span>
        </button>

        {user && (
          <div className="mt-4 space-y-1 text-center text-sm text-gray-600">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.phone}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
