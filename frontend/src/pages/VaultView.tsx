import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DetailsList, IColumn, SelectionMode, IconButton, Link } from '@fluentui/react';
import { Button, Spinner, Dialog, DialogTitle, DialogBody } from '@fluentui/react-components';

interface Document {
  id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  uploaded_at: string;
  url?: string;
}

export default function VaultView() {
  const { studyId } = useParams();
  const { token } = useContext(AuthContext)!;
  const [docs, setDocs] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>('');
  const [previewFilename, setPreviewFilename] = useState<string>('');

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/studies/${studyId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      } else {
        console.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { 
    if (token && studyId) {
      loadDocs(); 
    }
  }, [token, studyId]);

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
        await loadDocs(); 
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
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spinner label="Loading documents..." />
        </div>
      ) : (
        <DetailsList 
          items={docs} 
          columns={cols} 
          selectionMode={SelectionMode.none}
        />
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
    </div>
  );
}