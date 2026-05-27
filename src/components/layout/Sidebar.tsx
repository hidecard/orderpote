import { LayoutDashboard, Package, ShoppingCart, Wallet, LogOut, ShieldCheck, Store as StoreIcon, Bell, BarChart, CreditCard, Tag, User, Users, Smartphone, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdminUser } from '../../lib/admin';
import { getUnreadNotificationCount } from '../../lib/db';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

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
        { icon: User, label: 'အကောင့် ဆက်တင်များ', path: '/profile-settings' },
      ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-brand-dark/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:border-r md:border-gray-100 md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <img src="/real-logo.png" alt="ZayLink Logo" className="h-8 w-auto" />
            <h1 className="text-xl font-black text-brand-dark tracking-tighter">Zay<span className="text-brand-primary">Link</span></h1>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-50 md:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-brand-dark text-white font-bold shadow-xl shadow-brand-dark/20 scale-[1.02]' 
                    : 'text-gray-500 hover:bg-brand-primary/5 hover:text-brand-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'group-hover:text-brand-primary'}`} />
                <span className="flex-1 text-sm tracking-tight">{item.label}</span>
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isActive ? 'bg-brand-primary text-brand-dark' : 'bg-red-500 text-white'}`}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-red-600 transition-all hover:bg-red-100 font-black text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {user && (
            <div className="mt-6 flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-brand-dark truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
