import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, BookOpen, Calendar, BarChart2 } from 'lucide-react';

/**
 * Literature Tab component for displaying supporting academic literature
 * within the Equivalence Builder Panel
 */
const LiteratureTab = ({ selectedLiterature = [], literatureEvidence = {} }) => {
  const hasEvidence = Object.keys(literatureEvidence).length > 0;
  
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <h3 className="font-semibold text-purple-800 flex items-center mb-2">
          <FileText className="mr-2 h-5 w-5 text-purple-700" />
          Supporting Literature Evidence
        </h3>
        <p className="text-purple-700 mb-4">
          This section shows the academic literature that supports your substantial equivalence claims. 
          Literature evidence strengthens your 510(k) submission by providing scientific backing for your claims.
        </p>
      </div>
      
      {!hasEvidence && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
          <BookOpen className="mb-2 h-10 w-10 text-gray-400" />
          <p className="text-gray-500 text-center">No literature evidence has been associated with your comparison features yet.</p>
          <p className="text-gray-500 text-center mt-1">Return to the Literature Analysis step to select relevant literature.</p>
        </div>
      )}
      
      {hasEvidence && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Literature Evidence by Feature</h3>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Feature</TableHead>
                    <TableHead className="w-2/4">Supporting Publications</TableHead>
                    <TableHead className="w-1/4">Evidence Strength</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(literatureEvidence).map(([feature, papers]) => (
                    <TableRow key={feature}>
                      <TableCell className="font-medium">{feature}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {papers.map((paper, idx) => (
                            <div key={idx} className="flex items-start">
                              <span className="text-xs bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">{idx + 1}</span>
                              <span className="text-sm">{paper.title}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={papers.length > 2 ? "success" : papers.length > 0 ? "warning" : "destructive"}>
                          {papers.length > 2 ? "Strong" : papers.length > 0 ? "Moderate" : "Weak"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Publications Details</h3>
            <div className="space-y-3">
              {selectedLiterature.map((paper, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-slate-50 py-3">
                    <CardTitle className="text-base font-medium flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">{index + 1}</span>
                      {paper.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">Published: {paper.year || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">Journal: {paper.journal || 'Unknown'}</span>
                      </div>
                      {paper.impactFactor && (
                        <div className="flex items-center">
                          <BarChart2 className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-700">Impact Factor: {paper.impactFactor}</span>
                        </div>
                      )}
                    </div>
                    
                    {paper.abstract && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 font-medium">Abstract:</p>
                        <p className="text-sm mt-1">{paper.abstract.length > 200 ? `${paper.abstract.substring(0, 200)}...` : paper.abstract}</p>
                      </div>
                    )}
                    
                    {paper.relevantFeatures && paper.relevantFeatures.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 font-medium">Supports features:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {paper.relevantFeatures.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteratureTab;