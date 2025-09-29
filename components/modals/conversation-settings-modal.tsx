import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import z from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

export const ConversationNameSchema = z.object({
  conversationName: z.string(),
});

const ConversationSettingsModal = ({
  conversationId,
}: {
  conversationId: Id<'conversations'>;
}) => {
  const updateConversationName = useMutation(
    api.messages.conversation.renameConversation
  );
  const deleteConversation = useMutation(
    api.messages.conversation.deleteConversation
  );

  const form = useForm<z.infer<typeof ConversationNameSchema>>({
    resolver: zodResolver(ConversationNameSchema),
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof ConversationNameSchema>
  > = async (data) => {
    try {
      await updateConversationName({
        conversationId: conversationId,
        conversationName: data.conversationName,
      });
      toast.success('Conversation renamed successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      }
      toast.error('Something went wrong, please try again');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <SlidersHorizontal />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Enter the following details to add new friend
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="conversationName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conversation name</FormLabel>
                  <FormControl>
                    <Input placeholder="conversation name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button className="w-full" variant="secondary">
              Save
            </Button>
          </form>
        </Form>
        <DialogFooter>
          <Button
            className="w-full"
            onClick={async () => {
              try {
                await deleteConversation({
                  conversationId: conversationId,
                });
                toast.success('Conversation deleted successfully');
              } catch (err) {
                if (err instanceof ConvexError) {
                  toast.error(err.data);
                }
                toast.error('Something went wrong, please try again later');
              }
            }}
          >
            <Trash2 />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationSettingsModal;
