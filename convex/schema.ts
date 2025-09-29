import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    friends: v.optional(v.array(v.string())),
    userTag: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('online'),
        v.literal('away'),
        v.literal('offline'),
        v.literal('dnd')
      )
    ),
  })
    .index('email', ['email'])
    .searchIndex('search_by_name', {
      searchField: 'name',
    }),

  friend_requests: defineTable({
    senderId: v.id('users'),
    reciverId: v.id('users'),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('declined')
    ),
    createdAt: v.number(),
  })
    .index('by_sender_receiver', ['senderId', 'reciverId'])
    .index('by_receiver_status', ['reciverId', 'status']),

  conversations: defineTable({
    participants: v.array(v.id('users')),
    createdAt: v.number(),
    lastMessageAt: v.number(),
    conversationName: v.optional(v.string()),
  }).index('by_participants', ['participants']),

  server: defineTable({
    name: v.string(),
    image: v.optional(v.string()),
    status: v.union(v.literal('open'), v.literal('locked'), v.literal('inv')),
    category: v.string(),
    tags: v.array(v.string()),
    ownerId: v.id('users'),
    members: v.optional(v.array(v.id('users'))),
    roles: v.optional(v.array(v.string())),
    inviteLink: v.optional(v.string()),
    inviteLinkExpires: v.optional(v.number()),
  })
    .index('by_serverName', ['name'])
    .index('status', ['status']),

  server_roles: defineTable({
    serverId: v.id('server'),
    role: v.string(),
    userId: v.id('users'),
  })
    .index('by_server', ['serverId'])
    .index('by_server_role', ['serverId', 'role'])
    .index('by_server_user', ['serverId', 'userId'])
    .index('by_user_role', ['userId', 'role'])
    .index('by_user', ['userId']),

  server_role_permissions: defineTable({
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
  })
    .index('by_server_role', ['serverId', 'role'])
    .index('by_server', ['serverId']),

  channels: defineTable({
    name: v.string(),
    serverId: v.id('server'),
    type: v.union(v.literal('audio'), v.literal('text')),
    pinnedMessage: v.optional(v.id('channel_messages')),
    visible: v.optional(
      v.union(
        v.object({ type: v.literal('everyone') }),
        v.object({
          type: v.literal('roles'),
          roles: v.array(v.string()),
        })
      )
    ),
    creatorId: v.id('users'),
  }).index('by_server', ['serverId']),

  channel_messages: defineTable({
    channelId: v.id('channels'),
    senderId: v.id('users'),
    content: v.string(),
    image: v.optional(v.string()),
    timestamp: v.number(),
    mentions: v.optional(v.array(v.id('users'))),
    readByMentions: v.optional(v.array(v.id('users'))),
  })
    .index('by_channel', ['channelId'])
    .searchIndex('search_content', {
      searchField: 'content',
      filterFields: ['channelId'],
    }),

  social_media: defineTable({
    serverId: v.id('server'),
    content: v.string(),
    image: v.optional(v.string()),
    ownerId: v.id('users'),
    likes: v.optional(v.array(v.id('users'))),
    comments: v.optional(
      v.array(
        v.object({
          ownerId: v.id('users'),
          content: v.string(),
        })
      )
    ),
  }).index('by_server', ['serverId']),

  messages: defineTable({
    conversationId: v.id('conversations'),
    senderId: v.id('users'),
    content: v.string(),
    image: v.optional(v.string()),
    timestamp: v.number(),
    isCall: v.boolean(),
    callEndedAt: v.optional(v.number()),
    mentions: v.optional(v.array(v.id('users'))),
    readByMentions: v.optional(v.array(v.id('users'))),
  })
    .index('by_conversation', ['conversationId'])
    .index('by_conversation_timestamp', ['conversationId', 'timestamp'])
    .searchIndex('search_content', {
      searchField: 'content',
      filterFields: ['conversationId'],
    }),

  userConversation: defineTable({
    userId: v.id('users'),
    conversationId: v.id('conversations'),
    lastReadTimestamp: v.number(),
    isArchived: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_user_conversation', ['userId', 'conversationId'])
    .index('by_conversation', ['conversationId']),
});

export default schema;
