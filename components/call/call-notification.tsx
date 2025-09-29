import React from 'react';
import {
  Call,
  StreamCall,
  RingingCall,
  useCallStateHooks,
  CallingState,
} from '@stream-io/video-react-sdk';

const CallNotification = ({ call }: { call: Call }) => {
  return (
    <StreamCall call={call} key={`ringing-${call.cid}`}>
      <Inner />
    </StreamCall>
  );
};

export default CallNotification;

const Inner = () => {
  const { useCallCallingState } = useCallStateHooks();
  const state = useCallCallingState();

  if (state !== CallingState.RINGING) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-background p-4">
        <RingingCall />
      </div>
    </div>
  );
};
