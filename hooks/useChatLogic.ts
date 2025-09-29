import { api } from '@/convex/_generated/api';
import { Id, Doc } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useEffect, useRef, useState } from 'react';
import { FullConversation, User } from '@/components/sidebar/friends-sidebar';
import { SelectedMessageState } from '@/components/cards/chat-card';
import { SelectedChannelMessageState } from '@/components/additional/server-chat-input';

type ChatScope = 'conversation' | 'channel';
type LoaderStatus =
  | 'CanLoadMore'
  | 'LoadingFirstPage'
  | 'LoadingMore'
  | 'Exhausted';

type ChatLogicProps = {
  scope: ChatScope;
  selected: FullConversation | Doc<'channels'> | null;
  messages: Doc<'messages'>[] | Doc<'channel_messages'>[] | undefined;
  currentUser: User | null | undefined;
  selectedMessage: SelectedMessageState | SelectedChannelMessageState;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  loadMore: (numItems: number) => void;
  status: LoaderStatus;
};

export const useChatLogic = ({
  scope,
  selected,
  messages,
  currentUser,
  selectedMessage,
  setMessage,
  loadMore,
  status,
}: ChatLogicProps) => {
  const markConversationAsRead = useMutation(
    api.messages.conversation.markConversationAsRead
  );

  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!selected || !messages?.length) return;

    const hasOtherUserMessages = messages.some(
      (msg) => msg.senderId !== currentUser?._id
    );

    if (hasOtherUserMessages) {
      if (scope === 'conversation' && 'conversationId' in selected) {
        markConversationAsRead({ conversationId: selected.conversationId });
      }
    }
  }, [scope, selected, messages, currentUser?._id, markConversationAsRead]);

  useEffect(() => {
    if (selectedMessage.id) {
      setMessage(selectedMessage.content);
    }
  }, [selectedMessage, setMessage]);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll, messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        50;
      setAutoScroll(isAtBottom);

      if (container.scrollTop <= 50 && status === 'CanLoadMore') {
        const prevScrollHeight = container.scrollHeight;
        loadMore(5);

        setTimeout(() => {
          container.scrollTop =
            container.scrollHeight - prevScrollHeight + container.scrollTop;
        }, 50);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [status, loadMore]);

  function scrollToMessage(messageId: Id<'messages'> | Id<'channel_messages'>) {
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return {
    scrollToMessage,
    autoScroll,
    chatContainerRef,
    messageRefs,
    messagesEndRef,
  };
};
