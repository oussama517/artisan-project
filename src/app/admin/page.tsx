'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Metrics {
  totalUsers: number;
  totalArtisans: number;
  pendingArtisans: number;
  totalBookings: number;
  activeBookings: number;
  totalReviews: number;
  pendingReviews: number;
}

interface PendingArtisan {
  id: string;
  profession: string;
  description: string;
  yearsExperience: number;
  serviceArea: string;
  skills: string[];
  user: { name: string; email: string };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: { name: string };
  artisanProfile: { user: { name: string } };
  booking: { service: { name: string } };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [pendingArtisans, setPendingArtisans] = useState<PendingArtisan[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'artisans' | 'reviews'>('overview');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [mRes, aRes, rRes] = await Promise.all([
          fetch('/api/admin?resource=metrics'),
          fetch('/api/admin?resource=pending-artisans'),
          fetch('/api/admin?resource=pending-reviews'),
        ]);

        if (!mRes.ok || !aRes.ok || !rRes.ok) throw new Error('Failed to fetch dashboard data');

        const [mReq, aReq, rReq] = await Promise.all([mRes.json(), aRes.json(), rRes.json()]);
        
        setMetrics(mReq.metrics);
        setPendingArtisans(aReq.artisans || []);
        setPendingReviews(rReq.reviews || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  const handleArtisanAction = async (profileId: string, action: 'approve-artisan' | 'reject-artisan') => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: profileId }),
      });
      if (!res.ok) throw new Error('Action failed');
      
      setPendingArtisans((prev: PendingArtisan[]) => prev.filter(a => a.id !== profileId));
      if (metrics) {
        setMetrics({ 
          ...metrics, 
          pendingArtisans: metrics.pendingArtisans - 1,
          totalArtisans: action === 'approve-artisan' ? metrics.totalArtisans + 1 : metrics.totalArtisans 
        });
      }
    } catch (err) {
      alert('Failed to process artisan action');
    }
  };

  const handleReviewAction = async (reviewId: string, approved: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderate-review', id: reviewId, data: { approved } }),
      });
      if (!res.ok) throw new Error('Action failed');

      setPendingReviews((prev: Review[]) => prev.filter(r => r.id !== reviewId));
      if (metrics) {
        setMetrics({ ...metrics, pendingReviews: metrics.pendingReviews - 1, totalReviews: approved ? metrics.totalReviews + 1 : metrics.totalReviews });
      }
    } catch (err) {
      alert('Failed to process review moderation');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-8)' }}>
        <div className="skeleton skeleton-title" />
        <div className="grid grid-4" style={{ marginTop: 'var(--space-6)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Admin Dashboard</h1>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-8)' }}>Manage users, artisans, reviews, and platform settings</p>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { label: 'Total Users', value: metrics.totalUsers, color: 'var(--color-primary-500)' },
            { label: 'Pending Artisans', value: metrics.pendingArtisans, color: 'var(--color-warning-500)' },
            { label: 'Active Bookings', value: metrics.activeBookings, color: 'var(--color-success-500)' },
            { label: 'Pending Reviews', value: metrics.pendingReviews, color: 'var(--color-accent-500)' },
          ].map(m => (
            <div key={m.label} className="stat-card">
              <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
              <div className="stat-label">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)', borderBottom: '2px solid var(--color-neutral-100)', paddingBottom: 'var(--space-1)' }}>
        {['overview', 'artisans', 'reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className="btn btn-ghost"
            style={{
              borderBottom: activeTab === tab ? '2px solid var(--color-primary-500)' : 'none',
              color: activeTab === tab ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
              fontWeight: activeTab === tab ? 600 : 400,
              borderRadius: 0,
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Pending Artisans */}
      {activeTab === 'artisans' && (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Pending Approvals ({pendingArtisans.length})</h3>
          {pendingArtisans.length === 0 ? (
            <div className="empty-state card card-body" style={{ padding: 'var(--space-12)' }}>
              <div className="empty-state-icon">✅</div>
              <h3>All caught up!</h3>
              <p>No pending artisan approvals</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {pendingArtisans.map((artisan: PendingArtisan) => (
                <div key={artisan.id} className="card card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
                  <div className="avatar avatar-lg avatar-placeholder" style={{ fontSize: 'var(--text-lg)' }}>
                    {artisan.user.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>{artisan.user.name}</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{artisan.user.email}</p>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary-600)' }}>{artisan.profession}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: 'var(--space-2)' }}>{artisan.description.substring(0, 150)}...</p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                      <span>📍 {artisan.serviceArea}</span>
                      <span>🔨 {artisan.yearsExperience} years</span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                      {artisan.skills.slice(0, 5).map((skill: string) => <span key={skill} className="tag">{skill}</span>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignSelf: 'center' }}>
                    <button onClick={() => handleArtisanAction(artisan.id, 'approve-artisan')} className="btn btn-primary btn-sm">✓ Approve</button>
                    <button onClick={() => handleArtisanAction(artisan.id, 'reject-artisan')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-500)' }}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Reviews */}
      {activeTab === 'reviews' && (
        <div className="animate-fade-in-up">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Pending Reviews ({pendingReviews.length})</h3>
          {pendingReviews.length === 0 ? (
            <div className="empty-state card card-body" style={{ padding: 'var(--space-12)' }}>
              <div className="empty-state-icon">⭐</div>
              <h3>All caught up!</h3>
              <p>No reviews awaiting moderation</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {pendingReviews.map((review: Review) => (
                <div key={review.id} className="card card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
                  <div className="avatar avatar-placeholder" style={{ borderRadius: 'var(--radius-lg)' }}>
                    {review.rating}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)' }}>{review.author.name} reviewed {review.artisanProfile.user.name}</h4>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', marginBottom: 'var(--space-1)' }}>Service: {review.booking.service.name}</p>
                    <p style={{ fontStyle: 'italic', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', marginTop: 'var(--space-2)' }}>"{review.comment}"</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignSelf: 'center' }}>
                    <button onClick={() => handleReviewAction(review.id, true)} className="btn btn-primary btn-sm">✓ Approve</button>
                    <button onClick={() => handleReviewAction(review.id, false)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent-500)' }}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'overview' && metrics && (
        <div className="grid grid-2 animate-fade-in-up" style={{ gap: 'var(--space-6)' }}>
          <div className="card card-body">
            <h4 style={{ marginBottom: 'var(--space-4)' }}>Platform Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Total Users', value: metrics.totalUsers },
                { label: 'Total Artisans', value: metrics.totalArtisans },
                { label: 'Total Bookings', value: metrics.totalBookings },
                { label: 'Total Reviews', value: metrics.totalReviews },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <span style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)' }}>{item.label}</span>
                  <span style={{ fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-body">
            <h4 style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button 
                onClick={() => setActiveTab('artisans')} 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: 'var(--space-4)', border: '1px solid var(--color-warning-100)', background: 'var(--color-warning-50)' }}
              >
                👤 Review Pending Artisans ({metrics.pendingArtisans})
              </button>
              <button 
                onClick={() => setActiveTab('reviews')} 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', padding: 'var(--space-4)', border: '1px solid var(--color-accent-100)', background: 'var(--color-accent-50)' }}
              >
                ⭐ Moderate Reviews ({metrics.pendingReviews})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
