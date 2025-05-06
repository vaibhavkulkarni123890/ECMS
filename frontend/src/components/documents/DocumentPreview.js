import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentPreview = ({ documentUrl, documentType, documentName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isImage = /\.(jpe?g|png|gif|bmp|webp)$/i.test(documentName);
  const isPdf = /\.pdf$/i.test(documentName);
  const isText = /\.(txt|md|json|csv|html|xml|css|js)$/i.test(documentName);
  
  const [textContent, setTextContent] = useState('');
  
  useEffect(() => {
    if (isText) {
      fetchTextContent();
    }
  }, [documentUrl, isText]);
  
  const fetchTextContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(documentUrl);
      const text = await response.text();
      setTextContent(text);
      setError(null);
    } catch (err) {
      console.error('Error fetching text content:', err);
      setError('Failed to load text content');
    } finally {
      setLoading(false);
    }
  };
  
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };
  
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };
  
  const handleZoomIn = () => {
    setScale(scale + 0.2);
  };
  
  const handleZoomOut = () => {
    if (scale > 0.4) {
      setScale(scale - 0.2);
    }
  };
  
  const handleRotateLeft = () => {
    setRotation((rotation - 90) % 360);
  };
  
  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };
  
  const handlePageChange = (event, newPage) => {
    setPageNumber(newPage + 1);
  };
  
  const renderPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (isPdf) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Page {pageNumber} of {numPages}
            </Typography>
            <Tabs
              value={pageNumber - 1}
              onChange={handlePageChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ maxWidth: '100%', flexGrow: 1 }}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Tab key={index} label={index + 1} />
              ))}
            </Tabs>
          </Box>
          
          <Document
            file={documentUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<CircularProgress />}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </Box>
      );
    }
    
    if (isImage) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
          <img
            src={documentUrl}
            alt={documentName}
            style={{
              maxWidth: '100%',
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>
      );
    }
    
    if (isText) {
      return (
        <Box
          component="pre"
          sx={{
            p: 2,
            overflow: 'auto',
            fontSize: `${14 * scale}px`,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            maxHeight: '70vh',
            width: '100%',
          }}
        >
          {textContent}
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">
          Preview not available for this file type. Please download the file to view it.
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          href={documentUrl}
          target="_blank"
          sx={{ mt: 2 }}
        >
          Download
        </Button>
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Document Preview</Typography>
        <Box>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Left">
            <IconButton onClick={handleRotateLeft} size="small">
              <RotateLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Right">
            <IconButton onClick={handleRotateRight} size="small">
              <RotateRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton href={documentUrl} download={documentName} size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {renderPreview()}
    </Paper>
  );
};

export default DocumentPreview;