import { ConvexError, v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from '../_generated/server';
import { generateRandomChar } from '../../lib/radnom-char';

export const createServer = mutation({
  args: {
    serverName: v.string(),
    category: v.string(),
    status: v.union(v.literal('open'), v.literal('locked'), v.literal('inv')),
    tags: v.array(v.string()),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) throw new ConvexError('Unauthorized');

    const existingServer = await ctx.db
      .query('server')
      .withIndex('by_serverName', (q) => q.eq('name', args.serverName))
      .first();

    if (existingServer) {
      throw new ConvexError(
        'Server with this name already exists, pick another one'
      );
    }

    await ctx.db.insert('server', {
      name: args.serverName,
      category: args.category,
      status: args.status,
      tags: args.tags,
      ownerId: currentUserId,
      image: args.image,
    });
  },
});

export const generateInviteLink = mutation({
  args: { serverId: v.id('server') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const inviteLink = generateRandomChar(8);
    const inviteLinkExpires = Date.now() + 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.serverId, {
      inviteLink: inviteLink,
      inviteLinkExpires: inviteLinkExpires,
    });
  },
});

export const getUserServers = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const allServers = await ctx.db.query('server').collect();

    const ownedServers = allServers.filter(
      (srv) => srv.ownerId === currentUserId
    );

    const joinedServers = allServers.filter((srv) =>
      srv.members?.includes(currentUserId)
    );

    const combinedServers = [...ownedServers, ...joinedServers];
    const now = Date.now();

    const serversWithExtraData = await Promise.all(
      combinedServers.map(async (srv) => {
        if (srv.inviteLinkExpires && srv.inviteLinkExpires < now) {
          srv.inviteLink = undefined;
          srv.inviteLinkExpires = undefined;
        }

        const memberUsers = await Promise.all(
          (srv.members || []).map(async (memberId) => {
            const user = await ctx.db.get(memberId);
            return user;
          })
        );

        const onlineMembers = memberUsers.filter(
          (user) => user?.status === 'online'
        );

        return {
          ...srv,
          imageUrl: srv.image ? await ctx.storage.getUrl(srv.image) : undefined,
          onlineMembersCount: onlineMembers.length,
          isOwner: srv.ownerId === currentUserId,
        };
      })
    );

    return serversWithExtraData;
  },
});

export const getDetailedServerUsers = query({
  args: { serverId: v.id('server') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (!server) {
      throw new ConvexError('This server doesnt exist');
    }

    const members = await Promise.all(
      (server.members ?? []).map(async (member) => {
        const user = await ctx.db.get(member);

        if (!user) return;

        const userRoles = await ctx.db
          .query('server_roles')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .collect();
        return { ...user, roles: userRoles.map((r) => r.role) };
      })
    );
    return members;
  },
});

export const getCertainServer = query({
  args: { serverId: v.id('server') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthUserId(ctx);

    if (!currentUser) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (!server) {
      throw new ConvexError('Server doesn’t exist');
    }

    if (
      !server.members?.includes(currentUser) &&
      server.ownerId !== currentUser
    ) {
      throw new ConvexError('You are not a member of this server');
    }

    const entireMembers = await Promise.all(
      (server.members ?? []).map(async (memberId) => {
        const user = await ctx.db.get(memberId);
        if (!user) return null;

        const roles = await ctx.db
          .query('server_roles')
          .withIndex('by_server_user', (q) =>
            q.eq('serverId', args.serverId).eq('userId', memberId)
          )
          .collect();

        return { ...user, roles: roles.map((r) => r.role) };
      })
    );

    return {
      ...server,
      entireMembers: entireMembers,
      imageUrl: server.image
        ? await ctx.storage.getUrl(server.image)
        : undefined,
    };
  },
});

export const getAllServerMembers = query({
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

    const serverMemebers = await Promise.all(
      (server.members ?? []).map(async (member) => await ctx.db.get(member))
    );

    return serverMemebers;
  },
});

