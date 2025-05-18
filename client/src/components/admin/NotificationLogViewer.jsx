import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotificationLogViewer() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Notification Log Viewer</CardTitle>
          <CardDescription>View system notification logs</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Notification logs will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}