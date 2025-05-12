/**
 * Citation Manager Component
 * 
 * This component handles the display and management of citations for various sections
 * of a 510(k) document, supporting the enhanced literature discovery feature.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add,
  ArrowForward,
  Bookmark,
  BookmarkBorder,
  Delete,
  Edit,
  FileCopy,
  FilterAlt,
  FormatQuote,
  Info,
  Link as LinkIcon,
  MenuBook,
  MoreVert,
  Search,
  Sort
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DataGrid } from '@mui/x-data-grid';

// Citation styles
const CITATION_STYLES = [
  { id: 'APA', label: 'APA Style' },
  { id: 'AMA', label: 'AMA Style' },
  { id: 'Vancouver', label: 'Vancouver Style' },
  { id: 'Harvard', label: 'Harvard Style' },
  { id: 'Chicago', label: 'Chicago Style' }
];

// Document section definitions
const DEFAULT_SECTIONS = [
  { id: 'literature-review', name: 'Literature Review' },
  { id: 'device-description', name: 'Device Description' },
  { id: 'substantial-equivalence', name: 'Substantial Equivalence' },
  { id: 'performance-data', name: 'Performance Data' },
  { id: 'clinical-studies', name: 'Clinical Studies' }
];

/**
 * Citation Manager Component
 * 
 * @param {Object} props Component props
 * @param {string} props.documentId 510(k) document ID
 * @param {array} props.sections Document sections (optional)
 * @param {function} props.onOpenLiteratureSearch Callback to open literature search
 */