export const searchServerMembers = query({
  args: {
    serverId: v.id('server'),
    search: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new ConvexError('Unauthorized');

    const server = await ctx.db.get(args.serverId);
    if (!server) throw new ConvexError("Server doesn't exist");

    let serverMembers = [];

    if (!args.search) {
      serverMembers = await Promise.all(
        (server.members ?? []).map((userId) => ctx.db.get(userId))
      );
    } else {
      const users = await ctx.db
        .query('users')
        .withSearchIndex('search_by_name', (q) =>
          q.search('name', args.search!)
        )
        .collect();

      serverMembers = users.filter((u) => server.members?.includes(u._id));
    }

    const enrichedMembers = await Promise.all(
      serverMembers.map(async (user) => {
        if (!user) return null;

        const roles = await ctx.db
          .query('server_roles')
          .withIndex('by_server_user', (q) =>
            q.eq('serverId', server._id).eq('userId', user._id)
          )
          .collect();

        return { ...user, roles: roles.map((r) => r.role) };
      })
    );

    const finalMembers = enrichedMembers
      .filter(Boolean)
      .filter((user) =>
        args.role
          ? (user as { roles: string[] }).roles.includes(args.role)
          : true
      );

    return finalMembers;
  },
});

export const joinOpenServer = mutation({
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

    if (server.members?.includes(currentUserId)) {
      throw new ConvexError('You are already member of this server');
    }

    await ctx.db.patch(server._id, {
      members: [...(server.members || []), currentUserId],
    });
  },
});

export const joinServer = mutation({
  args: { inviteLink: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db
      .query('server')
      .filter((q) => q.eq(q.field('inviteLink'), args.inviteLink))
      .first();

    if (!server) {
      throw new ConvexError('Server does not exist or invalid invite link');
    }

    const now = Date.now();

    if (server.inviteLinkExpires && server.inviteLinkExpires < now) {
      throw new ConvexError('Link is expired, please try another one');
    }

    await ctx.db.patch(server._id, {
      members: [...(server.members || []), currentUserId],
    });
  },
});

export const updateServerSecurityStatus = mutation({
  args: {
    serverId: v.id('server'),
    status: v.union(v.literal('open'), v.literal('locked'), v.literal('inv')),
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

    await ctx.db.patch(server._id, {
      status: args.status,
    });
  },
});

export const getAllOpenServers = query({
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const openServers = await ctx.db
      .query('server')
      .withIndex('status', (q) => q.eq('status', 'open'))
      .collect();

    const notOwenedServers = openServers.filter(
      (server) => server.ownerId !== currentUserId
    );

    const serversWithImages = await Promise.all(
      notOwenedServers.map(async (server) => {
        return {
          ...server,
          imageUrl: server.image
            ? await ctx.storage.getUrl(server.image)
            : undefined,
        };
      })
    );

    return serversWithImages;
  },
});

export const updateServer = mutation({
  args: {
    serverId: v.id('server'),
    name: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    image: v.string(),
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
      u.permissions.includes('MANAGE_SERVER')
    );

    if (!canManageServer && server.ownerId !== currentUserId) {
      throw new ConvexError('You are not authotized to perform this action');
    }

    await ctx.db.patch(server._id, {
      name: args.name,
      category: args.category,
      tags: [...new Set([...(server.tags || []), ...args.tags])],
      image: args.image,
    });
  },
});

export const deleteServer = mutation({
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

    if (server.ownerId !== currentUserId) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    const allServerRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_server', (q) => q.eq('serverId', server._id))
      .collect();

    const allServerRolesPermissions = await ctx.db
      .query('server_role_permissions')
      .withIndex('by_server', (q) => q.eq('serverId', server._id))
      .collect();

    await Promise.all(
      allServerRolesPermissions.map((permission) =>
        ctx.db.delete(permission._id)
      )
    );

    await Promise.all(allServerRoles.map((role) => ctx.db.delete(role._id)));

    await ctx.db.delete(server._id);
  },
});

export const removeMemberFromServer = mutation({
  args: { serverId: v.id('server'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const server = await ctx.db.get(args.serverId);

    if (!server) {
      throw new ConvexError('Server doesnt exist');
    }

    if (!server.members?.includes(args.userId)) {
      throw new ConvexError('This user is not member of this server at all');
    }

    const updatedMembers = server.members.filter((m) => m !== args.userId);

    const userRoles = await ctx.db
      .query('server_roles')
      .withIndex('by_server_user', (q) =>
        q.eq('serverId', server._id).eq('userId', args.userId)
      )
      .collect();

    await Promise.all(
      userRoles.map(async (role) => await ctx.db.delete(role._id))
    );

    await ctx.db.patch(server._id, {
      members: updatedMembers,
    });
  },
});
