/**
 * Enhanced Literature Search Component
 * 
 * This component provides an advanced literature search interface for the 510(k) submission process,
 * with semantic search capabilities and multi-source aggregation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add,
  ArrowBack,
  BookmarkAdd,
  CalendarMonth,
  ExpandMore,
  FileDownload,
  FilterAlt,
  Info,
  LibraryBooks,
  Link as LinkIcon,
  NewReleases,
  PictureAsPdf,
  Search,
  Source,
  Summarize,
  Tune
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';

// Source data for filtering
const LITERATURE_SOURCES = [
  { id: 'pubmed', label: 'PubMed', color: '#4285F4', icon: <LibraryBooks /> },
  { id: 'fda', label: 'FDA Database', color: '#EA4335', icon: <Source /> },
  { id: 'internal', label: 'Internal Documents', color: '#34A853', icon: <PictureAsPdf /> },
  { id: 'eudamed', label: 'EUDAMED', color: '#FBBC05', icon: <LinkIcon /> },
  { id: 'pmcid', label: 'PubMed Central', color: '#8F44AD', icon: <BookmarkAdd /> }
];

// Citation styles
const CITATION_STYLES = [
  { id: 'APA', label: 'APA Style' },
  { id: 'AMA', label: 'AMA Style' },
  { id: 'Vancouver', label: 'Vancouver Style' },
  { id: 'Harvard', label: 'Harvard Style' },
  { id: 'Chicago', label: 'Chicago Style' }
];

// Summary types
const SUMMARY_TYPES = [
  { id: 'abstract', label: 'Abstract Summary' },
  { id: 'conclusion', label: 'Key Conclusions' },
  { id: 'methods', label: 'Methods Summary' },
  { id: 'results', label: 'Results Summary' },
  { id: 'regulatory', label: 'Regulatory Implications' },
  { id: 'full', label: 'Full Summary' }
];

/**
 * Enhanced Literature Search Component
 * 
 * @param {Object} props Component props
 * @param {string} props.documentId 510(k) document ID
 * @param {string} props.deviceType Device type for context-specific search
 * @param {string} props.predicateDevice Predicate device for context
 * @param {function} props.onBack Callback for back navigation
 * @param {function} props.onAddCitation Callback when citation is added
 */
