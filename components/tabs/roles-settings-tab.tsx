import React from 'react';
import CreateRoleModal from '../modals/create-role-modal';
import { Id } from '@/convex/_generated/dataModel';
import { ScrollArea } from '../ui/scroll-area';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '../ui/button';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import EditRoleModal from '../modals/edit-role-modal';
import LoadingSkeleton from '../additional/loading-skeleton';

const RolesSettingsTab = ({
  serverId,
  roles = [],
}: {
  serverId: Id<'server'>;
  roles?: string[];
}) => {
  const rolesCount = useQuery(api.server.roles.getRoleCount, {
    serverId,
    roles,
  });
  const deleteRole = useMutation(api.server.roles.deleteRole);

  const isLoading = rolesCount === undefined;

  const combinedRole = roles.map((role) => ({
    role,
    count: rolesCount?.[role] ?? 0,
  }));

  return (
    <div className="flex flex-col w-full px-2 gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Roles management</h2>
        <CreateRoleModal serverId={serverId} />
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">All roles</h2>
        <ScrollArea className="w-full max-w-2xl h-[300px] border rounded-md">
          <div className="flex flex-col gap-2 p-2">
            {isLoading ? (
              <LoadingSkeleton />
            ) : combinedRole.length > 0 ? (
              combinedRole.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-7 py-1 hover:bg-muted-foreground/10 rounded-md"
                >
                  <div className="flex flex-col">
                    <p className="font-medium">{item.role}</p>
                    <p className="text-sm text-gray-500">{item.count} Users</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <EditRoleModal roleName={item.role} serverId={serverId} />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await deleteRole({ serverId, role: item.role });
                          toast.success('Role removed successfully');
                        } catch (err) {
                          if (err instanceof ConvexError) {
                            toast.error(err.data);
                          } else {
                            toast.error('Something went wrong');
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-lg">There is no role created yet</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RolesSettingsTab;
