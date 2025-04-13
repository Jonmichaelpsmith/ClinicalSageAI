// /client/src/components/SubscriptionTiers.jsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const SUBSCRIPTION_PERSONAS = [
  "ceo",
  "biostats",
  "ops",
  "planner",
  "writer",
  "regulatory",
  "investor",
  "pi",
  "intelligence",
  "cxo"
];

const SUBSCRIPTION_LABELS = {
  ceo: "CEO Strategy Suite",
  biostats: "Biostatistics Suite",
  ops: "Clinical Operations Suite",
  planner: "Study Planning Suite",
  writer: "Medical Writing Suite",
  regulatory: "Regulatory Affairs Suite",
  investor: "Investor Readiness Suite",
  pi: "Principal Investigator Suite",
  intelligence: "Study Intelligence Suite",
  cxo: "Executive Team Bundle"
};

export default function SubscriptionTiers() {
  const [packages, setPackages] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchManifest = async (persona) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/reports/generate", { persona });
      setPackages(prev => ({ ...prev, [persona]: res.data }));
    } catch (err) {
      console.error("Error loading report manifest:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    SUBSCRIPTION_PERSONAS.forEach(fetchManifest);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">LumenTrialGuide.AI Subscription Intelligence Packages</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Explore role-based intelligence bundles, report outputs, and real examples from global CSR-backed designs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {SUBSCRIPTION_PERSONAS.map((persona) => {
          const manifest = packages[persona];
          return (
            <Card key={persona} className="bg-white shadow-md">
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-2">{SUBSCRIPTION_LABELS[persona]}</h2>

                {loading && !manifest && <p className="text-xs text-gray-400">Loading...</p>}

                {manifest && (
                  <>
                    <ul className="text-sm text-gray-700 list-disc pl-4 space-y-1 mb-3">
                      {manifest.includes.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild>
                        <a
                          href={`/static/example_reports/${persona}/${manifest.files[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📄 View Example Report
                        </a>
                      </Button>
                      <Button variant="default" onClick={() => alert("TODO: Connect to intelligence engine")}>
                        ⚙️ Generate Your Own Report
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