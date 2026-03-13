import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MessageService } from '@/services/message.service';
import { sendMessageSchema } from '@/lib/validators';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// GET: List conversations or messages in a conversation
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get('conversationId');

    if (conversationId) {
      const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
      const result = await MessageService.getMessages(conversationId, session.user.id, page);
      return NextResponse.json(result);
    }

    const conversations = await MessageService.getUserConversations(session.user.id);
    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateCheck = checkRateLimit(session.user.id, RATE_LIMITS.message);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many messages' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const message = await MessageService.sendMessage(
      session.user.id,
      parsed.data.recipientId,
      parsed.data.content
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
