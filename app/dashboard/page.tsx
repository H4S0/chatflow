'use client';

import FriendsLayout from '@/components/layouts/friends-layout';
import ServerLayout from '@/components/layouts/server-layout';
import StreamClientProvider from '@/app/lib/providers/stream-client-provider';
import DashboardNavbar from '@/components/navigation/dashboard-navbar';
import { Separator } from '@/components/ui/separator';
import { Authenticated } from 'convex/react';
import React, { useState } from 'react';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { StreamTheme } from '@stream-io/video-react-sdk';

const DashboardLayoutMain = () => {
  const [activeLayout, setActiveLayout] = useState<'friends' | 'servers'>(
    'friends'
  );

  return (
    <Authenticated>
      <StreamClientProvider>
        <StreamTheme>
          <DashboardNavbar
            activeLayout={activeLayout}
            setActiveLayout={setActiveLayout}
          />
          <Separator />
          <div className="mx-auto max-w-[1500px] p-4">
            {activeLayout === 'friends' ? <FriendsLayout /> : <ServerLayout />}
          </div>
        </StreamTheme>
      </StreamClientProvider>
    </Authenticated>
  );
};

export default DashboardLayoutMain;
