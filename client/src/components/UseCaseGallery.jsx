// UseCaseGallery.jsx (strategic version)
import { Card, CardContent } from "@/components/ui/card";

const useCases = [
  {
    role: "Emerging Biotech CEO",
    title: "Design smarter, without a CRO.",
    accountability: "Final signoff on trial design, budget, and investor disclosures.",
    risk: "Investor rejection, IRB delay, credibility loss.",
    whyBuy: "Upload protocol → get validated AI protocol + IND + risk map.",
    benefit: "Replaced 3 consultants. Presented an investor-ready packet in 48 hours.",
  },
  {
    role: "Clinical Program Lead",
    title: "Plan for execution, not just approval.",
    accountability: "Timelines, site engagement, dropout management.",
    risk: "Amendments, enrollment failure, slippage.",
    whyBuy: "Enter assumptions → predict dropout + simulate screen fail.",
    benefit: "Fixed dropout in Arm B before it derailed us."
  },
  {
    role: "Regulatory Affairs Lead",
    title: "Own the FDA conversation—with confidence.",
    accountability: "Submission quality, traceability, rejection prevention.",
    risk: "RTFs, FDA 483s, delay letters.",
    whyBuy: "AI drafts IND 2.5/2.7 + links every element to CSR precedent.",
    benefit: "This is the only system that predicted what the FDA would push back on."
  },
  {
    role: "Principal Investigator",
    title: "Design rare trials with real evidence.",
    accountability: "Ethical justification, power, scientific rigor.",
    risk: "IRB rejection, underpowered result, publication risk.",
    whyBuy: "Find molecule-similar CSRs, simulate dropout, autogenerate SAP.",
    benefit: "Our IRB submission was 3x stronger with real CSR support."
  },
  {
    role: "Biotech Board Member",
    title: "Demand confidence before greenlighting trials.",
    accountability: "Oversight of clinical credibility + investor confidence.",
    risk: "Funding poor designs, loss of trust.",
    whyBuy: "Receive a PDF with design, risk, IND, comparator logic.",
    benefit: "The entire board voted yes in under 30 minutes."
  }
];

export default function UseCaseGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {useCases.map((uc, idx) => (
        <Card key={idx} className="shadow-md border border-gray-200">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-lg font-bold">{uc.role}</h3>
            <p className="text-base font-semibold text-blue-600">{uc.title}</p>
            <p className="text-xs text-muted-foreground">🎯 Accountability: {uc.accountability}</p>
            <p className="text-xs text-yellow-800">⚠ Risk: {uc.risk}</p>
            <p className="text-sm text-gray-800">✅ Why They Use It: {uc.whyBuy}</p>
            <p className="text-sm italic text-green-700">💬 "{uc.benefit}"</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}