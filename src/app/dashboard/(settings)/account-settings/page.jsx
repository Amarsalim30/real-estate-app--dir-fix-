'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  Bell,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Lock,
  Smartphone,
  Mail,
  Globe,
  Download,
  Upload,
  UserX,
  Save,
  X
} from 'lucide-react';

const SettingsSection = ({ title, description, children, icon: Icon, danger = false }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${danger ? 'border-red-200' : ''}`}>
    <div className="flex items-start mb-6">
      <Icon className={`w-6 h-6 mr-3 mt-1 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
      <div>
        <h2 className={`text-xl font-semibold mb-2 ${danger ? 'text-red-900' : 'text-gray-900'}`}>
          {title}
        </h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const ToggleSetting = ({ label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
    </label>
  </div>
);

export default function AccountSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Settings state
  const [settings, setSettings] = useState({
    twoFactorEnabled: session?.user?.twoFactorEnabled || false,
    emailNotifications: session?.user?.emailNotifications || true,
    smsNotifications: session?.user?.smsNotifications || false,
    marketingEmails: session?.user?.marketingEmails || false,
    profileVisibility: session?.user?.profileVisibility || 'private',
    activityTracking: session?.user?.activityTracking || true,
    dataSharing: session?.user?.dataSharing || false,
    sessionTimeout: session?.user?.sessionTimeout || 30
  });

  const handleSettingChange = async (key, value) => {
    try {
      setSettings(prev => ({ ...prev, [key]: value }));
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      // Update session if needed
      await update({
        ...session,
        user: {
          ...session?.user,
          [key]: value
        }
      });

      setMessage({ type: 'success', text: 'Setting updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      // Revert the setting
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/2fa/enable', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to enable 2FA');
      }

      const { qrCode, secret } = await response.json();
      // Handle 2FA setup (show QR code, etc.)
      setMessage({ type: 'success', text: '2FA setup initiated. Please scan the QR code.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      await handleSettingChange('twoFactorEnabled', false);
      setMessage({ type: 'success', text: '2FA has been disabled.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data export completed!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await signOut({ callbackUrl: '/' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access account settings.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your security, privacy, and notification preferences</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Security Settings */}
          <SettingsSection
            title="Security & Authentication"
            description="Manage your password and two-factor authentication"
            icon={Shield}
          >
            <div className="space-y-4">
              {/* Password Change */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Password</h3>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Change Password
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">
                    {settings.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {settings.twoFactorEnabled ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Enabled
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Disabled
                    </span>
                  )}
                  <button
                    onClick={settings.twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      settings.twoFactorEnabled
                        ? 'text-red-600 hover:text-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {settings.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
                  </button>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Session Timeout</h3>
                  <p className="text-sm text-gray-500">Automatically sign out after inactivity</p>
                </div>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection
            title="Notifications"
            description="Choose how you want to be notified"
            icon={Bell}
          >
            <div className="space-y-1">
              <ToggleSetting
                label="Email Notifications"
                description="Receive important updates via email"
                checked={settings.emailNotifications}
                onChange={(value) => handleSettingChange('emailNotifications', value)}
              />
              <ToggleSetting
                label="SMS Notifications"
                description="Receive urgent notifications via text message"
                checked={settings.smsNotifications}
                onChange={(value) => handleSettingChange('smsNotifications', value)}
              />
              <ToggleSetting
                label="Marketing Emails"
                description="Receive promotional content and property updates"
                checked={settings.marketingEmails}
                onChange={(value) => handleSettingChange('marketingEmails', value)}
              />
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection
            title="Privacy & Data"
            description="Control your privacy and data sharing preferences"
            icon={Eye}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Profile Visibility</h3>
                  <p className="text-sm text-gray-500">Who can see your profile information</p>
                </div>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">Private</option>
                  <option value="agents">Real Estate Agents Only</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <ToggleSetting
                label="Activity Tracking"
                description="Allow us to track your activity to improve your experience"
                checked={settings.activityTracking}
                onChange={(value) => handleSettingChange('activityTracking', value)}
              />
              <ToggleSetting
                label="Data Sharing"
                description="Share anonymized data with partners for market research"
                checked={settings.dataSharing}
                onChange={(value) => handleSettingChange('dataSharing', value)}
              />
            </div>
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection
            title="Data Management"
            description="Export or manage your personal data"
            icon={Download}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Export Data</h3>
                  <p className="text-sm text-gray-500">Download a copy of your personal data</p>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export Data
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            title="Danger Zone"
            description="Irreversible and destructive actions"
            icon={AlertTriangle}
            danger={true}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-700">Delete Account</h3>
                  <p className="text-sm text-red-600">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete:
              </p>
              
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                <li>Your profile and personal information</li>
                <li>All property inquiries and communications</li>
                <li>Saved properties and search preferences</li>
                <li>Transaction history and documents</li>
              </ul>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action is irreversible. Please make sure you have exported any data you want to keep.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserX className="w-4 h-4 mr-2" />
                  )}
                  Yes, Delete My Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
