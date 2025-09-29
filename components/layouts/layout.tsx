'use client';

import DashboardNavbar from '@/components/navigation/dashboard-navbar';
import { Authenticated } from 'convex/react';
import React, { ReactNode } from 'react';
import { Separator } from '../ui/separator';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Authenticated>
      <DashboardNavbar />
      <Separator />
      <div className="mx-auto max-w-7xl p-4">{children}</div>
    </Authenticated>
  );
};
export default DashboardLayout;
