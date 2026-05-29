import { useStaffAuth } from '../../context/StaffAuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, ShoppingCart, Users } from 'lucide-react';

export default function StaffDashboard() {
  const { staff, logout, hasPermission } = useStaffAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff/login');
  };

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#1a7f8c]">OrderPote</h1>
              <p className="text-sm text-gray-600">Staff Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{staff.name}</p>
                <p className="text-sm text-gray-600">{staff.role.display_name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>ထွက်မည်</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            မင်္ဂလာပါ, {staff.name}!
          </h2>
          <p className="text-gray-600">
            သင့် တာဝန်: {staff.role.display_name}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {hasPermission('orders.view') && (
            <button
              onClick={() => navigate('/orders')}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <ShoppingCart className="w-8 h-8 text-[#1a7f8c] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">အော်ဒါများ</h3>
              <p className="text-sm text-gray-600">အော်ဒါစာရင်ကို ကြည့်ရှုပါ</p>
            </button>
          )}

          {hasPermission('products.view') && (
            <button
              onClick={() => navigate('/products')}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <Package className="w-8 h-8 text-[#1a7f8c] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ပစ္စည်းများ</h3>
              <p className="text-sm text-gray-600">ပစ္စည်းစာရင်ကို ကြည့်ရှုပါ</p>
            </button>
          )}

          {hasPermission('staff.view') && (
            <button
              onClick={() => navigate('/staff-management')}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-left"
            >
              <Users className="w-8 h-8 text-[#1a7f8c] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ဝန်ထမ်းများ</h3>
              <p className="text-sm text-gray-600">ဝန်ထမ်းစာရင်ကို ကြည့်ရှုပါ</p>
            </button>
          )}
        </div>

        {/* Permissions Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">သင့် ခွင့်များ</h3>
          <div className="flex flex-wrap gap-2">
            {staff.role.permissions.includes('*') ? (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                အကုန်ခွင့်
              </span>
            ) : (
              staff.role.permissions.map((perm) => (
                <span key={perm} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {perm}
                </span>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
