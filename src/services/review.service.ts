import prisma from '@/lib/prisma';

export class ReviewService {
  /**
   * Create a review for a completed booking
   */
  static async createReview(data: {
    bookingId: string;
    authorId: string;
    rating: number;
    comment: string;
  }) {
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: { review: true },
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.customerId !== data.authorId) throw new Error('Only the customer can review');
    if (booking.status !== 'COMPLETED') throw new Error('Can only review completed bookings');
    if (booking.review) throw new Error('This booking already has a review');

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        authorId: data.authorId,
        artisanProfileId: booking.artisanProfileId,
        rating: data.rating,
        comment: data.comment.trim(),
      },
    });

    // Update artisan average rating
    const stats = await prisma.review.aggregate({
      where: { artisanProfileId: booking.artisanProfileId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.artisanProfile.update({
      where: { id: booking.artisanProfileId },
      data: {
        avgRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
      },
    });

    // Notify artisan
    await prisma.notification.create({
      data: {
        userId: booking.artisanProfileId,
        type: 'REVIEW_POSTED',
        title: 'New Review Received',
        body: `You received a ${data.rating}-star review.`,
        link: '/artisan/dashboard',
      },
    });

    return review;
  }

  /**
   * Admin: moderate a review (approve/reject)
   */
  static async moderateReview(reviewId: string, approved: boolean) {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: approved, moderatedAt: new Date() },
    });

    // Recalculate artisan rating
    const stats = await prisma.review.aggregate({
      where: { artisanProfileId: review.artisanProfileId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.artisanProfile.update({
      where: { id: review.artisanProfileId },
      data: {
        avgRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
      },
    });

    return review;
  }

  /**
   * Get reviews for an artisan with pagination
   */
  static async getArtisanReviews(artisanProfileId: string, page = 1, limit = 10) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { artisanProfileId, isApproved: true },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          booking: { include: { service: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { artisanProfileId, isApproved: true } }),
    ]);

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
