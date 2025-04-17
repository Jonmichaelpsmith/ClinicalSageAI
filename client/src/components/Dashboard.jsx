// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; // This import is required for react-chartjs-2 to work

const Dashboard = ({ ndcCodes }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchComparativeData = async () => {
    if (!ndcCodes || ndcCodes.length === 0) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/cer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ndc_codes: ndcCodes })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparative analysis data.');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to analyze data');
      }
      
      // Format data for Chart.js
      setChartData({
        labels: data.visualization_data.event_labels,
        datasets: data.visualization_data.comparative_data
      });
    } catch (e) {
      console.error('Error fetching comparative data:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparativeData();
  }, [ndcCodes]);

  if (error) {
    return (
      <div style={{ margin: '20px', padding: '15px', border: '1px solid #f5c6cb', borderRadius: '4px', backgroundColor: '#f8d7da', color: '#721c24' }}>
        <h3>Error Loading Comparative Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ margin: '20px', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading comparative analysis...</div>
        <div style={{ width: '50px', height: '50px', margin: 'auto', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 2s linear infinite' }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return (
      <div style={{ margin: '20px', padding: '15px', border: '1px solid #bee5eb', borderRadius: '4px', backgroundColor: '#d1ecf1', color: '#0c5460' }}>
        <h3>No Data Available</h3>
        <p>There is no comparative data available for the selected NDC codes. Please try different codes or ensure the API is functioning correctly.</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Adverse Event Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Adverse Events'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Comparative Adverse Event Analysis'
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} events`;
          }
        }
      }
    },
  };

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px' }}>
        Comparative Analysis Dashboard
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Analyzing NDC Codes:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {ndcCodes.map((code, index) => (
            <span key={index} style={{ 
              padding: '6px 12px', 
              backgroundColor: '#e9ecef', 
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {code}
            </span>
          ))}
        </div>
      </div>
      
      <div style={{ height: '400px', marginBottom: '20px' }}>
        <Bar data={chartData} options={options} />
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={fetchComparativeData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default Dashboard;