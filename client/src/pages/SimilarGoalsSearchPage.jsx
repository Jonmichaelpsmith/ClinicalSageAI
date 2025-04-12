import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import SimilarityGoalSearch from '@/components/SimilarityGoalSearch';
import SimilarStudyResults from '@/components/SimilarStudyResults';
import AIStudyConversation from '@/components/AIStudyConversation';

const SimilarGoalsSearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchGoal, setSearchGoal] = useState('');
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const handleSearchResults = (results, goal) => {
    setSearchResults(results);
    setSearchGoal(goal);
    setActiveTab('results');
  };

  const handleSelectStudy = (study) => {
    setSelectedStudy(study);
    setActiveTab('analyze');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Similar Study Goals Search</h1>
        <p className="text-slate-500">
          Find CSRs with study goals similar to yours and analyze them with AI
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="search">1. Describe Your Goals</TabsTrigger>
          <TabsTrigger 
            value="results" 
            disabled={searchResults.length === 0}
          >
            2. Review Similar Studies
          </TabsTrigger>
          <TabsTrigger 
            value="analyze" 
            disabled={!selectedStudy}
          >
            3. AI Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search">
          <SimilarityGoalSearch onSearchResults={handleSearchResults} />
          
          {searchResults.length > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm">
                <span className="font-semibold">Tip:</span> You already have some search results. 
                Click on the "Review Similar Studies" tab to see them.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="results">
          <SimilarStudyResults 
            results={searchResults} 
            queryGoal={searchGoal}
            onSelectStudy={handleSelectStudy}
          />
          
          {selectedStudy && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm">
                <span className="font-semibold">Tip:</span> You've selected a study to analyze. 
                Click on the "AI Analysis" tab to start asking questions about it.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analyze">
          <div className="grid grid-cols-1 gap-6">
            <AIStudyConversation 
              selectedStudy={selectedStudy}
              queryGoal={searchGoal}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimilarGoalsSearchPage;