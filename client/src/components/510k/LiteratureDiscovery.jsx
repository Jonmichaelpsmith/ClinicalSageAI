import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Book, BookCopy, FileText, FilePlus, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import fda510kService from '../../services/FDA510kService';

/**
 * Enhanced Literature Discovery Component
 * 
 * This component provides a powerful semantic search interface for finding
 * relevant scientific literature to support 510(k) submissions.
 */
const LiteratureDiscovery = ({ deviceProfile, onLiteratureAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLiterature, setSelectedLiterature] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const { toast } = useToast();
  
  // Initialize search query from device profile
  useEffect(() => {
    if (deviceProfile) {
      const baseQuery = `${deviceProfile.deviceName} ${deviceProfile.indications || ''} medical device`;
      setSearchQuery(baseQuery);
    }
  }, [deviceProfile]);
  
  // Handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term to find relevant literature",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // In a real implementation, this would call an API
      // For now, generate mock results
      setTimeout(() => {
        const mockResults = [
          {
            id: 'doi-10.1001/jama.2023.5687',
            title: 'Continuous Glucose Monitoring Systems: A Review of Current Technologies and Clinical Applications',
            authors: ['Johnson A.', 'Smith B.', 'Williams C.'],
            journal: 'Journal of the American Medical Association',
            year: 2023,
            abstract: 'This review examines the current state of continuous glucose monitoring (CGM) systems, with a focus on accuracy, clinical outcomes, and emerging technologies. CGM systems have evolved significantly, with improved accuracy and user experience enabling better glycemic control in patients with diabetes. Recent studies demonstrate their effectiveness in reducing hypoglycemic events and improving time in range.',
            relevanceScore: 0.92,
            fullText: false
          },
          {
            id: 'doi-10.1056/NEJMra2115623',
            title: 'Advances in Diabetes Management: The Role of Technology',
            authors: ['Garcia E.', 'Chen H.', 'Patel S.'],
            journal: 'New England Journal of Medicine',
            year: 2022,
            abstract: 'Technological advancements have revolutionized diabetes management. This article reviews various technologies including continuous glucose monitoring systems, automated insulin delivery systems, and digital health applications. The integration of these technologies has improved glycemic control and quality of life for people with diabetes while reducing healthcare utilization.',
            relevanceScore: 0.89,
            fullText: true
          },
          {
            id: 'doi-10.2337/dc22-1523',
            title: 'Accuracy and Performance Evaluation of the Latest Generation of Continuous Glucose Monitoring Systems',
            authors: ['Nakamura T.', 'Li Z.', 'Anderson R.'],
            journal: 'Diabetes Care',
            year: 2022,
            abstract: 'This study evaluates the accuracy and performance of five commercially available continuous glucose monitoring systems. Mean absolute relative difference (MARD) values were compared under various conditions, including hyperglycemia, hypoglycemia, and during rapid glucose fluctuations. The latest devices showed significantly improved accuracy with MARD values below 10% in most scenarios.',
            relevanceScore: 0.95,
            fullText: false
          },
          {
            id: 'doi-10.1177/19322968231002',
            title: 'Minimally Invasive CGM Sensors: Materials, Design and Biocompatibility Considerations',
            authors: ['Roberts K.', 'Thompson J.', 'Wilson L.'],
            journal: 'Journal of Diabetes Science and Technology',
            year: 2023,
            abstract: 'This paper reviews the materials, design principles, and biocompatibility considerations for minimally invasive continuous glucose monitoring sensors. The evolution of sensor technology from early-generation devices to modern systems is discussed, along with the impact of material selection on sensor performance, longevity, and patient comfort.',
            relevanceScore: 0.88,
            fullText: true
          },
          {
            id: 'doi-10.3390/s23010356',
            title: 'Sensor Accuracy and Reliability in Continuous Glucose Monitoring: A Comparative Analysis',
            authors: ['Fernandez D.', 'Kim Y.', 'Martinez C.'],
            journal: 'Sensors',
            year: 2023,
            abstract: 'This study presents a comprehensive comparative analysis of the accuracy and reliability of current continuous glucose monitoring sensors. The impact of various factors such as sensor placement, calibration protocols, and environmental conditions on measurement accuracy is evaluated. Recommendations for optimizing sensor performance in clinical settings are provided.',
            relevanceScore: 0.91,
            fullText: false
          }
        ];
        
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 1500);
    } catch (error) {
      console.error('Error searching literature:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for literature. Please try again.",
        variant: "destructive",
      });
      setIsSearching(false);
    }
  };
  
  // Handle selection of a literature item
  const handleSelectLiterature = (literature) => {
    if (selectedLiterature.some(item => item.id === literature.id)) {
      setSelectedLiterature(selectedLiterature.filter(item => item.id !== literature.id));
    } else {
      setSelectedLiterature([...selectedLiterature, literature]);
    }
  };
  
  // Handle adding selected literature to submission
  const handleAddToSubmission = () => {
    if (selectedLiterature.length === 0) {
      toast({
        title: "No literature selected",
        description: "Please select at least one literature reference to add",
        variant: "destructive",
      });
      return;
    }
    
    // Call the callback with selected literature
    if (onLiteratureAdded) {
      onLiteratureAdded(selectedLiterature);
    }
    
    toast({
      title: "Literature Added",
      description: `Added ${selectedLiterature.length} literature references to your submission`,
    });
  };
  
  // Generate citation in various formats
  const generateCitation = (literature, format = 'apa') => {
    const { authors, title, journal, year } = literature;
    
    switch (format) {
      case 'apa':
        return `${authors.join(', ')}. (${year}). ${title}. ${journal}.`;
      case 'mla':
        return `${authors.join(', ')}. "${title}." ${journal}, ${year}.`;
      case 'chicago':
        return `${authors.join(', ')}. "${title}." ${journal} (${year}).`;
      default:
        return `${authors.join(', ')}. (${year}). ${title}. ${journal}.`;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enhanced Literature Discovery</CardTitle>
        <CardDescription>
          Find and select relevant scientific literature to support your 510(k) submission
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Search Literature
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center">
              <CheckSquare className="h-4 w-4 mr-2" />
              Selected ({selectedLiterature.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4 pt-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search-query">Search Query</Label>
                <Input 
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter keywords to search for relevant literature"
                  className="w-full"
                />
              </div>
              <div className="pt-8">
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              {isSearching ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((literature) => (
                    <Card key={literature.id} className={`border-l-4 ${
                      selectedLiterature.some(item => item.id === literature.id) 
                        ? 'border-l-blue-600' 
                        : 'border-l-transparent'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-medium">{literature.title}</h3>
                            <p className="text-sm text-muted-foreground">{literature.authors.join(', ')} • {literature.journal} • {literature.year}</p>
                            <p className="text-sm mt-2">{literature.abstract}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className="flex flex-col items-center px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              <span className="text-xs font-medium">Relevance</span>
                              <span className="text-lg font-bold">{(literature.relevanceScore * 100).toFixed(0)}%</span>
                            </div>
                            <Button 
                              variant={selectedLiterature.some(item => item.id === literature.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSelectLiterature(literature)}
                            >
                              {selectedLiterature.some(item => item.id === literature.id) ? "Selected" : "Select"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-md">
                  <Book className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Search for literature to support your 510(k) submission</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="selected" className="space-y-4 pt-4">
            {selectedLiterature.length > 0 ? (
              <div className="space-y-4">
                {selectedLiterature.map((literature) => (
                  <Card key={literature.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{literature.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {literature.authors.join(', ')} • {literature.journal} • {literature.year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="citations">
                          <AccordionTrigger className="text-sm">Citation Formats</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-xs">
                              <div>
                                <p className="font-semibold">APA:</p>
                                <p className="pl-4">{generateCitation(literature, 'apa')}</p>
                              </div>
                              <div>
                                <p className="font-semibold">MLA:</p>
                                <p className="pl-4">{generateCitation(literature, 'mla')}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Chicago:</p>
                                <p className="pl-4">{generateCitation(literature, 'chicago')}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleSelectLiterature(literature)}
                      >
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-md">
                <BookCopy className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No literature selected yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab('search')}>
          Find More Literature
        </Button>
        <Button 
          onClick={handleAddToSubmission}
          disabled={selectedLiterature.length === 0}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Add to Submission
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LiteratureDiscovery;