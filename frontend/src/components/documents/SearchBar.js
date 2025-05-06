import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Popover,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const SearchBar = ({ onSearch, initialFilters = {} }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    fileType: initialFilters.fileType || '',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
    createdBy: initialFilters.createdBy || '',
    includeContent: initialFilters.includeContent || true,
    includeTitle: initialFilters.includeTitle || true,
    includeDescription: initialFilters.includeDescription || true,
  });
  
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setAnchorEl(null);
  };
  
  const handleFilterChange = (event) => {
    const { name, value, checked } = event.target;
    setFilters({
      ...filters,
      [name]: event.target.type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      query: searchQuery,
      ...filters,
    });
    handleFilterClose();
  };
  
  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      fileType: '',
      dateFrom: '',
      dateTo: '',
      createdBy: '',
      includeContent: true,
      includeTitle: true,
      includeDescription: true,
    });
    onSearch({ query: '' });
  };
  
  const open = Boolean(anchorEl);
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box component="form" onSubmit={handleSearch}>
        <TextField
          fullWidth
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="filter"
                  onClick={handleFilterClick}
                  edge="end"
                  color={Object.values(filters).some(v => v !== '' && v !== false) ? 'primary' : 'default'}
                >
                  <FilterListIcon />
                </IconButton>
                {searchQuery && (
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClear}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="h6" gutterBottom>
            Search Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>File Type</InputLabel>
            <Select
              name="fileType"
              value={filters.fileType}
              onChange={handleFilterChange}
              label="File Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="image">Images</MenuItem>
              <MenuItem value="document">Documents</MenuItem>
              <MenuItem value="spreadsheet">Spreadsheets</MenuItem>
              <MenuItem value="presentation">Presentations</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="From Date"
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            margin="normal"
            size="small"
          />
          
          <TextField
            fullWidth
            label="To Date"
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            margin="normal"
            size="small"
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Search In:
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.includeTitle}
                onChange={handleFilterChange}
                name="includeTitle"
                size="small"
              />
            }
            label="Title"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.includeDescription}
                onChange={handleFilterChange}
                name="includeDescription"
                size="small"
              />
            }
            label="Description"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.includeContent}
                onChange={handleFilterChange}
                name="includeContent"
                size="small"
              />
            }
            label="Document Content"
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClear} sx={{ mr: 1 }}>
              Clear
            </Button>
            <Button variant="contained" onClick={handleSearch}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Popover>
    </Paper>
  );
};

export default SearchBar;