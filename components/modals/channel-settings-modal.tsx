import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { CaseSensitive, Headphones, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Doc } from '@/convex/_generated/dataModel';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';

const UpdateChannelSchema = z.object({
  channelName: z.string(),
  status: z.enum(['audio', 'text']),
  visible: z
    .discriminatedUnion('type', [
      z.object({
        type: z.literal('everyone'),
      }),
      z.object({
        type: z.literal('roles'),
        roles: z.array(z.string()).min(1),
      }),
    ])
    .optional(),
});

const ChannelSettingsModal = ({
  channel,
  serverRoles,
}: {
  channel: Doc<'channels'>;
  serverRoles: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateChannel = useMutation(api.server.channel.updateChannel);
  const form = useForm<z.infer<typeof UpdateChannelSchema>>({
    resolver: zodResolver(UpdateChannelSchema),
    defaultValues: {
      channelName: channel.name,
      status: channel.type,
      visible: channel.visible,
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof UpdateChannelSchema>> = async (
    data
  ) => {
    try {
      await updateChannel({
        channelId: channel._id,
        name: data.channelName,
        type: data.status,
        visible: data.visible,
      });
      toast.success('Channel updated successfully');
      setIsOpen(false);
      form.reset(data);
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal size={10} />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setting for {channel.name} channel</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="channelName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel name</FormLabel>
                  <FormControl>
                    <Input placeholder="general channel" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel name</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type of channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audio">
                          <Headphones />
                          Audio
                        </SelectItem>
                        <SelectItem value="text">
                          <CaseSensitive />
                          Text
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Visible to{' '}
                    <span className="text-primary">
                      (can me modified later)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => {
                        if (val === 'everyone') {
                          field.onChange({ type: 'everyone' });
                        } else {
                          field.onChange({ type: 'roles', roles: [] });
                        }
                      }}
                      value={field.value?.type}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select who can see this channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Anyone</SelectItem>
                        <SelectItem value="roles">Roles</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-row flex-wrap items-center gap-3">
              {form.watch('visible')?.type === 'roles' &&
                serverRoles.map((role) => (
                  <FormField
                    key={role}
                    name="visible.roles"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center">
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(role)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value ?? []), role]);
                              } else {
                                field.onChange(
                                  field.value?.filter(
                                    (r: string) => r !== role
                                  ) ?? []
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel>{role}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
            </div>

            <Button type="submit">Save changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelSettingsModal;
