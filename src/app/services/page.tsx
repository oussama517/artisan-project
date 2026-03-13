'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  services: Array<{ id: string; name: string; slug: string; description: string | null }>;
  _count: { services: number };
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => { setCategories(data.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>Our Services</h1>
        <p style={{ color: 'var(--color-neutral-500)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          Browse all available services by category. Find the right professional for your needs.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
        </div>
      ) : (
        <div className="grid grid-2 stagger" style={{ gap: 'var(--space-8)' }}>
          {categories.map((category) => (
            <div key={category.id} className="card card-hover animate-fade-in-up">
              <div className="card-body" style={{ padding: 'var(--space-8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                  <div className="category-icon" style={{ fontSize: 'var(--text-2xl)' }}>
                    {category.icon || '🔧'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 2 }}>{category.name}</h3>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                      {category._count.services} service{category._count.services !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {category.description && (
                  <p style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)', lineHeight: 1.7 }}>
                    {category.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {category.services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/artisans?category=${category.slug}`}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-neutral-50)', fontSize: 'var(--text-sm)',
                        transition: 'all var(--transition-fast)', color: 'var(--color-neutral-700)',
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--color-primary-50)'; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'var(--color-neutral-50)'; }}
                    >
                      <span>{service.name}</span>
                      <span style={{ color: 'var(--color-primary-500)' }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
