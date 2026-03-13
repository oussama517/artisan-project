'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FavoriteData {
  id: string;
  artisanProfileId: string;
  artisanProfile: {
    id: string;
    profession: string;
    avgRating: number;
    totalReviews: number;
    serviceArea: string;
    user: { id: string; name: string; avatar: string | null };
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data.favorites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const removeFavorite = async (artisanProfileId: string) => {
    setRemovingId(artisanProfileId);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artisanProfileId }),
      });
      setFavorites((prev) => prev.filter((f) => f.artisanProfileId !== artisanProfileId));
    } catch {} finally {
      setRemovingId(null);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`rating-star ${i < Math.round(rating) ? 'filled' : ''}`}>★</span>
    ));

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>My Favorites</h1>
      <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-6)' }}>Artisans you&apos;ve saved for later</p>

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❤️</div>
          <h3>No favorites yet</h3>
          <p>Browse artisans and add your favorites to find them quickly later.</p>
          <Link href="/artisans" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Browse Artisans
          </Link>
        </div>
      ) : (
        <div className="grid grid-3 stagger">
          {favorites.map((fav) => (
            <div key={fav.id} className="card card-hover animate-fade-in-up">
              <div className="card-body" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                  <div className="avatar avatar-placeholder" style={{ width: 48, height: 48, borderRadius: '50%', fontSize: 16 }}>
                    {fav.artisanProfile.user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{fav.artisanProfile.user.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)' }}>{fav.artisanProfile.profession}</div>
                  </div>
                </div>
                <div className="rating" style={{ marginBottom: 'var(--space-3)' }}>
                  {renderStars(fav.artisanProfile.avgRating)}
                  <span className="rating-value">{fav.artisanProfile.avgRating.toFixed(1)}</span>
                  <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>
                    ({fav.artisanProfile.totalReviews})
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', marginBottom: 'var(--space-4)' }}>
                  📍 {fav.artisanProfile.serviceArea}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Link href={`/artisans/${fav.artisanProfile.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    View Profile
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.artisanProfileId)}
                    disabled={removingId === fav.artisanProfileId}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-accent-500)' }}
                  >
                    {removingId === fav.artisanProfileId ? '...' : '✕'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
