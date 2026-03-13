import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@artisan-marketplace.local',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function verificationEmail(name: string, token: string): EmailOptions {
  const url = `${process.env.APP_URL}/verify?token=${token}`;
  return {
    to: '',
    subject: 'Verify your email — Artisan Marketplace',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">Welcome, ${name}!</h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
          Thanks for signing up. Please verify your email address by clicking the button below.
        </p>
        <a href="${url}" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Verify Email
        </a>
        <p style="color: #8888a0; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };
}

export function passwordResetEmail(name: string, token: string): EmailOptions {
  const url = `${process.env.APP_URL}/reset-password?token=${token}`;
  return {
    to: '',
    subject: 'Reset your password — Artisan Marketplace',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">Password Reset</h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
          Hi ${name}, we received a request to reset your password. Click the button below to create a new one.
        </p>
        <a href="${url}" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Reset Password
        </a>
        <p style="color: #8888a0; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a reset, ignore this email.
        </p>
      </div>
    `,
  };
}

export function bookingNotificationEmail(
  recipientName: string,
  type: 'requested' | 'accepted' | 'cancelled',
  details: { serviceName: string; date: string; time: string }
): EmailOptions {
  const titles = {
    requested: 'New Booking Request',
    accepted: 'Booking Confirmed',
    cancelled: 'Booking Cancelled',
  };

  const messages = {
    requested: `You have a new booking request for <strong>${details.serviceName}</strong> on ${details.date} at ${details.time}.`,
    accepted: `Your booking for <strong>${details.serviceName}</strong> on ${details.date} at ${details.time} has been confirmed!`,
    cancelled: `The booking for <strong>${details.serviceName}</strong> on ${details.date} at ${details.time} has been cancelled.`,
  };

  return {
    to: '',
    subject: `${titles[type]} — Artisan Marketplace`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">${titles[type]}</h1>
        <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
          Hi ${recipientName}, ${messages[type]}
        </p>
        <a href="${process.env.APP_URL}/dashboard/bookings" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          View Bookings
        </a>
      </div>
    `,
  };
}
