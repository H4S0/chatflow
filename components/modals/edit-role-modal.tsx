import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

type PermissionId =
  | 'VIEW_CHANNELS'
  | 'MANAGE_CHANNELS'
  | 'MANAGE_ROLES'
  | 'MANAGE_SERVER'
  | 'KICK_MEMBERS'
  | 'ACCESS_SOCIAL_MEDIA'
  | 'MANAGE_SOCIAL_MEDIA'
  | 'MANAGE_MESSAGES'
  | 'TEXT_TO_SPEECH';

const permissions: { id: PermissionId; name: string; description: string }[] = [
  {
    id: 'VIEW_CHANNELS',
    name: 'View Channels',
    description:
      'Allows members to view channels by default (excluding private channels)',
  },
  {
    id: 'MANAGE_CHANNELS',
    name: 'Manage Channels',
    description: 'Allows members to create, edit or delete channels',
  },
  {
    id: 'MANAGE_ROLES',
    name: 'Manage Roles',
    description: 'Allows members to create new roles and edit other roles...',
  },
  {
    id: 'MANAGE_SERVER',
    name: 'Manage Server',
    description: "Allow members to change this server's name, categories...",
  },
  {
    id: 'KICK_MEMBERS',
    name: 'Kick Members',
    description: 'Kick members; all messages deleted, member can return',
  },
  {
    id: 'ACCESS_SOCIAL_MEDIA',
    name: 'Access to social media',
    description: "Member has access to server's social media...",
  },
  {
    id: 'MANAGE_SOCIAL_MEDIA',
    name: 'Managing social media',
    description: 'Allows members to manage entire social media...',
  },
  {
    id: 'MANAGE_MESSAGES',
    name: 'Manage Messages',
    description: 'Allows members to delete messages by other users',
  },
  {
    id: 'TEXT_TO_SPEECH',
    name: 'Text to speech',
    description: 'Allows members to use the text-to-speech feature',
  },
];

const EditRoleModal = ({
  roleName,
  serverId,
}: {
  roleName: string;
  serverId: Id<'server'>;
}) => {
  const setRolePermission = useMutation(api.server.roles.setRolePermission);
  const [selected, setSelected] = useState<PermissionId[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const alreadySelectedRoles = useQuery(api.server.roles.getRolePermission, {
    serverId: serverId,
    role: roleName,
  });

  useEffect(() => {
    if (alreadySelectedRoles) {
      setSelected(alreadySelectedRoles);
    }
  }, [alreadySelectedRoles]);

  const handleTogglePermission = (itemId: PermissionId, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, itemId] : prev.filter((p) => p !== itemId)
    );
  };

  const handleSave = async () => {
    try {
      await setRolePermission({
        serverId,
        role: roleName,
        permissions: selected,
      });
      setIsOpen(false);
      toast.success('Permissions updated');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again later');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{roleName} (role) settings</DialogTitle>
          <DialogDescription>
            Edit role and manage general server permissions
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[250px] w-full pr-4">
          {permissions.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={selected.includes(item.id)}
                  onCheckedChange={(checked) =>
                    handleTogglePermission(item.id, checked)
                  }
                />
              </div>
              <Separator />
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleModal;
