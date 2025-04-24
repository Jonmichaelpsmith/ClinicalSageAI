import React, { useState, useEffect } from 'react';
import { Search, FileText, Info, Bookmark, X, CheckCircle, Calendar, ClipboardList, BrainCircuit } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'wouter';

const ICHSpecialistSidebar = ({ defaultModule = "general" }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("answer");
  const [currentModule, setCurrentModule] = useState(defaultModule);
  const [location] = useLocation();
  const { toast } = useToast();

  // Detect current module based on URL path
  useEffect(() => {
    // Map URL paths to module names
    if (location.includes('protocol-review')) {
      setCurrentModule('protocol');
    } else if (location.includes('study-planner')) {
      setCurrentModule('protocol');
    } else if (location.includes('document-management')) {
      setCurrentModule('document');
    } else if (location.includes('cmc-module')) {
      setCurrentModule('cmc');
    } else if (location.includes('csr-intelligence')) {
      setCurrentModule('csr_review');
    } else if (location.includes('ind/wizard')) {
      setCurrentModule('ind');
    } else {
      setCurrentModule('general');
    }
  }, [location]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setAnswer("");
    setSources([]);
    setTasks([]);
    setActiveTab("answer");
    
    try {
      const response = await fetch('/api/ich-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: query,
          module: currentModule 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get a response from the ICH agent');
      }
      
      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
      setTasks(data.tasks || []);
      
      // If tasks are available, highlight their presence
      if (data.tasks && data.tasks.length > 0) {
        setTimeout(() => {
          document.getElementById('tasks-badge')?.classList.add('animate-pulse');
          setTimeout(() => {
            document.getElementById('tasks-badge')?.classList.remove('animate-pulse');
          }, 2000);
        }, 500);
      }
      
      // Save to history
      const newEntry = {
        id: Date.now(),
        question: query,
        answer: data.answer,
        sources: data.sources || [],
        tasks: data.tasks || [],
        module: currentModule
      };
      
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 items
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHistoryClick = (item) => {
    setQuery(item.question);
    setAnswer(item.answer);
    setSources(item.sources);
    setTasks(item.tasks || []);
    setActiveTab("answer");
  };
  
  const clearCurrentQuery = () => {
    setQuery("");
    setAnswer("");
    setSources([]);
    setTasks([]);
  };
  
  const handleTaskAction = (task) => {
    // Here you would implement the specific action for the task
    // For now, we'll just show a notification
    toast({
      title: "Task Selected",
      description: `Starting task: ${task.title}`,
    });
  };

  const getModuleIcon = (module) => {
    switch(module) {
      case 'protocol':
        return <ClipboardList className="h-4 w-4 mr-2 text-blue-500" />;
      case 'csr_review':
        return <FileText className="h-4 w-4 mr-2 text-green-500" />;
      case 'cmc':
        return <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />;
      case 'ind':
        return <Calendar className="h-4 w-4 mr-2 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          title="ICH Specialist - Regulatory guidance and project tasks"
        >
          <Info size={18} />
          <span>ICH Co-Pilot</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            ICH Co-Pilot {currentModule !== 'general' && `(${currentModule})`}
          </SheetTitle>
          <SheetDescription>
            Your regulatory guidance assistant and project manager
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <form onSubmit={handleQuerySubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder={`Ask about ${currentModule} guidelines...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10"
              />
              {query && (
                <button 
                  type="button"
                  onClick={clearCurrentQuery}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  <span>Loading</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Search size={16} />
                  <span>Ask</span>
                </span>
              )}
            </Button>
          </form>
        </div>
        
        {answer && (
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="answer">Answer</TabsTrigger>
                <TabsTrigger value="tasks" className="relative">
                  Tasks
                  {tasks.length > 0 && (
                    <span 
                      id="tasks-badge"
                      className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      {tasks.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="answer" className="pt-4">
                <div className="bg-orange-50 p-4 rounded-md">
                  <div className="prose prose-sm max-w-none">
                    {answer.split('\n').map((line, i) => (
                      <p key={i} className={!line.trim() ? 'h-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-orange-100">
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Sources:</h4>
                      <div className="flex flex-wrap gap-2">
                        {sources.map((source, i) => (
                          <Badge key={i} variant="outline" className="bg-white">
                            <FileText size={12} className="mr-1" />
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="pt-4">
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task, i) => (
                      <div key={i} className="bg-white p-3 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getModuleIcon(task.module)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{task.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 mb-2">
                              Module: {task.module}
                            </p>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="text-xs h-7" 
                              onClick={() => handleTaskAction(task)}
                            >
                              Start Task
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-500">No tasks available for this query</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Recent Questions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setHistory([])}
                className="h-auto py-1 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="p-2 rounded-md hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center">
                      {getModuleIcon(item.module)}
                      <p className="text-sm font-medium truncate flex-1">{item.question}</p>
                      {item.tasks?.length > 0 && (
                        <Badge variant="outline" className="ml-2 bg-orange-100 text-[10px]">
                          {item.tasks.length} {item.tasks.length === 1 ? 'task' : 'tasks'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate pl-6">{item.answer.substring(0, 60)}...</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        <SheetFooter className="mt-6 flex flex-col sm:flex-row gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" disabled className="flex items-center gap-1">
                  <Bookmark size={16} />
                  Save to Favorites
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ICHSpecialistSidebar;