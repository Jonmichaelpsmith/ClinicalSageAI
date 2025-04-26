import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Shield, Eye, Download, UserPlus, Clock, Bell, Key, Smartphone, Globe } from 'lucide-react';
import { queryClient, apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import securityClient from '../../lib/security';

/**
 * Security Settings Panel Component
 * 
 * Allows users to view and modify their security settings:
 * - Multi-factor authentication
 * - Session timeout
 * - Password expiry
 * - Document access controls
 * - Audit logging level
 * - Security notifications
 */
export default function SecuritySettingsPanel({ userId }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch current security settings
  const { 
    data: securitySettings, 
    isLoading: isLoadingSettings,
    error: settingsError 
  } = useQuery({
    queryKey: [`/api/security/settings/${userId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/security/settings/${userId}`);
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // Mutation for updating security settings
  const updateSecuritySettingsMutation = useMutation({
    mutationFn: async (updatedSettings) => {
      const res = await apiRequest("PUT", `/api/security/settings/${userId}`, updatedSettings);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
      });
      queryClient.invalidateQueries([`/api/security/settings/${userId}`]);
    },
    onError: (error) => {
      toast({
        title: "Failed to update security settings",
        description: error.message || "An error occurred while updating security settings.",
        variant: "destructive",
      });
    }
  });

  // Form state
  const [formState, setFormState] = useState({
    mfaEnabled: false,
    mfaMethod: 'none',
    sessionTimeout: 3600000, // 1 hour in milliseconds
    passwordExpiryDays: 90,
    documentAccessLevel: 'standard',
    allowExternalSharing: false,
    documentWatermarking: true,
    auditLoggingLevel: 'standard',
    autoLogoutOnInactivity: true,
    securityNotifications: true,
    apiAccessEnabled: false,
  });

  // Update form state when settings are loaded
  useEffect(() => {
    if (securitySettings) {
      setFormState({
        mfaEnabled: securitySettings.mfaEnabled || false,
        mfaMethod: securitySettings.mfaMethod || 'none',
        sessionTimeout: securitySettings.sessionTimeout || 3600000,
        passwordExpiryDays: securitySettings.passwordExpiryDays || 90,
        documentAccessLevel: securitySettings.documentAccessLevel || 'standard',
        allowExternalSharing: securitySettings.allowExternalSharing || false,
        documentWatermarking: securitySettings.documentWatermarking || true,
        auditLoggingLevel: securitySettings.auditLoggingLevel || 'standard',
        autoLogoutOnInactivity: securitySettings.autoLogoutOnInactivity || true,
        securityNotifications: securitySettings.securityNotifications || true,
        apiAccessEnabled: securitySettings.apiAccessEnabled || false,
      });
    }
  }, [securitySettings]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle session timeout change
  const handleSessionTimeoutChange = (e) => {
    const value = parseInt(e.target.value);
    setFormState({
      ...formState,
      sessionTimeout: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateSecuritySettingsMutation.mutateAsync(formState);
      
      // Log the security settings update
      securityClient.logSecurityEvent('SECURITY_SETTINGS_UPDATED', {
        userId,
        changes: Object.keys(formState).join(', '),
      });
    } catch (error) {
      console.error('Failed to update security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Session timeout options in hours
  const sessionTimeoutOptions = [
    { value: 900000, label: '15 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' },
    { value: 7200000, label: '2 hours' },
    { value: 14400000, label: '4 hours' },
    { value: 28800000, label: '8 hours' },
    { value: 86400000, label: '24 hours' },
  ];

  // Render loading state
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-hotpink-500 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Render error state
  if (settingsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <h3 className="text-lg font-semibold mb-2">Error Loading Security Settings</h3>
        <p>{settingsError.message || "An error occurred while loading security settings."}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-hotpink-700 flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Security Settings
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Configure your security preferences to protect your account and data
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Authentication Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Key className="mr-2 h-4 w-4" />
            Authentication
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="mfaEnabled"
                name="mfaEnabled"
                className="h-4 w-4 text-hotpink-500 focus:ring-hotpink-400 border-gray-300 rounded"
                checked={formState.mfaEnabled}
                onChange={handleInputChange}
              />
              <label htmlFor="mfaEnabled" className="ml-2 block text-sm text-gray-700 font-medium">
                Enable multi-factor authentication
              </label>
            </div>
            
            {formState.mfaEnabled && (
              <div className="ml-6">
                <label htmlFor="mfaMethod" className="block text-sm text-gray-700 mb-1">
                  Authentication method
                </label>
                <select
                  id="mfaMethod"
                  name="mfaMethod"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
                  value={formState.mfaMethod}
                  onChange={handleInputChange}
                >
                  <option value="app">Authenticator app</option>
                  <option value="sms">SMS verification</option>
                  <option value="email">Email verification</option>
                </select>
              </div>
            )}
            
            <div className="mt-4">
              <label htmlFor="passwordExpiryDays" className="block text-sm text-gray-700 mb-1">
                Password expiration
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="passwordExpiryDays"
                  name="passwordExpiryDays"
                  className="mt-1 block w-32 border-gray-300 focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
                  min="0"
                  max="365"
                  value={formState.passwordExpiryDays}
                  onChange={handleInputChange}
                />
                <span className="ml-2 text-sm text-gray-500">days (0 = never expires)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Session Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Session Settings
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="mb-4">
              <label htmlFor="sessionTimeout" className="block text-sm text-gray-700 mb-1">
                Session timeout
              </label>
              <select
                id="sessionTimeout"
                name="sessionTimeout"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
                value={formState.sessionTimeout}
                onChange={handleSessionTimeoutChange}
              >
                {sessionTimeoutOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoLogoutOnInactivity"
                name="autoLogoutOnInactivity"
                className="h-4 w-4 text-hotpink-500 focus:ring-hotpink-400 border-gray-300 rounded"
                checked={formState.autoLogoutOnInactivity}
                onChange={handleInputChange}
              />
              <label htmlFor="autoLogoutOnInactivity" className="ml-2 block text-sm text-gray-700">
                Automatically log out after inactivity
              </label>
            </div>
          </div>
        </div>

        {/* Document Security */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            Document Security
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="mb-4">
              <label htmlFor="documentAccessLevel" className="block text-sm text-gray-700 mb-1">
                Document access level
              </label>
              <select
                id="documentAccessLevel"
                name="documentAccessLevel"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
                value={formState.documentAccessLevel}
                onChange={handleInputChange}
              >
                <option value="restricted">Restricted - Minimal access</option>
                <option value="standard">Standard - Normal access</option>
                <option value="elevated">Elevated - Higher access</option>
              </select>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="allowExternalSharing"
                name="allowExternalSharing"
                className="h-4 w-4 text-hotpink-500 focus:ring-hotpink-400 border-gray-300 rounded"
                checked={formState.allowExternalSharing}
                onChange={handleInputChange}
              />
              <label htmlFor="allowExternalSharing" className="ml-2 block text-sm text-gray-700">
                Allow sharing documents with external users
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="documentWatermarking"
                name="documentWatermarking"
                className="h-4 w-4 text-hotpink-500 focus:ring-hotpink-400 border-gray-300 rounded"
                checked={formState.documentWatermarking}
                onChange={handleInputChange}
              />
              <label htmlFor="documentWatermarking" className="ml-2 block text-sm text-gray-700">
                Enable document watermarking
              </label>
            </div>
          </div>
        </div>

        {/* Advanced Security */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Advanced Security
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="mb-4">
              <label htmlFor="auditLoggingLevel" className="block text-sm text-gray-700 mb-1">
                Audit logging level
              </label>
              <select
                id="auditLoggingLevel"
                name="auditLoggingLevel"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
                value={formState.auditLoggingLevel}
                onChange={handleInputChange}
              >
                <option value="minimal">Minimal - Only critical events</option>
                <option value="standard">Standard - Important events</option>
                <option value="verbose">Verbose - All events</option>
              </select>
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="securityNotifications"
                name="securityNotifications"
                className="h-4 w-4 text-hotpink-500 focus:ring-hotpink-400 border-gray-300 rounded"
                checked={formState.securityNotifications}
                onChange={handleInputChange}
              />
              <label htmlFor="securityNotifications" className="ml-2 block text-sm text-gray-700">
                Receive security notifications
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="apiAccessEnabled"
                name="apiAccessEnabled"
                className="h-4 w-4 text-hotpink-500 focus:ring-hotpink-400 border-gray-300 rounded"
                checked={formState.apiAccessEnabled}
                onChange={handleInputChange}
              />
              <label htmlFor="apiAccessEnabled" className="ml-2 block text-sm text-gray-700">
                Enable API access
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
            disabled={loading || updateSecuritySettingsMutation.isPending}
          >
            {(loading || updateSecuritySettingsMutation.isPending) ? (
              <>
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}