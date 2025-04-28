// /client/src/components/ind-wizard/UploadStatusTrackerModule4.jsx

export default function UploadStatusTrackerModule4({ formStatus }) {
  const totalItems = 4;
  const completedItems = [
    formStatus?.pharmacologyUploaded,
    formStatus?.pharmacokineticsUploaded,
    formStatus?.toxicologyUploaded,
    formStatus?.genotoxicityUploaded
  ].filter(Boolean).length;

  const percentComplete = Math.floor((completedItems / totalItems) * 100);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="text-md font-semibold mb-3">Module 4 Upload Status</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span>Progress:</span>
          <span className="font-medium">{percentComplete}% Complete</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${percentComplete < 50 ? 'bg-yellow-500' : 'bg-green-600'}`}
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
        
        <ul className="space-y-2 text-sm mt-4">
          <li className="flex items-start">
            <span className={`mr-2 ${formStatus?.pharmacologyUploaded ? 'text-green-600' : 'text-gray-400'}`}>
              {formStatus?.pharmacologyUploaded ? '✓' : '○'}
            </span>
            <span>Pharmacology Study Reports</span>
          </li>
          <li className="flex items-start">
            <span className={`mr-2 ${formStatus?.pharmacokineticsUploaded ? 'text-green-600' : 'text-gray-400'}`}>
              {formStatus?.pharmacokineticsUploaded ? '✓' : '○'}
            </span>
            <span>Pharmacokinetics (ADME) Study Reports</span>
          </li>
          <li className="flex items-start">
            <span className={`mr-2 ${formStatus?.toxicologyUploaded ? 'text-green-600' : 'text-gray-400'}`}>
              {formStatus?.toxicologyUploaded ? '✓' : '○'}
            </span>
            <span>Toxicology Study Reports</span>
          </li>
          <li className="flex items-start">
            <span className={`mr-2 ${formStatus?.genotoxicityUploaded ? 'text-green-600' : 'text-gray-400'}`}>
              {formStatus?.genotoxicityUploaded ? '✓' : '○'}
            </span>
            <span>Genotoxicity Study Reports</span>
          </li>
        </ul>
      </div>
    </div>
  );
}