import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Clock, 
  Activity, 
  Clipboard, 
  RefreshCw, 
  Database, 
  Lock, 
  FileCheck,
  ChevronDown,
  ChevronUp,
  Zap,
  Download,
  Eye
} from 'lucide-react';

/**
 * FDA Compliance Dashboard Component
 * 
 * Provides a comprehensive view of FDA 21 CFR Part 11 compliance:
 * - Compliance status for key regulation areas
 * - Data integrity metrics
 * - Electronic signatures validation
 * - System validation status
 * - Audit trail monitoring
 * - Compliance reporting
 */
export default function FDAComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  // Toggle expanded section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Simulate compliance status data
  const complianceStatus = {
    status: 'COMPLIANT',
    complianceScore: 96,
    lastFullValidation: '2025-04-15T10:30:00Z',
    componentStatus: {
      ACCESS_CONTROLS: {
        status: 'COMPLIANT',
        score: 95,
        lastValidated: '2025-04-15T10:30:00Z'
      },
      AUDIT_TRAIL: {
        status: 'COMPLIANT',
        score: 98,
        lastValidated: '2025-04-15T10:30:00Z'
      },
      ELECTRONIC_SIGNATURES: {
        status: 'COMPLIANT',
        score: 100,
        lastValidated: '2025-04-15T10:30:00Z'
      },
      SYSTEM_VALIDATION: {
        status: 'COMPLIANT',
        score: 92,
        lastValidated: '2025-04-15T10:30:00Z'
      },
      DATA_INTEGRITY: {
        status: 'COMPLIANT',
        score: 97,
        lastValidated: '2025-04-15T10:30:00Z'
      },
      DOCUMENTATION: {
        status: 'WARNING',
        score: 88,
        lastValidated: '2025-04-15T10:30:00Z'
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLIANT':
      case 'VALIDATED':
      case 'PASSED':
        return 'text-green-600';
      case 'VALIDATION_REQUIRED':
      case 'WARNING':
        return 'text-yellow-600';
      case 'NON_COMPLIANT':
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLIANT':
      case 'VALIDATED':
      case 'PASSED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'VALIDATION_REQUIRED':
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'NON_COMPLIANT':
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-hotpink-600 to-hotpink-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              FDA 21 CFR Part 11 Compliance Dashboard
            </h2>
            <p className="text-hotpink-100 text-sm mt-1">
              Comprehensive monitoring and validation of regulatory compliance
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-700 hover:bg-hotpink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('data-integrity')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'data-integrity'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Integrity
          </button>
          
          <button
            onClick={() => setActiveTab('signatures')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'signatures'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Electronic Signatures
          </button>
          
          <button
            onClick={() => setActiveTab('validation')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'validation'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Validation
          </button>
          
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Audit Trails
          </button>
          
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
        </nav>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Overall Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Overall Compliance Status</h3>
                <button
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Run Compliance Check
                </button>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(complianceStatus.status)}
                    <h3 className={`ml-2 text-lg font-medium ${getStatusColor(complianceStatus.status)}`}>
                      {complianceStatus.status === 'COMPLIANT' ? 'FDA 21 CFR Part 11 Compliant' : 'Compliance Issues Detected'}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border border-gray-200">
                    <span className={`text-xl font-bold ${getStatusColor(complianceStatus.status)}`}>
                      {Math.round(complianceStatus.complianceScore)}%
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(complianceStatus.componentStatus).map(([component, status]) => (
                      <div key={component} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(status.status)}
                          <span className="ml-2 font-medium text-gray-900">
                            {component.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${status.status === 'COMPLIANT' ? 'bg-green-500' : status.status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${status.score}%` }}
                          ></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                          <span>Score: {status.score}%</span>
                          <span>Last checked: {formatDate(status.lastValidated).split(',')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 text-sm text-gray-500">
                  Last full validation: {formatDate(complianceStatus.lastFullValidation)}
                </div>
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Compliance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Data Integrity */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5">
                        <h4 className="text-sm font-medium text-gray-900">Data Integrity</h4>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">
                            97%
                          </p>
                          <p className="ml-2 text-sm text-gray-500">
                            verified
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          12,458 blockchain verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* System Validation */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5">
                        <h4 className="text-sm font-medium text-gray-900">System Validation</h4>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">
                            94%
                          </p>
                          <p className="ml-2 text-sm text-gray-500">
                            coverage
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          312 test cases
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Audit Trails */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5">
                        <h4 className="text-sm font-medium text-gray-900">Audit Trails</h4>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">
                            24,621
                          </p>
                          <p className="ml-2 text-sm text-gray-500">
                            events
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          452 security events
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Electronic Signatures */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-hotpink-100 rounded-md p-3">
                        <FileCheck className="h-6 w-6 text-hotpink-600" />
                      </div>
                      <div className="ml-5">
                        <h4 className="text-sm font-medium text-gray-900">E-Signatures</h4>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">
                            100%
                          </p>
                          <p className="ml-2 text-sm text-gray-500">
                            compliant
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          All signatures verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Issues */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Compliance Issues</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Component
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Requirement
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Finding
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          AUDIT_TRAIL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Audit trail protection from tampering
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Blockchain verification of audit trails implemented but 3% of records not verified
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            WARNING
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          DOCUMENTATION
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Training records for users
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Training records are maintained but 4 users have outdated training
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            WARNING
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
                  <button
                    className="text-sm text-hotpink-600 hover:text-hotpink-900 font-medium"
                    onClick={() => setActiveTab('reports')}
                  >
                    View all issues
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Data Integrity Tab */}
        {activeTab === 'data-integrity' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Data Integrity</h3>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
              >
                <Database className="mr-2 h-4 w-4" />
                Run Integrity Check
              </button>
            </div>
            
            {/* Data Integrity Stats */}
            <div className="mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Records Statistics</h3>
                  <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-md px-4 py-5 border border-gray-200">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">14,328</dd>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-md px-4 py-5 border border-gray-200">
                      <dt className="text-sm font-medium text-gray-500 truncate">Verified Records</dt>
                      <dd className="mt-1 text-3xl font-semibold text-green-600">13,910</dd>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-md px-4 py-5 border border-gray-200">
                      <dt className="text-sm font-medium text-gray-500 truncate">Blockchain Verified</dt>
                      <dd className="mt-1 text-3xl font-semibold text-blue-600">12,458</dd>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-md px-4 py-5 border border-gray-200">
                      <dt className="text-sm font-medium text-gray-500 truncate">Issues Detected</dt>
                      <dd className="mt-1 text-3xl font-semibold text-yellow-600">18</dd>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 text-sm text-gray-500">
                  Last full check: April 25, 2025 8:30 AM
                </div>
              </div>
            </div>
            
            {/* Record Integrity */}
            <div className="mb-6">
              <div 
                className="border border-gray-200 rounded-lg overflow-hidden"
                onClick={() => toggleSection('recordIntegrity')}
              >
                <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Record Integrity Controls
                  </h3>
                  <div>
                    {expandedSections.recordIntegrity ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedSections.recordIntegrity && (
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Original Records Preservation</h4>
                          <p className="text-sm text-gray-500">
                            All original records are preserved with cryptographic verification to ensure document integrity throughout the record lifecycle.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Complete Audit Trail</h4>
                          <p className="text-sm text-gray-500">
                            Each record maintains a complete audit trail of all changes, with blockchain verification to prevent tampering.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Cryptographic Validation</h4>
                          <p className="text-sm text-gray-500">
                            Multi-algorithm cryptographic hashing (SHA-256, SHA3-384) ensures data integrity with defense-in-depth approach.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">AI-Powered Validation</h4>
                          <p className="text-sm text-gray-500">
                            Machine learning algorithms continuously monitor data for anomalies or inconsistencies that might indicate integrity issues.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Blockchain Verification</h4>
                          <p className="text-sm text-gray-500">
                            Critical records are registered on blockchain for tamper-evident storage and verification, exceeding FDA requirements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Integrity Issues */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Integrity Issues</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Record ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Operation
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          DOC-12458
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          April 24, 2025 14:25:36
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          VERIFY
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Blockchain verification timeout
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          DOC-12983
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          April 24, 2025 16:42:18
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          CHECK
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Hash mismatch
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Electronic Signatures Tab */}
        {activeTab === 'signatures' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Electronic Signatures</h3>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Validate Signatures
              </button>
            </div>
            
            {/* Signature Compliance */}
            <div className="mb-6">
              <div 
                className="border border-gray-200 rounded-lg overflow-hidden"
                onClick={() => toggleSection('signatureCompliance')}
              >
                <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    21 CFR Part 11 Signature Compliance
                  </h3>
                  <div>
                    {expandedSections.signatureCompliance ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedSections.signatureCompliance && (
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Unique User Identification</h4>
                          <p className="text-sm text-gray-500">
                            Each electronic signature is uniquely linked to an individual user and cannot be reused or reassigned.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Complete Signature Information</h4>
                          <p className="text-sm text-gray-500">
                            All signatures include printed name, date, time, and meaning (e.g., authored, reviewed, approved).
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Multi-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">
                            Two-component authentication required for all signatures, exceeding the FDA's requirements.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Cryptographic Binding</h4>
                          <p className="text-sm text-gray-500">
                            Signatures are cryptographically bound to their respective documents to prevent tampering.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Blockchain Verification</h4>
                          <p className="text-sm text-gray-500">
                            Signatures are registered on blockchain for tamper-evident verification, exceeding FDA requirements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Signature Meanings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Signature Meanings</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meaning
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          AUTHOR
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          I am the author of this document
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Indicates the signer created the content of the document
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          REVIEWER
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          I have reviewed this document
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Indicates the signer has reviewed and verified the content
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          APPROVER
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          I approve this document
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Indicates the signer has approved the document for use
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          FINAL_APPROVAL
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Final Approval for Release
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          Indicates final authorization to release the document
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* System Validation Tab */}
        {activeTab === 'validation' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">System Validation</h3>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Run System Validation
              </button>
            </div>
            
            {/* Validation Status */}
            <div className="mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-green-200">
                <div className="px-4 py-5 sm:p-6 bg-green-50">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        System Validated
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        The system has been fully validated according to FDA requirements.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Last Full Validation</dt>
                      <dd className="mt-1 text-sm text-gray-900">April 15, 2025</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Requirement Coverage</dt>
                      <dd className="mt-1 text-sm text-gray-900">94.2%</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Automation Coverage</dt>
                      <dd className="mt-1 text-sm text-gray-900">87.5%</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Active Validations</dt>
                      <dd className="mt-1 text-sm text-gray-900">0</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Test Cases: 312, Requirements: 128
                  </span>
                  
                  <div>
                    <button
                      className="text-sm text-hotpink-600 hover:text-hotpink-900 font-medium"
                    >
                      View Validation Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Validation Approach */}
            <div className="mb-6">
              <div 
                className="border border-gray-200 rounded-lg overflow-hidden"
                onClick={() => toggleSection('validationApproach')}
              >
                <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Continuous Validation Approach
                  </h3>
                  <div>
                    {expandedSections.validationApproach ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedSections.validationApproach && (
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Risk-Based Validation</h4>
                          <p className="text-sm text-gray-500">
                            Our validation approach prioritizes system components based on regulatory impact and patient safety risk.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Automated Test Suite</h4>
                          <p className="text-sm text-gray-500">
                            273 automated test cases continuously validate system functionality.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Comprehensive Traceability</h4>
                          <p className="text-sm text-gray-500">
                            Requirements are traced to test cases and validation evidence, ensuring complete coverage.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Change Impact Analysis</h4>
                          <p className="text-sm text-gray-500">
                            Every system change undergoes rigorous impact analysis to determine validation requirements.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Blockchain Verification</h4>
                          <p className="text-sm text-gray-500">
                            Critical validation results are recorded on blockchain for tamper-evident verification, exceeding FDA requirements.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Validation Documentation */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Documentation</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <ul className="divide-y divide-gray-200">
                    <li className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Validation Master Plan</p>
                          <p className="text-sm text-gray-500">v2.3 - Updated April 15, 2025</p>
                        </div>
                      </div>
                      <div>
                        <Eye className="h-5 w-5 text-hotpink-500 cursor-pointer" />
                      </div>
                    </li>
                    <li className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">System Requirements Specification</p>
                          <p className="text-sm text-gray-500">v3.1 - Updated March 28, 2025</p>
                        </div>
                      </div>
                      <div>
                        <Eye className="h-5 w-5 text-hotpink-500 cursor-pointer" />
                      </div>
                    </li>
                    <li className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Traceability Matrix</p>
                          <p className="text-sm text-gray-500">v2.4 - Updated April 20, 2025</p>
                        </div>
                      </div>
                      <div>
                        <Eye className="h-5 w-5 text-hotpink-500 cursor-pointer" />
                      </div>
                    </li>
                    <li className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Validation Summary Report</p>
                          <p className="text-sm text-gray-500">v1.2 - Updated April 22, 2025</p>
                        </div>
                      </div>
                      <div>
                        <Eye className="h-5 w-5 text-hotpink-500 cursor-pointer" />
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Audit Trails Tab */}
        {activeTab === 'audit' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Audit Trails</h3>
              <div className="flex space-x-2">
                <button
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Logs
                </button>
                
                <button
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Audit Trail Controls */}
            <div className="mb-6">
              <div 
                className="border border-gray-200 rounded-lg overflow-hidden"
                onClick={() => toggleSection('auditTrailControls')}
              >
                <div className="bg-gray-50 px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Audit Trail Controls
                  </h3>
                  <div>
                    {expandedSections.auditTrailControls ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
                
                {expandedSections.auditTrailControls && (
                  <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Computer-Generated Audit Trails</h4>
                          <p className="text-sm text-gray-500">
                            Automatic, system-generated audit trails capture all user actions and system events with accurate timestamps.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Complete Record Lifecycle Tracking</h4>
                          <p className="text-sm text-gray-500">
                            All create, modify, and delete operations are recorded with user identification and detailed changes.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Tamper-Evident Storage</h4>
                          <p className="text-sm text-gray-500">
                            Audit trails are stored in a secure, tamper-evident database with cryptographic verification.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">Blockchain Verification</h4>
                          <p className="text-sm text-gray-500">
                            Critical audit events are recorded on blockchain for immutable verification, exceeding FDA requirements.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">AI-Powered Anomaly Detection</h4>
                          <p className="text-sm text-gray-500">
                            Machine learning algorithms continuously analyze audit trails to detect suspicious patterns.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Audit Events */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Audit Events</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          April 25, 2025 14:32:18
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          DOCUMENT_SIGNED
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          john.smith
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">documentId:</span> DOC-12458
                          </div>
                          <div>
                            <span className="font-medium">meaning:</span> APPROVAL
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          April 25, 2025 14:28:45
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          DOCUMENT_MODIFIED
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          mary.johnson
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">documentId:</span> DOC-12458
                          </div>
                          <div>
                            <span className="font-medium">version:</span> 2.3
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Showing 2 of 24,621 events
                  </span>
                  
                  <div>
                    <button
                      className="text-sm text-hotpink-600 hover:text-hotpink-900 font-medium"
                    >
                      View All Events
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Compliance Reports</h3>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Generate New Report
              </button>
            </div>
            
            {/* Available Reports */}
            <div className="mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Available Reports</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-hotpink-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Monthly Compliance Report</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Comprehensive monthly report of all FDA 21 CFR Part 11 compliance metrics
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last generated: April 1, 2025
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">System Validation Report</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Full system validation results with test case details
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last generated: April 22, 2025
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center mb-2">
                        <Activity className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Audit Trail Analysis</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Detailed analysis of audit trail events with security insights
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last generated: April 24, 2025
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center mb-2">
                        <Database className="h-5 w-5 text-yellow-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Data Integrity Report</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Analysis of data integrity metrics and verification results
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last generated: April 25, 2025
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center mb-2">
                        <FileCheck className="h-5 w-5 text-hotpink-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Electronic Signatures Audit</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Audit of electronic signatures against 21 CFR Part 11 requirements
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last generated: April 20, 2025
                      </p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-purple-500 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Blockchain Verification Report</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Verification of blockchain-secured records and audit events
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Last generated: April 25, 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}