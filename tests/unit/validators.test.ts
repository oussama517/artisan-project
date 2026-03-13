import { describe, it, expect, vi } from 'vitest';
import { signUpSchema, createBookingSchema, createReviewSchema, sendMessageSchema } from '@/lib/validators';

describe('Validators', () => {
  describe('signUpSchema', () => {
    it('accepts valid sign-up data', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1!',
        role: 'CUSTOMER',
      });
      expect(result.success).toBe(true);
    });

    it('rejects weak passwords', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        role: 'CUSTOMER',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'not-an-email',
        password: 'SecurePass1!',
        role: 'CUSTOMER',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid role', () => {
      const result = signUpSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass1!',
        role: 'SUPERADMIN',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short names', () => {
      const result = signUpSchema.safeParse({
        name: 'A',
        email: 'john@example.com',
        password: 'SecurePass1!',
        role: 'CUSTOMER',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createBookingSchema', () => {
    it('accepts valid booking data', () => {
      const result = createBookingSchema.safeParse({
        artisanProfileId: 'clx123456',
        serviceId: 'svc789',
        scheduledDate: '2025-06-15',
        scheduledTime: '10:00',
        address: '123 Main Street, Apt 4',
        city: 'Casablanca',
        problemDescription: 'My kitchen faucet is leaking and needs repair',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid time format', () => {
      const result = createBookingSchema.safeParse({
        artisanProfileId: 'clx123456',
        serviceId: 'svc789',
        scheduledDate: '2025-06-15',
        scheduledTime: '25:70',
        address: '123 Main Street',
        city: 'Casablanca',
        problemDescription: 'Faucet needs repair',
      });
      expect(result.success).toBe(false);
    });

    it('rejects too-short problem description', () => {
      const result = createBookingSchema.safeParse({
        artisanProfileId: 'clx123456',
        serviceId: 'svc789',
        scheduledDate: '2025-06-15',
        scheduledTime: '10:00',
        address: '123 Main Street',
        city: 'Casablanca',
        problemDescription: 'Fix',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createReviewSchema', () => {
    it('accepts valid review data', () => {
      const result = createReviewSchema.safeParse({
        bookingId: 'bk123',
        rating: 5,
        comment: 'Excellent work, highly recommend!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects rating out of range', () => {
      const result = createReviewSchema.safeParse({
        bookingId: 'bk123',
        rating: 6,
        comment: 'Good work',
      });
      expect(result.success).toBe(false);
    });

    it('rejects zero rating', () => {
      const result = createReviewSchema.safeParse({
        bookingId: 'bk123',
        rating: 0,
        comment: 'Below average work',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('sendMessageSchema', () => {
    it('accepts valid message', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'user123',
        content: 'Hello, are you available?',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty content', () => {
      const result = sendMessageSchema.safeParse({
        recipientId: 'user123',
        content: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
