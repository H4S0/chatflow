import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Pin, PinOff } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';

const PinMessageDropdown = ({
  pinnedMessageId,
}: {
  pinnedMessageId: Id<'channel_messages'>;
}) => {
  const pinnedMessage = useQuery(
    api.messages.channel_messages.getMessage,
    pinnedMessageId ? { messageId: pinnedMessageId } : 'skip'
  );

  const unPinMessage = useMutation(api.server.channel.unPinMessage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Pin />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Pinned message</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pinnedMessageId ? (
          <DropdownMenuItem
            onClick={() => unPinMessage({ messageId: pinnedMessageId })}
            className="flex justify-between items-center"
          >
            <DropdownMenuLabel>{pinnedMessage?.content}</DropdownMenuLabel>
            <Button variant="outline" size="icon">
              <PinOff />
            </Button>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>No pinned messages</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PinMessageDropdown;
