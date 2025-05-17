import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, File as FileIcon, ChevronRight, ChevronDown } from 'lucide-react';

function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);

  if (!node) return null;

  const isFolder = node.type === 'folder';

  return (
    <div className="text-sm">
      <div
        className="flex items-center cursor-pointer select-none"
        style={{ paddingLeft: depth * 12 }}
        onClick={() => isFolder && setOpen(!open)}
      >
        {isFolder ? (
          <span className="mr-1">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </span>
        ) : (
          <span className="mr-1 w-3" />
        )}
        {isFolder ? (
          <Folder className="h-4 w-4 text-yellow-600 mr-1" />
        ) : (
          <FileIcon className="h-4 w-4 text-gray-600 mr-1" />
        )}
        <span>{node.name}</span>
      </div>
      {isFolder && open && node.children && (
        <div className="ml-4">
          {node.children.map((child, idx) => (
            <TreeNode key={`${child.name}-${idx}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EctdFileTree({ projectId, sequence }) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !sequence) return;
    const fetchTree = async () => {
      setLoading(true);
      try {
        const res = await apiRequest.get(`/api/ectd/${projectId}/${sequence}`);
        setTree(res.data);
      } catch (err) {
        console.error('Failed to load eCTD tree', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [projectId, sequence]);

  if (loading) {
    return <div className="p-2 text-sm">Loading...</div>;
  }

  if (!tree) {
    return <div className="p-2 text-sm text-gray-500">No data</div>;
  }

  return (
    <ScrollArea className="h-full p-2">
      <TreeNode node={tree} />
    </ScrollArea>
  );
}
