import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InputDataPanel() {
  const [metadata, setMetadata] = useState({ deviceName: '', lotNumber: '' });
  const [files, setFiles] = useState([]);

  // Save metadata
  const saveMetadata = async () => {
    console.log('Metadata saved', metadata);
    // In a real implementation, this would send data to the API
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

      {/* File Upload Placeholder */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>
          <div className="p-6 border-dashed rounded-md cursor-pointer text-center border-gray-300 border-2">
            <p>Drag & drop files, or click to select documents</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}