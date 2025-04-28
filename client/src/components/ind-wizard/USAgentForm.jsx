// /client/src/components/ind-wizard/USAgentForm.jsx

import { useState } from 'react';
import { Building, CheckCircle, AlertCircle, HelpCircle, Save } from 'lucide-react';

export default function USAgentForm({ setFormStatus }) {
  const [formData, setFormData] = useState({
    agentName: '',
    agentCompany: '',
    agentAddress: '',
    agentCity: '',
    agentState: '',
    agentZip: '',
    agentPhone: '',
    agentEmail: '',
    agentFax: ''
  });

  const [showGuidance, setShowGuidance] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Check if form is complete
  const isFormComplete = () => {
    return formData.agentName && 
           formData.agentCompany && 
           formData.agentAddress && 
           formData.agentCity && 
           formData.agentState && 
           formData.agentZip && 
           formData.agentPhone && 
           formData.agentEmail;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFormComplete()) {
      // In a real app, submit to server here
      setFormSubmitted(true);
      setFormStatus(prev => ({ ...prev, usAgentInfo: true }));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Building className="mr-2 h-5 w-5 text-indigo-600" />
            U.S. Agent Information
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Required for non-U.S. sponsors submitting INDs to the FDA
          </p>
        </div>
        
        <button 
          onClick={() => setShowGuidance(!showGuidance)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Guidance
        </button>
      </div>
      
      {showGuidance && (
        <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">U.S. Agent Requirements</h3>
          <p className="mb-2">
            Under 21 CFR 312.23(a)(1)(iv), foreign sponsors must identify a U.S. agent in their IND application. The U.S. agent:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acts as the sponsor's representative with the FDA</li>
            <li>Facilitates communication between the FDA and the sponsor</li>
            <li>Is responsible for providing FDA with information upon request</li>
            <li>Must be located in the United States</li>
          </ul>
          <p className="mt-3">
            The U.S. agent is not legally responsible for the content of the IND, but serves as a point of contact for FDA communications.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name*
            </label>
            <input
              type="text"
              id="agentName"
              name="agentName"
              value={formData.agentName}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Full name of U.S. agent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="agentCompany" className="block text-sm font-medium text-gray-700 mb-1">
              Company/Organization*
            </label>
            <input
              type="text"
              id="agentCompany"
              name="agentCompany"
              value={formData.agentCompany}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Company or organization name"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="agentAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address*
            </label>
            <input
              type="text"
              id="agentAddress"
              name="agentAddress"
              value={formData.agentAddress}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Street address"
              required
            />
          </div>
          
          <div>
            <label htmlFor="agentCity" className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              type="text"
              id="agentCity"
              name="agentCity"
              value={formData.agentCity}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="City"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="agentState" className="block text-sm font-medium text-gray-700 mb-1">
                State*
              </label>
              <input
                type="text"
                id="agentState"
                name="agentState"
                value={formData.agentState}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="State"
                required
              />
            </div>
            <div>
              <label htmlFor="agentZip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code*
              </label>
              <input
                type="text"
                id="agentZip"
                name="agentZip"
                value={formData.agentZip}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="ZIP code"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="agentPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              id="agentPhone"
              name="agentPhone"
              value={formData.agentPhone}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="(xxx) xxx-xxxx"
              required
            />
          </div>
          
          <div>
            <label htmlFor="agentEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              id="agentEmail"
              name="agentEmail"
              value={formData.agentEmail}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="agentFax" className="block text-sm font-medium text-gray-700 mb-1">
              Fax Number (optional)
            </label>
            <input
              type="tel"
              id="agentFax"
              name="agentFax"
              value={formData.agentFax}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="(xxx) xxx-xxxx"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormComplete() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'
            }`}
            disabled={!isFormComplete()}
          >
            <Save className="mr-2 h-4 w-4" />
            Save U.S. Agent Information
          </button>
        </div>
      </form>
      
      <div className="mt-4">
        {formSubmitted ? (
          <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-md">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>U.S. Agent information has been saved successfully</span>
          </div>
        ) : (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">U.S. Agent information is required for non-U.S. sponsors (21 CFR 312.23(a)(1)(iv))</span>
          </div>
        )}
      </div>
    </div>
  );
}