// src/components/ind-wizard/steps/ClinicalProtocolStep.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useWizard } from '../IndWizardLayout';
import { toast } from '@/hooks/use-toast';
import { Bot, Loader2, FileText, Target, Users, ShieldCheck, PlusCircle, Trash2 } from 'lucide-react';

// Simple criterion component
function CriterionItem({ text, onRemove }) {
  return (
    <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md mb-2">
      <p className="text-sm">{text}</p>
      <Button 
        type="button" 
        size="sm" 
        variant="ghost" 
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

// Criteria list component
function CriteriaList({ items, setItems, title, description }) {
  const [newCriterion, setNewCriterion] = useState('');
  
  const addCriterion = () => {
    if (newCriterion.trim().length >= 5) {
      setItems([...items, newCriterion.trim()]);
      setNewCriterion('');
    } else {
      toast({
        title: "Validation Error", 
        description: "Criterion must be at least 5 characters long", 
        variant: "destructive"
      });
    }
  };
  
  const removeCriterion = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium">{title}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <CriterionItem 
            key={index} 
            text={item} 
            onRemove={() => removeCriterion(index)} 
          />
        ))}
      </div>
      
      <div className="flex space-x-2">
        <Textarea 
          value={newCriterion}
          onChange={(e) => setNewCriterion(e.target.value)}
          placeholder="Enter new criterion..."
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={addCriterion}
          className="self-end"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

export default function ClinicalProtocolStep() {
  const { updateIndDataSection } = useWizard();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [protocolTitle, setProtocolTitle] = useState('');
  const [protocolDescription, setProtocolDescription] = useState('');
  const [primaryEndpoints, setPrimaryEndpoints] = useState('');
  const [safetyMonitoring, setSafetyMonitoring] = useState('');
  
  // Criteria state
  const [inclusionCriteria, setInclusionCriteria] = useState([]);
  const [exclusionCriteria, setExclusionCriteria] = useState([]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (protocolTitle.trim().length < 5) {
      toast({
        title: "Validation Error", 
        description: "Protocol title is required and must be at least 5 characters", 
        variant: "destructive"
      });
      return;
    }
    
    if (inclusionCriteria.length === 0) {
      toast({
        title: "Validation Error", 
        description: "At least one inclusion criterion is required", 
        variant: "destructive"
      });
      return;
    }
    
    // Save data
    setLoading(true);
    
    setTimeout(() => {
      const data = {
        protocolTitle,
        protocolDescription,
        primaryEndpoints,
        safetyMonitoring,
        inclusionCriteria,
        exclusionCriteria
      };
      
      console.log("Saving data:", data);
      
      if (updateIndDataSection) {
        updateIndDataSection('clinicalProtocolData', data);
      }
      
      toast({
        title: "Success", 
        description: "Clinical protocol data saved successfully"
      });
      
      setLoading(false);
    }, 1000);
  };
  
  const handleAiSuggest = (section) => {
    toast({
      title: "AI Suggestion", 
      description: `AI suggestions for ${section} would appear here`
    });
  };
  
  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit}>
        {/* Protocol Identification */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Protocol Identification
            </CardTitle>
            <CardDescription>
              Define the basic identifying information for your clinical protocol.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="protocolTitle">Protocol Title</Label>
              <Input
                id="protocolTitle"
                value={protocolTitle}
                onChange={(e) => setProtocolTitle(e.target.value)}
                placeholder="Enter protocol title"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                A clear, descriptive title for the protocol document.
              </p>
            </div>
            
            <div>
              <Label htmlFor="protocolDescription">Protocol Description</Label>
              <Textarea
                id="protocolDescription"
                value={protocolDescription}
                onChange={(e) => setProtocolDescription(e.target.value)}
                placeholder="Describe the protocol"
                className="mt-1"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                A detailed description of the protocol.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Endpoints */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" /> Study Endpoints
            </CardTitle>
            <CardDescription>
              Define the primary and secondary endpoints for the study.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleAiSuggest("endpoints")}
              >
                <Bot className="mr-2 h-4 w-4" />
                Suggest Endpoints
              </Button>
            </div>
            
            <div>
              <Label htmlFor="primaryEndpoints">Primary Endpoint(s)</Label>
              <Textarea
                id="primaryEndpoints"
                value={primaryEndpoints}
                onChange={(e) => setPrimaryEndpoints(e.target.value)}
                placeholder="Describe the primary endpoints"
                className="mt-1"
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                The main outcome measures for the study.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Study Population */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" /> Study Population
            </CardTitle>
            <CardDescription>
              Define the criteria for participant inclusion and exclusion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CriteriaList
              items={inclusionCriteria}
              setItems={setInclusionCriteria}
              title="Inclusion Criteria"
              description="Define conditions participants must meet to be eligible."
            />
            
            <hr className="my-6" />
            
            <CriteriaList
              items={exclusionCriteria}
              setItems={setExclusionCriteria}
              title="Exclusion Criteria"
              description="Define conditions that disqualify participants."
            />
          </CardContent>
        </Card>
        
        {/* Safety Monitoring */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5" /> Safety Monitoring
            </CardTitle>
            <CardDescription>
              Define plans for monitoring participant safety.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="safetyMonitoring">Safety Monitoring Plan</Label>
              <Textarea
                id="safetyMonitoring"
                value={safetyMonitoring}
                onChange={(e) => setSafetyMonitoring(e.target.value)}
                placeholder="Describe the safety monitoring approach"
                className="mt-1"
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Summarize how participant safety will be monitored.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Form Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" type="button">
            Previous
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}