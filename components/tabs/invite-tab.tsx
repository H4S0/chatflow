import React from 'react';
import { TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const JoinByInviteSchema = z.object({
  inviteLink: z.string(),
});

const InviteTab = () => {
  const joinServer = useMutation(api.server.server.joinServer);
  const form = useForm<z.infer<typeof JoinByInviteSchema>>({
    resolver: zodResolver(JoinByInviteSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof JoinByInviteSchema>> = (
    data
  ) => {
    try {
      const inviteLink = data.inviteLink.slice(12);
      joinServer({ inviteLink: inviteLink });
      toast.success('You joined this server successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong please try again');
      }
    }
  };

  return (
    <TabsContent value="invite" className="flex flex-col gap-5">
      <Form {...form}>
        <form className="mt-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="inviteLink"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invitation Link</FormLabel>
                <div className="grid grid-cols-[1fr_80px] gap-2">
                  <FormControl>
                    <Input
                      placeholder="Enter invite link (e.g., chatflow.gg/abc123)"
                      {...field}
                    />
                  </FormControl>
                  <Button disabled={!form.watch('inviteLink')?.trim()}>
                    Join
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-col items-start">
          <h2 className="text-lg font-semibold">Do not have an invite?</h2>
          <p className="text-sm text-gray-500">
            Browse our featured servers below or ask a friend for an invite
            link.
          </p>
        </div>

        <TabsList>
          <TabsTrigger value="browse" asChild className="border-0 bg-none">
            <Button variant="outline" type="button">
              <ExternalLink />
              Browse Communities
            </Button>
          </TabsTrigger>
        </TabsList>
      </div>
    </TabsContent>
  );
};

export default InviteTab;
