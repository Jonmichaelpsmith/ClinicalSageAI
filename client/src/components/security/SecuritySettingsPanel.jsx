import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast';

const SecuritySettingsPanel = () => {
  const { toast } = useToast();
  
  // State for security settings
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      historyCount: 5,
      expiryDays: 90
    },
    sessionSettings: {
      timeoutMinutes: 30,
      maxConcurrentSessions: 3
    },
    auditSettings: {
      retentionDays: 365,
      enableBlockchainBackup: true,
      realTimeMonitoring: true,
      autoExportFrequency: 24
    }
  });
  
  // Mutation for updating security settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      const response = await fetch('/api/fda-compliance/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update security settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success('Security settings updated successfully', {
        title: 'Settings Saved'
      });
    },
    onError: (error) => {
      toast.error(`Failed to update security settings: ${error.message}`, {
        title: 'Update Failed'
      });
    }
  });
  
  // Handle input change
  const handleInputChange = (section, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value
      }
    }));
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (section, setting) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: !prev[section][setting]
      }
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Password Policy */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Password Policy</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Length
                </label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => handleInputChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password History Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.passwordPolicy.historyCount}
                  onChange={(e) => handleInputChange('passwordPolicy', 'historyCount', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={settings.passwordPolicy.expiryDays}
                  onChange={(e) => handleInputChange('passwordPolicy', 'expiryDays', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireUppercase"
                  checked={settings.passwordPolicy.requireUppercase}
                  onChange={() => handleCheckboxChange('passwordPolicy', 'requireUppercase')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-700">
                  Require uppercase letter
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireLowercase"
                  checked={settings.passwordPolicy.requireLowercase}
                  onChange={() => handleCheckboxChange('passwordPolicy', 'requireLowercase')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="requireLowercase" className="ml-2 block text-sm text-gray-700">
                  Require lowercase letter
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireNumber"
                  checked={settings.passwordPolicy.requireNumber}
                  onChange={() => handleCheckboxChange('passwordPolicy', 'requireNumber')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="requireNumber" className="ml-2 block text-sm text-gray-700">
                  Require number
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireSpecialChar"
                  checked={settings.passwordPolicy.requireSpecialChar}
                  onChange={() => handleCheckboxChange('passwordPolicy', 'requireSpecialChar')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="requireSpecialChar" className="ml-2 block text-sm text-gray-700">
                  Require special character
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Session Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Session Settings</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionSettings.timeoutMinutes}
                  onChange={(e) => handleInputChange('sessionSettings', 'timeoutMinutes', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Concurrent Sessions
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={settings.sessionSettings.maxConcurrentSessions}
                  onChange={(e) => handleInputChange('sessionSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Audit Trail Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Audit Trail Settings</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retention Period (Days)
                </label>
                <input
                  type="number"
                  min="90"
                  max="3650"
                  value={settings.auditSettings.retentionDays}
                  onChange={(e) => handleInputChange('auditSettings', 'retentionDays', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-Export Frequency (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.auditSettings.autoExportFrequency}
                  onChange={(e) => handleInputChange('auditSettings', 'autoExportFrequency', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableBlockchainBackup"
                  checked={settings.auditSettings.enableBlockchainBackup}
                  onChange={() => handleCheckboxChange('auditSettings', 'enableBlockchainBackup')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="enableBlockchainBackup" className="ml-2 block text-sm text-gray-700">
                  Enable blockchain backup
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="realTimeMonitoring"
                  checked={settings.auditSettings.realTimeMonitoring}
                  onChange={() => handleCheckboxChange('auditSettings', 'realTimeMonitoring')}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="realTimeMonitoring" className="ml-2 block text-sm text-gray-700">
                  Real-time monitoring
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Information */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-md font-semibold text-blue-800 mb-2">FDA 21 CFR Part 11 Compliance</h3>
          <p className="text-sm text-blue-700">
            These security settings are configured to meet or exceed FDA 21 CFR Part 11 requirements for electronic records and electronic signatures. The blockchain backup feature provides enhanced tamper-evident security that exceeds regulatory requirements.
          </p>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:bg-pink-300 disabled:cursor-not-allowed"
          >
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettingsPanel;