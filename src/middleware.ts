import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }

    // Artisan-only routes
    if (pathname.startsWith('/artisan')) {
      if (token?.role !== 'ARTISAN' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }

    // Customer dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }

    // Booking routes
    if (pathname.startsWith('/book')) {
      if (!token) {
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        const publicRoutes = ['/', '/signin', '/signup', '/verify', '/reset-password', '/services', '/artisans'];
        if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/services/') || pathname.startsWith('/artisans/'))) {
          return true;
        }

        // API routes handle their own auth
        if (pathname.startsWith('/api')) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/artisan/:path*',
    '/admin/:path*',
    '/book/:path*',
    '/api/bookings/:path*',
    '/api/messages/:path*',
    '/api/favorites/:path*',
    '/api/notifications/:path*',
    '/api/availability/:path*',
  ],
};
