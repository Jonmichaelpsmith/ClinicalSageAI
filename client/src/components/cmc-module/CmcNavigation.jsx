import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Beaker,
  FlaskConical,
  Factory,
  FileCheck,
  BarChart,
  Settings,
  FileText,
  ArrowRightCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CmcNavigation({ currentBlueprintId }) {
  const [location] = useLocation();
  
  const modules = [
    {
      id: 'blueprint',
      name: 'Blueprint Generator',
      href: `/cmc/blueprints/${currentBlueprintId || 'new'}`,
      icon: Beaker,
      description: 'Create and manage CMC blueprints'
    },
    {
      id: 'impact',
      name: 'Change Impact Simulator',
      href: `/cmc/impact-simulator/${currentBlueprintId}`,
      icon: FlaskConical,
      description: 'Simulate impact of manufacturing changes'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing Tuner',
      href: `/cmc/manufacturing/${currentBlueprintId}`,
      icon: Factory,
      description: 'Optimize manufacturing parameters'
    },
    {
      id: 'compliance',
      name: 'Compliance Tools',
      href: `/cmc/compliance/${currentBlueprintId}`,
      icon: FileCheck,
      description: 'Verify regulatory compliance'
    },
    {
      id: 'analytics',
      name: 'CMC Analytics',
      href: `/cmc/analytics/${currentBlueprintId}`,
      icon: BarChart,
      description: 'Track and visualize CMC metrics'
    }
  ];
  
  const integrations = [
    {
      name: 'IND Wizard™',
      href: '/ind-wizard/cmc',
      description: 'IND submission preparation',
      buttonText: 'Go to IND Wizard'
    },
    {
      name: 'TrialSage Vault™',
      href: '/vault/cmc-documents',
      description: 'Document management',
      buttonText: 'View in Vault'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">CMC Intelligence™</h2>
        <p className="text-muted-foreground">
          Chemistry, Manufacturing, and Controls tools and resources
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((module) => {
          const isActive = location.startsWith(module.href);
          
          return (
            <Link key={module.id} href={module.href}>
              <a
                className={cn(
                  "flex h-full",
                  isActive && "cursor-default"
                )}
              >
                <div className={cn(
                  "flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow w-full overflow-hidden",
                  isActive && "ring-2 ring-primary"
                )}>
                  <div className="flex items-center gap-2 p-6 pb-3">
                    <module.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{module.name}</h3>
                  </div>
                  <div className="p-6 pt-0 text-sm text-muted-foreground">
                    {module.description}
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
      
      <Separator className="my-6" />
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Module Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                <Button asChild>
                  <Link href={integration.href}>
                    <ArrowRightCircle className="h-4 w-4 mr-2" />
                    {integration.buttonText}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}