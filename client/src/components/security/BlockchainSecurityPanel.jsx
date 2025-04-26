import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getBlockchainStatus, getBlockchainTransactions } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';

const BlockchainSecurityPanel = () => {
  const { toast } = useToast();
  const [verifyingIntegrity, setVerifyingIntegrity] = useState(false);

  // Fetch blockchain status
  const { 
    data: blockchainStatus, 
    isLoading: statusLoading, 
    error: statusError 
  } = useQuery({
    queryKey: ['/api/fda-compliance/blockchain/status'],
    queryFn: getBlockchainStatus,
    refetchInterval: 60000 // Refetch every minute
  });

  // Fetch recent blockchain transactions
  const { 
    data: transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError 
  } = useQuery({
    queryKey: ['/api/fda-compliance/blockchain/transactions'],
    queryFn: () => getBlockchainTransactions(5),
    refetchInterval: 60000 // Refetch every minute
  });

  // Mutation for verifying blockchain integrity
  const verifyIntegrityMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/fda-compliance/blockchain/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify blockchain integrity');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Blockchain integrity verified successfully', {
        title: 'Verification Complete'
      });
      
      // Display verification result
      console.log('Blockchain Verification Result:', data);
    },
    onError: (error) => {
      toast.error(`Failed to verify blockchain integrity: ${error.message}`, {
        title: 'Verification Failed'
      });
    }
  });

  // Handle verify integrity
  const handleVerifyIntegrity = () => {
    setVerifyingIntegrity(true);
    verifyIntegrityMutation.mutate();
    setVerifyingIntegrity(false);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get transaction type badge class
  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 'DOCUMENT_HASH':
        return 'bg-blue-100 text-blue-800';
      case 'SIGNATURE_VERIFICATION':
        return 'bg-green-100 text-green-800';
      case 'SYSTEM_CONFIG_CHANGE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render loading state
  if (statusLoading || transactionsLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Blockchain Security</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (statusError || transactionsError) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Blockchain Security</h2>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Failed to load blockchain data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Blockchain Security</h2>
        <button
          onClick={handleVerifyIntegrity}
          disabled={verifyingIntegrity}
          className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed"
        >
          {verifyingIntegrity ? 'Verifying...' : 'Verify Integrity'}
        </button>
      </div>

      {/* Blockchain Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Status</div>
            <div className="flex items-center mt-1">
              <span className={`w-3 h-3 rounded-full mr-2 ${blockchainStatus.status === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-semibold">{blockchainStatus.status}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Type</div>
            <div className="font-semibold mt-1">
              {blockchainStatus.type === 'permissioned' ? 'Permissioned' : 'Public'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Transactions</div>
            <div className="font-semibold mt-1">{blockchainStatus.transactionCount}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Last Updated</div>
            <div className="font-semibold mt-1 text-sm">{formatTimestamp(blockchainStatus.lastUpdated)}</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTransactionTypeClass(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(transaction.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${transaction.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <a href="#/blockchain/transactions" className="text-pink-600 hover:text-pink-800 text-sm">
            View All Transactions →
          </a>
        </div>
      </div>

      {/* Blockchain Information */}
      <div className="mt-6 bg-pink-50 rounded-lg p-4">
        <h3 className="text-md font-semibold text-pink-800 mb-2">Enhanced Security Information</h3>
        <p className="text-sm text-pink-700">
          TrialSage™ implements blockchain security to provide tamper-evident electronic records and signatures for FDA 21 CFR Part 11 compliance. This implementation exceeds regulatory requirements by creating an immutable audit trail that can be independently verified.
        </p>
      </div>
    </div>
  );
};

export default BlockchainSecurityPanel;