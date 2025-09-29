import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import CreateChannelForm from '../forms/create-channel-form';
import { useIsMobile } from '@/hooks/user-mobile';
import { CirclePlus } from 'lucide-react';
import { ServerType } from '../sidebar/server-sidebar';

const CreateChannelModal = ({ selected }: { selected: ServerType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {isMobile ? <CirclePlus /> : 'Create channel'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You are creating a new channel</DialogTitle>
          <DialogDescription>
            Please fill up the form, all channel will be sorted be their type on
            the sidebar
          </DialogDescription>
        </DialogHeader>
        <CreateChannelForm setIsOpen={setIsOpen} selected={selected} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
