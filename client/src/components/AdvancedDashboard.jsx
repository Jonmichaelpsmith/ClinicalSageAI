// AdvancedDashboard.jsx
import React, { useState, useEffect } from 'react';

export default function AdvancedDashboard({ ndcCodes }) {
  const [comparativeData, setComparativeData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComparativeData = async () => {
    if (!ndcCodes || ndcCodes.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/cer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ndc_codes: ndcCodes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data.');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error retrieving comparative data');
      }
      
      setComparativeData(data.visualization_data);
    } catch (err) {
      console.error('Error fetching comparative data:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparativeData();
  }, [ndcCodes]);

  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '15px' }}>Loading advanced analytics...</div>
        <div 
          style={{ 
            width: '50px', 
            height: '50px', 
            margin: 'auto', 
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db', 
            borderRadius: '50%',
            animation: 'spin 2s linear infinite'
          }}
        ></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Error Loading Data</h3>
        <p>{error}</p>
        <button 
          onClick={fetchComparativeData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!comparativeData || !comparativeData.event_labels || comparativeData.event_labels.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#e2e3e5', 
        color: '#383d41',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0 }}>No Comparative Data Available</h3>
        <p>There is no data available for the selected NDC codes. Please try different codes or ensure the API is functioning correctly.</p>
      </div>
    );
  }

  // Prepare data for visualization 
  const eventLabels = comparativeData.event_labels || [];
  const productData = comparativeData.products || {};
  
  // Find the max value to scale the chart appropriately
  const maxValue = Object.values(productData).reduce((max, data) => {
    const localMax = Math.max(...data);
    return localMax > max ? localMax : max;
  }, 0);

  // Select an event for detailed view
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  // For event details, show a focused view of one event across products
  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    
    const eventIndex = eventLabels.indexOf(selectedEvent);
    if (eventIndex === -1) return null;
    
    const eventData = Object.entries(productData).map(([ndc, data]) => ({
      ndc,
      value: data[eventIndex] || 0
    }));
    
    return (
      <div style={{ 
        marginTop: '30px', 
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Detailed View: {selectedEvent}</h3>
        <div style={{ display: 'flex', height: '250px', alignItems: 'flex-end', marginTop: '20px' }}>
          {eventData.map((item, index) => (
            <div key={index} style={{ flex: 1, textAlign: 'center', padding: '0 10px' }}>
              <div 
                style={{ 
                  height: `${(item.value / maxValue) * 200}px`, 
                  backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                  minHeight: '10px',
                  margin: '0 auto',
                  width: '40px',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px',
                  transition: 'height 0.5s ease'
                }}
              ></div>
              <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>{item.ndc}</div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>{item.value} events</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, borderBottom: '2px solid #3498db', paddingBottom: '10px', color: '#2c3e50' }}>
        Advanced Comparative Analytics Dashboard
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#34495e' }}>Comparing {ndcCodes.length} Products:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {ndcCodes.map((code, index) => (
            <div 
              key={index}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: `hsl(${index * 60}, 70%, 90%)`,
                border: `1px solid hsl(${index * 60}, 70%, 60%)`,
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {code}
            </div>
          ))}
        </div>
      </div>
      
      {/* Events selection for detailed view */}
      <div style={{ marginBottom: '30px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          Select an event for detailed comparison:
        </label>
        <select 
          onChange={(e) => handleEventSelect(e.target.value)}
          value={selectedEvent || ''}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            width: '100%',
            maxWidth: '400px',
            fontSize: '16px'
          }}
        >
          <option value="">-- Select an adverse event --</option>
          {eventLabels.map((event, index) => (
            <option key={index} value={event}>{event}</option>
          ))}
        </select>
      </div>
      
      {/* Basic bar chart visualization for all events */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#34495e' }}>Comparative Event Analysis</h3>
        <div style={{ overflowX: 'auto', marginTop: '15px' }}>
          <div style={{ display: 'flex', minWidth: eventLabels.length * 80, height: '300px' }}>
            {/* Render bars for each event */}
            {eventLabels.map((event, eventIndex) => (
              <div 
                key={eventIndex} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '0 5px',
                  borderLeft: selectedEvent === event ? '2px solid #3498db' : 'none',
                  backgroundColor: selectedEvent === event ? 'rgba(52, 152, 219, 0.1)' : 'transparent'
                }}
                onClick={() => handleEventSelect(event)}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                  {Object.entries(productData).map(([ndc, data], ndcIndex) => (
                    <div 
                      key={ndcIndex}
                      style={{ 
                        flex: 1,
                        height: `${(data[eventIndex] / maxValue) * 100}%`,
                        backgroundColor: `hsl(${ndcIndex * 60}, 70%, 60%)`,
                        margin: '0 2px',
                        minHeight: '1px',
                        transition: 'height 0.5s ease',
                        position: 'relative'
                      }}
                      title={`${ndc}: ${data[eventIndex]} events`}
                    >
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: '-25px', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {data[eventIndex]}
                      </div>
                    </div>
                  ))}
                </div>
                <div 
                  style={{ 
                    padding: '5px 0',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    wordBreak: 'break-word',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    width: '100px',
                    marginTop: '25px',
                    marginLeft: '20px'
                  }}
                >
                  {event}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '30px', justifyContent: 'center' }}>
          {Object.keys(productData).map((ndc, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                  marginRight: '5px',
                  borderRadius: '3px'
                }}
              ></div>
              <span>{ndc}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Render detailed event view if selected */}
      {renderEventDetails()}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '15px', 
        backgroundColor: '#e8f4f8', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0 }}><strong>Note:</strong> This visualization is a simplified version. For more advanced interactive charts, please install <code>react-plotly.js</code> and <code>plotly.js</code> packages.</p>
      </div>
    </div>
  );
}