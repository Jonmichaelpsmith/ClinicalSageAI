import React, { useState } from 'react';
import {
  Lock,
  Shield,
  User,
  UserPlus,
  Key,
  ToggleLeft,
  ToggleRight,
  Clock,
  AlertTriangle,
  Settings,
  Save,
  RefreshCw
} from 'lucide-react';

/**
 * Security Settings Panel Component
 * 
 * This component provides a comprehensive view of security settings
 * and controls for FDA 21 CFR Part 11 compliance.
 * 
 * Features:
 * - Access control settings
 * - Password policy management
 * - Multi-factor authentication settings
 * - Session management
 * - Audit log configuration
 * - Blockchain security settings
 */
export default function SecuritySettingsPanel() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [blockchainVerificationEnabled, setBlockchainVerificationEnabled] = useState(true);
  const [passwordSettings, setPasswordSettings] = useState({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    historyCount: 5,
    expiryDays: 90
  });
  const [sessionSettings, setSessionSettings] = useState({
    timeoutMinutes: 30,
    allowConcurrentSessions: false,
    maxActiveSessions: 1
  });
  const [auditSettings, setAuditSettings] = useState({
    retentionPeriodDays: 365,
    blockchainBackup: true,
    realTimeMonitoring: true
  });

  // Handle toggle MFA
  const handleToggleMfa = () => {
    setMfaEnabled(!mfaEnabled);
  };

  // Handle toggle blockchain verification
  const handleToggleBlockchainVerification = () => {
    setBlockchainVerificationEnabled(!blockchainVerificationEnabled);
  };

  // Handle password settings change
  const handlePasswordSettingChange = (setting, value) => {
    setPasswordSettings({
      ...passwordSettings,
      [setting]: value
    });
  };

  // Handle session settings change
  const handleSessionSettingChange = (setting, value) => {
    setSessionSettings({
      ...sessionSettings,
      [setting]: value
    });
  };

  // Handle audit settings change
  const handleAuditSettingChange = (setting, value) => {
    setAuditSettings({
      ...auditSettings,
      [setting]: value
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Security Settings
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          Advanced security controls for FDA 21 CFR Part 11 compliance
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Access Control Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="mr-2 h-5 w-5 text-indigo-500" />
              Access Control
            </h3>
          </div>
          
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Multi-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Require MFA for all users as required by FDA 21 CFR Part 11</p>
              </div>
              <button 
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleToggleMfa}
              >
                <span className={`${mfaEnabled ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-white'} pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Role-Based Access Control</h4>
                <p className="text-sm text-gray-500">Enforce granular permissions based on user roles</p>
              </div>
              <button className="btn-secondary">Configure Roles</button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">User Account Management</h4>
                <p className="text-sm text-gray-500">Manage user account creation, modification, and deactivation</p>
              </div>
              <button className="btn-secondary">Manage Users</button>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Key className="mr-2 h-5 w-5 text-indigo-500" />
              Password Policy
            </h3>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="minLength" className="block text-sm font-medium text-gray-700">Minimum Length</label>
                <input
                  type="number"
                  id="minLength"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={passwordSettings.minLength}
                  onChange={(e) => handlePasswordSettingChange('minLength', parseInt(e.target.value))}
                  min="8"
                  max="30"
                />
              </div>
              
              <div>
                <label htmlFor="historyCount" className="block text-sm font-medium text-gray-700">Password History</label>
                <input
                  type="number"
                  id="historyCount"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={passwordSettings.historyCount}
                  onChange={(e) => handlePasswordSettingChange('historyCount', parseInt(e.target.value))}
                  min="1"
                  max="24"
                />
              </div>
              
              <div>
                <label htmlFor="expiryDays" className="block text-sm font-medium text-gray-700">Password Expiry (days)</label>
                <input
                  type="number"
                  id="expiryDays"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={passwordSettings.expiryDays}
                  onChange={(e) => handlePasswordSettingChange('expiryDays', parseInt(e.target.value))}
                  min="30"
                  max="365"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  id="requireUppercase"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={passwordSettings.requireUppercase}
                  onChange={(e) => handlePasswordSettingChange('requireUppercase', e.target.checked)}
                />
                <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-700">
                  Require uppercase
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="requireLowercase"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={passwordSettings.requireLowercase}
                  onChange={(e) => handlePasswordSettingChange('requireLowercase', e.target.checked)}
                />
                <label htmlFor="requireLowercase" className="ml-2 block text-sm text-gray-700">
                  Require lowercase
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="requireNumber"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={passwordSettings.requireNumber}
                  onChange={(e) => handlePasswordSettingChange('requireNumber', e.target.checked)}
                />
                <label htmlFor="requireNumber" className="ml-2 block text-sm text-gray-700">
                  Require number
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="requireSpecial"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={passwordSettings.requireSpecial}
                  onChange={(e) => handlePasswordSettingChange('requireSpecial', e.target.checked)}
                />
                <label htmlFor="requireSpecial" className="ml-2 block text-sm text-gray-700">
                  Require special character
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-indigo-500" />
              Session Management
            </h3>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="timeoutMinutes" className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                <input
                  type="number"
                  id="timeoutMinutes"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={sessionSettings.timeoutMinutes}
                  onChange={(e) => handleSessionSettingChange('timeoutMinutes', parseInt(e.target.value))}
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <label htmlFor="maxActiveSessions" className="block text-sm font-medium text-gray-700">Maximum Active Sessions</label>
                <input
                  type="number"
                  id="maxActiveSessions"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={sessionSettings.maxActiveSessions}
                  onChange={(e) => handleSessionSettingChange('maxActiveSessions', parseInt(e.target.value))}
                  min="1"
                  max="5"
                  disabled={sessionSettings.allowConcurrentSessions === false}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <input
                  id="allowConcurrentSessions"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={sessionSettings.allowConcurrentSessions}
                  onChange={(e) => handleSessionSettingChange('allowConcurrentSessions', e.target.checked)}
                />
                <label htmlFor="allowConcurrentSessions" className="ml-2 block text-sm text-gray-700">
                  Allow concurrent sessions
                </label>
              </div>
              
              <div className="mt-2 rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">FDA Compliance Note</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        21 CFR Part 11 requires that system access be limited to authorized individuals.
                        Allowing concurrent sessions may impact compliance by reducing accountability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="mr-2 h-5 w-5 text-indigo-500" />
              Audit Settings
            </h3>
          </div>
          
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="retentionPeriodDays" className="block text-sm font-medium text-gray-700">Audit Log Retention (days)</label>
              <input
                type="number"
                id="retentionPeriodDays"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={auditSettings.retentionPeriodDays}
                onChange={(e) => handleAuditSettingChange('retentionPeriodDays', parseInt(e.target.value))}
                min="90"
                max="3650"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Blockchain Audit Backup</h4>
                <p className="text-sm text-gray-500">Store audit logs on blockchain for tamper-evident verification</p>
              </div>
              <button 
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => handleAuditSettingChange('blockchainBackup', !auditSettings.blockchainBackup)}
              >
                <span className={`${auditSettings.blockchainBackup ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-white'} pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Real-Time Monitoring</h4>
                <p className="text-sm text-gray-500">Enable real-time monitoring and alerts for security events</p>
              </div>
              <button 
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => handleAuditSettingChange('realTimeMonitoring', !auditSettings.realTimeMonitoring)}
              >
                <span className={`${auditSettings.realTimeMonitoring ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-white'} pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
          </div>
        </div>

        {/* Blockchain Security */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-indigo-500" />
              Blockchain Security
            </h3>
          </div>
          
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Enable Blockchain Verification</h4>
                <p className="text-sm text-gray-500">Use blockchain for tamper-evident record and signature verification</p>
              </div>
              <button 
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={handleToggleBlockchainVerification}
              >
                <span className={`${blockchainVerificationEnabled ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-white'} pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>

            <div className="bg-green-50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Enhanced FDA Compliance</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Blockchain verification exceeds FDA 21 CFR Part 11 requirements by providing
                      cryptographically secure, immutable evidence of electronic records and signatures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Settings */}
        <div className="flex justify-end space-x-3">
          <button className="btn-secondary">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </button>
          <button className="btn-primary">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}