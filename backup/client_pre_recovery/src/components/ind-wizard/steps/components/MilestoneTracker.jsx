// src/components/ind-wizard/steps/components/MilestoneTracker.jsx
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { CalendarIcon, Edit, Trash2, CheckCircle, HelpCircle } from 'lucide-react';
import { format } from "date-fns";

// --- Helper to format date safely ---
const formatDate = (date) => {
  if (!date) return 'Not set';
  try {
    return format(new Date(date), 'PP');
  } catch (e) {
    return 'Invalid date';
  }
}

// --- Data Types ---
// Export milestone schema for use in other components
export const milestoneSchema = {
  id: "string",
  title: "string",
  dueDate: "Date | null",
  status: "'Pending' | 'InProgress' | 'Completed' | 'Blocked'",
  description: "string | null",
};

// --- Component Props ---
// MilestoneTrackerProps {
//   initialMilestones: Array<Milestone>,
//   onMilestonesChange: (milestones: Array<Milestone>) => void,
//   triggerAiAssistance: (context: string, milestone?: Milestone) => void,
// }

export function MilestoneTracker({
  initialMilestones = [],
  onMilestonesChange,
  triggerAiAssistance,
}) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Function to update milestones and notify parent
  const updateMilestones = (newMilestones) => {
    setMilestones(newMilestones);
    if (onMilestonesChange) {
      onMilestonesChange(newMilestones);
    }
  };

  // --- Actions ---
  const addMilestone = () => {
    setEditingMilestone({
      id: crypto.randomUUID(),
      title: '',
      dueDate: null,
      status: 'Pending',
      description: '',
    });
    setIsEditDialogOpen(true);
  };

  const editMilestone = (milestone) => {
    setEditingMilestone({ ...milestone });
    setIsEditDialogOpen(true);
  };

  const deleteMilestone = (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      updateMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const markComplete = (id) => {
    updateMilestones(milestones.map(m => 
      m.id === id ? { ...m, status: 'Completed' } : m
    ));
  };

  const handleSaveMilestone = () => {
    if (!editingMilestone || !editingMilestone.title) {
      alert('Please provide a milestone title');
      return;
    }

    const updatedMilestones = [...milestones];
    const existingIndex = updatedMilestones.findIndex(m => m.id === editingMilestone.id);
    
    if (existingIndex >= 0) {
      updatedMilestones[existingIndex] = editingMilestone;
    } else {
      updatedMilestones.push(editingMilestone);
    }

    updateMilestones(updatedMilestones);
    setIsEditDialogOpen(false);
    setEditingMilestone(null);
  };

  const handleAiSuggestSubtasks = (milestone) => {
    if (triggerAiAssistance) {
      triggerAiAssistance(
        `Suggest sub-tasks or next steps for the milestone: "${milestone.title}" (Due: ${formatDate(milestone.dueDate)}, Status: ${milestone.status})`, 
        milestone
      );
    }
  };

  const handleAiCheckTimeline = (milestone) => {
    if (triggerAiAssistance) {
      triggerAiAssistance(
        `Analyze potential risks or timeline issues for the milestone: "${milestone.title}" based on its due date (${formatDate(milestone.dueDate)}) and current status (${milestone.status}). Consider typical IND timelines.`, 
        milestone
      );
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    let color = 'text-gray-600';
    if (status === 'Completed') color = 'text-green-600';
    if (status === 'Blocked') color = 'text-red-600';
    if (status === 'InProgress') color = 'text-blue-600';
    return color;
  };

  // --- Render ---
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Milestone Tracker</CardTitle>
          <CardDescription>Define and track key milestones for this IND stage.</CardDescription>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={addMilestone}>Add Milestone</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingMilestone?.id ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
              <DialogDescription>
                {editingMilestone?.id 
                  ? 'Update the details below.' 
                  : 'Fill in the details for the new milestone.'}
              </DialogDescription>
            </DialogHeader>
            {/* Milestone Editor Form */}
            {editingMilestone && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Milestone Title</Label>
                  <Input 
                    id="title" 
                    value={editingMilestone.title || ''} 
                    onChange={(e) => setEditingMilestone({...editingMilestone, title: e.target.value})}
                    placeholder="e.g., Finalize Pre-IND Meeting Request"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={editingMilestone.dueDate ? new Date(editingMilestone.dueDate).toISOString().split('T')[0] : ''} 
                    onChange={(e) => setEditingMilestone({
                      ...editingMilestone, 
                      dueDate: e.target.value ? new Date(e.target.value) : null
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={editingMilestone.status || 'Pending'} 
                    onChange={(e) => setEditingMilestone({...editingMilestone, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={editingMilestone.description || ''} 
                    onChange={(e) => setEditingMilestone({...editingMilestone, description: e.target.value})}
                    placeholder="Add details or notes..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveMilestone}>Save Milestone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No milestones created yet</p>
            <Button onClick={addMilestone}>Add Your First Milestone</Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milestones.length > 0 ? (
                  milestones.map((milestone) => (
                    <ContextMenuTrigger key={milestone.id} asChild>
                      <TableRow
                        onClick={() => setSelectedMilestone(milestone)}
                      >
                        <TableCell>
                          <span className="font-medium">{milestone.title}</span>
                        </TableCell>
                        <TableCell>
                          {formatDate(milestone.dueDate)}
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => editMilestone(milestone)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markComplete(milestone.id)}
                              className="h-8 w-8 p-0"
                              disabled={milestone.status === 'Completed'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteMilestone(milestone.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No milestones added.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Context Menu for Additional Actions */}
            <ContextMenu>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => selectedMilestone && editMilestone(selectedMilestone)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </ContextMenuItem>
                <ContextMenuItem onClick={() => selectedMilestone && markComplete(selectedMilestone.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => selectedMilestone && handleAiSuggestSubtasks(selectedMilestone)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  AI: Suggest Related Tasks
                </ContextMenuItem>
                <ContextMenuItem onClick={() => selectedMilestone && handleAiCheckTimeline(selectedMilestone)}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  AI: Analyze Timeline
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={() => selectedMilestone && deleteMilestone(selectedMilestone.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
}