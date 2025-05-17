import React, { useEffect, useState } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

const TreeNode = ({ node }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

  return (
    <div className="ml-2">
      <div
        className="flex items-center space-x-1 cursor-pointer select-none"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        ) : (
          <span className="w-4" />
        )}
        {node.type === 'directory' ? (
          <Folder className="h-4 w-4 text-yellow-600" />
        ) : (
          <FileText className="h-4 w-4 text-slate-600" />
        )}
        <span className="text-sm ml-1">{node.name}</span>
      </div>
      {hasChildren && open && (
        <div className="ml-4">
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function EctdFileTree({ projectId, sequence }) {
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch(`/api/ectd/${projectId}/${sequence}/files`);
        if (!res.ok) {
          throw new Error('Failed to load file list');
        }
        const data = await res.json();
        setTree(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load sequence files');
      }
    }

    if (projectId && sequence) {
      fetchTree();
    }
  }, [projectId, sequence]);

  if (error) return <div className="text-sm text-red-600 p-2">{error}</div>;
  if (!tree) return <div className="text-sm text-slate-500 p-2">Loading...</div>;

  return (
    <div className="text-sm">
      <TreeNode node={tree} />
    </div>
  );
}