const CitationManager = ({ 
  documentId, 
  sections = DEFAULT_SECTIONS,
  onOpenLiteratureSearch
}) => {
  const theme = useTheme();
  
  // State for citations data
  const [citations, setCitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and sort state
  const [activeSection, setActiveSection] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [editText, setEditText] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editSection, setEditSection] = useState('');
  
  // Action menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuCitation, setMenuCitation] = useState(null);
  
  // Confirmation dialog state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingCitation, setDeletingCitation] = useState(null);
  
  // Comparative analysis dialog state
  const [showComparativeDialog, setShowComparativeDialog] = useState(false);
  const [selectedCitations, setSelectedCitations] = useState([]);
  const [comparativeAnalysis, setComparativeAnalysis] = useState('');
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  
  // Citation count by section
  const getCitationCountBySection = (sectionId) => {
    if (sectionId === 'all') return citations.length;
    return citations.filter(citation => citation.sectionId === sectionId).length;
  };
  
  // Fetch citations from the API
  const fetchCitations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/510k/literature/citations/${documentId}`);
      
      // Process and set citations
      setCitations(response.data.citations.map((citation, index) => ({
        ...citation,
        id: citation.id || `citation-${index}`
      })));
    } catch (error) {
      console.error('Error fetching citations:', error);
      setError('Failed to load citations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sort citations based on current order
  const sortCitations = (citationsToSort) => {
    switch (sortOrder) {
      case 'newest':
        return [...citationsToSort].sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
      case 'oldest':
        return [...citationsToSort].sort((a, b) => 
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
      case 'alphabetical':
        return [...citationsToSort].sort((a, b) => 
          (a.literature?.title || '').localeCompare(b.literature?.title || '')
        );
      default:
        return citationsToSort;
    }
  };
  
  // Get filtered and sorted citations
  const getFilteredCitations = () => {
    let filtered = citations;
    
    // Apply section filter
    if (activeSection !== 'all') {
      filtered = filtered.filter(citation => citation.sectionId === activeSection);
    }
    
    // Apply sorting
    return sortCitations(filtered);
  };
  
  // Handle opening the action menu
  const handleOpenMenu = (event, citation) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCitation(citation);
  };
  
  // Handle closing the action menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuCitation(null);
  };
  
  // Handle citation editing
  const handleEditCitation = (citation) => {
    setSelectedCitation(citation);
    setEditText(citation.citationText);
    setEditStyle(citation.citationStyle);
    setEditSection(citation.sectionId);
    setShowEditDialog(true);
    handleCloseMenu();
  };
  
  // Submit edited citation
  const submitEditedCitation = async () => {
    try {
      const response = await axios.patch(`/api/510k/literature/citations/${selectedCitation.id}`, {
        citationText: editText,
        citationStyle: editStyle,
        sectionId: editSection
      });
      
      // Update citations in state
      setCitations(prev => prev.map(citation => 
        citation.id === selectedCitation.id 
          ? { 
              ...citation, 
              citationText: editText, 
              citationStyle: editStyle,
              sectionId: editSection
            } 
          : citation
      ));
      
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating citation:', error);
      setError('Failed to update citation. Please try again.');
    }
  };
  
  // Handle citation deletion
  const handleDeleteCitation = (citation) => {
    setDeletingCitation(citation);
    setConfirmDelete(true);
    handleCloseMenu();
  };
  
  // Confirm and perform citation deletion
  const confirmDeleteCitation = async () => {
    try {
      await axios.delete(`/api/510k/literature/citations/${deletingCitation.id}`);
      
      // Remove from state
      setCitations(prev => prev.filter(citation => citation.id !== deletingCitation.id));
      
      setConfirmDelete(false);
      setDeletingCitation(null);
    } catch (error) {
      console.error('Error deleting citation:', error);
      setError('Failed to delete citation. Please try again.');
    }
  };
  
  // Handle citation selection for comparative analysis
  const handleSelectCitation = (citation) => {
    setSelectedCitations(prev => {
      const isSelected = prev.some(c => c.id === citation.id);
      
      if (isSelected) {
        return prev.filter(c => c.id !== citation.id);
      } else {
        return [...prev, citation];
      }
    });
  };
  
  // Generate comparative analysis
  const generateComparativeAnalysis = async () => {
    if (selectedCitations.length < 2) return;
    
    setIsGeneratingAnalysis(true);
    setComparativeAnalysis('');
    
    try {
      const response = await axios.post('/api/510k/literature/comparative-analysis', {
        literatureIds: selectedCitations.map(c => c.literature.id),
        deviceContext: true,
        focusAreas: ['methodology', 'outcomes', 'clinical_relevance']
      });
      
      setComparativeAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error generating comparative analysis:', error);
      setComparativeAnalysis('Failed to generate comparative analysis. Please try again later.');
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };
  
  // Generate a section review from citations
  const generateSectionReview = async (sectionId) => {
    const sectionCitations = citations.filter(c => c.sectionId === sectionId);
    
    if (sectionCitations.length === 0) {
      setError(`No citations found for the selected section`);
      return;
    }
    
    try {
      const response = await axios.post('/api/510k/literature/review-section', {
        documentId,
        sectionId,
        citationIds: sectionCitations.map(c => c.id)
      });
      
      // Handle the generated review (e.g., display in a dialog or add to document)
      console.log('Generated review:', response.data.reviewText);
      
      // Implementation will depend on how the UI should handle the generated content
    } catch (error) {
      console.error('Error generating section review:', error);
      setError('Failed to generate section review. Please try again later.');
    }
  };
  
  // Load citations on component mount
  useEffect(() => {
    if (documentId) {
      fetchCitations();
    }
  }, [documentId]);
  
  // Get section name from ID
  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : sectionId;
  };
  
  // Grid columns for DataGrid view
  const columns = [
    {
      field: 'source',
      headerName: 'Source',
      width: 150,
      renderCell: (params) => {
        const literature = params.row.literature || {};
        const source = literature.source || 'unknown';
        
        return (
          <Chip
            icon={<MenuBook />}
            label={source.toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 300,
      flex: 1,
      valueGetter: (params) => params.row.literature?.title || 'Unknown',
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.literature?.title}>
          {params.row.literature?.title || 'Unknown'}
        </Typography>
      )
    },
    {
      field: 'citationStyle',
      headerName: 'Style',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'sectionId',
      headerName: 'Section',
      width: 180,
      valueGetter: (params) => getSectionName(params.value),
    },
    {
      field: 'createdAt',
      headerName: 'Added',
      width: 120,
      valueGetter: (params) => {
        if (!params.value) return '';
        try {
          return format(new Date(params.value), 'MM/dd/yyyy');
        } catch (e) {
          return params.value;
        }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={(event) => handleOpenMenu(event, params.row)}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Checkbox
            icon={<BookmarkBorder fontSize="small" />}
            checkedIcon={<Bookmark fontSize="small" />}
            checked={selectedCitations.some(c => c.id === params.row.id)}
            onChange={() => handleSelectCitation(params.row)}
            size="small"
          />
        </Box>
      )
    }
  ];
  
  return (
    <Box>
      {/* Header section */}
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" component="h2">
          Citations Manager
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<Add />}
            color="primary"
            onClick={onOpenLiteratureSearch}
            sx={{ mr: 1 }}
          >
            Add Citations
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            disabled={selectedCitations.length < 2}
            onClick={() => setShowComparativeDialog(true)}
          >
            Compare Selected ({selectedCitations.length})
          </Button>
        </Box>
      </Box>
      
      {/* Filter and options bar */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box display="flex" alignItems="center">
              <FilterAlt fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
              <Typography variant="body2" sx={{ mr: 1 }}>
                Section:
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              <Chip
                label={`All (${getCitationCountBySection('all')})`}
                onClick={() => setActiveSection('all')}
                color={activeSection === 'all' ? 'primary' : 'default'}
                variant={activeSection === 'all' ? 'filled' : 'outlined'}
                size="small"
              />
              
              {sections.map((section) => (
                <Chip
                  key={section.id}
                  label={`${section.name} (${getCitationCountBySection(section.id)})`}
                  onClick={() => setActiveSection(section.id)}
                  color={activeSection === section.id ? 'primary' : 'default'}
                  variant={activeSection === section.id ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item>
            <Box display="flex" alignItems="center">
              <Sort fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="alphabetical">Alphabetical</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Main content area */}
      <Box mb={3} position="relative" minHeight={400}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper elevation={1} sx={{ p: 2, bgcolor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : getFilteredCitations().length > 0 ? (
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={getFilteredCitations()}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection={false}
              disableSelectionOnClick
              density="standard"
              getRowClassName={(params) => {
                return selectedCitations.some(c => c.id === params.id) ? 'selected-row' : '';
              }}
              sx={{
                '& .selected-row': {
                  bgcolor: `${theme.palette.primary.light}22`,
                  '&:hover': {
                    bgcolor: `${theme.palette.primary.light}33`,
                  }
                }
              }}
            />
          </div>
        ) : (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            p={4}
          >
            <FormatQuote fontSize="large" color="disabled" sx={{ mb: 2, fontSize: 60 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No citations found
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
              {activeSection !== 'all' 
                ? `No citations found for the "${getSectionName(activeSection)}" section. Add citations from the literature search.`
                : 'No citations have been added yet. Add citations from the literature search to strengthen your 510(k) submission.'}
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Search />}
              onClick={onOpenLiteratureSearch}
            >
              Search Literature
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Section-based actions */}
      {citations.length > 0 && activeSection !== 'all' && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">
              {getSectionName(activeSection)} Section Actions
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => generateSectionReview(activeSection)}
              disabled={getCitationCountBySection(activeSection) === 0}
            >
              Generate Section Review
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Action menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleEditCitation(menuCitation)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit Citation" />
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            if (menuCitation?.literature?.url) {
              window.open(menuCitation.literature.url, '_blank');
            }
            handleCloseMenu();
          }}
          disabled={!menuCitation?.literature?.url}
        >
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Source" />
        </MenuItem>
        
        <MenuItem onClick={() => handleDeleteCitation(menuCitation)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" sx={{ color: theme.palette.error.main }} />
        </MenuItem>
      </Menu>
      
      {/* Edit dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Citation
        </DialogTitle>
        
        <DialogContent>
          <Box my={1}>
            <Typography variant="subtitle2" gutterBottom>
              {selectedCitation?.literature?.title}
            </Typography>
            
            <Grid container spacing={3} mt={0.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="edit-citation-style-label">Citation Style</InputLabel>
                  <Select
                    labelId="edit-citation-style-label"
                    value={editStyle}
                    onChange={(e) => setEditStyle(e.target.value)}
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
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="edit-section-label">Document Section</InputLabel>
                  <Select
                    labelId="edit-section-label"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
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
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={submitEditedCitation} 
            color="primary"
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>
          Delete Citation
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this citation? This action cannot be undone.
          </DialogContentText>
          
          {deletingCitation && (
            <Box mt={2} p={1.5} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="body2" fontStyle="italic">
                "{deletingCitation.literature?.title}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteCitation} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Comparative analysis dialog */}
      <Dialog
        open={showComparativeDialog}
        onClose={() => setShowComparativeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Comparative Analysis
        </DialogTitle>
        
        <DialogContent>
          {selectedCitations.length >= 2 ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selected Literature
              </Typography>
              
              <List>
                {selectedCitations.map((citation) => (
                  <ListItem key={citation.id}>
                    <ListItemIcon>
                      <MenuBook />
                    </ListItemIcon>
                    <ListItemText 
                      primary={citation.literature?.title} 
                      secondary={citation.literature?.authors}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              {!comparativeAnalysis && !isGeneratingAnalysis && (
                <Box textAlign="center" my={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={generateComparativeAnalysis}
                  >
                    Generate Comparative Analysis
                  </Button>
                </Box>
              )}
              
              {isGeneratingAnalysis ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : comparativeAnalysis ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Analysis Results
                  </Typography>
                  
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography variant="body1" whiteSpace="pre-line">
                      {comparativeAnalysis}
                    </Typography>
                  </Paper>
                </Box>
              ) : null}
            </Box>
          ) : (
            <Box textAlign="center" my={3}>
              <Typography variant="body1" color="textSecondary">
                Please select at least 2 citations to compare
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowComparativeDialog(false)} color="inherit">
            Close
          </Button>
          {comparativeAnalysis && (
            <Button 
              variant="outlined"
              startIcon={<FileCopy />}
              onClick={() => {
                navigator.clipboard.writeText(comparativeAnalysis);
              }}
            >
              Copy to Clipboard
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitationManager;