import { ConvexError, v } from 'convex/values';
import { mutation, query } from '../_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from '../_generated/dataModel';

export const createPost = mutation({
  args: {
    serverId: v.id('server'),
    content: v.string(),
    image: v.optional(v.string()),
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

    if (
      !server.members?.includes(currentUserId) &&
      server.ownerId !== currentUserId
    ) {
      throw new ConvexError('You are not member of this server');
    }

    await ctx.db.insert('social_media', {
      serverId: server._id,
      content: args.content,
      image: args.image,
      ownerId: currentUserId,
    });
  },
});

export const getPosts = query({
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

    const posts = await ctx.db
      .query('social_media')
      .withIndex('by_server', (q) => q.eq('serverId', server._id))
      .order('desc')
      .collect();

    const postsWithImages = Promise.all(
      posts.map(async (post) => {
        return {
          ...post,
          imageUrl: post.image
            ? await ctx.storage.getUrl(post.image)
            : undefined,
          ownerId: await ctx.db.get(post.ownerId),
        };
      })
    );

    return postsWithImages;
  },
});

export const likePost = mutation({
  args: { postId: v.id('social_media') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new ConvexError('Post doesnt exist');
    }

    const server = await ctx.db.get(post.serverId);

    if (!server) {
      throw new ConvexError('Post must be assigned to a server');
    }

    if (
      !server.members?.includes(currentUserId) &&
      server.ownerId !== currentUserId
    ) {
      throw new ConvexError('You are not member of this server');
    }

    let updatedLikes: Id<'users'>[];

    if (post?.likes?.includes(currentUserId)) {
      updatedLikes = post.likes.filter((u) => u !== currentUserId);
    } else {
      updatedLikes = [...(post.likes ?? []), currentUserId];
    }

    await ctx.db.patch(post._id, {
      likes: updatedLikes,
    });
  },
});

export const deletePost = mutation({
  args: { postId: v.id('social_media') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new ConvexError('Post doesnt exist');
    }

    const server = await ctx.db.get(post.serverId);

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

    const canManageSocialMedia = currentUserPermissions.some((u) =>
      u.permissions.includes('MANAGE_SOCIAL_MEDIA')
    );

    if (!canManageSocialMedia && server.ownerId !== currentUserId) {
      throw new ConvexError('You are not authotized to perform this action');
    }

    await ctx.db.delete(args.postId);
  },
});

export const createComment = mutation({
  args: { postId: v.id('social_media'), content: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new ConvexError('Post doesnt exist');
    }

    const newComment = {
      ownerId: currentUserId,
      content: args.content,
    };

    await ctx.db.patch(post._id, {
      comments: [...(post.comments || []), newComment],
    });
  },
});

export const getComments = query({
  args: { postId: v.id('social_media') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new ConvexError('Post doesnt exist');
    }

    const commentsWithUsers = await Promise.all(
      (post.comments ?? []).map(async (c) => {
        return {
          ...c,
          user: await ctx.db.get(c.ownerId),
        };
      })
    );

    return commentsWithUsers;
  },
});
