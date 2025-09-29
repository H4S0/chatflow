import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

type ServerStatus = 'open' | 'inv' | 'locked';

const statusType: { id: ServerStatus; name: string; description: string }[] = [
  {
    id: 'open',
    name: 'Open',
    description:
      'Anyone can freely discover and join this server without restrictions. This is best for public communities, open discussions, or groups that want to grow quickly.',
  },
  {
    id: 'inv',
    name: 'Invite only',
    description:
      'New members can only join if they receive an invitation link or code from an existing member or admin. This allows the community to stay semi-private while still welcoming selected people.',
  },
  {
    id: 'locked',
    name: 'Locked',
    description:
      'The server is closed to new members. Invitations are disabled, and only existing members keep their access. This is useful when archiving a server, pausing growth, or keeping the group completely private.',
  },
];

const SecuritySettingsTab = ({
  serverId,
  currentServerStatus,
}: {
  serverId: Id<'server'>;
  currentServerStatus: string;
}) => {
  const updateSecurityServerStatus = useMutation(
    api.server.server.updateServerSecurityStatus
  );

  return (
    <Card className="border-0 shadow-none w-full px-2 py-0 bg-transparent">
      <CardHeader>
        <CardTitle className="text-lg">Security settings management</CardTitle>
        <CardDescription>
          Control who can join and access your server
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-start gap-4">
          {statusType.map((status) => (
            <div key={status.id}>
              <h2 className="text-base font-semibold">{status.name}</h2>
              <p className="text-sm text-muted-foreground w-2/3">
                {status.description}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold my-3">
          Update your security status here
        </h2>

        <Select
          defaultValue={currentServerStatus}
          onValueChange={(value) =>
            updateSecurityServerStatus({
              serverId,
              status: value as ServerStatus,
            })
          }
        >
          <SelectTrigger className="w-2/3">
            <SelectValue placeholder="Server status" />
          </SelectTrigger>
          <SelectContent>
            {statusType.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default SecuritySettingsTab;
