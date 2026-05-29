import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId, getLowStockVariants } from '../../lib/db';

interface LowStockVariant {
  variant_id: string;
  product_name: string;
  variant_name: string;
  stock: number;
}

export default function LowStockAlerts() {
  const { user } = useAuth();
  const [lowStockVariants, setLowStockVariants] = useState<LowStockVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLowStock() {
      if (!user) return;
      
      try {
        const store = await getStoreByUserId(user.id);
        if (store) {
          const variants = await getLowStockVariants(store.id);
          setLowStockVariants(variants);
        }
      } catch (error) {
        console.error('Error fetching low stock variants:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLowStock();
  }, [user]);

  if (isLoading) {
    return null;
  }

  if (lowStockVariants.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">လက်ကျန် နည်းပါသော ပစ္စည်းများ</h3>
            <p className="text-sm text-gray-600">ပစ္စည်း {lowStockVariants.length} မျိုး လက်ကျန် နည်းပါနေပါသည်</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {lowStockVariants.map((variant) => (
          <div key={variant.variant_id} className="bg-white rounded-lg p-4 border border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{variant.product_name}</p>
                <p className="text-sm text-gray-600">{variant.variant_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm font-medium ${variant.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    လက်ကျန်: {variant.stock} ခု
                  </span>
                </div>
              </div>
            </div>
            <a
              href="/purchase-orders/create"
              className="flex items-center gap-2 bg-[#1a7f8c] text-white px-4 py-2 rounded-lg hover:bg-[#158a96] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              PO ဆောက်ရန်
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
        <p className="text-sm text-orange-800">
          <strong>အကြံပြုချက်:</strong> ပစ္စည်းလက်ကျန် နည်းသွားခြင်းမဖြစ်စေရန် Supplier ဆီကနေ Purchase Order ဖန်တီးပြီး Stock ပြန်ဖြည့်ပါ။
        </p>
      </div>
    </div>
  );
}
