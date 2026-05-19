import { LayoutDashboard, Package, ShoppingCart, Wallet, LogOut, ShieldCheck, Store as StoreIcon, Bell, BarChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/admin';
import { getUnreadNotificationCount } from '../../lib/db';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
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
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: ShieldCheck, label: 'Store Approvals', path: '/admin/store-approvals' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Package, label: 'Products', path: '/products' },
      { icon: BarChart, label: 'Product Traffic', path: '/product-traffic' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: StoreIcon, label: 'Store Settings', path: '/store-settings' },
        { icon: Wallet, label: 'Payment Wallet', path: '/wallet-setup' },
      ];

  return (
    <aside className="relative flex w-full max-w-xs min-h-0 flex-col border-r border-gray-200 bg-white p-4 md:h-screen md:w-64 md:sticky md:top-0 md:self-start">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-600">OrderPote</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto pr-1 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1">{item.label}</span>
            {item.path === '/notifications' && unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
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
