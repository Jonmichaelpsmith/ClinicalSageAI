// UseCaseGallery.jsx (subscription modules version)
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, ChevronRight } from "lucide-react";

const useCases = [
  {
    id: "biotech-ceo",
    role: "Emerging Biotech CEO",
    title: "Design smarter, without a CRO.",
    accountability: "Final signoff on trial design, budget, and investor disclosures.",
    risk: "Investor rejection, IRB delay, credibility loss.",
    whyBuy: "Upload protocol → get validated AI protocol + IND + risk map.",
    benefit: "Replaced 3 consultants. Presented an investor-ready packet in 48 hours.",
    features: ["AI Protocol Generator", "Investor Presentation Export", "Risk Assessment"],
    price: "$199/mo",
    popular: true
  },
  {
    id: "program-lead",
    role: "Clinical Program Lead",
    title: "Plan for execution, not just approval.",
    accountability: "Timelines, site engagement, dropout management.",
    risk: "Amendments, enrollment failure, slippage.",
    whyBuy: "Enter assumptions → predict dropout + simulate screen fail.",
    benefit: "Fixed dropout in Arm B before it derailed us.",
    features: ["Dropout Prediction", "Screen Fail Simulation", "Site Selection Insights"],
    price: "$149/mo",
    popular: false
  },
  {
    id: "regulatory",
    role: "Regulatory Affairs Lead",
    title: "Own the FDA conversation—with confidence.",
    accountability: "Submission quality, traceability, rejection prevention.",
    risk: "RTFs, FDA 483s, delay letters.",
    whyBuy: "AI drafts IND 2.5/2.7 + links every element to CSR precedent.",
    benefit: "This is the only system that predicted what the FDA would push back on.",
    features: ["IND Section Generator", "CSR Precedent Linking", "Regulatory Response Templates"],
    price: "$179/mo",
    popular: false
  },
  {
    id: "investigator",
    role: "Principal Investigator",
    title: "Design rare trials with real evidence.",
    accountability: "Ethical justification, power, scientific rigor.",
    risk: "IRB rejection, underpowered result, publication risk.",
    whyBuy: "Find molecule-similar CSRs, simulate dropout, autogenerate SAP.",
    benefit: "Our IRB submission was 3x stronger with real CSR support.",
    features: ["Molecule Similarity Search", "Statistical Analysis Plan Generator", "IRB Submission Support"],
    price: "$129/mo",
    popular: false
  },
  {
    id: "board-member",
    role: "Biotech Board Member",
    title: "Demand confidence before greenlighting trials.",
    accountability: "Oversight of clinical credibility + investor confidence.",
    risk: "Funding poor designs, loss of trust.",
    whyBuy: "Receive a PDF with design, risk, IND, comparator logic.",
    benefit: "The entire board voted yes in under 30 minutes.",
    features: ["Executive Summary Generator", "Confidence Assessment", "Comparative Trial Analysis"],
    price: "$99/mo",
    popular: false
  }
];

export default function UseCaseGallery({ showSubscription = true, compact = false }) {
  const [selectedModules, setSelectedModules] = useState([]);

  const toggleModule = (id) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(moduleId => moduleId !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  return (
    <div className="space-y-8">
      {!compact && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Subscribe to Individual Modules</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose only the modules you need for your specific role. Each module includes specialized features designed to solve unique challenges.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {useCases.map((uc) => (
          <Card 
            key={uc.id} 
            className={`shadow-md border overflow-hidden transition-all duration-200 ${
              selectedModules.includes(uc.id) 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {uc.popular && (
              <div className="bg-primary text-white text-xs font-semibold py-1 px-3 text-center">
                MOST POPULAR
              </div>
            )}
            
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">{uc.role}</h3>
                <Badge variant={selectedModules.includes(uc.id) ? "default" : "outline"} className="ml-2">
                  {uc.price}
                </Badge>
              </div>
              
              <p className="text-base font-semibold text-blue-600">{uc.title}</p>
              
              {!compact && (
                <>
                  <p className="text-xs text-muted-foreground">🎯 Accountability: {uc.accountability}</p>
                  <p className="text-xs text-yellow-800">⚠ Risk: {uc.risk}</p>
                  <p className="text-sm text-gray-800">✅ Why They Use It: {uc.whyBuy}</p>
                  <p className="text-sm italic text-green-700">💬 "{uc.benefit}"</p>
                  
                  <div className="pt-3">
                    <p className="text-sm font-medium mb-2">Module Features:</p>
                    <ul className="space-y-1.5">
                      {uc.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
            
            {showSubscription && (
              <CardFooter className="px-6 py-4 bg-gray-50 border-t">
                <Button 
                  className="w-full"
                  variant={selectedModules.includes(uc.id) ? "default" : "outline"}
                  onClick={() => toggleModule(uc.id)}
                >
                  {selectedModules.includes(uc.id) ? (
                    <>Subscribed <Check className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Subscribe to Module <Plus className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      {showSubscription && selectedModules.length > 0 && (
        <div className="mt-8 p-6 border rounded-lg bg-primary/5 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Selected Modules: {selectedModules.length}</h3>
            <p className="text-gray-600">
              Total Monthly Price: ${selectedModules.reduce((total, id) => {
                const module = useCases.find(uc => uc.id === id);
                return total + parseInt(module.price.replace('$', '').replace('/mo', ''));
              }, 0)}/mo
            </p>
          </div>
          <Button className="mt-4 md:mt-0" size="lg">
            Complete Subscription <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}