import prisma from '@/lib/prisma';

export class ArtisanService {
  /**
   * Create or update an artisan profile
   */
  static async upsertProfile(
    userId: string,
    data: {
      profession: string;
      description: string;
      yearsExperience: number;
      serviceArea: string;
      skills: string[];
      latitude?: number;
      longitude?: number;
    }
  ) {
    return prisma.artisanProfile.upsert({
      where: { userId },
      create: {
        userId,
        profession: data.profession,
        description: data.description,
        yearsExperience: data.yearsExperience,
        serviceArea: data.serviceArea,
        skills: JSON.stringify(data.skills),
        portfolioImages: '[]',
        latitude: data.latitude,
        longitude: data.longitude,
      },
      update: {
        profession: data.profession,
        description: data.description,
        yearsExperience: data.yearsExperience,
        serviceArea: data.serviceArea,
        skills: JSON.stringify(data.skills),
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  /**
   * Search artisans with filters and pagination
   */
  static async searchArtisans(params: {
    q?: string;
    category?: string;
    location?: string;
    minRating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    const { q, category, location, minRating, page = 1, limit = 12, sortBy = 'rating' } = params;

    const where: any = {
      approvalStatus: 'APPROVED',
      isAvailable: true,
    };

    if (q) {
      where.OR = [
        { profession: { contains: q } },
        { description: { contains: q } },
        { skills: { contains: q } },
        { user: { name: { contains: q } } },
      ];
    }

    if (location) {
      where.serviceArea = { contains: location };
    }

    if (minRating) {
      where.avgRating = { gte: minRating };
    }

    if (category) {
      where.services = {
        some: {
          service: {
            category: { slug: category },
          },
        },
      };
    }

    const orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy.avgRating = 'desc';
        break;
      case 'experience':
        orderBy.yearsExperience = 'desc';
        break;
      case 'reviews':
        orderBy.totalReviews = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      default:
        orderBy.avgRating = 'desc';
    }

    const [artisans, total] = await Promise.all([
      prisma.artisanProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          services: {
            include: { service: { include: { category: true } } },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.artisanProfile.count({ where }),
    ]);

    return {
      artisans: artisans.map((a) => ({
        ...a,
        skills: JSON.parse(a.skills || '[]'),
        portfolioImages: JSON.parse(a.portfolioImages || '[]'),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get single artisan profile by ID
   */
  static async getProfile(profileId: string) {
    const profile = await prisma.artisanProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, name: true, avatar: true, createdAt: true } },
        services: { include: { service: { include: { category: true } } } },
        reviews: {
          where: { isApproved: true },
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        availability: { orderBy: { dayOfWeek: 'asc' } },
      },
    });

    if (!profile) return null;

    return {
      ...profile,
      skills: JSON.parse(profile.skills || '[]'),
      portfolioImages: JSON.parse(profile.portfolioImages || '[]'),
    };
  }

  /**
   * Admin: update artisan approval status
   */
  static async updateApprovalStatus(profileId: string, status: 'APPROVED' | 'REJECTED') {
    const profile = await prisma.artisanProfile.update({
      where: { id: profileId },
      data: { approvalStatus: status },
      include: { user: true },
    });

    // Notify artisan
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        type: 'ARTISAN_APPROVED',
        title: status === 'APPROVED' ? 'Profile Approved!' : 'Profile Not Approved',
        body: status === 'APPROVED'
          ? 'Your artisan profile has been approved. You can now receive booking requests!'
          : 'Your artisan profile was not approved. Please update your profile and try again.',
        link: '/artisan/dashboard',
      },
    });

    return profile;
  }
}
