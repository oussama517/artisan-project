'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface ArtisanProfile {
  id: string;
  profession: string;
  description: string;
  yearsExperience: number;
  serviceArea: string;
  skills: string[];
  avgRating: number;
  totalReviews: number;
  isAvailable: boolean;
  portfolioImages: string[];
  user: { id: string; name: string; avatar: string | null; createdAt: string };
  services: Array<{ service: { id: string; name: string; category: { name: string } } }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    author: { id: string; name: string; avatar: string | null };
  }>;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isBlocked: boolean;
  }>;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ArtisanDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [artisan, setArtisan] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    fetch(`/api/artisans/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Artisan not found');
        return res.json();
      })
      .then((data) => {
        setArtisan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  // Check favorite status
  useEffect(() => {
    if (!session?.user || !artisan) return;
    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data) => {
        const favs = data.favorites || [];
        setFavorited(favs.some((f: any) => f.artisanProfileId === artisan.id));
      })
      .catch(() => {});
  }, [session, artisan]);

  const toggleFavorite = async () => {
    if (!session?.user || !artisan) return;
    setTogglingFav(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artisanProfileId: artisan.id }),
      });
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {} finally {
      setTogglingFav(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !artisan || !messageText.trim()) return;
    setSendingMsg(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: artisan.user.id, content: messageText.trim() }),
      });
      setMsgSent(true);
      setMessageText('');
    } catch {} finally {
      setSendingMsg(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`rating-star ${i < Math.round(rating) ? 'filled' : ''}`}>★</span>
    ));

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) var(--space-6)', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h2>Artisan Not Found</h2>
          <p>{error || 'This artisan profile does not exist.'}</p>
          <Link href="/artisans" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
            Browse Artisans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
        <Link href="/artisans" style={{ color: 'var(--color-primary-500)' }}>← Back to Artisans</Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)', alignItems: 'start' }}>
        {/* ─── Main Content ─── */}
        <div>
          {/* Profile Header */}
          <div className="card card-body" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <div className="avatar avatar-xl avatar-placeholder" style={{ fontSize: 'var(--text-2xl)', width: 80, height: 80 }}>
                {artisan.user.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>{artisan.user.name}</h1>
                <p style={{ color: 'var(--color-primary-600)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{artisan.profession}</p>
                <div className="rating" style={{ marginBottom: 'var(--space-2)' }}>
                  {renderStars(artisan.avgRating)}
                  <span className="rating-value">{artisan.avgRating.toFixed(1)}</span>
                  <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)' }}>
                    ({artisan.totalReviews} reviews)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                  <span>📍 {artisan.serviceArea}</span>
                  <span>🔨 {artisan.yearsExperience} years experience</span>
                  {artisan.isAvailable && <span className="badge badge-success">Available</span>}
                </div>
              </div>
            </div>
            <p style={{ lineHeight: 1.8, color: 'var(--color-neutral-600)' }}>{artisan.description}</p>
          </div>

          {/* Skills */}
          <div className="card card-body" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Skills & Expertise</h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {artisan.skills.map((skill) => (
                <span key={skill} className="tag" style={{ padding: 'var(--space-2) var(--space-4)' }}>{skill}</span>
              ))}
            </div>
          </div>

          {/* Services */}
          {artisan.services.length > 0 && (
            <div className="card card-body" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Services Offered</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {artisan.services.map((s) => (
                  <div key={s.service.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontWeight: 600 }}>{s.service.name}</span>
                    <span className="tag">{s.service.category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {artisan.availability.length > 0 && (
            <div className="card card-body" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Weekly Availability</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {artisan.availability.filter((a) => !a.isBlocked).map((slot, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontWeight: 600 }}>{dayNames[slot.dayOfWeek]}</span>
                    <span style={{ color: 'var(--color-neutral-500)' }}>{slot.startTime} – {slot.endTime}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card card-body" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Reviews ({artisan.totalReviews})
            </h3>
            {artisan.reviews.length === 0 ? (
              <p style={{ color: 'var(--color-neutral-500)', textAlign: 'center', padding: 'var(--space-6)' }}>No reviews yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {artisan.reviews.map((review) => (
                  <div key={review.id} style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div className="avatar avatar-sm avatar-placeholder" style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 12 }}>
                        {review.author.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{review.author.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="rating">{renderStars(review.rating)}</div>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)', lineHeight: 1.7 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Sidebar ─── */}
        <div style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-6))' }}>
          {/* Actions Card */}
          <div className="card card-body" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Contact</h3>

            {session?.user ? (
              <>
                <button
                  onClick={toggleFavorite}
                  disabled={togglingFav}
                  className={`btn ${favorited ? 'btn-secondary' : 'btn-ghost'} btn-lg`}
                  style={{ width: '100%', marginBottom: 'var(--space-3)' }}
                >
                  {favorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
                </button>

                {/* Send Message */}
                {!msgSent ? (
                  <form onSubmit={sendMessage} style={{ marginTop: 'var(--space-3)' }}>
                    <textarea
                      className="form-input"
                      placeholder="Send a message to this artisan..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={3}
                      style={{ resize: 'vertical', marginBottom: 'var(--space-3)' }}
                    />
                    <button type="submit" className="btn btn-primary btn-lg" disabled={sendingMsg || !messageText.trim()} style={{ width: '100%' }}>
                      {sendingMsg ? <span className="spinner" style={{ width: 20, height: 20 }} /> : '💬 Send Message'}
                    </button>
                  </form>
                ) : (
                  <div className="toast toast-success" style={{ position: 'relative', animation: 'none', marginTop: 'var(--space-3)' }}>
                    ✓ Message sent! Check your <Link href="/dashboard/messages" style={{ fontWeight: 600, textDecoration: 'underline' }}>Messages</Link>.
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  Sign in to contact this artisan.
                </p>
                <Link href="/signin" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="card card-body" style={{ padding: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-500)' }}>Member since</span>
                <span style={{ fontWeight: 600 }}>{new Date(artisan.user.createdAt).getFullYear()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-500)' }}>Experience</span>
                <span style={{ fontWeight: 600 }}>{artisan.yearsExperience} years</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-500)' }}>Service area</span>
                <span style={{ fontWeight: 600 }}>{artisan.serviceArea}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-neutral-500)' }}>Rating</span>
                <span style={{ fontWeight: 600 }}>{artisan.avgRating.toFixed(1)} / 5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
