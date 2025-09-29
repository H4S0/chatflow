import React from 'react';
import { FullConversation } from '../sidebar/friends-sidebar';
import ConversationSettingsModal from '../modals/conversation-settings-modal';
import { cn } from '@/lib/utils';

type ConversationCardProps = {
  item: FullConversation;
  onSelect: (conversation: FullConversation) => void;
  selected?: FullConversation | null;
};

const ConversationCard = ({
  item,
  selected,
  onSelect,
}: ConversationCardProps) => {
  return (
    <div
      key={item._id}
      onClick={() => {
        onSelect(item);
      }}
      className={cn(
        'cursor-pointer p-2 rounded-md',
        selected?._id === item._id ? 'bg-primary/20' : 'hover:bg-muted'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {item.otherUsers?.map(
              (user) => user?.name?.[0].toUpperCase() || '?'
            )}
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start">
            <div className="flex items-center">
              {item.conversation?.conversationName
                ? item.conversation.conversationName
                : item?.participants.map((user) => (
                    <p key={user?._id}>{user?.name}/</p>
                  ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {item.lastMessage?.content || 'No messages yet'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {item.unreadCount > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {item.unreadCount}
              </span>
            )}
            <ConversationSettingsModal conversationId={item.conversationId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;
