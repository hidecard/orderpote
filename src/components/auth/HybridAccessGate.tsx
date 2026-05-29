import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { Navigate, Link } from 'react-router-dom';

interface HybridAccessGateProps {
  children: ReactNode;
  requiredPermissions?: string[];
  sellerOnly?: boolean;
}

export default function HybridAccessGate({ children, requiredPermissions = [], sellerOnly = false }: HybridAccessGateProps) {
  const { user, isLoading: sellerLoading } = useAuth();
  const { staff, isLoading: staffLoading, hasPermission } = useStaffAuth();

  if (sellerLoading || staffLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If sellerOnly is true, only allow sellers
  if (sellerOnly) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
  }

  // Allow either seller or staff
  if (user) {
    return children;
  }

  if (staff) {
    console.log('HybridAccessGate - staff logged in:', staff.name);
    console.log('HybridAccessGate - required permissions:', requiredPermissions);
    console.log('HybridAccessGate - staff permissions:', staff.role.permissions);
    
    // Check if staff has required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(perm => {
        const hasPerm = hasPermission(perm);
        console.log(`Checking permission ${perm}: ${hasPerm}`);
        return hasPerm;
      });
      
      console.log('Has all permissions:', hasAllPermissions);
      
      if (!hasAllPermissions) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                သင့်တွင် ဤစာမျက်နှာကို ဝင်ရောက်ခွင့် မရှိပါ
              </div>
              <Link
                to="/dashboard"
                className="text-[#1a7f8c] hover:underline"
              >
                Dashboard သို့ ပြန်သွားမည်
              </Link>
            </div>
          </div>
        );
      }
    }
    console.log('Access granted to staff');
    return children;
  }

  // Neither seller nor staff logged in
  return <Navigate to="/login" replace />;
}
