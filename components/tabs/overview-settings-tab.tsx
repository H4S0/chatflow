import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import CreateServerFields from '../forms/create-server-fields';
import { ImagePlus, X } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Image from 'next/image';
import { ServerType } from '../sidebar/server-sidebar';
import z from 'zod';
import { Button } from '../ui/button';
import TagsArrayForm from '../additional/tags-array-form';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/use-image-upload';

export const UpdateServerSchema = z.object({
  serverName: z.string().min(1, 'Server name is required'),
  category: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
});

const OverviewSettingsTab = ({ server }: { server: ServerType }) => {
  const updateServer = useMutation(api.server.server.updateServer);

  const {
    imageFile,
    imagePreviewUrl,
    generateImageUpload,
    setImageFile,
    setImagePreviewUrl,
    setImageNull,
  } = useImageUpload();

  const form = useForm<z.infer<typeof UpdateServerSchema>>({
    resolver: zodResolver(UpdateServerSchema),
    defaultValues: {
      serverName: server.name,
      category: server.category,
      tags: server.tags,
      image: server.image,
    },
  });

  useEffect(() => {
    setImagePreviewUrl(server.imageUrl || null);
  }, [server.imageUrl, setImagePreviewUrl]);

  const onSubmit: SubmitHandler<z.infer<typeof UpdateServerSchema>> = async (
    data
  ) => {
    const imageUrl = await generateImageUpload();

    if (!imageUrl) {
      return toast.error('Image upload failed');
    }

    try {
      await updateServer({
        serverId: server._id,
        name: data.serverName,
        tags: data.tags,
        category: data.category,
        image: imageUrl,
      });
      toast.success('Server updated successfully');
    } catch (err) {
      console.error(err);
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again');
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
    <Card className="border-0 shadow-none w-full px-2 py-0 bg-transparent">
      <CardHeader>
        <CardTitle>Main server settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <CreateServerFields form={form} />

            {imagePreviewUrl && (
              <div className="relative w-full mb-2">
                <Image
                  src={imagePreviewUrl}
                  height={120}
                  width={120}
                  alt="Server image preview"
                  className="rounded-md"
                />
                <button
                  type="button"
                  className="absolute -top-1 left-28 bg-red-500 text-white rounded-full p-1"
                  onClick={setImageNull}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {!server.image || (
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
                          id="server-image-upload"
                          className="hidden"
                          onChange={(e) => handleImageSelect(e, field.onChange)}
                        />
                        <label
                          htmlFor="server-image-upload"
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
            )}

            <TagsArrayForm form={form} />

            <Button type="submit">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OverviewSettingsTab;
