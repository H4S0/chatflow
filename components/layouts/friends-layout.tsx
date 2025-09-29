'use client';

import React, { useState } from 'react';
import FriendsSidebar, { FullConversation } from '../sidebar/friends-sidebar';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import ChatCard from '../cards/chat-card';
import { Id } from '@/convex/_generated/dataModel';

const createDefaultConversation = (): FullConversation => ({
  _id: '' as Id<'userConversation'>,
  userId: '' as Id<'users'>,
  conversationId: '' as Id<'conversations'>,
  lastReadTimestamp: 0,
  isArchived: false,
  conversation: {
    _id: '' as Id<'conversations'>,
    _creationTime: 0,
    createdAt: Date.now(),
    participants: [] as Id<'users'>[],
    lastMessageAt: Date.now(),
  },
  participants: [],
  lastMessage: null,
  otherUsers: [],
  unreadCount: 0,
});

const FriendsLayout = () => {
  const friends = useQuery(api.friend_request.getFriends);
  const conversations = useQuery(
    api.messages.conversation.getUserConversations
  );

  const getDefaultConversation = () => {
    if (!conversations || conversations.length === 0) {
      return createDefaultConversation();
    }

    const sorted = [...conversations].sort(
      (a, b) =>
        (b.conversation?.lastMessageAt || 0) -
        (a.conversation?.lastMessageAt || 0)
    );
    return sorted[0];
  };

  const [selected, setSelected] = useState<FullConversation>(
    getDefaultConversation()
  );

  const currentSelectedIsValid = conversations?.some(
    (c) => c._id === selected._id
  );
  const effectiveSelected = currentSelectedIsValid
    ? selected
    : getDefaultConversation();

  return (
    <FriendsSidebar
      data={friends}
      conversations={conversations}
      loading={!friends || !conversations}
      onSelect={setSelected}
      selected={effectiveSelected}
    >
      <ChatCard selected={effectiveSelected} />
    </FriendsSidebar>
  );
};

export default FriendsLayout;
