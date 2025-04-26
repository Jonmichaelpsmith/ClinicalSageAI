import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DetailsList, IColumn, SelectionMode, IconButton, Link } from '@fluentui/react';
import { 
  Button, 
  Spinner, 
  Dialog, 
  DialogTitle, 
  DialogBody,
  Panel,
  PanelHeader,
  PanelBody,
  Input,
  Tag,
  TagGroup
} from '@fluentui/react-components';

interface Document {
  id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
  latest_version?: number;
  summary?: string;
  tags?: string[];
  url?: string;
  locked_by?: string;
  locked_at?: string;
  lock_expires?: string;
}

interface Version {
  id: string;
  version_number: number;
  uploaded_at: string;
  file_size: number;
  summary?: string;
}

export default function VaultView() {
  const { studyId } = useParams();
  const { token, user } = useContext(AuthContext)!;
  const [docs, setDocs] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>('');
  const [previewFilename, setPreviewFilename] = useState<string>('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('studyId', studyId!);
      
      if (query) {
        params.append('q', query);
      }
      
      if (activeTags.length) {
        params.append('tags', activeTags.join(','));
      }
      
      // Make API request
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search?${params.toString()}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      } else {
        console.error('Failed to search documents');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { 
    if (token && studyId) {
      fetchDocs(); 
    }
  }, [token, studyId, query, activeTags]);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/studies/${studyId}/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      
      if (res.ok) { 
        setFile(null); 
        await fetchDocs(); 
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  // Get a signed URL from the backend
  const getSignedUrl = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${id}/url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPreviewUrl(data.url);
        setPreviewMime(data.mime);
        setPreviewFilename(data.filename);
      } else {
        console.error('Failed to get signed URL');
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${id}/url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        window.open(data.url, '_blank');
      } else {
        console.error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Error getting download URL:', error);
    }
  };

  // Load document versions
  const openVersions = async (docId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        setPanelOpen(true);
      } else {
        console.error('Failed to load versions');
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  // Handle document locking
  const lockDocument = async (docId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/${docId}/lock`, 
        { 
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      if (res.ok) {
        await fetchDocs();
      } else if (res.status === 423) {
        console.error('Document already locked');
      } else {
        console.error('Failed to lock document');
      }
    } catch (error) {
      console.error('Error locking document:', error);
    }
  };

  // Handle document unlocking
  const unlockDocument = async (docId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/${docId}/unlock`, 
        { 
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      if (res.ok) {
        await fetchDocs();
      } else if (res.status === 403) {
        console.error('Not lock owner');
      } else {
        console.error('Failed to unlock document');
      }
    } catch (error) {
      console.error('Error unlocking document:', error);
    }
  };

  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };

  // Extract unique tags from all documents
  const getAllTags = () => {
    const allTags = docs.flatMap(d => d.tags || []);
    return [...new Set(allTags)].slice(0, 20); // Limit to 20 tags
  };

  const cols: IColumn[] = [
    { 
      key: 'name', 
      name: 'Name', 
      fieldName: 'filename', 
      minWidth: 200,
      onRender: (item: Document) => (
        <Link onClick={() => getSignedUrl(item.id)}>
          {item.filename}
        </Link>
      )
    },
    { key: 'type', name: 'Type', fieldName: 'mime_type', minWidth: 100 },
    { 
      key: 'size', 
      name: 'Size (KB)', 
      minWidth: 80, 
      onRender: (item: Document) => (item.file_size/1024).toFixed(1) 
    },
    { 
      key: 'date', 
      name: 'Upload Date', 
      fieldName: 'uploaded_at',
      minWidth: 150,
      onRender: (item: Document) => new Date(item.uploaded_at).toLocaleString() 
    },
    {
      key: 'ver',
      name: 'Version',
      minWidth: 80,
      onRender: (item: Document) => (
        <Button 
          size="small" 
          onClick={() => openVersions(item.id)}
        >
          {item.latest_version || 1}
        </Button>
      )
    },
    {
      key: 'lock',
      name: 'Lock',
      minWidth: 80,
      onRender: (item: Document) => (
        item.locked_by ? (
          <Button 
            size="small" 
            disabled={item.locked_by !== user?.id} 
            onClick={() => unlockDocument(item.id)}
          >
            Unlock
          </Button>
        ) : (
          <Button 
            size="small" 
            onClick={() => lockDocument(item.id)}
          >
            Lock
          </Button>
        )
      )
    },
    {
      key: 'dl',
      name: 'Download',
      minWidth: 80,
      onRender: (item: Document) => (
        <Button 
          size="small" 
          onClick={() => handleDownload(item.id)}
        >
          ⬇️
        </Button>
      )
    }
  ];

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewMime('');
    setPreviewFilename('');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Vault – Study {studyId}</h2>
      
      <div style={{ marginBottom: 20 }}>
        <input 
          type="file" 
          onChange={e => setFile(e.target.files?.[0] ?? null)} 
          disabled={uploading}
        />
        <Button 
          appearance="primary" 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          style={{ marginLeft: 8 }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      
      {/* Search and filters */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <Input 
          style={{ width: 240 }} 
          placeholder="Search summaries…" 
          value={query} 
          onChange={(_, v) => setQuery(v.value)} 
        />
        {activeTags.map(tag => (
          <Tag 
            key={tag} 
            onDismiss={() => setActiveTags(activeTags.filter(t => t !== tag))}
          >
            {tag}
          </Tag>
        ))}
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spinner label="Loading documents..." />
        </div>
      ) : (
        <>
          <DetailsList 
            items={docs} 
            columns={cols} 
            selectionMode={SelectionMode.none}
          />
          
          {/* Tag cloud */}
          <div style={{ marginTop: 16 }}>
            {getAllTags().map(tag => (
              <Tag 
                key={tag} 
                style={{ margin: 4 }} 
                selected={activeTags.includes(tag)} 
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        </>
      )}

      {/* Preview dialog */}
      <Dialog 
        open={!!previewUrl} 
        onOpenChange={(_, data) => {
          if (!data.open) closePreview();
        }}
      >
        <DialogTitle>{previewFilename}</DialogTitle>
        <DialogBody>
          {previewUrl && previewMime.includes('pdf') && (
            <iframe 
              src={previewUrl} 
              style={{ width: '100%', height: '80vh' }} 
              title={previewFilename}
            />
          )}
          {previewUrl && previewMime.includes('word') && (
            <iframe 
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
              style={{ width: '100%', height: '80vh' }} 
              title={previewFilename}
            />
          )}
          {/* Show images directly */}
          {previewUrl && previewMime.includes('image/') && (
            <img 
              src={previewUrl} 
              alt={previewFilename} 
              style={{ maxWidth: '100%', maxHeight: '80vh' }} 
            />
          )}
          {/* Fallback link for other file types */}
          {previewUrl && !previewMime.match(/pdf|word|image/) && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              Open File
            </a>
          )}
        </DialogBody>
      </Dialog>

      {/* Versions panel */}
      <Panel 
        open={panelOpen} 
        onOpenChange={(_, data) => setPanelOpen(data.open)}
      >
        <PanelHeader>Versions</PanelHeader>
        <PanelBody>
          {versions.map(v => (
            <div 
              key={v.id} 
              style={{ 
                padding: 8, 
                borderBottom: '1px solid #eee' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>v{v.version_number}</span>
                <span>{(v.file_size/1024).toFixed(1)} KB</span>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {new Date(v.uploaded_at).toLocaleString()}
              </div>
              {v.summary && (
                <p style={{ fontSize: 12, margin: '4px 0', color: '#444' }}>
                  {v.summary}
                </p>
              )}
            </div>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}