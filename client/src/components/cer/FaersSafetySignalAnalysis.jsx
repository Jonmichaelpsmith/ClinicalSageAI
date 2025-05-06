import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Database, BarChart3, TrendingUp, Search } from 'lucide-react';

const FaersSafetySignalAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [faersData, setFaersData] = useState(null);
  
  // Query FDA FAERS database
  const queryFaersDatabase = () => {
    setIsLoading(true);
    
    // Simulate API call to FAERS database
    setTimeout(() => {
      // This would be real data from the API in production
      const mockFaersData = {
        product: {
          name: 'CardioStent XR',
          manufacturerName: 'MedDevice Technologies Inc.',
          productCode: 'MDT-CS-221',
          deviceClass: 'Class III'
        },
        summary: {
          totalReports: 84,
          severeEvents: 12,
          moderateEvents: 39,
          mildEvents: 33,
          fatalEvents: 0,
          timeframe: { from: '2024-01-01', to: '2025-05-01' },
          signalStrength: 'Moderate'
        },
        adverseEvents: [
          { name: 'Local inflammation', count: 27, severity: 'Moderate', percentChange: 5 },
          { name: 'Minor bleeding', count: 23, severity: 'Moderate', percentChange: -8 },
          { name: 'Discomfort/Pain', count: 18, severity: 'Mild', percentChange: 12 },
          { name: 'Thrombosis', count: 7, severity: 'Severe', percentChange: -3 },
          { name: 'Cardiac arrhythmia', count: 5, severity: 'Severe', percentChange: 20 },
          { name: 'Allergic reaction', count: 4, severity: 'Moderate', percentChange: 0 }
        ],
        similarDevices: [
          { name: 'VascuStent Pro', manufacturer: 'CardioMed Inc.', eventRatio: 0.008 },
          { name: 'FlexiStent', manufacturer: 'Boston Scientific', eventRatio: 0.012 },
          { name: 'CardioFlow XL', manufacturer: 'Medtronic', eventRatio: 0.009 }
        ]
      };
      
      setFaersData(mockFaersData);
      setIsLoading(false);
    }, 2000);
  };
  
  // Helper to get badge color for severity
  const getSeverityBadgeColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800';
      case 'mild':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper to get trend icon and color
  const getTrendIndicator = (percentChange) => {
    if (percentChange > 0) {
      return { icon: <TrendingUp className="h-3 w-3 text-red-600" />, color: 'text-red-600' };
    } else if (percentChange < 0) {
      return { icon: <TrendingUp className="h-3 w-3 text-green-600 transform rotate-180" />, color: 'text-green-600' };
    } else {
      return { icon: null, color: 'text-gray-500' };
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">FDA FAERS Safety Signal Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">
            Analysis of adverse event data from the FDA Adverse Event Reporting System
          </p>
        </div>
        
        {!faersData && (
          <Button 
            onClick={queryFaersDatabase} 
            disabled={isLoading}
            className="text-xs h-8"
          >
            <Database className="h-3.5 w-3.5 mr-1.5" />
            {isLoading ? 'Querying...' : 'Query FAERS Database'}
          </Button>
        )}
        
        {faersData && (
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Signal Strength:</span>
            <Badge className="bg-amber-100 text-amber-800 text-xs">
              {faersData.summary.signalStrength}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4 text-xs h-7"
              onClick={queryFaersDatabase}
            >
              <Search className="h-3 w-3 mr-1" />
              Refresh Data
            </Button>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="bg-gray-50 border rounded-md p-8 text-center space-y-3">
          <div className="animate-pulse">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-200"></div>
            <div className="mt-4 h-4 w-1/3 mx-auto rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-1/2 mx-auto rounded bg-gray-200"></div>
          </div>
          <p className="text-sm text-gray-500">
            Querying FDA FAERS Database for CardioStent XR...
          </p>
        </div>
      )}
      
      {!isLoading && !faersData && (
        <div className="bg-gray-50 border rounded-md p-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
            <Database className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium">No FAERS Data Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Query the FDA Adverse Event Reporting System to obtain safety data for CardioStent XR.
          </p>
        </div>
      )}
      
      {!isLoading && faersData && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 border">
              <div className="flex flex-col">
                <div className="text-xs text-gray-500">Total Reports</div>
                <div className="text-2xl font-bold mt-1">{faersData.summary.totalReports}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {faersData.summary.timeframe.from} to {faersData.summary.timeframe.to}
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border bg-red-50">
              <div className="flex flex-col">
                <div className="text-xs text-gray-600">Severe Events</div>
                <div className="text-2xl font-bold mt-1 text-red-700">{faersData.summary.severeEvents}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round((faersData.summary.severeEvents / faersData.summary.totalReports) * 100)}% of total
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border bg-amber-50">
              <div className="flex flex-col">
                <div className="text-xs text-gray-600">Moderate Events</div>
                <div className="text-2xl font-bold mt-1 text-amber-700">{faersData.summary.moderateEvents}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round((faersData.summary.moderateEvents / faersData.summary.totalReports) * 100)}% of total
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border bg-blue-50">
              <div className="flex flex-col">
                <div className="text-xs text-gray-600">Mild Events</div>
                <div className="text-2xl font-bold mt-1 text-blue-700">{faersData.summary.mildEvents}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {Math.round((faersData.summary.mildEvents / faersData.summary.totalReports) * 100)}% of total
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card className="p-4 border">
                <h3 className="text-sm font-medium mb-4">Most Common Adverse Events</h3>
                
                <div className="space-y-3">
                  {faersData.adverseEvents.map((event, idx) => {
                    const { icon, color } = getTrendIndicator(event.percentChange);
                    return (
                      <div key={idx} className="flex items-center">
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <span className="text-xs font-medium">{event.name}</span>
                            <Badge className={`ml-2 text-xs ${getSeverityBadgeColor(event.severity)}`}>
                              {event.severity}
                            </Badge>
                            {icon && (
                              <div className={`flex items-center ml-2 ${color} text-xs`}>
                                {icon}
                                <span className="ml-0.5">{Math.abs(event.percentChange)}%</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-1 flex items-center">
                            <Progress 
                              value={(event.count / faersData.summary.totalReports) * 100} 
                              className="h-1.5" 
                              indicatorClassName={event.severity === 'Severe' ? 'bg-red-500' : 
                                              event.severity === 'Moderate' ? 'bg-amber-500' : 
                                              'bg-blue-500'}
                            />
                            <span className="ml-2 text-xs text-gray-500">{event.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            
            <div>
              <Card className="p-4 border">
                <h3 className="text-sm font-medium mb-4">Product Information</h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-gray-500">Device Name</div>
                    <div className="font-medium">{faersData.product.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Manufacturer</div>
                    <div className="font-medium">{faersData.product.manufacturerName}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Product Code</div>
                    <div className="font-medium">{faersData.product.productCode}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Device Class</div>
                    <div className="font-medium">{faersData.product.deviceClass}</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <h4 className="text-xs font-medium mb-2">Comparable Devices</h4>
                <div className="space-y-2 text-xs">
                  {faersData.similarDevices.map((device, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{device.name}</span>
                      <span className="text-gray-500">{device.eventRatio * 100}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" className="text-xs h-7">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              View Detailed Analysis
            </Button>
            
            <Button size="sm" className="text-xs h-7">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Generate Safety Analysis Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaersSafetySignalAnalysis;