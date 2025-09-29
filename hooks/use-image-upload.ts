import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useState } from 'react';

export const useImageUpload = () => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const generateUploadUrl = useMutation(
    api.messages.conversation_messages.generateUploadUrl
  );

  async function generateImageUpload() {
    let imageUrl = '';

    if (imageFile) {
      const uploadUrl = await generateUploadUrl();

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile,
      });

      const { storageId } = await res.json();
      imageUrl = storageId || '';

      return imageUrl;
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  }

  const setImageNull = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  return {
    setImageNull,
    generateImageUpload,
    handleImageSelect,
    setImagePreviewUrl,
    setImageFile,
    imagePreviewUrl,
    imageFile,
  };
};