const EnhancedLiteratureSearch = ({ 
  documentId, 
  deviceType = '', 
  predicateDevice = '',
  onBack,
  onAddCitation
}) => {
  const theme = useTheme();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Filters state
  const [filters, setFilters] = useState({
    sources: LITERATURE_SOURCES.map(s => s.id),
    startDate: null,
    endDate: null,
    relevanceThreshold: 20,
    journals: [],
    authors: [],
    includePredicateContext: true
  });
  
  // Filter dialog state
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({...filters});
  
  // Summary dialog state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryType, setSummaryType] = useState('abstract');
  const [summaryContent, setSummaryContent] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Citation dialog state
  const [showCitation, setShowCitation] = useState(false);
  const [citationStyle, setCitationStyle] = useState('APA');
  const [citationText, setCitationText] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState([
    { id: 'literature-review', name: 'Literature Review' },
    { id: 'device-description', name: 'Device Description' },
    { id: 'substantial-equivalence', name: 'Substantial Equivalence' },
    { id: 'performance-data', name: 'Performance Data' },
    { id: 'clinical-studies', name: 'Clinical Studies' }
  ]);
  
  // Error handling
  const [error, setError] = useState(null);
  
  // Data grid columns
  const columns = [
    { 
      field: 'source', 
      headerName: 'Source', 
      width: 140,
      renderCell: (params) => {
        const source = LITERATURE_SOURCES.find(s => s.id === params.value) || 
          { label: params.value, color: '#777', icon: <LinkIcon /> };
        
        return (
          <Chip
            icon={source.icon}
            label={source.label}
            size="small"
            style={{ 
              backgroundColor: `${source.color}22`,
              borderColor: source.color,
              color: source.color
            }}
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'title', 
      headerName: 'Title', 
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" style={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'publication_date', 
      headerName: 'Date', 
      width: 120,
      valueGetter: (params) => {
        if (!params.value) return '';
        try {
          return format(new Date(params.value), 'MMM d, yyyy');
        } catch (e) {
          return params.value;
        }
      }
    },
    { 
      field: 'relevance_score', 
      headerName: 'Relevance', 
      width: 120,
      renderCell: (params) => {
        const score = params.value || 0;
        const color = score > 80 ? '#4caf50' : 
                      score > 60 ? '#ff9800' : 
                      score > 40 ? '#ffc107' : 
                      '#f44336';
        return (
          <Box display="flex" alignItems="center">
            <Box width={50} mr={1}>
              <LinearProgressWithLabel value={score} color={color} />
            </Box>
            <Typography variant="body2">{Math.round(score)}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleViewSummary(params.row)}
            title="View Summary"
          >
            <Summarize fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleAddCitation(params.row)}
            title="Add Citation"
          >
            <Add fontSize="small" />
          </IconButton>
          {params.row.url && (
            <IconButton 
              size="small" 
              component="a" 
              href={params.row.url}
              target="_blank"
              rel="noopener noreferrer" 
              title="Open Original Source"
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query, filters) => {
      if (!query.trim()) return;
      
      performSearch(query, filters);
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedSearch(query, filters);
    } else {
      setSearchResults([]);
    }
  };

  // Perform search API call
  const performSearch = async (query, filters) => {
    setIsSearching(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = {
        query,
        source: filters.sources,
        relevanceThreshold: filters.relevanceThreshold
      };
      
      // Add date filters if present
      if (filters.startDate) {
        params.startDate = format(filters.startDate, 'yyyy-MM-dd');
      }
      
      if (filters.endDate) {
        params.endDate = format(filters.endDate, 'yyyy-MM-dd');
      }
      
      // Add device context if present
      if (deviceType) {
        params.deviceType = deviceType;
      }
      
      // Add predicate device context if enabled and present
      if (filters.includePredicateContext && predicateDevice) {
        params.predicate = true;
      }
      
      // Make API call
      const response = await axios.get('/api/510k/literature/search', { params });
      
      // Process and set results
      setSearchResults(response.data.entries.map((entry, index) => ({
        ...entry,
        id: entry.id || `result-${index}`
      })));
    } catch (error) {
      console.error('Error searching literature:', error);
      setError('Failed to search literature. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
    
    if (searchQuery.trim()) {
      performSearch(searchQuery, tempFilters);
    }
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      sources: LITERATURE_SOURCES.map(s => s.id),
      startDate: null,
      endDate: null,
      relevanceThreshold: 20,
      journals: [],
      authors: [],
      includePredicateContext: true
    };
    
    setTempFilters(defaultFilters);
  };

  // Custom progress bar component
  const LinearProgressWithLabel = ({ value, color }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
        <Box
          sx={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            backgroundColor: '#eee',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: 4,
              backgroundColor: color,
              width: `${value}%`,
            }}
          />
        </Box>
      </Box>
    );
  };

  // Handle viewing a summary
  const handleViewSummary = async (literature) => {
    setSelectedResult(literature);
    setSummaryType('abstract');
    setSummaryContent('');
    setShowSummary(true);
    
    try {
      await generateSummary(literature.id, 'abstract');
    } catch (error) {
      setSummaryContent('Failed to generate summary. Please try again.');
    }
  };

  // Generate a summary
  const generateSummary = async (literatureId, type) => {
    setIsGeneratingSummary(true);
    
    try {
      const response = await axios.post(`/api/510k/literature/${literatureId}/summary`, {
        type,
        regulatoryContext: true,
        device510k: true,
        comparativeFocus: type === 'regulatory'
      });
      
      setSummaryContent(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Handle changing summary type
  const handleSummaryTypeChange = async (event) => {
    const newType = event.target.value;
    setSummaryType(newType);
    
    if (selectedResult) {
      try {
        await generateSummary(selectedResult.id, newType);
      } catch (error) {
        setSummaryContent('Failed to generate summary. Please try again.');
      }
    }
  };

  // Handle adding a citation
  const handleAddCitation = (literature) => {
    setSelectedResult(literature);
    setSectionId(sections[0].id);
    
    // Generate default citation text based on style
    generateCitationText(literature, 'APA');
    
    setShowCitation(true);
  };

  // Generate citation text based on style
  const generateCitationText = (literature, style) => {
    setCitationStyle(style);
    
    let citation = '';
    const {
      title,
      authors,
      journal,
      publication_date,
      doi,
      url
    } = literature;
    
    const year = publication_date ? 
      new Date(publication_date).getFullYear() : 
      'n.d.';
    
    switch (style) {
      case 'APA':
        citation = `${authors || 'Author, A.'} (${year}). ${title}. ${journal || ''}`;
        if (doi) citation += ` doi:${doi}`;
        break;
        
      case 'AMA':
        citation = `${authors || 'Author A'}. ${title}. ${journal || ''}. `;
        citation += `Published ${publication_date ? format(new Date(publication_date), 'MMM d, yyyy') : 'n.d.'}.`;
        if (doi) citation += ` doi:${doi}`;
        break;
        
      case 'Vancouver':
        citation = `${authors ? authors.split(',')[0] + ' et al.' : 'Author A et al.'}. `;
        citation += `${title}. ${journal || ''}. ${year};`;
        break;
        
      case 'Harvard':
        citation = `${authors || 'Author, A.'} (${year}) "${title}", ${journal || ''}`;
        break;
        
      case 'Chicago':
        citation = `${authors || 'Author, A.'} "${title}" ${journal || ''} (${year})`;
        break;
        
      default:
        citation = `${authors || 'Author, A.'} (${year}). ${title}. ${journal || ''}`;
    }
    
    setCitationText(citation);
  };

  // Handle citation style change
  const handleCitationStyleChange = (event) => {
    const style = event.target.value;
    
    if (selectedResult) {
      generateCitationText(selectedResult, style);
    }
  };

  // Submit citation
  const submitCitation = async () => {
    try {
      const response = await axios.post('/api/510k/literature/citations', {
        documentId,
        sectionId,
        literatureId: selectedResult.id,
        citationText,
        citationStyle
      });
      
      setShowCitation(false);
      
      // Call the onAddCitation callback if provided
      if (onAddCitation) {
        onAddCitation({
          id: response.data.id,
          literature: selectedResult,
          citationText,
          citationStyle,
          sectionId
        });
      }
    } catch (error) {
      console.error('Error adding citation:', error);
      setError('Failed to add citation. Please try again later.');
    }
  };

  // Auto-focus search input on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchInput = document.getElementById('literature-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      {/* Header section */}
      <Box mb={2} display="flex" alignItems="center">
        <IconButton 
          onClick={onBack}
          sx={{ mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h2">
          Enhanced Literature Search
        </Typography>
        
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<Info />}
            sx={{ mr: 1 }}
            size="small"
          >
            Help
          </Button>
        </Box>
      </Box>
      
      {/* Context chips */}
      {(deviceType || predicateDevice) && (
        <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
          {deviceType && (
            <Chip 
              label={`Device: ${deviceType}`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {predicateDevice && (
            <Chip 
              label={`Predicate: ${predicateDevice}`} 
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Box>
      )}
      
      {/* Search box */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <TextField
          id="literature-search-input"
          fullWidth
          label="Search for literature..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowFilters(true)}
                  edge="end"
                >
                  <FilterAlt />
                </IconButton>
              </InputAdornment>
            )
          }}
          placeholder="Example: performance data for transcatheter valve"
        />
        
        {/* Active filters display */}
        {(filters.sources.length !== LITERATURE_SOURCES.length || 
          filters.startDate || 
          filters.endDate ||
          filters.relevanceThreshold !== 20) && (
          <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
            {filters.sources.length !== LITERATURE_SOURCES.length && (
              <Chip 
                label={`Sources: ${filters.sources.length}`} 
                size="small"
                onDelete={() => setShowFilters(true)}
                color="primary"
                variant="outlined"
              />
            )}
            
            {filters.startDate && (
              <Chip 
                label={`From: ${format(filters.startDate, 'MM/dd/yyyy')}`} 
                size="small"
                onDelete={() => setShowFilters(true)}
                color="primary"
                variant="outlined"
              />
            )}
            
            {filters.endDate && (
              <Chip 
                label={`To: ${format(filters.endDate, 'MM/dd/yyyy')}`} 
                size="small"
                onDelete={() => setShowFilters(true)}
                color="primary"
                variant="outlined"
              />
            )}
            
            {filters.relevanceThreshold !== 20 && (
              <Chip 
                label={`Min relevance: ${filters.relevanceThreshold}%`} 
                size="small"
                onDelete={() => setShowFilters(true)}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>
      
      {/* Results container */}
      <Box mb={3} position="relative" minHeight={400}>
        {isSearching && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="rgba(255, 255, 255, 0.7)"
            zIndex={1}
          >
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}
        
        {searchResults.length > 0 ? (
          <Box>
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">
                {searchResults.length} results found
              </Typography>
              
              <Box display="flex" alignItems="center">
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  aria-label="view tabs"
                  sx={{ mr: 2 }}
                >
                  <Tab label="Table View" />
                  <Tab label="Card View" />
                </Tabs>
              </Box>
            </Box>
            
            {activeTab === 0 ? (
              <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                  rows={searchResults}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  isRowSelectable={() => false}
                  density="standard"
                  getRowClassName={(params) => {
                    return params.row.relevance_score > 80 ? 'high-relevance' : '';
                  }}
                  sx={{
                    '& .high-relevance': {
                      bgcolor: `${theme.palette.success.light}22`
                    }
                  }}
                />
              </div>
            ) : (
              <Grid container spacing={2}>
                {searchResults.map((result) => (
                  <Grid item xs={12} sm={6} md={4} key={result.id}>
                    <Card 
                      elevation={2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    >
                      <CardHeader
                        title={
                          <Box display="flex" alignItems="flex-start">
                            {/* Source chip */}
                            <Box mr={1}>
                              {(() => {
                                const source = LITERATURE_SOURCES.find(s => s.id === result.source) || 
                                  { label: result.source, color: '#777', icon: <LinkIcon /> };
                                
                                return (
                                  <Chip
                                    icon={source.icon}
                                    label={source.label}
                                    size="small"
                                    style={{ 
                                      backgroundColor: `${source.color}22`,
                                      borderColor: source.color,
                                      color: source.color
                                    }}
                                    variant="outlined"
                                  />
                                );
                              })()}
                            </Box>
                            
                            {/* Date if available */}
                            {result.publication_date && (
                              <Typography variant="caption" color="textSecondary">
                                {format(new Date(result.publication_date), 'MMM d, yyyy')}
                              </Typography>
                            )}
                            
                            {/* Relevance indicator */}
                            <Box ml="auto">
                              <Chip
                                label={`${Math.round(result.relevance_score || 0)}%`}
                                size="small"
                                sx={{
                                  bgcolor: (() => {
                                    const score = result.relevance_score || 0;
                                    return score > 80 ? `${theme.palette.success.light}22` :
                                           score > 60 ? `${theme.palette.warning.light}22` :
                                           score > 40 ? `${theme.palette.info.light}22` :
                                           `${theme.palette.error.light}22`;
                                  })(),
                                  borderColor: (() => {
                                    const score = result.relevance_score || 0;
                                    return score > 80 ? theme.palette.success.main :
                                           score > 60 ? theme.palette.warning.main :
                                           score > 40 ? theme.palette.info.main :
                                           theme.palette.error.main;
                                  })(),
                                  color: (() => {
                                    const score = result.relevance_score || 0;
                                    return score > 80 ? theme.palette.success.main :
                                           score > 60 ? theme.palette.warning.main :
                                           score > 40 ? theme.palette.info.main :
                                           theme.palette.error.main;
                                  })()
                                }}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                        subheader={
                          <Typography 
                            variant="subtitle1" 
                            sx={{ mt: 2, fontSize: '0.95rem', fontWeight: 500 }}
                          >
                            {result.title}
                          </Typography>
                        }
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        {result.abstract && (
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {result.abstract}
                          </Typography>
                        )}
                        
                        {result.authors && (
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            {result.authors}
                          </Typography>
                        )}
                        
                        {result.journal && (
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{ mt: 0.5 }}
                          >
                            {result.journal}
                          </Typography>
                        )}
                      </CardContent>
                      
                      <Divider />
                      
                      <Box 
                        p={1} 
                        display="flex" 
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewSummary(result)}
                          title="View Summary"
                        >
                          <Summarize fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleAddCitation(result)}
                          title="Add Citation"
                          color="primary"
                        >
                          <Add fontSize="small" />
                        </IconButton>
                        
                        {result.url && (
                          <IconButton 
                            size="small" 
                            component="a" 
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer" 
                            title="Open Original Source"
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        {result.pdf_url && (
                          <IconButton 
                            size="small" 
                            component="a" 
                            href={result.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer" 
                            title="Download PDF"
                          >
                            <FileDownload fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          !isSearching && searchQuery && (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              p={4}
            >
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No results found
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Try adjusting your search terms or filters.
              </Typography>
            </Box>
          )
        )}
        
        {!searchQuery && !isSearching && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            p={4}
          >
            <Search fontSize="large" color="disabled" sx={{ mb: 2, fontSize: 60 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Start your literature search
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 450 }}>
              Search across multiple sources including PubMed, FDA databases, 
              and internal documents. For 510(k) submissions, try searching for 
              literature related to your device type and predicate device.
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Filter dialog */}
      <Dialog
        open={showFilters}
        onClose={() => setShowFilters(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <FilterAlt sx={{ mr: 1 }} />
            Search Filters
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Sources filter */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Literature Sources
              </Typography>
              <FormGroup row>
                {LITERATURE_SOURCES.map((source) => (
                  <FormControlLabel
                    key={source.id}
                    control={
                      <Checkbox
                        checked={tempFilters.sources.includes(source.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('sources', [
                              ...tempFilters.sources,
                              source.id
                            ]);
                          } else {
                            handleFilterChange(
                              'sources',
                              tempFilters.sources.filter(s => s !== source.id)
                            );
                          }
                        }}
                        style={{ color: source.color }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        {source.icon}
                        <Typography sx={{ ml: 0.5 }}>{source.label}</Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Grid>
            
            {/* Date range filter */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={tempFilters.startDate}
                  onChange={(newValue) => {
                    handleFilterChange('startDate', newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={tempFilters.endDate}
                  onChange={(newValue) => {
                    handleFilterChange('endDate', newValue);
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Relevance threshold */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Minimum Relevance Score: {tempFilters.relevanceThreshold}%
              </Typography>
              <Slider
                value={tempFilters.relevanceThreshold}
                onChange={(e, newValue) => {
                  handleFilterChange('relevanceThreshold', newValue);
                }}
                aria-labelledby="relevance-threshold-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
            </Grid>
            
            {/* Predicate device context */}
            {predicateDevice && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tempFilters.includePredicateContext}
                      onChange={(e) => {
                        handleFilterChange('includePredicateContext', e.target.checked);
                      }}
                      color="primary"
                    />
                  }
                  label={`Include predicate device context (${predicateDevice})`}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={resetFilters} color="inherit">
            Reset Filters
          </Button>
          <Button onClick={() => setShowFilters(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={applyFilters} color="primary" variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Summary dialog */}
      <Dialog
        open={showSummary}
        onClose={() => setShowSummary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">
              Summary
            </Typography>
            {selectedResult && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                {selectedResult.title}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="summary-type-label">Summary Type</InputLabel>
            <Select
              labelId="summary-type-label"
              value={summaryType}
              onChange={handleSummaryTypeChange}
              label="Summary Type"
            >
              {SUMMARY_TYPES.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box minHeight={200} position="relative">
            {isGeneratingSummary ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
                height={200}
              >
                <CircularProgress />
              </Box>
            ) : (
              <Typography variant="body1">
                {summaryContent}
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowSummary(false)} color="inherit">
            Close
          </Button>
          <Button 
            onClick={() => {
              // First close the summary
              setShowSummary(false);
              
              // Then open the citation dialog
              if (selectedResult) {
                handleAddCitation(selectedResult);
              }
            }} 
            color="primary"
            variant="contained"
            startIcon={<Add />}
          >
            Add as Citation
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Citation dialog */}
      <Dialog
        open={showCitation}
        onClose={() => setShowCitation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">
              Add Citation
            </Typography>
            {selectedResult && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                {selectedResult.title}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="citation-style-label">Citation Style</InputLabel>
                <Select
                  labelId="citation-style-label"
                  value={citationStyle}
                  onChange={handleCitationStyleChange}
                  label="Citation Style"
                >
                  {CITATION_STYLES.map((style) => (
                    <MenuItem key={style.id} value={style.id}>
                      {style.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="section-label">Document Section</InputLabel>
                <Select
                  labelId="section-label"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  label="Document Section"
                >
                  {sections.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Citation Text"
                multiline
                rows={4}
                value={citationText}
                onChange={(e) => setCitationText(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowCitation(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={submitCitation} 
            color="primary"
            variant="contained"
          >
            Add Citation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedLiteratureSearch;