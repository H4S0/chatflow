import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Bell, Loader2, MessageSquare, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface BaseNotification {
  _id: Id<'friend_requests'> | Id<'messages'> | Id<'channel_messages'>;
  type: 'friend_request' | 'channel_mention' | 'conversation_mention';
  createdAt: number;
}

interface FriendRequestNotification extends BaseNotification {
  type: 'friend_request';
  senderName?: string;
  senderTag?: string;
  senderId: Id<'users'>;
  reciverId: Id<'users'>;
  status: 'pending' | 'accepted' | 'declined';
}

interface MentionChannelNotification extends BaseNotification {
  type: 'channel_mention';
  senderId: Id<'users'>;
  content: string;
  timestamp: number;
}

interface MentionConversationNotification extends BaseNotification {
  type: 'conversation_mention';
  senderId: Id<'users'>;
  content: string;
  timestamp: number;
}

export type NotificationProps =
  | FriendRequestNotification
  | MentionChannelNotification
  | MentionConversationNotification;

const NotificationDropdown = ({
  notifications,
  isLoading,
}: {
  notifications: NotificationProps[];
  isLoading: boolean;
}) => {
  const acceptFriendRequest = useMutation(
    api.friend_request.acceptFriendRequest
  );
  const declineFriendRequest = useMutation(
    api.friend_request.declineFriendRequest
  );
  const markMentionRead = useMutation(
    api.messages.conversation_messages.markMentionAsRead
  );
  const markChannelMessageAsRead = useMutation(
    api.messages.channel_messages.markChannelMessageMentionAsRead
  );

  const handleAccept = async (requestId: Id<'friend_requests'>) => {
    try {
      await acceptFriendRequest({ requestId });
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleMentionConversationMessageClick = async (
    messageId: Id<'messages'>
  ) => {
    try {
      await markMentionRead({ messageId });
    } catch (err) {
      console.error('Failed to mark mention as read', err);
    }
  };

  const handleMentionChannelMessageClick = async (
    messageId: Id<'channel_messages'>
  ) => {
    try {
      await markChannelMessageAsRead({ messageId });
    } catch (err) {
      console.error('Failed to mark mention as read', err);
    }
  };

  const handleDecline = async (requestId: Id<'friend_requests'>) => {
    try {
      await declineFriendRequest({ requestId });
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 mr-2">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground text-sm">
            No new notifications
          </DropdownMenuItem>
        ) : (
          notifications.map((item) => (
            <DropdownMenuItem
              key={item._id}
              className="flex flex-col items-start gap-2 py-2"
            >
              {item.type === 'friend_request' && (
                <>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {item.senderName || 'Unknown user'} (
                      {item.senderTag || 'unknown'})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Friend request • {new Date(item.createdAt).toLocaleString()}
                  </p>
                  {item.status === 'pending' && (
                    <DropdownMenuGroup className="flex items-center gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleAccept(item._id as Id<'friend_requests'>)
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          handleDecline(item._id as Id<'friend_requests'>)
                        }
                      >
                        Decline
                      </Button>
                    </DropdownMenuGroup>
                  )}
                </>
              )}

              {item.type === 'conversation_mention' && (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    handleMentionConversationMessageClick(
                      item._id as Id<'messages'>
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">You were mentioned</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.content} • {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              )}

              {item.type === 'channel_mention' && (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    handleMentionChannelMessageClick(
                      item._id as Id<'channel_messages'>
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">You were mentioned</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.content} • {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
