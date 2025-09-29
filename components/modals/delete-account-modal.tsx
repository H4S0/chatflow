import React, { useState } from 'react';

import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { ConvexError } from 'convex/values';
import { useRouter } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';

const DeleteAccountModal = () => {
  const deleteAccount = useMutation(api.users.deleteUserAccount);
  const { signOut } = useAuthActions();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className=" mt-5">
          <Trash2 />
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={async () => {
              try {
                await deleteAccount();
                signOut();
                router.push('/');
                toast.success('Your account has been deleted successfully.');
              } catch (err) {
                if (err instanceof ConvexError) {
                  toast.error(err.data);
                }
                toast.error(
                  'Something went wrong while deleting your account.'
                );
              }
            }}
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
