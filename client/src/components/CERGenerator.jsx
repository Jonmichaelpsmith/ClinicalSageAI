import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CERGenerator() {
    const [ndcCode, setNdcCode] = useState('00002-3227');
    const [cerReport, setCerReport] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateCER = async () => {
        if (!ndcCode) {
            setError("Please enter a valid NDC code");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Call the CER API
            const res = await fetch(`/api/cer/${ndcCode}`);
            
            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }
            
            const data = await res.json();
            setCerReport(data.cer_report);
        } catch (err) {
            console.error("Error generating CER:", err);
            setError(err.message || "An error occurred while generating the report");
        } finally {
            setLoading(false);
        }
    };
    
    const downloadPDF = async () => {
        // Use the FastAPI endpoint for PDF generation
        try {
            const response = await fetch(`/api/narrative/faers/${ndcCode}/pdf?periods=3`);
            
            if (!response.ok) {
                throw new Error(`Failed to generate PDF: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CER_${ndcCode}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            setError(err.message || "An error occurred while downloading the PDF");
        }
    };

    return (
        <Card className="p-4 shadow-lg">
            <h2 className="text-xl font-semibold">Clinical Evaluation Report (CER)</h2>
            <div className="mt-4 space-y-4">
                <div>
                    <label className="text-sm text-muted-foreground block mb-1">
                        Enter NDC Code
                    </label>
                    <Input
                        placeholder="E.g., 00002-3227"
                        value={ndcCode}
                        onChange={(e) => setNdcCode(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2">
                    <Button onClick={generateCER} disabled={loading}>
                        {loading && <Spinner className="mr-2 h-4 w-4" />}
                        Generate CER
                    </Button>
                    
                    {cerReport && (
                        <Button variant="outline" onClick={downloadPDF}>
                            <Download className="w-4 h-4 mr-2" /> PDF
                        </Button>
                    )}
                </div>
                
                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
                        {error}
                    </div>
                )}
            </div>
            
            {cerReport && (
                <div className="mt-4">
                    <h3 className="font-medium mb-2">Generated Report</h3>
                    <ScrollArea className="h-[400px] border rounded-md p-4">
                        <div className="whitespace-pre-wrap">
                            {cerReport}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </Card>
    );
}