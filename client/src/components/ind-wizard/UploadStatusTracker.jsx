// /client/src/components/ind-wizard/UploadStatusTracker.jsx

export default function UploadStatusTracker({ formStatus }) {
  const items = [
    { label: 'Sponsor Information', key: 'sponsorInfo' },
    { label: 'Form FDA 1571 Uploaded', key: 'form1571Uploaded' },
    { label: 'Form FDA 1572 Uploaded', key: 'form1572Uploaded' },
    { label: 'Cover Letter Uploaded', key: 'coverLetterUploaded' },
    { label: 'Investigator Brochure Uploaded', key: 'ibUploaded' },
    { label: 'U.S. Agent Info (if required)', key: 'usAgentInfo' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Module 1 Completion Tracker</h2>

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