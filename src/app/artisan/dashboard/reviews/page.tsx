'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
  author: { id: string; name: string; avatar: string | null };
  booking: { service: { name: string } } | null;
}

export default function ArtisanReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Find the artisan profile
    fetch(`/api/artisans?q=${encodeURIComponent(session.user.name)}&limit=1`)
      .then((res) => res.json())
      .then((data) => {
        const artisan = data.artisans?.[0];
        if (artisan) {
          setProfileId(artisan.id);
          return fetch(`/api/reviews?artisanId=${artisan.id}&limit=50`);
        }
        throw new Error('Profile not found');
      })
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`rating-star ${i < Math.round(rating) ? 'filled' : ''}`}>★</span>
    ));

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>My Reviews</h1>
          <p style={{ color: 'var(--color-neutral-500)' }}>See what customers are saying about your work</p>
        </div>
        <Link href="/artisan/dashboard" className="btn btn-secondary btn-sm">← Dashboard</Link>
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className="grid grid-3" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="stat-card">
            <div className="stat-value">{avgRating.toFixed(1)}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{reviews.filter((r) => r.rating >= 4).length}</div>
            <div className="stat-label">5/4 Star Reviews</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Complete bookings to start receiving reviews from your customers.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reviews.map((review) => (
            <div key={review.id} className="card card-body" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div className="avatar avatar-sm avatar-placeholder" style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 13 }}>
                  {review.author.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{review.author.name}</div>
                  {review.booking?.service && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                      {review.booking.service.name}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rating">{renderStars(review.rating)}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 2 }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', lineHeight: 1.7 }}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
