import React, { useState } from 'react';
import { 
  FileText, Download, FileUp, Share2, 
  Edit, Trash2, File, Clock, User, Tag, 
  CheckCircle, AlertCircle, ChevronDown, Menu,
  Save, FilePdf, FileText as FileWordIcon
} from 'lucide-react';
import { downloadDocument, convertDocument } from '../../hooks/useDocumentDownload';
import { Tooltip } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

export default function DocumentViewer({ 
  document, 
  allowDelete = true,
  hideMetadata = false,
  onDelete = null
}) {
  const { toast } = useToast();
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="bg-white rounded-lg p-8 text-center shadow-sm max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Selected</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select a document from the folder tree to preview it here.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
            <div className="flex items-center">
              <FileText size={14} className="mr-1" /> View
            </div>
            <div className="flex items-center">
              <Download size={14} className="mr-1" /> Download
            </div>
            <div className="flex items-center">
              <Share2 size={14} className="mr-1" /> Share
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleDownload = async (format = 'original') => {
    setIsDownloading(true);
    try {
      let result;
      
      if (format === 'original') {
        result = await downloadDocument(document);
      } else {
        result = await convertDocument(document, format);
      }
      
      if (result.success) {
        toast({
          title: "Download Successful",
          description: result.message,
          variant: "default",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download document",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setIsDownloadMenuOpen(false);
    }
  };
  
  // Get file icon based on document type/extension
  const getFileIcon = () => {
    const fileName = document.displayName.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return <FilePdf size={40} className="text-red-500" />;
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return <FileWordIcon size={40} className="text-blue-600" />;
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return <File size={40} className="text-green-600" />;
    } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      return <File size={40} className="text-orange-600" />;
    } else {
      return <FileText size={40} className="text-gray-600" />;
    }
  };
  
  return (
    <div className="h-full flex flex-col rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText size={18} className="mr-2 text-blue-600" />
          {document.displayName}
        </h3>
        <div className="flex space-x-1">
          {allowDelete && onDelete && (
            <button 
              className="p-1.5 rounded hover:bg-red-50 text-red-500" 
              title="Delete document"
              onClick={() => onDelete(document)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className={`grid ${hideMetadata ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4 p-4 bg-white flex-grow`}>
        <div className={hideMetadata ? 'col-span-1' : 'col-span-2'}>
          <div className="flex items-center mb-4">
            <div className="relative">
              <button 
                className={`inline-flex items-center justify-center px-3 py-1.5 border rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none text-sm mr-2 ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
                disabled={isDownloading}
              >
                <Download size={14} className="mr-1.5" />
                Download
                <ChevronDown size={14} className="ml-1.5" />
              </button>
              
              {isDownloadMenuOpen && (
                <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDownload('original')}
                    >
                      <Download size={14} className="mr-2" />
                      Download Original
                    </button>
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDownload('pdf')}
                    >
                      <FilePdf size={14} className="mr-2 text-red-500" />
                      Download as PDF
                    </button>
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDownload('docx')}
                    >
                      <FileWordIcon size={14} className="mr-2 text-blue-600" />
                      Download as Word
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none text-sm mr-2">
              <Share2 size={14} className="mr-1.5" />
              Share
            </button>
            
            {!hideMetadata && (
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none text-sm">
                <Edit size={14} className="mr-1.5" />
                Edit
              </button>
            )}
          </div>
          
          <div className="border rounded-lg p-6 text-center flex flex-col items-center">
            {getFileIcon()}
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">{document.displayName}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {document.type || "Document"}
            </p>
            
            {document.status && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${
                document.status === "Final" 
                  ? "bg-green-100 text-green-800" 
                  : document.status === "Draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : document.status === "Under Review"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
              }`}>
                {document.status === "Final" && <CheckCircle size={12} className="mr-1" />}
                {document.status}
              </span>
            )}
            
            <div className="border-t w-full pt-4 mt-2">
              <p className="text-sm text-gray-600">
                Click the Download button to save this document in different formats
              </p>
            </div>
          </div>
        </div>
        
        {!hideMetadata && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-900 mb-3">Document Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex">
                <div className="text-gray-500 w-28 flex items-center">
                  <File size={14} className="mr-1.5" /> Document Type:
                </div>
                <div className="font-medium">{document.type || "Not specified"}</div>
              </div>
              <div className="flex">
                <div className="text-gray-500 w-28 flex items-center">
                  <Clock size={14} className="mr-1.5" /> Last Modified:
                </div>
                <div className="font-medium">{document.lastModified || "Unknown"}</div>
              </div>
              <div className="flex">
                <div className="text-gray-500 w-28 flex items-center">
                  <CheckCircle size={14} className="mr-1.5" /> Status:
                </div>
                <div className="font-medium">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    document.status === "Final" 
                      ? "bg-green-100 text-green-800" 
                      : document.status === "Draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : document.status === "Under Review"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                  }`}>
                    {document.status || "Unknown"}
                  </span>
                </div>
              </div>
              <div className="flex">
                <div className="text-gray-500 w-28 flex items-center">
                  <User size={14} className="mr-1.5" /> Author:
                </div>
                <div className="font-medium">{document.author || "Unknown"}</div>
              </div>
              
              {document.tags && document.tags.length > 0 && (
                <div className="flex">
                  <div className="text-gray-500 w-28 flex items-center">
                    <Tag size={14} className="mr-1.5" /> Tags:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional metadata could be displayed here */}
              <div className="pt-4 border-t mt-4">
                <h5 className="font-medium text-gray-900 mb-2">Document Actions</h5>
                <div className="space-y-2">
                  <button className="inline-flex w-full items-center px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50">
                    <Download size={14} className="mr-1.5" /> Export Metadata
                  </button>
                  <button className="inline-flex w-full items-center px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50">
                    <AlertCircle size={14} className="mr-1.5" /> Compliance Check
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}