// AdaptiveLearningInterface.jsx - Smart recommendation engine with personalized learning paths
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  BookOpen, 
  BrainCircuit, 
  Clock, 
  FileText, 
  Award,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Settings,
  BookMarked,
  Users
} from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

// Mock user preferences for demonstration
const USER_PREFERENCES = {
  role: 'Regulatory Affairs Manager',
  domain: 'Oncology',
  company: 'BioGenesis Therapeutics',
  expertiseLevel: 'Advanced',
  interests: ['IND Submissions', 'Protocol Design', 'CSR Generation', 'Regulatory Strategy'],
  recentActivity: [
    { 
      type: 'document', 
      id: 'doc-1342', 
      title: 'Phase 2 Oncology Protocol Review', 
      timestamp: '2025-04-20T14:23:00Z',
      progress: 85
    },
    { 
      type: 'learning', 
      id: 'module-754', 
      title: 'Multi-Regional Submission Requirements', 
      timestamp: '2025-04-18T10:15:00Z',
      progress: 60
    },
    { 
      type: 'template', 
      id: 'tmpl-543', 
      title: 'Adverse Event Reporting Template', 
      timestamp: '2025-04-17T16:45:00Z',
      progress: 100
    }
  ]
};

// Mock learning modules for demonstration
const LEARNING_MODULES = [
  {
    id: 'module-1',
    title: 'FDA IND Requirements for First-in-Human Trials',
    description: 'Comprehensive overview of FDA requirements for preparing and submitting IND applications for first-in-human clinical trials.',
    tags: ['FDA', 'IND', 'Clinical Trials', 'Regulatory'],
    level: 'Intermediate',
    duration: '45 minutes',
    relevanceScore: 97,
    completionRate: 62,
    icon: <FileText className="text-blue-500" />
  },
  {
    id: 'module-2',
    title: 'Optimizing CSR Structure for Oncology Studies',
    description: 'Best practices for structuring Clinical Study Reports for oncology trials, with focus on efficacy endpoints and safety reporting.',
    tags: ['CSR', 'Oncology', 'Reporting', 'ICH E3'],
    level: 'Advanced',
    duration: '60 minutes',
    relevanceScore: 95,
    completionRate: 0,
    icon: <BookMarked className="text-emerald-500" />
  },
  {
    id: 'module-3',
    title: 'Multi-Regional Regulatory Strategy Development',
    description: 'Strategic approaches to planning and executing regulatory submissions across FDA, EMA, PMDA, and Health Canada.',
    tags: ['Strategy', 'Multi-Regional', 'Regulatory Planning'],
    level: 'Advanced',
    duration: '75 minutes',
    relevanceScore: 91,
    completionRate: 25,
    icon: <BrainCircuit className="text-indigo-500" />
  },
  {
    id: 'module-4',
    title: 'Protocol Design Best Practices for Oncology Trials',
    description: 'Evidence-based approaches to designing robust oncology protocols that align with regulatory expectations and clinical objectives.',
    tags: ['Protocol', 'Oncology', 'Study Design', 'Clinical Trials'],
    level: 'Intermediate',
    duration: '55 minutes',
    relevanceScore: 88,
    completionRate: 15,
    icon: <Award className="text-amber-500" />
  },
  {
    id: 'module-5',
    title: 'Optimizing Regulatory Document Quality Control',
    description: 'Advanced techniques for implementing effective QC processes for regulatory documents to minimize deficiencies.',
    tags: ['Quality Control', 'Documentation', 'Submission Quality'],
    level: 'Intermediate',
    duration: '40 minutes',
    relevanceScore: 85,
    completionRate: 0,
    icon: <CheckCircle className="text-green-500" />
  }
];

