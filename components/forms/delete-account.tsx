import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Check } from 'lucide-react';
import DeleteAccountModal from '../modals/delete-account-modal';

const deleteAccount = [
  { description: 'You will lose all of your friends' },
  { description: 'All of your conversations and messages will be deleted' },
  {
    description: 'All of your servers will be deleted',
  },
];

const DeleteAccount = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Before you delete your account, you need to know something:</p>
        <div className="flex flex-col items-start gap-3 mt-5">
          {deleteAccount.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="bg-green-500 text-white rounded-full h-6 w-6 p-1" />
              <p className="font-semibold text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <DeleteAccountModal />
      </CardContent>
    </Card>
  );
};

export default DeleteAccount;
