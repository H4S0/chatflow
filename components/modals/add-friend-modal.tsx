'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';

const AddFriendSchema = z.object({
  username: z.string(),
  userTag: z.string(),
});

const AddFriendModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sendFriendRequest = useMutation(api.friend_request.sendFriendRequest);
  const form = useForm<z.infer<typeof AddFriendSchema>>({
    resolver: zodResolver(AddFriendSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof AddFriendSchema>> = async (
    data
  ) => {
    try {
      await sendFriendRequest(data);
      toast.success('Friend request sent!');
      setIsOpen(false);
      form.reset();
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="w-full my-2">Add friend</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Enter the following details to add new friend
          </DialogTitle>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 mt-5 w-full"
            >
              <div className="grid w-full grid-cols-[1fr_100px] gap-2">
                <FormField
                  name="username"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="user321" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="userTag"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User tag</FormLabel>
                      <FormControl>
                        <Input placeholder="#3431" maxLength={5} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button className="w-full">Send friend request</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
