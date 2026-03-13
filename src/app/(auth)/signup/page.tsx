'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'ARTISAN' ? 'ARTISAN' : 'CUSTOMER';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: defaultRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, msgs]: [string, any]) => {
            fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error });
        }
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div className="card-body" style={{ padding: 'var(--space-10)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>📧</div>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Check your email</h1>
            <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-6)', lineHeight: 1.7 }}>
              We sent a verification link to <strong>{formData.email}</strong>. Please click the link to verify your account.
            </p>
            <Link href="/signin" className="btn btn-primary">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 480 }}>
        <div className="card-body" style={{ padding: 'var(--space-10)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Create your account</h1>
            <p style={{ color: 'var(--color-neutral-500)' }}>Join the Artisan Marketplace community</p>
          </div>

          {errors.general && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-accent-50)', color: 'var(--color-accent-600)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }} role="alert">
              {errors.general}
            </div>
          )}

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">I want to</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              {[
                { value: 'CUSTOMER', label: '🏠 Hire artisans', desc: 'Book services' },
                { value: 'ARTISAN', label: '🔧 Offer services', desc: 'Get bookings' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: option.value })}
                  className="card"
                  style={{
                    padding: 'var(--space-4)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: formData.role === option.value ? '2px solid var(--color-primary-500)' : '2px solid var(--color-neutral-200)',
                    background: formData.role === option.value ? 'var(--color-primary-50)' : 'var(--color-neutral-0)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{option.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', marginTop: 4 }}>{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoComplete="name"
                aria-required="true"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="form-error" role="alert">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="form-error" role="alert">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby="password-requirements"
              />
              {errors.password && <p className="form-error" role="alert">{errors.password}</p>}
              <p id="password-requirements" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)', marginTop: 'var(--space-2)' }}>
                8+ characters, uppercase, lowercase, number, special character
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
