import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, Download, Copy, FileText } from 'lucide-react';

/**
 * Full CER Report Modal Component
 * Displays a complete Clinical Evaluation Report with FAERS data integration
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.faersData - FAERS data for the report
 * @returns {JSX.Element} - Rendered component
 */
export function FullCerReportModal({ isOpen, onClose, faersData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('report');
  const [downloadFormat, setDownloadFormat] = useState('pdf');

  // Example data for demonstration - in real implementation this would be populated from API
  const reportSections = {
    deviceInfo: {
      name: faersData?.productName || "Example Medical Device",
      manufacturer: "Concept2Cures Biotech",
      classification: "Class III",
      intendedUse: "Cardiovascular monitoring and support"
    },
    clinicalEvaluation: {
      methodDescription: "This clinical evaluation was conducted in accordance with MEDDEV 2.7/1 Rev. 4 guidelines and follows the requirements of ISO 14155:2020.",
      dataTypes: ["Clinical Investigation Data", "Post-Market Surveillance", "Literature Review", "FAERS Analysis"],
      evaluationPeriod: "January 2023 - May 2025",
      evaluators: "Regulatory Affairs Team, Clinical Advisory Board, Medical Safety Officers"
    },
    faersAnalysis: {
      totalReports: faersData?.totalReports || 250,
      seriousEvents: faersData?.seriousEvents?.length || 45,
      riskScore: faersData?.riskScore || 0.87,
      conclusion: "Based on FAERS data analysis, the device demonstrates an acceptable safety profile consistent with similar devices in its class. The benefit-risk ratio remains favorable."
    },
    clinicalData: {
      totalPatients: 1250,
      adverseEvents: 74,
      severeAdverseEvents: 12,
      efficacyRate: "92.4%",
      conclusion: "Clinical data demonstrates favorable efficacy with acceptable safety profile."
    },
    literatureReview: {
      referencesReviewed: 87,
      relevantPublications: 43,
      favorableResults: 38,
      unfavorableResults: 5,
      conclusion: "Current literature supports the safety and performance of the device."
    },
    riskBenefit: {
      identifiedRisks: ["Infection (Low)", "Device Malfunction (Very Low)", "User Error (Medium)", "Allergic Reaction (Low)"],
      mitigationMeasures: ["Comprehensive training program", "Enhanced sterilization protocols", "Improved material biocompatibility", "Advanced fail-safe mechanisms"],
      benefitAssessment: "The device provides significant clinical benefit through improved diagnostic accuracy, reduced procedure time, and enhanced patient outcomes.",
      conclusion: "The comprehensive evaluation of clinical data, literature, and post-market surveillance, including FAERS data analysis, supports a favorable benefit-risk profile for continued marketing of the device."
    },
    postMarketData: {
      complaintsReceived: 28,
      fieldsCorrectiveActions: 1,
      vigilanceReports: 3,
      conclusion: "Post-market surveillance data demonstrates acceptable performance in real-world clinical settings."
    }
  };

  // Function to simulate report generation with loading state
  const generateReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate API call delay
  };

  // Handle download button click
  const handleDownload = () => {
    setIsLoading(true);
    // In a real implementation, this would trigger an API call to generate a PDF/DOCX
    setTimeout(() => {
      setIsLoading(false);
      // Simulating download completion
      alert(`CER Report downloaded in ${downloadFormat.toUpperCase()} format`);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Clinical Evaluation Report
          </DialogTitle>
          <DialogDescription>
            Complete CER with integrated FAERS analysis for {reportSections.deviceInfo.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="report" className="mt-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="report">Full Report</TabsTrigger>
            <TabsTrigger value="faers">FAERS Section</TabsTrigger>
            <TabsTrigger value="export">Export Options</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="p-4 space-y-6">
            {/* Device Information Section */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">1. Device Information</h3>
              </div>
              <div className="p-4">
                <table className="min-w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">Device Name:</td>
                      <td className="py-2 px-4">{reportSections.deviceInfo.name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">Manufacturer:</td>
                      <td className="py-2 px-4">{reportSections.deviceInfo.manufacturer}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">Classification:</td>
                      <td className="py-2 px-4">{reportSections.deviceInfo.classification}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-medium">Intended Use:</td>
                      <td className="py-2 px-4">{reportSections.deviceInfo.intendedUse}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Evaluation Method */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">2. Clinical Evaluation Methodology</h3>
              </div>
              <div className="p-4 space-y-3">
                <p>{reportSections.clinicalEvaluation.methodDescription}</p>
                <div>
                  <h4 className="font-medium mt-2 mb-1">Data Sources:</h4>
                  <ul className="list-disc pl-6">
                    {reportSections.clinicalEvaluation.dataTypes.map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <span className="font-medium">Evaluation Period:</span>
                    <p>{reportSections.clinicalEvaluation.evaluationPeriod}</p>
                  </div>
                  <div>
                    <span className="font-medium">Evaluation Team:</span>
                    <p>{reportSections.clinicalEvaluation.evaluators}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAERS Analysis Section - Key section */}
            <div className="bg-white border rounded-lg overflow-hidden border-blue-200">
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                <h3 className="font-semibold text-lg">3. FDA Adverse Event Reporting System Analysis</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <p className="text-gray-500 text-sm">Total Reports</p>
                    <p className="text-2xl font-bold">{reportSections.faersAnalysis.totalReports}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <p className="text-gray-500 text-sm">Serious Events</p>
                    <p className="text-2xl font-bold">{reportSections.faersAnalysis.seriousEvents}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <p className="text-gray-500 text-sm">Risk Score</p>
                    <p className="text-2xl font-bold">{reportSections.faersAnalysis.riskScore}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">FAERS Data Conclusion:</h4>
                  <p className="p-3 bg-blue-50 rounded-md">{reportSections.faersAnalysis.conclusion}</p>
                </div>
                
                {faersData?.comparators && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Comparative Analysis:</h4>
                    <p className="mb-2">The device was compared against similar products in its class based on FAERS data:</p>
                    <table className="min-w-full border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-3 text-left text-sm font-medium border-b">Product</th>
                          <th className="py-2 px-3 text-left text-sm font-medium border-b">Reports</th>
                          <th className="py-2 px-3 text-left text-sm font-medium border-b">Risk Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {faersData?.comparators?.map((comp, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2 px-3">{comp.comparator}</td>
                            <td className="py-2 px-3">{comp.reportCount}</td>
                            <td className="py-2 px-3">{comp.riskScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Data */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">4. Clinical Data Evaluation</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <table className="min-w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-medium">Total Patients:</td>
                          <td className="py-2 px-4">{reportSections.clinicalData.totalPatients}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-medium">Adverse Events:</td>
                          <td className="py-2 px-4">{reportSections.clinicalData.adverseEvents}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-4 font-medium">Severe AEs:</td>
                          <td className="py-2 px-4">{reportSections.clinicalData.severeAdverseEvents}</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 font-medium">Efficacy Rate:</td>
                          <td className="py-2 px-4">{reportSections.clinicalData.efficacyRate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium mb-2">Clinical Data Conclusion:</h4>
                    <p>{reportSections.clinicalData.conclusion}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk-Benefit Analysis */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">5. Risk-Benefit Analysis</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Identified Risks:</h4>
                    <ul className="list-disc pl-6">
                      {reportSections.riskBenefit.identifiedRisks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Mitigation Measures:</h4>
                    <ul className="list-disc pl-6">
                      {reportSections.riskBenefit.mitigationMeasures.map((measure, index) => (
                        <li key={index}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Benefit Assessment:</h4>
                  <p>{reportSections.riskBenefit.benefitAssessment}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <h4 className="font-medium mb-2">Risk-Benefit Conclusion:</h4>
                  <p>{reportSections.riskBenefit.conclusion}</p>
                </div>
              </div>
            </div>

            {/* Overall Conclusion */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                <h3 className="font-semibold text-lg">6. Overall Conclusion</h3>
              </div>
              <div className="p-4">
                <p className="p-3 bg-green-50 rounded-md border border-green-100">
                  Based on the comprehensive evaluation of clinical data, literature, post-market surveillance, and FAERS data analysis, 
                  {reportSections.deviceInfo.name} demonstrates a favorable benefit-risk profile. The device meets applicable safety and performance 
                  requirements and remains suitable for its intended purpose. Continued marketing of the device is supported by the available evidence.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faers" className="p-4 space-y-6">
            <div className="bg-white border rounded-lg overflow-hidden border-blue-200">
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                <h3 className="font-semibold text-lg">FDA Adverse Event Reporting System Analysis</h3>
              </div>
              <div className="p-4 space-y-4">
                <p>
                  A comprehensive analysis of the FDA Adverse Event Reporting System (FAERS) database was conducted to identify and evaluate adverse events associated with {reportSections.deviceInfo.name}.
                  This analysis is an essential component of post-market surveillance and provides valuable real-world safety data to complement clinical trial findings.
                </p>
                
                <div className="grid grid-cols-3 gap-4 my-6">
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <p className="text-gray-500 text-sm">Total Reports</p>
                    <p className="text-2xl font-bold">{reportSections.faersAnalysis.totalReports}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <p className="text-gray-500 text-sm">Serious Events</p>
                    <p className="text-2xl font-bold">{reportSections.faersAnalysis.seriousEvents}</p>
                    <p className="text-xs text-gray-500">
                      {((reportSections.faersAnalysis.seriousEvents / reportSections.faersAnalysis.totalReports) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <p className="text-gray-500 text-sm">Risk Score</p>
                    <p className="text-2xl font-bold">{reportSections.faersAnalysis.riskScore}</p>
                    <p className="text-xs text-gray-500">
                      {reportSections.faersAnalysis.riskScore < 0.5 ? 'Low Risk' : 
                       reportSections.faersAnalysis.riskScore < 1.0 ? 'Medium Risk' : 
                       reportSections.faersAnalysis.riskScore < 1.5 ? 'High Risk' : 'Very High Risk'}
                    </p>
                  </div>
                </div>
                
                {faersData?.comparators && (
                  <div>
                    <h4 className="font-medium text-lg mb-3">Comparative Analysis</h4>
                    <p className="mb-4">
                      To contextualize the safety profile of {reportSections.deviceInfo.name}, a comparative analysis was performed against similar products in its therapeutic class.
                      This analysis provides perspective on the relative safety performance of the device compared to established alternatives.
                    </p>
                    
                    <table className="min-w-full border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left text-sm font-medium border-b">Product</th>
                          <th className="py-2 px-4 text-left text-sm font-medium border-b">Total Reports</th>
                          <th className="py-2 px-4 text-left text-sm font-medium border-b">Risk Score</th>
                          <th className="py-2 px-4 text-left text-sm font-medium border-b">Risk Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Primary product row */}
                        <tr className="bg-blue-50 border-b">
                          <td className="py-2 px-4 font-medium">{reportSections.deviceInfo.name}</td>
                          <td className="py-2 px-4">{reportSections.faersAnalysis.totalReports}</td>
                          <td className="py-2 px-4">{reportSections.faersAnalysis.riskScore}</td>
                          <td className="py-2 px-4">
                            {reportSections.faersAnalysis.riskScore < 0.5 ? 'Low Risk' : 
                            reportSections.faersAnalysis.riskScore < 1.0 ? 'Medium Risk' : 
                            reportSections.faersAnalysis.riskScore < 1.5 ? 'High Risk' : 'Very High Risk'}
                          </td>
                        </tr>
                        
                        {/* Comparator rows */}
                        {faersData?.comparators?.map((comp, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-2 px-4">{comp.comparator}</td>
                            <td className="py-2 px-4">{comp.reportCount}</td>
                            <td className="py-2 px-4">{comp.riskScore}</td>
                            <td className="py-2 px-4">
                              {comp.riskScore < 0.5 ? 'Low Risk' : 
                              comp.riskScore < 1.0 ? 'Medium Risk' : 
                              comp.riskScore < 1.5 ? 'High Risk' : 'Very High Risk'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-medium text-lg mb-3">Conclusion</h4>
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <p>{reportSections.faersAnalysis.conclusion}</p>
                    <p className="mt-2">
                      The FAERS data has been incorporated into the overall benefit-risk assessment of the device, providing valuable real-world evidence
                      to complement the clinical investigation data and literature findings. The safety profile observed in FAERS aligns with expectations
                      based on the device's intended use and risk classification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="p-4 space-y-6">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">Export Options</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Format Selection</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="pdf-format" 
                          name="format" 
                          checked={downloadFormat === 'pdf'}
                          onChange={() => setDownloadFormat('pdf')}
                          className="h-4 w-4 text-blue-600" 
                        />
                        <label htmlFor="pdf-format" className="ml-2">PDF Format</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="docx-format" 
                          name="format" 
                          checked={downloadFormat === 'docx'}
                          onChange={() => setDownloadFormat('docx')}
                          className="h-4 w-4 text-blue-600" 
                        />
                        <label htmlFor="docx-format" className="ml-2">DOCX Format (Microsoft Word)</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="html-format" 
                          name="format" 
                          checked={downloadFormat === 'html'}
                          onChange={() => setDownloadFormat('html')}
                          className="h-4 w-4 text-blue-600" 
                        />
                        <label htmlFor="html-format" className="ml-2">HTML Format (Web)</label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Content Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input type="checkbox" id="include-charts" className="h-4 w-4 text-blue-600" checked />
                        <label htmlFor="include-charts" className="ml-2">Include charts and visualizations</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="include-raw" className="h-4 w-4 text-blue-600" />
                        <label htmlFor="include-raw" className="ml-2">Include raw FAERS data tables</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="include-comp" className="h-4 w-4 text-blue-600" checked />
                        <label htmlFor="include-comp" className="ml-2">Include comparative analysis</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="include-exec" className="h-4 w-4 text-blue-600" checked />
                        <label htmlFor="include-exec" className="ml-2">Include executive summary</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleDownload}
                    disabled={isLoading}
                    className="w-64"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download {downloadFormat.toUpperCase()} Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
              <h4 className="font-medium mb-2 flex items-center text-amber-800">
                <FileText className="h-4 w-4 mr-2" />
                Report Generation Information
              </h4>
              <p className="text-sm text-amber-700">
                The full CER report integrates data from multiple sources, including product specifications, clinical trial data, literature reviews, and
                FDA FAERS analysis. The report is generated in accordance with regulatory requirements and follows the MEDDEV 2.7/1 Rev. 4 guidelines.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          {activeTab === 'report' || activeTab === 'faers' ? (
            <Button 
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(document.querySelector('[role="tabpanel"]').innerText);
                alert('Report content copied to clipboard');
              }}
              className="mr-2"
            >
              <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
            </Button>
          ) : null}
          <Button onClick={onClose}>Close Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FullCerReportModal;