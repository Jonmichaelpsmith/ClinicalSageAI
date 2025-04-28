// /client/src/components/ind-wizard/UploadStatusTrackerModule2.jsx

export default function UploadStatusTrackerModule2({ formStatus }) {
  const items = [
    { label: 'Introduction to Summaries', key: 'introSummary' },
    { label: 'Overall Quality Summary', key: 'overallQualitySummary' },
    { label: 'Nonclinical Overview', key: 'nonclinicalOverview' },
    { label: 'Clinical Overview', key: 'clinicalOverview' },
    { label: 'Written & Tabulated Summaries', key: 'writtenTabulatedSummaries' },
  ];

  // Calculate completion percentage
  const completedCount = Object.values(formStatus).filter(Boolean).length;
  const totalItems = items.length;
  const completionPercentage = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Module 2 Completion Tracker</h2>
        <span className="text-sm font-medium text-indigo-600">{completionPercentage}% Complete</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                formStatus[item.key] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></span>
            <span
              className={`text-sm ${
                formStatus[item.key] ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}