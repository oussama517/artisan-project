'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface BookingData {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  city: string;
  address: string;
  problemDescription: string;
  service: { name: string };
  customer: { name: string; avatar: string | null; email: string };
}

const statusFilters = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING: 'badge-warning',
  ACCEPTED: 'badge-primary',
  IN_PROGRESS: 'badge-primary',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
};

export default function ArtisanBookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      }
    } catch {} finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Manage Bookings</h1>
          <p style={{ color: 'var(--color-neutral-500)' }}>Accept, manage, and complete your service bookings</p>
        </div>
        <Link href="/artisan/dashboard" className="btn btn-secondary btn-sm">← Dashboard</Link>
      </div>

      {/* Status Filter */}
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

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No bookings found</h3>
          <p>{filter !== 'ALL' ? `No ${filter.replace('_', ' ').toLowerCase()} bookings.` : 'No bookings yet. Make sure your profile is complete and available!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="card card-body" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div className="avatar avatar-placeholder" style={{ width: 48, height: 48, borderRadius: '50%', fontSize: 16 }}>
                  {booking.customer.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{booking.service.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{booking.customer.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 4 }}>
                    📅 {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime} · 📍 {booking.city}
                  </div>
                  {booking.problemDescription && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 4, fontStyle: 'italic' }}>
                      &quot;{booking.problemDescription}&quot;
                    </div>
                  )}
                </div>
                <span className={`badge ${statusColors[booking.status]}`}>{booking.status.replace('_', ' ')}</span>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {booking.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(booking.id, 'ACCEPTED')} disabled={updatingId === booking.id} className="btn btn-primary btn-sm">Accept</button>
                      <button onClick={() => updateStatus(booking.id, 'CANCELLED')} disabled={updatingId === booking.id} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-500)' }}>Decline</button>
                    </>
                  )}
                  {booking.status === 'ACCEPTED' && (
                    <button onClick={() => updateStatus(booking.id, 'IN_PROGRESS')} disabled={updatingId === booking.id} className="btn btn-primary btn-sm">Start Work</button>
                  )}
                  {booking.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateStatus(booking.id, 'COMPLETED')} disabled={updatingId === booking.id} className="btn btn-primary btn-sm">Complete</button>
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
