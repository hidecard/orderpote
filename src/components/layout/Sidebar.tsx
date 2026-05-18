import { LayoutDashboard, Package, ShoppingCart, Wallet, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/admin';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = isAdminUser(user);

  const menuItems = isAdmin
    ? [
        { icon: ShieldCheck, label: 'Store Approvals', path: '/admin/store-approvals' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: Wallet, label: 'Payment Wallet', path: '/wallet-setup' },
      ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-purple-600">OrderPote</h1>
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
