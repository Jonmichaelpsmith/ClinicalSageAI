import React, { useState } from 'react';
import {
  Shield,
  Lock,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Activity,
  FileText,
  Database,
  Zap,
  RefreshCw
} from 'lucide-react';

/**
 * Blockchain Security Panel Component
 * 
 * This component provides a blockchain security dashboard for FDA 21 CFR Part 11 compliance.
 * It integrates blockchain verification for electronic records and signatures.
 * 
 * Features:
 * - Real-time blockchain verification status
 * - Document integrity verification
 * - Electronic signature validation
 * - Audit trail immutability
 * - FDA compliance certification readiness
 */
export default function BlockchainSecurityPanel() {
  const [blockchainStatus, setBlockchainStatus] = useState('connected');
  const [lastSync, setLastSync] = useState('2025-04-26T09:45:12Z');
  const [verificationStatus, setVerificationStatus] = useState({
    documentsVerified: 1429,
    signaturesVerified: 857,
    integrityIssues: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Sample blockchain transactions
  const recentTransactions = [
    {
      id: 'tx-001',
      timestamp: '2025-04-26T10:15:32Z',
      type: 'DOCUMENT_HASH',
      documentId: 'DOC-12458',
      status: 'VERIFIED',
      hash: '0x8a41f994c2eafd4f7c5a01befda31eb4755ea3cf0d2987cf920c7b298576aa19'
    },
    {
      id: 'tx-002',
      timestamp: '2025-04-26T10:18:22Z',
      type: 'SIGNATURE_VERIFICATION',
      documentId: 'DOC-12458',
      signatureId: 'SIG-78923',
      status: 'VERIFIED',
      hash: '0x3d42c8e7f5aeb149c518c3d7a293ddb21f2129cab5fc3c9421ab697c45d3acdf'
    },
    {
      id: 'tx-003',
      timestamp: '2025-04-26T11:10:33Z',
      type: 'SYSTEM_CONFIG_CHANGE',
      configId: 'CFG-PASSWORD-POLICY',
      status: 'VERIFIED',
      hash: '0xf872d7c48e57c816a82c8a231e790e726ba2d9c5b6b8bc87c142d5d64e277273'
    },
    {
      id: 'tx-004',
      timestamp: '2025-04-26T12:42:18Z',
      type: 'DATA_INTEGRITY_CHECK',
      documentId: 'DOC-12983',
      status: 'FAILED',
      reason: 'HASH_MISMATCH',
      hash: '0x24f0c6e5a3a2a52fc95c7c7be6b919afd79a4fb27e784aa7ed07d2b1593fe574'
    },
    {
      id: 'tx-005',
      timestamp: '2025-04-26T16:05:12Z',
      type: 'COMPLIANCE_VALIDATION',
      validationId: 'VAL-45623',
      status: 'VERIFIED',
      hash: '0x89cb2635f4842dabd99cfde8a2b4bad63cafaee2ca073d3566d3a02d0921cabe'
    }
  ];
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setLastSync(new Date().toISOString());
      setIsRefreshing(false);
    }, 1500);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get the transaction icon based on the type
  const getTransactionIcon = (type) => {
    switch(type) {
      case 'DOCUMENT_HASH':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'SIGNATURE_VERIFICATION':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'SYSTEM_CONFIG_CHANGE':
        return <Cpu className="h-5 w-5 text-purple-500" />;
      case 'DATA_INTEGRITY_CHECK':
        return <Database className="h-5 w-5 text-indigo-500" />;
      case 'COMPLIANCE_VALIDATION':
        return <Shield className="h-5 w-5 text-teal-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get badge color based on transaction status
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Blockchain Security Dashboard
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          Enhanced security for FDA 21 CFR Part 11 compliance through blockchain verification
        </p>
      </div>

      {/* Status Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-green-700">Blockchain Status</h3>
              {blockchainStatus === 'connected' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-green-700">Connected</div>
              </div>
              <div className="mt-1 text-sm text-green-600">
                Last synced: {formatDate(lastSync)}
              </div>
              <button
                className="mt-3 flex items-center text-sm text-green-700 hover:text-green-800"
                onClick={handleRefresh}
              >
                <RefreshCw className={`mr-1 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-700">Document Verification</h3>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-blue-700">{verificationStatus.documentsVerified}</div>
              </div>
              <div className="mt-1 text-sm text-blue-600">
                Documents verified on blockchain
              </div>
              <div className="mt-3">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: "100%" }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 mt-1">100% integrity maintained</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-indigo-700">E-Signature Verification</h3>
              <Lock className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-indigo-700">{verificationStatus.signaturesVerified}</div>
              </div>
              <div className="mt-1 text-sm text-indigo-600">
                Signatures cryptographically verified
              </div>
              <div className="mt-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-indigo-600">
                    All signatures comply with 21 CFR Part 11
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Blockchain Transactions */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Activity className="mr-2 h-5 w-5 text-indigo-500" />
          Recent Blockchain Transactions
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Transaction</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <span className="ml-2">{transaction.id}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{transaction.type}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(transaction.timestamp)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {transaction.documentId && <div>Doc: {transaction.documentId}</div>}
                    {transaction.signatureId && <div>Sig: {transaction.signatureId}</div>}
                    {transaction.configId && <div>Config: {transaction.configId}</div>}
                    {transaction.validationId && <div>Val: {transaction.validationId}</div>}
                    {transaction.reason && (
                      <div className="text-red-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" /> {transaction.reason}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Details */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Zap className="mr-2 h-5 w-5 text-indigo-500" />
          Blockchain Verification Details
        </h3>
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <h4 className="text-md font-medium text-indigo-700 mb-2">How blockchain verification works</h4>
          <p className="text-sm text-indigo-600 mb-3">
            Our blockchain verification system provides tamper-evident proof of data integrity for all electronic records and signatures:
          </p>
          <ul className="space-y-2 text-sm text-indigo-600">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Document cryptographic hashes are stored on a permissioned blockchain for immutable verification</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Electronic signatures include blockchain-anchored timestamps and signer identity verification</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Audit logs are secured with blockchain proof-of-existence mechanisms to prevent tampering</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>FDA compliance is enhanced with real-time verification of record authenticity</span>
            </li>
          </ul>
        </div>
      </div>

      {/* FDA Compliance Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-t border-purple-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-6 w-6 text-purple-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">FDA 21 CFR Part 11 Enhanced Compliance</h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                Our blockchain verification exceeds FDA 21 CFR Part 11 requirements by providing cryptographically secure, 
                immutable evidence of electronic records and signatures. This technology ensures data integrity and non-repudiation 
                at a level that surpasses traditional electronic document management systems.
              </p>
              <p className="mt-2">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                  <span>Learn more about our FDA compliance approach</span>
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}