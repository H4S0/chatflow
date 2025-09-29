'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FullConversation } from '../sidebar/friends-sidebar';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import MessageCard, { MessageIds } from './message-card';
import { Id } from '@/convex/_generated/dataModel';
import { useChatLogic } from '@/hooks/useChatLogic';
import {
  StreamCall,
  CallingState,
  useCalls,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';
import ChatInput from '../additional/chat-input';
import CallNotification from '../call/call-notification';
import CallLayout from '../call/call-layout';
import StartCallComponents from '../call/start-calll-components';
import { useCallLogic } from '@/hooks/useCallLogic';
import LoadingSkeleton from '../additional/loading-skeleton';

export type SelectedMessageState = {
  content: string;
  id: MessageIds | null;
};

const ChatCard = ({ selected }: { selected: FullConversation | null }) => {
  const currentUser = useQuery(api.users.viewer);
  const [message, setMessage] = useState('');
  const [selectedMessage, setSelectedMessageState] =
    useState<SelectedMessageState>({ content: '', id: null });

  const {
    results: messages,
    loadMore,
    status,
  } = usePaginatedQuery(
    api.messages.conversation_messages.getInfiniteMessages,
    selected?.conversationId
      ? { conversationId: selected.conversationId }
      : 'skip',
    { initialNumItems: 15 }
  );

  const { scrollToMessage, chatContainerRef, messageRefs, messagesEndRef } =
    useChatLogic({
      scope: 'conversation',
      selected,
      messages,
      currentUser,
      selectedMessage,
      setMessage,
      loadMore,
      status,
    });

  const client = useStreamVideoClient();
  const calls = useCalls();

  const callLogicProps = useMemo(
    () => ({
      client,
      selected,
      calls,
      currentUserId: currentUser?._id,
    }),
    [client, selected, calls, currentUser?._id]
  );

  const {
    activeCall,
    outgoingCall,
    callState,
    startCall,
    endActiveCall,
    callTimings,
  } = useCallLogic(callLogicProps);

  if (!selected) {
    return (
      <Card className="h-[calc(100vh-6.6rem)] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">
            Select a conversation to start chatting
          </p>
        </CardContent>
      </Card>
    );
  }
  const setSelectedMessage = (
    messageContent: string,
    messageId: Id<'messages'> | Id<'channel_messages'>
  ) => {
    setSelectedMessageState({ content: messageContent, id: messageId });
  };

  const combinedItems = [
    ...(messages || []).map((m) => ({
      type: 'message' as const,
      data: m,
      timestamp: m._creationTime,
    })),
    ...(callTimings || []).map((c) => ({
      type: 'call' as const,
      data: c,
      timestamp: c.createdAt ? new Date(c.createdAt).getTime() : 0,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <>
      {calls.map((call) => (
        <CallNotification call={call} key={`call-notification-${call.id}`} />
      ))}

      <StreamCall call={activeCall ?? outgoingCall ?? undefined}>
        <Card className="h-[calc(100vh-6.6rem)]">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>
              {selected.otherUsers?.map((user) => (
                <p key={user?._id}>{user?.name}</p>
              ))}
            </CardTitle>
            <StartCallComponents
              conversationId={selected.conversationId}
              startCall={startCall}
              scrollToMessage={scrollToMessage}
            />
          </CardHeader>

          <Separator />

          <CardContent className="h-[calc(100%-180px)] p-4">
            <ScrollArea className="h-full pr-5" ref={chatContainerRef}>
              {messages === undefined ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-3">
                  {combinedItems.map((item) => {
                    if (item.type === 'message') {
                      const m = item.data;
                      const isCurrentUser = m.senderId === currentUser?._id;
                      return (
                        <div
                          key={m._id}
                          ref={(el) => {
                            messageRefs.current[m._id] = el;
                          }}
                        >
                          {m.content !== 'call' && (
                            <MessageCard
                              setSelectedMessage={setSelectedMessage}
                              message={m}
                              sender={m.sender}
                              isCurrentUser={isCurrentUser}
                              scope="conversation"
                            />
                          )}
                        </div>
                      );
                    } else if (item.type === 'call') {
                      const c = item.data;
                      if (!c.createdAt || !c.endedAt) return null;

                      const durationSec = Math.floor(
                        (new Date(c.endedAt).getTime() -
                          new Date(c.createdAt).getTime()) /
                          1000
                      );

                      return (
                        <div
                          key={c.id}
                          className="text-sm text-muted-foreground py-1 px-2 rounded text-center"
                        >
                          📞 Call ended — Duration: {durationSec} sec
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>

          <Separator />
          <ChatInput
            message={message}
            selectedMessage={selectedMessage}
            selected={selected}
            setMessage={setMessage}
            setSelectedMessageState={setSelectedMessageState}
          />
        </Card>
        {(callState === CallingState.RINGING ||
          callState === CallingState.JOINED) && (
          <CallLayout endActiveCall={endActiveCall} />
        )}
      </StreamCall>
    </>
  );
};

export default ChatCard;
