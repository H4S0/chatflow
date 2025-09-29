import React from 'react';
import { Settings, Users, LockKeyhole, ShieldUser, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ActiveTabOpts } from '@/app/dashboard/server/[serverId]/page';

type SidebarItem = {
  id: ActiveTabOpts;
  name: string;
  icon: React.ReactNode;
  requiredPermission?: keyof RolePermissions;
};

type RolePermissions = {
  mainServerSettingsRolePermission?: boolean;
  manageRolesRolePermission?: boolean;
  manageMembersRolePermission?: boolean;
};

export const serverSettingsTabs: SidebarItem[] = [
  {
    id: 'overview' as const,
    name: 'Overview',
    icon: <Settings />,
    requiredPermission: 'mainServerSettingsRolePermission',
  },
  {
    id: 'members' as const,
    name: 'Members',
    icon: <Users />,
    requiredPermission: 'manageMembersRolePermission',
  },
  {
    id: 'security' as const,
    name: 'Security',
    icon: <LockKeyhole />,
    // no permission → always visible
  },
  {
    id: 'roles' as const,
    name: 'Roles',
    icon: <ShieldUser />,
    requiredPermission: 'manageRolesRolePermission',
  },
  {
    id: 'delete' as const,
    name: 'Delete',
    icon: <Trash />,
    requiredPermission: 'mainServerSettingsRolePermission',
  },
];

const ServerSettingsSidebar = ({
  mainServerSettingsRolePermission,
  manageRolesRolePermission,
  manageMembersRolePermission,
  setActiveTab,
}: RolePermissions & {
  setActiveTab: (id: ActiveTabOpts) => void;
}) => {
  const permissions = {
    mainServerSettingsRolePermission,
    manageRolesRolePermission,
    manageMembersRolePermission,
  };

  const visibleTabs = serverSettingsTabs.filter((item) => {
    if (!item.requiredPermission) return true;
    return Boolean(permissions[item.requiredPermission]);
  });

  return (
    <div className="flex md:h-[calc(100vh-6.6rem)]">
      <aside className="w-64 p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-4">Server Settings</h2>
        <nav className="flex flex-col gap-1">
          {visibleTabs.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.name}</span>
            </Button>
          ))}
        </nav>
      </aside>

      <Separator orientation="vertical" />
    </div>
  );
};

export default ServerSettingsSidebar;
