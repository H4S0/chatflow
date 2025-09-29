import { zodResolver } from '@hookform/resolvers/zod';
import { Headphones, CaseSensitive } from 'lucide-react';
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { FormField, FormItem, FormLabel, FormControl, Form } from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ServerType } from '../sidebar/server-sidebar';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const CreateChannelSchema = z.object({
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

const CreateChannelForm = ({
  selected,
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
  selected: ServerType;
}) => {
  const createChannel = useMutation(api.server.channel.createChannel);
  const form = useForm<z.infer<typeof CreateChannelSchema>>({
    resolver: zodResolver(CreateChannelSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateChannelSchema>> = (
    data
  ) => {
    try {
      createChannel({
        serverId: selected._id,
        name: data.channelName,
        type: data.status,
        visible: data.visible,
      });
      toast.success('Channel created successfully');
      setIsOpen(false);
      form.reset();
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again');
      }
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          name="channelName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel name</FormLabel>
              <FormControl>
                <Input placeholder="general chat/audio" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
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
                <span className="text-primary">(can me modified later)</span>
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
            selected.roles?.map((role) => (
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
                          return checked
                            ? field.onChange([...field.value, role])
                            : field.onChange(
                                field.value.filter((role) => role !== role)
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel>{role}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
        </div>

        <Button type="submit" className="mt-5">
          Create channel
        </Button>
      </form>
    </Form>
  );
};

export default CreateChannelForm;
