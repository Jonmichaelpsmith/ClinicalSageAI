import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AlertTriangle, CheckCircle, Info, Download, FileText, Eye, FileDown, Loader2, File, Rows, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cerApiService } from '@/services/CerAPIService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SaveCerToVaultButton from './SaveCerToVaultButton';

// Dynamically import export panel for code splitting
const CerReportExportPanel = lazy(() => import('./CerReportExportPanel'));

export default function CerPreviewPanel({ title, sections = [], faers = [], comparators = [], complianceData }) {
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState('document');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [reportsList, setReportsList] = useState([]);
  // Helper function to find compliance score for a section
  const getSectionComplianceStatus = (sectionTitle) => {
    if (!complianceData || !complianceData.sectionScores) return null;

    const sectionData = complianceData.sectionScores.find(
      section => section.title.toLowerCase() === sectionTitle.toLowerCase()
    );

    if (!sectionData) return null;

    return {
      score: sectionData.averageScore,
      status: sectionData.averageScore >= 0.8 ? 'compliant' : 
              sectionData.averageScore >= 0.6 ? 'needs-improvement' : 'non-compliant',
      suggestions: Object.values(sectionData.standards || {}).flatMap(s => s.suggestions || []).filter(Boolean),
      feedback: Object.values(sectionData.standards || {}).map(s => s.feedback).filter(Boolean).join(' ')
    };
  };

  // Get badge color based on compliance status
  const getComplianceColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-50 text-green-700 border-green-200';
      case 'needs-improvement': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'non-compliant': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get icon based on compliance status
  const getComplianceIcon = (status) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  // Generate MEDDEV 2.7/1 Rev 4 complaint PDF preview
  const generatePDFPreview = async () => {
    if (sections.length === 0) {
      toast({
        title: 'No content to preview',
        description: 'Add sections to your report before generating a preview.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Capture memory before starting
      let startMemory = null;
      if (window.performance && window.performance.memory) {
        startMemory = window.performance.memory.usedJSHeapSize / (1024 * 1024);
        console.log(`Memory before preview generation: ${Math.round(startMemory)}MB`);
      }
      
      setIsGeneratingPreview(true);

      // Create or get the preview container
      let previewContainer = document.getElementById('pdf-preview-container');
      if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'pdf-preview-container';
        previewContainer.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50 flex items-center justify-center';
        previewContainer.style.display = 'none';
        document.body.appendChild(previewContainer);

        // Create a loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.id = 'pdf-preview-loading';
        loadingElement.className = 'absolute inset-0 flex flex-col items-center justify-center text-white';
        loadingElement.innerHTML = `
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mb-4"></div>
          <p class="text-lg">Generating PDF Preview...</p>
        `;
        previewContainer.appendChild(loadingElement);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close Preview';
        closeButton.className = 'absolute top-4 right-4 bg-white px-4 py-2 rounded shadow text-black';
        closeButton.onclick = () => {
          // Clean up when closing to avoid memory leaks
          const iframe = previewContainer.querySelector('iframe');
          if (iframe) {
            const iframeSrc = iframe.src;
            iframe.src = 'about:blank'; // Clear the iframe content
            
            // Revoke object URL after a small delay
            setTimeout(() => {
              if (iframeSrc && iframeSrc.startsWith('blob:')) {
                URL.revokeObjectURL(iframeSrc);
              }
            }, 100);
          }
          previewContainer.style.display = 'none';
        };
        previewContainer.appendChild(closeButton);
      }

      // Show container with loading indicator
      previewContainer.style.display = 'flex';
      const loadingIndicator = document.getElementById('pdf-preview-loading');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
      }

      // Prepare data for preview with enhanced metadata
      const deviceName = title.split(' ')[0] || 'Medical Device';
      const modelNumber = 'TS-' + Date.now().toString().slice(-6);
      
      const exportData = {
        title,
        sections,
        faers,
        comparators,
        complianceData,
        templateId: 'meddev', // MEDDEV 2.7/1 Rev 4 format
        metadata: {
          device: deviceName,
          manufacturer: 'TrialSage Medical',
          modelNumber: modelNumber,
          version: '2.0',
          date: new Date().toLocaleDateString(),
          standard: 'MEDDEV 2.7/1 Rev 4',
          watermark: 'PREVIEW - NOT FOR REGULATORY SUBMISSION',
          generatedBy: 'TrialSage CER Module v2.0.1',
          // Include compliance information in the metadata
          regulatoryFramework: 'EU MDR 2017/745',
          complianceScore: complianceData?.overallScore || 'N/A',
          validationDate: new Date().toLocaleDateString()
        },
        // Enable optimizations
        optimizations: {
          reduceImageQuality: true,
          compressPdf: true,
          batchProcessing: true,
          memoryEfficient: true
        }
      };

      // Generate PDF blob with timeout handling
      const pdfBlobPromise = cerApiService.exportToPDF(exportData);
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF generation timed out')), 60000);
      });
      
      // Race the promises
      const pdfBlob = await Promise.race([pdfBlobPromise, timeoutPromise]);

      // Create object URL for preview
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }

      // Show preview in iframe - create or reuse
      let iframe = previewContainer.querySelector('iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.className = 'w-4/5 h-4/5 border-none bg-white rounded-lg shadow-lg';
        iframe.title = 'CER Preview';
        previewContainer.appendChild(iframe);
      } else {
        // Clean up previous object URL if it exists
        const previousSrc = iframe.src;
        if (previousSrc && previousSrc.startsWith('blob:')) {
          iframe.src = 'about:blank'; // Clear first
          URL.revokeObjectURL(previousSrc); // Release memory
        }
      }

      // Set new source
      iframe.src = pdfUrl;
      
      // Add download button next to close
      const downloadButton = previewContainer.querySelector('#preview-download-button');
      if (!downloadButton) {
        const newDownloadButton = document.createElement('button');
        newDownloadButton.id = 'preview-download-button';
        newDownloadButton.innerText = 'Download Preview';
        newDownloadButton.className = 'absolute top-4 right-36 bg-blue-600 text-white px-4 py-2 rounded shadow';
        newDownloadButton.onclick = () => {
          // Trigger download of the preview
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = pdfUrl;
          a.download = `CER_${deviceName.replace(/\s+/g, '_')}_${modelNumber}_preview.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
        previewContainer.appendChild(newDownloadButton);
      }

      // Check final memory usage
      if (window.performance && window.performance.memory && startMemory) {
        const endMemory = window.performance.memory.usedJSHeapSize / (1024 * 1024);
        console.log(`Memory after preview generation: ${Math.round(endMemory)}MB (Δ: ${Math.round(endMemory - startMemory)}MB)`);
        
        // Cleanup if memory usage grew significantly
        if (endMemory - startMemory > 50) { // If more than 50MB growth
          setTimeout(() => {
            if (window.gc) window.gc();
          }, 1000);
        }
      }

      toast({
        title: 'Preview Generated',
        description: 'MEDDEV 2.7/1 Rev 4 compliant preview created successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Preview generation failed:', error);
      
      // Hide the preview container if it exists
      const previewContainer = document.getElementById('pdf-preview-container');
      if (previewContainer) {
        previewContainer.style.display = 'none';
      }
      
      toast({
        title: 'Preview Generation Failed',
        description: error.message || 'Failed to generate PDF preview',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const exportToPDF = async () => {
    // New function to handle batch export
    const showBatchExportDialog = () => {
      // We'll use dynamic import to load the component only when needed
      // This helps with memory usage by not loading components until required
      import('./CerReportExportPanel').then(module => {
        const CerReportExportPanel = module.default;

        // Here we would normally show a modal dialog with this component
        // For simplicity in this implementation, we'll just redirect to a new page
        // In a real app, you would use a modal dialog component
        setShowExportPanel(true);
      }).catch(error => {
        console.error('Error loading batch export component:', error);
        toast({
          title: "Component Error",
          description: "Failed to load batch export component",
          variant: "destructive"
        });
      });
    };

    if (!sections) {
      toast({
        title: "Export error",
        description: "No sections found for export",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // Start memory monitoring
      if (window.performance && window.performance.memory) {
        const memBefore = window.performance.memory.usedJSHeapSize / (1024 * 1024);
        console.log(`Memory before export: ${Math.round(memBefore)}MB`);
      }

      const pdfBlob = await cerApiService.exportToPDF({
        title,
        sections,
        faers,
        comparators,
        complianceData,
        templateId: 'meddev'
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up resources
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Check memory after export
        if (window.performance && window.performance.memory) {
          const memAfter = window.performance.memory.usedJSHeapSize / (1024 * 1024);
          console.log(`Memory after export: ${Math.round(memAfter)}MB`);
        }
      }, 100);

      toast({
        title: "Export successful",
        description: "Your CER has been exported as PDF",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export report to PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };



  return (
    <div className="p-6 bg-white border border-[#E1DFDD] rounded-md shadow-sm">
      {/* Top panel with actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-[#E1DFDD]">
        <h1 className="text-xl font-semibold text-[#323130] mb-3 sm:mb-0">{title || 'Clinical Evaluation Report'}</h1>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={generatePDFPreview}
            disabled={isGeneratingPreview || sections.length === 0}
            className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white h-9"
            size="sm"
          >
            {isGeneratingPreview ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview PDF
              </>
            )}
          </Button>

          <Button
            onClick={exportToPDF}
            disabled={sections.length === 0}
            className="bg-[#0F6CBD] hover:bg-[#115EA3] text-white h-9"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          <SaveCerToVaultButton
            cerData={{
              title,
              sections,
              faers,
              comparators
            }}
            metadata={{
              name: title,
              version: '1.0.0',
              status: 'draft',
              description: `Clinical Evaluation Report for ${title.split(' Clinical Evaluation')[0]}`,
              tags: ['MEDDEV 2.7/1 Rev 4', 'Clinical Evaluation', 'EU MDR'],
              manufacturer: 'TrialSage Medical',
              modelNumber: 'TS-' + Date.now().toString().slice(-6),
              date: new Date().toLocaleDateString(),
              standard: 'MEDDEV 2.7/1 Rev 4'
            }}
            disabled={sections.length === 0}
            variant="default"
            className="bg-[#107C10] hover:bg-[#0B5A0B] text-white h-9"
            size="sm"
          />
        </div>
      </div>

      {/* Report info with MEDDEV 2.7/1 Rev 4 format */}
      <div className="bg-[#F3F2F1] p-4 rounded mb-6">
        <h2 className="text-base font-semibold text-[#323130] mb-2">MEDDEV 2.7/1 Rev 4 Compliant Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Device Name:</span> {title.split(' Clinical Evaluation')[0]}</p>
            <p><span className="font-medium">Document Type:</span> Clinical Evaluation Report</p>
            <p><span className="font-medium">Regulatory Framework:</span> EU MDR</p>
          </div>
          <div>
            <p><span className="font-medium">Compliance Standard:</span> MEDDEV 2.7/1 Rev 4</p>
            <p><span className="font-medium">Generation Date:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-medium">Status:</span> 
              <Badge variant="outline" className="ml-2 bg-[#FFFCE5] text-[#986F0B] border-[#F2C811]">
                Draft
              </Badge>
            </p>
          </div>
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-[#323130]">Report Contents</h2>

          {/* Table of contents */}
          <div className="mb-6 p-4 bg-white border border-[#E1DFDD] rounded">
            <h3 className="text-sm font-semibold mb-2 text-[#323130]">Table of Contents</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {sections.map((section, index) => (
                <li key={index} className="text-[#0F6CBD]">
                  <span className="text-[#323130]">{section.title || section.section}</span>
                </li>
              ))}
              {faers.length > 0 && <li className="text-[#0F6CBD]"><span className="text-[#323130]">FAERS Safety Data</span></li>}
              {comparators.length > 0 && <li className="text-[#0F6CBD]"><span className="text-[#323130]">Comparator Products Analysis</span></li>}
            </ol>
          </div>

          {/* Section content */}
          {sections.map((s, i) => {
            const complianceStatus = getSectionComplianceStatus(s.section);
            const hasComplianceData = complianceStatus !== null;

            return (
              <div 
                key={i} 
                className={`mb-4 border p-4 bg-white rounded shadow ${hasComplianceData ? `border-l-4 ${complianceStatus.status === 'compliant' ? 'border-l-green-500' : complianceStatus.status === 'needs-improvement' ? 'border-l-yellow-500' : 'border-l-red-500'}` : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-[#323130]">{s.title || s.section}</h3>
                  {hasComplianceData && (
                    <div className={`px-2 py-1 rounded-full flex items-center gap-1 text-xs border ${getComplianceColor(complianceStatus.status)}`}>
                      {getComplianceIcon(complianceStatus.status)}
                      <span>{Math.round(complianceStatus.score * 100)}% Compliant</span>
                    </div>
                  )}
                </div>

                {hasComplianceData && complianceStatus.status !== 'compliant' && (
                  <div className={`mb-3 text-sm p-2 rounded ${complianceStatus.status === 'needs-improvement' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                    <p className="font-medium mb-1">{complianceStatus.status === 'needs-improvement' ? 'Improvement Suggestions:' : 'Compliance Issues:'}</p>
                    <ul className="list-disc list-inside space-y-1">
                      {complianceStatus.suggestions.length > 0 ? (
                        complianceStatus.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))
                      ) : (
                        <li>{complianceStatus.feedback || 'Review section for regulatory compliance'}</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm text-[#323130] leading-relaxed">{s.content}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-[#F3F2F1] rounded-md border border-dashed border-[#E1DFDD]">
          <FileText className="h-12 w-12 text-[#A19F9D] mb-4" />
          <h3 className="text-lg font-semibold text-[#323130] mb-2">No Content Available</h3>
          <p className="text-[#605E5C] text-sm max-w-md text-center mb-6">
            Your report doesn't have any sections yet. Add content using the Builder, Literature, or Zero-Click Report generator.
          </p>
        </div>
      )}

      {faers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-[#323130]">FAERS Safety Data</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-[#E1DFDD]">
              <thead>
                <tr className="bg-[#F3F2F1]">
                  <th className="border border-[#E1DFDD] px-3 py-2 text-left text-[#323130]">Adverse Event</th>
                  <th className="border border-[#E1DFDD] px-3 py-2 text-left text-[#323130]">Outcome</th>
                  <th className="border border-[#E1DFDD] px-3 py-2 text-left text-[#323130]">Serious</th>
                  <th className="border border-[#E1DFDD] px-3 py-2 text-left text-[#323130]">Demographics</th>
                  <th className="border border-[#E1DFDD] px-3 py-2 text-left text-[#323130]">Date</th>
                </tr>
              </thead>
              <tbody>
                {faers.map((f, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'}>
                    <td className="border border-[#E1DFDD] px-3 py-2">{f.reaction}</td>
                    <td className="border border-[#E1DFDD] px-3 py-2">{f.outcome}</td>
                    <td className="border border-[#E1DFDD] px-3 py-2">
                      {f.is_serious ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Yes</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">No</Badge>
                      )}
                    </td>
                    <td className="border border-[#E1DFDD] px-3 py-2">
                      {f.age ? `${f.age} years, ` : ''}
                      {f.sex === '1' ? 'Male' : f.sex === '2' ? 'Female' : 'Unknown'}
                    </td>
                    <td className="border border-[#E1DFDD] px-3 py-2">{f.report_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {comparators.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-[#323130]">Comparator Products Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparators.map((c, i) => (
              <div key={i} className="border border-[#E1DFDD] rounded p-4 bg-white">
                <h3 className="font-semibold text-[#323130] mb-2">{c.comparator}</h3>
                <div className="text-sm space-y-2">
                  <p><span className="font-medium">Risk Score:</span> {c.riskScore}</p>
                  <p><span className="font-medium">Reports:</span> {c.reportCount}</p>
                  <div className="h-2 bg-[#F3F2F1] rounded-full mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        c.riskScore < 0.3 ? 'bg-green-500' : 
                        c.riskScore < 0.7 ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`}
                      style={{ width: `${c.riskScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}