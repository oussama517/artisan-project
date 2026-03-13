'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (city) params.set('location', city);
    router.push(`/artisans?${params.toString()}`);
  };

  return (
    <form className="search-bar" role="search" aria-label="Search for services" onSubmit={handleSearch}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-neutral-400)', flexShrink: 0, marginLeft: 8 }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="What service do you need?"
        aria-label="Search services"
        id="hero-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="search-divider" />
      <input
        type="text"
        placeholder="Your city"
        aria-label="City"
        id="hero-location"
        style={{ maxWidth: 160 }}
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        Find Artisans
      </button>
    </form>
  );
}
