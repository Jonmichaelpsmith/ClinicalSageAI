// CERGenerator.jsx
import React, { useState } from 'react';

export default function CERGenerator() {
  const [ndcCode, setNdcCode] = useState('');
  const [cerReport, setCerReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const generateCER = async () => {
    if (!ndcCode || ndcCode.trim() === '') {
      setError('Please enter a valid NDC code');
      return;
    }

    setLoading(true);
    setError('');
    setCerReport('');
    setSuccessMessage('');
    
    try {
      const res = await fetch(`/api/cer/${ndcCode}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch the CER report from the server.');
      }
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate CER report');
      }
      
      setCerReport(data.cer_report);
      setSuccessMessage('CER report generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!ndcCode || ndcCode.trim() === '') {
      setError('Please enter a valid NDC code');
      return;
    }
    
    // Open PDF in a new tab
    window.open(`/api/cer/${ndcCode}/pdf`, '_blank');
  };

  return (
    <div style={{ margin: '20px', fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px' }}>
        Clinical Evaluation Report Generator
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Enter NDC Code:
        </label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter NDC Code (e.g., 0074-3799)"
            value={ndcCode}
            onChange={(e) => setNdcCode(e.target.value)}
            style={{
              padding: '10px',
              width: '300px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          
          <button
            onClick={generateCER}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: loading ? '#cccccc' : '#007BFF',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Generating...' : 'Generate CER'}
          </button>
          
          <button
            onClick={downloadPDF}
            disabled={!cerReport || loading}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: !cerReport || loading ? '#cccccc' : '#28a745',
              color: 'white',
              cursor: !cerReport || loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Download PDF
          </button>
        </div>
      </div>
      
      {successMessage && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      {cerReport && (
        <div>
          <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Generated Report</h3>
          <div
            style={{
              marginTop: '10px',
              whiteSpace: 'pre-wrap',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '15px',
              backgroundColor: '#f9f9f9',
              maxHeight: '400px',
              overflowY: 'auto',
              lineHeight: '1.6'
            }}
          >
            {cerReport}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>Note: For testing, try NDC codes such as "0074-3799" (Humira), "0078-0527" (Entresto), or "50090-4730" (Ozempic).</p>
      </div>
    </div>
  );
}