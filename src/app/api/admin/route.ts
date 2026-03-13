import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ArtisanService } from '@/services/artisan.service';
import { ReviewService } from '@/services/review.service';

// GET: Admin dashboard metrics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const resource = req.nextUrl.searchParams.get('resource');

    // Dashboard metrics
    if (!resource || resource === 'metrics') {
      const [
        totalUsers,
        totalArtisans,
        pendingArtisans,
        totalBookings,
        activeBookings,
        totalReviews,
        pendingReviews,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.artisanProfile.count(),
        prisma.artisanProfile.count({ where: { approvalStatus: 'PENDING' } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } } }),
        prisma.review.count(),
        prisma.review.count({ where: { isApproved: false, moderatedAt: null } }),
      ]);

      return NextResponse.json({
        metrics: {
          totalUsers,
          totalArtisans,
          pendingArtisans,
          totalBookings,
          activeBookings,
          totalReviews,
          pendingReviews,
        },
      });
    }

    // List users
    if (resource === 'users') {
      const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
      const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
      const role = req.nextUrl.searchParams.get('role') || undefined;

      const where: any = {};
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true, name: true, email: true, role: true, emailVerified: true,
            isActive: true, createdAt: true, avatar: true,
            artisanProfile: { select: { approvalStatus: true, profession: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return NextResponse.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    }

    // Pending artisans
    if (resource === 'pending-artisans') {
      const artisans = await prisma.artisanProfile.findMany({
        where: { approvalStatus: 'PENDING' },
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({
        artisans: artisans.map((a) => ({
          ...a,
          skills: JSON.parse(a.skills || '[]'),
          portfolioImages: JSON.parse(a.portfolioImages || '[]'),
        })),
      });
    }

    // Pending reviews
    if (resource === 'pending-reviews') {
      const reviews = await prisma.review.findMany({
        where: { isApproved: false, moderatedAt: null },
        include: {
          author: { select: { id: true, name: true } },
          artisanProfile: { include: { user: { select: { name: true } } } },
          booking: { include: { service: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ reviews });
    }

    return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Admin actions
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { action, id, data } = body;

    switch (action) {
      case 'approve-artisan':
        const approvedProfile = await ArtisanService.updateApprovalStatus(id, 'APPROVED');
        return NextResponse.json({ profile: approvedProfile });

      case 'reject-artisan':
        const rejectedProfile = await ArtisanService.updateApprovalStatus(id, 'REJECTED');
        return NextResponse.json({ profile: rejectedProfile });

      case 'moderate-review':
        const review = await ReviewService.moderateReview(id, data?.approved ?? true);
        return NextResponse.json({ review });

      case 'toggle-user-active':
        const user = await prisma.user.update({
          where: { id },
          data: { isActive: data?.isActive ?? false },
        });
        return NextResponse.json({ user });

      case 'update-category':
        const category = await prisma.category.update({
          where: { id },
          data: {
            name: data.name,
            description: data.description,
            icon: data.icon,
            isActive: data.isActive,
          },
        });
        return NextResponse.json({ category });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
