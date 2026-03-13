'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Artisan {
  id: string;
  profession: string;
  description: string;
  yearsExperience: number;
  serviceArea: string;
  skills: string[];
  avgRating: number;
  totalReviews: number;
  isAvailable: boolean;
  user: { id: string; name: string; avatar: string | null };
  services: Array<{ service: { name: string; category: { name: string } } }>;
}

export default function ArtisansPage() {
  const searchParams = useSearchParams();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const fetchArtisans = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    params.set('sortBy', sortBy);
    params.set('page', String(page));

    try {
      const res = await fetch(`/api/artisans?${params}`);
      const data = await res.json();
      setArtisans(data.artisans || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 0 });
    } catch {
      setArtisans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisans();
  }, [sortBy, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtisans(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`rating-star ${i < Math.round(rating) ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>
          Find an Artisan
        </h1>
        <p style={{ color: 'var(--color-neutral-500)' }}>
          Browse verified professionals in your area
        </p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="card card-body" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by service, skill, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 2, minWidth: 200 }}
            aria-label="Search artisans"
            id="artisan-search"
          />
          <input
            type="text"
            className="form-input"
            placeholder="City or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ flex: 1, minWidth: 150 }}
            aria-label="Location"
            id="artisan-location"
          />
          <select
            className="form-input form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ flex: 0, minWidth: 160 }}
            aria-label="Sort by"
            id="artisan-sort"
          >
            <option value="rating">Highest Rated</option>
            <option value="experience">Most Experienced</option>
            <option value="reviews">Most Reviews</option>
            <option value="newest">Newest</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
          {['', 'plumbing', 'electrical', 'carpentry', 'painting', 'ac-repair'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`tag ${category === cat ? '' : ''}`}
              style={{
                background: category === cat ? 'var(--color-primary-500)' : 'var(--color-neutral-100)',
                color: category === cat ? 'white' : 'var(--color-neutral-600)',
                cursor: 'pointer',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
              }}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : artisans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No artisans found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            {pagination.total} artisan{pagination.total !== 1 ? 's' : ''} found
          </p>

          <div className="grid grid-3 stagger">
            {artisans.map((artisan) => (
              <Link href={`/artisans/${artisan.id}`} key={artisan.id} className="artisan-card animate-fade-in-up">
                <div className="artisan-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="avatar avatar-xl avatar-placeholder" style={{ fontSize: 'var(--text-2xl)' }}>
                    {artisan.user.name.charAt(0)}
                  </div>
                  {artisan.isAvailable && (
                    <span className="artisan-card-badge badge badge-success">Available Today</span>
                  )}
                </div>
                <div className="artisan-card-body">
                  <div className="artisan-card-name">{artisan.user.name}</div>
                  <div className="artisan-card-profession">{artisan.profession}</div>
                  <div className="rating" style={{ marginBottom: 'var(--space-3)' }}>
                    {renderStars(artisan.avgRating)}
                    <span className="rating-value">{artisan.avgRating.toFixed(1)}</span>
                    <span style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)', marginLeft: 4 }}>
                      ({artisan.totalReviews})
                    </span>
                  </div>
                  <div className="artisan-card-meta">
                    <span>📍 {artisan.serviceArea}</span>
                    <span>🔨 {artisan.yearsExperience}y exp</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                    {artisan.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                    {artisan.skills.length > 3 && (
                      <span className="tag">+{artisan.skills.length - 3}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-8)' }}>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchArtisans(i + 1)}
                  className={`btn ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
