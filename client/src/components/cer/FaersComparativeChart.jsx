import React from 'react';
import FaersRiskBadge from './FaersRiskBadge';

/**
 * A component that displays comparative safety analysis between
 * a product and similar drugs in its class
 * 
 * Note: In a real implementation, this would use Chart.js/react-chartjs-2
 * for interactive charting, but for this demo we'll use a simpler approach
 * 
 * @param {Object} props - Component props
 * @param {string} props.productName - Primary product name
 * @param {Object} props.faersData - FAERS data including comparators
 * @returns {JSX.Element} - Rendered component
 */
export function FaersComparativeChart({ productName, faersData }) {
  if (!faersData || !faersData.comparators || faersData.comparators.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No comparative data available for this product.</p>
      </div>
    );
  }

  // Get the class/category info from the first comparator
  const drugClass = faersData.comparators[0].therapeuticClass || 'Medication';
  
  // Sort comparators by risk score
  const sortedComparators = [...faersData.comparators]
    .sort((a, b) => a.riskScore - b.riskScore);
  
  // Determine where the current product ranks among comparators
  const allProducts = [
    ...sortedComparators.map(c => ({ 
      name: c.comparator, 
      riskScore: c.riskScore, 
      reportCount: c.reportCount,
      isCurrentProduct: false 
    })),
    { 
      name: productName, 
      riskScore: faersData.riskScore, 
      reportCount: faersData.totalReports || 0,
      isCurrentProduct: true 
    }
  ].sort((a, b) => a.riskScore - b.riskScore);
  
  // Calculate percentile rank
  const currentIndex = allProducts.findIndex(p => p.isCurrentProduct);
  const percentileRank = Math.round((currentIndex / (allProducts.length - 1)) * 100);
  
  // Generate safety profile text
  let safetyProfile = '';
  if (percentileRank < 25) {
    safetyProfile = 'Better safety profile than most similar products';
  } else if (percentileRank < 50) {
    safetyProfile = 'Better than average safety profile';
  } else if (percentileRank < 75) {
    safetyProfile = 'Worse than average safety profile';
  } else {
    safetyProfile = 'Worse safety profile than most similar products';
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">{drugClass} Class Comparison</h3>
        <p className="text-sm text-gray-600 mb-1">
          {allProducts.length} products analyzed
        </p>
        <div className="flex items-center space-x-1 mb-4">
          <span className="text-sm font-medium">{safetyProfile}</span>
          <span className="text-xs text-gray-500">({percentileRank}th percentile)</span>
        </div>
      </div>
      
      {/* Risk Score Bar Chart */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium mb-2">Relative Risk Scores</h4>
        {allProducts.map((product, i) => (
          <div key={i} className={`flex items-center space-x-2 ${product.isCurrentProduct ? 'bg-blue-50 p-2 rounded-md' : ''}`}>
            <div className="w-32 truncate">
              <span className={`text-sm ${product.isCurrentProduct ? 'font-bold' : ''}`}>
                {product.name}
              </span>
            </div>
            <div className="flex-grow">
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${product.isCurrentProduct ? 'bg-blue-500' : 'bg-gray-400'}`}
                  style={{ width: `${Math.min(100, (product.riskScore / 3) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-right">
              <FaersRiskBadge riskScore={product.riskScore} size="sm" showLabel={false} showTooltip={true} />
              <span className="ml-2 text-sm">{product.riskScore.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Report Count Comparison */}
      <div className="mt-8">
        <h4 className="text-sm font-medium mb-2">Adverse Event Reports</h4>
        <div className="relative overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Reports</th>
                <th className="px-4 py-2">Risk Score</th>
                <th className="px-4 py-2">Comparison</th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((product, i) => (
                <tr key={i} className={`border-t border-gray-200 ${product.isCurrentProduct ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.reportCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <FaersRiskBadge riskScore={product.riskScore} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {product.isCurrentProduct ? (
                      <span className="text-blue-500 font-medium">Reference</span>
                    ) : (
                      <span className={getComparisonClass(product.riskScore, faersData.riskScore)}>
                        {getComparisonText(product.riskScore, faersData.riskScore)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Data based on FDA Adverse Event Reporting System (FAERS)
        </p>
      </div>
    </div>
  );
};

/**
 * Determine comparison text based on risk scores
 */
function getComparisonText(comparatorScore, referenceScore) {
  const ratio = comparatorScore / referenceScore;
  
  if (ratio < 0.7) return 'Significantly better';
  if (ratio < 0.9) return 'Somewhat better';
  if (ratio < 1.1) return 'Similar';
  if (ratio < 1.3) return 'Somewhat worse';
  return 'Significantly worse';
}

/**
 * Determine CSS class for comparison text
 */
function getComparisonClass(comparatorScore, referenceScore) {
  const ratio = comparatorScore / referenceScore;
  
  if (ratio < 0.7) return 'text-green-600 font-medium';
  if (ratio < 0.9) return 'text-green-500';
  if (ratio < 1.1) return 'text-gray-500';
  if (ratio < 1.3) return 'text-orange-500';
  return 'text-red-500 font-medium';
}

export default FaersComparativeChart;
