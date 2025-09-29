import { Doc, Id } from '@/convex/_generated/dataModel';
import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

export type MemberCardProps = {
  user: Doc<'users'> & {
    roles: string[];
  };
  roles: string[];
  serverId: Id<'server'>;
};

const MemberCard = ({ user, roles, serverId }: MemberCardProps) => {
  const assignedRoleWithUser = useMutation(api.server.roles.setUserRole);
  const removeMemberFromServer = useMutation(
    api.server.server.removeMemberFromServer
  );

  return (
    <div className="flex items-center justify-between w-full hover:bg-muted-foreground/20 p-1 px-3 rounded-md">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.image} />
          <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-sm">
          <p>{user.name}</p>
          <p className="text-xs">{user.userTag}</p>
        </div>
      </div>
      <p className="text-sm">
        {new Date(user._creationTime).toLocaleDateString()}
      </p>
      <div className="flex items-center gap-2">
        {user.roles.length ? (
          user.roles.length > 1 ? (
            <div className="flex items-center gap-2">
              <p>{user.roles?.[0]}</p>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Badge variant="secondary">+{user.roles.length - 1}</Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>All user assigned roles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.roles.map((role) => (
                    <DropdownMenuItem key={role}>{role}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <p>{user.roles?.[0]}</p>
          )
        ) : (
          <p className="text-sm">No roles</p>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Plus size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>All server roles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((role) => {
              const checked = user.roles.includes(role);
              return (
                <DropdownMenuItem
                  key={role}
                  className="flex items-center justify-between"
                >
                  <DropdownMenuLabel>{role}</DropdownMenuLabel>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const assign = isChecked === true;
                      assignedRoleWithUser({
                        serverId,
                        userId: user._id,
                        role,
                        assign,
                      });
                    }}
                  />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          try {
            removeMemberFromServer({ serverId: serverId, userId: user._id });
            toast.success('Member removed successfully');
          } catch (err) {
            if (err instanceof ConvexError) {
              toast.error(err.data);
            } else {
              toast.error('Something went wrong, please try again');
            }
          }
        }}
      >
        <Trash2 />
      </Button>
    </div>
  );
};

export default MemberCard;
