import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from '../_generated/server';

export const createChannel = mutation({
  args: {
    serverId: v.id('server'),
    name: v.string(),
    type: v.union(v.literal('audio'), v.literal('text')),
    visible: v.optional(
      v.union(
        v.object({ type: v.literal('everyone') }),
        v.object({
          type: v.literal('roles'),
          roles: v.array(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    if (!args.serverId) {
      throw new ConvexError('Server id must be provided');
    }

    await ctx.db.insert('channels', {
      name: args.name,
      type: args.type,
      visible: args.visible,
      serverId: args.serverId,
      creatorId: currentUserId,
    });
  },
});

export const getChannels = query({
  args: { serverId: v.id('server') },
  handler: async (ctx, args) => {
    const channels = await ctx.db
      .query('channels')
      .withIndex('by_server', (q) => q.eq('serverId', args.serverId))
      .collect();

    channels.sort((a, b) => {
      if (a.type === b.type) return 0;
      if (a.type === 'text') return -1;
      return 1;
    });

    return channels;
  },
});

export const getChannel = query({
  args: { channelId: v.id('channels') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exist');
    }

    return channel;
  },
});

export const updateChannel = mutation({
  args: {
    channelId: v.id('channels'),
    name: v.string(),
    type: v.union(v.literal('audio'), v.literal('text')),
    visible: v.optional(
      v.union(
        v.object({ type: v.literal('everyone') }),
        v.object({
          type: v.literal('roles'),
          roles: v.array(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exist');
    }

    const server = await ctx.db.get(channel.serverId);

    if (!server) {
      throw new ConvexError('Channel is not assgined to any server');
    }

    const userRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_user', (q) => q.eq('userId', currentUserId))
      .collect();

    const roleNames = userRoles.map((r) => r.role);

    const userRolePermission = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server', (q) => q.eq('serverId', server?._id))
      .collect();

    const currentUserPermissions = userRolePermission.filter((u) =>
      roleNames.includes(u.role)
    );

    const canManageServer = currentUserPermissions.some((u) =>
      u.permissions.includes('MANAGE_CHANNELS')
    );

    if (!canManageServer && server.ownerId !== currentUserId) {
      throw new ConvexError('You are not authotized to perform this action');
    }

    await ctx.db.patch(channel._id, {
      name: args.name,
      type: args.type,
      visible: args.visible,
    });
  },
});

export const pinMessage = mutation({
  args: { messageId: v.id('channel_messages') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const channelMessages = await ctx.db.get(args.messageId);

    if (!channelMessages) {
      throw new ConvexError('Message does not exist');
    }

    const channel = await ctx.db.get(channelMessages.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exist');
    }

    if (channel.pinnedMessage === args.messageId) {
      throw new ConvexError('Message is already pinned');
    }

    await ctx.db.patch(channel._id, {
      pinnedMessage: args.messageId,
    });
  },
});

export const unPinMessage = mutation({
  args: { messageId: v.id('channel_messages') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const channelMessages = await ctx.db.get(args.messageId);

    if (!channelMessages) {
      throw new ConvexError('Message does not exist');
    }

    const channel = await ctx.db.get(channelMessages.channelId);

    if (!channel) {
      throw new ConvexError('Channel doesnt exist');
    }

    if (channel.pinnedMessage !== args.messageId) {
      throw new ConvexError('Message is not pinned');
    }

    await ctx.db.patch(channel._id, {
      pinnedMessage: undefined,
    });
  },
});
