import { z } from 'zod';

// ─── Auth Validators ───────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['CUSTOMER', 'ARTISAN']),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8) .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});

// ─── Profile Validators ───────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const artisanProfileSchema = z.object({
  profession: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  yearsExperience: z.number().int().min(0).max(60),
  serviceArea: z.string().min(2).max(200),
  skills: z.array(z.string().max(50)).min(1).max(20),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ─── Booking Validators ───────────────────────────────────

export const createBookingSchema = z.object({
  artisanProfileId: z.string().min(1),
  serviceId: z.string().min(1),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be HH:MM format'),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  problemDescription: z.string().min(10).max(2000),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  cancellationReason: z.string().max(500).optional(),
});

// ─── Review Validators ────────────────────────────────────

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

// ─── Message Validators ───────────────────────────────────

export const sendMessageSchema = z.object({
  recipientId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

// ─── Category Validators ──────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
});

// ─── Availability Validators ──────────────────────────────

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  isBlocked: z.boolean().optional(),
  specificDate: z.string().optional(),
});

// ─── Search/Filter Validators ─────────────────────────────

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().optional(),
  location: z.string().max(200).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxDistance: z.coerce.number().min(0).optional(),
  availability: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.enum(['rating', 'experience', 'reviews', 'newest']).default('rating'),
});
