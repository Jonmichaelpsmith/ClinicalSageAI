import React, { useState, useEffect } from 'react';
import CerBuilderPanel from '@/components/cer/CerBuilderPanel';
import CerPreviewPanel from '@/components/cer/CerPreviewPanel';
import LiteratureSearchPanel from '@/components/cer/LiteratureSearchPanel';
import QAChecklistButton from '@/components/cer/QAChecklistButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportToPDF, exportToWord, downloadBlob, fetchFaersData } from '@/services/CerAPIService';
import { useToast } from '@/hooks/use-toast';

export default function CERV2Page() {
  const [title, setTitle] = useState('Clinical Evaluation Report');
  const [faers, setFaers] = useState([]);
  const [comparators, setComparators] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadFaersData = async () => {
      if (!title || title === 'Clinical Evaluation Report') return;
      
      try {
        setIsLoading(true);
        const data = await fetchFaersData(title);
        if (data) {
          setFaers(data.reports || []);
          setComparators(data.comparators || []);
        }
      } catch (error) {
        console.error('Failed to load FAERS data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the FAERS data loading to avoid excessive API calls
    const timer = setTimeout(() => {
      loadFaersData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CER Generator</h1>
        <QAChecklistButton variant="outline" />
      </div>
      
      <div className="bg-white p-4 rounded shadow border">
        <h2 className="text-xl font-bold mb-2">🧠 How to Use the CER Generator</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select a section type and provide context</li>
          <li>Generate and add each needed section to your report</li>
          <li>Preview and export your complete CER as PDF or DOCX</li>
        </ol>
      </div>

      <div className="bg-white p-4 rounded shadow border">
        <h2 className="text-2xl font-bold mb-4">Clinical Evaluation Report Builder</h2>
        <p className="text-sm text-gray-600 mb-4">Generate, review, and export your Clinical Evaluation Report with FAERS data integration</p>

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="flex gap-2 mb-4">
            <TabsTrigger value="builder">🧱 Section Generator</TabsTrigger>
            <TabsTrigger value="preview">📄 Report Preview</TabsTrigger>
            <TabsTrigger value="literature">📚 Literature</TabsTrigger>
            <TabsTrigger value="export">📤 Export Options</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <CerBuilderPanel
              title={title}
              faers={faers}
              comparators={comparators}
              sections={sections}
              onTitleChange={setTitle}
              onSectionsChange={setSections}
              onFaersChange={setFaers}
              onComparatorsChange={setComparators}
            />
          </TabsContent>

          <TabsContent value="preview">
            <CerPreviewPanel
              title={title}
              faers={faers}
              comparators={comparators}
              sections={sections}
            />
          </TabsContent>

          <TabsContent value="literature">
            <LiteratureSearchPanel
              onAddSection={(newSection) => {
                // Add the new section to the sections array
                const updatedSections = [...sections, newSection];
                setSections(updatedSections);
                
                // Show success notification
                toast({
                  title: "Literature Review Added",
                  description: "The generated literature review has been added to your CER.",
                  variant: "success",
                });
              }}
            />
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Export Your Report</h3>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    try {
                      const blob = await exportToPDF({ title, faers, comparators, sections });
                      downloadBlob(blob, 'cer_report.pdf');
                    } catch (error) {
                      console.error('Failed to export PDF:', error);
                      alert('Failed to export PDF. Please try again.');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Download PDF
                </button>
                <button
                  onClick={async () => {
                    try {
                      const blob = await exportToWord({ title, faers, comparators, sections });
                      downloadBlob(blob, 'cer_report.docx');
                    } catch (error) {
                      console.error('Failed to export Word document:', error);
                      alert('Failed to export Word document. Please try again.');
                    }
                  }}
                  className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Download Word
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}