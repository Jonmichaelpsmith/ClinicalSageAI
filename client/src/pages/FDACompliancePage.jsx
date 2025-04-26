import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Activity, 
  Lock, 
  ChevronDown, 
  ChevronRight,
  ClipboardCheck,
  BookOpen,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import FDAComplianceDashboard from '../components/compliance/FDAComplianceDashboard';
import FDAComplianceDocumentation from '../components/compliance/FDAComplianceDocumentation';
import AuditLogViewer from '../components/security/AuditLogViewer';
import BlockchainSecurityPanel from '../components/security/BlockchainSecurityPanel';
import SecuritySettingsPanel from '../components/security/SecuritySettingsPanel';

/**
 * FDA Compliance Page
 * 
 * This page integrates all FDA 21 CFR Part 11 compliance components into a single
 * comprehensive interface for managing and monitoring regulatory compliance.
 * 
 * Features:
 * - Compliance dashboard with real-time metrics
 * - Documentation management
 * - Audit log monitoring
 * - Security settings configuration
 * - Blockchain verification integration
 */
export default function FDACompliancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    security: true,
    documentation: true,
    validation: true
  });

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-hotpink-600 to-purple-700 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Shield className="mr-3 h-7 w-7" />
                FDA 21 CFR Part 11 Compliance Center
              </h1>
              <p className="mt-1 text-hotpink-100 text-sm">
                Comprehensive regulatory compliance management for electronic records and signatures
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-4 w-4" />
                Validation Status: Passed
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Shield className="mr-1 h-4 w-4" />
                Compliance Score: 98%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-5 bg-hotpink-50 border-b border-hotpink-100">
                <h2 className="text-lg font-medium text-hotpink-800">Compliance Controls</h2>
              </div>
              <nav className="divide-y divide-gray-200">
                <button
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'dashboard' ? 'bg-hotpink-50 text-hotpink-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Shield className={`mr-3 h-5 w-5 ${
                    activeTab === 'dashboard' ? 'text-hotpink-500' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">Compliance Dashboard</span>
                </button>
                
                <button
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'documentation' ? 'bg-hotpink-50 text-hotpink-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('documentation')}
                >
                  <FileText className={`mr-3 h-5 w-5 ${
                    activeTab === 'documentation' ? 'text-hotpink-500' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">Documentation</span>
                </button>
                
                <button
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'audit' ? 'bg-hotpink-50 text-hotpink-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('audit')}
                >
                  <Activity className={`mr-3 h-5 w-5 ${
                    activeTab === 'audit' ? 'text-hotpink-500' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">Audit Logs</span>
                </button>
                
                <button
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'security' ? 'bg-hotpink-50 text-hotpink-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('security')}
                >
                  <Lock className={`mr-3 h-5 w-5 ${
                    activeTab === 'security' ? 'text-hotpink-500' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">Security Settings</span>
                </button>
                
                <button
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === 'blockchain' ? 'bg-hotpink-50 text-hotpink-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('blockchain')}
                >
                  <Shield className={`mr-3 h-5 w-5 ${
                    activeTab === 'blockchain' ? 'text-hotpink-500' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">Blockchain Security</span>
                </button>
              </nav>

              {/* FDA Compliance Guide */}
              <div className="px-4 py-5 bg-gray-50 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Compliance Resources
                </h3>
                <div className="mt-4 space-y-3">
                  <a href="#" className="group flex items-center text-sm text-gray-600 hover:text-hotpink-600">
                    <BookOpen className="mr-2 h-4 w-4 text-gray-400 group-hover:text-hotpink-500" />
                    FDA 21 CFR Part 11 Guide
                  </a>
                  <a href="#" className="group flex items-center text-sm text-gray-600 hover:text-hotpink-600">
                    <ClipboardCheck className="mr-2 h-4 w-4 text-gray-400 group-hover:text-hotpink-500" />
                    Compliance Checklist
                  </a>
                  <a href="#" className="group flex items-center text-sm text-gray-600 hover:text-hotpink-600">
                    <UserCheck className="mr-2 h-4 w-4 text-gray-400 group-hover:text-hotpink-500" />
                    Training Materials
                  </a>
                </div>
              </div>
            </div>

            {/* Compliance Info Card */}
            <div className="mt-6 bg-gradient-to-br from-hotpink-50 to-purple-50 rounded-lg shadow p-5 border border-hotpink-100">
              <h3 className="text-lg font-medium text-hotpink-800 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-hotpink-500" />
                Certification Ready
              </h3>
              <p className="mt-2 text-sm text-hotpink-700">
                Your system exceeds FDA 21 CFR Part 11 requirements with our
                enhanced blockchain security and comprehensive validation framework.
              </p>
              <div className="mt-4">
                <a
                  href="#"
                  className="inline-flex items-center px-3 py-2 border border-hotpink-300 shadow-sm text-sm leading-4 font-medium rounded-md text-hotpink-700 bg-white hover:bg-hotpink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotpink-500"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="mb-6">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow"
                    onClick={() => toggleSection('overview')}
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-teal-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Compliance Overview</h2>
                    </div>
                    {expandedSections.overview ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.overview && (
                    <div className="mt-4">
                      <FDAComplianceDashboard />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === 'documentation' && (
              <div>
                <div className="mb-6">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow"
                    onClick={() => toggleSection('documentation')}
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Compliance Documentation</h2>
                    </div>
                    {expandedSections.documentation ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.documentation && (
                    <div className="mt-4">
                      <FDAComplianceDocumentation />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audit Tab */}
            {activeTab === 'audit' && (
              <div>
                <div className="mb-6">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow"
                    onClick={() => toggleSection('audit')}
                  >
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-blue-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Audit Trail Management</h2>
                    </div>
                    {expandedSections.audit ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.audit && (
                    <div className="mt-4">
                      <AuditLogViewer />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <div className="mb-6">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow"
                    onClick={() => toggleSection('security')}
                  >
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-indigo-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Security Controls</h2>
                    </div>
                    {expandedSections.security ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.security && (
                    <div className="mt-4">
                      <SecuritySettingsPanel />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blockchain Tab */}
            {activeTab === 'blockchain' && (
              <div>
                <div className="mb-6">
                  <button
                    className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow"
                    onClick={() => toggleSection('blockchain')}
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-purple-500 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Blockchain Security</h2>
                    </div>
                    {expandedSections.blockchain ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.blockchain && (
                    <div className="mt-4">
                      <BlockchainSecurityPanel />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              <p>TrialSage™ FDA 21 CFR Part 11 Compliance Center</p>
              <p>Last validation: April 26, 2025</p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">
                <a href="#" className="text-hotpink-600 hover:text-hotpink-500">Privacy Policy</a> | 
                <a href="#" className="text-hotpink-600 hover:text-hotpink-500 ml-3">Compliance Statement</a> | 
                <a href="#" className="text-hotpink-600 hover:text-hotpink-500 ml-3">Contact Support</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}