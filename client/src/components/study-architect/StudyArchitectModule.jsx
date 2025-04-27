import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Users, 
  Calendar, 
  ClipboardList, 
  FileText,
  Database,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Check,
  Download
} from 'lucide-react';
import { useModuleIntegration } from '../integration/ModuleIntegrationLayer';

const StudyArchitectModule = () => {
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState(['objectives', 'endpoints']);
  const integration = useModuleIntegration();
  
  // Mock studies data
  const studies = [
    {
      id: 1,
      title: 'Study XYZ-123',
      phase: 'Phase 2',
      indication: 'Advanced Solid Tumors',
      status: 'In Design',
      lastModified: '2025-04-20',
      progress: 65
    },
    {
      id: 2,
      title: 'Study ABC-456',
      phase: 'Phase 3',
      indication: 'Heart Failure',
      status: 'Draft',
      lastModified: '2025-04-15',
      progress: 30
    },
    {
      id: 3,
      title: 'Study DEF-789',
      phase: 'Phase 1',
      indication: 'NSCLC',
      status: 'Complete',
      lastModified: '2025-03-25',
      progress: 100
    }
  ];
  
  // Mock protocol sections data
  const protocolSections = [
    { id: 'objectives', title: 'Objectives', complete: true },
    { id: 'endpoints', title: 'Endpoints', complete: true },
    { id: 'eligibility', title: 'Eligibility Criteria', complete: false },
    { id: 'design', title: 'Study Design', complete: true },
    { id: 'statistics', title: 'Statistical Analysis', complete: false },
    { id: 'procedures', title: 'Study Procedures', complete: false },
    { id: 'dosing', title: 'Treatment Dosing', complete: true },
    { id: 'assessment', title: 'Safety Assessment', complete: false },
    { id: 'schedule', title: 'Schedule of Activities', complete: false }
  ];
  
  // Mock selected study detailed data
  const selectedStudyData = {
    id: 1,
    title: 'Study XYZ-123',
    officialTitle: 'A Phase 2 Study to Evaluate the Efficacy and Safety of XYZ-123 in Patients with Advanced Solid Tumors',
    phase: 'Phase 2',
    status: 'In Design',
    indication: 'Advanced Solid Tumors',
    interventions: [
      { id: 1, name: 'XYZ-123', type: 'Drug', description: 'Novel TKI inhibitor' },
      { id: 2, name: 'Placebo', type: 'Placebo', description: 'Matching placebo' }
    ],
    objectives: [
      { id: 1, type: 'Primary', text: 'To evaluate the objective response rate (ORR) of XYZ-123' },
      { id: 2, type: 'Secondary', text: 'To evaluate the safety and tolerability of XYZ-123' },
      { id: 3, type: 'Secondary', text: 'To evaluate progression-free survival (PFS)' },
      { id: 4, type: 'Exploratory', text: 'To evaluate potential biomarkers of response' }
    ],
    endpoints: [
      { id: 1, type: 'Primary', text: 'ORR as assessed by RECIST v1.1' },
      { id: 2, type: 'Secondary', text: 'Incidence of treatment-emergent adverse events (TEAEs)' },
      { id: 3, type: 'Secondary', text: 'PFS defined as time from randomization to progression or death' },
      { id: 4, type: 'Exploratory', text: 'Correlation of tumor response with biomarker expression' }
    ],
    eligibility: {
      inclusion: [
        'Adults ≥ 18 years of age',
        'Histologically or cytologically confirmed diagnosis of advanced solid tumor',
        'At least one measurable lesion per RECIST v1.1',
        'ECOG performance status of 0-1',
        'Adequate organ function'
      ],
      exclusion: [
        'Prior treatment with a TKI inhibitor targeting the same pathway',
        'Known active CNS metastases',
        'History of interstitial lung disease',
        'Significant cardiovascular disease within 6 months prior to study entry',
        'Prior malignancy within the last 3 years'
      ]
    },
    design: {
      type: 'Randomized, double-blind, placebo-controlled',
      arms: [
        { id: 1, name: 'Experimental', description: 'XYZ-123 200mg orally once daily' },
        { id: 2, name: 'Control', description: 'Matching placebo orally once daily' }
      ],
      randomization: '2:1 (XYZ-123:Placebo)',
      stratification: [
        'ECOG PS (0 vs 1)',
        'Prior lines of therapy (1 vs ≥2)'
      ],
      duration: 'Until disease progression or unacceptable toxicity, up to 24 months'
    }
  };

  const handleStudySelect = (study) => {
    setSelectedStudy(study);
    
    // Update shared data in integration layer
    integration.updateSharedData('selectedStudy', study);
    integration.triggerEvent('study-selected', { studyId: study.id });
  };

  const toggleSectionExpand = (sectionId) => {
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  
  // Function to generate AI-assisted content
  const generateWithAI = (sectionId) => {
    console.log(`Generating AI content for section: ${sectionId}`);
    // In a real implementation, this would call an OpenAI API
    // and update the protocol content
  };
  
  const renderStudyList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Study Protocols</h2>
        <button className="px-3 py-1.5 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center">
          <Plus size={16} className="mr-1" />
          <span>New Study</span>
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {studies.map(study => (
          <div 
            key={study.id}
            className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedStudy?.id === study.id ? 'bg-pink-50' : ''}`}
            onClick={() => handleStudySelect(study)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <Layers className="text-pink-600 mr-2" size={20} />
                  <h3 className="font-medium">{study.title}</h3>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {study.phase} • {study.indication}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Copy size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>Modified: {study.lastModified}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full ${
                  study.status === 'Complete'
                    ? 'bg-green-100 text-green-800'
                    : study.status === 'In Design'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {study.status}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                  <div 
                    className="bg-pink-600 h-2 rounded-full" 
                    style={{ width: `${study.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{study.progress}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudyOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{selectedStudyData.title}</h2>
            <p className="mt-1 text-gray-600">{selectedStudyData.officialTitle}</p>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <Edit size={16} className="mr-1" />
              <span>Edit</span>
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center">
              <Download size={16} className="mr-1" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Study Phase</h3>
            <p>{selectedStudyData.phase}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Indication</h3>
            <p>{selectedStudyData.indication}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <p className="flex items-center">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                selectedStudyData.status === 'Complete'
                  ? 'bg-green-500'
                  : selectedStudyData.status === 'In Design'
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}></span>
              {selectedStudyData.status}
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Interventions</h3>
            <div className="space-y-2">
              {selectedStudyData.interventions.map(intervention => (
                <div key={intervention.id} className="flex items-start">
                  <span className="text-gray-500 mr-2">•</span>
                  <div>
                    <span className="font-medium">{intervention.name}</span>
                    <span className="text-gray-600"> ({intervention.type}): </span>
                    <span className="text-gray-600">{intervention.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Study Design Type</h3>
            <p>{selectedStudyData.design.type}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Protocol Sections</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {protocolSections.map(section => (
            <div key={section.id} className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => toggleSectionExpand(section.id)}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    section.complete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {section.complete ? <Check size={14} /> : null}
                  </div>
                  <h3 className="font-medium">{section.title}</h3>
                </div>
                <div className="flex items-center">
                  <button 
                    className="p-1 mr-1 text-pink-600 hover:bg-pink-50 rounded" 
                    onClick={(e) => { e.stopPropagation(); generateWithAI(section.id); }}
                    title="Generate with AI"
                  >
                    <Sparkles size={16} />
                  </button>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Expanded section content */}
              {expandedSections.includes(section.id) && (
                <div className="mt-4 pl-12">
                  {section.id === 'objectives' && (
                    <div className="space-y-3">
                      {selectedStudyData.objectives.map(objective => (
                        <div key={objective.id} className="flex items-start">
                          <span className={`px-2 py-0.5 text-xs rounded-full mr-2 ${
                            objective.type === 'Primary' 
                              ? 'bg-blue-100 text-blue-800' 
                              : objective.type === 'Secondary'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {objective.type}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm">{objective.text}</p>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <button className="mt-2 text-sm text-pink-600 hover:text-pink-700 flex items-center">
                        <Plus size={14} className="mr-1" />
                        <span>Add Objective</span>
                      </button>
                    </div>
                  )}
                  
                  {section.id === 'endpoints' && (
                    <div className="space-y-3">
                      {selectedStudyData.endpoints.map(endpoint => (
                        <div key={endpoint.id} className="flex items-start">
                          <span className={`px-2 py-0.5 text-xs rounded-full mr-2 ${
                            endpoint.type === 'Primary' 
                              ? 'bg-blue-100 text-blue-800' 
                              : endpoint.type === 'Secondary'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {endpoint.type}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm">{endpoint.text}</p>
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <button className="mt-2 text-sm text-pink-600 hover:text-pink-700 flex items-center">
                        <Plus size={14} className="mr-1" />
                        <span>Add Endpoint</span>
                      </button>
                    </div>
                  )}
                  
                  {section.id === 'eligibility' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Inclusion Criteria</h4>
                        <ul className="space-y-2">
                          {selectedStudyData.eligibility.inclusion.map((criterion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <p className="text-sm flex-1">{criterion}</p>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button className="mt-2 text-sm text-pink-600 hover:text-pink-700 flex items-center">
                          <Plus size={14} className="mr-1" />
                          <span>Add Inclusion Criterion</span>
                        </button>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Exclusion Criteria</h4>
                        <ul className="space-y-2">
                          {selectedStudyData.eligibility.exclusion.map((criterion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              <p className="text-sm flex-1">{criterion}</p>
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <Edit size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button className="mt-2 text-sm text-pink-600 hover:text-pink-700 flex items-center">
                          <Plus size={14} className="mr-1" />
                          <span>Add Exclusion Criterion</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!['objectives', 'endpoints', 'eligibility'].includes(section.id) && (
                    <div className="bg-gray-50 rounded p-4 text-center">
                      <p className="text-sm text-gray-500">
                        This section is currently empty. Click the sparkle icon to generate content with AI or add content manually.
                      </p>
                      <button className="mt-3 px-3 py-1.5 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm flex items-center mx-auto">
                        <Sparkles size={14} className="mr-1" />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Study Team</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Roles & Responsibilities</h3>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Users size={20} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Principal Investigator</h4>
                  <p className="text-sm text-gray-500">Dr. Jane Smith</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <ClipboardList size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Clinical Research Coordinator</h4>
                  <p className="text-sm text-gray-500">John Johnson</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <FileText size={20} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Medical Writer</h4>
                  <p className="text-sm text-gray-500">Sarah Wilson</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                  <Database size={20} className="text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium">Biostatistician</h4>
                  <p className="text-sm text-gray-500">Robert Chen</p>
                </div>
              </div>
            </div>
          </div>
          
          <button className="mt-4 text-sm text-pink-600 hover:text-pink-700 flex items-center">
            <Plus size={14} className="mr-1" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Study Architect™</h1>
      </div>
      
      {!selectedStudy ? (
        <div className="space-y-6">
          <p className="text-gray-600">Design and optimize your clinical study protocols with intelligent assistance.</p>
          {renderStudyList()}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Navigation tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button 
              className={`px-4 py-2 text-sm border-b-2 font-medium ${
                activeSection === 'overview' 
                  ? 'border-pink-500 text-pink-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveSection('overview')}
            >
              Protocol Overview
            </button>
            <button 
              className={`px-4 py-2 text-sm border-b-2 font-medium ${
                activeSection === 'team' 
                  ? 'border-pink-500 text-pink-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveSection('team')}
            >
              Study Team
            </button>
            <button 
              className={`px-4 py-2 text-sm border-b-2 font-medium ${
                activeSection === 'schedule' 
                  ? 'border-pink-500 text-pink-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveSection('schedule')}
            >
              Schedule of Activities
            </button>
            <button 
              className={`px-4 py-2 text-sm border-b-2 font-medium ${
                activeSection === 'documents' 
                  ? 'border-pink-500 text-pink-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveSection('documents')}
            >
              Documents
            </button>
          </div>
          
          {/* Back link */}
          <button 
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            onClick={() => setSelectedStudy(null)}
          >
            <ChevronDown className="transform rotate-90 mr-1" size={16} />
            <span>Back to study list</span>
          </button>
          
          {/* Active section content */}
          {activeSection === 'overview' && renderStudyOverview()}
          {activeSection === 'team' && renderTeam()}
          {activeSection === 'schedule' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Schedule of Activities</h3>
              <p className="mt-1 text-sm text-gray-500">
                This section is under development.
              </p>
            </div>
          )}
          {activeSection === 'documents' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Study Documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                This section is under development.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyArchitectModule;