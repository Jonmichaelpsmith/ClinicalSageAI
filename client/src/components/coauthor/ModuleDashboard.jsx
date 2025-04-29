// client/src/components/coauthor/ModuleDashboard.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

const modules = [
  { title: 'Module 1: Administrative', progress: 1.0, risk: 'Low' },
  { title: 'Module 2: CTD Summaries', progress: 0.75, risk: 'Medium' },
  { title: 'Module 3: Quality', progress: 0.5, risk: 'High' },
  { title: 'Module 4: Nonclinical', progress: 0.2, risk: 'High' },
  { title: 'Module 5: Clinical Study Reports', progress: 0.0, risk: 'High' },
];

export default function ModuleDashboard({ onSelectModule }) {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">CTD Module Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => (
          <Card key={m.title} className="relative">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">{m.title}</h3>
              <Progress value={m.progress * 100} className="my-2" />
              <div className="flex items-center justify-between">
                <span>{Math.round(m.progress * 100)}% Complete</span>
                <Badge
                  variant={
                    m.risk === 'High'
                      ? 'destructive'
                      : m.risk === 'Medium'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {m.risk}
                </Badge>
              </div>
            </CardContent>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 bottom-2"
              onClick={() => onSelectModule(m.title)}
            >
              Explore <ArrowRight size={16} className="ml-1" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}