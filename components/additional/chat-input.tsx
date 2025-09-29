'use client';

import React from 'react';
import { FullConversation } from '../sidebar/friends-sidebar';
import { SelectedMessageState } from '../cards/chat-card';
import { useChatInput } from '@/hooks/useChatInput';
import CoreInput from '../forms/core-input';
import { Id } from '@/convex/_generated/dataModel';

export type ChatInputProps = {
  selected: FullConversation | null;
  message: string;
  selectedMessage: SelectedMessageState;
  setMessage: (message: string) => void;
  setSelectedMessageState: (selectedMessage: SelectedMessageState) => void;
};

const ChatInput = ({
  selected,
  message,
  selectedMessage,
  setMessage,
  setSelectedMessageState,
}: ChatInputProps) => {
  const {
    setImageNull,
    handleImageSelect,
    handleSendMessage,
    imagePreviewUrl,
    inputRef,
    showSuggestions,
    filteredUsers,
    highlightIndex,
    handleSelectMention,
    handleMentionKeyDown,
    handleInputChange,
    handleCursorMove,
    isSending,
    chatFileInputRef,
  } = useChatInput({
    selected,
    message,
    setMessage,
    setSelectedMessageState,
    selectedMessage,
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
      selectedMessageId={selectedMessage.id as Id<'messages'>}
      otherUsers={selected?.otherUsers}
      handleImageSelect={handleImageSelect}
    />
  );
};

export default ChatInput;
