import React, { useState, useEffect } from 'react';
import FDA510kService from '../../services/FDA510kService';

/**
 * Device Profile Form Component for 510(k) submissions
 * This component captures all device-specific metadata required for FDA 510(k) submission
 */
const DeviceProfileForm = ({ initialData = {}, onSave, onValidationError }) => {
  const [formData, setFormData] = useState({
    deviceName: '',
    modelNumber: '',
    version: '',
    manufacturer: '',
    productCode: '',
    deviceClass: '',
    intendedUse: '',
    indicationsForUse: '',
    technologyType: '',
    predicateDevice: '',
    substantialEquivalencePredicate: '',
    medicalSpecialty: '',
    diagnosticCodes: [],
    predicates: [],
    regulatoryHistory: [],
    technologicalCharacteristics: [],
    attachments: [],
    keywords: [],
    ...initialData
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle array inputs (diagnosticCodes, keywords)
  const handleArrayChange = (field, value) => {
    // Split comma-separated values into array
    const arrayValues = value.split(',').map(item => item.trim()).filter(Boolean);
    
    setFormData(prevData => ({
      ...prevData,
      [field]: arrayValues
    }));
  };
  
  // Handle predicate device changes
  const handlePredicateChange = (index, field, value) => {
    const updatedPredicates = [...formData.predicates];
    if (!updatedPredicates[index]) {
      updatedPredicates[index] = {};
    }
    updatedPredicates[index][field] = value;
    
    setFormData(prevData => ({
      ...prevData,
      predicates: updatedPredicates
    }));
  };
  
  // Add a new predicate device entry
  const addPredicate = () => {
    setFormData(prevData => ({
      ...prevData,
      predicates: [...prevData.predicates, { id: '', name: '', manufacturer: '', clearanceDate: '' }]
    }));
  };
  
  // Remove a predicate device entry
  const removePredicate = (index) => {
    const updatedPredicates = [...formData.predicates];
    updatedPredicates.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      predicates: updatedPredicates
    }));
  };
  
  // Handle regulatory history changes
  const handleRegulatoryHistoryChange = (index, field, value) => {
    const updatedHistory = [...formData.regulatoryHistory];
    if (!updatedHistory[index]) {
      updatedHistory[index] = {};
    }
    updatedHistory[index][field] = value;
    
    setFormData(prevData => ({
      ...prevData,
      regulatoryHistory: updatedHistory
    }));
  };
  
  // Add a new regulatory history entry
  const addRegulatoryHistory = () => {
    setFormData(prevData => ({
      ...prevData,
      regulatoryHistory: [...prevData.regulatoryHistory, { type: '', number: '', date: '', description: '' }]
    }));
  };
  
  // Remove a regulatory history entry
  const removeRegulatoryHistory = (index) => {
    const updatedHistory = [...formData.regulatoryHistory];
    updatedHistory.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      regulatoryHistory: updatedHistory
    }));
  };
  
  // Handle technological characteristics changes
  const handleCharacteristicChange = (index, field, value) => {
    const updatedCharacteristics = [...formData.technologicalCharacteristics];
    if (!updatedCharacteristics[index]) {
      updatedCharacteristics[index] = {};
    }
    updatedCharacteristics[index][field] = value;
    
    setFormData(prevData => ({
      ...prevData,
      technologicalCharacteristics: updatedCharacteristics
    }));
  };
  
  // Add a new technological characteristic entry
  const addCharacteristic = () => {
    setFormData(prevData => ({
      ...prevData,
      technologicalCharacteristics: [...prevData.technologicalCharacteristics, { name: '', description: '', value: '' }]
    }));
  };
  
  // Remove a technological characteristic entry
  const removeCharacteristic = (index) => {
    const updatedCharacteristics = [...formData.technologicalCharacteristics];
    updatedCharacteristics.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      technologicalCharacteristics: updatedCharacteristics
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data against schema
      const validationResult = await validateDeviceProfile(formData);
      
      if (!validationResult.isValid) {
        // Convert validation errors to field-specific error messages
        const errorMap = {};
        validationResult.errors.forEach(error => {
          errorMap[error.field] = error.message;
        });
        
        setFormErrors(errorMap);
        
        if (onValidationError) {
          onValidationError(validationResult.errors);
        }
      } else {
        // Clear any previous errors
        setFormErrors({});
        
        // Call the save callback with validated data
        if (onSave) {
          onSave(formData);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      setFormErrors({
        form: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">510(k) Device Profile</h2>
      
      {formErrors.form && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {formErrors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Device Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="deviceName"
                value={formData.deviceName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.deviceName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Device commercial name"
              />
              {formErrors.deviceName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.deviceName}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Number
                </label>
                <input
                  type="text"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Model number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Version"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.manufacturer ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Legal manufacturer name"
              />
              {formErrors.manufacturer && (
                <p className="mt-1 text-sm text-red-600">{formErrors.manufacturer}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Code
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="FDA product code"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Class <span className="text-red-500">*</span>
              </label>
              <select
                name="deviceClass"
                value={formData.deviceClass}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.deviceClass ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select device class</option>
                <option value="I">Class I</option>
                <option value="II">Class II</option>
                <option value="III">Class III</option>
              </select>
              {formErrors.deviceClass && (
                <p className="mt-1 text-sm text-red-600">{formErrors.deviceClass}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technology Type
              </label>
              <input
                type="text"
                name="technologyType"
                value={formData.technologyType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., Electronic, Mechanical, Software, etc."
              />
            </div>
          </div>
          
          {/* Intended Use Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Intended Use & Indications</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intended Use <span className="text-red-500">*</span>
              </label>
              <textarea
                name="intendedUse"
                value={formData.intendedUse}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.intendedUse ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="General purpose of the device"
              />
              {formErrors.intendedUse && (
                <p className="mt-1 text-sm text-red-600">{formErrors.intendedUse}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indications for Use
              </label>
              <textarea
                name="indicationsForUse"
                value={formData.indicationsForUse}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Specific conditions, purposes, or uses for which the device is intended"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Specialty
              </label>
              <input
                type="text"
                name="medicalSpecialty"
                value={formData.medicalSpecialty}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="E.g., Cardiology, Orthopedics, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnostic Codes
              </label>
              <input
                type="text"
                value={formData.diagnosticCodes.join(', ')}
                onChange={(e) => handleArrayChange('diagnosticCodes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Comma-separated diagnostic codes"
              />
              <p className="text-xs text-gray-500 mt-1">Enter diagnostic codes separated by commas</p>
            </div>
          </div>
        </div>
        
        {/* Predicate Device Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Predicate Device Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Predicate Device
              </label>
              <input
                type="text"
                name="predicateDevice"
                value={formData.predicateDevice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Primary predicate device name or ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Substantial Equivalence Predicate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="substantialEquivalencePredicate"
                value={formData.substantialEquivalencePredicate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.substantialEquivalencePredicate ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Substantial equivalence predicate device"
              />
              {formErrors.substantialEquivalencePredicate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.substantialEquivalencePredicate}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Additional Predicate Devices */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Additional Predicate Devices</h3>
            <button
              type="button"
              onClick={addPredicate}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Add Predicate
            </button>
          </div>
          
          {formData.predicates.length === 0 ? (
            <p className="text-gray-500 italic text-sm mb-2">No additional predicate devices added yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.predicates.map((predicate, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:space-x-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={predicate.id || ''}
                      onChange={(e) => handlePredicateChange(index, 'id', e.target.value)}
                      placeholder="510(k) Number"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={predicate.name || ''}
                      onChange={(e) => handlePredicateChange(index, 'name', e.target.value)}
                      placeholder="Device Name"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={predicate.manufacturer || ''}
                      onChange={(e) => handlePredicateChange(index, 'manufacturer', e.target.value)}
                      placeholder="Manufacturer"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="date"
                      value={predicate.clearanceDate || ''}
                      onChange={(e) => handlePredicateChange(index, 'clearanceDate', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removePredicate(index)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 bg-gray-50 hover:bg-gray-100"
                    >
                      <span className="sr-only">Remove</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Regulatory History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Regulatory History</h3>
            <button
              type="button"
              onClick={addRegulatoryHistory}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Add Entry
            </button>
          </div>
          
          {formData.regulatoryHistory.length === 0 ? (
            <p className="text-gray-500 italic text-sm mb-2">No regulatory history added yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.regulatoryHistory.map((history, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:space-x-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <select
                      value={history.type || ''}
                      onChange={(e) => handleRegulatoryHistoryChange(index, 'type', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select type</option>
                      <option value="510k">510(k)</option>
                      <option value="PMA">PMA</option>
                      <option value="DeNovo">De Novo</option>
                      <option value="IDE">IDE</option>
                    </select>
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={history.number || ''}
                      onChange={(e) => handleRegulatoryHistoryChange(index, 'number', e.target.value)}
                      placeholder="Submission Number"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="date"
                      value={history.date || ''}
                      onChange={(e) => handleRegulatoryHistoryChange(index, 'date', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={history.description || ''}
                      onChange={(e) => handleRegulatoryHistoryChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeRegulatoryHistory(index)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 bg-gray-50 hover:bg-gray-100"
                    >
                      <span className="sr-only">Remove</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Technological Characteristics */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Technological Characteristics</h3>
            <button
              type="button"
              onClick={addCharacteristic}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Add Characteristic
            </button>
          </div>
          
          {formData.technologicalCharacteristics.length === 0 ? (
            <p className="text-gray-500 italic text-sm mb-2">No technological characteristics added yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.technologicalCharacteristics.map((characteristic, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:space-x-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={characteristic.name || ''}
                      onChange={(e) => handleCharacteristicChange(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-2 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={characteristic.description || ''}
                      onChange={(e) => handleCharacteristicChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="flex-1 mb-2 sm:mb-0">
                    <input
                      type="text"
                      value={characteristic.value || ''}
                      onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                      placeholder="Value/Specification"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeCharacteristic(index)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-400 bg-gray-50 hover:bg-gray-100"
                    >
                      <span className="sr-only">Remove</span>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Keywords */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Keywords</h3>
          <div>
            <input
              type="text"
              value={formData.keywords.join(', ')}
              onChange={(e) => handleArrayChange('keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Comma-separated keywords"
            />
            <p className="text-xs text-gray-500 mt-1">Enter keywords separated by commas</p>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setFormData({
              deviceName: '',
              modelNumber: '',
              version: '',
              manufacturer: '',
              productCode: '',
              deviceClass: '',
              intendedUse: '',
              indicationsForUse: '',
              technologyType: '',
              predicateDevice: '',
              substantialEquivalencePredicate: '',
              medicalSpecialty: '',
              diagnosticCodes: [],
              predicates: [],
              regulatoryHistory: [],
              technologicalCharacteristics: [],
              attachments: [],
              keywords: []
            })}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Device Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeviceProfileForm;