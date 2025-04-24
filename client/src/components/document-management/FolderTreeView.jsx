import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useDocuShare } from '../../contexts/DocuShareContext';

/**
 * FolderTreeView Component
 * 
 * A Microsoft-style folder tree view component that organizes documents into 
 * a hierarchical folder structure with expandable/collapsible folders.
 */
export default function FolderTreeView({ onSelectDocument }) {
  const { docs, selectedDoc } = useDocuShare();
  
  // Create hierarchical folder structure
  const folderStructure = buildFolderStructure(docs);
  
  return (
    <div className="p-2 h-full bg-white border rounded-lg overflow-y-auto">
      <div className="mb-3 pl-2 pb-2 border-b text-sm font-medium text-gray-700">
        Document Explorer
      </div>
      <div className="space-y-1">
        {Object.keys(folderStructure).map(folderName => (
          <FolderNode 
            key={folderName}
            name={folderName}
            items={folderStructure[folderName]}
            level={0}
            onSelectDocument={onSelectDocument}
            selectedDoc={selectedDoc}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Recursive folder tree node component
 */
function FolderNode({ name, items, level, onSelectDocument, selectedDoc }) {
  const [expanded, setExpanded] = useState(true);
  
  // Count files and folders
  const fileCount = items.files ? items.files.length : 0;
  const folderCount = Object.keys(items).filter(key => key !== 'files').length;
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };
  
  const indent = level * 16; // 16px indentation per level
  
  return (
    <div>
      <div 
        className="flex items-center cursor-pointer select-none py-1 hover:bg-blue-50 rounded px-1"
        onClick={handleToggle}
        style={{ paddingLeft: `${indent}px` }}
      >
        <span className="mr-1 text-gray-500">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="mr-1.5 text-yellow-500">
          {expanded ? <FolderOpen size={16} /> : <Folder size={16} />}
        </span>
        <span className="text-sm font-medium">{name}</span>
        <span className="ml-2 text-xs text-gray-500">
          ({folderCount > 0 ? `${folderCount} folder${folderCount !== 1 ? 's' : ''}, ` : ''}
          {fileCount} file{fileCount !== 1 ? 's' : ''})
        </span>
      </div>
      
      {expanded && (
        <div>
          {/* Render files in this folder */}
          {items.files && items.files.map(file => (
            <div 
              key={file.objectId}
              className={`flex items-center py-1 px-1 cursor-pointer rounded hover:bg-blue-50 ${
                selectedDoc?.objectId === file.objectId ? 'bg-blue-100' : ''
              }`}
              style={{ paddingLeft: `${indent + 24}px` }}
              onClick={() => onSelectDocument(file)}
            >
              <FileText size={14} className="mr-1.5 text-blue-500" />
              <span className="text-sm truncate">{file.displayName}</span>
            </div>
          ))}
          
          {/* Render sub-folders */}
          {Object.keys(items)
            .filter(key => key !== 'files')
            .map(folderName => (
              <FolderNode
                key={folderName}
                name={folderName}
                items={items[folderName]}
                level={level + 1}
                onSelectDocument={onSelectDocument}
                selectedDoc={selectedDoc}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * Build folder structure from document list
 * 
 * Creates a hierarchical structure where:
 * - Documents are organized by module type (top level)
 * - Documents are further organized by document type (second level)
 * - Inside each folder, documents are stored in the 'files' array
 */
function buildFolderStructure(documents) {
  const structure = {};
  
  // Define special folder order
  const folderOrder = [
    'Recent',
    'Regulatory', 
    'Clinical', 
    'IND', 
    'CSR', 
    'CER', 
    'Safety', 
    'CMC',
    'Quality',
    'Shared'
  ];
  
  // First pass: create the basic structure
  documents.forEach(doc => {
    // Determine main folder based on module
    let mainFolder;
    switch(doc.module) {
      case 'ind':
        mainFolder = 'IND';
        break;
      case 'csr':
        mainFolder = 'CSR';
        break;
      case 'cer':
        mainFolder = 'CER';
        break;
      case 'regulatory':
        mainFolder = 'Regulatory';
        break;
      case 'safety':
        mainFolder = 'Safety';
        break;
      case 'enterprise':
        mainFolder = 'Enterprise';
        break;
      default:
        // For general docs, categorize by type
        if (doc.type?.includes('Clinical')) mainFolder = 'Clinical';
        else if (doc.type?.includes('Chemistry Manufacturing Controls')) mainFolder = 'CMC';
        else if (doc.type?.includes('Quality')) mainFolder = 'Quality';
        else mainFolder = 'General';
    }
    
    // Create main folder if it doesn't exist
    if (!structure[mainFolder]) {
      structure[mainFolder] = { files: [] };
    }
    
    // Determine subfolder based on document type or specific criteria
    let subFolder = 'General';
    
    if (doc.type) {
      // Extract a reasonable subfolder name from document type
      if (doc.type.includes('Protocol')) subFolder = 'Protocols';
      else if (doc.type.includes('Report')) subFolder = 'Reports';
      else if (doc.type.includes('Submission')) subFolder = 'Submissions';
      else if (doc.type.includes('Meeting')) subFolder = 'Meeting Minutes';
      else if (doc.type.includes('Guidelines')) subFolder = 'Guidelines';
      else if (doc.type.includes('SOP')) subFolder = 'SOPs';
      else subFolder = doc.type;
    }
    
    // Create subfolder if it doesn't exist
    if (!structure[mainFolder][subFolder]) {
      structure[mainFolder][subFolder] = { files: [] };
    }
    
    // Add document to subfolder
    structure[mainFolder][subFolder].files.push(doc);
  });
  
  // Create a "Recent" folder with the most recent documents
  const recentDocs = [...documents]
    .sort((a, b) => {
      // Sort by date (recent first)
      const dateA = new Date(a.lastModified);
      const dateB = new Date(b.lastModified);
      return dateB - dateA;
    })
    .slice(0, 10); // Get top 10 most recent
  
  structure['Recent'] = { files: recentDocs };
  
  // Create a ordered structure based on folderOrder
  const orderedStructure = {};
  folderOrder.forEach(folder => {
    if (structure[folder]) {
      orderedStructure[folder] = structure[folder];
    }
  });
  
  // Add any remaining folders not in the predefined order
  Object.keys(structure).forEach(folder => {
    if (!orderedStructure[folder]) {
      orderedStructure[folder] = structure[folder];
    }
  });
  
  return orderedStructure;
}