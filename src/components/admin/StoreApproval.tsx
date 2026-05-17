import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Store, Clock, AlertCircle } from 'lucide-react';
import type { Store } from '../../lib/schema';
import { getPendingStores, updateStoreApprovalStatus } from '../../lib/db';

export default function StoreApproval() {
  const [pendingStores, setPendingStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingStores();
  }, []);

  const fetchPendingStores = async () => {
    try {
      const stores = await getPendingStores();
      setPendingStores(stores);
    } catch (error) {
      console.error('Error fetching pending stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (storeId: string) => {
    setProcessingId(storeId);
    try {
      await updateStoreApprovalStatus(storeId, 'approved');
      setPendingStores(pendingStores.filter(s => s.id !== storeId));
    } catch (error) {
      console.error('Error approving store:', error);
      alert('Failed to approve store');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectDialog || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessingId(showRejectDialog);
    try {
      await updateStoreApprovalStatus(showRejectDialog, 'rejected', rejectionReason);
      setPendingStores(pendingStores.filter(s => s.id !== showRejectDialog));
      setShowRejectDialog(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting store:', error);
      alert('Failed to reject store');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Approvals</h1>
        <p className="text-gray-600">Review and approve or reject seller applications</p>
      </div>

      {pendingStores.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Pending Approvals</h2>
          <p className="text-gray-500">All store applications have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingStores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                    <Store className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-gray-600">Phone: {store.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied: {new Date(store.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(store.id)}
                    disabled={processingId === store.id}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processingId === store.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => setShowRejectDialog(store.id)}
                    disabled={processingId === store.id}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>

              {showRejectDialog === store.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      Please provide a reason for rejection. This will be sent to the seller.
                    </p>
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Incomplete information, invalid phone number, etc."
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleReject}
                      disabled={processingId === store.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectDialog(null);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
