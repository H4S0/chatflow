'use client';

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
import { Server } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import InviteTab from '../tabs/invite-tab';
import BrowseServersTab from '../tabs/browse-tab';

const BrowseServerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="font-semibold text-primary">
          <Server />
          Browse Servers
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Server</DialogTitle>
          <DialogDescription>
            Enter an invite link or browse featured servers
          </DialogDescription>
          <Tabs className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="invite">Join by invite</TabsTrigger>
              <TabsTrigger value="browse">Browse servers</TabsTrigger>
            </TabsList>
            <InviteTab />
            <BrowseServersTab />
          </Tabs>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default BrowseServerModal;
