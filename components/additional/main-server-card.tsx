import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import CreateChannelModal from '../modals/create-channel-modal';
import { ServerType } from '../sidebar/server-sidebar';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import ChannelCard from '../cards/channel-card';
import { Doc } from '@/convex/_generated/dataModel';
import LoadingSkeleton from './loading-skeleton';
import ServerChatCard from '../cards/server-chat-card';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';
import { useVoiceChannels } from '@/hooks/use-channel-call';
import VoiceChannelView from './voice-channel-view';

const MainServerCard = ({
  selected,
  setMemberSidebar,
}: {
  selected: ServerType;
  setMemberSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { activeCall, joinVoiceChannel, leaveVoiceChannel } =
    useVoiceChannels();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedChannel, setSelectedChannel] =
    useState<Doc<'channels'> | null>(null);

  const allServerMembers = useQuery(api.server.server.getAllServerMembers, {
    serverId: selected._id,
  });
  const channels = useQuery(api.server.channel.getChannels, {
    serverId: selected._id,
  });

  const manageChannelsUserPermission = useQuery(
    api.server.roles.hasPermission,
    {
      serverId: selected._id,
      permission: 'MANAGE_CHANNELS',
    }
  );

  const viewChannelsUserPermission = useQuery(api.server.roles.hasPermission, {
    serverId: selected._id,
    permission: 'VIEW_CHANNELS',
  });

  const userRoles = useQuery(api.server.roles.getUserRole, {
    serverId: selected._id,
  });

  const firstTextChannel = channels?.find((channel) => channel.type === 'text');

  const handleVoiceChannelJoin = async (channel: Doc<'channels'>) => {
    try {
      if (activeCall && activeCall.id !== channel._id) {
        await handleLeaveVoiceChannel();
      }

      if (activeCall && activeCall.id === channel._id) {
        return;
      }

      await joinVoiceChannel(channel);
      setSelectedChannel(channel);
    } catch (error) {
      console.error('Error joining voice channel:', error);
      if (firstTextChannel) {
        setSelectedChannel(firstTextChannel);
      }
    }
  };

  const handleTextChannelSelect = (channel: Doc<'channels'>) => {
    if (activeCall) {
      handleLeaveVoiceChannel();
    }
    setSelectedChannel(channel);
  };

  const handleLeaveVoiceChannel = async () => {
    try {
      await leaveVoiceChannel();
    } catch (error) {
      console.error('Error leaving voice channel:', error);
    } finally {
      if (firstTextChannel) {
        setSelectedChannel(firstTextChannel);
      } else {
        setSelectedChannel(null);
      }
    }
  };

  useEffect(() => {
    if (selectedChannel?.type === 'audio' && !activeCall) {
      if (firstTextChannel) {
        setSelectedChannel(firstTextChannel);
      } else {
        setSelectedChannel(null);
      }
    }
  }, [activeCall, selectedChannel, firstTextChannel]);

  const renderContent = () => {
    if (!selectedChannel) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground">
            Select a channel to get started
          </p>
          {firstTextChannel && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedChannel(firstTextChannel)}
            >
              Go to General
            </Button>
          )}
        </div>
      );
    }

    if (selectedChannel.type === 'text') {
      return (
        <ServerChatCard
          selectedChannel={selectedChannel}
          allServerMembers={allServerMembers}
          setMemberSidebar={setMemberSidebar}
        />
      );
    }

    if (selectedChannel.type === 'audio') {
      return (
        <VoiceChannelView
          call={activeCall}
          channel={selectedChannel}
          onLeave={handleLeaveVoiceChannel}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex md:flex-row w-full relative">
      <Card className="w-full py-0 h-[calc(100vh-6.6rem)] bg-transparent">
        <div className="flex w-full h-full">
          <div
            className={`
              fixed inset-y-0 left-0 z-20 w-64 bg-background p-4 flex flex-col gap-5 transform transition-transform duration-300
              md:relative md:translate-x-0 md:w-[20%] md:flex
              ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <div className="flex items-center justify-between md:hidden">
              <p className="text-sm font-semibold text-muted-foreground">
                Hide channels
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSidebarExpanded(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {manageChannelsUserPermission === undefined ? (
              <LoadingSkeleton />
            ) : manageChannelsUserPermission ? (
              <CreateChannelModal selected={selected} />
            ) : null}

            {!channels ? (
              <LoadingSkeleton />
            ) : channels.length ? (
              channels
                .filter((channel) => {
                  if (!channel) return false;

                  if (!channel.visible || channel.visible.type === 'everyone')
                    return true;

                  if (channel.visible.type === 'roles') {
                    const hasRole = channel.visible.roles.some((role) =>
                      userRoles?.includes(role)
                    );
                    if (hasRole) return true;
                  }

                  if (
                    manageChannelsUserPermission ||
                    viewChannelsUserPermission
                  )
                    return true;

                  return false;
                })
                .map((channel, i, filtered) => {
                  const prev = filtered[i - 1];
                  const showHeader = i === 0 || channel.type !== prev?.type;

                  return (
                    <ChannelCard
                      key={channel._id}
                      channel={channel}
                      showHeader={showHeader}
                      setSelectedChannel={handleTextChannelSelect}
                      selectedChannel={selectedChannel}
                      userPermission={manageChannelsUserPermission}
                      serverRoles={selected.roles!}
                      onVoiceChannelJoin={handleVoiceChannelJoin}
                    />
                  );
                })
            ) : (
              <p className="text-muted-foreground text-center mt-4">
                No channels yet
              </p>
            )}
          </div>

          <Separator orientation="vertical" className="hidden md:block" />

          <div className="w-full relative">
            {!isSidebarExpanded && (
              <div className="p-2 md:hidden flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsSidebarExpanded(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <p className="text-sm font-semibold text-muted-foreground">
                  Show channels
                </p>
              </div>
            )}

            {renderContent()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MainServerCard;
