// AdminPage.jsx - Page for administrative controls
import React from "react";
import AdminEmbeddingPanel from "../components/AdminEmbeddingPanel";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Controls</h1>
      
      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Document Management</h2>
          <AdminEmbeddingPanel />
        </section>
        
        {/* Add more admin sections here as needed */}
      </div>
    </div>
  );
}