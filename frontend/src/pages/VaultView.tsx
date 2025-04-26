import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DetailsList, IColumn } from '@fluentui/react';
import { Button } from '@fluentui/react-components';

export default function VaultView() {
  const { studyId } = useParams();
  const { token } = useContext(AuthContext)!;
  const [docs, setDocs] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadDocs = async () => {
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

  const cols: IColumn[] = [
    { key: 'name', name: 'Name', fieldName: 'filename', minWidth: 200 },
    { key: 'type', name: 'Type', fieldName: 'mime_type', minWidth: 100 },
    { key: 'size', name: 'Size (KB)', onRender: (i) => (i.file_size/1024).toFixed(1) },
    { 
      key: 'date', 
      name: 'Upload Date', 
      fieldName: 'uploaded_at',
      minWidth: 150,
      onRender: (i) => new Date(i.uploaded_at).toLocaleString() 
    }
  ];

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
      
      <DetailsList items={docs} columns={cols} />
    </div>
  );
}