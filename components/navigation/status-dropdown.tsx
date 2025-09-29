'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ConvexError } from 'convex/values';

type StatusValue = 'online' | 'away' | 'dnd' | 'offline';

const statusOptions: {
  color: string;
  value: StatusValue;
  label: string;
  description: string;
}[] = [
  {
    color: 'bg-green-500',
    value: 'online',
    label: 'Online',
    description: 'Available to chat',
  },
  {
    color: 'bg-yellow-500',
    value: 'away',
    label: 'Away',
    description: 'I may not respond',
  },
  {
    color: 'bg-red-500',
    value: 'dnd',
    label: 'Do Not Disturb',
    description: 'Please do not disturb me',
  },
  {
    color: 'bg-gray-500',
    value: 'offline',
    label: 'Offline',
    description: 'Not available',
  },
];

const StatusDropdown = ({ status }: { status?: StatusValue }) => {
  const setStatus = useMutation(api.status.setUserStatus);

  const handleStatusChange = async (status: StatusValue) => {
    try {
      await setStatus({ status });
      toast.success('Status updated successfully');
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {status ? (
          <div className="flex items-center gap-2 hover:bg-secondary px-2 py-1 rounded-xl">
            <div
              className={cn(
                'h-3 w-3 rounded-full ',
                status === 'online' && 'bg-green-500',
                status === 'away' && 'bg-yellow-500',
                status === 'dnd' && 'bg-red-500',
                status === 'offline' && 'bg-gray-500'
              )}
            />
            <span className="capitalize text-sm text-muted-foreground">
              {status === 'dnd' ? 'Do not disturb' : status}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Set status</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52 mr-2">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
          >
            <div className={`${option.color} rounded-full h-4 w-4`} />
            <DropdownMenuGroup className="flex flex-col items-start">
              <DropdownMenuLabel>{option.label}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {option.description}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
