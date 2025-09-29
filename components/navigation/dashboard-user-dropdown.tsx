'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { User2, Sun, Moon, MonitorCog, LogOut } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const UserDropdown = ({
  username,
  userEmail,
  userImage,
  userTag,
}: {
  username?: string;
  userEmail?: string;
  userImage?: string | null | undefined;
  userTag?: string;
}) => {
  const { setTheme, theme } = useTheme();
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="w-10 h-10">
          {userImage && <AvatarImage src={userImage} />}
          <AvatarFallback>{username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-xs mr-2">
        <DropdownMenuGroup className="pl-2">
          <DropdownMenuLabel>
            {username} | {userTag}
          </DropdownMenuLabel>
          <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href="/dashboard/profile">
          <DropdownMenuItem className="flex items-center justify-between">
            <DropdownMenuLabel>Profile settings</DropdownMenuLabel>
            <User2 />
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem className="flex items-center justify-between">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuGroup className="grid grid-cols-3 gap-2">
            <DropdownMenuItem
              onClick={() => setTheme('light')}
              className={cn(
                'hover:bg-primary/60',
                theme === 'light' && 'bg-primary/60'
              )}
            >
              <Sun
                className={cn(
                  'h-4 w-4 hover:text-white',
                  theme === 'light' && 'text-white'
                )}
              />
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme('dark')}
              className={cn(
                'hover:bg-primary/60 hover:text-white',
                theme === 'dark' && 'bg-primary/60'
              )}
            >
              <Moon
                className={cn(
                  'h-4 w-4 hover:text-white',
                  theme === 'dark' && 'text-white'
                )}
              />
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme('system')}
              className={cn(
                'hover:bg-primary/60 hover:text-white',
                theme === 'system' && 'bg-primary/60'
              )}
            >
              <MonitorCog
                className={cn(
                  'h-4 w-4 hover:text-white',
                  theme === 'system' && 'text-white'
                )}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center justify-between"
          onClick={() => {
            signOut();
            router.push('/');
          }}
        >
          <DropdownMenuLabel>Log out</DropdownMenuLabel>
          <LogOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
