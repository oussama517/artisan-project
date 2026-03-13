import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { availabilitySchema } from '@/lib/validators';

// GET: Get artisan availability
export async function GET(req: NextRequest) {
  try {
    const artisanProfileId = req.nextUrl.searchParams.get('artisanProfileId');
    if (!artisanProfileId) {
      return NextResponse.json({ error: 'artisanProfileId is required' }, { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: { artisanProfileId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json({ availability });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Set availability (artisan only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ARTISAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const body = await req.json();

    // Accept array of availability blocks
    if (Array.isArray(body)) {
      // Delete existing and replace
      await prisma.availability.deleteMany({
        where: { artisanProfileId: profile.id, specificDate: null },
      });

      const created = await Promise.all(
        body.map((slot: any) => {
          const parsed = availabilitySchema.parse(slot);
          return prisma.availability.create({
            data: {
              artisanProfileId: profile.id,
              dayOfWeek: parsed.dayOfWeek,
              startTime: parsed.startTime,
              endTime: parsed.endTime,
              isBlocked: parsed.isBlocked || false,
            },
          });
        })
      );

      return NextResponse.json({ availability: created }, { status: 201 });
    }

    // Single slot
    const parsed = availabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const slot = await prisma.availability.create({
      data: {
        artisanProfileId: profile.id,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        isBlocked: parsed.data.isBlocked || false,
        specificDate: parsed.data.specificDate ? new Date(parsed.data.specificDate) : null,
      },
    });

    return NextResponse.json({ availability: slot }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
