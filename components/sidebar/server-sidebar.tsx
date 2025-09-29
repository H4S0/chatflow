import React from 'react';
import { Card, CardTitle } from '../ui/card';
import BrowseServerModal from '../modals/browse-server-modal';
import CreateServerModal from '../modals/create-server-modal';
import { Doc } from '@/convex/_generated/dataModel';
import ServerCard from '../cards/server-card';
import LoadingSkeleton from '../additional/loading-skeleton';

export type ServerType = Doc<'server'> & {
  onlineMembersCount?: number;
  imageUrl?: string | null;
};

type ServerSidebarProps = {
  servers?: ServerType[];
  children: React.ReactNode;
  loading: boolean;
  selected: ServerType | null;
  setSelected: (selected: ServerType) => void;
  setIsSocialSelected: React.Dispatch<React.SetStateAction<boolean>>;
};

const ServerSidebar = ({
  servers,
  children,
  loading = false,
  selected,
  setSelected,
  setIsSocialSelected,
}: ServerSidebarProps) => {
  return (
    <div className="flex flex-col md:flex-row w-full gap-2">
      <Card className="md:w-[28%] p-4 md:h-[calc(100vh-6.6rem)] bg-transparent flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold ">
            Servers ({servers?.length || 0})
          </CardTitle>
          <BrowseServerModal />
        </div>
        <CreateServerModal />

        <ul className="flex-1 overflow-y-auto mt-4 space-y-2">
          {loading ? (
            <LoadingSkeleton />
          ) : servers?.length ? (
            servers.map((server) => (
              <ServerCard
                server={server}
                key={server._id}
                selected={selected}
                setSelected={setSelected}
                setIsSocialSelected={setIsSocialSelected}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-center mt-4">
              You are not part of any server yet
            </p>
          )}
        </ul>
      </Card>

      <div className=" w-full flex items-center gap-2">{children}</div>
    </div>
  );
};

export default ServerSidebar;
