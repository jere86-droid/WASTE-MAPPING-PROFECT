import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header with Avatar */}
          <div className="bg-linear-to-r from-primary-500 to-primary-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-100">{user.email}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-primary-600">
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  {user.emailVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Account Info */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Member Since:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Account Type:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <NotificationPreferences />
      </div>
    </div>
  );
};

// Notification Preferences Component
const NotificationPreferences = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    statusUpdates: user?.notificationPreferences?.statusUpdates ?? true,
  });

  const handleToggle = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    setLoading(true);

    try {
      await updateProfile({
        notificationPreferences: newPreferences,
      });
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage how you receive notifications
        </p>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between py-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Status Updates
            </h4>
            <p className="text-sm text-gray-500">
              Get notified when your report status changes
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('statusUpdates')}
            disabled={loading}
            className={`${
              preferences.statusUpdates ? 'bg-primary-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50`}
          >
            <span
              className={`${
                preferences.statusUpdates ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;