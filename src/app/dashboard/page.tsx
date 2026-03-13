'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  service: { name: string; category: { name: string } };
  artisanProfile: { user: { name: string; avatar: string | null }; profession: string };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings?limit=5')
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    PENDING: 'badge-warning',
    ACCEPTED: 'badge-primary',
    IN_PROGRESS: 'badge-primary',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  const isArtisan = session?.user?.role === 'ARTISAN';

  if (isArtisan) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card card-body animate-fade-in-up" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Artisan Dashboard</h2>
          <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-6)' }}>
            Manage your bookings, availability, and profile from the artisan panel.
          </p>
          <Link href="/artisan/dashboard" className="btn btn-primary btn-lg">
            Go to Artisan Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
          Welcome back, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--color-neutral-500)' }}>
          Here&apos;s what&apos;s happening with your bookings.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { icon: '🔍', label: 'Find Artisans', href: '/artisans', color: 'var(--color-primary-50)' },
          { icon: '📅', label: 'My Bookings', href: '/dashboard/bookings', color: 'var(--color-success-50)' },
          { icon: '💬', label: 'Messages', href: '/dashboard/messages', color: 'var(--color-warning-50)' },
          { icon: '❤️', label: 'Favorites', href: '/dashboard/favorites', color: 'var(--color-accent-50)' },
        ].map((action) => (
          <Link href={action.href} key={action.label} className="card card-hover card-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <div style={{ fontSize: '28px', marginBottom: 'var(--space-3)' }}>{action.icon}</div>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)' }}>Recent Bookings</h3>
          <Link href="/dashboard/bookings" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div style={{ padding: '0 var(--space-6) var(--space-6)' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <div className="empty-state-icon">📅</div>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>No bookings yet</h3>
              <p>Find an artisan and book your first service!</p>
              <Link href="/artisans" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                Browse Artisans
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {bookings.map((booking) => (
                <div key={booking.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-4)', gap: 'var(--space-4)', border: '1px solid var(--color-neutral-100)' }}>
                  <div className="avatar avatar-placeholder" style={{ width: 44, height: 44, borderRadius: '50%', fontSize: 14 }}>
                    {booking.artisanProfile.user.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{booking.service.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                      {booking.artisanProfile.user.name} · {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                    </div>
                  </div>
                  <span className={`badge ${statusColors[booking.status] || 'badge-neutral'}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
