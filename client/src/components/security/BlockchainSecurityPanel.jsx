import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Search,
  FileText,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
  Database,
  Lock,
  CheckCircle2
} from 'lucide-react';

/**
 * Blockchain Security Panel Component
 * 
 * This component provides a transparent view of blockchain-verified security
 * elements used throughout the TrialSage system to exceed FDA 21 CFR Part 11
 * compliance requirements for tamper-evidence and data integrity.
 * 
 * Features:
 * - Verification of blockchain-secured records
 * - Audit trail verification
 * - Electronic signature blockchain verification
 * - Immutable compliance evidence
 * - Record integrity verification
 */
export default function BlockchainSecurityPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [expandedVerification, setExpandedVerification] = useState(null);

  // Sample blockchain verification data
  const blockchainData = {
    totalRecords: 14328,
    verifiedRecords: 12458,
    lastVerification: '2025-04-25T08:30:00Z',
    verificationSuccess: 99.7,
    blockchainNetwork: 'Ethereum (Private)',
    smartContractAddress: '0x8F5e7C6eFa6a5678f1e238A3aB7d0941e5782c79',
    recentVerifications: [
      {
        id: 'vrf-001',
        recordId: 'DOC-12458',
        recordType: 'Document',
        transactionId: '0x7F5e7C6eFa6a5678f1e238A3aB7d0941e5782c42',
        timestamp: '2025-04-25T14:32:18Z',
        status: 'verified',
        verificationHash: 'e8df56d10b41e89b574432af355bd8c5a85a8bffab1b0eba5e9ce84ab7d8bf41',
        signedBy: 'john.smith',
        details: {
          documentTitle: 'Clinical Study Report',
          documentVersion: '2.3',
          action: 'SIGNATURE',
          meaning: 'APPROVAL'
        }
      },
      {
        id: 'vrf-002',
        recordId: 'DOC-12983',
        recordType: 'Document',
        transactionId: '0x6F5a2C6eFa6a5678f1e238A3cA7d0941e5142d47',
        timestamp: '2025-04-24T16:42:18Z',
        status: 'verification_failed',
        verificationHash: 'a1df56d10b41e89b574432af355bd8c5a85a8bffab1b0eba5e9ce84ab7d8dcc2',
        signedBy: 'mary.johnson',
        details: {
          documentTitle: 'Protocol Amendment',
          documentVersion: '1.2',
          action: 'MODIFICATION',
          issue: 'Hash mismatch'
        }
      },
      {
        id: 'vrf-003',
        recordId: 'AUDIT-45678',
        recordType: 'Audit Trail',
        transactionId: '0x8F5e7C6eFa6a5678f1e238A3aB7d0941e5782c79',
        timestamp: '2025-04-25T12:15:32Z',
        status: 'verified',
        verificationHash: 'c3df56d10b41e89b574432af355bd8c5a85a8bffab1b0eba5e9ce84ab7d8245e',
        signedBy: 'system',
        details: {
          eventType: 'SYSTEM_VALIDATION',
          action: 'VALIDATION_COMPLETED',
          auditId: '85a8bffab1b0eba5'
        }
      },
      {
        id: 'vrf-004',
        recordId: 'SIG-78923',
        recordType: 'Electronic Signature',
        transactionId: '0x5F5a7A1eFa6a5678f1e238A3aB7d0941e5782f65',
        timestamp: '2025-04-23T09:42:12Z',
        status: 'verified',
        verificationHash: 'd4df56d10b41e89b574432af355bd8c5a85a8bffab1b0eba5e9ce84ab7d87f2',
        signedBy: 'robert.wilson',
        details: {
          documentTitle: 'Final Study Report',
          documentVersion: '3.0',
          action: 'SIGNATURE',
          meaning: 'FINAL_APPROVAL'
        }
      },
      {
        id: 'vrf-005',
        recordId: 'VALIDATION-12345',
        recordType: 'System Validation',
        transactionId: '0x9F5e7D7bFa6a5678f1e238A3aB7d0941e5782c22',
        timestamp: '2025-04-15T10:30:00Z',
        status: 'verified',
        verificationHash: 'e5df56d10b41e89b574432af355bd8c5a85a8bffab1b0eba5e9ce84ab7d83f6',
        signedBy: 'system',
        details: {
          validationType: 'FULL',
          testCount: 312,
          passRate: 99.2
        }
      }
    ]
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter verifications by search term
  const filteredVerifications = blockchainData.recentVerifications.filter(
    verification => 
      searchTerm === '' || 
      verification.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.signedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle verification request
  const handleVerifyRecord = (recordId) => {
    setVerificationStatus('loading');
    
    // Simulate verification process
    setTimeout(() => {
      setVerificationStatus('success');
    }, 1500);
  };

  // Toggle verification expansion
  const toggleVerificationExpansion = (verificationId) => {
    setExpandedVerification(expandedVerification === verificationId ? null : verificationId);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-hotpink-600 to-hotpink-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Blockchain Security Verification
        </h2>
        <p className="text-hotpink-100 text-sm mt-1">
          Tamper-evident blockchain verification exceeding FDA 21 CFR Part 11 requirements
        </p>
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
            onClick={() => setActiveTab('verifications')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'verifications'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Verifications
          </button>
          
          <button
            onClick={() => setActiveTab('verify')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'verify'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Verify Record
          </button>
          
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'setup'
                ? 'border-hotpink-500 text-hotpink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Blockchain Setup
          </button>
        </nav>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Verification Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Verification Summary</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Records Verified
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {blockchainData.verifiedRecords.toLocaleString()}
                      </dd>
                      <dd className="mt-1 text-sm text-gray-500">
                        of {blockchainData.totalRecords.toLocaleString()} total records
                      </dd>
                    </div>
                    
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Verification Success Rate
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-green-600">
                        {blockchainData.verificationSuccess}%
                      </dd>
                      <dd className="mt-1 text-sm text-gray-500">
                        above FDA requirements
                      </dd>
                    </div>
                    
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Last Verification
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {formatDate(blockchainData.lastVerification).split(',')[0]}
                      </dd>
                      <dd className="mt-1 text-sm text-gray-500">
                        {formatDate(blockchainData.lastVerification).split(',')[1]}
                      </dd>
                    </div>
                    
                    <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Blockchain Network
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        Ethereum
                      </dd>
                      <dd className="mt-1 text-sm text-gray-500">
                        Private secured network
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Smart Contract Address: {blockchainData.smartContractAddress}
                  </span>
                  
                  <button
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-hotpink-700 bg-hotpink-100 hover:bg-hotpink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
            
            {/* FDA Compliance */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">FDA 21 CFR Part 11 Compliance</h3>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium text-gray-900">Electronic Records Protection</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Blockchain verification ensures all electronic records maintain their integrity throughout their life cycle, exceeding requirements in 21 CFR Part 11.10(a) and 11.30.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium text-gray-900">Tamper-Evident Audit Trails</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Blockchain-secured audit trails provide cryptographically verifiable evidence of all system activities, exceeding requirements in 21 CFR Part 11.10(e).
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium text-gray-900">Electronic Signature Binding</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Electronic signatures are cryptographically bound to their respective records and verified on blockchain, exceeding requirements in 21 CFR Part 11.70.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-base font-medium text-gray-900">System Validation Evidence</h4>
                        <p className="mt-1 text-sm text-gray-500">
                          System validation results are recorded on blockchain for immutable evidence of validation status, exceeding requirements in 21 CFR Part 11.10(a).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-700">
                      Exceeds FDA 21 CFR Part 11 requirements for electronic records and signatures
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Verifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Verifications</h3>
                
                <button
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                  onClick={() => setActiveTab('verifications')}
                >
                  View All
                </button>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {blockchainData.recentVerifications.slice(0, 3).map((verification) => (
                    <li key={verification.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {verification.status === 'verified' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{verification.recordId}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(verification.timestamp)} • {verification.recordType}
                            </p>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            verification.status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {verification.status === 'verified' ? 'Verified' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Blockchain Verifications</h3>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm"
                  placeholder="Search verifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredVerifications.length > 0 ? (
                  filteredVerifications.map((verification) => (
                    <li key={verification.id} className="px-4 py-4 sm:px-6">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleVerificationExpansion(verification.id)}
                      >
                        <div className="flex items-center">
                          {verification.status === 'verified' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{verification.recordId}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(verification.timestamp)}
                              <span className="mx-1">•</span>
                              <FileText className="h-3 w-3 mr-1" />
                              {verification.recordType}
                              <span className="mx-1">•</span>
                              <User className="h-3 w-3 mr-1" />
                              {verification.signedBy}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            verification.status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {verification.status === 'verified' ? 'Verified' : 'Failed'}
                          </span>
                          <ArrowRight className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${
                            expandedVerification === verification.id ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                      
                      {expandedVerification === verification.id && (
                        <div className="mt-4 ml-8">
                          <div className="bg-gray-50 rounded-md p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Details</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Transaction ID</p>
                                <p className="text-sm text-gray-900 font-mono">{verification.transactionId}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs font-medium text-gray-500">Verification Hash</p>
                                <p className="text-sm text-gray-900 font-mono">{verification.verificationHash}</p>
                              </div>
                              
                              {verification.details && Object.entries(verification.details).map(([key, value]) => (
                                <div key={key}>
                                  <p className="text-xs font-medium text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}</p>
                                  <p className="text-sm text-gray-900">{value}</p>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <button
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                              >
                                <Search className="mr-2 h-4 w-4" />
                                View on Blockchain
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-12 text-center">
                    <Search className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No verifications found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search to find what you're looking for.
                    </p>
                  </li>
                )}
              </ul>
              
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="text-sm text-gray-700">
                  Showing {filteredVerifications.length} of {blockchainData.recentVerifications.length} verifications
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Verify Record Tab */}
        {activeTab === 'verify' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Record on Blockchain</h3>
            
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="record-id" className="block text-sm font-medium text-gray-700">
                        Record ID
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="record-id"
                          id="record-id"
                          className="shadow-sm focus:ring-hotpink-500 focus:border-hotpink-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., DOC-12458"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="record-type" className="block text-sm font-medium text-gray-700">
                        Record Type
                      </label>
                      <div className="mt-1">
                        <select
                          id="record-type"
                          name="record-type"
                          className="shadow-sm focus:ring-hotpink-500 focus:border-hotpink-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="document">Document</option>
                          <option value="signature">Electronic Signature</option>
                          <option value="audit">Audit Trail</option>
                          <option value="validation">System Validation</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="verification-hash" className="block text-sm font-medium text-gray-700">
                        Verification Hash (Optional)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="verification-hash"
                          id="verification-hash"
                          className="shadow-sm focus:ring-hotpink-500 focus:border-hotpink-500 block w-full sm:text-sm border-gray-300 rounded-md font-mono"
                          placeholder="e.g., e8df56d10b41e89b574432af355bd8c5a85a8bffab1b0eba5e9ce84ab7d8bf41"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        If provided, the system will verify that the hash matches the blockchain record.
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                        onClick={() => handleVerifyRecord('DOC-12458')}
                        disabled={verificationStatus === 'loading'}
                      >
                        {verificationStatus === 'loading' ? (
                          <>
                            <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="-ml-1 mr-2 h-5 w-5" />
                            Verify on Blockchain
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {verificationStatus === 'success' && (
                    <div className="mt-6">
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">
                              Record verified on blockchain
                            </h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>
                                Record DOC-12458 has been successfully verified on the blockchain.
                                The verification hash matches the blockchain record.
                              </p>
                            </div>
                            <div className="mt-4">
                              <div className="-mx-2 -my-1.5 flex">
                                <button
                                  type="button"
                                  className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Blockchain Setup Tab */}
        {activeTab === 'setup' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Blockchain Configuration</h3>
            
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Blockchain Network Information</h4>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center mb-1">
                      <Zap className="h-5 w-5 text-gray-400 mr-2" />
                      <dt className="text-sm font-medium text-gray-500">Network Type</dt>
                    </div>
                    <dd className="mt-1 text-sm text-gray-900 ml-7">Ethereum (Private)</dd>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Database className="h-5 w-5 text-gray-400 mr-2" />
                      <dt className="text-sm font-medium text-gray-500">Node Endpoint</dt>
                    </div>
                    <dd className="mt-1 text-sm text-gray-900 ml-7">https://blockchain.trialsage.com</dd>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <Lock className="h-5 w-5 text-gray-400 mr-2" />
                      <dt className="text-sm font-medium text-gray-500">Smart Contract</dt>
                    </div>
                    <dd className="mt-1 text-sm text-gray-900 font-mono ml-7">{blockchainData.smartContractAddress}</dd>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-1">
                      <CheckCircle2 className="h-5 w-5 text-gray-400 mr-2" />
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                    </div>
                    <dd className="mt-1 text-sm text-green-600 ml-7">Connected and operational</dd>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Connection
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Blockchain Security Configuration</h4>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Record Types to Verify</label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="document-verification"
                            name="document-verification"
                            type="checkbox"
                            className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="document-verification" className="font-medium text-gray-700">Document Verification</label>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="signature-verification"
                            name="signature-verification"
                            type="checkbox"
                            className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="signature-verification" className="font-medium text-gray-700">Electronic Signatures</label>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="audit-verification"
                            name="audit-verification"
                            type="checkbox"
                            className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="audit-verification" className="font-medium text-gray-700">Audit Trails</label>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="validation-verification"
                            name="validation-verification"
                            type="checkbox"
                            className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="validation-verification" className="font-medium text-gray-700">System Validation</label>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="data-verification"
                            name="data-verification"
                            type="checkbox"
                            className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300 rounded"
                            defaultChecked
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="data-verification" className="font-medium text-gray-700">Data Records</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="verification-frequency" className="block text-sm font-medium text-gray-700">
                      Verification Frequency
                    </label>
                    <select
                      id="verification-frequency"
                      name="verification-frequency"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-hotpink-500 focus:border-hotpink-500 sm:text-sm rounded-md"
                      defaultValue="real-time"
                    >
                      <option value="real-time">Real-time (Immediate)</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Authentication Method
                    </label>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="auth-apikey"
                          name="authentication-method"
                          type="radio"
                          checked
                          className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300"
                        />
                        <label htmlFor="auth-apikey" className="ml-3 block text-sm font-medium text-gray-700">
                          API Key Authentication
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="auth-certificate"
                          name="authentication-method"
                          type="radio"
                          className="focus:ring-hotpink-500 h-4 w-4 text-hotpink-600 border-gray-300"
                        />
                        <label htmlFor="auth-certificate" className="ml-3 block text-sm font-medium text-gray-700">
                          Certificate Authentication
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}