import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReviewService } from '@/services/review.service';
import { createReviewSchema } from '@/lib/validators';

// GET: Get reviews for an artisan
export async function GET(req: NextRequest) {
  try {
    const artisanId = req.nextUrl.searchParams.get('artisanId');
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

    if (!artisanId) {
      return NextResponse.json({ error: 'artisanId is required' }, { status: 400 });
    }

    const result = await ReviewService.getArtisanReviews(artisanId, page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Create a review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const review = await ReviewService.createReview({
      ...parsed.data,
      authorId: session.user.id,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
