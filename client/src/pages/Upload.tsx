import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload as UploadIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Upload() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    sponsor: "",
    indication: "",
    phase: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [dragover, setDragover] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  
  // Mutation for uploading CSR
  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/reports', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setIsProcessing(false);
      setProcessComplete(true);
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your CSR. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragover(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleCancel = () => {
    setFile(null);
    setFormData({
      title: "",
      sponsor: "",
      indication: "",
      phase: "",
    });
  };
  
  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.title || !formData.sponsor || !formData.indication || !formData.phase) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('sponsor', formData.sponsor);
    data.append('indication', formData.indication);
    data.append('phase', formData.phase);
    
    uploadMutation.mutate(data);
  };
  
  const resetForm = () => {
    setFile(null);
    setFormData({
      title: "",
      sponsor: "",
      indication: "",
      phase: "",
    });
    setProcessComplete(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Upload CSR Document</h3>
          <p className="mt-1 text-sm text-slate-600">Upload your Clinical Study Report PDF file for AI-powered processing.</p>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {/* File Upload Area */}
            {!file && !processComplete && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragover(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragover(false);
                }}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${
                  dragover ? 'border-primary bg-blue-50' : 'border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="mb-3 h-12 w-12 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-700">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">PDF files only (max size: 50MB)</p>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
              </div>
            )}
            
            {/* File Selected View */}
            {file && !isProcessing && !processComplete && (
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex-shrink-0 p-2 bg-primary-light rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-slate-800">{file.name}</p>
                    <div className="flex items-center text-xs text-slate-500">
                      <span>{`PDF Document • ${Math.round(file.size / 1024)} KB`}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="ml-4 p-1 rounded-full text-slate-500 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">CSR Title</label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title" 
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" 
                      placeholder="e.g., Phase 2 Study of Drug X in Patients with Y"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sponsor" className="block text-sm font-medium text-slate-700">Sponsor</label>
                    <input 
                      type="text" 
                      id="sponsor" 
                      name="sponsor" 
                      value={formData.sponsor}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" 
                      placeholder="e.g., Novartis, Pfizer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phase" className="block text-sm font-medium text-slate-700">Trial Phase</label>
                      <select 
                        id="phase" 
                        name="phase" 
                        value={formData.phase}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="">Select Phase</option>
                        <option value="Phase 1">Phase 1</option>
                        <option value="Phase 1/2">Phase 1/2</option>
                        <option value="Phase 2">Phase 2</option>
                        <option value="Phase 2/3">Phase 2/3</option>
                        <option value="Phase 3">Phase 3</option>
                        <option value="Phase 4">Phase 4</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="indication" className="block text-sm font-medium text-slate-700">Indication</label>
                      <input 
                        type="text" 
                        id="indication" 
                        name="indication" 
                        value={formData.indication}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm" 
                        placeholder="e.g., Diabetes, Oncology"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Process CSR
                  </button>
                </div>
              </div>
            )}
            
            {/* Processing View */}
            {isProcessing && (
              <div className="space-y-6">
                <div className="text-center py-10">
                  <div className="animate-spin h-12 w-12 text-primary mx-auto mb-6">
                    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Processing CSR Document</h3>
                  <p className="text-slate-600 mb-6">Our AI is extracting structured data from your document. This may take a few minutes.</p>
                  
                  <div className="max-w-md mx-auto space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Parsing PDF</span>
                      <span className="text-sm font-medium text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full w-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Extracting Data</span>
                      <span className="text-sm font-medium text-primary">65%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Structuring Information</span>
                      <span className="text-sm font-medium text-slate-700">Waiting...</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className="bg-slate-400 h-2.5 rounded-full w-0"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success View */}
            {processComplete && (
              <div className="space-y-6">
                <div className="text-center py-10">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">CSR Successfully Processed!</h3>
                  <p className="text-slate-600 mb-6">We've extracted structured data from your Clinical Study Report.</p>
                  
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => navigate('/reports')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      View Processed CSR
                    </button>
                    <button
                      onClick={resetForm}
                      className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                    >
                      Upload Another CSR
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
