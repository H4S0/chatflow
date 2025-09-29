'use client';

import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';

const EmailUpdateSchema = z.object({
  currentEmail: z.email(),
  newEmail: z.email(),
});

const EmailUpdateForm = ({ currentEmail }: { currentEmail?: string }) => {
  const updateEmail = useMutation(api.auth.updateEmail);
  const form = useForm<z.infer<typeof EmailUpdateSchema>>({
    resolver: zodResolver(EmailUpdateSchema),
    defaultValues: {
      currentEmail: currentEmail,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof EmailUpdateSchema>> = async (
    data
  ) => {
    try {
      await updateEmail(data);
      toast.success('Email updated successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
    form.reset({
      currentEmail: data.newEmail,
      newEmail: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email update</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="currentEmail"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="newEmail"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button variant="outline">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmailUpdateForm;
