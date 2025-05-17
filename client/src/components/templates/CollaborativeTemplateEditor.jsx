import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Users,
  CheckSquare, 
  Flag,
  Send,
  PlusCircle,
  Calendar,
  ClipboardList,
  User,
  Loader2,
  CheckCircle2,
  Save,
  Download,
  RotateCw,
  Lock
} from 'lucide-react';

/**
 * Collaborative Template Editor
 * 
 * This component allows multiple users to collaborate on document templates in real-time.
 * It integrates the template editing functionality with collaboration features like
 * messaging, task management, and approval workflows.
 */
const CollaborativeTemplateEditor = ({ templateId, projectId = 'default-project', moduleName = 'templates' }) => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [editedContent, setEditedContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock current user for demonstration
  const currentUser = {
    id: 'user-1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    role: 'Regulatory Affairs'
  };
  
  // Fetch template data
  const {
    data: template,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useQuery({
    queryKey: ['/api/templates', templateId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/templates/${templateId}`);
        return response.json();
      } catch (error) {
        // For demo purposes, return mock data if API not yet available
        console.warn('Using mock template data - API not available');
        return {
          id: templateId,
          title: 'Clinical Evaluation Report Template',
          module: 'module2',
          sectionId: '2.5',
          description: 'Standard template for clinical evaluation reports with regulatory compliance sections.',
          guidance: 'Follow ICH guidelines for content organization. Include benefit-risk evaluation and conclusions.',
          required: true,
          status: 'active',
          content: '# Clinical Evaluation Report\n\n## 1. Introduction\n\n[Insert product overview and purpose of evaluation]\n\n## 2. Clinical Background\n\n[Describe relevant clinical context]\n\n## 3. Device Description\n\n[Provide technical details of the device]\n\n## 4. Intended Use/Purpose\n\n[Clearly state the intended clinical use]\n\n## 5. Clinical Evaluation Strategy\n\n[Outline approach to data collection and analysis]\n\n## 6. Clinical Data Analysis\n\n[Present and analyze clinical evidence]\n\n## 7. Post-Market Surveillance\n\n[Describe ongoing monitoring approach]\n\n## 8. Risk Assessment\n\n[Evaluate clinical risks and mitigations]\n\n## 9. Conclusions\n\n[Summarize clinical evaluation findings]',
          sections: [
            { id: '2.5.1', title: 'Product Development Rationale', required: true },
            { id: '2.5.2', title: 'Overview of Biopharmaceutics', required: true },
            { id: '2.5.3', title: 'Overview of Clinical Pharmacology', required: true },
            { id: '2.5.4', title: 'Overview of Efficacy', required: true },
            { id: '2.5.5', title: 'Overview of Safety', required: true },
            { id: '2.5.6', title: 'Benefits and Risks Conclusions', required: true },
            { id: '2.5.7', title: 'Literature References', required: true },
          ],
          updatedAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        };
      }
    },
    enabled: !!templateId,
  });
  
  // Fetch collaboration messages
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ['/api/collaboration/messages', projectId, moduleName, templateId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/collaboration/messages?projectId=${projectId}&moduleType=${moduleName}&resourceId=${templateId}`);
        return response.json();
      } catch (error) {
        // For demo purposes, return mock data if API not yet available
        console.warn('Using mock messages data - API not available');
        return [
          {
            id: 'msg-1',
            type: 'system',
            content: `Collaboration started on template: ${templateId}`,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            sender: { id: 'system', name: 'System', avatar: '/system-avatar.png' }
          },
          {
            id: 'msg-2',
            type: 'comment',
            content: "I've updated Section 8 (Risk Assessment) with the new regulatory requirements from ICH Q9(R1).",
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            sender: {
              id: 'user-1',
              name: 'Sarah Johnson',
              avatar: '/avatars/sarah.jpg',
              role: 'Regulatory Affairs'
            }
          },
          {
            id: 'msg-3',
            type: 'comment',
            content: "Thanks for the update. Could you also include references to the Quality Risk Management process?",
            timestamp: new Date(Date.now() - 900000).toISOString(),
            sender: {
              id: 'user-2',
              name: 'Michael Chen',
              avatar: '/avatars/michael.jpg',
              role: 'Quality Assurance'
            }
          },
          {
            id: 'msg-4',
            type: 'ai-suggestion',
            content: "Consider adding a subsection on benefit-risk analysis methodology to comply with latest FDA guidance on benefit-risk determinations for medical devices.",
            timestamp: new Date(Date.now() - 600000).toISOString(),
            sender: { id: 'ai', name: 'TrialSage AI', avatar: '/ai-assistant.png' }
          }
        ];
      }
    },
  });
  
  // Fetch tasks
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
  } = useQuery({
    queryKey: ['/api/collaboration/tasks', projectId, moduleName, templateId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/collaboration/tasks?projectId=${projectId}&moduleType=${moduleName}&resourceId=${templateId}`);
        return response.json();
      } catch (error) {
        // For demo purposes, return mock data if API not yet available
        console.warn('Using mock tasks data - API not available');
        return [
          {
            id: 'task-1',
            title: 'Update risk assessment section',
            description: 'Include new ICH Q9(R1) requirements in the risk assessment section.',
            assignee: {
              id: 'user-1',
              name: 'Sarah Johnson',
            },
            dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
            priority: 'high',
            status: 'completed'
          },
          {
            id: 'task-2',
            title: 'Add Quality Risk Management references',
            description: 'Include references to Quality Risk Management process in methodology section.',
            assignee: {
              id: 'user-1',
              name: 'Sarah Johnson',
            },
            dueDate: new Date(Date.now() + 172800000).toISOString(), // +2 days
            priority: 'medium',
            status: 'in-progress'
          },
          {
            id: 'task-3',
            title: 'Review clinical data analysis section',
            description: 'Ensure clinical data analysis section meets latest regulatory requirements.',
            assignee: {
              id: 'user-2',
              name: 'Michael Chen',
            },
            dueDate: new Date(Date.now() + 259200000).toISOString(), // +3 days
            priority: 'medium',
            status: 'pending'
          }
        ];
      }
    },
  });
  
  // Fetch approvals
  const {
    data: approvals = [],
    isLoading: isLoadingApprovals,
  } = useQuery({
    queryKey: ['/api/collaboration/approvals', projectId, moduleName, templateId],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/collaboration/approvals?projectId=${projectId}&moduleType=${moduleName}&resourceId=${templateId}`);
        return response.json();
      } catch (error) {
        // For demo purposes, return mock data if API not available
        console.warn('Using mock approvals data - API not available');
        return [
          {
            id: 'approval-1',
            title: 'Review Updated Risk Assessment',
            description: 'Approval request for the updated risk assessment section with ICH Q9(R1) requirements.',
            status: 'pending',
            requestedBy: {
              id: 'user-1',
              name: 'Sarah Johnson',
            },
            requestedAt: new Date(Date.now() - 3600000).toISOString(),
            approvers: [
              {
                id: 'user-2',
                name: 'Michael Chen',
                status: 'pending'
              },
              {
                id: 'user-3',
                name: 'Jennifer Lopez',
                status: 'pending'
              }
            ]
          }
        ];
      }
    },
  });
  
  // Set initial content when template loads
  useEffect(() => {
    if (template?.content) {
      setEditedContent(template.content);
    }
  }, [template]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return apiRequest('POST', '/api/collaboration/messages', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/messages'] });
      setMessage('');
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Message',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });
  
  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest('PUT', `/api/templates/${templateId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/templates', templateId] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      // Add system message about the save
      const messageData = {
        projectId,
        moduleType: moduleName,
        content: `Updated template: ${template?.title || 'Current document'}`,
        sender: currentUser,
        messageType: 'system',
        resourceId: templateId
      };
      
      sendMessageMutation.mutate(messageData);
    },
    onError: (error) => {
      setSaveStatus('error');
      toast({
        title: 'Error Saving Template',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    },
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      return apiRequest('POST', '/api/collaboration/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/tasks'] });
      toast({
        title: 'Task Created',
        description: 'New task has been created successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Task',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    },
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }) => {
      return apiRequest('PATCH', `/api/collaboration/tasks/${taskId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Task',
        description: error.message || 'Failed to update task',
        variant: 'destructive',
      });
    },
  });
  
  // Create approval mutation
  const createApprovalMutation = useMutation({
    mutationFn: async (approvalData) => {
      return apiRequest('POST', '/api/collaboration/approvals', approvalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/approvals'] });
      toast({
        title: 'Approval Request Created',
        description: 'Approval request has been sent successfully',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Approval Request',
        description: error.message || 'Failed to create approval request',
        variant: 'destructive',
      });
    },
  });
  
  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    const messageData = {
      projectId,
      moduleType: moduleName,
      content: message,
      sender: currentUser,
      messageType: 'comment',
      resourceId: templateId
    };
    
    sendMessageMutation.mutate(messageData);
  };
  
  // Handle template save
  const handleSaveTemplate = () => {
    setSaveStatus('saving');
    
    updateTemplateMutation.mutate({
      content: editedContent
    });
  };
  
  // Handle task creation
  const handleCreateTask = (taskData) => {
    const newTask = {
      projectId,
      moduleType: moduleName,
      title: taskData.title,
      description: taskData.description,
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      priority: taskData.priority || 'medium',
      creator: currentUser,
      resourceId: templateId
    };
    
    createTaskMutation.mutate(newTask);
  };
  
  // Handle task status update
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    updateTaskMutation.mutate({
      taskId,
      data: {
        status: newStatus,
        updatedBy: currentUser
      }
    });
  };
  
  // Handle approval request
  const handleRequestApproval = (approvalData) => {
    const newApproval = {
      projectId,
      moduleType: moduleName,
      title: approvalData.title,
      description: approvalData.description,
      approvers: approvalData.approvers,
      documentId: templateId,
      requester: currentUser
    };
    
    createApprovalMutation.mutate(newApproval);
  };
  
  // Loading state
  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading template...</span>
      </div>
    );
  }
  
  // Error state
  if (templateError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading template: {templateError.message}</p>
        <Button variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  // Loading button icon based on save status
  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'saved':
        return <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />;
      case 'error':
        return <RotateCw className="mr-2 h-4 w-4" />;
      default:
        return <Save className="mr-2 h-4 w-4" />;
    }
  };
  
  // Save button text based on save status
  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Try Again';
      default:
        return 'Save';
    }
  };
  
  // Helper for timestamp formatting
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-6rem)]">
      {/* Main Editor Area */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl flex items-center">
                {template?.title}
                {template?.required && (
                  <Badge variant="secondary" className="ml-2">Required</Badge>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                <span>{template?.module} • {template?.sectionId}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveTemplate}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
              >
                {getSaveButtonIcon()}
                {getSaveButtonText()}
              </Button>
            </div>
          </CardHeader>
          <Separator />
          
          <CardContent className="p-0 flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="m-2 flex justify-start">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="guidance">Guidance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="flex-1 overflow-hidden px-4 pt-2 pb-4">
                <Textarea 
                  className="h-full min-h-[500px] font-mono resize-none"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Enter template content here..."
                />
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 overflow-auto px-6 py-4">
                <div className="prose max-w-none">
                  {editedContent.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index}>{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index}>{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index}>{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={index}>{line.substring(2)}</li>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index}>{line}</p>;
                    }
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="guidance" className="flex-1 overflow-auto px-6 py-4">
                <div className="prose max-w-none">
                  <h2>Guidance for {template?.title}</h2>
                  <p>{template?.guidance || 'No guidance provided for this template.'}</p>
                  
                  {template?.sections?.length > 0 && (
                    <>
                      <h3>Required Sections</h3>
                      <ul>
                        {template.sections.map((section) => (
                          <li key={section.id}>
                            <strong>{section.id}: {section.title}</strong>
                            {section.required && <span className="text-red-500 ml-2">(Required)</span>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  <h3>Regulatory References</h3>
                  <ul>
                    <li>ICH M4: Common Technical Document</li>
                    <li>ISO 14155: Clinical investigation of medical devices for human subjects</li>
                    <li>FDA Guidance for Industry: Providing Clinical Evidence of Effectiveness</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Collaboration Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-lg">Collaboration</CardTitle>
          </CardHeader>
          <Separator />
          
          <Tabs defaultValue="chat" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid grid-cols-4 mx-2 mt-2">
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="approvals">
                <Flag className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Approvals</span>
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Team</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-0">
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="flex flex-col">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                            <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{msg.sender.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(msg.timestamp)}
                              </span>
                            </div>
                            <div
                              className={`rounded-md p-3 mt-1 ${
                                msg.type === 'system'
                                  ? 'bg-muted text-sm'
                                  : msg.type === 'ai-suggestion'
                                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                                  : 'bg-primary/5'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!message.trim() || sendMessageMutation.isPending}>
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            {/* Tasks Tab */}
            <TabsContent value="tasks" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {isLoadingTasks ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No tasks created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm mb-2">In Progress</h3>
                      <div className="space-y-2">
                        {tasks
                          .filter(task => task.status === 'in-progress')
                          .map(task => (
                            <Card key={task.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{task.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{task.assignee?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                >
                                  Complete
                                </Button>
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm mb-2">Pending</h3>
                      <div className="space-y-2">
                        {tasks
                          .filter(task => task.status === 'pending')
                          .map(task => (
                            <Card key={task.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{task.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{task.assignee?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                >
                                  Start
                                </Button>
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm mb-2">Completed</h3>
                      <div className="space-y-2">
                        {tasks
                          .filter(task => task.status === 'completed')
                          .map(task => (
                            <Card key={task.id} className="p-3 bg-muted/50">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{task.title}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{task.assignee?.name}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Task
                </Button>
              </div>
            </TabsContent>
            
            {/* Approvals Tab */}
            <TabsContent value="approvals" className="flex-1 overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4">
                {isLoadingApprovals ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : approvals.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    <p>No approval requests yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm mb-2">Pending Approvals</h3>
                      <div className="space-y-3">
                        {approvals
                          .filter(approval => approval.status === 'pending')
                          .map(approval => (
                            <Card key={approval.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-5 w-5 text-amber-500" />
                                  <span className="font-medium">{approval.title}</span>
                                </div>
                                <Badge>Pending</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                {approval.description}
                              </p>
                              <div className="mt-4">
                                <div className="text-xs font-medium mb-2">Approvers</div>
                                <div className="flex flex-wrap gap-2">
                                  {approval.approvers?.map(approver => (
                                    <div key={approver.id} className="flex items-center gap-1.5 text-xs bg-muted rounded-full px-2 py-1">
                                      <Avatar className="h-4 w-4">
                                        <AvatarFallback>{approver.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <span>{approver.name}</span>
                                      {approver.status === 'approved' ? (
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                      ) : approver.status === 'rejected' ? (
                                        <span className="text-red-500">✕</span>
                                      ) : (
                                        <span className="h-2 w-2 bg-amber-500 rounded-full" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <Button variant="outline" size="sm">
                                  Approve
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Reject
                                </Button>
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm mb-2">Completed Approvals</h3>
                      <div className="space-y-3">
                        {approvals
                          .filter(approval => approval.status === 'approved' || approval.status === 'rejected')
                          .map(approval => (
                            <Card key={approval.id} className="p-4 bg-muted/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {approval.status === 'approved' ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <span className="h-5 w-5 flex items-center justify-center text-red-500">✕</span>
                                  )}
                                  <span className="font-medium">{approval.title}</span>
                                </div>
                                <Badge variant={approval.status === 'approved' ? 'default' : 'destructive'}>
                                  {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">
                                {approval.description}
                              </p>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Request Approval
                </Button>
              </div>
            </TabsContent>
            
            {/* Team Tab */}
            <TabsContent value="team" className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Team Members</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/avatars/sarah.jpg" alt="Sarah Johnson" />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Sarah Johnson</div>
                        <div className="text-sm text-muted-foreground">Regulatory Affairs</div>
                      </div>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/avatars/michael.jpg" alt="Michael Chen" />
                        <AvatarFallback>MC</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Michael Chen</div>
                        <div className="text-sm text-muted-foreground">Quality Assurance</div>
                      </div>
                    </div>
                    <Badge variant="outline">Offline</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/avatars/jennifer.jpg" alt="Jennifer Lopez" />
                        <AvatarFallback>JL</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Jennifer Lopez</div>
                        <div className="text-sm text-muted-foreground">Clinical Affairs</div>
                      </div>
                    </div>
                    <Badge variant="outline">Offline</Badge>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="font-medium text-sm">Activity Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Messages</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Tasks</span>
                    <span className="font-medium">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Approvals</span>
                    <span className="font-medium">{approvals.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Template Version</span>
                    <span className="font-medium">1.3</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Last Updated</span>
                    <span className="font-medium">
                      {new Date(template?.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Invite Team Member
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CollaborativeTemplateEditor;