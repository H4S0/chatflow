import React from 'react';
import GenerateInviteLink from '../modals/generate-invite-link';
import Image from 'next/image';
import { ServerType } from '../sidebar/server-sidebar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/user-mobile';
import ServerCardDropdown from '../modals/server-card-dropdown';
import { ScrollText, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const ServerCard = ({
  server,
  setSelected,
  selected,
  setIsSocialSelected,
}: {
  server: ServerType;
  selected: ServerType | null;
  setSelected: (selected: ServerType) => void;
  setIsSocialSelected: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const isMobile = useIsMobile();
  const serverSettingsUserPermission = useQuery(
    api.server.roles.hasPermission,
    {
      serverId: server._id,
      permission: 'MANAGE_SERVER',
    }
  );
  const socialMediaUserPermission = useQuery(api.server.roles.hasPermission, {
    serverId: server._id,
    permission: 'ACCESS_SOCIAL_MEDIA',
  });

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md p-1',
        selected?._id === server._id ? 'bg-primary/20' : 'hover:bg-primary/20'
      )}
      onClick={() => setSelected(server)}
    >
      <div className="flex items-center gap-3">
        {server.imageUrl && (
          <Image
            src={server.imageUrl}
            alt="message-image"
            width={50}
            height={50}
            className="rounded-full"
          />
        )}

        <div className="flex flex-col items-start gap-2">
          <p className="font-semibold">{server.name}</p>
        </div>
      </div>
      {!isMobile && (
        <div className="flex items-center gap-3">
          {socialMediaUserPermission && (
            <ScrollText
              onClick={() => setIsSocialSelected((prev) => !prev)}
              size={20}
            />
          )}
          {server.status !== 'locked' && (
            <GenerateInviteLink
              serverId={server._id}
              inviteLink={server.inviteLink}
            />
          )}
          {serverSettingsUserPermission && (
            <Link href={`/dashboard/server/${server._id}`}>
              <Button size="sm" variant="ghost" className="hover:bg-primary/20">
                <Settings />
              </Button>
            </Link>
          )}
        </div>
      )}
      {isMobile && (
        <ServerCardDropdown
          server={server}
          serverId={server._id}
          inviteLink={server.inviteLink}
          serverSettingsUserPermission={serverSettingsUserPermission!}
          socialMediaUserPermission={socialMediaUserPermission!}
          setIsSocialSelected={setIsSocialSelected}
        />
      )}
    </div>
  );
};

export default ServerCard;
