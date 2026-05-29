import type { ReactNode } from 'react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { useNavigate } from 'react-router-dom';

interface StaffAccessGateProps {
  children: ReactNode;
  requiredPermissions?: string[];
}

export default function StaffAccessGate({ children, requiredPermissions = [] }: StaffAccessGateProps) {
  const { staff, isLoading, hasPermission } = useStaffAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a7f8c]"></div>
      </div>
    );
  }

  if (!staff) {
    navigate('/staff/login');
    return null;
  }

  if (!staff.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">အကောင့် ပိတ်ထားပါသည်</h1>
          <p className="text-gray-600">သင့်အကောင့်ကို ယာယီပိတ်ထားပါသည်။ ဆိုင်ပိုင်ရှင်ကို ဆက်သွယ်ပါ။</p>
        </div>
      </div>
    );
  }

  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ခွင့်မရှိပါ</h1>
            <p className="text-gray-600">ဤစာမျက်နှာကို ကြည့်ရှုခွင့် မရှိပါ။</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
