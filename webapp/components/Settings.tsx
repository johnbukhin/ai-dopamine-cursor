import React, { useState } from 'react';
import { CancelFlow } from './CancelFlow';

type SettingsTab = 'Profile' | 'Access' | 'Terms';

const ProfileSettings = () => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Change Password</label>
        <input type="password" name="password" id="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input type="password" name="confirmPassword" id="confirmPassword" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
      </div>
    </div>
  </div>
);

const AccessSettings = () => {
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(true);
  const [showCancelFlow, setShowCancelFlow] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Access</h2>
      <div className="bg-white shadow sm:rounded-lg mb-6 relative">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Current membership</h3>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isSubscriptionActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isSubscriptionActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="font-medium">Membership type</p>
                <p>Premium</p>
              </div>
              <div>
                <p className="font-medium">Begin date</p>
                <p>2024-01-01</p>
              </div>
              <div>
                <p className="font-medium">Amount of payment</p>
                <p>$9.99 / month</p>
              </div>
              <div>
                <p className="font-medium">Valid until</p>
                <p>2025-01-01</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            {isSubscriptionActive ? (
              <button
                onClick={() => setShowCancelFlow(true)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel Membership
              </button>
            ) : (
              <button
                onClick={() => setIsSubscriptionActive(true)}
                className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Renew with discount
              </button>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Other materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h4 className="font-bold">28-Day Plan</h4>
            <p className="text-sm text-gray-500 mt-2">Unlocked</p>
          </div>
          <div className="bg-gray-200 shadow sm:rounded-lg p-6 opacity-50">
            <h4 className="font-bold">Advanced Course</h4>
            <p className="text-sm text-gray-500 mt-2">Locked</p>
          </div>
          <div className="bg-gray-200 shadow sm:rounded-lg p-6 opacity-50">
            <h4 className="font-bold">Community Access</h4>
            <p className="text-sm text-gray-500 mt-2">Locked</p>
          </div>
        </div>
      </div>
      {showCancelFlow && (
        <CancelFlow 
          onClose={() => setShowCancelFlow(false)} 
          onConfirmCancel={() => {
            setIsSubscriptionActive(false);
            // The flow component will show the final step, no need to close here
          }} 
        />
      )}
    </div>
  );
};

const TermsSettings = () => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Terms</h2>
    <p>Content for Terms will be added later.</p>
  </div>
);

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileSettings />;
      case 'Access':
        return <AccessSettings />;
      case 'Terms':
        return <TermsSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const TabButton: React.FC<{ tabName: SettingsTab }> = ({ tabName }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activeTab === tabName
          ? 'bg-emerald-100 text-emerald-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {tabName}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full bg-gray-50 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex space-x-4 border-b border-gray-200 mb-6 flex-shrink-0">
          <TabButton tabName="Profile" />
          <TabButton tabName="Access" />
          <TabButton tabName="Terms" />
        </div>
        <div className="flex-1 overflow-y-auto pb-16">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
