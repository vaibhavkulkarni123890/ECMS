import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  History as HistoryIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import api from '../../services/apiService';
import moment from 'moment';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    created_by: '',
    date_from: '',
    date_to: '',
    file_type: '',
    workflow_status: '',
  });
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1, // API uses 1-based pagination
        page_size: rowsPerPage,
        search: searchQuery,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };
      
      const response = await api.get('/documents/', { params });
      setDocuments(response.data.results);
      setTotalCount(response.data.count);
      setError(null);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [page, rowsPerPage]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
    fetchDocuments();
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      created_by: '',
      date_from: '',
      date_to: '',
      file_type: '',
      workflow_status: '',
    });
    setSearchQuery('');
  };
  
  const handleDownload = (documentId, fileName) => {
    window.open(`/documents/${documentId}/download/`, '_blank');
  };
  
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${documentId}/`);
        fetchDocuments(); // Refresh the list
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Documents
        </Typography>
        <Button
          component={RouterLink}
          to="/documents/upload"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Upload Document
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search documents by title, content, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" sx={{ ml: 1 }}>
              Search
            </Button>
            <Button 
              type="button" 
              variant="outlined" 
              sx={{ ml: 1 }}
              onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
              startIcon={advancedFiltersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              Filters
            </Button>
          </Box>
          
          <Collapse in={advancedFiltersOpen}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="created-by-label">Created By</InputLabel>
                  <Select
                    labelId="created-by-label"
                    id="created-by"
                    name="created_by"
                    value={filters.created_by}
                    onChange={handleFilterChange}
                    label="Created By"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="current">Me</MenuItem>
                    {/* This would typically be populated from an API call */}
                    <MenuItem value="user1">User 1</MenuItem>
                    <MenuItem value="user2">User 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="file-type-label">File Type</InputLabel>
                  <Select
                    labelId="file-type-label"
                    id="file-type"
                    name="file_type"
                    value={filters.file_type}
                    onChange={handleFilterChange}
                    label="File Type"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="docx">Word (DOCX)</MenuItem>
                    <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                    <MenuItem value="pptx">PowerPoint (PPTX)</MenuItem>
                    <MenuItem value="image">Images</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="date-from"
                  name="date_from"
                  label="Date From"
                  type="date"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  id="date-to"
                  name="date_to"
                  label="Date To"
                  type="date"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="workflow-status-label">Workflow Status</InputLabel>
                  <Select
                    labelId="workflow-status-label"
                    id="workflow-status"
                    name="workflow_status"
                    value={filters.workflow_status}
                    onChange={handleFilterChange}
                    label="Workflow Status"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="not_started">Not Started</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleResetFilters} sx={{ mr: 1 }}>
                  Reset Filters
                </Button>
                <Button variant="contained" onClick={fetchDocuments}>
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      </Paper>
      
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <RouterLink to={`/documents/${document.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {document.title}
                          </RouterLink>
                        </TableCell>
                        <TableCell>{document.created_by_username}</TableCell>
                        <TableCell>{moment(document.created_at).format('MMM D, YYYY')}</TableCell>
                        <TableCell>{moment(document.updated_at).format('MMM D, YYYY')}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title="View">
                              <IconButton
                                component={RouterLink}
                                to={`/documents/${document.id}`}
                                size="small"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(document.id, document.title)}
                              >
                                <CloudDownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Version History">
                              <IconButton
                                component={RouterLink}
                                to={`/documents/${document.id}/versions`}
                                size="small"
                              >
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default DocumentList;