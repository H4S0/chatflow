import { Id } from '@/convex/_generated/dataModel';
import { Phone, Video } from 'lucide-react';
import React from 'react';
import MessageSearchModal from '../modals/message-search-modal';

const StartCallComponents = ({
  startCall,
  conversationId,
  scrollToMessage,
}: {
  startCall: (type: 'audio' | 'video') => void;
  conversationId: Id<'conversations'>;
  scrollToMessage: (id: Id<'messages'>) => void;
}) => {
  return (
    <div className="flex items-center gap-5">
      <Phone
        className="cursor-pointer hover:text-primary"
        onClick={() => startCall('audio')}
      />
      <Video
        className="cursor-pointer hover:text-primary"
        onClick={() => startCall('video')}
      />
      {conversationId && (
        <MessageSearchModal
          conversationId={conversationId}
          onMessageFound={(id) => scrollToMessage(id)}
        />
      )}
    </div>
  );
};

export default StartCallComponents;
