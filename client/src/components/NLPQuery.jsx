// NLPQuery.jsx
import React, { useState } from 'react';

export default function NLPQuery({ onFilter }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  const submitQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    setLastQuery(query);
    
    try {
      // Call the natural language query endpoint
      const response = await fetch('/api/cer/nlp-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process your query. Please try again.');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error processing your natural language query');
      }
      
      // Pass the filtered data to parent component
      onFilter(data.results);
    } catch (err) {
      console.error('Error processing NLP query:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitQuery();
    }
  };

  const exampleQueries = [
    'Show me adverse events for elderly patients',
    'Compare serious adverse events across products',
    'Find trends for cardiac-related events',
    'Show me data for female patients only',
    'Display events by frequency'
  ];

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '20px', 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, borderBottom: '2px solid #3498db', paddingBottom: '10px', color: '#2c3e50' }}>
        Natural Language Query
      </h2>
      
      <p style={{ marginBottom: '15px', color: '#555' }}>
        Ask questions about your data in plain English. Our AI will interpret your question and display relevant insights.
      </p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Ask a question about your data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ 
            padding: '12px 15px', 
            borderRadius: '4px', 
            border: '1px solid #ddd', 
            flex: 1,
            fontSize: '16px'
          }}
        />
        <button 
          onClick={submitQuery}
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: loading ? '#cccccc' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            minWidth: '120px'
          }}
        >
          {loading ? 'Processing...' : 'Ask Question'}
        </button>
      </div>
      
      {/* Example queries */}
      <div style={{ marginBottom: '15px' }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>Example queries:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              style={{
                padding: '8px 12px',
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#555',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#3498db';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#ddd';
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px', 
          marginTop: '10px',
          fontSize: '14px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Last query processed */}
      {lastQuery && !loading && !error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          borderRadius: '4px', 
          marginTop: '10px',
          fontSize: '14px' 
        }}>
          <strong>Last query:</strong> "{lastQuery}" was processed successfully.
        </div>
      )}
    </div>
  );
}