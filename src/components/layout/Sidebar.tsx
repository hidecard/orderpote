import { LayoutDashboard, Package, ShoppingCart, Wallet, LogOut, ShieldCheck, Store as StoreIcon, Bell } from 'lucide-react';
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
        { icon: ShieldCheck, label: 'Store Approvals', path: '/admin/store-approvals' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: StoreIcon, label: 'Store Settings', path: '/store-settings' },
        { icon: Wallet, label: 'Payment Wallet', path: '/wallet-setup' },
      ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-600">OrderPote</h1>
        {unreadCount > 0 && (
          <div className="relative">
            <Bell className="w-6 h-6 text-purple-600" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {user && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">{user.name}</p>
          <p className="text-xs text-gray-500">{user.phone}</p>
        </div>
      )}
    </aside>
  );
}
