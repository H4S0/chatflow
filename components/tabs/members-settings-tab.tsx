import React, { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Doc, Id } from '@/convex/_generated/dataModel';
import MemberCard from '../cards/member-card';
import { Input } from '../ui/input';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { ArrowDownUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import LoadingSkeleton from '../additional/loading-skeleton';

export type Roles = string[];

export type MemberWithRoles = (Doc<'users'> & { roles: Roles }) | null;

export interface MembersSettingsTabProps {
  roles?: Roles;
  serverId: Id<'server'>;
}

const MembersSettingsTab = ({ roles, serverId }: MembersSettingsTabProps) => {
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const members = useQuery(api.server.server.searchServerMembers, {
    serverId: serverId,
    search: memberSearchQuery,
    role: selectedRole,
  });

  const isLoading = members === undefined;

  return (
    <div className="flex flex-col w-full px-2 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Members management</h2>
      </div>

      <ScrollArea className="w-full max-w-3xl h-[350px] border rounded-md">
        <div className="flex flex-col gap-3 p-4">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <Input
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ArrowDownUp />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by roles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles?.map((role) => (
                    <DropdownMenuItem
                      onClick={() => setSelectedRole(role)}
                      key={role}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Members: {members?.length ?? 0}
            </p>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : members?.length ? (
            members.map(
              (member) =>
                member && (
                  <MemberCard
                    key={member._id}
                    user={member}
                    roles={roles!}
                    serverId={serverId}
                  />
                )
            )
          ) : (
            <p className="text-lg ">This server doesn’t have any members</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MembersSettingsTab;
