import { getAuthUserId } from '@convex-dev/auth/server';
import { v, ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { mutation, query } from '../_generated/server';
import { paginationOptsValidator } from 'convex/server';

export const sendChannelMessage = mutation({
  args: {
    channelId: v.id('channels'),
    content: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorzied');
    }

    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exists');
    }

    const server = await ctx.db.get(channel.serverId);

    if (channel.type !== 'text') {
      throw new ConvexError('You cannot send message to this channel');
    }

    const userRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_server_user', (q) =>
        q.eq('serverId', channel.serverId).eq('userId', currentUserId)
      )
      .collect();

    const cleanedUserRoles = userRoles.map((r) => r.role);

    if (channel.visible?.type === 'roles') {
      const allowedRoles = channel.visible.roles;

      const hasAccess = cleanedUserRoles.some((role) =>
        allowedRoles.includes(role)
      );

      if (!hasAccess && server?.ownerId !== currentUserId) {
        throw new ConvexError('You dont have access to write in this channel');
      }
    }

    const mentionRegex = /@(\w+)/g;
    const matches = args.content.match(mentionRegex) || [];

    const mentiondNames = matches.map((m) => m.slice(1));

    const mentionIds: Id<'users'>[] = [];
    for (const name of mentiondNames) {
      const user = await ctx.db
        .query('users')
        .filter((q) => q.eq(q.field('name'), name))
        .first();

      if (user && user._id !== currentUserId) {
        mentionIds.push(user._id);
      }
    }

    await ctx.db.insert('channel_messages', {
      channelId: channel._id,
      content: args.content,
      image: args.image,
      senderId: currentUserId,
      timestamp: Date.now(),
      mentions: mentionIds,
    });
  },
});

export const updateChannelMessage = mutation({
  args: {
    messageId: v.id('channel_messages'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new ConvexError('Message doesnt exist');
    }

    const channel = await ctx.db.get(message.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exist');
    }

    const userRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_user', (q) => q.eq('userId', currentUserId))
      .collect();

    const roleNames = userRoles.map((r) => r.role);

    const server = await ctx.db.get(channel.serverId);

    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    const userRolePermission = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server', (q) => q.eq('serverId', server._id))
      .collect();

    const currentUserPermissions = userRolePermission.filter((u) =>
      roleNames.includes(u.role)
    );

    const canManageMessages = currentUserPermissions.some((u) =>
      u.permissions.includes('MANAGE_MESSAGES')
    );

    if (
      !canManageMessages &&
      message.senderId !== currentUserId &&
      server.ownerId !== currentUserId
    ) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

export const markChannelMessageMentionAsRead = mutation({
  args: {
    messageId: v.id('channel_messages'),
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

export const getInfiniteMessages = query({
  args: {
    channelId: v.id('channels'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const results = await ctx.db
      .query('channel_messages')
      .withIndex('by_channel', (q) => q.eq('channelId', args.channelId))
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

export const deleteChannelMessage = mutation({
  args: { messageId: v.id('channel_messages') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new ConvexError('Message doesnt exist');
    }

    const channel = await ctx.db.get(message.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exist');
    }

    const userRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_user', (q) => q.eq('userId', currentUserId))
      .collect();

    const roleNames = userRoles.map((r) => r.role);

    const server = await ctx.db.get(channel.serverId);

    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    const userRolePermission = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server', (q) => q.eq('serverId', server._id))
      .collect();

    const currentUserPermissions = userRolePermission.filter((u) =>
      roleNames.includes(u.role)
    );

    const canManageMessages = currentUserPermissions.some((u) =>
      u.permissions.includes('MANAGE_MESSAGES')
    );

    if (
      !canManageMessages &&
      message.senderId !== currentUserId &&
      server.ownerId !== currentUserId
    ) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    await ctx.db.delete(message._id);
  },
});

export const searchChannelMessage = query({
  args: {
    channelId: v.id('channels'),
    searchTerm: v.string(),
  },

  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) return;

    const messages = await ctx.db
      .query('channel_messages')
      .withSearchIndex('search_content', (q) =>
        q.search('content', args.searchTerm).eq('channelId', args.channelId)
      )
      .take(5);

    return messages;
  },
});

export const getMessage = query({
  args: { messageId: v.id('channel_messages') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new ConvexError('Message not found');
    }

    return message;
  },
});
