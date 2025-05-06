import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CloudDownload as CloudDownloadIcon,
  Visibility as VisibilityIcon,
  RestoreFromTrash as RestoreIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import api from '../../services/apiService';
import moment from 'moment';

const DocumentVersions = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  
  const fetchDocumentAndVersions = async () => {
    try {
      setLoading(true);
      
      // Fetch document details
      const documentResponse = await api.get(`/documents/${id}/`);
      setDocument(documentResponse.data);
      
      // Fetch document versions
      const versionsResponse = await api.get(`/documents/${id}/versions/`);
      setVersions(versionsResponse.data);
      
      setError(null);
    } catch (error) {
      console.error('Error fetching document versions:', error);
      setError('Failed to load document versions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocumentAndVersions();
  }, [id]);
  
  const handleDownload = (versionId) => {
    window.open(`/documents/${id}/versions/${versionId}/download/`, '_blank');
  };
  
  const handleRestore = async (versionId) => {
    try {
      await api.post(`/documents/${id}/versions/${versionId}/restore/`);
      fetchDocumentAndVersions(); // Refresh data
    } catch (error) {
      console.error('Error restoring version:', error);
      alert('Failed to restore version. Please try again.');
    }
  };
  
  const handleCompareSelect = (versionId) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      }
      return prev;
    });
  };
  
  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setCompareDialogOpen(true);
    }
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
  
  if (!document) {
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
          to={`/documents/${id}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Document
        </Button>
        <Typography variant="h4" component="h1">
          Version History: {document.title}
        </Typography>
      </Box>
      
      {selectedVersions.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {selectedVersions.length} version(s) selected
          </Typography>
          <Button
            variant="contained"
            startIcon={<CompareIcon />}
            onClick={handleCompare}
            disabled={selectedVersions.length !== 2}
          >
            Compare Versions
          </Button>
        </Box>
      )}
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {selectedVersions.length > 0 && <TableCell padding="checkbox"></TableCell>}
                <TableCell>Version</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {versions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedVersions.length > 0 ? 7 : 6} align="center">
                    No versions found
                  </TableCell>
                </TableRow>
              ) : (
                versions.map((version) => (
                  <TableRow key={version.id}>
                    {selectedVersions.length > 0 && (
                      <TableCell padding="checkbox">
                        <Chip
                          label={selectedVersions.indexOf(version.id) + 1}
                          color="primary"
                          onClick={() => handleCompareSelect(version.id)}
                          sx={{ display: selectedVersions.includes(version.id) ? 'inline-flex' : 'none' }}
                        />
                      </TableCell>
                    )}
                    <TableCell>v{version.version_number}</TableCell>
                    <TableCell>{version.created_by_username}</TableCell>
                    <TableCell>{moment(version.created_at).format('MMM D, YYYY [at] h:mm A')}</TableCell>
                    <TableCell>{version.comment || 'No comment'}</TableCell>
                    <TableCell>
                      {version.is_current ? (
                        <Chip label="Current" color="primary" size="small" />
                      ) : (
                        <Chip label="Historical" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex' }}>
                        <Tooltip title="View">
                          <IconButton
                            component={RouterLink}
                            to={`/documents/${id}/versions/${version.id}`}
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(version.id)}
                          >
                            <CloudDownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!version.is_current && (
                          <Tooltip title="Restore this version">
                            <IconButton
                              size="small"
                              onClick={() => handleRestore(version.id)}
                              color="secondary"
                            >
                              <RestoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {selectedVersions.length > 0 && (
                          <Tooltip title="Select for comparison">
                            <IconButton
                              size="small"
                              onClick={() => handleCompareSelect(version.id)}
                              color={selectedVersions.includes(version.id) ? 'primary' : 'default'}
                            >
                              <CompareIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Version Comparison Dialog */}
      <Dialog 
        open={compareDialogOpen} 
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Compare Versions</DialogTitle>
        <DialogContent>
          {selectedVersions.length === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparing Version {versions.find(v => v.id === selectedVersions[0])?.version_number} with Version {versions.find(v => v.id === selectedVersions[1])?.version_number}
              </Typography>
              
              <Alert severity="info">
                For detailed comparison, please download both versions and use a comparison tool appropriate for the file type.
              </Alert>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                {selectedVersions.map((versionId, index) => {
                  const version = versions.find(v => v.id === versionId);
                  return (
                    <Box key={versionId} sx={{ textAlign: 'center', width: '45%' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Version {version?.version_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created by {version?.created_by_username} on {moment(version?.created_at).format('MMM D, YYYY')}
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownloadIcon />}
                        onClick={() => handleDownload(versionId)}
                        sx={{ mt: 1 }}
                      >
                        Download
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentVersions;