// AdvancedDashboard.jsx
import React, { useState, useEffect } from 'react';

// Import Plot dynamically to avoid issues if plotly isn't installed yet
const PlotComponent = ({ data, layout }) => {
  const [Plot, setPlot] = useState(null);

  useEffect(() => {
    // Dynamically import the Plot component when it becomes available
    import('react-plotly.js')
      .then(module => {
        setPlot(() => module.default);
      })
      .catch(err => {
        console.error('Error loading Plotly:', err);
      });
  }, []);

  if (!Plot) {
    return <div>Loading plot component...</div>;
  }

  return <Plot data={data} layout={layout} />;
};

export default function AdvancedDashboard({ ndcCodes }) {
  const [comparativeData, setComparativeData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch comparative analytics from the backend
  const fetchComparativeData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cer/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ndc_codes: ndcCodes }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data.');
      }
      const data = await response.json();
      setComparativeData(data.comparative_data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to mock data if the endpoint is not yet available
  const useFallbackData = () => {
    console.log('Using fallback data as the endpoint is not available yet');
    // This is just placeholder data until the backend endpoint is implemented
    const mockData = {};
    
    ndcCodes.forEach(ndc => {
      mockData[ndc] = {
        event_summary: {
          'Headache': 45,
          'Nausea': 32,
          'Dizziness': 28,
          'Fatigue': 25,
          'Rash': 19
        },
        forecasts: {
          'Headache': {
            'Q1 2025': 48,
            'Q2 2025': 46,
            'Q3 2025': 43,
            'Q4 2025': 42
          },
          'Nausea': {
            'Q1 2025': 34,
            'Q2 2025': 33,
            'Q3 2025': 31,
            'Q4 2025': 30
          }
        }
      };
    });
    
    return mockData;
  };

  useEffect(() => {
    if (ndcCodes && ndcCodes.length > 0) {
      fetchComparativeData()
        .catch(err => {
          console.error('Falling back to mock data due to error:', err);
          setComparativeData(useFallbackData());
        });
    }
  }, [ndcCodes]);

  if (loading) return <div className="flex justify-center p-8">Loading analytics...</div>;
  if (error) return <div className="bg-red-50 text-red-500 p-4 rounded">Error: {error}</div>;
  if (!comparativeData) return <div className="flex justify-center p-8">No data available</div>;

  // For demonstration, use data from the first NDC code in the list.
  const firstNdc = ndcCodes[0];
  const ndcData = comparativeData[firstNdc];
  if (!ndcData) return <div>No data available for {firstNdc}</div>;

  const events = Object.keys(ndcData.event_summary);
  const counts = events.map(event => ndcData.event_summary[event]);

  // Prepare forecast data if an event is selected
  const selectedForecast =
    selectedEvent && ndcData.forecasts[selectedEvent]
      ? Object.values(ndcData.forecasts[selectedEvent])
      : [];

  // Chart data for Plotly
  const barChartData = [{
    x: events,
    y: counts,
    type: 'bar',
    name: 'Adverse Event Counts',
  }];
  
  const barChartLayout = {
    title: `Event Summary for NDC ${firstNdc}`,
    xaxis: { title: 'Adverse Event' },
    yaxis: { title: 'Count' },
  };

  // Line chart data for forecasts
  const forecastData = selectedEvent && selectedForecast.length > 0 ? [
    {
      x: Object.keys(ndcData.forecasts[selectedEvent]),
      y: selectedForecast,
      type: 'line',
      name: `Forecast for ${selectedEvent}`,
    }
  ] : [];
  
  const forecastLayout = {
    title: `Forecast for ${selectedEvent}`,
    xaxis: { title: 'Time' },
    yaxis: { title: 'Predicted Count' },
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">Advanced Comparative Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          View and compare adverse event data across multiple products using advanced analytics.
        </p>
      </div>

      {/* Bar chart for event summary */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <h3 className="text-lg font-medium mb-4">Event Summary</h3>
        <div className="h-[400px] w-full">
          {/* Render the bar chart using dynamic import */}
          <PlotComponent data={barChartData} layout={barChartLayout} />
        </div>
      </div>

      {/* Event selection for forecasting */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="mb-4">
          <label htmlFor="event-select" className="block text-sm font-medium mb-2">
            Select an event for forecasting details:
          </label>
          <select 
            id="event-select"
            className="w-full p-2 border border-gray-300 rounded-md"
            onChange={(e) => setSelectedEvent(e.target.value)} 
            value={selectedEvent || ''}
          >
            <option value="" disabled>-- Choose an event --</option>
            {events.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>

        {/* Forecast chart */}
        {selectedEvent && selectedForecast.length > 0 && (
          <div className="h-[400px] w-full mt-4">
            <PlotComponent data={forecastData} layout={forecastLayout} />
          </div>
        )}
      </div>
    </div>
  );
}