import React from 'react';
import { ThemeToggle } from '../theme/theme-toggle';
import { Button } from '../ui/button';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between">
      <Link href="/" className=" text-5xl font-thin italic hidden md:block">
        Chat<span className="font-bold">Flow</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/pages/auth">
          <Button>Register</Button>
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
