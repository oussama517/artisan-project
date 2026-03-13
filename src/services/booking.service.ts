import prisma from '@/lib/prisma';
import { jobQueue } from '@/lib/queue';
import { bookingNotificationEmail } from '@/lib/email';

export class BookingService {
  /**
   * Create a new booking after checking for conflicts
   */
  static async createBooking(data: {
    customerId: string;
    artisanProfileId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    address: string;
    city: string;
    problemDescription: string;
  }) {
    // Verify artisan exists and is approved
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: data.artisanProfileId },
      include: { user: true },
    });

    if (!artisan || artisan.approvalStatus !== 'APPROVED') {
      throw new Error('Artisan not found or not approved');
    }

    if (!artisan.isAvailable) {
      throw new Error('Artisan is currently not accepting bookings');
    }

    // Check for double-booking conflicts
    const scheduledDate = new Date(data.scheduledDate);
    const conflict = await prisma.booking.findFirst({
      where: {
        artisanProfileId: data.artisanProfileId,
        scheduledDate: scheduledDate,
        scheduledTime: data.scheduledTime,
        status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] },
      },
    });

    if (conflict) {
      throw new Error('This time slot is already booked. Please choose a different time.');
    }

    // Check availability
    const dayOfWeek = scheduledDate.getDay();
    const availability = await prisma.availability.findFirst({
      where: {
        artisanProfileId: data.artisanProfileId,
        dayOfWeek,
        isBlocked: false,
      },
    });

    if (availability) {
      // Verify time is within working hours
      if (data.scheduledTime < availability.startTime || data.scheduledTime >= availability.endTime) {
        throw new Error('Selected time is outside artisan\'s working hours');
      }
    }

    // Check for date-specific blocks
    const dateBlock = await prisma.availability.findFirst({
      where: {
        artisanProfileId: data.artisanProfileId,
        specificDate: scheduledDate,
        isBlocked: true,
      },
    });

    if (dateBlock) {
      throw new Error('Artisan is not available on this date');
    }

    // Prevent customer from booking themselves
    if (artisan.userId === data.customerId) {
      throw new Error('You cannot book your own services');
    }

    // Get service details for estimated duration
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new Error('Service not found');

    const artisanService = await prisma.artisanService.findFirst({
      where: { artisanProfileId: data.artisanProfileId, serviceId: data.serviceId },
    });

    const booking = await prisma.booking.create({
      data: {
        customerId: data.customerId,
        artisanProfileId: data.artisanProfileId,
        serviceId: data.serviceId,
        scheduledDate,
        scheduledTime: data.scheduledTime,
        address: data.address.trim(),
        city: data.city.trim(),
        problemDescription: data.problemDescription.trim(),
        estimatedDuration: artisanService?.estimatedDuration || 60,
        status: 'PENDING',
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        artisanProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: true,
      },
    });

    // Notify artisan via email
    const emailData = bookingNotificationEmail(
      artisan.user.name,
      'requested',
      {
        serviceName: service.name,
        date: scheduledDate.toLocaleDateString(),
        time: data.scheduledTime,
      }
    );
    emailData.to = artisan.user.email;
    await jobQueue.add('send-email', emailData);

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: artisan.userId,
        type: 'BOOKING_REQUEST',
        title: 'New Booking Request',
        body: `${booking.customer.name} has requested ${service.name} on ${scheduledDate.toLocaleDateString()}`,
        link: '/artisan/bookings',
      },
    });

    return booking;
  }

  /**
   * Update booking status with validation
   */
  static async updateStatus(
    bookingId: string,
    newStatus: string,
    userId: string,
    userRole: string,
    cancellationReason?: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        artisanProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: true,
      },
    });

    if (!booking) throw new Error('Booking not found');

    // Validate authorization
    const isCustomer = booking.customerId === userId;
    const isArtisan = booking.artisanProfile.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isCustomer && !isArtisan && !isAdmin) {
      throw new Error('Not authorized to update this booking');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[booking.status]?.includes(newStatus)) {
      throw new Error(`Cannot transition from ${booking.status} to ${newStatus}`);
    }

    // Cancellation rules
    if (newStatus === 'CANCELLED') {
      if (!cancellationReason && !isAdmin) {
        throw new Error('Cancellation reason is required');
      }
    }

    // Only artisan can accept/start/complete
    if (['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(newStatus) && !isArtisan && !isAdmin) {
      throw new Error('Only the artisan can update this status');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancellationReason: cancellationReason || undefined,
        cancelledBy: newStatus === 'CANCELLED' ? (isCustomer ? 'CUSTOMER' : 'ARTISAN') : undefined,
        completedAt: newStatus === 'COMPLETED' ? new Date() : undefined,
      },
    });

    // Send notifications based on status change
    let notifyUserId: string;
    let notifyEmail: string;
    let notifyName: string;
    let notificationType: string;

    if (newStatus === 'ACCEPTED') {
      notifyUserId = booking.customerId;
      notifyEmail = booking.customer.email;
      notifyName = booking.customer.name;
      notificationType = 'BOOKING_ACCEPTED';
    } else if (newStatus === 'CANCELLED') {
      notifyUserId = isCustomer ? booking.artisanProfile.userId : booking.customerId;
      notifyEmail = isCustomer ? booking.artisanProfile.user.email : booking.customer.email;
      notifyName = isCustomer ? booking.artisanProfile.user.name : booking.customer.name;
      notificationType = 'BOOKING_CANCELLED';
    } else {
      notifyUserId = booking.customerId;
      notifyEmail = booking.customer.email;
      notifyName = booking.customer.name;
      notificationType = 'BOOKING_ACCEPTED';
    }

    // In-app notification
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: notificationType,
        title: `Booking ${newStatus.replace('_', ' ').toLowerCase()}`,
        body: `Your booking for ${booking.service.name} has been ${newStatus.replace('_', ' ').toLowerCase()}.`,
        link: `/dashboard/bookings`,
      },
    });

    // Email notification
    const emailType = newStatus === 'CANCELLED' ? 'cancelled' : 'accepted';
    const emailData = bookingNotificationEmail(notifyName, emailType, {
      serviceName: booking.service.name,
      date: booking.scheduledDate.toLocaleDateString(),
      time: booking.scheduledTime,
    });
    emailData.to = notifyEmail;
    await jobQueue.add('send-email', emailData);

    return updatedBooking;
  }

  /**
   * Get bookings for a user with filtering and pagination
   */
  static async getUserBookings(
    userId: string,
    role: string,
    options: { status?: string; page?: number; limit?: number } = {}
  ) {
    const { status, page = 1, limit = 10 } = options;

    const where: any = {};

    if (role === 'CUSTOMER') {
      where.customerId = userId;
    } else if (role === 'ARTISAN') {
      const profile = await prisma.artisanProfile.findUnique({
        where: { userId },
      });
      if (!profile) throw new Error('Artisan profile not found');
      where.artisanProfileId = profile.id;
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
          artisanProfile: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          service: { include: { category: true } },
          review: true,
        },
        orderBy: { scheduledDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
