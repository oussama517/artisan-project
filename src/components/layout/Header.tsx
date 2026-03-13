'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!session?.user) return '/signin';
    switch (session.user.role) {
      case 'ADMIN': return '/admin';
      case 'ARTISAN': return '/artisan/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <header className="header" style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'none' }}>
      <div className="header-inner">
        <Link href="/" className="header-logo" aria-label="Artisan Marketplace Home">
          ⚒ Artisan
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/services" className="header-link">Services</Link>
          <Link href="/artisans" className="header-link">Artisans</Link>

          {session?.user ? (
            <>
              <Link href={getDashboardLink()} className="header-link">
                Dashboard
              </Link>
              <Link href="/dashboard/messages" className="header-link">
                Messages
              </Link>
              <NotificationBell />
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginLeft: 'var(--space-2)' }}>
                <div
                  className="avatar avatar-sm avatar-placeholder"
                  style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 12 }}
                >
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn btn-ghost btn-sm"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/signin" className="header-link">Sign In</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          style={{ display: 'none' }}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <Link href="/dashboard/notifications" className="header-link notification-bell" aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}>
      🔔
      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
    </Link>
  );
}
