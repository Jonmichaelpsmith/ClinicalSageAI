import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FaersRiskBadge } from './FaersRiskBadge';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * FAERS Comparative Analysis Chart Component
 * 
 * Displays visual comparison of risk scores and report counts for similar products
 */
export function FaersComparativeChart({ productName, faersData, className }) {
  // Return early if no comparators available
  if (!faersData?.comparators || faersData.comparators.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Comparative Analysis</CardTitle>
          <CardDescription>No comparative data available for similar products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-gray-500 text-sm">
            <p>No similar products found in the same class.</p>
            <p className="mt-2">Try searching with a different product name or enable comparative analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const comparators = faersData.comparators || [];
  const labels = [productName, ...comparators.map(c => c.comparator)];
  
  // Risk score chart data
  const riskScoreData = {
    labels,
    datasets: [
      {
        label: 'Risk Score',
        data: [faersData.riskScore, ...comparators.map(c => c.riskScore)],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // Product color (red)
          ...comparators.map(() => 'rgba(54, 162, 235, 0.8)')  // Comparator color (blue)
        ],
        borderColor: [
          'rgb(255, 99, 132)',  // Product border
          ...comparators.map(() => 'rgb(54, 162, 235)')  // Comparator border
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Report count chart data
  const reportCountData = {
    labels,
    datasets: [
      {
        label: 'Report Count',
        data: [faersData.totalReports, ...comparators.map(c => c.reportCount)],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // Product color (red)
          ...comparators.map(() => 'rgba(54, 162, 235, 0.8)')  // Comparator color (blue)
        ],
        borderColor: [
          'rgb(255, 99, 132)',  // Product border
          ...comparators.map(() => 'rgb(54, 162, 235)')  // Comparator border
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const value = dataset.data[context.dataIndex];
            const label = dataset.label || '';
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Safety comparison helper function
  const getRelativeSafety = (comparatorScore) => {
    const ratio = comparatorScore / faersData.riskScore;
    
    if (ratio < 0.8) return { text: 'Better', className: 'text-green-600' };
    if (ratio > 1.2) return { text: 'Worse', className: 'text-red-600' };
    return { text: 'Similar', className: 'text-blue-600' };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Comparative Safety Analysis</CardTitle>
        <CardDescription>
          {`Comparing ${productName} with ${comparators.length} similar ${comparators.length === 1 ? 'product' : 'products'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="risk">
          <TabsList className="mb-4">
            <TabsTrigger value="risk">Risk Score</TabsTrigger>
            <TabsTrigger value="reports">Report Count</TabsTrigger>
            <TabsTrigger value="table">Comparison Table</TabsTrigger>
          </TabsList>
          
          <TabsContent value="risk" className="h-72">
            <Bar data={riskScoreData} options={chartOptions} />
          </TabsContent>
          
          <TabsContent value="reports" className="h-72">
            <Bar data={reportCountData} options={chartOptions} />
          </TabsContent>
          
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Risk Score</th>
                    <th className="px-4 py-2">Report Count</th>
                    <th className="px-4 py-2">Risk Level</th>
                    <th className="px-4 py-2">Relative Safety</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Current product */}
                  <tr className="bg-gray-50 border-b">
                    <td className="px-4 py-2 font-medium">{productName}</td>
                    <td className="px-4 py-2">{faersData.riskScore.toFixed(2)}</td>
                    <td className="px-4 py-2">{faersData.totalReports}</td>
                    <td className="px-4 py-2">
                      <FaersRiskBadge riskLevel={faersData.severityAssessment.toLowerCase()} score={faersData.riskScore} compact />
                    </td>
                    <td className="px-4 py-2">Reference</td>
                  </tr>
                  
                  {/* Comparator products */}
                  {comparators.map((comp, idx) => {
                    const safety = getRelativeSafety(comp.riskScore);
                    const severityLevel = comp.riskScore > 1.5 ? 'high' : comp.riskScore > 0.5 ? 'medium' : 'low';
                    
                    return (
                      <tr key={idx} className="bg-white border-b">
                        <td className="px-4 py-2">{comp.comparator}</td>
                        <td className="px-4 py-2">{comp.riskScore.toFixed(2)}</td>
                        <td className="px-4 py-2">{comp.reportCount}</td>
                        <td className="px-4 py-2">
                          <FaersRiskBadge riskLevel={severityLevel} score={comp.riskScore} compact />
                        </td>
                        <td className={`px-4 py-2 ${safety.className} font-medium`}>{safety.text}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
