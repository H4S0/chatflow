import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';

type MessageSearchModalProps = {
  conversationId: Id<'conversations'>;
  onMessageFound: (id: Id<'messages'>) => void;
};

const MessageSearchModal = ({
  conversationId,
  onMessageFound,
}: MessageSearchModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchResult = useQuery(
    api.messages.conversation_messages.searchMessages,
    {
      conversationId: conversationId,
      searchTerm: searchTerm,
    }
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Search className="cursor-pointer hover:text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-xs mr-2">
        <Input
          placeholder="Search for message"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <DropdownMenuSeparator />

        {searchResult?.map((msg) => (
          <Button
            className="m-1"
            key={msg._id}
            onClick={() => {
              onMessageFound(msg._id);
              setSearchTerm('');
              setIsOpen(false);
            }}
          >
            {msg.content}
          </Button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageSearchModal;
