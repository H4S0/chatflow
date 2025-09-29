import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';

export const sendFriendRequest = mutation({
  args: { username: v.string(), userTag: v.string() },
  handler: async (ctx, args) => {
    const targetUser = await ctx.db
      .query('users')
      .filter((q) =>
        q.and(
          q.eq(q.field('name'), args.username),
          q.eq(q.field('userTag'), args.userTag)
        )
      )
      .unique();

    if (!targetUser) {
      throw new ConvexError('User doesnt not exists');
    }

    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const existingFriendRequest = await ctx.db
      .query('friend_requests')
      .withIndex('by_sender_receiver', (q) => q.eq('senderId', currentUserId))
      .filter((q) =>
        q.and(
          q.eq(q.field('senderId'), currentUserId),
          q.eq(q.field('reciverId'), targetUser._id)
        )
      )
      .unique();

    if (existingFriendRequest?.status === 'accepted') {
      throw new ConvexError('You are already in friendship with this user');
    }

    if (existingFriendRequest) {
      throw new ConvexError('You already sent friend requst to this user');
    }

    await ctx.db.insert('friend_requests', {
      senderId: currentUserId,
      reciverId: targetUser._id,
      status: 'pending',
      createdAt: Date.now(),
    });

    return { message: 'Friend requst sent successfully' };
  },
});

export const getFriendRequests = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const incomingRequests = await ctx.db
      .query('friend_requests')
      .withIndex('by_receiver_status', (q) => q.eq('reciverId', currentUserId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();

    const requestsWithSenders = await Promise.all(
      incomingRequests.map(async (request) => {
        const sender = await ctx.db.get(request.senderId);
        return {
          ...request,
          senderName: sender?.name,
          senderTag: sender?.userTag,
        };
      })
    );

    return requestsWithSenders;
  },
});

export const declineFriendRequest = mutation({
  args: { requestId: v.id('friend_requests') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new ConvexError('Friend request not found');
    }

    if (request.reciverId !== currentUserId) {
      throw new ConvexError('You can only decline requests sent to you');
    }

    await ctx.db.delete(args.requestId);
  },
});

export const acceptFriendRequest = mutation({
  args: { requestId: v.id('friend_requests') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new ConvexError('Friend request not found');
    }

    if (request.reciverId !== currentUserId) {
      throw new ConvexError('You can only decline requests sent to you');
    }

    await ctx.db.patch(args.requestId, { status: 'accepted' });

    const [sender, receiver] = await Promise.all([
      ctx.db.get(request.senderId),
      ctx.db.get(request.reciverId),
    ]);

    if (!sender || !receiver) {
      throw new ConvexError('User not found');
    }

    await Promise.all([
      ctx.db.patch(request.senderId, {
        friends: [...(sender.friends || []), request.reciverId],
      }),

      ctx.db.patch(request.reciverId, {
        friends: [...(receiver.friends || []), request.senderId],
      }),
    ]);

    await ctx.db.delete(args.requestId);
  },
});

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const currentUser = await ctx.db.get(currentUserId);

    if (!currentUser || !currentUser.friends) {
      return [];
    }

    const friends = await Promise.all(
      currentUser.friends.map((id) => ctx.db.get(id as Id<'users'>))
    );

    return friends.filter((friend) => friend !== null);
  },
});

export const removeFriend = mutation({
  args: { _id: v.id('users') },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const user = await ctx.db.get(currentUserId);

    if (!user) {
      throw new ConvexError('Unauthorized');
    }

    const friend = await ctx.db.get(args._id);

    if (!friend) {
      throw new ConvexError('This user doesnt exists at all');
    }

    if (!user.friends?.includes(args._id)) {
      throw new ConvexError('This user is not your friend at all');
    }

    const updatedFriend = (friend.friends || []).filter(
      (id) => id !== currentUserId
    );

    const yourUpdatedFriends = (user.friends || []).filter(
      (id) => id !== args._id
    );

    await ctx.db.patch(friend._id, {
      friends: updatedFriend,
    });

    await ctx.db.patch(currentUserId, {
      friends: yourUpdatedFriends,
    });
  },
});
