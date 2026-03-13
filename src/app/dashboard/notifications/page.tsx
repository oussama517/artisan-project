'use client';

import { useEffect, useState } from 'react';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {} finally {
      setMarkingAll(false);
    }
  };

  const markRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const typeIcons: Record<string, string> = {
    BOOKING_REQUEST: '📅',
    BOOKING_CONFIRMED: '✅',
    BOOKING_CANCELLED: '❌',
    BOOKING_COMPLETED: '🎉',
    NEW_REVIEW: '⭐',
    NEW_MESSAGE: '💬',
    ARTISAN_APPROVED: '🛡️',
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Notifications</h1>
          <p style={{ color: 'var(--color-neutral-500)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={markingAll} className="btn btn-secondary btn-sm">
            {markingAll ? '...' : 'Mark all read'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>No notifications</h3>
          <p>You&apos;re all caught up! Notifications will appear here when something happens.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markRead([notif.id])}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) var(--space-5)',
                cursor: notif.isRead ? 'default' : 'pointer',
                background: notif.isRead ? 'var(--color-neutral-0)' : 'var(--color-primary-50)',
                border: notif.isRead ? '1px solid var(--color-neutral-100)' : '1px solid var(--color-primary-200)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ fontSize: '24px', flexShrink: 0 }}>
                {typeIcons[notif.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: notif.isRead ? 400 : 600, fontSize: 'var(--text-sm)' }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 2 }}>
                  {notif.body}
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', flexShrink: 0 }}>
                {new Date(notif.createdAt).toLocaleDateString()}
              </div>
              {!notif.isRead && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary-500)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
