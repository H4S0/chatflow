import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query, QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

export const createConversation = mutation({
  args: { participantIds: v.array(v.id('users')) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const existing = await ctx.db
      .query('conversations')
      .withIndex('by_participants', (q) =>
        q.eq('participants', args.participantIds.sort())
      )
      .first();

    if (existing) return existing._id;

    const conversationId = await ctx.db.insert('conversations', {
      participants: args.participantIds.sort(),
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    });

    await Promise.all(
      args.participantIds.map((userId) =>
        ctx.db.insert('userConversation', {
          userId,
          conversationId,
          lastReadTimestamp: 0,
          isArchived: false,
        })
      )
    );

    return conversationId;
  },
});

export const kita = mutation({
  args: {
    conversationId: v.id('conversations'),
    conversationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      conversationName: args.conversationName,
    });
  },
});

export const renameConversation = mutation({
  args: {
    conversationId: v.id('conversations'),
    conversationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      conversationName: args.conversationName,
    });
  },
});

async function getUnreadCount(
  ctx: QueryCtx,
  userId: Id<'users'>,
  conversationId: Id<'conversations'>
): Promise<number> {
  const userConversation = await ctx.db
    .query('userConversation')
    .withIndex('by_user_conversation', (q) =>
      q.eq('userId', userId).eq('conversationId', conversationId)
    )
    .unique();

  if (!userConversation) return 0;

  const unreadMessages = await ctx.db
    .query('messages')
    .withIndex('by_conversation_timestamp', (q) =>
      q
        .eq('conversationId', conversationId)
        .gt('timestamp', userConversation.lastReadTimestamp)
    )
    .collect();

  return unreadMessages.filter((msg) => msg.senderId !== userId).length;
}

export const markConversationAsRead = mutation({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Not authenticated');

    const userConversation = await ctx.db
      .query('userConversation')
      .withIndex('by_user_conversation', (q) =>
        q.eq('userId', userId).eq('conversationId', args.conversationId)
      )
      .unique();

    if (userConversation) {
      await ctx.db.patch(userConversation._id, {
        lastReadTimestamp: Date.now(),
      });
    }
    return true;
  },
});

export const getUserConversations = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const userConversations = await ctx.db
      .query('userConversation')
      .withIndex('by_user', (q) => q.eq('userId', currentUserId))
      .collect();

    return Promise.all(
      userConversations.map(async (uc) => {
        const conversation = await ctx.db.get(uc.conversationId);
        if (!conversation) {
          throw new ConvexError('Conversation not found');
        }

        const lastMessage = await ctx.db
          .query('messages')
          .withIndex('by_conversation_timestamp', (q) =>
            q.eq('conversationId', uc.conversationId)
          )
          .order('desc')
          .first();

        const participantIds = conversation.participants;
        const participants = await Promise.all(
          participantIds.map((id) => ctx.db.get(id))
        );

        const validParticipants = participants.filter(Boolean);

        const unreadCount = await getUnreadCount(
          ctx,
          currentUserId,
          uc.conversationId
        );

        return {
          ...uc,
          conversation,
          lastMessage,
          participants: validParticipants,
          otherUsers: validParticipants.filter(
            (user) => user?._id !== currentUserId
          ),
          unreadCount,
        };
      })
    );
  },
});

export const deleteConversation = mutation({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError('Conversation not found');
    }

    if (!conversation.participants.includes(currentUserId)) {
      throw new ConvexError('Not allowed to delete this conversation');
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    const userConversations = await ctx.db
      .query('userConversation')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .collect();

    for (const uc of userConversations) {
      await ctx.db.delete(uc._id);
    }

    await ctx.db.delete(args.conversationId);
  },
});
