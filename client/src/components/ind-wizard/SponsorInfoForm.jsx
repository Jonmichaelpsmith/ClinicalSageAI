// /client/src/components/ind-wizard/SponsorInfoForm.jsx

import { useState } from 'react';
import { Building, CheckCircle, AlertCircle, HelpCircle, Save, RefreshCw } from 'lucide-react';

export default function SponsorInfoForm({ setFormStatus }) {
  const [formData, setFormData] = useState({
    sponsorName: '',
    contactPerson: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
    email: '',
    isNonUSCompany: false
  });

  const [showGuidance, setShowGuidance] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form is complete
  const isFormComplete = () => {
    return formData.sponsorName && 
           formData.contactPerson && 
           formData.address && 
           formData.city && 
           formData.state && 
           formData.zip && 
           formData.country && 
           formData.phone && 
           formData.email;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If user toggles non-US company, update the form status
    if (name === 'isNonUSCompany') {
      setFormStatus(prev => ({ ...prev, usAgentRequired: checked }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFormComplete()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        // In a real app, submit to server here
        setFormSubmitted(true);
        setFormStatus(prev => ({ ...prev, sponsorInfo: true }));
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Building className="mr-2 h-5 w-5 text-blue-600" />
            Sponsor Information
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Information about the sponsor organization and primary contact
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
          <h3 className="font-medium text-blue-800 mb-2">Sponsor Information Requirements</h3>
          <p className="mb-2">
            According to 21 CFR 312.23(a)(1), the sponsor must provide complete contact information including:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name and address of the sponsor</li>
            <li>Name and title of the person responsible for monitoring the IND</li>
            <li>Name and title of the person responsible for the review and evaluation of safety information</li>
          </ul>
          <p className="mt-3">
            <strong>Note:</strong> If the sponsor is not located in the United States, a U.S. agent must be designated per 21 CFR 312.23(a)(1)(iv). The U.S. agent's contact information must be provided in the "U.S. Agent Information" section.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="sponsorName" className="block text-sm font-medium text-gray-700 mb-1">
              Sponsor Name/Organization*
            </label>
            <input
              type="text"
              id="sponsorName"
              name="sponsorName"
              value={formData.sponsorName}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Legal name of sponsoring company or organization"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person*
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Full name and title of primary contact"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Street address"
              required
            />
          </div>
          
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="City"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province*
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="State/Province"
                required
              />
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code*
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="ZIP/Postal code"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country*
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="China">China</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="(xxx) xxx-xxxx"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isNonUSCompany"
                  name="isNonUSCompany"
                  type="checkbox"
                  checked={formData.isNonUSCompany}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="isNonUSCompany" className="font-medium text-gray-700">
                  This sponsor is located outside the United States
                </label>
                <p className="text-gray-500">
                  If checked, you will be required to provide U.S. Agent information in the next section
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isFormComplete() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
            }`}
            disabled={!isFormComplete() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Sponsor Information
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4">
        {formSubmitted ? (
          <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-md">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Sponsor information has been saved successfully</span>
          </div>
        ) : (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Sponsor information is required for IND submission (21 CFR 312.23(a)(1))</span>
          </div>
        )}
      </div>
    </div>
  );
}