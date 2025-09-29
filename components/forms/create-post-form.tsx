import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { api } from '@/convex/_generated/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { X, ImagePlus } from 'lucide-react';
import z from 'zod';
import { SocialMediaPostSchema } from '../cards/social-media-card';
import AskAiModal from '../modals/ask-ai-modal';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import Image from 'next/image';
import { Id } from '@/convex/_generated/dataModel';
import { useImageUpload } from '@/hooks/use-image-upload';

const CreatePostForm = ({ serverId }: { serverId: Id<'server'> }) => {
  const createPost = useMutation(api.server.social_media.createPost);

  const form = useForm<z.infer<typeof SocialMediaPostSchema>>({
    resolver: zodResolver(SocialMediaPostSchema),
  });

  const {
    generateImageUpload,
    setImageFile,
    setImagePreviewUrl,
    imagePreviewUrl,
    setImageNull,
    imageFile,
  } = useImageUpload();

  const onSubmit: SubmitHandler<z.infer<typeof SocialMediaPostSchema>> = async (
    data
  ) => {
    try {
      let imageUrl: string | undefined = undefined;

      if (imageFile) {
        imageUrl = await generateImageUpload();

        if (!imageUrl) {
          return toast.error('Image upload failed');
        }
      }

      createPost({
        serverId: serverId,
        content: data.post,
        image: imageUrl,
      });

      toast.success('Post created successfully');
      form.reset({
        post: '',
        image: '',
      });
      setImageFile(null);
      setImagePreviewUrl(null);
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong');
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border border-muted-foreground/20 p-2 rounded-md"
      >
        <FormField
          name="post"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="What is on your mind?"
                  className="border-0 resize-none"
                  maxLength={256}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {imagePreviewUrl && (
          <div className="relative w-full p-4 rounded-md overflow-hidden border">
            <Image
              src={imagePreviewUrl}
              alt="Preview"
              width={600}
              height={400}
              className="w-full h-auto rounded-md object-cover"
            />
            <button
              type="button"
              onClick={setImageNull}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition"
            >
              <X size={16} />
            </button>
            <div className="px-2 py-1 text-xs text-muted-foreground bg-background/70 backdrop-blur-sm border-t">
              {imageFile?.name} ({Math.round((imageFile?.size || 0) / 1024)} KB)
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 mt-5">
          <div className="flex items-center gap-5">
            <AskAiModal form={form} />
            <div className="flex items-center gap-2">
              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
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
                          className="flex items-center justify-center w-10 h-10 border rounded-md cursor-pointer hover:bg-muted"
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
              <p>Photo</p>
            </div>
          </div>
          <Button disabled={!form.watch('post')}>Post</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreatePostForm;
