// /client/src/pages/example-reports.jsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import axios from "axios";

export default function ExampleReportsPage() {
  const [reportIndex, setReportIndex] = useState([]);
  const [reportManifests, setReportManifests] = useState({});
  const [launchConfig, setLaunchConfig] = useState({});
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const loadReports = async () => {
      try {
        // Load report index
        const indexRes = await axios.get("/static/example_reports/report_index.json");
        setReportIndex(indexRes.data.available_subscriptions || []);

        // Load launch configuration
        const launchRes = await axios.get("/api/launch-config");
        setLaunchConfig(launchRes.data);

        // Fetch all manifest files
        for (const sub of indexRes.data.available_subscriptions) {
          try {
            const manifestRes = await axios.get(sub.path);
            setReportManifests(prev => ({ ...prev, [sub.persona]: manifestRes.data }));
          } catch (err) {
            console.error("Error loading report manifest:", err);
          }
        }
      } catch (err) {
        console.error("Error loading reports:", err);
        toast({
          title: "Failed to load reports",
          description: "Please try again later or contact support.",
          variant: "destructive"
        });
      }
    };
    loadReports();
  }, [toast]);

  const handleGenerateReport = (persona) => {
    if (!launchConfig[persona]) {
      toast({
        title: "Configuration Not Found",
        description: "Sorry, this report type is not yet available for generation.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the planning route with the correct parameters
    navigate(launchConfig[persona].route);
    
    toast({
      title: "Launching Report Generator",
      description: `Setting up your ${persona} planning session...`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LumenTrialGuide.AI Report Library</h1>
        <p className="text-muted-foreground">
          Explore role-specific intelligence reports built from real-world CSR data, predictive modeling, and AI-guided study design.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportIndex.map(({ persona, title }) => {
          const manifest = reportManifests[persona];
          return (
            <Card key={persona} className="bg-white shadow-md border hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  {manifest && manifest.persona_id && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {manifest.persona_id.toUpperCase()}
                    </span>
                  )}
                </div>
                
                {manifest && (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">{manifest.description || manifest.short_description}</p>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Includes:</h3>
                      <ul className="text-sm list-disc pl-5 space-y-1">
                        {manifest.key_benefits ? (
                          manifest.key_benefits.slice(0, 4).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))
                        ) : manifest.includes ? (
                          manifest.includes.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))
                        ) : (
                          <li>Sample intelligence reports</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-4">
                      {manifest.reports ? (
                        // New format with reports array
                        manifest.reports.slice(0, 3).map((report, i) => (
                          <a
                            key={i}
                            href={`/static/example_reports/${persona}/${report.file_name}`}
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📄 {report.title} ({report.file_type})
                          </a>
                        ))
                      ) : manifest.files ? (
                        // Legacy format with files array
                        manifest.files.map((file, i) => (
                          <a
                            key={i}
                            href={`/static/example_reports/${persona}/${file}`}
                            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📄 Download: {file}
                          </a>
                        ))
                      ) : null}
                      
                      <Button 
                        variant="default" 
                        className="mt-2 w-full"
                        onClick={() => handleGenerateReport(persona)}
                      >
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