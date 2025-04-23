import React from 'react';

// Simple implementations that don't depend on external libraries
const useTranslation = () => {
  return {
    t: (key) => key
  };
};

// Simple Counter component instead of using react-countup
const Counter = ({ value, prefix = '', suffix = '' }) => {
  return (
    <span>{prefix}{value}{suffix}</span>
  );
};

// Simple Sparkline component instead of using react-sparklines
const Sparkline = ({ data, color = "#1e88e5" }) => {
  return (
    <div className="sparkline-placeholder" 
         style={{ 
           height: '40px', 
           backgroundColor: '#f5f5f5', 
           borderBottom: `2px solid ${color}` 
         }}
    />
  );
};

const KpiRibbon = ({ metrics }) => {
  const { t } = useTranslation();

  return (
    <div className="kpi-ribbon">
      {metrics.map((metric, index) => (
        <div key={index} className="kpi-card">
          <div className="kpi-title">{t(metric.title)}</div>
          <div className="kpi-value">
            <Counter 
              value={metric.value}
              prefix={metric.prefix || ''}
              suffix={metric.suffix || ''}
            />
          </div>
          {metric.trend && (
            <div className="kpi-trend">
              <Sparkline data={metric.trend.data} color={metric.trend.color} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default KpiRibbon;