'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';

const UserUpdateFormSchema = z.object({
  name: z.string().optional(),
  userTag: z.string().optional(),
});

const UserUpdateForm = ({
  name,
  userTag,
}: {
  name?: string;
  userTag?: string;
}) => {
  const updateUser = useMutation(api.users.updateUser);
  const form = useForm<z.infer<typeof UserUpdateFormSchema>>({
    resolver: zodResolver(UserUpdateFormSchema),
    defaultValues: {
      name: name,
      userTag: userTag,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof UserUpdateFormSchema>> = async (
    data
  ) => {
    try {
      await updateUser(data);
      toast.success('User updated successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full grid-cols-[1fr_100px] gap-3">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="user122" {...field} />
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
                      <Input placeholder="#3214" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button variant="outline">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserUpdateForm;
