// /client/pages/example-reports.jsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useLocation } from "wouter";

export default function ExampleReportsPage() {
  const [reportIndex, setReportIndex] = useState([]);
  const [reportManifests, setReportManifests] = useState({});
  const [launchConfig, setLaunchConfig] = useState({});
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadReports = async () => {
      const indexRes = await axios.get("/static/example_reports/report_index.json");
      setReportIndex(indexRes.data.available_subscriptions || []);

      const launchRes = await axios.get("/launch_config.json");
      setLaunchConfig(launchRes.data || {});

      for (const sub of indexRes.data.available_subscriptions) {
        try {
          const manifestRes = await axios.get(sub.path);
          setReportManifests(prev => ({ ...prev, [sub.persona]: manifestRes.data }));
        } catch (err) {
          console.error("Error loading report manifest:", err);
        }
      }
    };
    loadReports();
  }, []);

  const handleLaunch = (persona) => {
    const config = launchConfig[persona];
    if (!config) {
      alert("Persona configuration not found.");
      return;
    }
    navigate(`${config.route}&study_id=${config.study_id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">LumenTrialGuide.AI Report Library</h1>
      <p className="text-muted-foreground text-sm mb-4">
        Explore real-world, role-specific intelligence packages. Then generate your own with full AI and CSR-backed insight.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportIndex.map(({ persona, title }) => {
          const manifest = reportManifests[persona];
          return (
            <Card key={persona} className="bg-white shadow-md border">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                {manifest && (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">{manifest.description}</p>
                    <ul className="text-sm list-disc pl-4 mb-4 space-y-1">
                      {manifest.includes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-2">
                      {manifest.files.map((file, i) => (
                        <a
                          key={i}
                          href={`/static/example_reports/${persona}/${file}`}
                          className="text-blue-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 Download: {file}
                        </a>
                      ))}
                      <Button variant="default" onClick={() => handleLaunch(persona)}>
                        ⚙️ Generate My Own Report
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}