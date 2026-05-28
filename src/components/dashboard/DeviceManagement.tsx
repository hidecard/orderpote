import { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Clock, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoreByUserId, getDevicesByStoreId, getDeviceUsageByDeviceId } from '../../lib/db';
import type { Device as DeviceType, DeviceUsage } from '../../lib/schema';

export default function DeviceManagement() {
  const { user } = useAuth();
  const [deviceList, setDeviceList] = useState<DeviceType[]>([]);
  const [deviceUsageMap, setDeviceUsageMap] = useState<Record<string, DeviceUsage[]>>({});
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const storeData = await getStoreByUserId(user.id);
        if (storeData) {
          const devices = await getDevicesByStoreId(storeData.id);
          setDeviceList(devices);

          // Fetch usage history for each device
          const usageMap: Record<string, DeviceUsage[]> = {};
          for (const device of devices) {
            const usage = await getDeviceUsageByDeviceId(device.id);
            usageMap[device.id] = usage;
          }
          setDeviceUsageMap(usageMap);
        }
      } catch (err) {
        console.error('Error fetching devices:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleDeviceExpansion = (deviceId: string) => {
    const newExpanded = new Set(expandedDevices);
    if (newExpanded.has(deviceId)) {
      newExpanded.delete(deviceId);
    } else {
      newExpanded.add(deviceId);
    }
    setExpandedDevices(newExpanded);
  };

  if (isLoading && deviceList.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
          <p className="text-gray-600">View devices accessing your store and login history</p>
        </div>
      </div>

 

      {/* Device List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {deviceList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No devices registered yet. Devices will be automatically tracked when you log in.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deviceList.map((device) => (
                <>
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getDeviceIcon(device.device_type)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{device.device_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{device.device_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 font-mono">{device.device_identifier}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatLastActive(device.last_active)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(device.status)}`}>
                        {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleDeviceExpansion(device.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {expandedDevices.has(device.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {expandedDevices.has(device.id) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Login History
                          </h4>
                          {deviceUsageMap[device.id] && deviceUsageMap[device.id].length > 0 ? (
                            <div className="space-y-2">
                              {deviceUsageMap[device.id].map((usage) => (
                                <div key={usage.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-medium text-gray-900">User ID: {usage.user_id}</p>
                                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                            {usage.account_type.charAt(0).toUpperCase() + usage.account_type.slice(1)}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-500">Login: {formatDateTime(usage.login_time)}</p>
                                        {usage.logout_time && (
                                          <p className="text-xs text-gray-500">Logout: {formatDateTime(usage.logout_time)}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      {usage.logout_time ? (
                                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                          Session Ended
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No login history available</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
