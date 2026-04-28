import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);
 
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/');
      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };
 
  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark_as_read/`);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
 
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };
 
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          padding: '8px 12px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 20,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
 
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: 300,
            maxHeight: 400,
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Notifications</strong>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    fontSize: 12,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
 
          {loading ? (
            <div style={{ padding: 12, textAlign: 'center', color: '#64748b' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 12, textAlign: 'center', color: '#64748b' }}>
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: 12,
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: notification.is_read ? 'transparent' : '#f0f9ff',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 13 }}>
                    {notification.notification_type}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    {notification.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 