
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageContainer, HeaderSection, ContentSection, CardGrid, Footer } from "@/components/layout";
import Navbar from "@/components/navbar";

export default function Home() {
  const [progress, setProgress] = React.useState(45);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  return (
    <PageContainer>
      <HeaderSection>
        <Navbar />
      </HeaderSection>
      
      <ContentSection>
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome to your modern dashboard interface.</p>
        </header>
        
        <Tabs defaultValue="overview" className="mb-10">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <CardGrid>
              <Card>
                <CardHeader>
                  <CardTitle>Progress Tracker</CardTitle>
                  <CardDescription>Track your current progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progress: {progress}%</span>
                      <Slider 
                        value={[progress]} 
                        onValueChange={(values) => setProgress(values[0])} 
                        max={100} 
                        step={1}
                        className="max-w-[80%]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Toggle Features</CardTitle>
                  <CardDescription>Enable or disable functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dark Mode</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Notifications</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-save</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Elements</CardTitle>
                  <CardDescription>Try out these components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Popover>
                      <PopoverTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Open Popover</PopoverTrigger>
                      <PopoverContent>
                        <div className="p-2">
                          <h4 className="font-medium text-sm mb-1">Popover Content</h4>
                          <p className="text-sm text-muted-foreground">This is an example popover component showing contextual information.</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)} className="border rounded-md p-2">
                      <CollapsibleTrigger className="flex w-full items-center justify-between p-2 font-medium">
                        <span>Collapsible Section</span>
                        <span>{isCollapsed ? '▶' : '▼'}</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="p-2">
                        <p className="text-sm text-muted-foreground">This content can be collapsed and expanded with a smooth animation effect.</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </CardGrid>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>View your performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">This is a placeholder for analytics content. In a real application, you would display charts and data visualizations here.</p>
                <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground">Chart Placeholder</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Settings panel content would go here. This could include user preferences, theme options, and other configuration settings.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ContentSection>
      
      <Footer>
        <p>© 2023 ModernUI. All rights reserved.</p>
      </Footer>
    </PageContainer>
  );
}
