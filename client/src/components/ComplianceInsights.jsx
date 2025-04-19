import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  RadialBarChart, RadialBar, Legend
} from 'recharts';

const COLORS = ['#4f46e5', '#22c55e', '#ef4444', '#eab308', '#06b6d4', '#8b5cf6'];

export default function ComplianceInsights({ org }) {
  const [data, setData] = useState([]);
  
  useEffect(() => { 
    if (org) api.get(`/api/org/${org}/metrics`).then(r => setData(r.data));
  }, [org]);
  
  if (!data.length) return <p>Loading metrics…</p>;
  
  // Helper functions for data transformation
  const byType = () => {
    const m = {};
    data.filter(d => d.type === 'alert').forEach(a => m[a.msg] = (m[a.msg] || 0) + 1);
    return Object.entries(m).map(([k, v]) => ({ name: k, value: v }));
  };
  
  const byDate = () => {
    const m = {};
    data.forEach(d => { m[d.date] = (m[d.date] || 0) + 1 });
    return Object.entries(m).map(([d, v]) => ({ date: d, count: v }));
  };
  
  const serials = () => {
    const m = {};
    data.filter(d => d.type === 'esg_submission').forEach(s => {
      const mth = s.timestamp.slice(0, 7);
      m[mth] = (m[mth] || 0) + 1
    });
    return Object.entries(m).map(([k, v]) => ({ month: k, count: v }));
  };
  
  const gaugeVal = () => {
    const latest = data[data.length - 1];
    return latest && latest.forms_complete ? latest.forms_complete : 0;
  };
  
  return (
    <div className='grid grid-cols-2 gap-6 p-4 max-w-6xl mx-auto'>
      {/* 1. Alerts Over Time */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Alerts Over Time</h4>
        <LineChart width={450} height={200} data={byDate()}>
          <CartesianGrid strokeDasharray='3 3'/>
          <XAxis dataKey='date'/>
          <YAxis/>
          <Tooltip/>
          <Line type='monotone' dataKey='count' stroke={COLORS[0]} />
        </LineChart>
      </div>
      
      {/* 2. Alerts by Rule */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Alerts by Rule</h4>
        <BarChart width={450} height={200} data={byType()}>
          <CartesianGrid/>
          <XAxis dataKey='name'/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey='value' fill={COLORS[1]}/>
        </BarChart>
      </div>
      
      {/* 3. ESG Success vs Failure */}
      <div>
        <h4 className="text-lg font-semibold mb-2">ESG Success Rate</h4>
        <PieChart width={450} height={250}>
          <Pie data={[
            {name: 'Success', value: data.filter(d => d.status === 'ACK_RECEIVED').length},
            {name: 'Fail', value: data.filter(d => d.status === 'FAILURE').length}
          ]} dataKey='value' outerRadius={80}>
            {[0, 1].map(i => <Cell key={i} fill={COLORS[i]}/>)}
          </Pie>
          <Legend />
        </PieChart>
      </div>
      
      {/* 4. ACK Latency */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Average ACK Latency (h)</h4>
        <LineChart width={450} height={200} data={data.filter(d => d.type === 'esg_submission' && d.latency)}>
          <CartesianGrid/>
          <XAxis dataKey='timestamp'/>
          <YAxis/>
          <Tooltip/>
          <Line dataKey='latency' stroke={COLORS[2]}/>
        </LineChart>
      </div>
      
      {/* 5. Module3 Freshness */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Module3 Freshness</h4>
        <AreaChart width={450} height={200} data={data.filter(d => d.type === 'file' && d.file === 'module3').map(f => ({ age: f.age }))}>
          <XAxis hide />
          <YAxis/>
          <Tooltip/>
          <Area dataKey='age' stroke={COLORS[3]} fill={COLORS[3]}/>
        </AreaChart>
      </div>
      
      {/* 6. Module2 Freshness */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Module2 Freshness</h4>
        <AreaChart width={450} height={200} data={data.filter(d => d.type === 'file' && d.file === 'module2').map(f => ({ age: f.age }))}>
          <XAxis hide/>
          <YAxis/>
          <Tooltip/>
          <Area dataKey='age' stroke={COLORS[4]} fill={COLORS[4]}/>
        </AreaChart>
      </div>
      
      {/* 7. Form Completeness Gauge */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Form Completeness</h4>
        <RadialBarChart width={450} height={250} cx='50%' cy='50%' innerRadius='80%' outerRadius='100%' barSize={20} data={[{ name: 'Complete', value: gaugeVal() }]}>
          <RadialBar minAngle={15} background clockWise dataKey='value' fill={COLORS[5]}/>
          <Legend />
        </RadialBarChart>
      </div>
      
      {/* 8. Open vs Closed Alerts */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Open vs Closed Alerts</h4>
        <PieChart width={450} height={250}>
          <Pie data={[
            {name: 'Open', value: data.filter(d => d.type === 'alert').length},
            {name: 'Closed', value: data.filter(d => d.type === 'alert_closed').length}
          ]} dataKey='value' outerRadius={80}>
            {[0, 1].map(i => <Cell key={i} fill={COLORS[i + 2]}/>)}
          </Pie>
          <Legend />
        </PieChart>
      </div>
      
      {/* 9. Key/Cert Age */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Key / Cert Age Trend</h4>
        <AreaChart width={450} height={200} data={data.filter(d => d.type === 'cred_age')}>
          <CartesianGrid/>
          <XAxis dataKey='timestamp'/>
          <YAxis/>
          <Tooltip/>
          <Area dataKey='age_d' stroke={COLORS[2]} fill={COLORS[1]}/>
        </AreaChart>
      </div>
      
      {/* 10. Serials per Month */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Serials per Month</h4>
        <BarChart width={450} height={200} data={serials()}>
          <CartesianGrid/>
          <XAxis dataKey='month'/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey='count' fill={COLORS[0]}/>
        </BarChart>
      </div>
    </div>
  );
}