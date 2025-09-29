'use client';

import { ChatInputProps } from '@/components/additional/chat-input';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { ConvexError } from 'convex/values';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { useImageUpload } from './use-image-upload';

type User = Doc<'users'>;

export type Mention = {
  id: number;
  start: number;
  end: number;
  userId: Id<'users'>;
  text: string;
};

export const useChatInput = ({
  selected,
  message,
  selectedMessage,
  setMessage,
  setSelectedMessageState,
}: ChatInputProps) => {
  const sendMessage = useMutation(
    api.messages.conversation_messages.sendMessage
  );
  const updateMessage = useMutation(
    api.messages.conversation_messages.updateMessage
  );
  const currentUserId = useQuery(api.users.viewer);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [editingMentionId, setEditingMentionId] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [justSelectedMention, setJustSelectedMention] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const {
    imageFile,
    imagePreviewUrl,
    handleImageSelect,
    generateImageUpload,
    setImageFile,
    setImagePreviewUrl,
    setImageNull,
  } = useImageUpload();

  const usersWithoutLogged = useMemo(
    () =>
      selected?.participants.filter(
        (u): u is User => !!u && u._id !== currentUserId?._id
      ) || [],
    [selected, currentUserId?._id]
  );

  const filteredUsers = usersWithoutLogged.filter((u) =>
    u?.name?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => setHighlightIndex(0), [query]);

  const handleCursorMove = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  useEffect(() => {
    if (!inputRef.current) return;

    const mentionUnderCursor = mentions.find(
      (m) => cursorPosition >= m.start && cursorPosition <= m.end
    );

    if (mentionUnderCursor) {
      const userUnderCursor = usersWithoutLogged.find(
        (u) => u._id === mentionUnderCursor.userId
      );
      if (userUnderCursor) {
        setShowSuggestions(true);
        setQuery(userUnderCursor.name!);
        setEditingMentionId(mentionUnderCursor.id);
        setHighlightIndex(0);
      }
    } else {
      setEditingMentionId(null);
      const textUntilCursor = inputRef.current.value.slice(0, cursorPosition);
      const newMentionMatch = textUntilCursor.match(
        /@([A-Za-z]*(?:\s[A-Za-z]*)?)$/
      );

      if (newMentionMatch) {
        const charBeforeMatch = newMentionMatch.index
          ? textUntilCursor[newMentionMatch.index - 1]
          : null;

        if (
          (newMentionMatch && charBeforeMatch === ' ') ||
          newMentionMatch?.index === 0
        ) {
          setShowSuggestions(true);
          setQuery(newMentionMatch[1]);
          setHighlightIndex(0);
        }
      } else {
        setShowSuggestions(false);
        setQuery('');
      }
    }
  }, [cursorPosition, mentions, usersWithoutLogged]);

  useEffect(() => {
    const newMentions: Mention[] = [];
    const mentionRegex = /@([A-Za-z]+ [A-Za-z]+)/g;
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      const user = usersWithoutLogged.find(
        (u) => `${u.name}`.toLowerCase() === match[1].toLowerCase()
      );
      if (user) {
        newMentions.push({
          id: Date.now() + newMentions.length,
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          userId: user._id,
        });
      }
    }
    setMentions(newMentions);
  }, [message, usersWithoutLogged]);

  const handleSelectMention = (name: string) => {
    const input = inputRef.current;
    if (!input) return;

    const cursorPos = input.selectionStart || 0;
    const textUntilCursor = input.value.slice(0, cursorPos);
    setJustSelectedMention(true);

    if (editingMentionId) {
      const mentionToEdit = mentions.find((m) => m.id === editingMentionId);
      if (mentionToEdit) {
        const before = input.value.slice(0, mentionToEdit.start);
        const after = input.value.slice(mentionToEdit.end);
        const newText = `${before}@${name} ${after}`;
        setMessage(newText);

        const newCursor = mentionToEdit.start + name.length + 2;
        setTimeout(() => {
          input.setSelectionRange(newCursor, newCursor);
          input.focus();
        }, 0);
      }
    } else {
      const match = textUntilCursor.match(/@([A-Za-z]*(?:\s[A-Za-z]*)?)$/);
      if (match && match.index !== undefined) {
        const before = textUntilCursor.slice(0, match.index);
        const after = input.value.slice(cursorPos);
        const newText = `${before}@${name} ${after}`;
        setMessage(newText);

        const newCursor = before.length + name.length + 2;
        setTimeout(() => {
          input.setSelectionRange(newCursor, newCursor);
          input.focus();
        }, 0);
      }
    }

    setShowSuggestions(false);
    setQuery('');
    setEditingMentionId(null);
    setTimeout(() => setJustSelectedMention(false), 100);
  };

  const handleMentionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev === 0 ? filteredUsers.length - 1 : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredUsers[highlightIndex]) {
          handleSelectMention(filteredUsers[highlightIndex].name!);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setEditingMentionId(null);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setMessage(value);
    setCursorPosition(cursorPos);

    if (editingMentionId) {
      const mentionToEdit = mentions.find((m) => m.id === editingMentionId);
      if (mentionToEdit && cursorPos > mentionToEdit.start) {
        const textUntilCursor = value.slice(0, cursorPos);
        const textAfterAt = textUntilCursor.slice(mentionToEdit.start + 1);
        const currentQuery = textAfterAt.split(' ')[0];
        setQuery(currentQuery);
        setShowSuggestions(true);
        return;
      }
    }
    if (justSelectedMention) return;

    const textUntilCursor = value.slice(0, cursorPos);
    const match = textUntilCursor.match(/@([A-Za-z]*(?:\s[A-Za-z]*)?)$/);
    if (match) {
      const charBeforeMatch = match.index
        ? textUntilCursor[match.index - 1]
        : null;
      if ((match && charBeforeMatch === ' ') || match?.index === 0) {
        setShowSuggestions(true);
        setQuery(match[1]);
        setHighlightIndex(0);
      } else {
        setShowSuggestions(false);
        setQuery('');
      }
    } else {
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !imageFile) || !selected) return;

    try {
      setIsSending(true);
      let imageStorageId: string | undefined = undefined;

      if (imageFile) {
        imageStorageId = await generateImageUpload();

        if (!imageStorageId) {
          setIsSending(false);
          return toast.error('Image upload failed');
        }
      }

      if (selectedMessage.id) {
        await updateMessage({
          conversationId: selected.conversationId,
          messageId: selectedMessage.id as Id<'messages'>,
          content: message,
        });

        toast.success('Message updated');
      } else {
        await sendMessage({
          conversationId: selected.conversationId,
          content: message,
          image: imageStorageId,
        });
        toast.success('Message sent');
      }

      setMessage('');
      setImageFile(null);
      setImagePreviewUrl(null);
      setSelectedMessageState({ content: '', id: null });
    } catch (err) {
      if (err instanceof ConvexError) toast.error(err.data);
      else toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return {
    handleSendMessage,
    handleImageSelect,
    setImageNull,
    imagePreviewUrl,
    chatFileInputRef,
    message,
    mentions,
    inputRef,
    showSuggestions,
    query,
    filteredUsers,
    highlightIndex,
    cursorPosition,
    editingMentionId,
    justSelectedMention,
    handleSelectMention,
    handleMentionKeyDown,
    handleInputChange,
    handleCursorMove,
    isSending,
  };
};
