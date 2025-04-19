import React, { useState } from 'react';
import api from '../../services/api';

export default function WidgetBuilder({ onSave, initialData = {} }) {
  const [data, setData] = useState({
    name: '',
    sql: 'SELECT metric_name, metric_value FROM metrics',
    type: 'bar',
    ...initialData
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const testQuery = async () => {
    setLoading(true);
    try {
      const result = await api.post('/api/org/org1/widgets/execute', { sql: data.sql });
      setPreview(result.data);
    } catch (error) {
      setPreview({ error: error.message || 'Failed to execute SQL' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 w-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          {initialData.id ? 'Edit Widget' : 'Add KPI Widget'}
        </h3>
        <button 
          className="text-xs text-gray-500 hover:text-gray-700" 
          onClick={testQuery}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Test SQL'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-3">
            <label className="block text-sm mb-1">Widget Name</label>
            <input 
              className="border p-1 w-full rounded-sm" 
              placeholder="Widget name" 
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })} 
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Chart Type</label>
            <select 
              className="border p-1 w-full rounded-sm"
              value={data.type}
              onChange={e => setData({ ...data, type: e.target.value })}
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">SQL Query</label>
            <textarea 
              className="border p-1 w-full h-40 font-mono text-xs rounded-sm"
              value={data.sql}
              onChange={e => setData({ ...data, sql: e.target.value })}
            />
            <div className="text-xs text-gray-500 mt-1">
              Query the metrics table with columns: metric_name, metric_value, category, timestamp
            </div>
          </div>
        </div>
        
        <div className="border rounded-sm p-2">
          <h4 className="text-xs font-semibold mb-2">Preview</h4>
          {preview ? (
            preview.success ? (
              <div className="text-xs">
                <div className="mb-1">{preview.results.length} rows returned</div>
                <pre className="bg-gray-50 p-1 overflow-auto h-40">
                  {JSON.stringify(preview.results, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-500 text-xs">
                {preview.error}
              </div>
            )
          ) : (
            <div className="text-gray-400 text-xs">
              Click "Test SQL" to preview results
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <button 
          className="bg-gray-300 text-gray-800 px-3 py-1 rounded" 
          onClick={() => onSave(null)}
        >
          Cancel
        </button>
        <button 
          className="bg-blue-600 text-white px-3 py-1 rounded" 
          onClick={() => onSave(data)}
          disabled={!data.name || !data.sql}
        >
          Save
        </button>
      </div>
    </div>
  );
}
