import React, { useState, useEffect } from 'react';

// Simple shield lock icon
const ShieldLockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <rect x="8" y="11" width="8" height="5" rx="1"></rect>
    <path d="M12 8v3"></path>
  </svg>
);

// Simple check icon
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Simple alert triangle icon
const AlertTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// Simple link icon
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const BlockchainSecurityPanel = () => {
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simulate loading blockchain data
  useEffect(() => {
    const timer = setTimeout(() => {
      setBlockchainStatus({
        status: 'active',
        securityLevel: 'Enhanced',
        lastVerification: new Date().toISOString(),
        totalRecords: 15782,
        verifiedRecords: 15782,
        networkType: 'Hyperledger Fabric',
        networkNodes: 5,
        consensusAlgorithm: 'Practical Byzantine Fault Tolerance',
        lastBlockHash: '0x7f2c8d3b5a6e9c1f4d2e0b8a7c6f5e4d3c2b1a0',
        blockchainHeight: 14235,
        verificationEvents: [
          {
            id: 'verify-1',
            timestamp: '2025-04-26T08:45:12Z',
            recordType: 'Electronic Signature',
            recordId: 'esig-45621',
            status: 'verified',
            hashValue: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
          },
          {
            id: 'verify-2',
            timestamp: '2025-04-26T09:12:34Z',
            recordType: 'Audit Log',
            recordId: 'alog-78965',
            status: 'verified',
            hashValue: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
          },
          {
            id: 'verify-3',
            timestamp: '2025-04-26T09:37:45Z',
            recordType: 'Document Submission',
            recordId: 'doc-34572',
            status: 'verified',
            hashValue: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b'
          },
          {
            id: 'verify-4',
            timestamp: '2025-04-26T10:05:22Z',
            recordType: 'User Authentication',
            recordId: 'auth-12453',
            status: 'verified',
            hashValue: '0x5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d'
          },
          {
            id: 'verify-5',
            timestamp: '2025-04-26T10:28:17Z',
            recordType: 'System Validation',
            recordId: 'val-90876',
            status: 'verified',
            hashValue: '0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e'
          }
        ]
      });
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Blockchain Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="flex items-center text-green-600 font-medium">
                      <span className="mr-2"><CheckIcon /></span>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Security Level</span>
                    <span className="font-medium">{blockchainStatus.securityLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Network Type</span>
                    <span className="font-medium">{blockchainStatus.networkType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Consensus</span>
                    <span className="font-medium">{blockchainStatus.consensusAlgorithm}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Network Nodes</span>
                    <span className="font-medium">{blockchainStatus.networkNodes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Verification</span>
                    <span className="font-medium">{new Date(blockchainStatus.lastVerification).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Blockchain Statistics</h3>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Total Records</span>
                    <span className="font-medium">{blockchainStatus.totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Verified Records</span>
                    <span className="font-medium">{blockchainStatus.verifiedRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Blockchain Height</span>
                    <span className="font-medium">{blockchainStatus.blockchainHeight.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Block Hash</span>
                    <div className="flex items-center">
                      <span className="text-xs font-mono truncate w-32">{blockchainStatus.lastBlockHash}</span>
                      <button className="ml-2 text-pink-600" title="Copy hash">
                        <LinkIcon />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                  <div className="flex items-center text-pink-800 mb-2">
                    <span className="mr-2"><ShieldLockIcon /></span>
                    <h4 className="font-semibold">Enhanced Security Features</h4>
                  </div>
                  <ul className="text-sm text-pink-700 space-y-2">
                    <li>• Tamper-evident record verification</li>
                    <li>• Cryptographic proof of record integrity</li>
                    <li>• Immutable audit trails</li>
                    <li>• Distributed consensus validation</li>
                    <li>• Transparent verification process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'verification':
        return (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <div className="grid grid-cols-12 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Timestamp</div>
                <div className="col-span-2">Record Type</div>
                <div className="col-span-2">Record ID</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-4">Hash Value</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {blockchainStatus.verificationEvents.map((event) => (
                <div key={event.id} className="px-4 py-3 grid grid-cols-12 text-sm">
                  <div className="col-span-2 text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  <div className="col-span-2 font-medium text-gray-900">
                    {event.recordType}
                  </div>
                  <div className="col-span-2 text-gray-500">
                    {event.recordId}
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center">
                    <span className="text-xs font-mono truncate w-32">{event.hashValue}</span>
                    <button className="ml-2 text-pink-600" title="Copy hash">
                      <LinkIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'validation':
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <span className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                  <CheckIcon />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">Blockchain Validation Status</h3>
                  <p className="text-gray-600">All blockchain security features are operational and validated</p>
                </div>
              </div>
              
              <div className="h-2 bg-gray-100 rounded-full mb-2">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="text-right text-sm text-gray-500">100% validated</div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Cryptographic Verification</h4>
                <p className="text-sm text-gray-600 mb-3">
                  SHA-256 hashing with elliptic curve digital signatures (ECDSA) for maximum security and compliance.
                </p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="mr-1"><CheckIcon /></span>
                    Verified
                  </span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Consensus Mechanism</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Practical Byzantine Fault Tolerance (PBFT) consensus algorithm ensuring security with minimal resource usage.
                </p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="mr-1"><CheckIcon /></span>
                    Verified
                  </span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Smart Contract Compliance</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Automated compliance enforcement via smart contracts that validate all electronic records and signatures.
                </p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="mr-1"><CheckIcon /></span>
                    Verified
                  </span>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">Network Security</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Multi-layer security with TLS encryption, certificate authority, and role-based access control.
                </p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="mr-1"><CheckIcon /></span>
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <span className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mr-3">
            <ShieldLockIcon />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Blockchain Security</h2>
            <p className="text-gray-600">Enhanced tamper-evident record security for FDA 21 CFR Part 11 compliance</p>
          </div>
        </div>
        
        <div className="flex flex-wrap mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`mr-2 py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`mr-2 py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'verification'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Verification Events
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`mr-2 py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'validation'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security Validation
          </button>
        </div>
      </div>
      
      {renderTabContent()}
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Advanced Blockchain Security</h3>
        <p className="text-gray-600 mb-4">
          Our enhanced blockchain security exceeds FDA 21 CFR Part 11 requirements, providing tamper-evident records with 
          cryptographic verification that ensures the integrity of all electronic records and signatures.
        </p>
        <button className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded text-sm font-medium">
          View Security Details
        </button>
      </div>
    </div>
  );
};

export default BlockchainSecurityPanel;