import React, { useState } from 'react';
import Layout from '../components/Layout';
import AnimatedSubmissionStoryline from '../components/submission/AnimatedSubmissionStoryline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SubmissionStorylineDemoPage = () => {
  const { toast } = useToast();
  const [submissionType, setSubmissionType] = useState("510k");
  const [progress, setProgress] = useState(45);
  const [currentStage, setCurrentStage] = useState("predicate");
  
  // Stage mappings for different submission types
  const stagesByType = {
    "510k": ["preparation", "predicate", "testing", "package", "submission", "review", "decision"],
    "ind": ["forms", "module2", "module3", "ectd", "esg", "review", "acknowledgment"],
    "pma": ["planning", "clinical", "manufacturing", "assembly", "submission", "review", "approval"],
    "cer": ["planning", "literature", "clinical", "report", "review", "approval"]
  };
  
  // Handle submission type change
  const handleSubmissionTypeChange = (value) => {
    setSubmissionType(value);
    // Set default stage for the selected type
    setCurrentStage(stagesByType[value][0]);
  };
  
  // Handle stage selection from the storyline component
  const handleStageSelect = (stageId) => {
    setCurrentStage(stageId);
    
    // Update progress based on stage position
    const stages = stagesByType[submissionType];
    const stageIndex = stages.indexOf(stageId);
    const newProgress = Math.round((stageIndex / (stages.length - 1)) * 100);
    setProgress(newProgress);
    
    toast({
      title: "Stage Selected",
      description: `Navigated to ${stageId} stage with ${newProgress}% progress`,
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Submission Progress Storyline</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Configuration</CardTitle>
              <CardDescription>
                Configure the visualization parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Submission Type</label>
                  <Select value={submissionType} onValueChange={handleSubmissionTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select submission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="510k">510(k) Submission</SelectItem>
                      <SelectItem value="ind">IND Application</SelectItem>
                      <SelectItem value="pma">PMA Submission</SelectItem>
                      <SelectItem value="cer">Clinical Evaluation Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Current Stage</label>
                  <Select value={currentStage} onValueChange={setCurrentStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stagesByType[submissionType].map(stage => (
                        <SelectItem key={stage} value={stage}>
                          {stage.charAt(0).toUpperCase() + stage.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Progress: {progress}%</label>
                  <Slider 
                    value={[progress]} 
                    onValueChange={(values) => setProgress(values[0])} 
                    max={100} 
                    step={1} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Storyline Preview</CardTitle>
              <CardDescription>
                Visual demonstration of the animated storyline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="storyline">
                <TabsList className="mb-4">
                  <TabsTrigger value="storyline">Storyline</TabsTrigger>
                  <TabsTrigger value="about">About This Feature</TabsTrigger>
                </TabsList>
                
                <TabsContent value="storyline" className="h-[200px] flex items-center justify-center">
                  <div className="text-center px-8">
                    <p className="text-lg text-gray-700 mb-4">
                      The Animated Submission Progress Storyline creates a compelling 
                      narrative around regulatory submissions, educating users on the 
                      process while providing realtime status updates.
                    </p>
                    <p className="text-sm text-gray-500">
                      Scroll down to see the full interactive demo
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="about" className="space-y-4">
                  <h3 className="text-lg font-medium">About Storyline Feature</h3>
                  <p>
                    The Animated Submission Progress Storyline visually represents the 
                    regulatory submission journey with interactive animations and educational
                    content that changes as the submission advances.
                  </p>
                  <p>
                    Key benefits:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Educate stakeholders on complex regulatory processes</li>
                    <li>Provide engaging status updates with contextual information</li>
                    <li>Create a narrative around submission milestones</li>
                    <li>Track progress with visual indicators and timelines</li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <AnimatedSubmissionStoryline 
            submissionType={submissionType}
            currentStage={currentStage}
            progress={progress}
            onStageSelect={handleStageSelect}
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Implementation Notes</h2>
          <p className="text-blue-700 mb-2">
            This component is designed to be integrated into various regulatory workflows:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>510(k) submission dashboard</li>
            <li>IND application tracker</li>
            <li>PMA submission management</li>
            <li>CER preparation workflow</li>
            <li>Client portal for regulatory transparency</li>
          </ul>
          <p className="text-blue-700 mt-2">
            The storyline content automatically adapts to the submission type and current 
            stage, providing contextually relevant information at each step.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SubmissionStorylineDemoPage;