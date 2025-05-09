import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertTriangle, Key, Lock, Clock, UserCheck, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

const ClientSecuritySettings = () => {
  const { currentClientWorkspace } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Track tab state
  const [activeTab, setActiveTab] = useState('password-policy');

  // Get client workspace ID from the tenant context
  const clientId = currentClientWorkspace?.id;

  // Fetch security settings for the client
  const { 
    data: securitySettings, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/clients', clientId, 'security-settings'],
    queryFn: () => {
      if (!clientId) {
        console.warn('No client workspace selected. Cannot fetch security settings.');
        return Promise.resolve(null);
      }
      return apiRequest(`/api/clients/${clientId}/security-settings`)
        .catch(err => {
          console.error('Error fetching security settings:', err);
          // Return default settings on error instead of throwing
          return null;
        });
    },
    enabled: !!clientId,
    // Fallback to default values if no settings are returned
    select: (data) => ({
      passwordPolicy: {
        minLength: data?.passwordPolicy?.minLength || 12,
        requireUppercase: data?.passwordPolicy?.requireUppercase !== false,
        requireLowercase: data?.passwordPolicy?.requireLowercase !== false,
        requireNumber: data?.passwordPolicy?.requireNumber !== false,
        requireSpecialChar: data?.passwordPolicy?.requireSpecialChar !== false,
        historyCount: data?.passwordPolicy?.historyCount || 5,
        expiryDays: data?.passwordPolicy?.expiryDays || 90
      },
      sessionSettings: {
        timeoutMinutes: data?.sessionSettings?.timeoutMinutes || 30,
        maxConcurrentSessions: data?.sessionSettings?.maxConcurrentSessions || 3,
        enforceIpLock: data?.sessionSettings?.enforceIpLock || false,
        requireMfaForExternalAccess: data?.sessionSettings?.requireMfaForExternalAccess || true
      },
      dataProtection: {
        autoLockDocuments: data?.dataProtection?.autoLockDocuments || true,
        enforceDocumentClassification: data?.dataProtection?.enforceDocumentClassification || true,
        dataRetentionDays: data?.dataProtection?.dataRetentionDays || 3650, // 10 years default
        enableDLP: data?.dataProtection?.enableDLP || false,
        sensitiveDataScanFrequency: data?.dataProtection?.sensitiveDataScanFrequency || 'weekly'
      },
      auditSettings: {
        retentionDays: data?.auditSettings?.retentionDays || 365,
        enableBlockchainBackup: data?.auditSettings?.enableBlockchainBackup || true,
        realTimeMonitoring: data?.auditSettings?.realTimeMonitoring || true,
        autoExportFrequency: data?.auditSettings?.autoExportFrequency || 24,
        trackUserActivity: data?.auditSettings?.trackUserActivity || true
      },
      fdaCompliance: {
        enforceElectronicSignatures: data?.fdaCompliance?.enforceElectronicSignatures || true,
        requireReason: data?.fdaCompliance?.requireReason || true,
        enableAuditTrails: data?.fdaCompliance?.enableAuditTrails || true
      }
    })
  });

  // State to manage form values
  const [formValues, setFormValues] = useState(securitySettings || {
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
      maxConcurrentSessions: 3,
      enforceIpLock: false,
      requireMfaForExternalAccess: true
    },
    dataProtection: {
      autoLockDocuments: true,
      enforceDocumentClassification: true,
      dataRetentionDays: 3650, // 10 years default
      enableDLP: false,
      sensitiveDataScanFrequency: 'weekly'
    },
    auditSettings: {
      retentionDays: 365,
      enableBlockchainBackup: true,
      realTimeMonitoring: true,
      autoExportFrequency: 24,
      trackUserActivity: true
    },
    fdaCompliance: {
      enforceElectronicSignatures: true,
      requireReason: true,
      enableAuditTrails: true
    }
  });

  // Update form values when data is loaded
  React.useEffect(() => {
    if (securitySettings) {
      setFormValues(securitySettings);
    }
  }, [securitySettings]);

  // Mutation to update security settings
  const updateSecuritySettingsMutation = useMutation({
    mutationFn: (data) => apiRequest(`/api/clients/${clientId}/security-settings`, {
      method: 'PATCH',
      data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/clients', clientId, 'security-settings']);
      toast({
        title: "Security settings updated",
        description: "Client workspace security settings have been updated successfully",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error updating security settings",
        description: err.message || "Could not update security settings. Please try again.",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateSecuritySettingsMutation.mutate(formValues);
  };

  // Handle input changes for text/number inputs
  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle toggle/checkbox changes
  const handleToggleChange = (section, field) => {
    setFormValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  // Loading state
  if (isLoading && !formValues) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error Loading Security Settings
          </CardTitle>
          <CardDescription className="text-red-500">
            {error?.message || "Could not load security settings. Please try again later."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries(['/api/clients', clientId, 'security-settings'])}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>Client Security Settings</CardTitle>
        </div>
        <CardDescription>
          Configure security settings specific to the {currentClientWorkspace?.name} workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="password-policy" className="flex items-center">
                <Key className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Password Policy</span>
                <span className="inline sm:hidden">Password</span>
              </TabsTrigger>
              <TabsTrigger value="session" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Session Settings</span>
                <span className="inline sm:hidden">Session</span>
              </TabsTrigger>
              <TabsTrigger value="data-protection" className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Data Protection</span>
                <span className="inline sm:hidden">Data</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Audit Settings</span>
                <span className="inline sm:hidden">Audit</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">FDA Compliance</span>
                <span className="inline sm:hidden">FDA</span>
              </TabsTrigger>
            </TabsList>

            {/* Password Policy Tab */}
            <TabsContent value="password-policy" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="minLength">Minimum Password Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min="8"
                    max="32"
                    value={formValues.passwordPolicy.minLength}
                    onChange={(e) => handleInputChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum number of characters required for passwords
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="historyCount">Password History</Label>
                  <Input
                    id="historyCount"
                    type="number"
                    min="0"
                    max="24"
                    value={formValues.passwordPolicy.historyCount}
                    onChange={(e) => handleInputChange('passwordPolicy', 'historyCount', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of previous passwords that cannot be reused
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="expiryDays">Password Expiry (Days)</Label>
                  <Input
                    id="expiryDays"
                    type="number"
                    min="0"
                    max="365"
                    value={formValues.passwordPolicy.expiryDays}
                    onChange={(e) => handleInputChange('passwordPolicy', 'expiryDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Days until password must be changed (0 = never expires)
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Password Complexity Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="requireUppercase" 
                      checked={formValues.passwordPolicy.requireUppercase}
                      onCheckedChange={() => handleToggleChange('passwordPolicy', 'requireUppercase')}
                    />
                    <Label htmlFor="requireUppercase">Require uppercase letter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="requireLowercase" 
                      checked={formValues.passwordPolicy.requireLowercase}
                      onCheckedChange={() => handleToggleChange('passwordPolicy', 'requireLowercase')}
                    />
                    <Label htmlFor="requireLowercase">Require lowercase letter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="requireNumber" 
                      checked={formValues.passwordPolicy.requireNumber}
                      onCheckedChange={() => handleToggleChange('passwordPolicy', 'requireNumber')}
                    />
                    <Label htmlFor="requireNumber">Require number</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="requireSpecialChar" 
                      checked={formValues.passwordPolicy.requireSpecialChar}
                      onCheckedChange={() => handleToggleChange('passwordPolicy', 'requireSpecialChar')}
                    />
                    <Label htmlFor="requireSpecialChar">Require special character</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Session Settings Tab */}
            <TabsContent value="session" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="timeoutMinutes">Session Timeout (Minutes)</Label>
                  <Input
                    id="timeoutMinutes"
                    type="number"
                    min="5"
                    max="240"
                    value={formValues.sessionSettings.timeoutMinutes}
                    onChange={(e) => handleInputChange('sessionSettings', 'timeoutMinutes', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minutes of inactivity before user is automatically logged out
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="maxConcurrentSessions">Max Concurrent Sessions</Label>
                  <Input
                    id="maxConcurrentSessions"
                    type="number"
                    min="1"
                    max="10"
                    value={formValues.sessionSettings.maxConcurrentSessions}
                    onChange={(e) => handleInputChange('sessionSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of simultaneous logins allowed per user
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Advanced Session Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enforceIpLock">IP Lock Enforcement</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevent session from being used across different IP addresses
                      </p>
                    </div>
                    <Switch 
                      id="enforceIpLock" 
                      checked={formValues.sessionSettings.enforceIpLock}
                      onCheckedChange={() => handleToggleChange('sessionSettings', 'enforceIpLock')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireMfaForExternalAccess">Require MFA for External Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Require multi-factor authentication for non-corporate networks
                      </p>
                    </div>
                    <Switch 
                      id="requireMfaForExternalAccess" 
                      checked={formValues.sessionSettings.requireMfaForExternalAccess}
                      onCheckedChange={() => handleToggleChange('sessionSettings', 'requireMfaForExternalAccess')}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Data Protection Tab */}
            <TabsContent value="data-protection" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoLockDocuments">Auto-Lock Documents</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically lock documents when not actively being edited
                    </p>
                  </div>
                  <Switch 
                    id="autoLockDocuments" 
                    checked={formValues.dataProtection.autoLockDocuments}
                    onCheckedChange={() => handleToggleChange('dataProtection', 'autoLockDocuments')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enforceDocumentClassification">Enforce Document Classification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require sensitivity classification for all documents
                    </p>
                  </div>
                  <Switch 
                    id="enforceDocumentClassification" 
                    checked={formValues.dataProtection.enforceDocumentClassification}
                    onCheckedChange={() => handleToggleChange('dataProtection', 'enforceDocumentClassification')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableDLP">Enable Data Loss Prevention</Label>
                    <p className="text-sm text-muted-foreground">
                      Scan and prevent exfiltration of sensitive information
                    </p>
                  </div>
                  <Switch 
                    id="enableDLP" 
                    checked={formValues.dataProtection.enableDLP}
                    onCheckedChange={() => handleToggleChange('dataProtection', 'enableDLP')}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="dataRetentionDays">Data Retention Period (Days)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    min="365"
                    max="7300"
                    value={formValues.dataProtection.dataRetentionDays}
                    onChange={(e) => handleInputChange('dataProtection', 'dataRetentionDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of days to retain data after project completion
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="sensitiveDataScanFrequency">Sensitive Data Scan Frequency</Label>
                  <Select 
                    value={formValues.dataProtection.sensitiveDataScanFrequency}
                    onValueChange={(value) => handleInputChange('dataProtection', 'sensitiveDataScanFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {formValues.dataProtection.sensitiveDataScanFrequency === 'daily' && 'Daily'}
                        {formValues.dataProtection.sensitiveDataScanFrequency === 'weekly' && 'Weekly'}
                        {formValues.dataProtection.sensitiveDataScanFrequency === 'monthly' && 'Monthly'}
                        {formValues.dataProtection.sensitiveDataScanFrequency === 'quarterly' && 'Quarterly'}
                        {!formValues.dataProtection.sensitiveDataScanFrequency && 'Select frequency'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How often to scan for unprotected sensitive data
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Audit Settings Tab */}
            <TabsContent value="audit" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="retentionDays">Audit Trail Retention (Days)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    min="365"
                    max="3650"
                    value={formValues.auditSettings.retentionDays}
                    onChange={(e) => handleInputChange('auditSettings', 'retentionDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of days to retain audit trail records
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="autoExportFrequency">Auto-Export Frequency (Hours)</Label>
                  <Input
                    id="autoExportFrequency"
                    type="number"
                    min="1"
                    max="168"
                    value={formValues.auditSettings.autoExportFrequency}
                    onChange={(e) => handleInputChange('auditSettings', 'autoExportFrequency', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    How often audit logs are automatically exported
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="trackUserActivity">Track Detailed User Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Record detailed user interactions for compliance purposes
                    </p>
                  </div>
                  <Switch 
                    id="trackUserActivity" 
                    checked={formValues.auditSettings.trackUserActivity}
                    onCheckedChange={() => handleToggleChange('auditSettings', 'trackUserActivity')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableBlockchainBackup">Blockchain Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Use blockchain technology for tamper-evident audit storage
                    </p>
                  </div>
                  <Switch 
                    id="enableBlockchainBackup" 
                    checked={formValues.auditSettings.enableBlockchainBackup}
                    onCheckedChange={() => handleToggleChange('auditSettings', 'enableBlockchainBackup')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="realTimeMonitoring">Real-Time Monitoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor and alert on suspicious activities in real-time
                    </p>
                  </div>
                  <Switch 
                    id="realTimeMonitoring" 
                    checked={formValues.auditSettings.realTimeMonitoring}
                    onCheckedChange={() => handleToggleChange('auditSettings', 'realTimeMonitoring')}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* FDA Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded-lg bg-blue-50">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">FDA 21 CFR Part 11 Compliance</h3>
                      <p className="text-xs text-blue-700 mt-1">
                        Requirements for electronic records and electronic signatures
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border p-4 rounded-lg bg-purple-50">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M8 2h8l4 4v16H4V2h4z"></path>
                        <path d="M16 2v4h4"></path>
                        <path d="M8 15h8"></path>
                        <path d="M8 18h5"></path>
                        <path d="M8 12h8"></path>
                        <path d="M8 9h8"></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-purple-800">EU GMP Annex 11 Compliance</h3>
                      <p className="text-xs text-purple-700 mt-1">
                        Computerized systems validation requirements for EU markets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Electronic Signatures Section */}
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-medium mb-3">Electronic Signatures & Records</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enforceElectronicSignatures" className="flex items-center">
                          Enforce Electronic Signatures
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Required</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Require dual-factor identity verification for all document approvals and critical actions
                        </p>
                      </div>
                      <Switch 
                        id="enforceElectronicSignatures" 
                        checked={formValues.fdaCompliance.enforceElectronicSignatures}
                        onCheckedChange={() => handleToggleChange('fdaCompliance', 'enforceElectronicSignatures')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="requireReason">Require Reason for Change</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must provide documented reason for all modifications to controlled documents
                        </p>
                      </div>
                      <Switch 
                        id="requireReason" 
                        checked={formValues.fdaCompliance.requireReason}
                        onCheckedChange={() => handleToggleChange('fdaCompliance', 'requireReason')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableAuditTrails">Comprehensive Audit Trails</Label>
                        <p className="text-sm text-muted-foreground">
                          Maintain tamper-evident audit trails for all system activities with cryptographic verification
                        </p>
                      </div>
                      <Switch 
                        id="enableAuditTrails" 
                        checked={formValues.fdaCompliance.enableAuditTrails}
                        onCheckedChange={() => handleToggleChange('fdaCompliance', 'enableAuditTrails')}
                      />
                    </div>
                  </div>
                </div>
                
                {/* New Validation & Documentation Section */}
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-medium mb-3">System Validation & Documentation</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="validationApproach">System Validation Approach</Label>
                        <Select 
                          value={formValues.fdaCompliance?.validationApproach || 'riskBased'} 
                          onValueChange={(value) => handleInputChange('fdaCompliance', 'validationApproach', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select validation approach" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="riskBased">Risk-Based Approach (GAMP 5)</SelectItem>
                            <SelectItem value="traditional">Traditional Approach (IQ/OQ/PQ)</SelectItem>
                            <SelectItem value="agile">Agile CSV Methodology</SelectItem>
                            <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Determines validation methodology used for this workspace
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="documentRetentionPeriod">Validation Document Retention</Label>
                        <Select 
                          value={formValues.fdaCompliance?.documentRetentionPeriod || 'lifeplus10'} 
                          onValueChange={(value) => handleInputChange('fdaCompliance', 'documentRetentionPeriod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard (10 years)</SelectItem>
                            <SelectItem value="extended">Extended (15 years)</SelectItem>
                            <SelectItem value="lifeplus2">Product Life + 2 years</SelectItem>
                            <SelectItem value="lifeplus10">Product Life + 10 years</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          How long validation-related documentation will be retained
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enforceUserTesting">Enforce User Acceptance Testing</Label>
                          <p className="text-sm text-muted-foreground">
                            Require formal UAT completion before production use
                          </p>
                        </div>
                        <Switch 
                          id="enforceUserTesting" 
                          checked={formValues.fdaCompliance?.enforceUserTesting || false}
                          onCheckedChange={() => handleToggleChange('fdaCompliance', 'enforceUserTesting')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autoGenerateDocumentation">Auto-Generate Validation Documentation</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically generate required compliance documentation templates
                          </p>
                        </div>
                        <Switch 
                          id="autoGenerateDocumentation" 
                          checked={formValues.fdaCompliance?.autoGenerateDocumentation || true}
                          onCheckedChange={() => handleToggleChange('fdaCompliance', 'autoGenerateDocumentation')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Regulatory Reporting Section */}
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="text-base font-medium mb-3">Regulatory Reporting & Submissions</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportGeneration">Automated Report Generation</Label>
                        <Select 
                          value={formValues.fdaCompliance?.reportGeneration || 'quarterly'} 
                          onValueChange={(value) => handleInputChange('fdaCompliance', 'reportGeneration', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select report frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="biannually">Bi-annually</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                            <SelectItem value="manual">Manual Generation Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Frequency of automated regulatory compliance reports
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="submissionFormat">Submission Format</Label>
                        <Select 
                          value={formValues.fdaCompliance?.submissionFormat || 'ectd'} 
                          onValueChange={(value) => handleInputChange('fdaCompliance', 'submissionFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select submission format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ectd">eCTD (Electronic Common Technical Document)</SelectItem>
                            <SelectItem value="nees">FDA NEES Format</SelectItem>
                            <SelectItem value="cesp">EU CESP Format</SelectItem>
                            <SelectItem value="mixed">Mixed Format (Market-dependent)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Default format for regulatory submissions
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="inspectionReadiness">Inspection Readiness Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Maintain system in continuously inspection-ready state with proactive monitoring
                          </p>
                        </div>
                        <Switch 
                          id="inspectionReadiness" 
                          checked={formValues.fdaCompliance?.inspectionReadiness || true}
                          onCheckedChange={() => handleToggleChange('fdaCompliance', 'inspectionReadiness')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enforceApprovalWorkflows">Enforce Regulatory Approval Workflows</Label>
                          <p className="text-sm text-muted-foreground">
                            Require all documents to follow predefined regulatory approval workflows with strict sequencing
                          </p>
                        </div>
                        <Switch 
                          id="enforceApprovalWorkflows" 
                          checked={formValues.fdaCompliance?.enforceApprovalWorkflows || true}
                          onCheckedChange={() => handleToggleChange('fdaCompliance', 'enforceApprovalWorkflows')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-start">
                  <div className="mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Regulatory Compliance Notice</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Changes to these settings may impact your organization's regulatory compliance status. It is recommended to consult with your Quality Assurance and Regulatory Affairs teams before modifying these settings.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={updateSecuritySettingsMutation.isPending}
              className="flex items-center"
            >
              {updateSecuritySettingsMutation.isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                <>Save Security Settings</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientSecuritySettings;