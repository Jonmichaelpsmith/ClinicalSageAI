import React from 'react';

/**
 * Component for displaying demographic information from FAERS data as charts
 * 
 * @param {Object} props - Component props
 * @param {Object} props.faersData - FAERS data object
 * @returns {JSX.Element} - Rendered component
 */
export function FaersDemographicsCharts({ faersData }) {
  if (!faersData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No FAERS data available to display.</p>
      </div>
    );
  }
  
  const demographics = faersData.demographics || {};
  const ageGroups = demographics.ageGroups || {};
  const genderData = demographics.gender || {};
  
  // Function to get the total from a demographic object
  const getTotalCount = (data) => {
    return Object.values(data).reduce((sum, count) => sum + count, 0);
  };
  
  // Get total counts for percentage calculations
  const totalAgeCount = getTotalCount(ageGroups);
  const totalGenderCount = getTotalCount(genderData);
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Demographic Distribution</h3>
        <p className="text-sm text-gray-600 mb-6">
          Analysis of {faersData.totalReports.toLocaleString()} adverse event reports for {faersData.productName}
        </p>
      </div>
      
      {/* Age Distribution Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3">Age Distribution</h4>
        <div className="space-y-3">
          {Object.entries(ageGroups).map(([age, count]) => {
            const percentage = totalAgeCount > 0 ? (count / totalAgeCount) * 100 : 0;
            return (
              <div key={age} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{age}</span>
                  <span>{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Gender Distribution Chart */}
      <div>
        <h4 className="text-sm font-medium mb-3">Gender Distribution</h4>
        <div className="space-y-3">
          {Object.entries(genderData).map(([gender, count]) => {
            const percentage = totalGenderCount > 0 ? (count / totalGenderCount) * 100 : 0;
            // Choose color based on gender
            let barColor = 'bg-purple-500';
            if (gender.toLowerCase() === 'female') barColor = 'bg-pink-500';
            if (gender.toLowerCase() === 'male') barColor = 'bg-blue-500';
            if (gender.toLowerCase() === 'unknown') barColor = 'bg-gray-500';
            
            return (
              <div key={gender} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{gender}</span>
                  <span>{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`${barColor} h-2.5 rounded-full`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Top Reactions Summary */}
      <div>
        <h4 className="text-sm font-medium mb-3">Top Reported Adverse Reactions</h4>
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faersData.reactionCounts && faersData.reactionCounts.slice(0, 7).map((reaction, index) => {
                const percentage = (reaction.count / faersData.totalReports) * 100;
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reaction.reaction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reaction.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="pt-4 text-xs text-gray-500">
        Data sourced from FDA Adverse Event Reporting System (FAERS)
      </div>
    </div>
  );
};

export default FaersDemographicsCharts;
