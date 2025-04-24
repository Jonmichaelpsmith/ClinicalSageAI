import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import MetadataList from '../../components/metadata/MetadataList';
import AssetDetail from '../../components/metadata/AssetDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { PlusCircle, Database, FileText, ChevronRight } from 'lucide-react';

export default function MetadataRepositoryPage() {
  const [selectedAssetType, setSelectedAssetType] = useState('forms');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Clinical Metadata Repository | TrialSage</title>
        <meta name="description" content="Centralized management of clinical trial metadata for regulatory compliance and operational efficiency" />
      </Helmet>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Metadata Repository</h1>
          <p className="mt-2 text-lg text-gray-600">
            Centralized management of clinical trial metadata
          </p>
        </div>
        
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="h-4 w-4" />
          Create New Asset
        </Button>
      </div>
      
      {selectedAssetId ? (
        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <button 
              onClick={() => setSelectedAssetId(null)}
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <Database className="h-4 w-4 mr-1" />
              Repository
            </button>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Asset Details
            </span>
          </div>
          
          <AssetDetail assetType={selectedAssetType} assetId={selectedAssetId} />
        </div>
      ) : (
        <Tabs 
          defaultValue="forms" 
          value={selectedAssetType}
          onValueChange={setSelectedAssetType}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="forms">eCRF Forms</TabsTrigger>
            <TabsTrigger value="terminology">Terminology</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="standards">Standards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forms">
            <MetadataList 
              assetType="forms" 
              onSelect={(id) => setSelectedAssetId(id)} 
            />
          </TabsContent>
          
          <TabsContent value="terminology">
            <MetadataList 
              assetType="terminology" 
              onSelect={(id) => setSelectedAssetId(id)} 
            />
          </TabsContent>
          
          <TabsContent value="datasets">
            <MetadataList 
              assetType="datasets" 
              onSelect={(id) => setSelectedAssetId(id)} 
            />
          </TabsContent>
          
          <TabsContent value="standards">
            <MetadataList 
              assetType="standards" 
              onSelect={(id) => setSelectedAssetId(id)} 
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}