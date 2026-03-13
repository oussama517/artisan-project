import prisma from '@/lib/prisma';
import { jobQueue } from '@/lib/queue';
import { verificationEmail, passwordResetEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class UserService {
  /**
   * Create a new user with hashed password and send verification email
   */
  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ARTISAN';
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role,
        verificationToken,
      },
    });

    // Send verification email via queue
    const emailData = verificationEmail(user.name, verificationToken);
    emailData.to = user.email;
    await jobQueue.add('send-email', emailData);

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return true;
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    if (!user) return true;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const emailData = passwordResetEmail(user.name, resetToken);
    emailData.to = user.email;
    await jobQueue.add('send-email', emailData);

    return true;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return true;
  }

  /**
   * Get user profile with artisan details if applicable
   */
  static async getUserProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        artisanProfile: true,
      },
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
      },
    });
  }
}
