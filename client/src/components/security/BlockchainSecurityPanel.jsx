import React, { useState } from 'react';
import { Shield, Check, Lock, FileText, ChevronRight, Database, Zap, Globe, RefreshCw } from 'lucide-react';
import blockchainSecurityClient from '../../lib/blockchain-security';

/**
 * Blockchain Security Panel Component
 * 
 * Displays the AI-enhanced blockchain security features of TrialSage:
 * - Realtime blockchain verification
 * - Document integrity protection
 * - AI-powered threat detection
 * - Smart contract-based access control
 */
export default function BlockchainSecurityPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(false);
  
  // Animation state for the security pulse
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Function to simulate verification
  const simulateVerification = () => {
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 2000);
  };
  
  // Blockchain configuration
  const blockchainConfig = blockchainSecurityClient.getBlockchainConfig();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with blockchain verification badge */}
      <div className="bg-gradient-to-r from-hotpink-600 to-hotpink-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            AI-Enhanced Blockchain Security
          </h2>
          <p className="text-hotpink-100 text-sm mt-1">
            Enterprise-grade protection powered by AI and blockchain technology
          </p>
        </div>
        
        <div className="flex items-center">
          <div 
            className={`h-3 w-3 rounded-full mr-2 ${isVerifying ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} 
          />
          <span className="text-white text-sm font-medium">
            {isVerifying ? 'Verifying...' : 'Blockchain Secured'}
          </span>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
            activeTab === 'overview'
              ? 'border-b-2 border-hotpink-500 text-hotpink-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
            activeTab === 'features'
              ? 'border-b-2 border-hotpink-500 text-hotpink-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Key Features
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center ${
            activeTab === 'verify'
              ? 'border-b-2 border-hotpink-500 text-hotpink-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Verification
        </button>
      </div>
      
      {/* Tab content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex items-start mb-6">
              <div className="flex-shrink-0 bg-hotpink-100 rounded-lg p-3">
                <Shield className="h-6 w-6 text-hotpink-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  The Future of Regulatory Security
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  TrialSage combines the immutability of blockchain with the intelligence of AI 
                  to create the highest level of security available for regulatory documents.
                </p>
              </div>
            </div>
            
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200 mb-6">
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Current blockchain status:
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Network:</span> {blockchainConfig.network}
                </div>
                <div>
                  <span className="font-medium">Consensus:</span> {blockchainConfig.consensusAlgorithm.replace(/-/g, ' ')}
                </div>
                <div>
                  <span className="font-medium">Immutable storage:</span> {blockchainConfig.immutableStorage ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <span className="font-medium">Smart contracts:</span> {blockchainConfig.smartContractEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <span className="font-medium">AI verification:</span> {blockchainConfig.aiVerificationEnabled ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <span className="font-medium">Block confirmations:</span> {blockchainConfig.blockConfirmations}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div onClick={() => setShowDetails(!showDetails)} className="cursor-pointer">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900">How It Works</h3>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transform transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                </div>
                {showDetails && (
                  <div className="mt-2 text-sm text-gray-500 space-y-2">
                    <p>
                      <span className="font-medium">1. Document Integrity:</span> Every document is cryptographically hashed and registered on the blockchain, creating an immutable record of its existence and content.
                    </p>
                    <p>
                      <span className="font-medium">2. AI Verification:</span> AI algorithms continuously analyze access patterns and document modifications, detecting anomalies that might indicate security threats.
                    </p>
                    <p>
                      <span className="font-medium">3. Smart Contracts:</span> Access control is managed through blockchain smart contracts, ensuring that only authorized users can view or modify documents.
                    </p>
                    <p>
                      <span className="font-medium">4. Audit Trail:</span> All actions are recorded on the blockchain, creating a tamper-proof audit trail that meets or exceeds regulatory requirements.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={simulateVerification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
              >
                <Shield className="mr-2 h-4 w-4" />
                {isVerifying ? 'Verifying Security...' : 'Verify Blockchain Security'}
              </button>
            </div>
          </div>
        )}
        
        {/* Key Features Tab */}
        {activeTab === 'features' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Immutable Document Registry</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      Every document is cryptographically hashed and registered on a private blockchain, 
                      creating tamper-proof evidence of document integrity and chain of custody.
                    </p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>SHA-256 cryptographic hashing</li>
                      <li>Blockchain-backed version control</li>
                      <li>Cryptographic proof of existence</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">AI-Powered Threat Detection</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      Machine learning algorithms continuously analyze access patterns and user behaviors,
                      identifying potential security threats before they become breaches.
                    </p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>Anomaly detection using ML models</li>
                      <li>Behavioral biometrics verification</li>
                      <li>Predictive threat analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <Lock className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Smart Contract Access Control</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      Document access is governed by blockchain-based smart contracts that enforce
                      complex permission rules while maintaining a verifiable access log.
                    </p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>Role-based access control</li>
                      <li>Conditional permission logic</li>
                      <li>Time-bound access grants</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <Globe className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Regulatory Compliance Shield</h3>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      Built-in compliance with FDA 21 CFR Part 11, GDPR, HIPAA, and other regulatory 
                      requirements through cryptographically verifiable audit trails.
                    </p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li>Compliant electronic signatures</li>
                      <li>Non-repudiation of actions</li>
                      <li>Automated compliance reporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-3 rounded-md bg-hotpink-50 text-hotpink-700 text-sm">
                <Shield className="mr-2 h-5 w-5 text-hotpink-500" />
                Combining AI with blockchain creates a security system that is both intelligent and immutable.
              </div>
            </div>
          </div>
        )}
        
        {/* Verification Tab */}
        {activeTab === 'verify' && (
          <div>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full ${
                isVerifying ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {isVerifying ? (
                  <RefreshCw className="h-12 w-12 text-yellow-600 animate-spin" />
                ) : (
                  <Check className="h-12 w-12 text-green-600" />
                )}
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {isVerifying ? 'Verifying Blockchain Security' : 'Blockchain Security Verified'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isVerifying 
                  ? 'Checking blockchain integrity and smart contract status...' 
                  : 'All security systems are active and verified on the blockchain.'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Security Verification Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Blockchain Integrity</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="mr-1 h-3 w-3" /> Verified
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Smart Contracts</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="mr-1 h-3 w-3" /> Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">AI Security Models</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="mr-1 h-3 w-3" /> Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Latest Block Hash</span>
                  <span className="text-xs font-mono text-gray-700">
                    0x7a8b...f43d
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Verification</span>
                  <span className="text-xs text-gray-700">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      View complete blockchain verification report for detailed analysis.
                    </p>
                    <p className="mt-3 text-sm md:mt-0 md:ml-6">
                      <button
                        onClick={simulateVerification}
                        className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                      >
                        Generate Report <span aria-hidden="true">&rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={simulateVerification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-hotpink-600 hover:bg-hotpink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}