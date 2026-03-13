'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  city: string;
  problemDescription: string;
  service: { name: string; category: { name: string } };
  artisanProfile: { user: { name: string; avatar: string | null }; profession: string };
}

const statusFilters = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  ACCEPTED: 'badge-primary',
  IN_PROGRESS: 'badge-primary',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async (status?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50' });
    if (status && status !== 'ALL') params.set('status', status);
    try {
      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(filter);
  }, [filter]);

  const cancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'CANCELLED', cancellationReason: 'Cancelled by customer' }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)));
      }
    } catch {} finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>My Bookings</h1>
        <p style={{ color: 'var(--color-neutral-500)' }}>Track and manage all your service bookings</p>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        {statusFilters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className="tag"
            style={{
              background: filter === s ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
              color: filter === s ? 'white' : 'var(--color-neutral-600)',
              cursor: 'pointer',
              border: 'none',
              padding: 'var(--space-2) var(--space-4)',
            }}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No bookings found</h3>
          <p>{filter !== 'ALL' ? `No ${filter.replace('_', ' ').toLowerCase()} bookings.` : 'You haven\'t made any bookings yet.'}</p>
          <Link href="/artisans" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Find an Artisan
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="card card-body" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div className="avatar avatar-placeholder" style={{ width: 48, height: 48, borderRadius: '50%', fontSize: 16 }}>
                  {booking.artisanProfile.user.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{booking.service.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                    {booking.artisanProfile.user.name} · {booking.artisanProfile.profession}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 4 }}>
                    📅 {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime} · 📍 {booking.city}
                  </div>
                </div>
                <span className={`badge ${statusColors[booking.status] || 'badge-neutral'}`}>
                  {booking.status.replace('_', ' ')}
                </span>
                {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-accent-500)' }}
                  >
                    {cancellingId === booking.id ? '...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
