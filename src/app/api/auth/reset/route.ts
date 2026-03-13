import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { resetPasswordSchema, newPasswordSchema } from '@/lib/validators';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Request password reset
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateCheck = checkRateLimit(ip, RATE_LIMITS.auth);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await UserService.requestPasswordReset(parsed.data.email);
    return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Reset password with token
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
    }

    await UserService.resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
