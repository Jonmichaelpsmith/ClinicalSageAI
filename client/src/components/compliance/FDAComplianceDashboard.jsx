import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  ChevronRight,
  Lock,
  Zap,
  Database
} from 'lucide-react';

/**
 * FDA Compliance Dashboard Component
 * 
 * This component provides a comprehensive dashboard for monitoring
 * FDA 21 CFR Part 11 compliance status.
 * 
 * Features:
 * - Compliance status overview
 * - Electronic signature validation
 * - Data integrity metrics
 * - Audit readiness assessment
 * - System validation status
 */
export default function FDAComplianceDashboard() {
  const [lastValidation, setLastValidation] = useState('2025-04-25T14:30:12Z');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample compliance metrics
  const complianceMetrics = {
    overallCompliance: 98,
    electronicSignatures: 100,
    accessControls: 100,
    auditTrails: 95,
    dataIntegrity: 97,
    systemValidation: 98,
    documentationCompleteness: 96
  };
  
  // Sample compliance issues
  const complianceIssues = [
    {
      id: 'COMP-001',
      category: 'AUDIT_TRAILS',
      severity: 'LOW',
      description: 'Some audit logs not exported to blockchain within 24 hours',
      recommendation: 'Adjust export frequency to every 12 hours',
      status: 'REMEDIATION_IN_PROGRESS',
      dueDate: '2025-05-15'
    },
    {
      id: 'COMP-002',
      category: 'DOCUMENTATION',
      severity: 'LOW',
      description: 'SOP for handling system backups needs review',
      recommendation: 'Update SOP to reflect new backup verification process',
      status: 'OPEN',
      dueDate: '2025-05-10'
    },
    {
      id: 'COMP-003',
      category: 'DATA_INTEGRITY',
      severity: 'MEDIUM',
      description: 'Hash verification failed for 3 archived documents',
      recommendation: 'Restore from verified backup and re-hash documents',
      status: 'RESOLVED',
      dueDate: '2025-04-20'
    }
  ];
  
  // Sample validation events
  const validationEvents = [
    {
      id: 'VAL-001',
      timestamp: '2025-04-25T14:30:12Z',
      type: 'SYSTEM_VALIDATION',
      status: 'PASSED',
      score: 98,
      details: 'Full system validation completed successfully'
    },
    {
      id: 'VAL-002',
      timestamp: '2025-04-15T10:25:45Z',
      type: 'SECURITY_ASSESSMENT',
      status: 'PASSED',
      score: 97,
      details: 'Security controls evaluated and verified'
    },
    {
      id: 'VAL-003',
      timestamp: '2025-04-10T09:15:30Z',
      type: 'USER_ACCESS_REVIEW',
      status: 'PASSED',
      score: 100,
      details: 'User access controls reviewed and verified'
    },
    {
      id: 'VAL-004',
      timestamp: '2025-04-05T11:20:15Z',
      type: 'DATA_INTEGRITY_CHECK',
      status: 'PASSED',
      score: 96,
      details: 'Data integrity across all records verified'
    },
    {
      id: 'VAL-005',
      timestamp: '2025-04-01T15:45:22Z',
      type: 'BACKUP_VALIDATION',
      status: 'PASSED',
      score: 100,
      details: 'Backup and recovery procedures validated'
    }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle refresh validation
  const handleRefreshValidation = () => {
    setIsRefreshing(true);
    // In a real implementation, this would trigger a new validation
    setTimeout(() => {
      setLastValidation(new Date().toISOString());
      setIsRefreshing(false);
    }, 2000);
  };

  // Get severity badge color
  const getSeverityBadgeColor = (severity) => {
    switch(severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    if (status === 'RESOLVED') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'REMEDIATION_IN_PROGRESS') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status === 'OPEN') {
      return 'bg-indigo-100 text-indigo-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Get compliance score color
  const getComplianceScoreColor = (score) => {
    if (score >= 95) {
      return 'text-green-600';
    } else if (score >= 90) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  // Render compliance score gauge
  const renderComplianceGauge = (score, label) => {
    const scoreColor = getComplianceScoreColor(score);
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={score >= 95 ? '#10b981' : score >= 90 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12"
              strokeDasharray={Math.PI * 108}
              strokeDashoffset={Math.PI * 108 * (1 - score / 100)}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${scoreColor}`}>{score}%</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700 font-medium">{label}</div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          FDA Compliance Dashboard
        </h2>
        <p className="text-teal-100 text-sm mt-1">
          21 CFR Part 11 Compliance Status and Metrics
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`px-4 py-3 border-b-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-3 border-b-2 text-sm font-medium ${
              activeTab === 'issues'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('issues')}
          >
            Compliance Issues
          </button>
          <button
            className={`px-4 py-3 border-b-2 text-sm font-medium ${
              activeTab === 'validation'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('validation')}
          >
            Validation History
          </button>
          <button
            className={`px-4 py-3 border-b-2 text-sm font-medium ${
              activeTab === 'report'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('report')}
          >
            Compliance Report
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Compliance Status</h3>
              <p className="text-sm text-gray-500">
                Last validation: {formatDate(lastValidation)}
              </p>
            </div>
            <button
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              onClick={handleRefreshValidation}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Validation
            </button>
          </div>

          {/* Main Compliance Score */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center items-center">
                <div className="relative h-36 w-36">
                  <svg viewBox="0 0 120 120" className="h-full w-full">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray={Math.PI * 108}
                      strokeDashoffset={Math.PI * 108 * (1 - complianceMetrics.overallCompliance / 100)}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">{complianceMetrics.overallCompliance}%</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-lg font-medium text-gray-900">Overall Compliance</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    System exceeds 21 CFR Part 11 requirements
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Electronic Signatures</h4>
                    <div className="mt-1 relative h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="absolute h-full bg-green-500"
                        style={{ width: `${complianceMetrics.electronicSignatures}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-green-600">{complianceMetrics.electronicSignatures}%</span>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Access Controls</h4>
                    <div className="mt-1 relative h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="absolute h-full bg-green-500"
                        style={{ width: `${complianceMetrics.accessControls}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-green-600">{complianceMetrics.accessControls}%</span>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Audit Trails</h4>
                    <div className="mt-1 relative h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="absolute h-full bg-green-500"
                        style={{ width: `${complianceMetrics.auditTrails}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-green-600">{complianceMetrics.auditTrails}%</span>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Data Integrity</h4>
                    <div className="mt-1 relative h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="absolute h-full bg-green-500"
                        style={{ width: `${complianceMetrics.dataIntegrity}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-green-600">{complianceMetrics.dataIntegrity}%</span>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">System Validation</h4>
                    <div className="mt-1 relative h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className="absolute h-full bg-green-500"
                        style={{ width: `${complianceMetrics.systemValidation}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-green-600">{complianceMetrics.systemValidation}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-green-800">Electronic Signatures</h3>
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700">Biometric authentication enabled</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700">Multi-factor authentication enforced</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700">Signatures record meaning and intent</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-green-700">Blockchain verification exceeds requirements</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-blue-800">Audit Trails</h3>
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-blue-700">Independent, computer-generated audit logs</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-blue-700">Chronological record of all system events</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-blue-700">Tamper-evident blockchain backup</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-blue-700">Export frequency needs optimization</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-indigo-800">Data Integrity</h3>
                  <Database className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-indigo-700">Cryptographic verification of all records</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-indigo-700">Automated validation on all data entries</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-indigo-700">Date/time stamps secured with audit trails</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm text-indigo-700">3 archived documents need rehashing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              onClick={() => setActiveTab('report')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Detailed Compliance Report
            </button>
          </div>
        </div>
      )}

      {/* Compliance Issues Tab */}
      {activeTab === 'issues' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Compliance Issues</h3>
              <p className="text-sm text-gray-500">
                {complianceIssues.filter(issue => issue.status !== 'RESOLVED').length} active issues requiring attention
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Search issues..."
              />
            </div>
          </div>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Issue ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Severity</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {complianceIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {issue.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{issue.category.replace(/_/g, ' ')}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityBadgeColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-900">{issue.description}</div>
                        <div className="text-gray-500">{issue.recommendation}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(issue.status)}`}>
                        {issue.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{issue.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-2">Issue Resolution Process</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center text-gray-700 mb-2">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Step 1</span>
                  <h5 className="text-sm font-medium">Identification</h5>
                </div>
                <p className="text-xs text-gray-600">Issues identified through system validation or audits</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center text-gray-700 mb-2">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Step 2</span>
                  <h5 className="text-sm font-medium">Assessment</h5>
                </div>
                <p className="text-xs text-gray-600">Severity determined and remediation plan created</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center text-gray-700 mb-2">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Step 3</span>
                  <h5 className="text-sm font-medium">Remediation</h5>
                </div>
                <p className="text-xs text-gray-600">Corrective action implemented and verified</p>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex items-center text-gray-700 mb-2">
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Step 4</span>
                  <h5 className="text-sm font-medium">Validation</h5>
                </div>
                <p className="text-xs text-gray-600">Fix validated and documented with audit trail</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation History Tab */}
      {activeTab === 'validation' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Validation History</h3>
              <p className="text-sm text-gray-500">
                Record of system validation activities for 21 CFR Part 11 compliance
              </p>
            </div>
            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Validation Records
            </button>
          </div>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Validation ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {validationEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {event.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(event.timestamp)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{event.type.replace(/_/g, ' ')}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {event.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-green-600">{event.score}%</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{event.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-lg border border-teal-200">
            <h4 className="text-md font-medium text-teal-800 flex items-center mb-3">
              <Shield className="mr-2 h-5 w-5 text-teal-600" />
              Continuous Validation Framework
            </h4>
            <p className="text-sm text-teal-700 mb-4">
              Our FDA 21 CFR Part 11 compliance is maintained through a continuous validation framework that exceeds regulatory requirements:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border border-teal-100">
                <h5 className="text-sm font-medium text-teal-800 mb-2">Automated Testing</h5>
                <p className="text-xs text-teal-700">Continuous automated testing validates system integrity on a daily basis</p>
              </div>
              <div className="bg-white p-3 rounded border border-teal-100">
                <h5 className="text-sm font-medium text-teal-800 mb-2">Validation Documentation</h5>
                <p className="text-xs text-teal-700">Comprehensive documentation maintains audit-readiness at all times</p>
              </div>
              <div className="bg-white p-3 rounded border border-teal-100">
                <h5 className="text-sm font-medium text-teal-800 mb-2">Risk-Based Approach</h5>
                <p className="text-xs text-teal-700">Risk assessment framework prioritizes validation activities for critical functionality</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Report Tab */}
      {activeTab === 'report' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Compliance Report</h3>
              <p className="text-sm text-gray-500">
                FDA 21 CFR Part 11 Compliance Status Report
              </p>
            </div>
            <button
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF Report
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-base font-medium text-gray-900">Executive Summary</h4>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                The TrialSage™ system has achieved a 98% overall compliance score with FDA 21 CFR Part 11 requirements. 
                The system implements enhanced security measures that exceed regulatory requirements in several areas, 
                particularly in electronic signatures, data integrity, and audit trail management.
              </p>
              <p className="text-sm text-gray-700 mb-4">
                The implementation of blockchain verification for electronic records and signatures provides an 
                additional layer of security and immutability that goes beyond standard compliance requirements.
                This approach ensures tamper-evident record management and strengthens the overall regulatory posture.
              </p>
              <p className="text-sm text-gray-700">
                There are currently 2 open compliance issues that require remediation, both of low to medium severity. 
                These issues have remediation plans in place with target completion dates within the next 30 days. 
                None of these issues impact the system's ability to maintain compliant operations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-base font-medium text-gray-900">Part 11 Subpart B - Electronic Records</h4>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.10 Controls for closed systems</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.30 Controls for open systems</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.50 Signature manifestations</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.70 Signature/record linking</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-base font-medium text-gray-900">Part 11 Subpart C - Electronic Signatures</h4>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.100 General requirements</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.200 Electronic signature components and controls</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">§11.300 Controls for identification codes/passwords</h5>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
                        <div
                          className="absolute h-full bg-green-500"
                          style={{ width: '95%' }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-green-600">95%</span>
                  </div>
                </div>
                
                <div className="bg-teal-50 p-3 rounded border border-teal-200">
                  <h5 className="text-sm font-medium text-teal-800 mb-1">Blockchain Enhancement</h5>
                  <p className="text-xs text-teal-700">
                    Blockchain verification exceeds standard Part 11 requirements by providing cryptographically 
                    secure, tamper-evident proof of electronic signature authenticity and record integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-base font-medium text-gray-900">Compliance Enhancement Initiatives</h4>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Blockchain Security Integration</h5>
                    <p className="mt-1 text-sm text-gray-600">
                      Implementation of blockchain verification for all electronic records and signatures, 
                      providing immutable proof of authenticity and integrity beyond FDA requirements.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Advanced Audit Trail Analytics</h5>
                    <p className="mt-1 text-sm text-gray-600">
                      Implementation of machine learning analytics for audit trails to identify 
                      potential security issues and compliance risks proactively.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Zero-Trust Security Architecture</h5>
                    <p className="mt-1 text-sm text-gray-600">
                      Implementation of a zero-trust security model that continuously validates 
                      every access request regardless of source, enhancing Part 11 compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 rounded-lg border border-green-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-green-800 flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                  FDA Certification Readiness
                </h4>
                <p className="mt-2 text-sm text-green-700">
                  The system exceeds all required standards for FDA 21 CFR Part 11 compliance and is 
                  prepared for regulatory inspection. Continuous validation maintains this state of readiness.
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600">98%</div>
                <div className="text-sm text-green-700">Overall Compliance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-400" />
              Last updated: {formatDate(lastValidation)}
            </div>
          </div>
          <a
            href="#"
            className="text-sm text-teal-600 hover:text-teal-500 font-medium flex items-center"
          >
            <span>FDA Compliance Documentation</span>
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}