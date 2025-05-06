import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Search, FileText, Download, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

const LiteratureSearchPanel = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState('all');
  const [selectedStudyTypes, setSelectedStudyTypes] = useState({
    rct: true,
    observational: true,
    metaAnalysis: true,
    caseStudy: false,
    review: true
  });
  
  // Execute literature search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults(null);
    
    // Simulate API call to literature database
    setTimeout(() => {
      // Mock search results
      const mockResults = {
        query: searchQuery,
        totalResults: 28,
        papers: [
          {
            id: 'PMID-34567123',
            title: 'Long-term safety and efficacy of drug-eluting stents: a meta-analysis of randomized trials',
            authors: 'Johnson A, Smith B, Chen C, et al.',
            journal: 'Journal of Cardiovascular Interventions',
            year: 2023,
            type: 'Meta-analysis',
            doi: '10.1234/jci.2023.45678',
            abstract: 'Background: Drug-eluting stents (DES) have revolutionized the treatment of coronary artery disease. This meta-analysis aims to evaluate the long-term safety and efficacy of modern DES compared to bare-metal stents (BMS).\n\nMethods: We conducted a comprehensive search of major databases for randomized controlled trials comparing DES to BMS with follow-up of ≥3 years. Primary endpoints included target lesion revascularization (TLR), stent thrombosis, and all-cause mortality.\n\nResults: Twenty-eight trials with 24,372 patients were included. DES demonstrated significantly lower rates of TLR compared to BMS (OR 0.38, 95% CI 0.32-0.45, p<0.001) with no significant difference in very late stent thrombosis (>1 year) (OR 1.05, 95% CI 0.78-1.42, p=0.74) or all-cause mortality (OR 0.93, 95% CI 0.83-1.05, p=0.24).\n\nConclusion: Modern DES provide sustained efficacy benefits over BMS without increased long-term safety concerns.',
            relevance: 'high',
            safety: {
              events: 42,
              seriousEvents: 7,
              mortality: 5
            }
          },
          {
            id: 'PMID-33789456',
            title: 'Comparative effectiveness of bioresorbable polymer stents versus durable polymer stents in patients with complex coronary artery lesions',
            authors: 'Zhang Y, Williams D, Garcia E, et al.',
            journal: 'JACC: Cardiovascular Interventions',
            year: 2022,
            type: 'Randomized Controlled Trial',
            doi: '10.1234/jacci.2022.56789',
            abstract: 'Objectives: This study aimed to compare the clinical outcomes of bioresorbable polymer stents versus durable polymer stents in patients with complex coronary artery lesions.\n\nBackground: The advantages of bioresorbable polymer stents in complex lesions remain debated.\n\nMethods: In this multicenter randomized trial, 2,114 patients with complex coronary lesions were randomly assigned to receive either bioresorbable polymer stents or durable polymer stents. The primary endpoint was target lesion failure at 2 years.\n\nResults: At 2-year follow-up, the primary endpoint occurred in 5.2% of patients in the bioresorbable polymer group versus 5.8% in the durable polymer group (hazard ratio 0.89, 95% confidence interval 0.65-1.23, p=0.49 for non-inferiority). Rates of definite/probable stent thrombosis were similarly low in both groups (0.8% vs 0.9%, p=0.84).\n\nConclusions: In patients with complex coronary lesions, bioresorbable polymer stents were non-inferior to durable polymer stents regarding target lesion failure at 2 years with comparable safety profiles.',
            relevance: 'high',
            safety: {
              events: 38,
              seriousEvents: 5,
              mortality: 2
            }
          },
          {
            id: 'PMID-35901234',
            title: 'Five-year outcomes of the CardioStent XR system: results from the MOMENTUM global registry',
            authors: 'Rodriguez M, Anderson P, Takahashi N, et al.',
            journal: 'European Heart Journal',
            year: 2024,
            type: 'Observational Study',
            doi: '10.1234/ehj.2024.12345',
            abstract: 'Aims: To evaluate the long-term safety and performance of the CardioStent XR drug-eluting stent system in a large, real-world population.\n\nMethods and results: The MOMENTUM registry enrolled 5,000 patients across 50 centers worldwide who received the CardioStent XR. The primary endpoint was a composite of cardiac death, target vessel myocardial infarction, and clinically-driven target lesion revascularization at 5 years. At 5-year follow-up, the primary endpoint occurred in 11.6% of patients. Definite/probable stent thrombosis was observed in 0.8% of patients. Subgroup analyses showed consistent results across complex patient and lesion subsets.\n\nConclusion: In this large, all-comers registry, the CardioStent XR demonstrated favorable long-term safety and efficacy outcomes, including in patients with complex coronary artery disease.',
            relevance: 'very high',
            safety: {
              events: 112,
              seriousEvents: 18,
              mortality: 9
            }
          },
        ],
        recommendedReads: [
          'Long-term outcomes of coronary stenting in diabetic patients',
          'Safety profile comparison between polymer-coated and polymer-free drug-eluting stents',
          'Impact of dual antiplatelet therapy duration after stent implantation'
        ],
        yearDistribution: [
          { year: 2025, count: 2 },
          { year: 2024, count: 5 },
          { year: 2023, count: 8 },
          { year: 2022, count: 6 },
          { year: 2021, count: 4 },
          { year: 2020, count: 3 }
        ]
      };
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 2000);
  };
  
  // Get badge color based on relevance
  const getRelevanceBadgeColor = (relevance) => {
    switch(relevance) {
      case 'very high':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Import study to CER
  const importStudy = (study) => {
    alert(`Importing study: ${study.title}`);
    // In a real implementation, this would add the study to the CER
  };
  
  // AI-powered search query improvement
  const improveSearchQuery = () => {
    setSearchQuery('cardiovascular stent safety efficacy long-term outcomes polymer-based');
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium">Literature AI Search</h2>
            <p className="text-sm text-gray-500 mt-1">
              Intelligent search across PubMed, MEDLINE, Cochrane Library, and other sources
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Search for clinical literature (e.g., 'CardioStent XR safety efficacy')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-1.5" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline" onClick={improveSearchQuery}>
              <AlertCircle className="h-4 w-4 mr-1.5" />
              AI Improve Query
            </Button>
          </div>
          
          <div className="flex space-x-6">
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Publication Year</Label>
              <div className="space-x-3 flex">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="year-all" 
                    name="year-range" 
                    className="mr-1.5"
                    checked={selectedYearRange === 'all'}
                    onChange={() => setSelectedYearRange('all')}
                  />
                  <Label htmlFor="year-all" className="text-xs font-normal">All years</Label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="year-5" 
                    name="year-range" 
                    className="mr-1.5"
                    checked={selectedYearRange === '5years'}
                    onChange={() => setSelectedYearRange('5years')}
                  />
                  <Label htmlFor="year-5" className="text-xs font-normal">Last 5 years</Label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="year-3" 
                    name="year-range" 
                    className="mr-1.5"
                    checked={selectedYearRange === '3years'}
                    onChange={() => setSelectedYearRange('3years')}
                  />
                  <Label htmlFor="year-3" className="text-xs font-normal">Last 3 years</Label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="year-1" 
                    name="year-range" 
                    className="mr-1.5"
                    checked={selectedYearRange === '1year'}
                    onChange={() => setSelectedYearRange('1year')}
                  />
                  <Label htmlFor="year-1" className="text-xs font-normal">Last year</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Study Type</Label>
              <div className="space-x-3 flex">
                <div className="flex items-center">
                  <Checkbox 
                    id="type-rct" 
                    checked={selectedStudyTypes.rct}
                    onCheckedChange={(checked) => setSelectedStudyTypes({...selectedStudyTypes, rct: checked})}
                    className="mr-1.5 h-3.5 w-3.5"
                  />
                  <Label htmlFor="type-rct" className="text-xs font-normal">RCTs</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="type-meta" 
                    checked={selectedStudyTypes.metaAnalysis}
                    onCheckedChange={(checked) => setSelectedStudyTypes({...selectedStudyTypes, metaAnalysis: checked})}
                    className="mr-1.5 h-3.5 w-3.5"
                  />
                  <Label htmlFor="type-meta" className="text-xs font-normal">Meta-analyses</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="type-obs" 
                    checked={selectedStudyTypes.observational}
                    onCheckedChange={(checked) => setSelectedStudyTypes({...selectedStudyTypes, observational: checked})}
                    className="mr-1.5 h-3.5 w-3.5"
                  />
                  <Label htmlFor="type-obs" className="text-xs font-normal">Observational</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    id="type-review" 
                    checked={selectedStudyTypes.review}
                    onCheckedChange={(checked) => setSelectedStudyTypes({...selectedStudyTypes, review: checked})}
                    className="mr-1.5 h-3.5 w-3.5"
                  />
                  <Label htmlFor="type-review" className="text-xs font-normal">Reviews</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {isSearching && (
        <div className="bg-white p-6 rounded border shadow-sm text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-500 opacity-70" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Searching medical literature databases...
          </p>
        </div>
      )}
      
      {!isSearching && searchResults && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-medium">Search Results</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Found {searchResults.totalResults} publications for "{searchResults.query}"
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Export All
                </Button>
                <Button size="sm" className="text-xs h-7">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Add to CER
                </Button>
              </div>
            </div>
            
            {/* Year distribution chart - simplified version */}
            <div className="mb-6 border rounded-md p-3 bg-gray-50">
              <h4 className="text-xs font-medium mb-2">Publication Year Distribution</h4>
              <div className="flex items-end h-24 space-x-1">
                {searchResults.yearDistribution.map((item, idx) => {
                  const height = `${(item.count / Math.max(...searchResults.yearDistribution.map(i => i.count))) * 100}%`;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors" style={{ height }}>
                        <div className="h-full w-full bg-blue-500 opacity-70"></div>
                      </div>
                      <span className="text-[10px] mt-1">{item.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Paper cards */}
            <div className="space-y-4">
              {searchResults.papers.map((paper, idx) => (
                <Card key={idx} className="p-4 border hover:border-blue-200">
                  <div className="flex justify-between">
                    <div className="w-10/12">
                      <h4 className="text-sm font-medium">{paper.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{paper.authors}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{paper.journal}</span>
                        <span className="mx-1.5">•</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {paper.year}
                        </span>
                        <span className="mx-1.5">•</span>
                        <span>{paper.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getRelevanceBadgeColor(paper.relevance)}>
                        {paper.relevance.replace('-', ' ')}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs h-6" onClick={() => importStudy(paper)}>
                        Import
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                      {paper.abstract}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t text-xs">
                    <div className="flex space-x-4">
                      <div>
                        <span className="text-gray-500">Events:</span>
                        <span className="ml-1 font-medium">{paper.safety.events}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Serious:</span>
                        <span className="ml-1 font-medium">{paper.safety.seriousEvents}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mortality:</span>
                        <span className="ml-1 font-medium">{paper.safety.mortality}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Button variant="link" className="text-xs p-0 h-auto">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        PubMed
                      </Button>
                      <Separator orientation="vertical" className="h-3 mx-2" />
                      <span className="text-gray-500">DOI: {paper.doi}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-6">
              <h4 className="text-xs font-medium mb-2">AI Recommendations</h4>
              <div className="text-xs text-gray-600">
                <p className="mb-1">Based on your search, you might also want to review:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {searchResults.recommendedReads.map((read, idx) => (
                    <li key={idx}>{read}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button className="text-xs h-8">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Generate Literature Review Section
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteratureSearchPanel;