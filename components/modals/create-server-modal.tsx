'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import z from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import TagsArrayForm from '../additional/tags-array-form';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import CreateServerFields from '../forms/create-server-fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useImageUpload } from '@/hooks/use-image-upload';
import { on } from 'events';

export const serverCategories = [
  'Information',
  'Rules',
  'Updates',
  'Events',
  'Community',
  'Off-topic',
  'Gaming',
  'Voice Channels',
  'Media',
  'Music',
  'Support',
  'Feedback',
  'Staff',
  'Bots',
  'Moderation',
];

export const CreateServerSchema = z.object({
  serverName: z.string().min(1, 'Server name is required'),
  category: z.string(),
  status: z.enum(['open', 'locked', 'inv']),
  tags: z.array(z.string()),
  image: z.string(),
});

const CreateServerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const createServer = useMutation(api.server.server.createServer);

  const {
    generateImageUpload,
    setImageFile,
    setImagePreviewUrl,
    imagePreviewUrl,
    setImageNull,
    imageFile,
  } = useImageUpload();

  const form = useForm<z.infer<typeof CreateServerSchema>>({
    resolver: zodResolver(CreateServerSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateServerSchema>> = async (
    data
  ) => {
    try {
      const imageUrl = await generateImageUpload();

      if (!imageUrl) {
        return toast.error('Image upload failed. Please try again!');
      }

      await createServer({
        ...data,
        image: imageUrl,
      });

      toast.success('Server created successfully');
      setIsOpen(false);
      form.reset();
      setImageFile(null);
      setImagePreviewUrl(null);
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong. Please try again!');
      }
    }
  };

  function handleImageSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));

      onChange(file.name);
    }
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button>Create own server</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Server</DialogTitle>
          <DialogDescription>
            Enter an invite link or browse featured servers
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <CreateServerFields form={form} />
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Status
                    <span className="text-primary">
                      (can be modified earlier)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Server status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectContent>
                          <SelectItem value="open">
                            Open for everyone
                          </SelectItem>
                          <SelectItem value="locked">Locked</SelectItem>
                          <SelectItem value="inv">Invite only</SelectItem>
                        </SelectContent>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <TagsArrayForm form={form} />

            {imagePreviewUrl && (
              <div className="relative w-full mb-2">
                <Image
                  src={imagePreviewUrl}
                  height={120}
                  width={120}
                  alt="Preview"
                  className="rounded-md"
                />
                <button
                  type="button"
                  className="absolute -top-1 left-27 bg-red-500 text-white rounded-full p-1"
                  onClick={setImageNull}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <FormField
              name="image"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="chat-image-upload"
                        className="hidden"
                        onChange={(e) => handleImageSelect(e, field.onChange)}
                      />

                      <label
                        htmlFor="chat-image-upload"
                        className="flex items-center justify-center w-12 h-12 border rounded-md cursor-pointer hover:bg-muted"
                      >
                        <ImagePlus className="w-6 h-6" />
                      </label>

                      {imageFile && (
                        <span className="text-sm">{imageFile.name}</span>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit">
              Create server
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServerModal;
