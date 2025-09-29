import { getAuthUserId } from '@convex-dev/auth/server';
import { v, ConvexError } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { paginationOptsValidator } from 'convex/server';

export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    content: v.string(),
    image: v.optional(v.string()),
    isCall: v.optional(v.boolean()),
    callStartedAt: v.optional(v.number()),
    callEndedAt: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    const senderId = await getAuthUserId(ctx);

    if (!senderId) {
      throw new ConvexError('Unauthorized');
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation?.participants.includes(senderId)) {
      throw new ConvexError('Unauthorized');
    }

    const mentionRegex = /@([^\n@]+)/g;
    const matches = [...args.content.matchAll(mentionRegex)];
    const mentiondNames = matches.map((m) => m[1].trim());

    const mentionIds: Id<'users'>[] = [];
    for (const name of mentiondNames) {
      const user = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('name'), name))
        .first();

      if (user && user._id !== senderId) {
        mentionIds.push(user._id);
      }
    }

    const messageId = await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      senderId: senderId,
      content: args.content,
      image: args.image ?? undefined,
      timestamp: Date.now(),
      isCall: args.isCall ?? false,
      mentions: mentionIds,
    });

    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });

    return messageId;
  },
});

export const getMentionNotifications = query({
  args: { scope: v.union(v.literal('channel'), v.literal('conversation')) },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new ConvexError('Unauthorized');

    if (args.scope === 'conversation') {
      const messages = await ctx.db.query('messages').order('desc').take(100);
      return messages.filter(
        (msg) =>
          msg.mentions?.includes(currentUserId) &&
          !(msg.readByMentions || []).includes(currentUserId)
      );
    }

    if (args.scope === 'channel') {
      const channelMessages = await ctx.db
        .query('channel_messages')
        .order('desc')
        .take(100);
      return channelMessages.filter(
        (msg) =>
          msg.mentions?.includes(currentUserId) &&
          !(msg.readByMentions || []).includes(currentUserId)
      );
    }

    return [];
  },
});

export const markMentionAsRead = mutation({
  args: {
    messageId: v.id('messages'),
  },
  handler: async (ctx, { messageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('Unauthorized');

    const message = await ctx.db.get(messageId);
    if (!message) throw new ConvexError('Message not found');

    const alreadyRead = message.readByMentions?.includes(userId);
    if (!alreadyRead) {
      await ctx.db.patch(messageId, {
        readByMentions: [...(message.readByMentions || []), userId],
      });
    }

    return true;
  },
});

export const updateEndedCall = mutation({
  args: {
    id: v.id('messages'),
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const message = await ctx.db.get(args.id);

    if (message?.conversationId !== args.conversationId) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    await ctx.db.patch(args.id, {
      callEndedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const searchMessages = query({
  args: {
    conversationId: v.id('conversations'),
    searchTerm: v.string(),
  },

  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) return;

    const messages = await ctx.db
      .query('messages')
      .withSearchIndex('search_content', (q) =>
        q
          .search('content', args.searchTerm)
          .eq('conversationId', args.conversationId)
      )
      .take(5);

    return messages;
  },
});

export const updateMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    messageId: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const message = await ctx.db.get(args.messageId);

    if (message?.conversationId !== args.conversationId) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    if (message.senderId !== currentUserId) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

export const getInfiniteMessages = query({
  args: {
    conversationId: v.id('conversations'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const results = await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId)
      )
      .order('asc')
      .paginate(args.paginationOpts);

    const senderIds = Array.from(new Set(results.page.map((m) => m.senderId)));

    const users = await Promise.all(
      senderIds.map(async (id) => {
        const user = await ctx.db.get(id);
        if (!user) return null;
        const imageUrl = user.image
          ? await ctx.storage.getUrl(user.image)
          : undefined;
        return { ...user, imageUrl };
      })
    );

    const userMap = Object.fromEntries(
      users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map((u) => [u._id, u])
    );

    const enhancedPage = await Promise.all(
      results.page.map(async (m) => {
        const sender = userMap[m.senderId];
        const imageUrl = m.image
          ? await ctx.storage.getUrl(m.image)
          : undefined;
        return {
          ...m,
          sender,
          imageUrl,
        };
      })
    );

    return {
      ...results,
      page: enhancedPage,
    };
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id('messages') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const message = await ctx.db.get(args.messageId);

    if (message?.senderId !== currentUserId) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    await ctx.db.delete(message._id);
  },
});
