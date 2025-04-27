import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  Beaker,
  BookOpen,
  Users,
  BookCheck,
  MessageSquare,
  PencilRuler,
  Microscope,
  Settings,
  BarChart2,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LumenAssistantButton } from '@/components/assistant';

const modules = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview of your projects and activities'
  },
  {
    name: 'IND Wizard™',
    href: '/ind-wizard',
    icon: FileText,
    description: 'Complete IND application preparation',
    badge: 'Active'
  },
  {
    name: 'TrialSage Vault™',
    href: '/vault',
    icon: Layers,
    description: 'Document management system',
  },
  {
    name: 'CMC Intelligence™',
    href: '/cmc-module',
    icon: Beaker,
    description: 'Chemistry, Manufacturing & Controls',
  },
  {
    name: 'Study Architect™',
    href: '/study-architect',
    icon: BookOpen,
    description: 'Protocol and study design',
  },
  {
    name: 'CSR Intelligence™',
    href: '/csr-intelligence',
    icon: Microscope,
    description: 'Clinical Study Report building',
  },
  {
    name: 'ICH Wiz™',
    href: '/ich-wiz',
    icon: BookCheck,
    description: 'Digital Compliance Coach',
  },
  {
    name: 'Analytics Module',
    href: '/analytics',
    icon: BarChart2,
    description: 'Business intelligence dashboards',
  }
];

export default function MainNavigation({ showLabels = true }) {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn(
      "bg-white h-screen border-r transition-all duration-300 flex flex-col",
      isExpanded ? "w-64" : "w-16"
    )}>
      <div className="p-4 border-b flex items-center justify-between">
        <div className={cn("flex items-center", !isExpanded && "justify-center w-full")}>
          {isExpanded ? (
            <span className="font-bold text-lg">TrialSage™</span>
          ) : (
            <span className="font-bold text-lg">TS</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(!isExpanded && "hidden")}
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
          )}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {modules.map((module) => {
            const isActive = location.startsWith(module.href);
            return (
              <Link
                key={module.name}
                href={module.href}
                className="group"
              >
                <a
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <module.icon className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {isExpanded && (
                    <span className="ml-3">{module.name}</span>
                  )}
                  {isExpanded && module.badge && (
                    <Badge variant="outline" className="ml-auto py-0.5 text-xs">
                      {module.badge}
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className={cn(
        "p-4 border-t mt-auto",
        !isExpanded && "flex justify-center"
      )}>
        {isExpanded ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Concept2Cures</p>
                <p className="text-xs text-muted-foreground">Enterprise</p>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <LumenAssistantButton variant="outline" size="sm" tooltip="Ask LUMEN AI" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <LumenAssistantButton variant="outline" size="sm" tooltip="Ask LUMEN AI" />
          </div>
        )}
      </div>
    </div>
  );
}