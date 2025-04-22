/**
 * UploadValidateCard Component
 * 
 * Drag and drop file upload with AI preview, commit/review decision
 * and QC pass/fail chips for IND Wizard 3.0
 */

import Dropzone from "react-dropzone";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";

export default function UploadValidateCard({ step, onOpenDrawer }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const { toast } = useToast();
  
  const onDrop = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setStatus("preview");
    
    try {
      // Read file as ArrayBuffer
      const buf = await file.arrayBuffer();
      // Convert to base64
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      
      // AI preview
      const pv = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, fileName: file.name })
      }).then(r => r.json());
      
      setPreview(pv);
      setStatus("review");
      
      // Keep file buffer for commit
      window.__pendingUpload = { base64, name: file.name };
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setStatus("idle");
    }
  };

  const commit = async () => {
    setStatus("upload");
    try {
      const { base64, name } = window.__pendingUpload;
      
      await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, name, step })
      });
      
      toast({
        title: "Document committed",
        description: `${name} has been processed and added to your IND application`,
      });
      
      setStatus("done");
      setTimeout(() => {
        setPreview(null);
        setStatus("idle");
      }, 2000);
      
    } catch (error) {
      console.error("Commit error:", error);
      toast({
        title: "Commit failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setStatus("review");
    }
  };
  
  return (
    <Dropzone 
      onDrop={onDrop} 
      accept={{ 'application/pdf': [] }} 
      multiple={false}
      disabled={status !== "idle"}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div 
          {...getRootProps()} 
          className={clsx("border-2 border-dashed rounded-2xl p-10 text-center transition", 
            isDragActive 
              ? "bg-regulatory-50 dark:bg-regulatory-900/20 border-regulatory-300" 
              : "bg-white/30 dark:bg-slate-800/30 border-gray-300 dark:border-gray-700",
            status === "idle" ? "cursor-pointer" : "cursor-default"
          )}
        >
          <input {...getInputProps()} />
          
          {status === "idle" && (
            <p className="text-gray-500 dark:text-gray-400">
              Drag & drop PDF here or click to browse
            </p>
          )}
          
          {status === "preview" && (
            <p className="text-gray-600 dark:text-gray-300">Analyzing...</p>
          )}
          
          {status === "review" && preview && (
            <div className="space-y-3">
              <p className="font-medium text-gray-800 dark:text-gray-200">{preview.summary}</p>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                <CheckCircle size={12}/> {preview.module}
              </span>
              <div className="flex justify-center gap-3 mt-4">
                <button 
                  onClick={commit} 
                  className="bg-emerald-600 text-white px-4 py-1 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Looks Good → Commit
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onOpenDrawer(); 
                  }} 
                  className="bg-amber-600 text-white px-4 py-1 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Open in Review
                </button>
              </div>
            </div>
          )}
          
          {status === "upload" && (
            <p className="text-gray-600 dark:text-gray-300 animate-pulse">Uploading...</p>
          )}
          
          {status === "done" && (
            <p className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle size={18} /> Document uploaded successfully!
            </p>
          )}
        </div>
      )}
    </Dropzone>
  );
}