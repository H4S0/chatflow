'use client';

import Link from 'next/link';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Server, Users } from 'lucide-react';
import NotificationDropdown, {
  NotificationProps,
} from './notification-dropdown';
import UserDropdown from './dashboard-user-dropdown';
import StatusDropdown from './status-dropdown';
import { useIsMobile } from '@/hooks/user-mobile';

type LayoutType = 'friends' | 'servers';

const DashboardNavbar = ({
  activeLayout,
  setActiveLayout,
}: {
  setActiveLayout?: (value: LayoutType) => void;
  activeLayout?: LayoutType;
}) => {
  const friendRequestNotification = useQuery(
    api.friend_request.getFriendRequests
  );

  const mentionConversationNotification = useQuery(
    api.messages.conversation_messages.getMentionNotifications,
    { scope: 'conversation' }
  );

  const mentionChannelNotification = useQuery(
    api.messages.conversation_messages.getMentionNotifications,
    { scope: 'channel' }
  );

  const user = useQuery(api.users.viewer);
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const handleTabChange = (value: string) => {
    if (value === 'friends' || value === 'servers') {
      setActiveLayout?.(value);
    }
  };

  const notifications: NotificationProps[] = [
    ...(friendRequestNotification?.map((n) => ({
      ...n,
      type: 'friend_request' as const,
      createdAt: n.createdAt ?? n._creationTime,
    })) || []),

    ...(mentionConversationNotification?.map((n) => ({
      ...n,
      type: 'conversation_mention' as const,
      scope: 'conversation' as const,
      createdAt: n.timestamp ?? n._creationTime,
    })) || []),

    ...(mentionChannelNotification?.map((n) => ({
      ...n,
      type: 'channel_mention' as const,
      scope: 'channel' as const,
      createdAt: n.timestamp ?? n._creationTime,
    })) || []),
  ];

  return (
    <nav className="flex items-center justify-between py-3 px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className=" text-5xl font-thin italic hidden md:block">
          Chat<span className="font-bold">Flow</span>
        </Link>
        {pathname !== '/dashboard/profile' && !pathname.includes('/server') && (
          <Tabs
            value={activeLayout}
            onValueChange={handleTabChange}
            className="ml-0 md:ml-6 w-full"
          >
            <TabsList className="grid grid-cols-2 w-full gap-2 p-[6px] items-center h-auto md:p-[5px]">
              <TabsTrigger value="friends" className="w-full p-2">
                {isMobile ? <Users /> : 'Friends'}
              </TabsTrigger>
              <TabsTrigger value="servers" className="w-full p-2">
                {isMobile ? <Server /> : 'Servers'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        {pathname !== '/dashboard' && (
          <Link href="/dashboard" className="flex items-center gap-3 ml-3">
            <ArrowLeft />
            <p className="text-sm">Back to dashboard</p>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-10">
        <NotificationDropdown
          notifications={notifications}
          isLoading={
            notifications === undefined ||
            friendRequestNotification === undefined ||
            mentionConversationNotification === undefined ||
            mentionChannelNotification === undefined
          }
        />
        <StatusDropdown status={user?.status} />
        <UserDropdown
          username={user?.name}
          userEmail={user?.email}
          userImage={user?.imageUrl}
          userTag={user?.userTag}
        />
      </div>
    </nav>
  );
};

export default DashboardNavbar;
