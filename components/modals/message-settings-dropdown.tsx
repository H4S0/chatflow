import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Ellipsis } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { MessageIds } from '../cards/message-card';

type MessageScope = 'conversation' | 'channel';

type MessageSettingsDropdownProps = {
  scope: MessageScope;
  setSelectedMessage: (messageContent: string, messageId: MessageIds) => void;
  messageId: MessageIds;
  messageContent: string;
  isCurrentUser: boolean;
  manageMessagesUserPermission?: boolean;
};

const MessageSettingsDropdown = ({
  scope,
  setSelectedMessage,
  messageContent,
  messageId,
  isCurrentUser,
  manageMessagesUserPermission,
}: MessageSettingsDropdownProps) => {
  const deleteConversationMessage = useMutation(
    api.messages.conversation_messages.deleteMessage
  );
  const deleteChannelMessage = useMutation(
    api.messages.channel_messages.deleteChannelMessage
  );

  const pinMessage = useMutation(api.server.channel.pinMessage);

  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    try {
      if (scope === 'conversation') {
        deleteConversationMessage({
          messageId: messageId as Id<'messages'>,
        });
        toast.success('Message deleted successfully');
      } else {
        deleteChannelMessage({
          messageId: messageId as Id<'channel_messages'>,
        });
        toast.success('Message deleted successfully');
      }
    } catch (err) {
      if (err instanceof ConvexError) toast.error(err.data);
      else toast.error('Something went wrong');
    }
  };

  const canPin = scope === 'channel' && manageMessagesUserPermission;

  const canEdit = isCurrentUser || manageMessagesUserPermission;
  const canDelete = isCurrentUser || manageMessagesUserPermission;

  const hasMenuItems = canPin || canEdit || canDelete;

  return (
    hasMenuItems && (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger>
          <Ellipsis className="text-gray-500 w-6 h-6 hover:text-primary" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-xs mr-2">
          {canPin && (
            <DropdownMenuItem
              onClick={() => {
                try {
                  pinMessage({
                    messageId: messageId as Id<'channel_messages'>,
                  });
                  toast.success('Message pinned successfully');
                } catch (err) {
                  if (err instanceof ConvexError) {
                    toast.error(err.data);
                  } else {
                    toast.error('Something went wrong');
                  }
                }
              }}
            >
              Pin message
            </DropdownMenuItem>
          )}

          {canEdit && (
            <DropdownMenuItem
              onClick={() => setSelectedMessage(messageContent, messageId)}
            >
              Edit message
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              Delete message
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};

export default MessageSettingsDropdown;
