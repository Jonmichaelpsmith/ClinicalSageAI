import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  BarChart2, 
  Beaker, 
  Package, 
  Upload, 
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * AnimatedSubmissionStoryline
 * 
 * A dynamic, animated visualization of the regulatory submission process
 * with interactive storyline elements showing the journey of a submission
 * from initial preparation to final approval.
 */
const AnimatedSubmissionStoryline = ({ 
  submissionId,
  submissionType = "510k", // "510k", "ind", "pma", "cer"
  currentStage = "preparation",
  progress = 0, 
  onStageSelect 
}) => {
  // Define the stages for different submission types
  const submissionFlows = {
    "510k": [
      { id: "preparation", name: "Preparation", icon: FileText, color: "blue" },
      { id: "predicate", name: "Predicate Analysis", icon: BarChart2, color: "indigo" },
      { id: "testing", name: "Performance Testing", icon: Beaker, color: "purple" },
      { id: "package", name: "Package Assembly", icon: Package, color: "emerald" },
      { id: "submission", name: "FDA Submission", icon: Upload, color: "amber" },
      { id: "review", name: "FDA Review", icon: Clock, color: "orange" },
      { id: "decision", name: "FDA Decision", icon: CheckCircle, color: "green" }
    ],
    "ind": [
      { id: "forms", name: "Forms", icon: FileText, color: "blue" },
      { id: "module2", name: "Module 2", icon: BarChart2, color: "indigo" },
      { id: "module3", name: "Module 3", icon: Beaker, color: "purple" },
      { id: "ectd", name: "eCTD", icon: Package, color: "emerald" },
      { id: "esg", name: "ESG", icon: Upload, color: "amber" },
      { id: "review", name: "FDA Review", icon: Clock, color: "orange" },
      { id: "acknowledgment", name: "FDA Acknowledgment", icon: CheckCircle, color: "green" }
    ],
    "pma": [
      { id: "planning", name: "Planning", icon: FileText, color: "blue" },
      { id: "clinical", name: "Clinical Data", icon: BarChart2, color: "indigo" },
      { id: "manufacturing", name: "Manufacturing", icon: Beaker, color: "purple" },
      { id: "assembly", name: "Assembly", icon: Package, color: "emerald" },
      { id: "submission", name: "Submission", icon: Upload, color: "amber" },
      { id: "review", name: "FDA Review", icon: Clock, color: "orange" },
      { id: "approval", name: "FDA Approval", icon: CheckCircle, color: "green" }
    ],
    "cer": [
      { id: "planning", name: "Planning", icon: FileText, color: "blue" },
      { id: "literature", name: "Literature Review", icon: BarChart2, color: "indigo" },
      { id: "clinical", name: "Clinical Evaluation", icon: Beaker, color: "purple" },
      { id: "report", name: "Report Generation", icon: Package, color: "emerald" },
      { id: "review", name: "Notified Body Review", icon: Clock, color: "orange" },
      { id: "approval", name: "CE Marking", icon: CheckCircle, color: "green" }
    ]
  };

  // Get the stages for the current submission type
  const stages = submissionFlows[submissionType] || submissionFlows["510k"];
  
  // Find current stage index
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);
  
  // Determine completed stages (all stages before current)
  const completedStages = stages
    .slice(0, currentStageIndex)
    .map(stage => stage.id);
  
  // Animation variants for the progress line
  const lineVariants = {
    initial: { width: "0%" },
    animate: { 
      width: `${progress}%`,
      transition: { duration: 1.5, ease: "easeInOut" }
    }
  };

  // State for story elements
  const [storyStep, setStoryStep] = useState(0);
  const [showStory, setShowStory] = useState(false);

  // Generate storyline for the current stage
  const getStoryForStage = (stageId) => {
    const storyElements = {
      // 510k storylines
      "preparation": [
        "The journey begins with comprehensive planning and document preparation.",
        "The team meticulously collects and organizes device specifications and drawings.",
        "Quality management system documentation is reviewed and aligned with regulatory requirements."
      ],
      "predicate": [
        "The search for legally marketed predicate devices begins.",
        "Our AI-powered predicate analysis tools identify potential matches based on intended use and technological characteristics.",
        "Engineers conduct detailed comparative analysis to establish substantial equivalence."
      ],
      "testing": [
        "Performance testing protocols are established to validate safety and effectiveness.",
        "Laboratory testing begins to evaluate the device against industry standards.",
        "Test results are documented and analyzed to support substantial equivalence claims."
      ],
      "package": [
        "All testing data, technical documentation, and forms are compiled into the submission package.",
        "Quality checks ensure all required elements are present and properly formatted.",
        "The final 510(k) submission package is prepared according to FDA guidelines."
      ],
      "submission": [
        "The submission package is transmitted to the FDA through the Electronic Submissions Gateway.",
        "FDA confirmation of receipt marks the beginning of the review period.",
        "The regulatory team prepares to address any additional information requests."
      ],
      "review": [
        "FDA reviewers conduct a comprehensive evaluation of the submission.",
        "Subject matter experts assess the device's safety and effectiveness claims.",
        "The review process typically spans 90 days, with potential for interactive review."
      ],
      "decision": [
        "The FDA reaches a decision on the 510(k) submission.",
        "A successful clearance grants authorization to market the device in the US.",
        "Post-market surveillance begins to monitor real-world performance."
      ],
      
      // IND storylines
      "forms": [
        "The IND journey begins with the preparation of essential FDA forms.",
        "Form 1571 (IND Application) outlines the investigational plan and product details.",
        "Forms 1572 and 3674 provide investigator commitments and clinical trials registry information."
      ],
      "module2": [
        "Module 2 summaries are crafted to provide an overview of clinical and nonclinical data.",
        "Quality summaries detail the chemistry, manufacturing, and controls information.",
        "The clinical overview synthesizes all human study data to support the investigation."
      ],
      "module3": [
        "Module 3 chemistry, manufacturing, and controls (CMC) documentation is compiled.",
        "Detailed information on drug substance and drug product is organized.",
        "Manufacturing processes and controls are thoroughly documented to ensure product quality."
      ],
      "ectd": [
        "The electronic Common Technical Document (eCTD) structure is assembled.",
        "All modules are formatted according to strict FDA specifications.",
        "Document hyperlinks, bookmarks, and navigation aids are implemented for reviewer efficiency."
      ],
      "esg": [
        "The completed eCTD package is prepared for submission through the FDA Electronic Submissions Gateway.",
        "Transmission to FDA servers is securely initiated with encryption protocols.",
        "Electronic receipt confirmation is awaited as the package is transmitted."
      ],
      "acknowledgment": [
        "FDA acknowledgment receipt confirms successful transmission and acceptance for review.",
        "The 30-day safety review period begins, during which the FDA evaluates initial safety data.",
        "If no clinical hold is issued within 30 days, the clinical investigation may proceed."
      ],
      
      // Generic stages
      "regulatory_review": [
        "Regulatory authorities conduct a comprehensive evaluation of the submission.",
        "Subject matter experts assess the technical, clinical, and safety aspects.",
        "Interactive communication may address questions or clarifications needed."
      ],
      "planning": [
        "Strategic regulatory planning establishes the submission approach.",
        "The team maps out critical path activities and timelines.",
        "Resource allocation and responsibility assignments are finalized."
      ],
      "clinical": [
        "Clinical evidence is collected from relevant studies and trials.",
        "Patient data is analyzed to demonstrate safety and effectiveness.",
        "Statistical analysis supports clinical performance claims."
      ],
      "manufacturing": [
        "Manufacturing processes and facilities are documented in detail.",
        "Quality control procedures ensure consistent product performance.",
        "Risk management systems address production variability."
      ],
      "approval": [
        "Final regulatory approval is granted after successful review.",
        "Marketing authorization is issued for the specified indications.",
        "Post-market requirements are established for ongoing monitoring."
      ]
    };
    
    return storyElements[stageId] || [
      "Submission processing is in progress.",
      "The regulatory team is actively working on this stage.",
      "Updates will be provided as milestones are completed."
    ];
  };

  // Get story content for the current stage
  const storyContent = getStoryForStage(currentStage);
  
  // Auto-advance story steps with a timer
  useEffect(() => {
    if (showStory) {
      const timer = setInterval(() => {
        setStoryStep(prev => {
          const nextStep = prev + 1;
          if (nextStep >= storyContent.length) {
            return 0; // Loop back to beginning
          }
          return nextStep;
        });
      }, 5000); // Change story step every 5 seconds
      
      return () => clearInterval(timer);
    }
  }, [showStory, storyContent.length]);

  // Reset story step when stage changes
  useEffect(() => {
    setStoryStep(0);
  }, [currentStage]);

  // Handle stage selection
  const handleStageClick = (stageId) => {
    if (onStageSelect) {
      onStageSelect(stageId);
    }
  };

  // Animation variants for story content
  const storyVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header with title and progress */}
      <div className="p-5 border-b bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {submissionType.toUpperCase()} Submission Progress
          </h3>
          <Badge variant={progress === 100 ? "success" : "outline"} className="text-xs">
            {progress}% Complete
          </Badge>
        </div>
        
        <div className="relative">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      {/* Main content with stages and storyline */}
      <div className="p-5">
        {/* Stages visualization */}
        <div className="relative mb-12">
          <div className="absolute h-1 bg-gray-200 w-full top-6 rounded-full">
            <motion.div 
              className="absolute h-1 bg-blue-600 rounded-full"
              initial="initial"
              animate="animate"
              variants={lineVariants}
            />
          </div>
          
          <div className="flex justify-between relative">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isCompleted = completedStages.includes(stage.id);
              const isActive = currentStage === stage.id;
              const isPending = !isCompleted && !isActive;
              
              return (
                <div key={stage.id} className="flex flex-col items-center z-10">
                  <motion.button
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? "bg-green-500 border-green-500 text-white" :
                      isActive ? "bg-blue-100 border-blue-500 text-blue-600" :
                      "bg-white border-gray-300 text-gray-400"
                    }`}
                    onClick={() => handleStageClick(stage.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      opacity: isPending ? 0.7 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StageIcon className="w-5 h-5" />
                    )}
                    
                    {/* Pulsing animation for active stage */}
                    {isActive && (
                      <motion.div
                        className="absolute w-full h-full rounded-full bg-blue-200 opacity-70 -z-10"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 0.2, 0.7]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                  </motion.button>
                  
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${
                      isCompleted ? "text-green-600" :
                      isActive ? "text-blue-600" :
                      "text-gray-500"
                    }`}>
                      {stage.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Storyline section */}
        <div className="mt-8 border rounded-lg overflow-hidden bg-gray-50">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mr-3">
                {React.createElement(stages.find(s => s.id === currentStage)?.icon || FileText, { className: "w-5 h-5" })}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {stages.find(s => s.id === currentStage)?.name} Stage Storyline
                </h4>
                <p className="text-xs text-gray-500">
                  Follow the journey of your submission through this regulatory milestone
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStory(!showStory)}
            >
              {showStory ? "Pause" : "Play"} Storyline
            </Button>
          </div>
          
          <div className="p-5 min-h-[150px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`story-${currentStage}-${storyStep}`}
                variants={storyVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center px-8 max-w-2xl"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    {storyContent.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === storyStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                        animate={i === storyStep ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                        transition={{ duration: 1, repeat: i === storyStep ? Infinity : 0 }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-lg">
                  {storyContent[storyStep]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Stage timeline indicator */}
          <div className="px-5 py-3 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" /> 
              <span>Stage {currentStageIndex + 1} of {stages.length}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => setStoryStep(prev => (prev === 0 ? storyContent.length - 1 : prev - 1))}
              >
                Previous
              </button>
              <button 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={() => setStoryStep(prev => (prev === storyContent.length - 1 ? 0 : prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* Timeline events */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Submission Timeline</h4>
          <div className="space-y-4">
            {completedStages.map((stageId, index) => {
              const stage = stages.find(s => s.id === stageId);
              const StageIcon = stage?.icon || FileText;
              
              return (
                <div key={stageId} className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600 mt-0.5 mr-3 flex-shrink-0">
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{stage?.name} Completed</h5>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {getStoryForStage(stageId)[0]}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round((index + 1) / stages.length * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Current stage */}
            {currentStage && !completedStages.includes(currentStage) && (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 mt-0.5 mr-3 flex-shrink-0 relative">
                  {React.createElement(stages.find(s => s.id === currentStage)?.icon || FileText, { className: "w-4 h-4" })}
                  {/* Pulsing dot for current stage */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-blue-600">
                        {stages.find(s => s.id === currentStage)?.name} In Progress
                      </h5>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Currently working on this stage
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs animate-pulse">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {/* Future stages */}
            {stages.slice(currentStageIndex + 1).map((stage) => (
              <div key={stage.id} className="flex items-start opacity-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400 mt-0.5 mr-3 flex-shrink-0">
                  <stage.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-gray-500">{stage.name} Pending</h5>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Scheduled to begin after current stage completion
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSubmissionStoryline;