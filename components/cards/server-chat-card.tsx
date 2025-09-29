'use client';

import { Doc } from '@/convex/_generated/dataModel';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ServerChatInput, {
  SelectedChannelMessageState,
} from '../additional/server-chat-input';
import { Separator } from '../ui/separator';
import { Users } from 'lucide-react';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ScrollArea } from '../ui/scroll-area';
import MessageCard, { MessageIds } from './message-card';
import LoadingSkeleton from '../additional/loading-skeleton';
import { useChatLogic } from '@/hooks/useChatLogic';

import ServerChatSearch from '../modals/server-chat-search';
import PinMessageDropdown from '../modals/pin-message-dropdown';

const ServerChatCard = ({
  selectedChannel,
  allServerMembers,
  setMemberSidebar,
}: {
  selectedChannel: Doc<'channels'>;
  allServerMembers?: (Doc<'users'> | null)[];
  setMemberSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [message, setMessage] = useState('');

  const channel = useQuery(api.server.channel.getChannel, {
    channelId: selectedChannel._id,
  });

  const [selectedMessage, setSelectedMessageState] =
    useState<SelectedChannelMessageState>({ content: '', id: null });

  const currentUser = useQuery(api.users.viewer);
  const {
    results: messages,
    loadMore,
    status,
  } = usePaginatedQuery(
    api.messages.channel_messages.getInfiniteMessages,
    selectedChannel._id ? { channelId: selectedChannel._id } : 'skip',
    { initialNumItems: 15 }
  );

  const { scrollToMessage, chatContainerRef, messageRefs, messagesEndRef } =
    useChatLogic({
      scope: 'channel',
      selected: channel ?? ({ _id: '' } as Doc<'channels'>),
      messages: messages ?? [],
      currentUser,
      selectedMessage,
      setMessage,
      loadMore,
      status,
    });

  const setSelectedMessage = (
    messageContent: string,
    messageId: MessageIds | null
  ) => {
    setSelectedMessageState({ content: messageContent, id: messageId });
  };

  if (!channel) {
    return (
      <Card className="border-0 h-[calc(100vh-6.6rem)] rounded-l-none">
        <CardHeader>
          <CardTitle>Loading channel...</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-130px)] overflow-y-auto p-4">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 h-[calc(100vh-6.6rem)] rounded-l-none">
      <CardHeader className="flex justify-between items-center ">
        <CardTitle>{channel.name}</CardTitle>
        <div className="flex items-center gap-5">
          {channel.pinnedMessage && (
            <PinMessageDropdown pinnedMessageId={channel.pinnedMessage} />
          )}
          <Users onClick={() => setMemberSidebar((prev: boolean) => !prev)} />
          <ServerChatSearch
            channelId={channel._id}
            onMessageFound={(id) => scrollToMessage(id)}
          />
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-130px)] overflow-y-auto p-4">
        <ScrollArea className="h-full pr-5" ref={chatContainerRef}>
          <div className="space-y-3">
            {messages === undefined ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-3">
                {messages.map((item) => (
                  <div
                    key={item._id}
                    ref={(el) => {
                      messageRefs.current[item._id] = el;
                    }}
                  >
                    <MessageCard
                      message={item}
                      sender={item.sender}
                      isCurrentUser={item.senderId === currentUser?._id}
                      scope="channel"
                      setSelectedMessage={setSelectedMessage}
                      serverId={channel.serverId}
                    />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <Separator />
      <ServerChatInput
        selectedChannel={channel}
        allServerMembers={allServerMembers}
        selectedMessage={selectedMessage}
        message={message}
        setMessage={setMessage}
        setSelectedMessageState={setSelectedMessageState}
      />
    </Card>
  );
};

export default ServerChatCard;
