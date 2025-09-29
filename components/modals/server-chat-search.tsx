import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const ServerChatSearch = ({
  channelId,
  onMessageFound,
}: {
  channelId: Id<'channels'>;
  onMessageFound: (id: Id<'channel_messages'>) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchResult = useQuery(
    api.messages.channel_messages.searchChannelMessage,
    {
      channelId: channelId,
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

export default ServerChatSearch;
