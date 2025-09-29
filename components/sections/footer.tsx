import React from 'react';
import { Separator } from '../ui/separator';

const Footer = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <Separator />
      <div className="flex items-center gap-1 text-muted-foreground text-lg">
        © 2024{' '}
        <h2 className="font-thin italic hidden md:block">
          Chat<span className="font-bold">Flow</span>
        </h2>{' '}
        All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
