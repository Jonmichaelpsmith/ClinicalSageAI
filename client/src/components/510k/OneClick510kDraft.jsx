import React from 'react';

/**
 * OneClick510kDraft Component
 * 
 * Renders a preview of a 510(k) submission document with proper FDA-compliant formatting.
 * This component implements strict formatting guidelines for FDA submissions.
 */
export default function OneClick510kDraft({
  deviceProfile = {},
  predicates = [],
  selectedSections = ['device_description', 'intended_use', 'substantial_equivalence', 'standards', 'performance_data', 'conclusion']
}) {
  const {
    deviceName = 'Sample Medical Device',
    manufacturer = 'Sample Manufacturer, Inc.',
    deviceType = 'Class II',
    modelNumber = 'MD-2025-X1',
    indications = 'For diagnostic use in clinical settings',
    contraindications = 'Not for use in MRI environments',
    deviceDescription = 'This device is designed for clinical diagnostic applications...'
  } = deviceProfile;

  // Format creation date according to FDA requirements
  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate FDA-compliant headings
  const renderHeading = (sectionNumber, title) => (
    <div className="border-b border-gray-300 mb-4 pb-1">
      <h2 className="text-lg font-bold text-gray-800">{sectionNumber}. {title}</h2>
    </div>
  );

  // Generate a table of contents
  const renderTableOfContents = () => {
    let toc = [];
    let sectionCount = 1;

    if (selectedSections.includes('device_description')) {
      toc.push({ number: sectionCount++, title: 'Device Description' });
    }
    
    if (selectedSections.includes('intended_use')) {
      toc.push({ number: sectionCount++, title: 'Indications for Use' });
    }
    
    if (selectedSections.includes('substantial_equivalence')) {
      toc.push({ number: sectionCount++, title: 'Substantial Equivalence Discussion' });
    }
    
    if (selectedSections.includes('standards')) {
      toc.push({ number: sectionCount++, title: 'Standards and Guidance Documents' });
    }
    
    if (selectedSections.includes('performance_data')) {
      toc.push({ number: sectionCount++, title: 'Performance Data' });
    }
    
    if (selectedSections.includes('conclusion')) {
      toc.push({ number: sectionCount++, title: 'Conclusion' });
    }

    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">Table of Contents</h2>
        <div className="border-t border-gray-300 pt-2">
          {toc.map(section => (
            <div key={section.number} className="mb-2 flex">
              <span className="font-medium w-8">{section.number}.</span>
              <span>{section.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render predicate comparison table
  const renderPredicateComparison = () => {
    const predicate = predicates[0] || {
      deviceName: 'Predicate Device XYZ',
      manufacturer: 'ABC Medical, Inc.',
      k510Number: 'K123456',
      approvalDate: '2024-01-15'
    };

    return (
      <div className="border border-gray-300 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b border-r border-gray-300 text-left">Feature</th>
              <th className="p-2 border-b border-r border-gray-300 text-left">Subject Device: {deviceName}</th>
              <th className="p-2 border-b border-gray-300 text-left">Predicate: {predicate.deviceName}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b border-r border-gray-300 bg-gray-50 font-medium">Device Type</td>
              <td className="p-2 border-b border-r border-gray-300">{deviceType}</td>
              <td className="p-2 border-b border-gray-300">Similar {deviceType} device</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-r border-gray-300 bg-gray-50 font-medium">Manufacturer</td>
              <td className="p-2 border-b border-r border-gray-300">{manufacturer}</td>
              <td className="p-2 border-b border-gray-300">{predicate.manufacturer}</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-r border-gray-300 bg-gray-50 font-medium">Indications for Use</td>
              <td className="p-2 border-b border-r border-gray-300">{indications}</td>
              <td className="p-2 border-b border-gray-300">Similar clinical diagnostic applications</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-r border-gray-300 bg-gray-50 font-medium">Technology</td>
              <td className="p-2 border-b border-r border-gray-300">Advanced sensor technology with digital output</td>
              <td className="p-2 border-b border-gray-300">Similar sensor technology with comparable output</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-r border-gray-300 bg-gray-50 font-medium">Materials</td>
              <td className="p-2 border-b border-r border-gray-300">Medical-grade polymer with biocompatible coating</td>
              <td className="p-2 border-b border-gray-300">Similar medical-grade materials</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-gray-300 bg-gray-50 font-medium">Performance</td>
              <td className="p-2 border-r border-gray-300">Meets or exceeds all relevant standards</td>
              <td className="p-2">Meets relevant standards</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render standards table
  const renderStandardsTable = () => {
    return (
      <div className="border border-gray-300 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b border-r border-gray-300 text-left">Standard</th>
              <th className="p-2 border-b border-r border-gray-300 text-left">Title</th>
              <th className="p-2 border-b border-gray-300 text-left">Compliance Method</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b border-r border-gray-300">ISO 13485:2016</td>
              <td className="p-2 border-b border-r border-gray-300">Medical devices — Quality management systems — Requirements for regulatory purposes</td>
              <td className="p-2 border-b border-gray-300">Certification by Notified Body</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-r border-gray-300">ISO 14971:2019</td>
              <td className="p-2 border-b border-r border-gray-300">Medical devices — Application of risk management to medical devices</td>
              <td className="p-2 border-b border-gray-300">Internal validation</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-r border-gray-300">IEC 60601-1</td>
              <td className="p-2 border-b border-r border-gray-300">Medical electrical equipment — Part 1: General requirements for basic safety and essential performance</td>
              <td className="p-2 border-b border-gray-300">Third-party testing</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-gray-300">ISO 10993-1:2018</td>
              <td className="p-2 border-r border-gray-300">Biological evaluation of medical devices — Part 1: Evaluation and testing within a risk management process</td>
              <td className="p-2">Biocompatibility testing</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render performance data summary
  const renderPerformanceData = () => {
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 border border-gray-300 rounded-md">
          <h4 className="font-medium mb-2">Bench Testing Results</h4>
          <p className="text-sm">All bench testing was conducted according to FDA-recognized standards and internal protocols. The subject device met or exceeded all performance criteria established in the test protocols.</p>
        </div>
        
        <div className="bg-gray-50 p-3 border border-gray-300 rounded-md">
          <h4 className="font-medium mb-2">Biocompatibility Testing</h4>
          <p className="text-sm">Biocompatibility testing was conducted in accordance with ISO 10993 standards. All materials demonstrated appropriate biocompatibility for the intended use of the device.</p>
        </div>
        
        <div className="bg-gray-50 p-3 border border-gray-300 rounded-md">
          <h4 className="font-medium mb-2">Software Verification and Validation</h4>
          <p className="text-sm">Software verification and validation testing was conducted according to FDA's guidance for the premarket submissions for software contained in medical devices. All software requirements were verified and validated.</p>
        </div>
      </div>
    );
  };

  // Track section numbers
  let sectionCount = 1;

  return (
    <div className="text-gray-900 font-sans">
      {/* Document header with FDA-compliant formatting */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold mb-1">PREMARKET NOTIFICATION [510(k)]</h1>
        <h2 className="text-lg font-semibold mb-3">{deviceName}</h2>
        <p className="mb-1">Submitted by:</p>
        <p className="font-medium mb-1">{manufacturer}</p>
        <p className="mb-4">{getFormattedDate()}</p>
        <p className="text-sm border-t border-b border-gray-300 py-1 italic">CONFIDENTIAL - Contains Proprietary Information</p>
      </div>

      {/* Table of Contents */}
      {renderTableOfContents()}

      {/* Device Description */}
      {selectedSections.includes('device_description') && (
        <div className="mb-8">
          {renderHeading(sectionCount++, 'Device Description')}
          <p className="mb-3">{deviceName} (Model: {modelNumber}) is a {deviceType} medical device manufactured by {manufacturer}.</p>
          <p className="mb-3">{deviceDescription}</p>
          <div className="bg-gray-50 p-3 border border-gray-300 rounded-md mt-4">
            <h4 className="font-medium mb-1">Device Characteristics:</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Model Number: {modelNumber}</li>
              <li>Classification: {deviceType}</li>
              <li>Sterility: Non-sterile</li>
              <li>Dimensions: [Dimensions would be listed here]</li>
              <li>Materials: Medical-grade polymer with biocompatible coating</li>
            </ul>
          </div>
        </div>
      )}

      {/* Indications for Use */}
      {selectedSections.includes('intended_use') && (
        <div className="mb-8">
          {renderHeading(sectionCount++, 'Indications for Use')}
          <div className="border border-gray-300 p-4 mb-4">
            <h4 className="font-medium mb-2">Indications for Use Statement:</h4>
            <p>{indications}</p>
          </div>
          
          <h4 className="font-medium mt-4 mb-2">Contraindications:</h4>
          <p>{contraindications}</p>
        </div>
      )}

      {/* Substantial Equivalence */}
      {selectedSections.includes('substantial_equivalence') && (
        <div className="mb-8">
          {renderHeading(sectionCount++, 'Substantial Equivalence Discussion')}
          <p className="mb-4">
            The {deviceName} is substantially equivalent to the predicate device{predicates.length > 0 ? ` ${predicates[0].deviceName} (${predicates[0].k510Number})` : ''} in terms of intended use, technological characteristics, and performance capabilities.
          </p>
          
          <h4 className="font-medium mb-2">Comparison to Predicate Device:</h4>
          {renderPredicateComparison()}
          
          <p className="mt-3">
            Any differences between the subject device and the predicate device do not raise new questions of safety and effectiveness. The comparison demonstrates that the {deviceName} is substantially equivalent to the legally marketed predicate device.
          </p>
        </div>
      )}

      {/* Standards */}
      {selectedSections.includes('standards') && (
        <div className="mb-8">
          {renderHeading(sectionCount++, 'Standards and Guidance Documents')}
          <p className="mb-4">
            The development, testing, and manufacturing of the {deviceName} comply with the following FDA-recognized consensus standards and guidance documents:
          </p>
          
          {renderStandardsTable()}
        </div>
      )}

      {/* Performance Data */}
      {selectedSections.includes('performance_data') && (
        <div className="mb-8">
          {renderHeading(sectionCount++, 'Performance Data')}
          <p className="mb-4">
            The following performance data were provided in support of the substantial equivalence determination:
          </p>
          
          {renderPerformanceData()}
        </div>
      )}

      {/* Conclusion */}
      {selectedSections.includes('conclusion') && (
        <div className="mb-8">
          {renderHeading(sectionCount++, 'Conclusion')}
          <p className="mb-3">
            Based on the information provided in this premarket notification, the {deviceName} is substantially equivalent to the predicate device{predicates.length > 0 ? ` ${predicates[0].deviceName} (${predicates[0].k510Number})` : ''}.
          </p>
          <p className="mb-3">
            The subject device has the same intended use and similar technological characteristics as the predicate device. The differences between the subject device and the predicate device do not raise new questions of safety and effectiveness.
          </p>
          <p className="font-medium">
            Therefore, the {deviceName} is substantially equivalent to the legally marketed predicate device.
          </p>
        </div>
      )}

      {/* Document footer */}
      <div className="text-center border-t border-gray-300 pt-4 mt-8">
        <p className="text-sm">END OF 510(k) SUBMISSION</p>
        <p className="text-xs mt-1">© {new Date().getFullYear()} {manufacturer}. All rights reserved.</p>
      </div>
    </div>
  );
}