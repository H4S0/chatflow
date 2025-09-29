import { Doc, Id } from '@/convex/_generated/dataModel';
import React, { useState } from 'react';
import Image from 'next/image';
import { Speech } from 'lucide-react';
import MessageSettingsDropdown from '../modals/message-settings-dropdown';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
export type MessageIds = Id<'messages'> | Id<'channel_messages'>;

export type MessageWithImageUrl =
  | (Doc<'messages'> & { imageUrl?: string | null })
  | (Doc<'channel_messages'> & { imageUrl?: string | null });

type MessageScope = 'conversation' | 'channel';

type MessageCardProps<T extends MessageWithImageUrl> = {
  message: T;
  sender?: Doc<'users'> & { imageUrl?: string | null };
  isCurrentUser: boolean;
  scope: MessageScope;
  setSelectedMessage: (messageContent: string, messageId: MessageIds) => void;
  serverId?: Id<'server'>;
};

const MessageCard = <T extends MessageWithImageUrl>({
  message,
  sender,
  isCurrentUser,
  scope,
  setSelectedMessage,
  serverId,
}: MessageCardProps<T>) => {
  const [speaking, setSpeaking] = useState(false);

  const manageMessagesUserPermission = useQuery(
    api.server.roles.hasPermission,
    serverId ? { serverId: serverId, permission: 'MANAGE_MESSAGES' } : 'skip'
  );

  const handleSpeak = async () => {
    if (!message.content) return;
    setSpeaking(true);

    try {
      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content }),
      });

      if (!res.ok) throw new Error('TTS request failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => setSpeaking(false);
    } catch (err) {
      console.error('Error playing speech:', err);
      setSpeaking(false);
    }
  };

  return (
    <div
      className={cn('flex', isCurrentUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'flex gap-3 max-w-[80%]',
          isCurrentUser ? 'flex-row-reverse' : ''
        )}
      >
        {!isCurrentUser && (
          <Avatar>
            <AvatarImage src={sender?.imageUrl ?? undefined} />
            <AvatarFallback>{sender?.name?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            'flex flex-col',
            isCurrentUser ? 'items-end' : 'items-start'
          )}
        >
          <div className="flex items-center gap-2">
            {!isCurrentUser && (
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {sender?.name}
              </h2>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {!isCurrentUser && (
              <Speech
                className={cn(
                  'w-6 h-6 hover:text-primary cursor-pointer',
                  speaking ? 'animate-pulse text-primary' : 'text-gray-500'
                )}
                onClick={handleSpeak}
              />
            )}
            {isCurrentUser && scope === 'conversation' && (
              <MessageSettingsDropdown
                scope="conversation"
                setSelectedMessage={setSelectedMessage}
                messageId={message._id as Id<'messages'>}
                messageContent={message.content}
                isCurrentUser={isCurrentUser}
              />
            )}

            {scope === 'channel' && message.content.trim() && (
              <MessageSettingsDropdown
                scope="channel"
                setSelectedMessage={setSelectedMessage}
                messageId={message._id as Id<'channel_messages'>}
                messageContent={message.content}
                isCurrentUser={isCurrentUser}
                manageMessagesUserPermission={manageMessagesUserPermission!}
              />
            )}
          </div>
          <div
            className={cn(
              'mt-1 p-3 rounded-lg',
              isCurrentUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 dark:bg-gray-800'
            )}
          >
            <div
              className={cn(
                'whitespace-pre-wrap break-words',
                isCurrentUser
                  ? 'text-white'
                  : 'text-gray-800 dark:text-gray-200'
              )}
            >
              {message.imageUrl && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Image
                      src={message.imageUrl}
                      alt="message-image"
                      width={125}
                      height={125}
                      className="rounded-lg mb-2 cursor-pointer hover:opacity-80 transition"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none">
                    <VisuallyHidden>
                      <DialogTitle>Expanded message image</DialogTitle>
                    </VisuallyHidden>

                    <Image
                      src={message.imageUrl}
                      alt="message-image-large"
                      width={800}
                      height={800}
                      className="rounded-lg object-contain"
                    />
                  </DialogContent>
                </Dialog>
              )}
              {message.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
