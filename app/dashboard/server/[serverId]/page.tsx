'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import DashboardLayout from '@/components/layouts/layout';
import ServerSettingsSidebar from '@/components/sidebar/server-settings-sidebar';
import OverviewSettingsTab from '@/components/tabs/overview-settings-tab';
import RolesSettingsTab from '@/components/tabs/roles-settings-tab';
import MembersSettingsTab from '@/components/tabs/members-settings-tab';
import SecuritySettingsTab from '@/components/tabs/security-settings-tab';
import DeleteSettingsTab from '@/components/tabs/delete-settings-tab';

export type ActiveTabOpts =
  | 'overview'
  | 'members'
  | 'security'
  | 'roles'
  | 'delete';

const ServerSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTabOpts>('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const redirectedRef = useRef(false);
  const params = useParams();
  const router = useRouter();
  const serverId = params.serverId as Id<'server'>;

  const certainServer = useQuery(
    api.server.server.getCertainServer,
    !isDeleting ? { serverId } : 'skip'
  );

  const mainSettingRolePermission = useQuery(
    api.server.roles.hasPermission,
    !isDeleting && certainServer
      ? {
          serverId: serverId,
          permission: 'MANAGE_SERVER',
        }
      : 'skip'
  );

  const manageRolesRolePermission = useQuery(
    api.server.roles.hasPermission,
    !isDeleting && certainServer
      ? {
          serverId: serverId,
          permission: 'MANAGE_ROLES',
        }
      : 'skip'
  );

  const manageMembersRolePermission = useQuery(
    api.server.roles.hasPermission,
    !isDeleting && certainServer
      ? {
          serverId: serverId,
          permission: 'KICK_MEMBERS',
        }
      : 'skip'
  );

  useEffect(() => {
    if (certainServer === null && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push('/dashboard');
    }
  }, [certainServer, router]);

  const handleDeletionStart = () => {
    setIsDeleting(true);
  };

  if (certainServer === undefined && !isDeleting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          Loading server settings...
        </div>
      </DashboardLayout>
    );
  }

  if (certainServer === null || isDeleting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96 text-muted-foreground">
          {isDeleting ? 'Deleting server...' : 'Redirecting to dashboard...'}
        </div>
      </DashboardLayout>
    );
  }

  const server = certainServer;

  return (
    <DashboardLayout>
      <div className="flex h-full min-h-[80vh]">
        <ServerSettingsSidebar
          setActiveTab={setActiveTab}
          mainServerSettingsRolePermission={mainSettingRolePermission}
          manageRolesRolePermission={manageRolesRolePermission}
          manageMembersRolePermission={manageMembersRolePermission}
        />

        <div className="flex-1 p-6">
          {activeTab === 'overview' && <OverviewSettingsTab server={server!} />}
          {activeTab === 'members' && (
            <MembersSettingsTab roles={server!.roles} serverId={server!._id} />
          )}
          {activeTab === 'security' && (
            <SecuritySettingsTab
              serverId={server!._id}
              currentServerStatus={server!.status}
            />
          )}
          {activeTab === 'roles' && (
            <RolesSettingsTab serverId={serverId} roles={server!.roles} />
          )}
          {activeTab === 'delete' && (
            <DeleteSettingsTab
              serverId={server!._id}
              onDeletionStart={handleDeletionStart}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ServerSettingsPage;
