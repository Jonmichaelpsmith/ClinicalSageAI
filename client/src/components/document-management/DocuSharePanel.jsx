import React, { useState } from 'react';
import { useDocuShare } from '@/hooks/useDocuShareComponents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'wouter';
import { FileText, FileUp, FileDown, Clock, Lock, Eye, Search, Filter } from 'lucide-react';

/**
 * DocuShare Panel Component
 * 
 * A compact panel for displaying documents from DocuShare with filtering
 * by module and document type. Typically used in sidebar contexts.
 * 
 * @param {Object} props - Component props
 * @param {string} props.moduleId - Filter documents by this module ID
 * @param {string} props.documentType - Filter documents by this document type
 * @param {boolean} props.compact - Whether to use a compact display
 */
export default function DocuSharePanel({ 
  moduleId = '',
  documentType = '',
  compact = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { documents } = useDocuShare();
  
  // Filter documents based on module ID, document type, and search term
  const filteredDocuments = documents
    .filter(doc => 
      (!moduleId || doc.moduleContext === moduleId) &&
      (!documentType || doc.documentType === documentType) &&
      (!searchTerm || doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .slice(0, compact ? 5 : 10); // Limit the number of documents based on compact mode
    
  return (
    <div className="w-full">
      {!compact && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-medium">DocuShare Documents</h3>
          <Badge className="bg-teal-100 text-teal-800 text-xs">21 CFR Part 11</Badge>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <input
          type="text"
          placeholder={compact ? "Search..." : "Search documents..."}
          className="w-full bg-gray-50 border border-gray-200 rounded-md py-1 px-7 text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
      </div>
      
      {/* Document List */}
      <ScrollArea className={`border rounded-md ${compact ? 'h-40' : 'h-64'}`}>
        {filteredDocuments.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredDocuments.map(doc => (
              <li key={doc.id} className="p-2 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <FileText className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-teal-600 mt-0.5 mr-1.5 flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                      {doc.name}
                    </p>
                    <div className={`flex items-center text-gray-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                      <Clock className={`${compact ? 'h-2 w-2' : 'h-3 w-3'} mr-0.5`} />
                      <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-1">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FileDown className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={`flex flex-col items-center justify-center h-full text-center p-4 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
            <p>No documents found</p>
            <Button 
              variant="link" 
              size="sm" 
              className={`mt-1 h-auto p-0 ${compact ? 'text-[10px]' : 'text-xs'}`}
            >
              <FileUp className={`${compact ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
              Upload Document
            </Button>
          </div>
        )}
      </ScrollArea>
      
      {/* Compliance Footer */}
      <div className="mt-1 flex justify-between items-center">
        <span className={`text-gray-500 ${compact ? 'text-[10px]' : 'text-xs'} flex items-center`}>
          <Lock className={`${compact ? 'h-2 w-2' : 'h-3 w-3'} mr-0.5`} />
          21 CFR Part 11 Compliant
        </span>
        
        <Link to="/document-management" className={`text-teal-600 hover:text-teal-700 hover:underline ${compact ? 'text-[10px]' : 'text-xs'}`}>
          View All Documents
        </Link>
      </div>
    </div>
  );
}