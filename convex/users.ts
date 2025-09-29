import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError('Unauthorized');
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError('User not found');
    }

    return {
      ...user,
      imageUrl: user.image ? await ctx.storage.getUrl(user.image) : null,
    };
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    userTag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError('Unauthorized');
    }

    if (!args.name && !args.userTag) {
      throw new ConvexError('No fields to update');
    }

    if (args.name || args.userTag) {
      const existingUser = await ctx.db
        .query('users')
        .filter((q) =>
          q.and(
            q.neq(q.field('_id'), userId),
            q.or(
              ...(args.name ? [q.eq(q.field('name'), args.name)] : []),
              ...(args.userTag ? [q.eq(q.field('userTag'), args.userTag)] : [])
            )
          )
        )
        .first();

      if (existingUser) {
        if (args.name && existingUser.name === args.name) {
          throw new ConvexError('Username is already in use');
        }
        if (args.userTag && existingUser.userTag === args.userTag) {
          throw new ConvexError('User tag is already in use');
        }
      }
    }

    const updateData: { name?: string; userTag?: string } = {};
    if (args.name) updateData.name = args.name;
    if (args.userTag) updateData.userTag = args.userTag;

    await ctx.db.patch(userId, updateData);

    return { message: 'User updated successfully' };
  },
});

export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const sentRequests = await ctx.db
      .query('friend_requests')
      .withIndex('by_sender_receiver', (q) => q.eq('senderId', currentUserId))
      .collect();

    for (const req of sentRequests) {
      await ctx.db.delete(req._id);
    }

    const userConversations = await ctx.db
      .query('userConversation')
      .withIndex('by_user', (q) => q.eq('userId', currentUserId))
      .collect();

    for (const uc of userConversations) {
      await ctx.db.delete(uc._id);
    }

    const conversations = await ctx.db.query('conversations').collect();

    for (const conv of conversations) {
      if (conv.participants.includes(currentUserId)) {
        const updatedParticipants = conv.participants.filter(
          (id) => id !== currentUserId
        );

        if (updatedParticipants.length === 0) {
          const messages = await ctx.db
            .query('messages')
            .withIndex('by_conversation', (q) =>
              q.eq('conversationId', conv._id)
            )
            .collect();

          for (const msg of messages) {
            await ctx.db.delete(msg._id);
          }

          await ctx.db.delete(conv._id);
        } else {
          await ctx.db.patch(conv._id, {
            participants: updatedParticipants,
          });
        }
      }
    }

    const userMessages = await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('senderId'), currentUserId))
      .collect();

    for (const msg of userMessages) {
      await ctx.db.delete(msg._id);
    }

    const channelMessages = await ctx.db
      .query('channel_messages')
      .filter((q) => q.eq(q.field('senderId'), currentUserId))
      .collect();

    for (const cmsg of channelMessages) {
      await ctx.db.delete(cmsg._id);
    }

    const accounts = await ctx.db
      .query('authAccounts')
      .withIndex('userIdAndProvider', (q) => q.eq('userId', currentUserId))
      .collect();

    for (const acc of accounts) {
      const codes = await ctx.db
        .query('authVerificationCodes')
        .withIndex('accountId', (q) => q.eq('accountId', acc._id))
        .collect();

      for (const code of codes) {
        await ctx.db.delete(code._id);
      }

      await ctx.db.delete(acc._id);
    }

    const sessions = await ctx.db
      .query('authSessions')
      .withIndex('userId', (q) => q.eq('userId', currentUserId))
      .collect();

    for (const session of sessions) {
      const refreshTokens = await ctx.db
        .query('authRefreshTokens')
        .withIndex('sessionId', (q) => q.eq('sessionId', session._id))
        .collect();

      for (const token of refreshTokens) {
        await ctx.db.delete(token._id);
      }

      const verifiers = await ctx.db
        .query('authVerifiers')
        .filter((q) => q.eq(q.field('sessionId'), session._id))
        .collect();

      for (const verifier of verifiers) {
        await ctx.db.delete(verifier._id);
      }

      await ctx.db.delete(session._id);
    }

    const userDoc = await ctx.db.get(currentUserId);
    if (userDoc?.email) {
      const rateLimits = await ctx.db
        .query('authRateLimits')
        .filter((q) => q.eq(q.field('identifier'), userDoc.email!))
        .collect();
      for (const rl of rateLimits) {
        await ctx.db.delete(rl._id);
      }
    }
    if (userDoc?.phone) {
      const rateLimits = await ctx.db
        .query('authRateLimits')
        .filter((q) => q.eq(q.field('identifier'), userDoc.phone!))
        .collect();
      for (const rl of rateLimits) {
        await ctx.db.delete(rl._id);
      }
    }

    const servers = await ctx.db.query('server').collect();

    for (const srv of servers) {
      if (srv.members?.includes(currentUserId)) {
        const updatedMembers = srv.members.filter((m) => m !== currentUserId);

        await ctx.db.patch(srv._id, {
          members: updatedMembers,
        });
      }

      const serverRoles = await ctx.db
        .query('server_roles')
        .withIndex('by_server_user', (q) =>
          q.eq('serverId', srv._id).eq('userId', currentUserId)
        )
        .collect();

      await Promise.all(
        serverRoles.map(async (r) => await ctx.db.delete(r._id))
      );
    }

    await ctx.db.delete(currentUserId);
  },
});

export const updateImage = mutation({
  args: { image: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    await ctx.db.patch(currentUserId, {
      image: args.image,
    });
  },
});
