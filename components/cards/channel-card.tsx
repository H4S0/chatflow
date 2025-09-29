import { Doc } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import React from 'react';
import ChannelSettingsModal from '../modals/channel-settings-modal';

type ChannelCardProps = {
  channel: Doc<'channels'>;
  showHeader: boolean;
  setSelectedChannel: (selected: Doc<'channels'>) => void;
  selectedChannel: Doc<'channels'> | null;
  userPermission: boolean | undefined;
  serverRoles: string[];
  onVoiceChannelJoin?: (channel: Doc<'channels'>) => void;
};

const ChannelCard = ({
  channel,
  showHeader,
  setSelectedChannel,
  selectedChannel,
  userPermission,
  serverRoles,
  onVoiceChannelJoin,
}: ChannelCardProps) => {
  const handleChannelClick = async () => {
    if (channel.type === 'text') {
      setSelectedChannel(channel);
    } else if (channel.type === 'audio' && onVoiceChannelJoin) {
      onVoiceChannelJoin(channel);
    }
  };

  return (
    <div className="flex flex-col items-start">
      {showHeader && (
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          {channel.type === 'text' ? 'TEXT CHANNELS' : 'VOICE CHANNELS'}
        </p>
      )}
      <div
        className={cn(
          'flex items-center justify-between w-full p-1 rounded-md group cursor-pointer',
          selectedChannel?._id === channel._id
            ? 'bg-muted-foreground/20'
            : 'hover:bg-muted-foreground/10'
        )}
        onClick={handleChannelClick}
      >
        <div className="flex items-center gap-2">
          <p className="text-sm">{channel.name}</p>
          {channel.type === 'audio' && (
            <span className="text-xs text-green-500">●</span>
          )}
        </div>
        <div
          className={cn(
            'opacity-0 transition',
            selectedChannel?._id === channel._id
              ? 'opacity-100'
              : 'group-hover:opacity-100'
          )}
        >
          {userPermission && (
            <ChannelSettingsModal channel={channel} serverRoles={serverRoles} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
