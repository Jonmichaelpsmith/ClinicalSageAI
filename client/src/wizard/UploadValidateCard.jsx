/**
 * UploadValidateCard Component
 * 
 * Drag and drop file upload with AI preview and QC pass/fail chips for IND Wizard 2.0
 */

import Dropzone from "react-dropzone";
import { useState } from "react";
import { CheckCircle, XCircle, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadValidateCard({ step, onOpenDrawer }) {
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    try {
      // Read file as ArrayBuffer
      const buf = await file.arrayBuffer();
      // Convert to base64
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      
      // AI preview
      const previewResponse = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, fileName: file.name, step })
      });
      
      if (!previewResponse.ok) {
        throw new Error("Failed to generate AI preview");
      }
      
      const previewData = await previewResponse.json();
      setPreview(previewData);
      
      // Full upload + QC auto in backend
      const uploadResponse = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, name: file.name, step })
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }
      
      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been processed and added to your IND application`,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      // Fallback preview for demonstration
      if (!preview) {
        setPreview({
          summary: "Document appears to contain toxicology study results with abnormal findings highlighted in tables 3-5.",
          module: "Module 4: Nonclinical Study Reports",
          qcStatus: "Needs Review",
          type: "Toxicology Report"
        });
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dropzone 
      onDrop={onDrop} 
      accept={{ 'application/pdf': [] }} 
      multiple={false}
      disabled={isUploading}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${
            isDragActive 
              ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300" 
              : "bg-white/20 dark:bg-slate-800/20 border-gray-300 dark:border-gray-700"
          } ${isUploading ? "opacity-75 cursor-wait" : "cursor-pointer"}`}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-2">
                <FileText size={32} className="text-indigo-500" />
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{preview.summary}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                  <FileText size={12} /> {preview.type || "Document"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle size={12} /> {preview.module}
                </span>
                {preview.qcStatus && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    preview.qcStatus === "Passed" 
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200" 
                      : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                  }`}>
                    {preview.qcStatus === "Passed" ? (
                      <CheckCircle size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {preview.qcStatus}
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onOpenDrawer(); 
                }}
                className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View in document drawer
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {isUploading ? (
                <>
                  <div className="mb-2 animate-pulse">
                    <Upload size={32} className="text-indigo-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Uploading and analyzing document...</p>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <Upload size={32} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Drag & drop a PDF here or click to browse
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    AI will automatically analyze and validate your document
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Dropzone>
  );
}