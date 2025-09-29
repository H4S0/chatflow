'use client';

import DeleteAccount from '@/components/forms/delete-account';
import EmailUpdateForm from '@/components/forms/email-update';
import ImageUploadForm from '@/components/forms/image-upload-form';
import UserUpdateForm from '@/components/forms/user-update';
import DashboardLayout from '@/components/layouts/layout';
import { LoadingSpinner } from '@/components/ui/loader';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const user = useQuery(api.users.viewer);
  const router = useRouter();

  if (!user) {
    return <LoadingSpinner />;
  }

  if (user === null) {
    router.push('/pages/auth');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl mt-8 space-y-5">
        <ImageUploadForm imageUrl={user.imageUrl} image={user.image} />
        <UserUpdateForm name={user.name} userTag={user.userTag} />
        <EmailUpdateForm currentEmail={user.email} />
        <DeleteAccount />
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
