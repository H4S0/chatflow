'use client';

import { FullConversation } from '@/components/sidebar/friends-sidebar';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  Call,
  CallingState,
  StreamVideoClient,
} from '@stream-io/video-react-sdk';
import { useMutation } from 'convex/react';
import { useEffect, useState, useRef, useCallback } from 'react';

type CallLogicProps = {
  calls: Call[];
  selected: FullConversation | null;
  currentUserId?: Id<'users'>;
  client?: StreamVideoClient;
};

export const useCallLogic = ({
  client,
  calls,
  selected,
  currentUserId,
}: CallLogicProps) => {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<Call | null>(null);
  const [callState, setCallState] = useState<CallingState>(CallingState.IDLE);
  const [callTimings, setCallTimings] = useState<
    { id: string; createdAt?: Date; endedAt?: Date }[]
  >([]);
  const [messageId, setMessageId] = useState<Id<'messages'> | null>(null);

  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef(false);

  const sendCall = useMutation(api.messages.conversation_messages.sendMessage);
  const updateEndedCall = useMutation(
    api.messages.conversation_messages.updateEndedCall
  );

  const fetchCallTimings = useCallback(async () => {
    if (!client || !selected || isFetchingRef.current) return;

    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const response = await client.queryCalls({
        filter_conditions: {
          'custom.conversationId': { $eq: selected.conversationId },
        },
        limit: 10,
        sort: [{ field: 'created_at', direction: -1 }],
      });

      const timings = response?.calls.map((call) => ({
        id: call.id,
        createdAt: call.state.createdAt,
        endedAt: call.state.endedAt,
      }));
      setCallTimings(timings || []);
    } catch (error) {
      console.error('Error fetching call timings:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [client, selected]);

  useEffect(() => {
    if (selected) {
      fetchCallTimings();
    }
  }, [selected?.conversationId, fetchCallTimings, selected]);

  useEffect(() => {
    const joinedCall = calls.find(
      (c) => c.state.callingState === CallingState.JOINED
    );
    const ringingCall = calls.find(
      (c) => c.state.callingState === CallingState.RINGING
    );

    if (joinedCall) {
      setActiveCall(joinedCall);
      setOutgoingCall(null);
      setCallState(CallingState.JOINED);
    } else if (ringingCall) {
      if (ringingCall.isCreatedByMe) {
        setOutgoingCall(ringingCall);
      } else {
        setActiveCall(ringingCall);
      }
      setCallState(CallingState.RINGING);
    } else {
      setActiveCall(null);
      setOutgoingCall(null);
      setCallState(CallingState.IDLE);
    }
  }, [calls]);

  const startCall = async (type: 'audio' | 'video') => {
    if (!selected || !currentUserId || !client) return;

    if (callState !== CallingState.IDLE) {
      console.warn('Call already in progress');
      return;
    }

    try {
      const callId = `${selected.conversationId}-${Date.now()}`;
      const call = client.call('default', callId);

      const memberIds = [
        String(currentUserId),
        ...selected.otherUsers
          .map((u) => u?._id)
          .filter(Boolean)
          .map(String),
      ];

      await call.getOrCreate({
        ring: true,
        video: type === 'video',
        data: {
          members: memberIds.map((user_id) => ({ user_id })),
          custom: { conversationId: selected.conversationId },
          starts_at: new Date().toISOString(),
        },
      });

      setOutgoingCall(call);
      setCallState(CallingState.RINGING);

      const res = await sendCall({
        isCall: true,
        conversationId: selected.conversationId,
        content: 'call',
      });

      setMessageId(res);
    } catch (err) {
      console.error('Failed to start call:', err);
      setOutgoingCall(null);
      setCallState(CallingState.IDLE);
      throw new Error('Failed to start call');
    }
  };

  const endActiveCall = async () => {
    try {
      if (activeCall) {
        await activeCall.leave();
      }
      if (outgoingCall) {
        await outgoingCall.endCall();
      }

      if (messageId && selected) {
        await updateEndedCall({
          id: messageId,
          conversationId: selected.conversationId,
        });
      }
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
      setActiveCall(null);
      setOutgoingCall(null);
      setCallState(CallingState.IDLE);
    }
  };

  return {
    startCall,
    endActiveCall,
    callState,
    activeCall,
    outgoingCall,
    callTimings,
  };
};
