import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsByUserId, markNotificationAsRead, markAllNotificationsAsRead } from '../../lib/db';
import type { Notification } from '../../lib/schema';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      setIsLoading(true);
      try {
        const result = await getNotificationsByUserId(user.id);
        setNotifications(result);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();
  }, [user]);

  const handleMarkRead = async (notificationId: string) => {
    setIsUpdating(true);
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const buildLink = (notification: Notification) => {
    if (!notification.related_id) return '';
    if (notification.type === 'new_order') {
      return `/orders/${notification.related_id}`;
    }
    return `/products/edit/${notification.related_id}`;
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Please log in to view notifications.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Your latest notifications from orders, products, and inventory.</p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={isUpdating || notifications.length === 0}
          className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-5 shadow-sm transition ${
                notification.is_read ? 'border-gray-200 bg-white' : 'border-purple-200 bg-purple-50'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">
                      {notification.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-gray-900">{notification.title}</h2>
                  <p className="mt-2 text-gray-700">{notification.message}</p>
                </div>
                <div className="flex gap-2">
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={isUpdating}
                      className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-purple-600 ring-1 ring-purple-200 hover:bg-purple-50"
                    >
                      Mark read
                    </button>
                  )}
                  {buildLink(notification) && (
                    <a
                      href={buildLink(notification)}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
