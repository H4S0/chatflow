import React from 'react';
import { Card, CardTitle } from '../ui/card';
import AddFriendModal from '../modals/add-friend-modal';
import { Doc, Id } from '@/convex/_generated/dataModel';
import AllFriendsModal from '../modals/all-friends-modal';
import ConversationCard from '../cards/conversation-card';
import LoadingSkeleton from '../additional/loading-skeleton';

export type User = Doc<'users'> | null;
export type Message = Doc<'messages'>;
export type Conversations = Doc<'conversations'>;

export type FullConversation = {
  _id: Id<'userConversation'>;
  userId: Id<'users'>;
  conversationId: Id<'conversations'>;
  lastReadTimestamp: number;
  isArchived: boolean;
  conversation: Conversations | null;
  lastMessage: Message | null;
  otherUsers: User[];
  unreadCount: number;
  participants: User[];
};

type FriendSidebarProps = {
  data?: User[];
  conversations?: FullConversation[];
  loading?: boolean;
  children: React.ReactNode;
  onSelect: (conversation: FullConversation) => void;
  selected?: FullConversation | null;
};

const FriendSidebar = ({
  data,
  conversations,
  loading = false,
  children,
  onSelect,
  selected,
}: FriendSidebarProps) => {
  return (
    <div className="flex flex-col md:flex-row w-full gap-2">
      <Card className="md:w-[30%] p-4 md:h-[calc(100vh-6.6rem)] bg-transparent flex flex-col gap-1">
        <div>
          <CardTitle className="text-xl font-semibold mb-4">
            Friends ({data?.length || 0})
          </CardTitle>
          <AddFriendModal />
          <AllFriendsModal friends={data} loading={loading} />
        </div>

        <ul className="flex-1 overflow-y-auto mt-4 space-y-2">
          {loading ? (
            <LoadingSkeleton />
          ) : conversations?.length ? (
            conversations.map((item) => (
              <ConversationCard
                key={item._id}
                item={item}
                selected={selected}
                onSelect={onSelect}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center mt-4">
              <span className="text-primary">No conversations yet</span> - start
              by messaging a friend
            </p>
          )}
        </ul>
      </Card>

      <div className="w-full md:w-[70%]">{children}</div>
    </div>
  );
};

export default FriendSidebar;
