'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import z from 'zod';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { FormField, FormItem, FormLabel, FormControl, Form } from '../ui/form';
import Image from 'next/image';
import { Input } from '../ui/input';
import { useImageUpload } from '@/hooks/use-image-upload';

export const ImageUploadSchema = z.object({
  image: z.string().optional(),
});

const ImageUploadForm = ({
  image,
  imageUrl,
}: {
  image?: string;
  imageUrl?: string | null;
}) => {
  const updateImage = useMutation(api.users.updateImage);

  const {
    imageFile,
    imagePreviewUrl,
    generateImageUpload,
    setImageFile,
    setImagePreviewUrl,
    setImageNull,
  } = useImageUpload();

  useEffect(() => {
    setImagePreviewUrl(imageUrl || null);
  }, [imageUrl, setImagePreviewUrl]);

  const form = useForm<z.infer<typeof ImageUploadSchema>>({
    resolver: zodResolver(ImageUploadSchema),
    defaultValues: { image },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof ImageUploadSchema>
  > = async () => {
    try {
      const storageId = await generateImageUpload();

      if (!storageId) {
        return toast.error('Image upload failed');
      }

      await updateImage({ image: storageId });

      toast.success('Image updated successfully');

      setImageFile(null);
    } catch (err) {
      if (err instanceof ConvexError) toast.error(err.data);
      else toast.error('Something went wrong');
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
    <Card>
      <CardHeader>
        <CardTitle>Update Profile Image</CardTitle>
        <CardDescription>
          Upload a new image or keep your current one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="image"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-start gap-3">
                      {!imagePreviewUrl && (
                        <>
                          <Input
                            type="file"
                            accept="image/*"
                            id="profile-image-upload"
                            className="hidden"
                            onChange={(e) =>
                              handleImageSelect(e, field.onChange)
                            }
                          />
                          <label
                            htmlFor="profile-image-upload"
                            className="flex items-center justify-center w-16 h-16 border rounded-md cursor-pointer hover:bg-muted"
                          >
                            <ImagePlus className="w-6 h-6" />
                          </label>
                        </>
                      )}
                      {imagePreviewUrl && (
                        <div className="relative">
                          <Image
                            src={imagePreviewUrl}
                            width={250}
                            height={250}
                            alt="Preview"
                            className="object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            onClick={setImageNull}
                            className="absolute -top-2 -right-5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {imageFile && (
                        <span className="text-sm">{imageFile.name}</span>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" variant="outline">
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ImageUploadForm;
