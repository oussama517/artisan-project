'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  service: { name: string };
  customer: { name: string; avatar: string | null };
}

export default function ArtisanDashboardPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [metrics, setMetrics] = useState({ pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings?limit=10')
      .then((res) => res.json())
      .then((data) => {
        const bks = data.bookings || [];
        setBookings(bks);
        setMetrics({
          pending: bks.filter((b: any) => b.status === 'PENDING').length,
          active: bks.filter((b: any) => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length,
          completed: bks.filter((b: any) => b.status === 'COMPLETED').length,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      }
    } catch (err) {
      console.error('Failed to update booking:', err);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'badge-warning',
    ACCEPTED: 'badge-primary',
    IN_PROGRESS: 'badge-primary',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
            Artisan Dashboard 🔧
          </h1>
          <p style={{ color: 'var(--color-neutral-500)' }}>
            Manage your bookings and availability
          </p>
        </div>
        <Link href="/artisan/profile/edit" className="btn btn-secondary">
          Edit Profile
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-warning-500)' }}>{metrics.pending}</div>
          <div className="stat-label">Pending Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-primary-500)' }}>{metrics.active}</div>
          <div className="stat-label">Active Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success-500)' }}>{metrics.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        {[
          { icon: '📅', label: 'Bookings', href: '/artisan/dashboard/bookings' },
          { icon: '💬', label: 'Messages', href: '/dashboard/messages' },
          { icon: '⚙️', label: 'Availability', href: '/artisan/dashboard/availability' },
          { icon: '📊', label: 'Reviews', href: '/artisan/dashboard/reviews' },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="card card-hover card-body" style={{ textAlign: 'center', padding: 'var(--space-5)' }}>
            <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>{item.icon}</div>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Bookings List */}
      <div className="card">
        <div className="card-header" style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 'var(--text-lg)' }}>Recent Bookings</h3>
          <Link href="/artisan/dashboard/bookings" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div style={{ padding: '0 var(--space-6) var(--space-6)' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
              <div className="empty-state-icon">📭</div>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>No bookings yet</h3>
              <p>Complete your profile and wait for customers to find you!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {bookings.map((booking) => (
                <div key={booking.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-4)', gap: 'var(--space-4)', border: '1px solid var(--color-neutral-100)', flexWrap: 'wrap' }}>
                  <div className="avatar avatar-placeholder" style={{ width: 44, height: 44, borderRadius: '50%', fontSize: 14 }}>
                    {booking.customer.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{booking.service.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                      {booking.customer.name} · {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                    </div>
                  </div>
                  <span className={`badge ${statusColors[booking.status]}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {booking.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')} className="btn btn-primary btn-sm">Accept</button>
                        <button onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-500)' }}>Decline</button>
                      </>
                    )}
                    {booking.status === 'ACCEPTED' && (
                      <button onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')} className="btn btn-primary btn-sm">Start Work</button>
                    )}
                    {booking.status === 'IN_PROGRESS' && (
                      <button onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')} className="btn btn-primary btn-sm">Complete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