// Mock document templates for demonstration
const DOCUMENT_TEMPLATES = [
  {
    id: 'template-1',
    title: 'Oncology Protocol Template with Adaptive Design Elements',
    description: 'Comprehensive protocol template optimized for oncology trials with adaptive design features.',
    tags: ['Protocol', 'Oncology', 'Adaptive Design'],
    recommendedFor: ['Protocol Design', 'Oncology'],
    useCount: 342,
    relevanceScore: 96,
    icon: <FileText className="text-indigo-500" />
  },
  {
    id: 'template-2',
    title: 'Enhanced Safety Reporting Template for Oncology CSRs',
    description: 'ICH E3-compliant safety reporting template optimized for oncology clinical study reports.',
    tags: ['CSR', 'Safety Reporting', 'Oncology'],
    recommendedFor: ['CSR Generation', 'Safety Reporting'],
    useCount: 287,
    relevanceScore: 94,
    icon: <FileText className="text-red-500" />
  },
  {
    id: 'template-3',
    title: 'Multi-Regional IND Cover Letter Template',
    description: 'Customizable cover letter template for IND submissions with region-specific variations.',
    tags: ['IND', 'Cover Letter', 'Multi-Regional'],
    recommendedFor: ['IND Submissions', 'Regulatory Strategy'],
    useCount: 189,
    relevanceScore: 91,
    icon: <FileText className="text-blue-500" />
  }
];

// Mock insights for demonstration
const GENERATED_INSIGHTS = [
  {
    id: 'insight-1',
    title: 'Optimizing Protocol Inclusion/Exclusion Criteria',
    description: 'Based on your recent protocol review activity, consider tightening exclusion criteria for patients with prior immunotherapy exposure.',
    source: 'AI Analysis of Protocol Review',
    relevanceScore: 98,
    confidenceScore: 92,
    tags: ['Protocol Design', 'Patient Selection', 'Oncology'],
    icon: <Sparkles className="text-amber-500" />
  },
  {
    id: 'insight-2',
    title: 'Regulatory Strategy Enhancement Opportunity',
    description: 'Your multi-regional submission strategy could benefit from a rolling review approach with the FDA while preparing for EMA scientific advice.',
    source: 'Pattern Analysis of Successful Submissions',
    relevanceScore: 94,
    confidenceScore: 88,
    tags: ['Regulatory Strategy', 'FDA', 'EMA', 'Submissions'],
    icon: <TrendingUp className="text-blue-500" />
  },
  {
    id: 'insight-3',
    title: 'CSR Optimization for Oncology Endpoints',
    description: 'Consider enhancing your CSR templates with more detailed response evaluation criteria for immunotherapy endpoints.',
    source: 'CSR Template Analysis',
    relevanceScore: 89,
    confidenceScore: 90,
    tags: ['CSR', 'Oncology', 'Endpoints', 'Reporting'],
    icon: <BookOpen className="text-emerald-500" />
  }
];

// Mock performance metrics for demonstration
const PERFORMANCE_METRICS = {
  completionRate: 72,
  efficiencyImprovement: 68,
  documentQualityScore: 94,
  timeSpent: {
    learning: 12.5,
    documents: 28.3,
    reviews: 8.2
  },
  strengths: ['Regulatory Strategy', 'Protocol Design', 'Technical Documentation'],
  areasForImprovement: ['Safety Reporting', 'Statistical Analysis Plans']
};

