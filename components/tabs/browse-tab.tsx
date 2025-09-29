import React from 'react';
import { TabsContent } from '../ui/tabs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DialogDescription } from '../ui/dialog';
import LoadingSkeleton from '../additional/loading-skeleton';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Users2 } from 'lucide-react';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';

const BrowseServersTab = () => {
  const openServers = useQuery(api.server.server.getAllOpenServers);
  const joinOpenServer = useMutation(api.server.server.joinOpenServer);

  return (
    <TabsContent value="browse" className="space-y-4">
      <DialogDescription>
        All open for everyone servers will be shown here
      </DialogDescription>

      {openServers === undefined && <LoadingSkeleton />}

      {openServers?.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No servers available right now.
        </p>
      )}

      {openServers && openServers.length > 0 && (
        <div className="space-y-2">
          {openServers.map((server) => (
            <div
              key={server._id}
              className="p-3 border rounded-lg flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                {server.image && server.imageUrl && (
                  <Image
                    src={server.imageUrl}
                    alt={server.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                )}
                <div className="flex flex-col items-start ">
                  <p className="font-medium">{server.name}</p>

                  <div className="flex items-center gap-2">
                    {server.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center bg-primary/30 px-2 rounded-full"
                      >
                        <p className="text-white">{tag}</p>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Users2 size={15} />
                      <p className="text-sm">{server.members?.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => {
                  try {
                    joinOpenServer({ serverId: server._id });
                    toast.success('You joined server successfully');
                  } catch (err) {
                    if (err instanceof ConvexError) {
                      toast.error(err.data);
                    } else {
                      toast.error('Something went wrong');
                    }
                  }
                }}
              >
                Join
              </Button>
            </div>
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default BrowseServersTab;
