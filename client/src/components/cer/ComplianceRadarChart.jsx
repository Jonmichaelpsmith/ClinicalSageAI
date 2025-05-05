import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  Legend
);

/**
 * ComplianceRadarChart - Displays a radar chart showing compliance scores across standards
 * Implements section 9 of the CER Master Data Model (Regulatory Compliance Mapping)
 */
export default function ComplianceRadarChart({
  complianceData,
  thresholds = {
    OVERALL_THRESHOLD: 0.8, // 80% threshold for passing
    FLAG_THRESHOLD: 0.7     // 70% threshold for warnings/flagging
  }
}) {
  // If no data is provided or missing standards, show empty state
  if (!complianceData || !complianceData.standards) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Compliance Analysis</CardTitle>
          <CardDescription>
            Multi-standard compliance radar chart
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-8 w-8 text-blue-500 mb-3" />
            <h3 className="text-lg font-medium">No Compliance Data Available</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Run a compliance analysis to see how your CER aligns with regulatory standards.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare chart data
  const prepareChartData = () => {
    const standards = Object.keys(complianceData.standards);
    const scores = standards.map(std => complianceData.standards[std].score * 100);
    
    return {
      labels: standards,
      datasets: [
        {
          label: 'Compliance Score',
          data: scores,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
        },
        {
          label: 'Minimum Threshold',
          data: Array(standards.length).fill(thresholds.FLAG_THRESHOLD * 100),
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          borderColor: 'rgba(249, 115, 22, 0.8)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Target Threshold',
          data: Array(standards.length).fill(thresholds.OVERALL_THRESHOLD * 100),
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 0.8)',
          borderWidth: 1,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: false,
        }
      ]
    };
  };
  
  // Chart options
  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          backdropColor: 'transparent',
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
        pointLabels: {
          font: {
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            if (context.datasetIndex === 0) {
              const standardName = context.label;
              const score = context.raw;
              let status = '';
              
              if (score >= thresholds.OVERALL_THRESHOLD * 100) {
                status = 'Compliant';
              } else if (score >= thresholds.FLAG_THRESHOLD * 100) {
                status = 'Needs Improvement';
              } else {
                status = 'Non-Compliant';
              }
              
              return [`Score: ${score}% - ${status}`];
            }
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };
  
  // Get overall status based on minimum score
  const getOverallStatus = () => {
    const standardScores = Object.values(complianceData.standards).map(std => std.score);
    const minScore = Math.min(...standardScores);
    
    if (minScore >= thresholds.OVERALL_THRESHOLD) {
      return {
        label: 'Fully Compliant',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    } else if (minScore >= thresholds.FLAG_THRESHOLD) {
      return {
        label: 'Needs Improvement',
        color: 'bg-amber-100 text-amber-800',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        label: 'Non-Compliant',
        color: 'bg-red-100 text-red-800',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      };
    }
  };
  
  const status = getOverallStatus();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle>Regulatory Compliance Analysis</CardTitle>
            <CardDescription>
              Multi-standard compliance radar chart
            </CardDescription>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">Overall Status:</span>
            <Badge className={status.color}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="h-[400px] w-full">
          <Radar data={prepareChartData()} options={chartOptions} />
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Standard Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(complianceData.standards).map(([standardName, standardData]) => (
              <TooltipProvider key={standardName}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`flex flex-col p-3 rounded-md border
                        ${standardData.score < thresholds.FLAG_THRESHOLD ? 'bg-red-50 border-red-200' : 
                          standardData.score < thresholds.OVERALL_THRESHOLD ? 'bg-amber-50 border-amber-200' : 
                          'bg-green-50 border-green-200'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{standardName}</span>
                        <Badge 
                          className={`
                            ${standardData.score >= thresholds.OVERALL_THRESHOLD ? 'bg-green-100 text-green-800' : 
                              standardData.score >= thresholds.FLAG_THRESHOLD ? 'bg-amber-100 text-amber-800' : 
                              'bg-red-100 text-red-800'}
                          `}
                        >
                          {Math.round(standardData.score * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <HelpCircle className="h-3 w-3 mr-1 inline" />
                        Click for details
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-0">
                    <div className="p-3">
                      <h4 className="font-medium mb-1">{standardName}</h4>
                      <p className="text-xs mb-2">{standardData.description || 'Standard compliance details'}</p>
                      
                      {standardData.criticalGaps && standardData.criticalGaps.length > 0 && (
                        <div className="mt-2">
                          <h5 className="text-xs font-medium mb-1">Critical Gaps:</h5>
                          <ul className="text-xs list-disc pl-4">
                            {standardData.criticalGaps.map((gap, idx) => (
                              <li key={idx}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
