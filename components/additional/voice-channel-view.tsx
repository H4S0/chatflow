import { Call, PaginatedGridLayout } from '@stream-io/video-react-sdk';
import { Doc } from '@/convex/_generated/dataModel';
import {
  CallControls,
  StreamCall,
  StreamTheme,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

interface VoiceChannelViewProps {
  call: Call | null;
  channel: Doc<'channels'>;
  onLeave: () => void;
}

const VoiceChannelView = ({
  call,
  channel,
  onLeave,
}: VoiceChannelViewProps) => {
  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Connecting to voice channel...</p>
      </div>
    );
  }

  return (
    <StreamTheme>
      <StreamCall call={call}>
        <div className="flex flex-col h-full p-5">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">{channel.name}</h2>
            <p className="text-sm text-gray-500">Voice Channel</p>
            <ParticipantCount />
          </div>

          <PaginatedGridLayout />

          <div className="p-4 border-t">
            <CallControls onLeave={onLeave} />
          </div>
        </div>
      </StreamCall>
    </StreamTheme>
  );
};

const ParticipantCount = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <p className="text-sm text-muted-foreground">
      {participants.length} participant{participants.length !== 1 ? 's' : ''} in
      call
    </p>
  );
};

export default VoiceChannelView;
