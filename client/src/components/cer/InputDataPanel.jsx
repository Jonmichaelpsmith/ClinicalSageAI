import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function InputDataPanel({ jobId }) {
  const [metadata, setMetadata] = useState({ deviceName: '', lotNumber: '' });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Fetch existing uploaded files
  const fetchFiles = useCallback(async () => {
    try {
      // This would be a real API call in production
      // const res = await axios.get('/api/cer/vault/list');
      // setFiles(res.data.files);
      
      // Mock data for demo
      setFiles([
        { id: 1, name: 'Technical Documentation.pdf', downloadUrl: '#' },
        { id: 2, name: 'Prior Clinical Data.xlsx', downloadUrl: '#' },
        { id: 3, name: 'Regulatory Correspondence.pdf', downloadUrl: '#' }
      ]);
    } catch (err) {
      console.error('Failed to load vault files', err);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('documents', file));
      
      // This would be a real API call in production
      // await axios.post('/api/cer/vault/import', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      
      // Mock upload for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchFiles();
      setSelectedFiles([]);
    } catch (err) {
      console.error('Upload error', err);
    } finally {
      setUploading(false);
    }
  };

  // Save metadata
  const saveMetadata = async () => {
    try {
      // This would be a real API call in production
      // await axios.post('/api/cer/metadata', metadata);
      
      // Mock save for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Metadata saved:', metadata);
      alert('Metadata saved successfully');
    } catch (err) {
      console.error('Metadata save error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadata Form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Device Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={metadata.deviceName}
                onChange={e => setMetadata({ ...metadata, deviceName: e.target.value })}
                placeholder="e.g., SI-123 Analyzer"
              />
            </div>
            <div>
              <Label htmlFor="lotNumber">Lot Number</Label>
              <Input
                id="lotNumber"
                value={metadata.lotNumber}
                onChange={e => setMetadata({ ...metadata, lotNumber: e.target.value })}
                placeholder="e.g., LOT-456789"
              />
            </div>
          </div>
          <Button className="mt-4" onClick={saveMetadata}>Save Metadata</Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
          <div className="p-6 border-2 border-dashed rounded-md">
            <div className="flex flex-col gap-4">
              <Input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                disabled={uploading}
              />
              <div>
                {selectedFiles.length > 0 && (
                  <p className="mb-2">{selectedFiles.length} file(s) selected</p>
                )}
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFiles.length || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Vault Documents</h3>
          <ul className="space-y-2">
            {files.map(f => (
              <li key={f.id} className="flex justify-between items-center">
                <span>{f.name}</span>
                <div className="space-x-2">
                  <Button size="sm" onClick={() => window.open(f.downloadUrl, '_blank')}>Download</Button>
                  <Button size="sm" variant="outline" onClick={() => {/* diff action */}}>Diff</Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}