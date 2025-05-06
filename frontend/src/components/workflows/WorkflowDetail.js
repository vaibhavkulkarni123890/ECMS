import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from '../../services/apiService';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';

const WorkflowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [comments, setComments] = useState('');
  
  const fetchWorkflowDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch workflow details
      const workflowResponse = await api.get(`/workflows/${id}/`);
      setWorkflow(workflowResponse.data);
      
      // Fetch workflow steps
      const stepsResponse = await api.get(`/workflows/${id}/steps/`);
      setSteps(stepsResponse.data);
      
      // Fetch documents using this workflow
      const documentsResponse = await api.get(`/documents/`, {
        params: { workflow: id }
      });
      setDocuments(documentsResponse.data.results);
      
    } catch (error) {
      console.error('Error fetching workflow details:', error);
      setError('Failed to load workflow details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkflowDetails();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/workflows/${id}/`);
        navigate('/workflows');
      } catch (error) {
        console.error('Error deleting workflow:', error);
        alert('Failed to delete workflow. Please try again.');
      }
    }
  };
  
  const handleApprovalDialogOpen = (document) => {
    setSelectedDocument(document);
    setApprovalDialogOpen(true);
  };
  
  const handleRejectionDialogOpen = (document) => {
    setSelectedDocument(document);
    setRejectionDialogOpen(true);
  };
  
  const handleApprovalDialogClose = () => {
    setApprovalDialogOpen(false);
    setSelectedDocument(null);
    setComments('');
  };
  
  const handleRejectionDialogClose = () => {
    setRejectionDialogOpen(false);
    setSelectedDocument(null);
    setComments('');
  };
  
  const handleApprove = async () => {
    try {
      await api.post(`/documents/${selectedDocument.id}/approve/`, {
        comments: comments,
      });
      fetchWorkflowDetails();
      handleApprovalDialogClose();
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document. Please try again.');
    }
  };
  
  const handleReject = async () => {
    try {
      await api.post(`/documents/${selectedDocument.id}/reject/`, {
        comments: comments,
      });
      fetchWorkflowDetails();
      handleRejectionDialogClose();
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document. Please try again.');
    }
  };
  
  const getStepStatus = (document, stepIndex) => {
    if (!document.workflow_status) return 'pending';
    
    const currentStepIndex = document.workflow_status.current_step_index || 0;
    const isCompleted = document.workflow_status.status === 'approved';
    const isRejected = document.workflow_status.status === 'rejected';
    
    if (isRejected) return 'rejected';
    if (isCompleted) return 'completed';
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'pending';
  };
  
  const canApproveOrReject = (document) => {
    if (!document.workflow_status || !currentUser) return false;
    
    const currentStepIndex = document.workflow_status.current_step_index || 0;
    if (currentStepIndex >= steps.length) return false;
    
    const currentStep = steps[currentStepIndex];
    return currentStep && currentStep.approver_id === currentUser.user_id;
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
  
  if (!workflow) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Workflow not found.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to="/workflows"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Workflows
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {workflow.name}
        </Typography>
        <Button
          component={RouterLink}
          to={`/workflows/${id}/edit`}
          startIcon={<EditIcon />}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          onClick={handleDelete}
          startIcon={<DeleteIcon />}
          variant="outlined"
          color="error"
        >
          Delete
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Workflow Details" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={workflow.description || 'No description provided'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created By"
                    secondary={workflow.created_by_name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Created At"
                    secondary={moment(workflow.created_at).format('MMMM D, YYYY [at] h:mm A')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Workflow Steps" 
              subheader={`${steps.length} steps in this workflow`} 
            />
            <Divider />
            <CardContent>
              {steps.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No steps defined for this workflow.
                </Typography>
              ) : (
                <Stepper orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.id}>
                      <StepLabel>
                        <Typography variant="subtitle1">
                          {step.name}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Approver: {step.approver_name}
                          </Typography>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Documents Using This Workflow" 
              subheader={`${documents.length} documents`} 
            />
            <Divider />
            <CardContent>
              {documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No documents are currently using this workflow.
                </Typography>
              ) : (
                <List>
                  {documents.map((document) => (
                    <Paper key={document.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h3">
                          {document.title}
                        </Typography>
                        <Box>
                          <Chip 
                            label={document.workflow_status?.status || 'Not Started'} 
                            color={
                              document.workflow_status?.status === 'approved' ? 'success' :
                              document.workflow_status?.status === 'rejected' ? 'error' :
                              document.workflow_status?.status === 'in_progress' ? 'primary' :
                              'default'
                            }
                            sx={{ mr: 1 }}
                          />
                          <Button
                            component={RouterLink}
                            to={`/documents/${document.id}`}
                            size="small"
                            variant="outlined"
                          >
                            View Document
                          </Button>
                        </Box>
                      </Box>
                      
                      <Stepper alternativeLabel>
                        {steps.map((step, index) => {
                          const status = getStepStatus(document, index);
                          return (
                            <Step key={step.id} completed={status === 'completed'}>
                              <StepLabel 
                                error={status === 'rejected'}
                                icon={
                                  status === 'completed' ? <CheckIcon /> :
                                  status === 'rejected' ? <CloseIcon /> :
                                  null
                                }
                              >
                                {step.name}
                              </StepLabel>
                            </Step>
                          );
                        })}
                      </Stepper>
                      
                      {canApproveOrReject(document) && (
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            onClick={() => handleRejectionDialogOpen(document)}
                            variant="outlined"
                            color="error"
                            sx={{ mr: 1 }}
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApprovalDialogOpen(document)}
                            variant="contained"
                            color="success"
                          >
                            Approve
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={handleApprovalDialogClose}>
        <DialogTitle>Approve Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve "{selectedDocument?.title}"?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comments"
            label="Comments (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApprovalDialogClose}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={handleRejectionDialogClose}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject "{selectedDocument?.title}"?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comments"
            label="Reason for Rejection (Required)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectionDialogClose}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowDetail;