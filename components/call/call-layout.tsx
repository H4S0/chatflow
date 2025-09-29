'use client';

import React, { useState } from 'react';
import {
  CallControls,
  useCallStateHooks,
  CallingState,
  PaginatedGridLayout,
  ParticipantView,
  SpeakerLayout,
  CancelCallButton,
  ToggleAudioPreviewButton,
} from '@stream-io/video-react-sdk';
import { Button } from '../ui/button';

type CallLayoutProps = {
  endActiveCall: () => void;
};

const CallLayout = ({ endActiveCall }: CallLayoutProps) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const [isMinimized, setIsMinimized] = useState(false);
  const callingState = useCallCallingState();
  const participants = useParticipants();

  if (callingState !== CallingState.JOINED) return null;

  const isSingle = (participants?.length ?? 0) <= 1;
  const primary = participants?.[0];

  return !isMinimized ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div className="relative w-full max-w-4xl h-[50vh] bg-neutral-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl p-2">
        <Button onClick={() => setIsMinimized(true)} variant="outline">
          Minimize
        </Button>

        {isSingle && primary ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="aspect-video w-full max-w-2xl rounded-lg overflow-hidden">
              <ParticipantView participant={primary} />
            </div>
          </div>
        ) : (
          <PaginatedGridLayout />
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <CallControls onLeave={endActiveCall} />
        </div>
      </div>
    </div>
  ) : (
    <>
      <div className="hidden">
        <SpeakerLayout />
      </div>

      <div
        className="
          fixed z-50
          top-4 left-1/2
          -translate-x-1/2
          md:top-auto md:bottom-7 md:left-40
        "
      >
        <div className="flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-4 py-2 shadow-lg border border-white/10">
          <ToggleAudioPreviewButton />
          <CancelCallButton onLeave={endActiveCall} />
          <Button
            onClick={() => setIsMinimized(false)}
            variant="outline"
            size="sm"
          >
            Maximize
          </Button>
        </div>
      </div>
    </>
  );
};

export default CallLayout;
