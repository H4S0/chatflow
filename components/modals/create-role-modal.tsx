import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FormField, FormItem, FormLabel, FormControl, Form } from '../ui/form';
import { Input } from '../ui/input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import { Id } from '@/convex/_generated/dataModel';

export const CreateRoleSchema = z.object({
  role: z.string(),
});

const CreateRoleModal = ({ serverId }: { serverId: Id<'server'> }) => {
  const createRole = useMutation(api.server.roles.createRole);
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<z.infer<typeof CreateRoleSchema>>({
    resolver: zodResolver(CreateRoleSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateRoleSchema>> = (data) => {
    try {
      createRole({ serverId: serverId, role: data.role });
      toast.success('Role created successfully');
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
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button>Create new role</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Enter the role name and press button to <br /> create new role
          </DialogTitle>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 mt-5"
            >
              <FormField
                name="role"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="w-full">Create role</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
