// hooks/use-channel-call.ts
import { useState, useCallback } from 'react';
import { useStreamVideoClient, Call } from '@stream-io/video-react-sdk';
import { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const useVoiceChannels = () => {
  const videoClient = useStreamVideoClient();
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const currentUser = useQuery(api.users.viewer);
  const joinVoiceChannel = useCallback(
    async (channel: Doc<'channels'>) => {
      if (!videoClient || !currentUser) return null;

      try {
        const call = videoClient.call('default', channel._id);

        await call.getOrCreate({
          data: {
            members: [
              {
                user_id: currentUser._id,
                role: 'user',
              },
            ],
            custom: {
              channel_name: channel.name,
              type: 'voice_channel',
              server_id: channel.serverId,
            },
          },
        });

        await call.join();
        setActiveCall(call);

        return call;
      } catch (error) {
        console.error('Failed to join voice channel:', error);
        setActiveCall(null);
        throw error;
      }
    },
    [videoClient, currentUser]
  );

  const leaveVoiceChannel = useCallback(async () => {
    if (activeCall) {
      try {
        if (activeCall.state?.participants) {
          await activeCall.leave();
        }
      } catch (error) {
        console.error('Error leaving call:', error);
      } finally {
        setActiveCall(null);
      }
    }
  }, [activeCall]);

  return {
    activeCall,
    joinVoiceChannel,
    leaveVoiceChannel,
    setActiveCall,
  };
};