// Main component for Adaptive Learning Interface
const AdaptiveLearningInterface = () => {
  const [userPreferences, setUserPreferences] = useState(USER_PREFERENCES);
  const [learningModules, setLearningModules] = useState(LEARNING_MODULES);
  const [documentTemplates, setDocumentTemplates] = useState(DOCUMENT_TEMPLATES);
  const [insights, setInsights] = useState(GENERATED_INSIGHTS);
  const [performanceMetrics, setPerformanceMetrics] = useState(PERFORMANCE_METRICS);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // In a real implementation, we would fetch this data from APIs
  useEffect(() => {
    const fetchPersonalizedData = async () => {
      setIsLoading(true);
      try {
        // These would be actual API requests in a real implementation
        // const userResponse = await apiRequest('GET', '/api/learning/user-profile');
        // const modulesResponse = await apiRequest('GET', '/api/learning/recommended-modules');
        // const templatesResponse = await apiRequest('GET', '/api/document-templates/recommended');
        // const insightsResponse = await apiRequest('GET', '/api/insights/user-recommendations');
        // const metricsResponse = await apiRequest('GET', '/api/user/performance-metrics');
        
        // const userProfile = await userResponse.json();
        // setUserPreferences(userProfile);
        
        // const recommendedModules = await modulesResponse.json();
        // setLearningModules(recommendedModules);
        
        // const recommendedTemplates = await templatesResponse.json();
        // setDocumentTemplates(recommendedTemplates);
        
        // const generatedInsights = await insightsResponse.json();
        // setInsights(generatedInsights);
        
        // const userMetrics = await metricsResponse.json();
        // setPerformanceMetrics(userMetrics);
        
        // For demonstration, we're using the mock data above
      } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        toast({
          title: 'Error loading recommendations',
          description: 'Could not load personalized recommendations. Using default recommendations instead.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPersonalizedData();
  }, [toast]);
  
  const handleInsightToggle = (insightId) => {
    if (expandedInsight === insightId) {
      setExpandedInsight(null);
    } else {
      setExpandedInsight(insightId);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-xl font-bold">Personalized Learning & Recommendations</h2>
            <p className="text-indigo-100 text-sm">
              AI-powered recommendations tailored to your role, expertise, and regulatory focus
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-100 text-xs font-medium">
              <span className="mr-1">AI-Powered</span>
              <Sparkles className="inline-block h-3 w-3" />
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-100 text-xs font-medium flex items-center">
              <Users className="h-3 w-3 mr-1" />
              <span>Domain: {userPreferences.domain}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'recommendations'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'insights'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Insights
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'progress'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Learning Progress
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading personalized recommendations...</span>
          </div>
        ) : (
          <>
            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                {/* Summary Banner */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <BrainCircuit className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800">Personalized for {userPreferences.role}</h3>
                      <p className="text-sm text-blue-700">
                        Recommendations are based on your expertise in {userPreferences.domain}, recent activity, 
                        and learning patterns. Your recommendations update in real-time as you interact with the platform.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Learning Modules */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recommended Learning Modules</h3>
                    <Link to="/learning-center">
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        View All Modules <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {learningModules.slice(0, 3).map((module) => (
                      <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="bg-blue-50 p-2 rounded-lg mr-4">
                            {module.icon || <BookOpen className="h-6 w-6 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{module.title}</h4>
                              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                                {module.relevanceScore}% Match
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {module.duration}
                                </span>
                                <span className="flex items-center">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {module.level}
                                </span>
                              </div>
                              <Link to={`/learning/${module.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                {module.completionRate > 0 ? 'Continue' : 'Start'} Learning →
                              </Link>
                            </div>
                            
                            {module.completionRate > 0 && (
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${module.completionRate}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{module.completionRate}% complete</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Document Templates */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recommended Document Templates</h3>
                    <Link to="/templates">
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        View All Templates <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documentTemplates.map((template) => (
                      <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                          <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                            {template.icon || <FileText className="h-5 w-5 text-indigo-600" />}
                          </div>
                          <div className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">
                            {template.relevanceScore}% Match
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">{template.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {template.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Used {template.useCount} times</span>
                          <Link to={`/templates/${template.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            Use Template →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Continue Where You Left Off</h3>
                    <Link to="/activity">
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        View All Activity <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    {userPreferences.recentActivity.map((activity) => (
                      <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {activity.type === 'document' && <FileText className="h-5 w-5 text-blue-600 mr-2" />}
                            {activity.type === 'learning' && <BookOpen className="h-5 w-5 text-emerald-600 mr-2" />}
                            {activity.type === 'template' && <FileText className="h-5 w-5 text-indigo-600 mr-2" />}
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                        </div>
                        
                        {activity.progress < 100 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${activity.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                              <span>{activity.progress}% complete</span>
                              <Link to={`/${activity.type}s/${activity.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                Continue →
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                {/* Explanation Banner */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Sparkles className="h-6 w-6 text-indigo-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-indigo-800">AI-Generated Insights</h3>
                      <p className="text-sm text-indigo-700">
                        These insights are generated by analyzing your work patterns, regulatory document quality, 
                        and industry best practices. Click on each insight to learn more.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Insights List */}
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id} 
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Insight Header - Always Visible */}
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => handleInsightToggle(insight.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-amber-50 p-2 rounded-lg mr-3">
                              {insight.icon || <Sparkles className="h-5 w-5 text-amber-600" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{insight.title}</h4>
                              <p className="text-sm text-gray-600">{insight.description}</p>
                            </div>
                          </div>
                          <div>
                            {expandedInsight === insight.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Insight Details */}
                      {expandedInsight === insight.id && (
                        <div className="p-4 pt-0 bg-gray-50 border-t border-gray-200">
                          <div className="pl-12">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                  <span className="text-xs text-gray-600">Relevance: {insight.relevanceScore}%</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                  <span className="text-xs text-gray-600">Confidence: {insight.confidenceScore}%</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">Source: {insight.source}</span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Related Topics</h5>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {insight.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Recommended Actions</h5>
                                <ul className="mt-1 text-sm text-gray-600 space-y-1">
                                  <li className="flex items-start">
                                    <ArrowUpRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                    Review related learning modules on {insight.tags[0]} and {insight.tags[1]}
                                  </li>
                                  <li className="flex items-start">
                                    <ArrowUpRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                    Apply this insight to your current {insight.tags[0]} project
                                  </li>
                                  <li className="flex items-start">
                                    <ArrowUpRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                    Share with team members for collaborative implementation
                                  </li>
                                </ul>
                              </div>
                              
                              <div className="flex justify-end pt-2">
                                <div className="flex space-x-2">
                                  <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                                    Save Insight
                                  </button>
                                  <button className="px-3 py-1 bg-indigo-600 rounded text-sm text-white hover:bg-indigo-700">
                                    Apply to Project
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-emerald-800">Completion Rate</h4>
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">{performanceMetrics.completionRate}%</span>
                      <span className="ml-2 text-xs text-emerald-600">+12% from last month</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-800">Efficiency Improvement</h4>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">{performanceMetrics.efficiencyImprovement}%</span>
                      <span className="ml-2 text-xs text-blue-600">+8% from last month</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-amber-800">Quality Score</h4>
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">{performanceMetrics.documentQualityScore}/100</span>
                      <span className="ml-2 text-xs text-amber-600">Top 15%</span>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-indigo-800">Time Investment</h4>
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">{performanceMetrics.timeSpent.learning + performanceMetrics.timeSpent.documents + performanceMetrics.timeSpent.reviews}h</span>
                      <span className="ml-2 text-xs text-indigo-600">This month</span>
                    </div>
                  </div>
                </div>
                
                {/* Time Allocation */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Allocation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Learning Activities</h4>
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">{performanceMetrics.timeSpent.learning}h</span>
                        <span className="ml-2 text-xs text-gray-500">25% of total time</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: '25%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Document Creation</h4>
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">{performanceMetrics.timeSpent.documents}h</span>
                        <span className="ml-2 text-xs text-gray-500">58% of total time</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: '58%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Review & Approvals</h4>
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">{performanceMetrics.timeSpent.reviews}h</span>
                        <span className="ml-2 text-xs text-gray-500">17% of total time</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-emerald-600 h-1.5 rounded-full" 
                          style={{ width: '17%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Strengths & Areas for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <Award className="h-5 w-5 text-amber-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Your Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {performanceMetrics.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center bg-amber-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-amber-600 mr-2" />
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Growth Opportunities</h3>
                    </div>
                    <ul className="space-y-2">
                      {performanceMetrics.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                          <ArrowUpRight className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="text-gray-700">{area}</span>
                          <Link to={`/learning/topic/${area.toLowerCase().replace(' ', '-')}`} className="ml-auto text-xs text-blue-600 hover:text-blue-800">
                            Explore Resources →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Learning Recommendations Based on Progress */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <BrainCircuit className="h-5 w-5 text-indigo-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Next Steps to Improve</h3>
                    </div>
                    <Link to="/learning-path">
                      <button className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                        View Full Learning Path <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    {performanceMetrics.areasForImprovement.map((area, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Enhance Your {area} Skills
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {area === 'Safety Reporting' ? 
                            'Improve your safety reporting expertise with modules covering MedDRA coding, adverse event assessment, and regulatory submissions.' :
                            'Strengthen your statistical analysis capabilities with courses on endpoint selection, sample size calculations, and adaptive design principles.'}
                        </p>
                        <div className="flex justify-end">
                          <Link to={`/learning/path/${area.toLowerCase().replace(' ', '-')}`}>
                            <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
                              Start Learning Path →
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <BrainCircuit className="h-4 w-4 text-blue-500 mr-2" />
          <span>AI recommendations updated in real-time</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            Customize Recommendations
          </button>
          <Link to="/learning-settings">
            <button className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
              Learning Settings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearningInterface;