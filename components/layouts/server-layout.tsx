import React, { useState } from 'react';
import ServerSidebar, { ServerType } from '../sidebar/server-sidebar';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import MainServerCard from '../additional/main-server-card';
import MembersSidebar from '../sidebar/members-sidebar';
import SocialMediaCard from '../cards/social-media-card';

const ServerLayout = () => {
  const servers = useQuery(api.server.server.getUserServers);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const [explicitSelected, setExplicitSelected] = useState<ServerType | null>(
    null
  );
  const [isSocialSelected, setIsSocialSelected] = useState<boolean>(false);
  const selected =
    explicitSelected ?? (servers && servers.length > 0 ? servers[0] : null);

  return (
    <ServerSidebar
      servers={servers}
      loading={!servers}
      selected={selected}
      setSelected={setExplicitSelected}
      setIsSocialSelected={setIsSocialSelected}
    >
      {selected ? (
        <>
          {isSocialSelected ? (
            <SocialMediaCard selected={selected} />
          ) : (
            <MainServerCard
              selected={selected}
              setMemberSidebar={setIsMembersExpanded}
            />
          )}
          {isMembersExpanded && (
            <div className="hidden lg:block">
              <MembersSidebar serverId={selected._id} />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
          No servers available
        </div>
      )}
    </ServerSidebar>
  );
};

export default ServerLayout;
