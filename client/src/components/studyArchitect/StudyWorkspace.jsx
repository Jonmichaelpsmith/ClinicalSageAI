import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, History, Check, Clock } from 'lucide-react';

export default function StudyWorkspace({ session }) {
  const [activeTab, setActiveTab] = useState('collaborators');
  
  // Sample data - in a real implementation, this would come from an API
  const collaborators = [
    { id: 1, name: 'Dr. Sarah Johnson', role: 'Principal Investigator', status: 'online', lastActive: '2 minutes ago' },
    { id: 2, name: 'Dr. Michael Chen', role: 'Medical Monitor', status: 'offline', lastActive: '3 hours ago' },
    { id: 3, name: 'Dr. Lisa Rodriguez', role: 'Biostatistician', status: 'offline', lastActive: '1 day ago' }
  ];
  
  const comments = [
    { id: 1, user: 'Dr. Sarah Johnson', text: 'We should consider adding a 3rd dose group based on the PK data.', timestamp: '2023-12-01 14:23', section: 'Study Design' },
    { id: 2, user: 'Dr. Michael Chen', text: 'The inclusion criteria for HbA1c might be too restrictive. I suggest widening the range.', timestamp: '2023-12-01 15:47', section: 'Study Population' },
    { id: 3, user: 'Dr. Lisa Rodriguez', text: 'Sample size calculation looks good, but we should account for a higher dropout rate based on similar studies.', timestamp: '2023-12-02 09:15', section: 'Statistics' }
  ];
  
  const activityHistory = [
    { id: 1, user: 'Dr. Sarah Johnson', action: 'updated Study Objectives', timestamp: '2023-12-02 10:30' },
    { id: 2, user: 'Dr. Michael Chen', action: 'commented on Study Population', timestamp: '2023-12-01 15:47' },
    { id: 3, user: 'Dr. Lisa Rodriguez', action: 'generated Statistical Analysis section with AI', timestamp: '2023-12-01 11:22' },
    { id: 4, user: 'System', action: 'saved Study Design Report v1.2', timestamp: '2023-12-01 08:45' }
  ];
  
  const tasks = [
    { id: 1, title: 'Review inclusion/exclusion criteria', assignee: 'Dr. Michael Chen', dueDate: '2023-12-10', status: 'in-progress' },
    { id: 2, title: 'Finalize primary endpoint', assignee: 'Dr. Sarah Johnson', dueDate: '2023-12-15', status: 'not-started' },
    { id: 3, title: 'Complete statistical analysis plan', assignee: 'Dr. Lisa Rodriguez', dueDate: '2023-12-20', status: 'not-started' },
    { id: 4, title: 'Draft safety monitoring plan', assignee: 'Dr. Michael Chen', dueDate: '2023-12-05', status: 'completed' }
  ];
  
  const inviteCollaborator = () => {
    alert('Invitation feature would be implemented here');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Collaborators</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Activity History</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="collaborators">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Team Members</h3>
                <Button size="sm" onClick={inviteCollaborator}>
                  Invite Collaborator
                </Button>
              </div>
              
              <div className="space-y-3">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id} className="border rounded-md p-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium">{collaborator.name}</p>
                        <p className="text-sm text-gray-500">{collaborator.role}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last active: {collaborator.lastActive}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Discussion Thread</h3>
              </div>
              
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium">{comment.user}</span>
                        <span className="text-sm text-gray-500 ml-2">on {comment.section}</span>
                      </div>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex">
                <textarea 
                  className="w-full border rounded-md p-2 mr-2"
                  placeholder="Add a comment..."
                  rows={2}
                ></textarea>
                <Button>Post</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="font-semibold">Recent Activity</h3>
              
              <div className="relative border-l-2 border-gray-200 ml-3 pl-6 space-y-4">
                {activityHistory.map(activity => (
                  <div key={activity.id} className="relative">
                    <div className="absolute -left-9 mt-1 w-4 h-4 rounded-full bg-blue-600"></div>
                    <div className="pb-4">
                      <p>
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-800"> {activity.action}</span>
                      </p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Task List</h3>
                <Button size="sm">
                  Add Task
                </Button>
              </div>
              
              <div className="space-y-3">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`border rounded-md p-3 ${task.status === 'completed' ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <input 
                        type="checkbox" 
                        className="mt-1 mr-3"
                        checked={task.status === 'completed'}
                        readOnly
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-500">Assigned to: {task.assignee}</span>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}