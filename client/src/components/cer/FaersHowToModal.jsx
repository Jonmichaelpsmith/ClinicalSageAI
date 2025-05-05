import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

/**
 * How-To Modal for FAERS Data Module
 * Provides guidance on using the FAERS data features
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @returns {JSX.Element} - Rendered component
 */
export function FaersHowToModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Using the FAERS Analysis Module</DialogTitle>
          <DialogDescription>
            Learn how to interpret FDA Adverse Event Reporting System (FAERS) data for your regulatory documents.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="comparative">Comparative Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold text-lg mb-2">What is FAERS?</h3>
              <p className="text-sm">
                The FDA Adverse Event Reporting System (FAERS) is a database that contains adverse event reports, medication error reports, and product quality complaints submitted to FDA.
              </p>
            </div>

            <h3 className="font-semibold text-lg">Key Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-sm">
                <span className="font-medium">Risk Badge:</span> Visual indicator of a product's calculated risk score
              </li>
              <li className="text-sm">
                <span className="font-medium">Adverse Event Reports:</span> View actual reports submitted to the FDA
              </li>
              <li className="text-sm">
                <span className="font-medium">Demographic Analysis:</span> Age and gender distribution of reported events
              </li>
              <li className="text-sm">
                <span className="font-medium">Comparative Analysis:</span> How your product compares to similar drugs in its class
              </li>
              <li className="text-sm">
                <span className="font-medium">Export Options:</span> Include FAERS analysis in your Clinical Evaluation Reports
              </li>
            </ul>

            <h3 className="font-semibold text-lg">Getting Started</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li className="text-sm">Enter a product name in the search field</li>
              <li className="text-sm">Click "Fetch FAERS Data" to retrieve adverse event reports</li>
              <li className="text-sm">Browse the tabbed interface to explore different data views</li>
              <li className="text-sm">Use export options to incorporate findings into your document</li>
            </ol>
          </TabsContent>

          <TabsContent value="reports" className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Understanding Adverse Event Reports</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Risk Score Interpretation</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>The risk score is calculated by analyzing the severity, frequency, and outcomes of reported adverse events.</p>
                  <ul className="mt-2 space-y-1">
                    <li><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span> &lt; 0.5: Low Risk</li>
                    <li><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span> 0.5 - 0.9: Medium Risk</li>
                    <li><span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span> 1.0 - 1.4: High Risk</li>
                    <li><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span> ≥ 1.5: Very High Risk</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Report Categories</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>Reports are categorized by severity and outcome:</p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Serious:</strong> Resulted in hospitalization, disability, or death</li>
                    <li><strong>Non-serious:</strong> Less severe outcomes</li>
                    <li><strong>Reaction Type:</strong> Categorized using MedDRA terminology</li>
                    <li><strong>Demographics:</strong> Age and gender of the reported cases</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-4">Tips for Analysis</h3>
            <div className="bg-amber-50 p-3 rounded-md text-sm">
              <ul className="space-y-2">
                <li>Look for patterns in reported adverse events</li>
                <li>Pay special attention to serious adverse events with high frequency</li>
                <li>Consider demographic factors that may influence risk profiles</li>
                <li>Use the search function to find specific reactions of interest</li>
                <li>Remember that FAERS data represents reported events, not necessarily causal relationships</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Demographic Analysis Features</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Age Distribution</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>The age distribution chart shows:</p>
                  <ul className="mt-2 space-y-1">
                    <li>Percentage of adverse events by age group</li>
                    <li>Identifies vulnerable age populations</li>
                    <li>Helps target safety monitoring efforts</li>
                    <li>Supports age-specific warnings in labeling</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Gender Distribution</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>The gender distribution chart shows:</p>
                  <ul className="mt-2 space-y-1">
                    <li>Male vs. female reporting frequencies</li>
                    <li>Identifies gender-specific safety concerns</li>
                    <li>May reveal biological differences in drug response</li>
                    <li>Supports gender-specific recommendations</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-4">Interpreting Top Reactions</h3>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p>The Top Reported Adverse Reactions table highlights:</p>
              <ul className="mt-2 space-y-1">
                <li>Most commonly reported adverse events</li>
                <li>Percentage of total reports for each reaction</li>
                <li>Helps identify key safety concerns to address in CERs</li>
                <li>Supports risk management planning</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-md text-sm mt-4">
              <h4 className="font-medium mb-2">PRO TIP: Demographic Insights</h4>
              <p>When writing your Clinical Evaluation Report, pay special attention to demographic patterns that deviate from the expected user population. These discrepancies may highlight important safety considerations for specific patient groups.</p>
            </div>
          </TabsContent>

          <TabsContent value="comparative" className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Comparative Analysis Features</h3>
            <div className="bg-blue-50 p-3 rounded-md text-sm">
              <p>The comparative analysis automatically identifies similar drugs in the same therapeutic class and compares their safety profiles.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <h4 className="font-medium">Risk Score Comparison</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>The relative risk score chart shows:</p>
                  <ul className="mt-2 space-y-1">
                    <li>How your product's risk compares to competitors</li>
                    <li>Percentile ranking within drug class</li>
                    <li>Visual indication of safety profile positioning</li>
                    <li>Supports benefit-risk assessment discussions</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Report Count Analysis</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p>The adverse event report count table provides:</p>
                  <ul className="mt-2 space-y-1">
                    <li>Total number of reports for each product</li>
                    <li>Direct numerical comparison of reporting frequency</li>
                    <li>Context for interpreting risk scores</li>
                    <li>Insights into market usage and reporting patterns</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-4">Leveraging Comparative Data</h3>
            <div className="bg-green-50 p-3 rounded-md text-sm">
              <h4 className="font-medium mb-2">Regulatory Applications</h4>
              <p>How to use comparative analysis in regulatory documents:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>For favorable comparisons: Highlight better safety profile as part of benefit-risk justification</li>
                <li>For unfavorable comparisons: Address proactively with risk mitigation strategies</li>
                <li>For similar profiles: Demonstrate alignment with established class safety standards</li>
                <li>Include contextual information about usage patterns and reporting rates</li>
                <li>Discuss any unique safety considerations specific to your product</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close Guide</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FaersHowToModal;