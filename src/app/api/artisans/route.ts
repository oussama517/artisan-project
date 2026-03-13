import { NextRequest, NextResponse } from 'next/server';
import { ArtisanService } from '@/services/artisan.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { artisanProfileSchema, searchSchema } from '@/lib/validators';

// GET: Search/list artisans
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = searchSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 });
    }

    const result = await ArtisanService.searchArtisans(parsed.data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Create/update artisan profile
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = artisanProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const profile = await ArtisanService.upsertProfile(session.user.id, parsed.data);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
