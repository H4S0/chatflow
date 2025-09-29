import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const setUserStatus = mutation({
  args: {
    status: v.union(
      v.literal('online'),
      v.literal('away'),
      v.literal('offline'),
      v.literal('dnd')
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const user = await ctx.db.get(currentUserId);

    if (!user) {
      throw new ConvexError('Unauthorized');
    }

    await ctx.db.patch(user._id, { status: args.status });
  },
});
