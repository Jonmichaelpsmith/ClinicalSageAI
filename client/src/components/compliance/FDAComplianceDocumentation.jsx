import React, { useState } from 'react';

const FDAComplianceDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  // Documentation sections
  const sections = [
    { id: 'overview', name: 'Overview' },
    { id: 'part11', name: '21 CFR Part 11' },
    { id: 'electronic-signatures', name: 'Electronic Signatures' },
    { id: 'audit-trails', name: 'Audit Trails' },
    { id: 'blockchain', name: 'Blockchain Security' },
    { id: 'validation', name: 'System Validation' },
    { id: 'data-integrity', name: 'Data Integrity' },
    { id: 'certification', name: 'Certification Process' }
  ];

  // Section content
  const sectionContent = {
    overview: {
      title: 'FDA 21 CFR Part 11 Compliance Overview',
      content: (
        <>
          <p className="mb-4">
            TrialSage™ has been designed to comply with FDA 21 CFR Part 11 regulations, which define the criteria under which electronic records and electronic signatures are considered to be trustworthy, reliable, and equivalent to paper records.
          </p>
          <p className="mb-4">
            Our compliance framework implements comprehensive controls for electronic records and signatures, including:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Secure, computer-generated, time-stamped audit trails</li>
            <li>System validations to ensure accuracy, reliability, and consistent intended performance</li>
            <li>Ability to generate accurate and complete copies of records</li>
            <li>Protection of records to enable their accurate and ready retrieval throughout the records retention period</li>
            <li>Enhanced blockchain-based security for tamper-evident record keeping</li>
            <li>Secure, computer-generated, time-stamped audit trails</li>
            <li>Limited system access to authorized individuals</li>
            <li>Use of secure, validated electronic signatures with verification components</li>
          </ul>
          <p>
            This documentation provides detailed information about how TrialSage™ implements each requirement of 21 CFR Part 11 and how to maintain compliance through proper system usage.
          </p>
        </>
      )
    },
    'part11': {
      title: '21 CFR Part 11 Regulations',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">Key Requirements</h3>
          <p className="mb-4">
            21 CFR Part 11 establishes the United States Food and Drug Administration (FDA) regulations on electronic records and electronic signatures. The regulation defines the criteria under which electronic records and electronic signatures are considered trustworthy, reliable, and equivalent to paper records.
          </p>
          <p className="mb-4">
            The regulation is divided into three main sections:
          </p>

          <div className="mb-4">
            <h4 className="font-medium">Subpart A - General Provisions</h4>
            <ul className="list-disc ml-6">
              <li>Scope and applicability of the regulation</li>
              <li>Implementation approach</li>
              <li>Definitions of key terms</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Subpart B - Electronic Records</h4>
            <ul className="list-disc ml-6">
              <li>Controls for closed systems</li>
              <li>Controls for open systems</li>
              <li>Signature manifestations</li>
              <li>Signature/record linking</li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Subpart C - Electronic Signatures</h4>
            <ul className="list-disc ml-6">
              <li>General requirements</li>
              <li>Electronic signature components and controls</li>
              <li>Controls for identification codes/passwords</li>
            </ul>
          </div>

          <p>
            TrialSage™ has implemented comprehensive controls to meet or exceed all requirements in 21 CFR Part 11, with particular focus on enhanced security using blockchain technology for tamper-evident records and signatures.
          </p>
        </>
      )
    },
    'electronic-signatures': {
      title: 'Electronic Signatures',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">Electronic Signature Implementation</h3>
          <p className="mb-4">
            TrialSage™ implements electronic signatures that comply with 21 CFR Part 11 Subpart C requirements:
          </p>

          <div className="mb-4 border-l-4 border-pink-500 pl-4 py-2">
            <h4 className="font-medium">Unique User Identification</h4>
            <p>Each electronic signature is based on a unique user identification that cannot be reused or reassigned to another individual.</p>
          </div>

          <div className="mb-4 border-l-4 border-pink-500 pl-4 py-2">
            <h4 className="font-medium">Verification Components</h4>
            <p>Electronic signatures require two distinct identification components: user ID and password.</p>
          </div>

          <div className="mb-4 border-l-4 border-pink-500 pl-4 py-2">
            <h4 className="font-medium">Signature Meaning</h4>
            <p>Users are required to specify the meaning associated with their signature (e.g., approval, review, authorship).</p>
          </div>

          <div className="mb-4 border-l-4 border-pink-500 pl-4 py-2">
            <h4 className="font-medium">Signature Manifestation</h4>
            <p>All signed electronic records display the printed name of the signer, date and time of signing, and meaning of the signature.</p>
          </div>

          <div className="mb-4 border-l-4 border-pink-500 pl-4 py-2">
            <h4 className="font-medium">Signature/Record Linking</h4>
            <p>Electronic signatures are cryptographically linked to their respective electronic records to prevent falsification.</p>
          </div>

          <div className="mb-4 border-l-4 border-pink-500 pl-4 py-2">
            <h4 className="font-medium">Blockchain Verification</h4>
            <p>All electronic signatures are recorded on a permissioned blockchain for enhanced security and tamper-evidence, exceeding standard compliance requirements.</p>
          </div>

          <p>
            The system provides comprehensive signature history for each document, with verification capabilities to ensure signature integrity throughout the document lifecycle.
          </p>
        </>
      )
    },
    'audit-trails': {
      title: 'Audit Trails',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">Secure Audit Trail System</h3>
          <p className="mb-4">
            TrialSage™ implements a comprehensive audit trail system that securely and automatically records all user actions that create, modify, or delete electronic records:
          </p>

          <div className="mb-4">
            <h4 className="font-medium">Key Audit Trail Features:</h4>
            <ul className="list-disc ml-6 space-y-2 mt-2">
              <li>
                <strong>Automatic Generation:</strong> Audit trails are automatically generated when users create, modify, or delete electronic records
              </li>
              <li>
                <strong>Comprehensive Details:</strong> Each audit record includes:
                <ul className="list-circle ml-6 mt-1">
                  <li>User ID of the person performing the action</li>
                  <li>Date and time of the action</li>
                  <li>Type of action performed</li>
                  <li>Identification of the affected record</li>
                  <li>Reason for the action (when applicable)</li>
                </ul>
              </li>
              <li>
                <strong>Tamper Protection:</strong> Audit trails are secured with cryptographic hashing to detect any tampering attempts
              </li>
              <li>
                <strong>Blockchain Backup:</strong> All audit records are backed up to a permissioned blockchain for enhanced security and verifiability
              </li>
              <li>
                <strong>Retention:</strong> Audit trails are retained for at least as long as their corresponding electronic records
              </li>
              <li>
                <strong>Availability:</strong> Audit trails are available for FDA inspection and can be exported in human-readable form
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-800">Enhanced Security Implementation</h4>
            <p className="text-blue-700">
              TrialSage™ exceeds standard compliance requirements by implementing blockchain-backed audit trails, providing immutable, tamper-evident record keeping with cryptographic verification capabilities.
            </p>
          </div>

          <p>
            The audit trail system is regularly validated to ensure it correctly and consistently records all relevant user actions and maintains the integrity of the audit data.
          </p>
        </>
      )
    },
    'blockchain': {
      title: 'Blockchain Security',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">Enhanced Blockchain Security</h3>
          <p className="mb-4">
            TrialSage™ implements an innovative blockchain-based security layer that enhances FDA 21 CFR Part 11 compliance by providing tamper-evident electronic records and signatures:
          </p>

          <div className="mb-4">
            <h4 className="font-medium">How Blockchain Enhances Compliance:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-pink-800">Tamper-Evident Records</h5>
                <p>Cryptographic hashes of electronic records are stored on a permissioned blockchain, providing tamper evidence that exceeds traditional database security.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-pink-800">Signature Verification</h5>
                <p>Electronic signatures are linked to blockchain transactions, creating a cryptographically secured verification mechanism.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-pink-800">Immutable Audit Trails</h5>
                <p>Audit records are backed up to blockchain, creating an immutable history that cannot be altered or deleted.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-pink-800">Independent Verification</h5>
                <p>The blockchain implementation provides an independent verification mechanism that can be audited separate from the primary system.</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Blockchain Implementation Details:</h4>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>Uses a permissioned blockchain network for enterprise-grade security and privacy</li>
              <li>Implements SHA-256 cryptographic hashing for document integrity verification</li>
              <li>Stores transaction records for all electronic signatures and critical document operations</li>
              <li>Provides a verification interface for auditing blockchain records against current document state</li>
              <li>Automatically exports audit trails to blockchain on a configurable schedule</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-green-800">Exceeds Regulatory Requirements</h4>
            <p className="text-green-700">
              The blockchain implementation in TrialSage™ exceeds standard FDA 21 CFR Part 11 requirements by providing an enhanced security layer that ensures electronic records and signatures cannot be modified without detection.
            </p>
          </div>

          <p>
            This innovative approach to regulatory compliance places TrialSage™ at the forefront of secure, compliant clinical and regulatory document management.
          </p>
        </>
      )
    },
    'validation': {
      title: 'System Validation',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">Validation Framework</h3>
          <p className="mb-4">
            TrialSage™ includes a comprehensive validation framework to ensure the system consistently operates as intended and produces accurate, reliable records:
          </p>

          <div className="mb-4">
            <h4 className="font-medium">Validation Approach:</h4>
            <ol className="list-decimal ml-6 space-y-2 mt-2">
              <li>
                <strong>Validation Planning:</strong> Detailed validation plans that define testing scope, methodology, and acceptance criteria
              </li>
              <li>
                <strong>Requirements Documentation:</strong> Comprehensive documentation of functional and regulatory requirements
              </li>
              <li>
                <strong>Design Specifications:</strong> Detailed design specifications that describe how the system meets requirements
              </li>
              <li>
                <strong>Test Protocols:</strong> Documented test protocols covering all critical system functions
              </li>
              <li>
                <strong>Test Execution:</strong> Execution of test protocols with documented results
              </li>
              <li>
                <strong>Validation Reports:</strong> Comprehensive validation reports summarizing test results and compliance status
              </li>
              <li>
                <strong>Change Control:</strong> Formal change control procedures for system modifications
              </li>
            </ol>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Validation Components:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium">Operational Qualification</h5>
                <p className="text-sm">Validates that the system operates according to specifications</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium">Performance Qualification</h5>
                <p className="text-sm">Validates that the system performs as intended in the production environment</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium">Electronic Records Validation</h5>
                <p className="text-sm">Validates that electronic records meet all 21 CFR Part 11 requirements</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium">Electronic Signatures Validation</h5>
                <p className="text-sm">Validates that electronic signatures meet all 21 CFR Part 11 requirements</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium">Audit Trail Validation</h5>
                <p className="text-sm">Validates that audit trails correctly capture all required information</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium">Blockchain Validation</h5>
                <p className="text-sm">Validates the integrity and security of the blockchain implementation</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-yellow-800">Continuous Validation</h4>
            <p className="text-yellow-700">
              TrialSage™ implements continuous validation processes that automatically verify system integrity and compliance status, providing real-time insights into system validation status.
            </p>
          </div>

          <p>
            All validation documentation is maintained within the system and can be provided during regulatory inspections or audits.
          </p>
        </>
      )
    },
    'data-integrity': {
      title: 'Data Integrity',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">Data Integrity Controls</h3>
          <p className="mb-4">
            TrialSage™ implements comprehensive data integrity controls to ensure electronic records remain accurate, complete, and trustworthy throughout their lifecycle:
          </p>

          <div className="mb-4">
            <h4 className="font-medium">Key Data Integrity Features:</h4>
            <ul className="list-disc ml-6 space-y-2 mt-2">
              <li>
                <strong>Input Validation:</strong> Validates data during entry to prevent errors
              </li>
              <li>
                <strong>Data Accuracy:</strong> Ensures original data is accurately retained without alteration
              </li>
              <li>
                <strong>Data Completeness:</strong> Ensures all required data elements are present and valid
              </li>
              <li>
                <strong>Data Consistency:</strong> Maintains data consistency across the system
              </li>
              <li>
                <strong>Data Availability:</strong> Ensures records can be retrieved throughout their retention period
              </li>
              <li>
                <strong>Cryptographic Protection:</strong> Implements SHA-256 hashing for all records
              </li>
              <li>
                <strong>Blockchain Verification:</strong> Provides blockchain-based verification of record integrity
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Data Integrity Principles (ALCOA+):</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Attributable</h5>
                <p className="text-sm">All data can be attributed to the individual who created or modified it</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Legible</h5>
                <p className="text-sm">Data is readable and permanently recorded for future reference</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Contemporaneous</h5>
                <p className="text-sm">Data is recorded at the time the activity is performed</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Original</h5>
                <p className="text-sm">Original records are preserved or certified true copies maintained</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Accurate</h5>
                <p className="text-sm">Data is correct, truthful, and free from error</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Complete</h5>
                <p className="text-sm">Data includes all required elements and context</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Consistent</h5>
                <p className="text-sm">Data is recorded in a consistent manner</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Enduring</h5>
                <p className="text-sm">Data is preserved for the required retention period</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-medium text-pink-700">Available</h5>
                <p className="text-sm">Data is accessible throughout its lifecycle</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-purple-800">Enhanced Integrity Controls</h4>
            <p className="text-purple-700">
              TrialSage™ implements enhanced data integrity controls through blockchain verification, providing a cryptographically secure mechanism to detect any unauthorized changes to electronic records.
            </p>
          </div>

          <p>
            The data integrity controls in TrialSage™ ensure that electronic records remain trustworthy and reliable throughout their lifecycle, meeting and exceeding FDA 21 CFR Part 11 requirements.
          </p>
        </>
      )
    },
    'certification': {
      title: 'Certification Process',
      content: (
        <>
          <h3 className="text-lg font-semibold mb-2">FDA Compliance Certification</h3>
          <p className="mb-4">
            The process of certifying TrialSage™ for FDA 21 CFR Part 11 compliance involves comprehensive validation, documentation, and ongoing maintenance:
          </p>

          <div className="mb-4">
            <h4 className="font-medium">Certification Steps:</h4>
            <ol className="list-decimal ml-6 space-y-2 mt-2">
              <li>
                <strong>System Assessment:</strong> Comprehensive assessment of the system against all 21 CFR Part 11 requirements
              </li>
              <li>
                <strong>Gap Analysis:</strong> Identification of any compliance gaps or areas for improvement
              </li>
              <li>
                <strong>Remediation:</strong> Implementation of required changes to address any identified gaps
              </li>
              <li>
                <strong>Validation:</strong> Formal validation of the system according to a documented validation plan
              </li>
              <li>
                <strong>Documentation:</strong> Creation of comprehensive compliance documentation
              </li>
              <li>
                <strong>Certification:</strong> Internal certification of the system for 21 CFR Part 11 compliance
              </li>
              <li>
                <strong>Ongoing Monitoring:</strong> Continuous monitoring and periodic re-validation
              </li>
            </ol>
          </div>

          <div className="mb-4">
            <h4 className="font-medium">Key Certification Documentation:</h4>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>FDA 21 CFR Part 11 Compliance Assessment Report</li>
              <li>System Validation Plan and Report</li>
              <li>Electronic Records Compliance Documentation</li>
              <li>Electronic Signatures Compliance Documentation</li>
              <li>Audit Trail System Documentation</li>
              <li>Blockchain Verification System Documentation</li>
              <li>System Security and Access Control Documentation</li>
              <li>Standard Operating Procedures for System Use</li>
              <li>Training Records for System Users</li>
            </ul>
          </div>

          <div className="bg-pink-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-pink-800">Certification Readiness</h4>
            <p className="text-pink-700">
              TrialSage™ has been designed and implemented with FDA 21 CFR Part 11 compliance as a core requirement. The system is ready for formal certification and regulatory inspection.
            </p>
          </div>

          <p>
            While the FDA does not directly certify systems for 21 CFR Part 11 compliance, TrialSage™ has undergone rigorous internal validation to ensure it meets or exceeds all regulatory requirements, with enhanced blockchain security providing additional integrity controls beyond standard compliance.
          </p>
        </>
      )
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">FDA Compliance Documentation</h2>
      
      <div className="flex flex-wrap mb-6 gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeSection === section.id
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.name}
          </button>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {sectionContent[activeSection].title}
        </h3>
        <div className="prose max-w-none">
          {sectionContent[activeSection].content}
        </div>
      </div>
    </div>
  );
};

export default FDAComplianceDocumentation;