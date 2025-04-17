import React from 'react';
import CERGenerator from '../components/CERGenerator';

export default function EnhancedCERDashboardPage() {
  const [activeNdcCodes, setActiveNdcCodes] = React.useState<string[]>([]);
  const [inputNdcCode, setInputNdcCode] = React.useState('');
  const [comparativeData, setComparativeData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Add a code to the comparison list
  const addNdcCode = () => {
    if (!inputNdcCode.trim()) {
      setError('Please enter a valid NDC code');
      return;
    }

    if (activeNdcCodes.includes(inputNdcCode)) {
      setError('This NDC code is already in the list');
      return;
    }

    setActiveNdcCodes([...activeNdcCodes, inputNdcCode]);
    setInputNdcCode('');
    setError('');
  };

  // Remove a code from the comparison list
  const removeNdcCode = (codeToRemove: string) => {
    setActiveNdcCodes(activeNdcCodes.filter(code => code !== codeToRemove));
  };

  // Fetch comparative data from API
  const fetchComparativeData = async () => {
    if (activeNdcCodes.length === 0) {
      setError('Please add at least one NDC code for analysis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cer/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ndc_codes: activeNdcCodes,
          include_comparative_analysis: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparative data');
      }

      const data = await response.json();
      setComparativeData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // List of suggested medications with NDC codes
  const suggestedMedications = [
    { name: 'Humira', ndc: '0074-3799' },
    { name: 'Entresto', ndc: '0078-0527' },
    { name: 'Ozempic', ndc: '50090-4730' },
    { name: 'Lipitor', ndc: '0069-0187' },
    { name: 'Januvia', ndc: '0006-0277' }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-blue-500">
        Enhanced CER Dashboard
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Single CER Generator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Single CER Generation</h2>
          <CERGenerator />
        </div>
        
        {/* Right column - Comparative Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Comparative Analysis</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Add NDC Codes for Comparison:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputNdcCode}
                onChange={(e) => setInputNdcCode(e.target.value)}
                placeholder="Enter NDC Code"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={addNdcCode}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Suggested medications */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Suggested Medications:</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedMedications.map((med, index) => (
                <button
                  key={index}
                  onClick={() => setInputNdcCode(med.ndc)}
                  className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-gray-200"
                >
                  {med.name} ({med.ndc})
                </button>
              ))}
            </div>
          </div>
          
          {/* Active NDC codes list */}
          {activeNdcCodes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Selected for Analysis:</h3>
              <div className="flex flex-wrap gap-2">
                {activeNdcCodes.map((code, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full"
                  >
                    <span>{code}</span>
                    <button
                      onClick={() => removeNdcCode(code)}
                      className="text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Run analysis button */}
          <button
            onClick={fetchComparativeData}
            disabled={activeNdcCodes.length === 0 || loading}
            className={`w-full py-2 rounded font-medium ${
              activeNdcCodes.length === 0 || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {loading ? 'Analyzing...' : 'Run Comparative Analysis'}
          </button>
          
          {/* Results section */}
          {comparativeData && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Analysis Results</h3>
              
              {/* Display the report summaries */}
              {comparativeData.reports && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {comparativeData.reports.map((report: any, index: number) => (
                    <div
                      key={index}
                      className="border rounded p-3 bg-gray-50"
                    >
                      <h4 className="font-medium">NDC: {report.ndc_code}</h4>
                      {report.success ? (
                        <>
                          <div className="text-sm mt-2">
                            <div><strong>Events:</strong> {report.summary?.event_count || 'N/A'}</div>
                            <div><strong>Total Reactions:</strong> {report.summary?.total_reactions || 'N/A'}</div>
                          </div>
                          <button
                            onClick={() => window.open(`/api/cer/${report.ndc_code}/pdf`, '_blank')}
                            className="mt-2 text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            Download PDF
                          </button>
                        </>
                      ) : (
                        <div className="text-red-500 text-sm mt-2">
                          Error: {report.cer_report}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Comparative analysis visualization would go here */}
              {comparativeData.comparative_analysis && (
                <div className="border rounded p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">{comparativeData.comparative_analysis.title}</h4>
                  <p className="text-sm mb-3">{comparativeData.comparative_analysis.description}</p>
                  <div className="text-sm text-gray-600">
                    Visualization of comparative data requires Chart.js components.
                    Please reload the application after installing Chart.js.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}