'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 440 }}>
        <div className="card-body" style={{ padding: 'var(--space-10)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Welcome back</h1>
            <p style={{ color: 'var(--color-neutral-500)' }}>Sign in to your account</p>
          </div>

          {verified && (
            <div className="toast toast-success" style={{ position: 'relative', marginBottom: 'var(--space-6)', animation: 'none' }}>
              ✓ Email verified successfully! You can now sign in.
            </div>
          )}

          {error && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--color-accent-50)', color: 'var(--color-accent-600)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" className="form-label">Password</label>
                <Link href="/reset-password" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-500)' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ fontWeight: 600, color: 'var(--color-primary-600)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
