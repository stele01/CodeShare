import React from 'react';
import { useTranslation } from 'react-i18next';

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface UserProfileProps {
  user: User;
  workspacesCount: number;
  lastActive: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, workspacesCount, lastActive }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gray-800 text-white">
        <h3 className="text-lg leading-6 font-medium">{t('profile.profile')}</h3>
        <p className="mt-1 max-w-2xl text-sm">{t('profile.personal_details')}</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t('profile.full_name')}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.fullName}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t('profile.email')}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t('profile.account_id')}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user._id}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">{t('profile.recent_activity')}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {workspacesCount > 0 ? `${t('profile.last_saved_project')}: ${lastActive}` : t('profile.no_recent_activity')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default UserProfile; 