// /client/src/components/SummaryPacketGenerator.jsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageCheck, FileOutput, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SummaryPacketGenerator() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    protocol: "",
    ind25: "",
    ind27: "",
    sap: "Statistical Analysis Plan will include primary endpoint analysis using ANCOVA.",
    risks: ["Potential enrollment challenges", "Dropout rate above industry average"],
    success_probability: 75,
    sample_size: 120
  });
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRiskChange = (e, index) => {
    const newRisks = [...formData.risks];
    newRisks[index] = e.target.value;
    setFormData(prev => ({
      ...prev,
      risks: newRisks
    }));
  };

  const addRisk = () => {
    setFormData(prev => ({
      ...prev,
      risks: [...prev.risks, ""]
    }));
  };

  const removeRisk = (index) => {
    const newRisks = [...formData.risks];
    newRisks.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      risks: newRisks
    }));
  };

  const generatePacket = async () => {
    // Validate required fields
    if (!formData.protocol) {
      toast({
        title: "Missing information",
        description: "Please enter the protocol content at minimum",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/export/summary-packet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      toast({
        title: "Summary Packet Generated",
        description: "Complete summary packet has been created and is ready to download",
      });
      
      // Open the PDF in a new tab
      window.open("/static/summary_packet.pdf", "_blank");
      
    } catch (error) {
      console.error("Failed to generate summary packet:", error);
      toast({
        title: "Generation failed",
        description: "There was an error creating the summary packet",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-indigo-500" />
          <h3 className="text-lg font-semibold">Generate Complete Summary Packet</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="protocol">Protocol Text (Required)</Label>
            <Textarea
              id="protocol"
              name="protocol"
              value={formData.protocol}
              onChange={handleChange}
              rows={5}
              placeholder="Enter your final protocol text..."
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ind25">IND Module 2.5</Label>
              <Textarea
                id="ind25"
                name="ind25"
                value={formData.ind25}
                onChange={handleChange}
                rows={4}
                placeholder="Clinical Pharmacology Summary..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="ind27">IND Module 2.7</Label>
              <Textarea
                id="ind27"
                name="ind27"
                value={formData.ind27}
                onChange={handleChange}
                rows={4}
                placeholder="Clinical Summary..."
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="sap">Statistical Analysis Plan</Label>
            <Textarea
              id="sap"
              name="sap"
              value={formData.sap}
              onChange={handleChange}
              rows={3}
              placeholder="SAP details..."
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="success_probability">Success Probability (%)</Label>
              <Input
                id="success_probability"
                name="success_probability"
                type="number"
                min="0"
                max="100"
                value={formData.success_probability}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="sample_size">Sample Size</Label>
              <Input
                id="sample_size"
                name="sample_size"
                type="number"
                min="1"
                value={formData.sample_size}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center">
              <Label>Risk Flags</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addRisk}
              >
                Add Risk
              </Button>
            </div>
            {formData.risks.map((risk, index) => (
              <div key={index} className="flex mt-2">
                <Input
                  value={risk}
                  onChange={(e) => handleRiskChange(e, index)}
                  placeholder="Describe risk..."
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRisk(index)}
                  className="ml-2"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={generatePacket} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileOutput className="mr-2 h-4 w-4" />
                Generate Summary Packet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}