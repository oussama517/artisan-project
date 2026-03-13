import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await UserService.verifyEmail(token);
    // Redirect to sign-in with success message
    return NextResponse.redirect(new URL('/signin?verified=true', req.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
