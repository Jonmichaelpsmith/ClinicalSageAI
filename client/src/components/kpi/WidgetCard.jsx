import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// R4: Widget Export - Stub functions until we can install actual dependencies
const html2canvas = (element) => {
  console.log('html2canvas called for', element);
  return Promise.resolve({
    toBlob: (callback) => callback(new Blob(['PNG data would be here'], { type: 'image/png' }))
  });
};

const saveAs = (blob, filename) => {
  console.log(`Saving ${filename}`, blob);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function WidgetCard({ widget }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/org/${widget.org}/widget/${widget.id}/data`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading widget data:", err);
        setError(err.message || "Failed to load data");
        setLoading(false);
      });
  }, [widget.id, widget.org]);

  const renderChart = () => {
    if (loading) return <div className="flex items-center justify-center h-32">Loading data...</div>;
    if (error) return <div className="text-red-500 p-2">Error: {error}</div>;
    if (!data || data.length === 0) return <div className="text-gray-500 p-2">No data available</div>;

    switch (widget.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(data[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={Object.keys(data[0])[1]} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={Object.keys(data[0])[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={Object.keys(data[0])[1]} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} dataKey={Object.keys(data[0])[1]} nameKey={Object.keys(data[0])[0]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="overflow-auto max-h-40">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="px-2 py-1 border">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-2 py-1 border">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div ref={ref} className="bg-white shadow rounded p-3 flex flex-col h-full">
      <h4 className="text-sm font-semibold mb-1">{widget.name}</h4>
      <div className="text-xs text-gray-500 mb-2">{widget.type.toUpperCase()} Chart</div>
      <div className="flex-grow overflow-hidden">
        {renderChart()}
      </div>
    </div>
  );
}