// /client/src/components/ind-wizard/UploadStatusTrackerModule2.jsx

export default function UploadStatusTrackerModule2({ formStatus }) {
  const items = [
    { label: 'Introduction to Summaries Completed', key: 'introSummary' },
    { label: 'Overall Quality Summary Completed', key: 'overallQualitySummary' },
    { label: 'Nonclinical Overview Uploaded', key: 'nonclinicalOverview' },
    { label: 'Clinical Overview Uploaded', key: 'clinicalOverview' },
    { label: 'Written and Tabulated Summaries Uploaded', key: 'writtenTabulatedSummaries' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Module 2 Completion Tracker</h2>

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