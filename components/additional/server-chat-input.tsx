'use client';

import React from 'react';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useServerInput } from '@/hooks/use-server-input';
import { MessageIds } from '../cards/message-card';

import CoreInput from '../forms/core-input';

export type SelectedChannelMessageState = {
  content: string;
  id: MessageIds | null;
};

export type ServerChatInputProps = {
  selectedChannel: Doc<'channels'>;
  allServerMembers?: (Doc<'users'> | null)[];
  message: string;
  selectedMessage: SelectedChannelMessageState;
  setMessage: (message: string) => void;
  setSelectedMessageState: (
    selectedMessage: SelectedChannelMessageState
  ) => void;
};

const ServerChatInput = ({
  selectedChannel,
  allServerMembers,
  selectedMessage,
  setMessage,
  setSelectedMessageState,
  message,
}: ServerChatInputProps) => {
  const {
    handleSendMessage,
    handleImageSelect,
    setImageNull,
    imagePreviewUrl,
    inputRef,
    chatFileInputRef,
    showSuggestions,
    filteredUsers,
    highlightIndex,
    handleSelectMention,
    handleMentionKeyDown,
    handleInputChange,
    handleCursorMove,
    isSending,
  } = useServerInput({
    selectedChannel,
    allServerMembers: allServerMembers!,
    message,
    setMessage,
    selectedMessage,
    setSelectedMessageState,
  });

  return (
    <CoreInput
      imagePreviewUrl={imagePreviewUrl}
      isSending={isSending}
      setImageNull={setImageNull}
      setSelectedMessageState={setSelectedMessageState}
      setMessage={setMessage}
      showSuggestions={showSuggestions}
      filteredUsers={filteredUsers}
      highlightIndex={highlightIndex}
      handleSentMessage={handleSendMessage}
      inputRef={inputRef}
      chatFileInputRef={chatFileInputRef}
      handleCursorMove={handleCursorMove}
      handleSelectMention={handleSelectMention}
      handleMentionKeyDown={handleMentionKeyDown}
      handleInputChange={handleInputChange}
      message={message}
      selectedMessageId={selectedMessage.id as Id<'channel_messages'>}
      handleImageSelect={handleImageSelect}
    />
  );
};

export default ServerChatInput;
