import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId } from '../../lib/db';
import type { Store as StoreRecord } from '../../lib/schema';

export default function SellerPending() {
  const { user, logout } = useAuth();
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const currentStore = await getStoreByUserId(user.id);
      if (!currentStore) {
        window.location.href = '/become-seller';
        return;
      }

      if (currentStore.approval_status === 'approved') {
        window.location.href = '/dashboard';
        return;
      }

      setStore(currentStore);
      setIsLoading(false);
    }

    fetchStore();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isRejected = store?.approval_status === 'rejected';
  const Icon = isRejected ? AlertCircle : Clock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isRejected ? 'bg-red-100' : 'bg-yellow-100'}`}>
            <Icon className={`w-8 h-8 ${isRejected ? 'text-red-600' : 'text-yellow-600'}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isRejected ? 'Shop Application Rejected' : 'Shop Application Pending'}
          </h1>
          <p className="text-gray-600">
            {isRejected ? 'Please review the reason and contact support.' : 'Admin approval is required before opening your dashboard.'}
          </p>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{store?.name}</h2>
              <p className="text-gray-600">Phone: {store?.phone}</p>
              <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
                {isRejected ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-yellow-600" />
                )}
                <span className={isRejected ? 'text-red-700' : 'text-yellow-700'}>
                  {isRejected ? 'Rejected' : 'Waiting for admin approval'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isRejected && store?.rejection_reason && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {store.rejection_reason}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Check Status
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
