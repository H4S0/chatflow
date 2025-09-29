import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexError } from 'convex/values';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

interface DeleteSettingsTabProps {
  serverId: Id<'server'>;
  onDeletionStart?: () => void;
}

const DeleteSettingsTab = ({
  serverId,
  onDeletionStart,
}: DeleteSettingsTabProps) => {
  const deleteServer = useMutation(api.server.server.deleteServer);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    onDeletionStart?.();
    setIsDeleting(true);

    try {
      await deleteServer({ serverId });
      toast.success('Server deleted successfully');

      router.replace('/dashboard');
    } catch (err) {
      setIsDeleting(false);
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong, please try again later');
      }
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-lg font-semibold text-red-600">Delete Server</h2>
      <div className="max-w-md text-muted-foreground">
        <p>
          Deleting your server is a{' '}
          <span className="font-semibold text-red-600">permanent action</span>.
          Once deleted, all channels, roles, and member data will be lost and
          cannot be recovered.
        </p>
        <p className="mt-2">
          If you are absolutely sure, click the button below. We recommend
          exporting any important data or transferring ownership before
          proceeding.
        </p>
      </div>
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete Server'}
      </Button>
    </div>
  );
};

export default DeleteSettingsTab;
