import React from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import LoadingSkeleton from '../additional/loading-skeleton';

const MembersSidebar = ({ serverId }: { serverId: Id<'server'> }) => {
  const serverMembers = useQuery(api.server.server.getDetailedServerUsers, {
    serverId: serverId,
  });

  const sortedServerMembers = serverMembers?.sort((a, b) => {
    const order: Record<string, number> = {
      online: 0,
      idle: 1,
      dnd: 2,
      offline: 3,
    };
    const aStatus = typeof a?.status === 'string' ? a.status : 'offline';
    const bStatus = typeof b?.status === 'string' ? b.status : 'offline';
    return (order[aStatus] ?? 99) - (order[bStatus] ?? 99);
  });

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="md:w-44 md:h-[calc(100vh-6.6rem)] bg-transparent flex flex-col gap-1 p-0 border rounded-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-2">Members</h2>
        </div>

        <div className="flex flex-col items-start gap-2 p-2 w-full overflow-y-auto">
          {serverMembers === undefined && (
            <div className="w-full">
              <LoadingSkeleton />
            </div>
          )}

          {serverMembers?.length === 0 && (
            <p className="text-muted-foreground text-sm">No members</p>
          )}

          {sortedServerMembers?.map((member) => (
            <DropdownMenu key={member?._id}>
              <DropdownMenuTrigger className="flex items-center gap-2 w-full hover:bg-muted-foreground/10 rounded-md p-1">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member?.image} />
                    <AvatarFallback>{member?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'absolute w-3 h-3 right-0 bottom-0 rounded-full',
                      member?.status === 'online' && 'bg-green-500',
                      member?.status === 'away' && 'bg-yellow-500',
                      member?.status === 'dnd' && 'bg-red-500',
                      member?.status === 'offline' && 'bg-gray-500'
                    )}
                  ></div>
                </div>
                <p className="text-sm">{member?.name}</p>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                <DropdownMenuLabel>
                  {member?.name} | {member?.userTag}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex flex-wrap gap-1">
                    Roles:{' '}
                    {member?.roles && member.roles.length > 0 ? (
                      member.roles.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No role assigned
                      </p>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    User joined chatflow:{' '}
                    {new Date(member?._creationTime).toLocaleDateString()}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersSidebar;
