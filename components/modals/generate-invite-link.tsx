'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Copy, Link, RefreshCcw, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Label } from '../ui/label';

import { useIsMobile } from '@/hooks/user-mobile';
import LoadingSkeleton from '../additional/loading-skeleton';

export type GenerateInviteLinkProps = {
  serverId: Id<'server'>;
  inviteLink?: string;
};

const GenerateInviteLink = ({
  serverId,
  inviteLink,
}: GenerateInviteLinkProps) => {
  const createConversation = useMutation(
    api.messages.conversation.createConversation
  );
  const generateInviteLink = useMutation(api.server.server.generateInviteLink);
  const sendInviteAsMessage = useMutation(
    api.messages.conversation_messages.sendMessage
  );
  const getFriends = useQuery(api.friend_request.getFriends);
  const currentUser = useQuery(api.users.viewer);
  const [disabledFriends, setDisabledFriends] = useState<
    Record<string, boolean>
  >({});

  const [loadingLink, setLoadingLink] = useState(false);
  const isMobile = useIsMobile();
  const inviteLinkPlaceholder = `chatflow.gg/${inviteLink || 'abc123'}`;

  const handleGenerateLink = async () => {
    setLoadingLink(true);
    try {
      await generateInviteLink({ serverId });
      toast.success('Invite link created successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again later');
      }
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLinkPlaceholder);
    toast.success('Copied to clipboard!');
  };

  const handleInvite = async (friendId: Id<'users'>) => {
    setDisabledFriends((prev) => ({ ...prev, [friendId]: true }));

    try {
      if (!currentUser) return;
      const participantsIds = [currentUser._id, friendId];
      const res = await createConversation({ participantIds: participantsIds });
      await sendInviteAsMessage({
        content: inviteLinkPlaceholder,
        conversationId: res,
      });
      toast.success('Invite sent successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again later');
      }
    } finally {
      setTimeout(() => {
        setDisabledFriends((prev) => ({ ...prev, [friendId]: false }));
      }, 10000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isMobile ? (
          <Button
            variant="outline"
            className="flex items-center justify-between w-full"
          >
            Server invite
            <Link />
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="hover:bg-primary/20">
            <Link />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people to server</DialogTitle>
          <DialogDescription>
            Generate a unique invitation link and share with friends
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_50px_50px] grid-rows-[auto_auto] gap-2">
          <Input
            placeholder="chatflow.gg/abc123"
            disabled
            value={inviteLinkPlaceholder}
            className="row-span-1 col-span-1 min-w-0"
          />

          <Button
            className="row-span-2"
            onClick={handleGenerateLink}
            disabled={loadingLink}
          >
            {loadingLink ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw />
            )}
          </Button>

          <Button
            className="row-span-2"
            variant="outline"
            onClick={handleCopy}
            disabled={!inviteLink}
          >
            <Copy />
          </Button>

          <Label className="text-xs text-muted-foreground col-span-1">
            Your invite link expires in 1 day
          </Label>
        </div>

        <ScrollArea className="h-[200px] rounded-md border p-3 mt-4">
          {!getFriends && <LoadingSkeleton />}

          {getFriends?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              You have no friends to invite yet.
            </p>
          )}

          {getFriends?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between py-2 border-b last:border-none"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={item.image} />
                  <AvatarFallback>
                    {item?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{item.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleInvite(item._id)}
                disabled={!!disabledFriends[item._id] || !inviteLink}
              >
                {disabledFriends[item._id] ? 'Invited' : 'Invite'}
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateInviteLink;
