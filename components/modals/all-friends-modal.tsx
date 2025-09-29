import React, { useState } from 'react';
import { User } from '../sidebar/friends-sidebar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import FriendCard from '../cards/friend-card';
import { Id } from '@/convex/_generated/dataModel';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import LoadingSkeleton from '../additional/loading-skeleton';

const AllFriendsModal = ({
  friends,
  loading,
}: {
  friends?: User[];
  loading?: boolean;
}) => {
  const currentUser = useQuery(api.users.viewer);
  const createConversation = useMutation(
    api.messages.conversation.createConversation
  );
  const [isOpen, setIsOpen] = useState(false);
  const [group, setGroup] = useState<Id<'users'>[] | null>([]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          All friends
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage all of your friends</DialogTitle>
        </DialogHeader>
        {loading ? (
          <LoadingSkeleton />
        ) : friends?.length ? (
          friends?.map((friend) => (
            <FriendCard
              friend={friend}
              key={friend?._id}
              remove="true"
              newConversation="true"
              setIsOpen={setIsOpen}
              setGroup={setGroup}
              group={group}
            />
          ))
        ) : (
          <p>
            <span className="text-primary">So sorry</span> but you don’t have
            any friends
          </p>
        )}
        {group && group.length > 1 && (
          <DialogFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={async () => {
                try {
                  if (!currentUser) {
                    toast.error('You must be logged in to create a group chat');
                    return;
                  }

                  const participantIds = [
                    currentUser._id,
                    ...group.map((user) => user),
                  ];

                  await createConversation({
                    participantIds: participantIds,
                  });
                  toast.success('Group conversation created successfully');
                } catch (err) {
                  if (err instanceof ConvexError) {
                    toast.error(err.data);
                  }
                  toast.error('Something went wrong');
                }
              }}
            >
              Create group chat
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AllFriendsModal;
