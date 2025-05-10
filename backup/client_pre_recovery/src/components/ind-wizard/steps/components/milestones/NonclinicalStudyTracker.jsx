// src/components/ind-wizard/steps/components/milestones/NonclinicalStudyTracker.jsx
import React, { useState } from 'react';

// UI Components from shadcn/ui
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Icons from lucide-react
import { Bot, HelpCircle, FileCheck2, AlertTriangle, Edit, Trash2, MoreVertical } from 'lucide-react';

// NonclinicalStudyTracker Component
function NonclinicalStudyTracker({
  studies,
  onStudiesChange,
  triggerAiAssistance,
  onEditStudy,
  onDeleteStudy
}) {
  // Function to simulate AI validation for a single study
  const handleAiValidateStudy = async (study) => {
    toast({ title: "AI Validation", description: `Requesting AI validation for study: ${study.studyIdentifier}...` });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Update the status locally (in real app, backend might update this)
    const newStatus = Math.random() > 0.3 ? 'Reviewed' : 'Needs Attention';
    const updatedStudies = studies.map(s => s.id === study.id ? { ...s, aiValidationStatus: newStatus } : s);
    onStudiesChange(updatedStudies); // Update parent state
    toast({ title: "AI Validation Complete", description: `Study ${study.studyIdentifier} marked as ${newStatus}.` });
  };

  // Render the AI validation status icon
  const renderStatusIcon = (status) => {
    if (status === 'Reviewed') return <FileCheck2 className="h-4 w-4 text-green-500" />;
    if (status === 'Needs Attention') return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <HelpCircle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identifier</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>AI Status</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studies && studies.length > 0 ? (
            studies.map((study) => (
              <TableRow key={study.id}>
                <TableCell>{study.studyIdentifier}</TableCell>
                <TableCell>{study.studyType}</TableCell>
                <TableCell>{study.species}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>{renderStatusIcon(study.aiValidationStatus)}</TooltipTrigger>
                    <TooltipContent>{study.aiValidationStatus}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <p className="truncate w-40">{study.keyFindingsSummary || '-'}</p>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onEditStudy(study)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditStudy(study)}>
                          <Edit className="mr-2 h-4 w-4" />Edit Study Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAiValidateStudy(study)}>
                          <Bot className="mr-2 h-4 w-4" />AI Validate This Study
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteStudy(study.id)} 
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />Delete Study
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No nonclinical studies added yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default NonclinicalStudyTracker;