import prisma from '@/lib/prisma';

export class MessageService {
  /**
   * Get or create a conversation between two users
   */
  static async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Always store with lower ID as user1 for consistency
    const [uid1, uid2] = [user1Id, user2Id].sort();

    let conversation = await prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id: uid1, user2Id: uid2 } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user1Id: uid1, user2Id: uid2 },
      });
    }

    return conversation;
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(senderId: string, recipientId: string, content: string) {
    const conversation = await this.getOrCreateConversation(senderId, recipientId);

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Message',
        body: `${message.sender.name}: ${content.length > 50 ? content.substring(0, 50) + '...' : content}`,
        link: `/dashboard/messages?conversation=${conversation.id}`,
      },
    });

    return message;
  }

  /**
   * Get user's conversations with last message preview
   */
  static async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true } },
        user2: { select: { id: true, name: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return conversations.map((c) => ({
      ...c,
      otherUser: c.user1Id === userId ? c.user2 : c.user1,
      lastMessage: c.messages[0] || null,
      unreadCount: 0, // Will be calculated below
    }));
  }

  /**
   * Get messages in a conversation with pagination
   */
  static async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) throw new Error('Conversation not found');
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new Error('Not authorized to view this conversation');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      messages: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
