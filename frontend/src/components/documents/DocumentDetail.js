import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudDownload as CloudDownloadIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Description as DescriptionIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import api from '../../services/apiService';
import moment from 'moment';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Changed variable name from document to documentData
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/${id}/`);
      // Changed to setDocumentData
      setDocumentData(response.data);
      
      // Determine preview type based on file extension
      const fileUrl = response.data.file;
      const fileExt = fileUrl.split('.').pop().toLowerCase();
      
      if (['pdf'].includes(fileExt)) {
        setPreviewType('pdf');
        setPreviewUrl(fileUrl);
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExt)) {
        setPreviewType('image');
        setPreviewUrl(fileUrl);
      } else if (['txt', 'md', 'html', 'css', 'js'].includes(fileExt)) {
        setPreviewType('text');
        // For text files, we need to fetch the content
        const textResponse = await fetch(fileUrl);
        const text = await textResponse.text();
        setPreviewUrl(text);
      } else {
        setPreviewType('unsupported');
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocument();
  }, [id]);
  
  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  
  const handlePreviousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };
  
  const handleNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
  };
  
  const handleDownload = () => {
    console.log(`Attempting to download document with ID: ${id}`);
    
    api.get(`/documents/${id}/download/`, { responseType: 'blob' })
      .then(response => {
        console.log('Download response received:', response);
        
        // Check if we got a valid blob response
        if (response.data.size > 0) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // Now using global document object, not the state variable
          const link = window.document.createElement('a');
          link.href = url;
          
          // Get filename from Content-Disposition header if available
          const contentDisposition = response.headers['content-disposition'];
          // Changed to use documentData instead of document
          let filename = documentData.title || 'document';
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }
          
          link.setAttribute('download', filename);
          // Using window.document instead of document
          window.document.body.appendChild(link);
          link.click();
          link.remove();
          
          // Clean up the URL object
          window.URL.revokeObjectURL(url);
        } else {
          console.error('Received empty blob response');
          alert('Failed to download document: Empty response received');
        }
      })
      .catch(error => {
        console.error('Error downloading document:', error);
        
        // More detailed error message
        let errorMessage = 'Failed to download document. ';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage += `Server responded with status: ${error.response.status}`;
          console.error('Error response data:', error.response.data);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage += 'No response received from server';
          console.error('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage += error.message;
        }
        
        alert(errorMessage);
      });
  };
  
  const handleDelete = async () => {
    try {
      await api.delete(`/documents/${id}/`);
      navigate('/documents');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
    setDeleteDialogOpen(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!documentData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Document not found.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to="/documents"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Documents
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {documentData.title}
        </Typography>
        <Box>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} sx={{ mr: 1 }}>
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Version History">
            <IconButton 
              component={RouterLink} 
              to={`/documents/${id}/versions`}
              sx={{ mr: 1 }}
            >
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Document Details" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={documentData.description || 'No description provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created By"
                    secondary={documentData.created_by_username}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created At"
                    secondary={moment(documentData.created_at).format('MMMM D, YYYY [at] h:mm A')}
                  />
                </ListItem>
                {documentData.workflow && (
                  <ListItem>
                    <ListItemIcon>
                      <AccountTreeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Workflow"
                      secondary={
                        <>
                          {documentData.workflow.name}
                          <Chip 
                            size="small" 
                            label={documentData.workflow_status?.status || 'Not Started'}
                            color={
                              documentData.workflow_status?.status === 'approved' ? 'success' :
                              documentData.workflow_status?.status === 'rejected' ? 'error' :
                              documentData.workflow_status?.status === 'in_progress' ? 'primary' :
                              'default'
                            }
                            sx={{ ml: 1 }}
                          />
                        </>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Document Preview" />
            <Divider />
            <CardContent>
              {previewType === 'pdf' && (
                <Box sx={{ textAlign: 'center' }}>
                  <Document
                    file={previewUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    loading={<CircularProgress />}
                    error={<Typography color="error">Failed to load PDF</Typography>}
                  >
                    <Page pageNumber={pageNumber} width={600} />
                  </Document>
                  
                  {numPages && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Button 
                        onClick={handlePreviousPage} 
                        disabled={pageNumber <= 1}
                        variant="outlined"
                        sx={{ mr: 2 }}
                      >
                        Previous
                      </Button>
                      <Typography>
                        Page {pageNumber} of {numPages}
                      </Typography>
                      <Button 
                        onClick={handleNextPage} 
                        disabled={pageNumber >= numPages}
                        variant="outlined"
                        sx={{ ml: 2 }}
                      >
                        Next
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
              
              {previewType === 'image' && (
                <Box sx={{ textAlign: 'center' }}>
                  <img 
                    src={previewUrl} 
                    alt={documentData.title} 
                    style={{ maxWidth: '100%', maxHeight: '600px' }} 
                  />
                </Box>
              )}
              
              {previewType === 'text' && (
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 1,
                  maxHeight: '600px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                }}>
                  {previewUrl}
                </Box>
              )}
              
              {previewType === 'unsupported' && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom>
                    Preview not available for this file type.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDownload}
                    sx={{ mt: 2 }}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{documentData.title}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentDetail;