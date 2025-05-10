/**
 * Wizard Demo Page
 * 
 * Showcase of TrialSage IND Wizard 3.1 with Executive Insights features
 * for landing page visitors without requiring authentication
 */
import React, { useState } from 'react';
import IndWizardLayout from '../layout/IndWizardLayout';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, LightbulbIcon, TrendingUp, Gauge } from 'lucide-react';

export default function WizardDemoPage() {
  const [currentTab, setCurrentTab] = useState('overview');
  
  return (
    <div className="min-h-screen">
      {/* Top presentation section */}
      <section className="bg-gradient-to-br from-regulatory-900 via-regulatory-800 to-black py-16 px-4 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">TrialSage™ IND Wizard 3.1</h1>
          <h2 className="text-2xl text-regulatory-200 mb-8">Executive Insights Edition</h2>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-lg mb-6">
                Revolutionize your regulatory documents preparation with our AI-powered IND Wizard.
                The 3.1 Executive Insights Edition provides unprecedented visibility into module-level 
                readiness with trend detection and intelligent recommendation.
              </p>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<TrendingUp className="text-emerald-400" />}
                  title="Trend-Aware KPI Visualization"
                  description="Visualize 7-day trend data with animated delta indicators"
                />
                
                <FeatureItem 
                  icon={<Check className="text-emerald-400" />}
                  title="Explicit Commit/Review Workflow"
                  description="Deliberate document approval process with AI-powered suggestions"
                />
                
                <FeatureItem 
                  icon={<Gauge className="text-emerald-400" />}
                  title="Module-Level Readiness Tracking"
                  description="Granular visibility into Modules 1-5 with readiness percentages"
                />
              </div>
              
              <div className="mt-8">
                <Button asChild size="lg" className="bg-regulatory-600 hover:bg-regulatory-500">
                  <Link href="/ind/wizard-v2">
                    Launch Full Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-regulatory-700 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Live Interactive Demo</h3>
              <div className="aspect-video rounded-md overflow-hidden bg-black/50 relative">
                {/* Placeholder for demo video or interactive preview */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <IndWizardLayout />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features tabs section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="overview">Key Features</TabsTrigger>
              <TabsTrigger value="modules">Module Tracking</TabsTrigger>
              <TabsTrigger value="workflow">Executive Workflow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Executive-Focused Improvements</CardTitle>
                  <CardDescription>
                    Wizard 3.1 brings significant enhancements focused on executive visibility and regulatory compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-2">
                        <Check className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">Regulatory-Purple Theme with Auto Dark Mode</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Professional theme adapts automatically to OS preferences while maintaining 21 CFR Part 11 compliance
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-2">
                        <Check className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">KPI Ribbon with Animated CountUp</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sticky KPI ribbon provides at-a-glance metrics with trend visualization and smooth animations
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-2">
                        <Check className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium">AI-Assisted Document Commitment</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Explicit "Commit" or "Review" step after AI preview ensures nothing enters the system without verification
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="modules">
              <Card>
                <CardHeader>
                  <CardTitle>Module-Level Readiness Tracking</CardTitle>
                  <CardDescription>
                    Granular tracking of the standard five CTD modules gives executives unprecedented visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ModuleProgressItem 
                      name="Module 1: Administrative"
                      percentage={85}
                      description="Contains regional administrative information including forms and cover letters"
                    />
                    <ModuleProgressItem 
                      name="Module 2: Summaries"
                      percentage={72}
                      description="Overview and critical assessment of quality, nonclinical, and clinical information"
                    />
                    <ModuleProgressItem 
                      name="Module 3: Quality"
                      percentage={53}
                      description="Chemical, pharmaceutical and biological information for both drug substance and product"
                    />
                    <ModuleProgressItem 
                      name="Module 4: Nonclinical"
                      percentage={68}
                      description="Study reports of all relevant nonclinical pharmacology, pharmacokinetics, and toxicology studies"
                    />
                    <ModuleProgressItem 
                      name="Module 5: Clinical"
                      percentage={42}
                      description="Study reports of all clinical trials as well as information regarding human study ethics"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="workflow">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Workflow Optimization</CardTitle>
                  <CardDescription>
                    Streamlined process built specifically for executive oversight and decision-making
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-regulatory-100 dark:bg-regulatory-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-regulatory-700 dark:text-regulatory-300">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">One-Click Module Status</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Access detailed module-level readiness with a single click on the ready percentage KPI chip,
                          showing real-time progress for all five CTD modules.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-regulatory-100 dark:bg-regulatory-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-regulatory-700 dark:text-regulatory-300">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Explicit Decision Points</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          No more silent uploads - each document requires explicit commitment or review decision,
                          creating proper 21 CFR Part 11 compliant approval trail.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-regulatory-100 dark:bg-regulatory-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-regulatory-700 dark:text-regulatory-300">3</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Trend-Aware Metrics</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          All KPIs display 7-day trend data with visual indicators, allowing executives
                          to quickly assess progress and identify potential issues before they impact timelines.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="bg-gradient-to-br from-regulatory-50 to-white dark:from-slate-800 dark:to-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your regulatory document workflow?</h2>
          <p className="text-xl mb-8 text-gray-700 dark:text-gray-300">
            Experience the power of Wizard 3.1 with Executive Insights and elevate your regulatory submission process.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-regulatory-600 hover:bg-regulatory-500">
              <Link href="/ind/wizard-v2">
                Launch Full Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="mailto:sales@trialsage.ai">Contact Sales</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper components
const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-start">
    <div className="mt-1 mr-3">{icon}</div>
    <div>
      <h3 className="font-semibold text-regulatory-200">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
);

const ModuleProgressItem = ({ name, percentage, description }) => {
  let colorClass = "bg-red-500 dark:bg-red-700";
  if (percentage >= 80) colorClass = "bg-emerald-500 dark:bg-emerald-700";
  else if (percentage >= 50) colorClass = "bg-amber-500 dark:bg-amber-700";
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">{name}</span>
        <span className={
          percentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : 
          percentage >= 50 ? "text-amber-600 dark:text-amber-400" : 
          "text-red-600 dark:text-red-400"
        }>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
};