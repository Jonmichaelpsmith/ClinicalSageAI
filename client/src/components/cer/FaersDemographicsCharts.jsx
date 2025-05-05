import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/**
 * FAERS Demographics Charts Component
 * Visualizes demographic data from FAERS reports
 */
export function FaersDemographicsCharts({ demographics }) {
  // If no demographics data is available, show placeholder
  if (!demographics) {
    return (
      <div className="p-6 bg-gray-50 border rounded-md text-center">
        <p className="text-gray-500">No demographic data available to visualize</p>
      </div>
    );
  }

  // Prepare age group data for chart
  const ageData = Object.entries(demographics.ageGroups || {}).map(([group, count]) => ({
    name: group,
    count: count
  })).filter(item => item.count > 0);

  // Prepare gender data for chart
  const genderData = Object.entries(demographics.gender || {}).map(([gender, count]) => ({
    name: gender,
    value: count
  })).filter(item => item.value > 0);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F'];

  return (
    <div className="space-y-8">
      {/* Age Distribution Chart */}
      <div>
        <h3 className="text-base font-medium mb-4">Age Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ageData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} reports`, 'Count']}
                labelFormatter={(value) => `Age: ${value}`}
              />
              <Legend />
              <Bar dataKey="count" name="Report Count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gender Distribution Chart */}
      <div>
        <h3 className="text-base font-medium mb-4">Gender Distribution</h3>
        <div className="h-72 w-full flex items-center justify-center">
          <div className="h-64 w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} reports`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Reactions Chart */}
      <div>
        <h3 className="text-base font-medium mb-4">Most Common Adverse Events</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={[...demographics.topReactions || []].slice(0, 10)}
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="event" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Report Count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
