import RegisterForm from '@/components/forms/register-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const Auth = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
      <div className="max-w-md w-full flex flex-col gap-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm hover:text-primary group"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Auth;
