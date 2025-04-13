// /client/components/DropoutSimulator.jsx
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useToast } from "@/hooks/use-toast";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DropoutSimulator({ sessionId, onEstimationComplete }) {
  const [duration, setDuration] = useState(24);
  const [arms, setArms] = useState(2);
  const [control, setControl] = useState("placebo");
  const [doseFreq, setDoseFreq] = useState("weekly");
  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/dropout-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_weeks: duration,
          arms,
          control,
          dose_frequency: doseFreq,
          session_id: sessionId
        })
      });
      
      const data = await res.json();
      setForecast(data.forecast || []);
      setSummary(data.summary || "");
      
      // Calculate average dropout rate to pass to parent
      if (data.forecast && data.forecast.length > 0) {
        const lastWeek = data.forecast[data.forecast.length - 1];
        const dropoutRate = parseFloat((lastWeek.predicted_dropout * 100).toFixed(1));
        
        // Call the callback if provided
        if (typeof onEstimationComplete === 'function') {
          onEstimationComplete(dropoutRate, [
            `Based on ${arms} treatment arms with ${control} control`,
            `${doseFreq} dosing frequency for ${duration} weeks`,
            data.summary
          ]);
        }
        
        toast({
          title: "Forecast Generated",
          description: `Predicted dropout rate: ${dropoutRate}% by week ${duration}`
        });
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
      toast({
        title: "Forecast Error",
        description: "Failed to generate dropout forecast",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: forecast.map((f) => `Week ${f.week}`),
    datasets: [
      {
        label: "Predicted Dropout %",
        data: forecast.map((f) => (f.predicted_dropout * 100).toFixed(2)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3
      }
    ]
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">📉 Dropout Simulator</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <label>Duration (weeks)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>Arms</label>
            <input
              type="number"
              value={arms}
              onChange={(e) => setArms(parseInt(e.target.value))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>Control</label>
            <select
              value={control}
              onChange={(e) => setControl(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="placebo">Placebo</option>
              <option value="active">Active</option>
              <option value="synthetic">Synthetic Control</option>
            </select>
          </div>
          <div>
            <label>Dose Frequency</label>
            <select
              value={doseFreq}
              onChange={(e) => setDoseFreq(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <Button onClick={handleForecast} disabled={loading} className="w-full">
          {loading ? "Generating..." : "⚙️ Run Forecast"}
        </Button>

        {forecast.length > 0 && (
          <>
            <div className="mt-4 h-64">
              <Line 
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Dropout Percentage (%)'
                      }
                    }
                  }
                }}
              />
            </div>
            <p className="text-sm mt-2 text-muted-foreground">{summary}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}