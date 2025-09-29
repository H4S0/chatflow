import React from 'react';
import { User } from '../sidebar/friends-sidebar';
import { Card, CardContent, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import { MessageCirclePlus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Checkbox } from '../ui/checkbox';
import { Id } from '@/convex/_generated/dataModel';

type arr = Id<'users'>[];

type FriendCardProps = {
  friend: User;
  remove?: string;
  newConversation?: string;
  setIsOpen: (isOpen: boolean) => void;
  group: Id<'users'>[] | null;
  setGroup: (user: arr) => void;
};

const FriendCard = ({
  friend,
  remove,
  newConversation,
  setIsOpen,
  setGroup,
  group,
}: FriendCardProps) => {
  const removeFriend = useMutation(api.friend_request.removeFriend);
  const createConversation = useMutation(
    api.messages.conversation.createConversation
  );
  const user = useQuery(api.users.viewer);

  if (!user) {
    return redirect('/pages/auth');
  }

  const isChecked = group?.some((u) => u === friend?._id);

  const handleCheckboxChange = (checked: boolean) => {
    if (!group || !friend?._id) return;

    if (checked) {
      if (!isChecked) {
        setGroup([...group, friend._id]);
      }
    } else {
      setGroup(group.filter((u) => u !== friend?._id));
    }
  };
  return (
    <Card className="py-2 px-2 rounded-md transition-all duration-200 ease-in-out mb-2">
      <CardContent className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isChecked}
            onCheckedChange={(checked: boolean) =>
              handleCheckboxChange(!!checked)
            }
          />
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={friend?.image} />
              <AvatarFallback>{friend?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'absolute w-3 h-3 right-0 bottom-0 rounded-full',
                friend?.status === 'online' && 'bg-green-500',
                friend?.status === 'away' && 'bg-yellow-500',
                friend?.status === 'dnd' && 'bg-red-500',
                friend?.status === 'offline' && 'bg-gray-500'
              )}
            ></div>
          </div>

          <CardTitle className="text-base">
            {friend?.name} | {friend?.userTag}
          </CardTitle>
        </div>

        <div className="flex items-center gap-4">
          {newConversation && (
            <MessageCirclePlus
              onClick={async () => {
                try {
                  if (!friend?._id) {
                    return;
                  }
                  await createConversation({
                    participantIds: [friend._id, user._id],
                  });
                  toast.success('New conversation started successfully');
                  setIsOpen(false);
                } catch (err) {
                  if (err instanceof ConvexError) {
                    toast.error(err.data);
                  }
                  toast.error('Something went wrong, please try again later');
                }
              }}
            />
          )}

          {remove && (
            <Button
              onClick={async () => {
                if (!friend?._id) {
                  return;
                }
                try {
                  await removeFriend({ _id: friend._id });
                  toast.success('Friend removed successfully');
                } catch (err) {
                  if (err instanceof ConvexError) {
                    toast.error(err.data);
                  }
                  toast.error('Something went wrong, please try again later');
                }
              }}
            >
              Remove friend
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default FriendCard;
