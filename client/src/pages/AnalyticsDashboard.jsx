import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  BarChart3,
  ClipboardList,
  Clock,
  FileText,
  PieChart as PieChartIcon,
  User,
  Users,
  AlertTriangle,
  Check,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiRequest } from '@/lib/queryClient';

// Color schemes for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const SECTION_COLORS = {
  m1: '#3f51b5',
  m2: '#2196f3',
  m3: '#009688',
  m4: '#ff9800',
  m5: '#f44336'
};

/**
 * Analytics Dashboard
 * 
 * Main component for analytics visualizations, with tabs for different views:
 * - Overview: Key metrics and top-level insights
 * - Submission: Detailed metrics for a specific submission
 * - User: Productivity and activity metrics
 * - Regulatory: FDA submission and acknowledgment metrics
 * - System: Platform-wide metrics and trends
 */
export default function AnalyticsDashboard() {
  const { submissionId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <DashboardLayout title="Analytics Dashboard">
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity size={16} />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="submission" className="flex items-center gap-2">
              <FileText size={16} />
              <span>Submission</span>
            </TabsTrigger>
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User size={16} />
              <span>User</span>
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="flex items-center gap-2">
              <ClipboardList size={16} />
              <span>Regulatory</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span>System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab submissionId={submissionId} />
          </TabsContent>

          <TabsContent value="submission">
            <SubmissionTab submissionId={submissionId} />
          </TabsContent>

          <TabsContent value="user">
            <UserTab />
          </TabsContent>

          <TabsContent value="regulatory">
            <RegulatoryTab />
          </TabsContent>

          <TabsContent value="system">
            <SystemTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/**
 * Overview Tab Component
 * 
 * Displays summary metrics across all IND submission activities:
 * - Submission completion status
 * - Recent activity
 * - Content quality metrics
 * - User productivity
 */
function OverviewTab({ submissionId }) {
  // If a specific submission is selected, show submission overview
  if (submissionId) {
    return <SubmissionOverview submissionId={submissionId} />;
  }

  // Get summary analytics (across all submissions)
  const { data: systemAnalytics, isLoading: systemLoading } = useQuery({
    queryKey: ['/api/analytics/system'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/system');
      return await response.json();
    },
    enabled: true
  });

  // Get user analytics (for the current user)
  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ['/api/analytics/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/me');
      return await response.json();
    },
    enabled: true
  });

  if (systemLoading || userLoading) {
    return <DashboardSkeleton />;
  }

  if (!systemAnalytics || !userAnalytics) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load analytics data. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  // Format data for charts
  const submissionStatusData = [
    { name: 'Draft', value: systemAnalytics.submissions.filter(s => s.submission_status === 'draft').length },
    { name: 'In Review', value: systemAnalytics.submissions.filter(s => s.submission_status === 'in_review').length },
    { name: 'Submitted', value: systemAnalytics.submissions.filter(s => s.submission_status === 'submitted').length },
    { name: 'Approved', value: systemAnalytics.submissions.filter(s => s.submission_status === 'approved').length }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Submission Metrics */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submission Status
          </CardTitle>
          <CardDescription>Overall status of all submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {submissionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} submissions`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>Total: {systemAnalytics.summary.total_submissions}</div>
          <div>Last {systemAnalytics.summary.period_days} days</div>
        </CardFooter>
      </Card>

      {/* Activity Metrics */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Activity
          </CardTitle>
          <CardDescription>Activity over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={systemAnalytics.usage}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="active_users" stroke="#8884d8" name="Active Users" />
                <Line type="monotone" dataKey="active_submissions" stroke="#82ca9d" name="Active Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>Peak Users: {systemAnalytics.summary.total_active_users}</div>
          <div>Total Submissions: {systemAnalytics.summary.total_submissions}</div>
        </CardFooter>
      </Card>

      {/* Your Activity */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Activity
          </CardTitle>
          <CardDescription>Your recent productivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userAnalytics.productivity?.slice(0, 7)?.map(p => ({
                  date: p.date,
                  blocks: (p.blocks_created || 0) + (p.blocks_edited || 0),
                  comments: (p.comments_added || 0) + (p.comments_resolved || 0)
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="blocks" fill="#8884d8" name="Blocks" />
                <Bar dataKey="comments" fill="#82ca9d" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>Active on {userAnalytics.active_days} days</div>
          <div>{userAnalytics.submission_count} submissions</div>
        </CardFooter>
      </Card>

      {/* Recent Submissions */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Submissions
          </CardTitle>
          <CardDescription>Latest submission activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Sponsor</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2"></th>
                </tr>
              </thead>
              <tbody>
                {systemAnalytics.submissions.slice(0, 5).map((submission, index) => (
                  <tr key={submission.id} className={index !== 4 ? "border-b" : ""}>
                    <td className="py-2">{submission.title || 'Untitled Submission'}</td>
                    <td className="py-2">{submission.sponsor_name}</td>
                    <td className="py-2">
                      <Badge className={submission.submission_status === 'submitted' ? 'bg-green-100 text-green-800' : 
                                        submission.submission_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-gray-100 text-gray-800'}>
                        {submission.submission_status}
                      </Badge>
                    </td>
                    <td className="py-2">{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      <Link href={`/analytics/${submission.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Performance */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Regulatory Performance
          </CardTitle>
          <CardDescription>FDA submission metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">ESG Submissions</span>
                <span className="text-sm font-semibold">{systemAnalytics.summary.total_esg_submissions}</span>
              </div>
              <Progress value={
                systemAnalytics.summary.total_submissions > 0 
                  ? (systemAnalytics.summary.total_esg_submissions / systemAnalytics.summary.total_submissions) * 100
                  : 0
              } />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Avg. Time to ACK1</span>
                <span className="text-sm font-semibold">
                  {systemAnalytics.summary.avg_ack1_time 
                    ? `${Math.round(systemAnalytics.summary.avg_ack1_time / 60)} hours` 
                    : 'N/A'}
                </span>
              </div>
              <Progress value={
                systemAnalytics.summary.avg_ack1_time
                  ? Math.min(100, 100 - (systemAnalytics.summary.avg_ack1_time / (24 * 60) * 100))
                  : 0
              } />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Avg. Time to ACK3</span>
                <span className="text-sm font-semibold">
                  {systemAnalytics.summary.avg_ack3_time 
                    ? `${Math.round(systemAnalytics.summary.avg_ack3_time / (24 * 60))} days` 
                    : 'N/A'}
                </span>
              </div>
              <Progress value={
                systemAnalytics.summary.avg_ack3_time
                  ? Math.min(100, 100 - (systemAnalytics.summary.avg_ack3_time / (7 * 24 * 60) * 100))
                  : 0
              } />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            {systemAnalytics.regulatory?.filter(r => r.ack3_date)?.length || 0} complete submissions
          </div>
          <div>
            {systemAnalytics.summary.period_days} day period
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Submission Overview Component
 * 
 * Detailed metrics for a specific submission:
 * - Completion percentage
 * - Section status
 * - Content metrics
 * - User activity
 */
function SubmissionOverview({ submissionId }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/submissions', submissionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/analytics/submissions/${submissionId}`);
      return await response.json();
    },
    enabled: !!submissionId
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!analytics) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load submission analytics. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  // Format data for charts
  const sectionCompleteness = analytics.section_completeness.map(section => ({
    name: section.section_code,
    score: section.completeness_score
  }));

  // Group sections by module
  const moduleCompleteness = {};
  analytics.section_completeness.forEach(section => {
    const moduleCode = section.section_code.split('.')[0];
    if (!moduleCompleteness[moduleCode]) {
      moduleCompleteness[moduleCode] = {
        total: 0,
        score: 0,
        count: 0
      };
    }
    moduleCompleteness[moduleCode].total += 100; // Max score
    moduleCompleteness[moduleCode].score += section.completeness_score;
    moduleCompleteness[moduleCode].count += 1;
  });

  const moduleData = Object.entries(moduleCompleteness).map(([module, data]) => ({
    name: `Module ${module}`,
    value: data.score / data.count,
    color: SECTION_COLORS[`m${module}`] || '#888'
  }));

  // Recent metrics
  const recentMetrics = analytics.metrics.slice(0, 14).reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Completion Overview */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Completion Status
          </CardTitle>
          <CardDescription>Overall submission completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold">
              {Math.round(analytics.completion_percentage)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>

          <div className="space-y-4">
            {Object.entries(moduleCompleteness).map(([module, data]) => (
              <div key={module}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Module {module}</span>
                  <span className="text-sm font-semibold">
                    {Math.round(data.score / data.count)}%
                  </span>
                </div>
                <Progress 
                  value={data.score / data.count} 
                  className="h-2"
                  style={{ backgroundColor: SECTION_COLORS[`m${module}`] + '40' }}
                  indicatorStyle={{ backgroundColor: SECTION_COLORS[`m${module}`] }}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            {analytics.section_completeness.length} sections
          </div>
          <div>
            {analytics.section_completeness.filter(s => s.completeness_score === 100).length} complete
          </div>
        </CardFooter>
      </Card>

      {/* Content Metrics */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Metrics
          </CardTitle>
          <CardDescription>Document statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {analytics.metrics[0]?.blocks_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Blocks</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {analytics.metrics[0]?.pages_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pages</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {analytics.metrics[0]?.tables_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tables</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {analytics.metrics[0]?.figures_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Figures</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Comments</span>
              <span className="text-sm font-semibold">
                {analytics.metrics[0]?.comments_count || 0}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Resolved</span>
              <span className="text-sm font-semibold">
                {analytics.metrics[0]?.resolved_comments_count || 0} 
                {analytics.metrics[0]?.comments_count > 0 ? 
                  ` (${Math.round((analytics.metrics[0]?.resolved_comments_count || 0) / analytics.metrics[0]?.comments_count * 100)}%)` : 
                  ''}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">References</span>
              <span className="text-sm font-semibold">
                {analytics.metrics[0]?.references_count || 0}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            Last updated {analytics.metrics[0]?.updated_at ? new Date(analytics.metrics[0].updated_at).toLocaleDateString() : 'N/A'}
          </div>
        </CardFooter>
      </Card>

      {/* Progress Trend */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Progress Trend
          </CardTitle>
          <CardDescription>Document completion over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={recentMetrics}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date_id" 
                  tickFormatter={(value) => {
                    // Convert date_id to a short date format if available
                    return value;
                  }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completion_percentage" 
                  stroke="#8884d8" 
                  name="Completion %" 
                  connectNulls 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          {analytics.progress?.days_tracked > 0 ? (
            <>
              <div>
                {analytics.progress.blocks_delta > 0 ? 
                  `+${analytics.progress.blocks_delta} blocks` : 
                  'No new blocks'}
              </div>
              <div>
                {analytics.progress.completion_delta > 0 ? 
                  `+${analytics.progress.completion_delta.toFixed(1)}% completion` : 
                  'No progress'}
              </div>
            </>
          ) : (
            <div>No trend data available</div>
          )}
        </CardFooter>
      </Card>

      {/* Section Completeness */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Section Status
          </CardTitle>
          <CardDescription>Completion status by section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Section</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Words</th>
                  <th className="text-left py-2">Tables</th>
                  <th className="text-left py-2">Figures</th>
                  <th className="text-left py-2">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {analytics.section_completeness
                  .sort((a, b) => a.section_code.localeCompare(b.section_code))
                  .map((section, index) => (
                    <tr key={section.section_code} className={index !== analytics.section_completeness.length - 1 ? "border-b" : ""}>
                      <td className="py-2">{section.section_code}</td>
                      <td className="py-2">
                        <div className="flex items-center">
                          <Progress 
                            value={section.completeness_score} 
                            className="h-2 w-24"
                          />
                          <span className="ml-2">{section.completeness_score}%</span>
                        </div>
                      </td>
                      <td className="py-2">{section.word_count}</td>
                      <td className="py-2">{section.table_count}</td>
                      <td className="py-2">{section.figure_count}</td>
                      <td className="py-2">
                        {section.last_edited_at ? 
                          new Date(section.last_edited_at).toLocaleDateString() : 
                          'N/A'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Activity
          </CardTitle>
          <CardDescription>User contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Blocks Created', value: analytics.user_activity.reduce((sum, a) => sum + (a.blocks_created || 0), 0) },
                    { name: 'Blocks Edited', value: analytics.user_activity.reduce((sum, a) => sum + (a.blocks_edited || 0), 0) },
                    { name: 'Comments', value: analytics.user_activity.reduce((sum, a) => sum + (a.comments_added || 0), 0) },
                    { name: 'Resolved Comments', value: analytics.user_activity.reduce((sum, a) => sum + (a.comments_resolved || 0), 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => (percent > 0.1 ? `${name}: ${(percent * 100).toFixed(0)}%` : '')}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            {analytics.metrics[0]?.active_editors_count || 0} active users
          </div>
          <div>
            {analytics.user_activity.length} activities
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Submission Tab Component
 * 
 * Detailed metrics for a selected submission
 */
function SubmissionTab({ submissionId }) {
  const [selectedSubmission, setSelectedSubmission] = useState(submissionId);
  
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/submissions');
      return await response.json();
    },
    enabled: !submissionId
  });

  if (submissionId) {
    return <SubmissionOverview submissionId={submissionId} />;
  }

  if (submissionsLoading) {
    return <DashboardSkeleton />;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Submissions</AlertTitle>
        <AlertDescription>
          No submissions found. Create a submission to view detailed analytics.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedSubmission) {
    return <SubmissionOverview submissionId={selectedSubmission} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select a Submission</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map(submission => (
          <Card 
            key={submission.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedSubmission(submission.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {submission.title || 'Untitled Submission'}
              </CardTitle>
              <CardDescription>{submission.sponsor_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Status</span>
                <Badge className={submission.submission_status === 'submitted' ? 'bg-green-100 text-green-800' : 
                                  submission.submission_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-gray-100 text-gray-800'}>
                  {submission.submission_status}
                </Badge>
              </div>
              {submission.ind_number && (
                <div className="flex justify-between mb-1">
                  <span className="text-sm">IND Number</span>
                  <span className="text-sm font-semibold">{submission.ind_number}</span>
                </div>
              )}
              <div className="flex justify-between mb-1">
                <span className="text-sm">Created</span>
                <span className="text-sm">{new Date(submission.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setSelectedSubmission(submission.id)}
              >
                View Analytics
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * User Tab Component
 * 
 * User productivity and activity metrics
 */
function UserTab() {
  const { data: userAnalytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/me'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/me');
      return await response.json();
    },
    enabled: true
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!userAnalytics) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load user analytics. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* User Summary */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Productivity Summary
          </CardTitle>
          <CardDescription>Your activity statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {userAnalytics.submission_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {userAnalytics.active_days || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Days</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {userAnalytics.total_blocks_created || 0}
              </div>
              <div className="text-sm text-muted-foreground">Blocks Created</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {userAnalytics.total_blocks_edited || 0}
              </div>
              <div className="text-sm text-muted-foreground">Blocks Edited</div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Activity Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Blocks Created</span>
                <span className="text-sm font-semibold">
                  {userAnalytics.total_blocks_created || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Blocks Edited</span>
                <span className="text-sm font-semibold">
                  {userAnalytics.total_blocks_edited || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Comments</span>
                <span className="text-sm font-semibold">
                  {userAnalytics.total_comments || 0}
                </span>
              </div>
              {userAnalytics.activity.reduce((sum, a) => sum + (a.signatures_added || 0), 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Signatures</span>
                  <span className="text-sm font-semibold">
                    {userAnalytics.activity.reduce((sum, a) => sum + (a.signatures_added || 0), 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Trend */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Trend
          </CardTitle>
          <CardDescription>Your activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userAnalytics.productivity?.map(p => ({
                  date: p.date,
                  blocks_created: p.blocks_created || 0,
                  blocks_edited: p.blocks_edited || 0,
                  comments: (p.comments_added || 0) + (p.comments_resolved || 0)
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="blocks_created" stackId="blocks" fill="#8884d8" name="Blocks Created" />
                <Bar dataKey="blocks_edited" stackId="blocks" fill="#82ca9d" name="Blocks Edited" />
                <Bar dataKey="comments" fill="#ffc658" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Submission Activity */}
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Your Submissions
          </CardTitle>
          <CardDescription>Submissions you've worked on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Submission</th>
                  <th className="text-left py-2">Sponsor</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Your Contribution</th>
                  <th className="text-left py-2"></th>
                </tr>
              </thead>
              <tbody>
                {userAnalytics.submissions.map((submission, index) => (
                  <tr key={submission.id} className={index !== userAnalytics.submissions.length - 1 ? "border-b" : ""}>
                    <td className="py-2">{submission.title || 'Untitled Submission'}</td>
                    <td className="py-2">{submission.sponsor_name}</td>
                    <td className="py-2">
                      <Badge className={submission.submission_status === 'submitted' ? 'bg-green-100 text-green-800' : 
                                       submission.submission_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-gray-100 text-gray-800'}>
                        {submission.submission_status}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {(() => {
                        // Calculate user's contribution for this submission
                        const activities = userAnalytics.activity
                          .filter(a => a.submission_id === submission.id);
                        
                        const blocks = activities.reduce((sum, a) => 
                          sum + (a.blocks_created || 0) + (a.blocks_edited || 0), 0);
                        
                        return `${blocks} blocks`;
                      })()}
                    </td>
                    <td className="py-2">
                      <Link href={`/analytics/${submission.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Regulatory Tab Component
 * 
 * FDA submission and acknowledgment metrics
 */
function RegulatoryTab() {
  const { data: regulatoryAnalytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/regulatory'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/regulatory');
      return await response.json();
    },
    enabled: true
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!regulatoryAnalytics) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load regulatory analytics. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Submission Summary */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Submission Summary
          </CardTitle>
          <CardDescription>FDA submission statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {regulatoryAnalytics.summary.total_submissions || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {regulatoryAnalytics.summary.completed_submissions || 0}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {regulatoryAnalytics.summary.total_esg_submissions || 0}
              </div>
              <div className="text-sm text-muted-foreground">ESG Submissions</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {regulatoryAnalytics.regulatory?.filter(r => r.ack3_date)?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">ACK3 Received</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Timeline Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Avg. ACK1 Time</span>
                <span className="text-sm font-semibold">
                  {regulatoryAnalytics.summary.avg_ack1_time ? 
                    `${Math.round(regulatoryAnalytics.summary.avg_ack1_time / 60)} hours` : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg. ACK3 Time</span>
                <span className="text-sm font-semibold">
                  {regulatoryAnalytics.summary.avg_ack3_time ? 
                    `${Math.round(regulatoryAnalytics.summary.avg_ack3_time / (24 * 60))} days` : 
                    'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ESG Submission Trend */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ESG Submission Trend
          </CardTitle>
          <CardDescription>Submissions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={regulatoryAnalytics.esg_trend}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="esg_submissions" stroke="#8884d8" name="ESG Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            FDA Submission Status
          </CardTitle>
          <CardDescription>Status of FDA submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Submission</th>
                  <th className="text-left py-2">Sponsor</th>
                  <th className="text-left py-2">Submitted</th>
                  <th className="text-left py-2">ACK1</th>
                  <th className="text-left py-2">ACK2</th>
                  <th className="text-left py-2">ACK3</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {regulatoryAnalytics.regulatory.map((reg, index) => {
                  const submission = regulatoryAnalytics.submissions.find(s => s.id === reg.submission_id);
                  return (
                    <tr key={reg.submission_id} className={index !== regulatoryAnalytics.regulatory.length - 1 ? "border-b" : ""}>
                      <td className="py-2">{submission?.title || 'Unknown'}</td>
                      <td className="py-2">{submission?.sponsor_name || 'Unknown'}</td>
                      <td className="py-2">
                        {reg.submission_date ? 
                          new Date(reg.submission_date).toLocaleDateString() : 
                          'Pending'}
                      </td>
                      <td className="py-2">
                        {reg.ack1_date ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <span className="text-yellow-500">-</span>}
                      </td>
                      <td className="py-2">
                        {reg.ack2_date ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <span className="text-yellow-500">-</span>}
                      </td>
                      <td className="py-2">
                        {reg.ack3_date ? 
                          <Check className="h-4 w-4 text-green-500" /> : 
                          <span className="text-yellow-500">-</span>}
                      </td>
                      <td className="py-2">
                        <Badge className={
                          reg.ack3_date ? 'bg-green-100 text-green-800' : 
                          reg.ack1_date ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }>
                          {reg.ack3_date ? 'Complete' : 
                          reg.ack2_date ? 'ACK2 Received' :
                          reg.ack1_date ? 'ACK1 Received' : 
                          reg.submission_date ? 'Submitted' : 'Preparing'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * System Tab Component
 * 
 * System-wide metrics and trends
 */
function SystemTab() {
  const { data: systemAnalytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/system'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/analytics/system');
      return await response.json();
    },
    enabled: true
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!systemAnalytics) {
    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load system analytics. Please try again later or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* System Summary */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Summary
          </CardTitle>
          <CardDescription>Platform statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {systemAnalytics.summary.total_active_users || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {systemAnalytics.summary.total_submissions || 0}
              </div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {systemAnalytics.summary.completed_submissions || 0}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="col-span-1 border rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">
                {systemAnalytics.summary.total_esg_submissions || 0}
              </div>
              <div className="text-sm text-muted-foreground">ESG Submissions</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">API Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">AI Harvester Calls</span>
                <span className="text-sm font-semibold">
                  {systemAnalytics.usage.reduce((sum, u) => sum + (u.harvester_calls || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">AI Copilot Calls</span>
                <span className="text-sm font-semibold">
                  {systemAnalytics.usage.reduce((sum, u) => sum + (u.ai_copilot_calls || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">PDF Generations</span>
                <span className="text-sm font-semibold">
                  {systemAnalytics.usage.reduce((sum, u) => sum + (u.pdf_generations || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            Last {systemAnalytics.summary.period_days} days
          </div>
          <div>
            Peak memory: {systemAnalytics.usage.reduce((max, u) => Math.max(max, u.peak_memory_usage || 0), 0)} MB
          </div>
        </CardFooter>
      </Card>

      {/* User Activity Trend */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Activity Trend
          </CardTitle>
          <CardDescription>User activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={systemAnalytics.usage}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="active_users" 
                  stroke="#8884d8" 
                  name="Active Users" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="active_submissions" 
                  stroke="#82ca9d" 
                  name="Active Submissions" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="new_submissions" 
                  stroke="#ffc658" 
                  name="New Submissions" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* API Usage */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Usage
          </CardTitle>
          <CardDescription>Feature usage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={systemAnalytics.usage}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="harvester_calls" fill="#8884d8" name="Harvester API" />
                <Bar dataKey="ai_copilot_calls" fill="#82ca9d" name="AI Copilot" />
                <Bar dataKey="pdf_generations" fill="#ffc658" name="PDF Generation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Metrics */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Regulatory Metrics
          </CardTitle>
          <CardDescription>FDA submission performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Submitted', value: systemAnalytics.submissions.filter(s => s.submission_status === 'submitted').length },
                    { name: 'Approved', value: systemAnalytics.submissions.filter(s => s.submission_status === 'approved').length },
                    { name: 'In Progress', value: systemAnalytics.submissions.filter(s => s.submission_status !== 'submitted' && s.submission_status !== 'approved').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            {systemAnalytics.regulatory?.filter(r => r.ack3_date)?.length || 0} complete
          </div>
          <div>
            {systemAnalytics.regulatory?.length || 0} total
          </div>
        </CardFooter>
      </Card>

      {/* Recent Submissions */}
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Submissions
          </CardTitle>
          <CardDescription>Latest submission activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Sponsor</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2">Completion</th>
                  <th className="text-left py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {systemAnalytics.submissions.slice(0, 10).map((submission, index) => (
                  <tr key={submission.id} className={index !== 9 ? "border-b" : ""}>
                    <td className="py-2">{submission.title || 'Untitled'}</td>
                    <td className="py-2">{submission.sponsor_name}</td>
                    <td className="py-2">
                      <Badge className={submission.submission_status === 'submitted' ? 'bg-green-100 text-green-800' : 
                                       submission.submission_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-gray-100 text-gray-800'}>
                        {submission.submission_status}
                      </Badge>
                    </td>
                    <td className="py-2">{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      {(() => {
                        // Find completion data if available
                        const reg = systemAnalytics.regulatory?.find(r => r.submission_id === submission.id);
                        if (reg?.ack3_date) return 'Complete';
                        if (reg?.ack1_date) return 'In Progress';
                        return 'Not Started';
                      })()}
                    </td>
                    <td className="py-2">
                      <Link href={`/analytics/${submission.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Dashboard Skeleton Component
 * 
 * Loading state for dashboard
 */
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-full" />
        </CardFooter>
      </Card>
      
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}