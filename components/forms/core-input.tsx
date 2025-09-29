import React from 'react';
import { CardFooter } from '../ui/card';
import Image from 'next/image';
import { Input } from '../ui/input';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { SelectedMessageState } from '../cards/chat-card';

type CoreInputProps = {
  imagePreviewUrl: string | null;
  setImageNull: () => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSending: boolean;
  setSelectedMessageState: (selectedMessage: SelectedMessageState) => void;
  setMessage: (message: string) => void;
  showSuggestions: boolean;
  filteredUsers: (Doc<'users'> | null)[];
  highlightIndex: number;
  handleSentMessage: () => Promise<string | number | undefined>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  selectedMessageId: Id<'messages'> | Id<'channel_messages'>;
  handleSelectMention: (name: string) => void;
  handleMentionKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCursorMove: () => void;
  message: string;
  chatFileInputRef?: React.RefObject<HTMLInputElement | null>;
  otherUsers?: (Doc<'users'> | null)[];
};

const CoreInput = ({
  imagePreviewUrl,
  setImageNull,
  handleImageSelect,
  isSending,
  setSelectedMessageState,
  setMessage,
  showSuggestions,
  filteredUsers,
  highlightIndex,
  handleSentMessage,
  inputRef,
  handleCursorMove,
  handleSelectMention,
  handleMentionKeyDown,
  handleInputChange,
  selectedMessageId,
  message,
  chatFileInputRef,
}: CoreInputProps) => {
  return (
    <CardFooter className="flex flex-col gap-2 sm:gap-3 w-full">
      {imagePreviewUrl && (
        <div className="relative w-full max-w-xs sm:max-w-sm mb-2">
          <Image
            src={imagePreviewUrl}
            height={120}
            width={120}
            alt="Preview"
            className="rounded-md object-cover w-full h-auto"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            onClick={setImageNull}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {selectedMessageId && (
        <div className="w-full py-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Editing message...</span>
          <button
            className="text-xs text-red-500 hover:underline"
            onClick={() => {
              setSelectedMessageState({ content: '', id: null });
              setMessage('');
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="relative flex items-center gap-2 sm:gap-3 w-full">
        {showSuggestions && filteredUsers.length > 0 && (
          <div className="absolute bottom-12 left-2 bg-secondary w-56 sm:w-64 max-h-48 overflow-y-auto z-50 space-y-1 p-1 rounded-md shadow-lg">
            {filteredUsers.map((user, index) => (
              <div
                key={user?._id}
                className={`p-2 cursor-pointer rounded-md ${
                  index === highlightIndex
                    ? 'bg-muted-foreground/20'
                    : 'hover:bg-muted-foreground/20'
                }`}
                onClick={() => {
                  if (!user?.name) return;
                  handleSelectMention(user.name);
                }}
              >
                <span className="font-medium">{user?.name}</span>{' '}
                <span className="text-xs text-gray-400">| {user?.userTag}</span>
              </div>
            ))}
          </div>
        )}

        <Input
          ref={inputRef}
          placeholder="Message @someone"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleMentionKeyDown}
          onClick={handleCursorMove}
          onKeyUp={handleCursorMove}
          className="flex-1 min-w-0"
        />

        <input
          type="file"
          accept="image/*"
          id="chat-image"
          style={{ display: 'none' }}
          ref={chatFileInputRef}
          onChange={handleImageSelect}
        />
        <label onClick={() => chatFileInputRef?.current?.click()}>
          <ImagePlus className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer hover:text-primary" />
        </label>

        <Button onClick={handleSentMessage} size="icon" disabled={isSending}>
          {isSending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </CardFooter>
  );
};

export default CoreInput;
