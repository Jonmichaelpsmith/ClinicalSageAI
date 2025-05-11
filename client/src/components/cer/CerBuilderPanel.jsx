import React from 'react';

export default function CerBuilderPanel() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full overflow-auto">
      <h2 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">CER Builder</h2>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-md font-medium mb-2">Device Information</h3>
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Device Name" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <input 
              type="text" 
              placeholder="Manufacturer" 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-md">
          <h3 className="text-md font-medium mb-2">CER Sections</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <input type="checkbox" id="section1" className="mr-2" />
              <label htmlFor="section1" className="text-gray-700">Executive Summary</label>
            </li>
            <li className="flex items-center">
              <input type="checkbox" id="section2" className="mr-2" />
              <label htmlFor="section2" className="text-gray-700">Scope</label>
            </li>
            <li className="flex items-center">
              <input type="checkbox" id="section3" className="mr-2" />
              <label htmlFor="section3" className="text-gray-700">Device Description</label>
            </li>
            <li className="flex items-center">
              <input type="checkbox" id="section4" className="mr-2" />
              <label htmlFor="section4" className="text-gray-700">Clinical Evaluation Data</label>
            </li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Generate Preview
          </button>
        </div>
      </div>
    </div>
  );
}