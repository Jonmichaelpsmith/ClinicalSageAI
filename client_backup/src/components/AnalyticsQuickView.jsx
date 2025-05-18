import React from 'react';

const AnalyticsQuickView = () => {
  // Sample analytics data (in a real app these would come from an API)
  const metrics = [
    { 
      id: 'projects', 
      label: 'Active Projects', 
      value: 12, 
      change: 2, 
      trend: 'up', 
      color: 'indigo'
    },
    { 
      id: 'completion', 
      label: 'Avg. Completion', 
      value: '67%', 
      change: 5, 
      trend: 'up', 
      color: 'blue'
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      value: 184, 
      change: 23, 
      trend: 'up', 
      color: 'teal'
    },
    { 
      id: 'ontime', 
      label: 'On-time Rate', 
      value: '92%', 
      change: 3, 
      trend: 'down', 
      color: 'orange'
    }
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div 
            key={metric.id} 
            className={`p-3 rounded-lg bg-${metric.color}-50 border border-${metric.color}-100`}
          >
            <div className="text-sm text-gray-600">{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className={`text-2xl font-bold text-${metric.color}-700`}>{metric.value}</div>
              <div className="flex items-center">
                <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend === 'up' ? '+' : '-'}{metric.change}%
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-3 w-3 ml-1 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={metric.trend === 'up' 
                      ? 'M5 10l7-7m0 0l7 7m-7-7v18' 
                      : 'M19 14l-7 7m0 0l-7-7m7 7V3'} 
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Project Completion Status</h3>
          <div className="space-y-2">
            {[
              { name: 'IND Submissions', value: 85 },
              { name: 'Protocol Development', value: 62 },
              { name: 'CSR Analysis', value: 45 },
              { name: 'CMC Documentation', value: 71 }
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full" 
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsQuickView;