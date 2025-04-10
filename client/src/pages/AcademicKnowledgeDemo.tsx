import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, FileText, Beaker, Flask } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AcademicKnowledgeDemo = () => {
  const [indication, setIndication] = useState('Diabetes');
  const [phase, setPhase] = useState('Phase 3');
  const [population, setPopulation] = useState('Adult patients');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState<any>(null);
  
  // Generates a protocol template with academic knowledge integration
  const generateProtocol = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/protocol/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          indication,
          phase,
          population,
          additionalContext: 'Include academic evidence and citations where appropriate.'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate protocol');
      }
      
      const data = await response.json();
      setGeneratedProtocol(data);
    } catch (error) {
      console.error('Error generating protocol:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Query common indications for dropdown
  const { data: indications = [] } = useQuery({
    queryKey: ['/api/indications'],
    enabled: true
  });
  
  // Query common phases for dropdown
  const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BookOpen className="mr-2" />
        Academic Knowledge Integration Demo
      </h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Protocol with Academic Evidence</CardTitle>
          <CardDescription>
            This demo showcases the integration of academic knowledge into protocol generation.
            Enter the trial details below to generate a protocol with evidence-based recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="indication">Indication</Label>
              <Input
                id="indication"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder="e.g., Diabetes"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phase">Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="population">Target Population</Label>
              <Input
                id="population"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                placeholder="e.g., Adult patients"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateProtocol} 
            disabled={isGenerating}
            className="w-full md:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Protocol...
              </>
            ) : (
              <>
                <Beaker className="mr-2 h-4 w-4" />
                Generate Protocol with Academic Evidence
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {generatedProtocol && (
        <Tabs defaultValue="protocol" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="protocol">Protocol</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="evidence">Academic Evidence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="protocol" className="space-y-4">
            <h2 className="text-2xl font-bold">{generatedProtocol.title}</h2>
            
            {generatedProtocol.sections.map((section: any, index: number) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>{section.sectionName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line">{section.content}</div>
                </CardContent>
                {section.competitiveBenchmark && (
                  <CardFooter className="flex flex-col items-start">
                    <p className="text-sm font-semibold mb-1">Evidence-Based Analysis:</p>
                    <p className="text-sm text-muted-foreground">
                      {section.competitiveBenchmark}
                    </p>
                  </CardFooter>
                )}
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="validation" className="space-y-4">
            <h2 className="text-2xl font-bold">Validation Results</h2>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="destructive">{generatedProtocol.validationSummary.criticalIssues} Critical</Badge>
              <Badge variant="destructive">{generatedProtocol.validationSummary.highIssues} High</Badge>
              <Badge variant="warning">{generatedProtocol.validationSummary.mediumIssues} Medium</Badge>
              <Badge variant="secondary">{generatedProtocol.validationSummary.warningIssues} Warning</Badge>
              <Badge variant="outline">{generatedProtocol.validationSummary.lowIssues} Low</Badge>
            </div>
            
            {generatedProtocol.sections.map((section: any, sectionIndex: number) => {
              if (!section.validationIssues || section.validationIssues.length === 0) {
                return null;
              }
              
              return (
                <Card key={`validation-${sectionIndex}`} className="mb-4">
                  <CardHeader>
                    <CardTitle>{section.sectionName} Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {section.validationIssues.map((issue: any, issueIndex: number) => (
                        <Alert key={issueIndex} className="mb-2" variant={
                          issue.severity === 'critical' || issue.severity === 'high' 
                            ? 'destructive' 
                            : issue.severity === 'medium' 
                            ? 'default' 
                            : 'outline'
                        }>
                          <div className="flex items-center">
                            <Badge className="mr-2" variant={
                              issue.severity === 'critical' || issue.severity === 'high' 
                                ? 'destructive' 
                                : issue.severity === 'medium' 
                                ? 'default' 
                                : 'outline'
                            }>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <AlertTitle>{issue.message}</AlertTitle>
                          </div>
                          <AlertDescription>
                            <strong>Recommendation: </strong>{issue.recommendation}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="evidence" className="space-y-4">
            <h2 className="text-2xl font-bold">Academic Evidence</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Similar Trials</CardTitle>
                <CardDescription>
                  These trials were used as reference for generating the protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedProtocol.similarTrials.map((trial: any, index: number) => (
                  <div key={index} className="p-2 border rounded mb-2">
                    <div className="font-medium">{trial.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Sponsor: {trial.sponsor} | Phase: {trial.phase} | Similarity: {trial.similarity}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Evidence-Based Benchmarks</CardTitle>
                <CardDescription>
                  Academic citations and evidence used in the protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {generatedProtocol.sections.map((section: any, sIndex: number) => (
                    <div key={`evidence-${sIndex}`} className="mb-4">
                      <h3 className="font-bold">{section.sectionName}</h3>
                      <Separator className="my-2" />
                      {section.competitiveBenchmark ? (
                        <div className="whitespace-pre-line p-2 bg-secondary/20 rounded-md">
                          {section.competitiveBenchmark}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No academic evidence available</p>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AcademicKnowledgeDemo;