import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu, ScrollText, Settings } from 'lucide-react';
import GenerateInviteLink, {
  GenerateInviteLinkProps,
} from './generate-invite-link';
import { ServerType } from '../sidebar/server-sidebar';
import Link from 'next/link';

type ServerCardDropdownProps = GenerateInviteLinkProps & {
  server: ServerType;
  serverSettingsUserPermission: boolean;
  socialMediaUserPermission: boolean;
  setIsSocialSelected: React.Dispatch<React.SetStateAction<boolean>>;
};

const ServerCardDropdown = ({
  serverId,
  inviteLink,
  serverSettingsUserPermission,
  socialMediaUserPermission,
  setIsSocialSelected,
}: ServerCardDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <GenerateInviteLink serverId={serverId} inviteLink={inviteLink} />
          </DropdownMenuItem>
          {socialMediaUserPermission && (
            <DropdownMenuItem
              className="flex items-center justify-between"
              onClick={() => setIsSocialSelected((prev) => !prev)}
            >
              Social media
              <ScrollText />
            </DropdownMenuItem>
          )}

          {serverSettingsUserPermission && (
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/server/${serverId}`}
                className="flex items-center justify-between w-full"
              >
                Server settings
                <Settings />
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ServerCardDropdown;
