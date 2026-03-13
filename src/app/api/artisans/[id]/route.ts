import { NextRequest, NextResponse } from 'next/server';
import { ArtisanService } from '@/services/artisan.service';

// GET: Get artisan profile by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await ArtisanService.getProfile(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
