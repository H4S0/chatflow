import { getAuthUserId } from '@convex-dev/auth/server';
import { v, ConvexError } from 'convex/values';
import { mutation, query } from '../_generated/server';

export const createRole = mutation({
  args: { serverId: v.id('server'), role: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (server?.ownerId !== currentUserId) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    await ctx.db.patch(server._id, {
      roles: [...(server.roles || []), args.role],
    });
  },
});

export const getUserRole = query({
  args: { serverId: v.id('server') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    const roles = await ctx.db
      .query('server_roles')
      .withIndex('by_server_user', (q) =>
        q.eq('serverId', server._id).eq('userId', currentUserId)
      )
      .collect();

    return roles.map((r) => r.role);
  },
});

export const deleteRole = mutation({
  args: { serverId: v.id('server'), role: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    if (!server.roles?.includes(args.role)) {
      throw new ConvexError('This role doesnt exist on server roles');
    }

    const assignedServerRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_server_role', (q) =>
        q.eq('serverId', server._id).eq('role', args.role)
      )
      .collect();

    await Promise.all(
      assignedServerRoles.map(async (r) => await ctx.db.delete(r._id))
    );

    const newServerRoles = server.roles.filter((r) => r !== args.role);

    const rolePermission = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server_role', (q) =>
        q.eq('serverId', server._id).eq('role', args.role)
      )
      .first();
    if (rolePermission) {
      await ctx.db.delete(rolePermission._id);
    }

    const channels = await ctx.db
      .query('channels')
      .withIndex('by_server', (q) => q.eq('serverId', server._id))
      .collect();

    for (const channel of channels) {
      if (channel.visible?.type === 'roles') {
        const updatedRoles = channel.visible.roles.filter(
          (r) => r !== args.role
        );

        if (updatedRoles.length !== channel.visible.roles.length) {
          await ctx.db.patch(channel._id, {
            visible: {
              type: 'roles',
              roles: updatedRoles,
            },
          });
        }
      }
    }

    await ctx.db.patch(server._id, {
      roles: newServerRoles,
    });
  },
});

export const setUserRole = mutation({
  args: {
    serverId: v.id('server'),
    userId: v.id('users'),
    role: v.string(),
    assign: v.boolean(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    if (!server.roles?.includes(args.role)) {
      throw new ConvexError('This server doesnt contain given role');
    }

    if (!server.members?.includes(args.userId)) {
      throw new ConvexError('User isnt member of this server');
    }

    const existing = await ctx.db
      .query('server_roles')
      .withIndex('by_user_role', (q) =>
        q.eq('userId', args.userId).eq('role', args.role)
      )
      .first();

    if (args.assign && !existing) {
      await ctx.db.insert('server_roles', {
        serverId: args.serverId,
        role: args.role,
        userId: args.userId,
      });
    } else if (!args.assign && existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const setRolePermission = mutation({
  args: {
    serverId: v.id('server'),
    role: v.string(),
    permissions: v.array(
      v.union(
        v.literal('VIEW_CHANNELS'),
        v.literal('MANAGE_CHANNELS'),
        v.literal('MANAGE_ROLES'),
        v.literal('MANAGE_SERVER'),
        v.literal('KICK_MEMBERS'),
        v.literal('ACCESS_SOCIAL_MEDIA'),
        v.literal('MANAGE_SOCIAL_MEDIA'),
        v.literal('MANAGE_MESSAGES'),
        v.literal('TEXT_TO_SPEECH')
      )
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);
    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    if (!server.roles?.includes(args.role)) {
      throw new ConvexError('This server doesnt contain given role');
    }

    const existing = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server_role', (q) =>
        q.eq('serverId', args.serverId).eq('role', args.role)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        permissions: args.permissions,
      });
    } else {
      await ctx.db.insert('server_role_permissions', {
        serverId: args.serverId,
        role: args.role,
        permissions: args.permissions,
      });
    }
  },
});

export const getRolePermission = query({
  args: { serverId: v.id('server'), role: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const roles = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server_role', (q) =>
        q.eq('serverId', args.serverId).eq('role', args.role)
      )
      .first();

    return roles?.permissions ?? [];
  },
});

export const hasPermission = query({
  args: {
    serverId: v.id('server'),
    permission: v.union(
      v.literal('VIEW_CHANNELS'),
      v.literal('MANAGE_CHANNELS'),
      v.literal('MANAGE_ROLES'),
      v.literal('MANAGE_SERVER'),
      v.literal('KICK_MEMBERS'),
      v.literal('ACCESS_SOCIAL_MEDIA'),
      v.literal('MANAGE_SOCIAL_MEDIA'),
      v.literal('MANAGE_MESSAGES'),
      v.literal('TEXT_TO_SPEECH')
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new ConvexError('Unauthorized');

    const server = await ctx.db.get(args.serverId);
    if (!server) throw new ConvexError('Server doesn’t exist');

    if (server.ownerId === currentUserId) {
      return true;
    }

    const roles = await ctx.db
      .query('server_roles')
      .withIndex('by_server_user', (q) =>
        q.eq('serverId', args.serverId).eq('userId', currentUserId)
      )
      .collect();

    if (roles.length === 0) return false;

    const rolePermissions = await Promise.all(
      roles.map((r) =>
        ctx.db
          .query('server_role_permissions')
          .withIndex('by_server_role', (q) =>
            q.eq('serverId', args.serverId).eq('role', r.role)
          )
          .unique()
      )
    );

    const permissions = rolePermissions.flatMap((rp) => rp?.permissions ?? []);

    return permissions.includes(args.permission);
  },
});

export const getRoleCount = query({
  args: { serverId: v.id('server'), roles: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const serverRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_server', (q) => q.eq('serverId', args.serverId))
      .collect();

    const counts: Record<string, number> = {};

    args.roles?.forEach((role) => {
      counts[role] = serverRoles.filter((r) => r.role === role).length;
    });

    return counts;
  },
});
