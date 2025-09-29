import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';

export const CreateCommentSchema = z.object({
  content: z.string(),
});

const CreateCommentForm = ({ postId }: { postId: Id<'social_media'> }) => {
  const createComment = useMutation(api.server.social_media.createComment);
  const form = useForm<z.infer<typeof CreateCommentSchema>>({
    resolver: zodResolver(CreateCommentSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateCommentSchema>> = (
    data
  ) => {
    try {
      createComment({
        postId: postId,
        content: data.content,
      });
      form.reset({
        content: '',
      });
      toast.success('Comment added successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center w-full gap-3"
      >
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder="Add comment..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Post comment</Button>
      </form>
    </Form>
  );
};

export default CreateCommentForm;
