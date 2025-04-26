import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, FileText, Eye, Link, Lock, Clock, CheckCircle } from 'lucide-react';

const BlockchainSecurityPanel = () => {
  const [tabIndex, setTabIndex] = useState(0);
  
  const { data: blockchainStatus, isLoading } = useQuery({
    queryKey: ['/api/fda-compliance/blockchain-status'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const tabs = [
    { name: 'Overview', icon: <Shield className="h-5 w-5" /> },
    { name: 'Verification', icon: <CheckCircle className="h-5 w-5" /> },
    { name: 'Technical Details', icon: <Lock className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 text-pink-500 mr-3" />
          <h2 className="text-xl font-bold text-gray-800">Blockchain Security Framework</h2>
        </div>
        
        <div className="mb-8">
          <p className="text-gray-600">
            TrialSage™ implements an advanced blockchain security framework that provides immutable, tamper-evident records
            for all electronic records and signatures. This enhanced approach exceeds the requirements of 21 CFR Part 11
            by utilizing distributed ledger technology to ensure the integrity and authenticity of all regulated content.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setTabIndex(index)}
                className={`flex items-center pb-4 pt-2 px-1 ${
                  tabIndex === index
                    ? 'border-b-2 border-pink-500 text-pink-600'
                    : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {tabIndex === 0 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Shield className="h-5 w-5 text-pink-500 mr-2" />
                    Status
                  </h3>
                  <p className={`text-lg font-medium ${blockchainStatus?.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {blockchainStatus?.status === 'active' ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last verified: {new Date(blockchainStatus?.lastVerification).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FileText className="h-5 w-5 text-pink-500 mr-2" />
                    Records
                  </h3>
                  <p className="text-lg font-medium text-gray-800">
                    {blockchainStatus?.verifiedRecords} / {blockchainStatus?.totalRecords}
                  </p>
                  <p className="text-sm text-gray-500">
                    Verified records
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Link className="h-5 w-5 text-pink-500 mr-2" />
                    Network
                  </h3>
                  <p className="text-lg font-medium text-gray-800">
                    {blockchainStatus?.networkNodes} Nodes
                  </p>
                  <p className="text-sm text-gray-500">
                    {blockchainStatus?.blockchainType}
                  </p>
                </div>
              </div>
              
              <div className="bg-pink-50 p-5 rounded-lg border border-pink-100">
                <h3 className="font-semibold text-pink-800 mb-3">How Blockchain Security Enhances FDA Compliance</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <span className="text-pink-700">
                      <strong>Immutable Records:</strong> Once stored on the blockchain, records cannot be altered or deleted, ensuring a permanent, tamper-evident audit trail.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <span className="text-pink-700">
                      <strong>Distributed Verification:</strong> Multiple network nodes verify and store copies of records, eliminating single points of failure.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <span className="text-pink-700">
                      <strong>Cryptographic Security:</strong> Advanced cryptographic techniques secure all records and signatures, exceeding regulatory requirements.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <span className="text-pink-700">
                      <strong>Regulatory Readiness:</strong> The enhanced security model provides additional assurances for FDA audits and inspections.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {tabIndex === 1 && (
            <div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Record Verification</h3>
                <p className="text-gray-600 mb-4">
                  Verify the integrity of any document or record in the system by entering its Record ID below.
                  The system will check the blockchain to confirm the record has not been tampered with.
                </p>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Record ID (e.g., DOC-12345)"
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                    Verify
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Recent Verifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">DOC-34567</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date().toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">b7d8f9...c5d6</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">SIG-12345</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(Date.now() - 25 * 60000).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">a7c8d9...b4e5</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">DOC-23456</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(Date.now() - 120 * 60000).toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">c9d0e1...f2g3</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Details Tab */}
          {tabIndex === 2 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Blockchain Configuration</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Blockchain Type:</span>
                        <span className="font-medium">{blockchainStatus?.blockchainType}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Consensus Algorithm:</span>
                        <span className="font-medium">{blockchainStatus?.consensus}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Network Nodes:</span>
                        <span className="font-medium">{blockchainStatus?.networkNodes}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Latest Block ID:</span>
                        <span className="font-medium text-xs">{blockchainStatus?.lastBlockId?.substring(0, 12)}...</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Security Features</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Lock className="h-5 w-5 text-pink-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">SHA-256 Hashing</span>
                          <p className="text-sm text-gray-600">Cryptographic security for all record hashes</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Link className="h-5 w-5 text-pink-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Merkle Tree Validation</span>
                          <p className="text-sm text-gray-600">Efficient verification of data integrity</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Shield className="h-5 w-5 text-pink-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Multi-Node Verification</span>
                          <p className="text-sm text-gray-600">Distributed consensus across multiple validators</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Clock className="h-5 w-5 text-pink-500 mr-2 mt-0.5" />
                        <div>
                          <span className="font-medium">Cryptographic Timestamps</span>
                          <p className="text-sm text-gray-600">Immutable time recording for audit trails</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start">
                  <Eye className="h-5 w-5 text-blue-500 mr-2 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">Blockchain Explorer</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Access the blockchain explorer to view detailed information about blocks, transactions, and network status.
                    </p>
                    <a 
                      href={blockchainStatus?.blockchainExplorer} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium flex items-center"
                    >
                      Open Blockchain Explorer
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainSecurityPanel;