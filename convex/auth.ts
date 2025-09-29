import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth, getAuthUserId } from '@convex-dev/auth/server';
import { mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { DataModel } from './_generated/dataModel';

const generateUserTag = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let tag = '';
  for (let i = 0; i < 4; i++) {
    tag += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `#${tag}`;
};

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
      userTag: generateUserTag(),
    };
  },
});

export const updateEmail = mutation({
  args: { currentEmail: v.string(), newEmail: v.string() },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);

    if (!currentUserId) {
      throw new ConvexError('Unauthorized');
    }

    const user = await ctx.db.get(currentUserId);

    if (user?.email !== args.currentEmail) {
      throw new ConvexError('You are not authorized to perform this action');
    }

    const existing = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.newEmail))
      .first();

    if (existing) {
      throw new ConvexError('Email is already in use');
    }

    await ctx.db.patch(currentUserId, {
      email: args.newEmail,
    });
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [CustomPassword],
});
