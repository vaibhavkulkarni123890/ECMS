import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../services/apiService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const validationSchema = Yup.object({
  name: Yup.string().required('Workflow name is required'),
  description: Yup.string(),
});

const WorkflowCreate = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepName, setStepName] = useState('');
  const [stepApprover, setStepApprover] = useState('');
  
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/users/');
      setUsers(response.data.results);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (steps.length === 0) {
        setError('Please add at least one step to the workflow');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Create workflow
        const workflowResponse = await api.post('/workflows/', {
          name: values.name,
          description: values.description,
        });
        
        const workflowId = workflowResponse.data.id;
        
        // Create steps
        for (let i = 0; i < steps.length; i++) {
          await api.post('/workflow-steps/', {
            workflow: workflowId,
            name: steps[i].name,
            order: i + 1,
            approver: steps[i].approver,
          });
        }
        
        navigate(`/workflows/${workflowId}`);
      } catch (error) {
        console.error('Error creating workflow:', error);
        setError('Failed to create workflow. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });
  
  const handleAddStep = () => {
    if (!stepName || !stepApprover) return;
    
    const approver = users.find(user => user.id === stepApprover);
    
    setSteps([
      ...steps,
      {
        id: Date.now().toString(),
        name: stepName,
        approver: stepApprover,
        approver_name: approver ? approver.username : '',
      },
    ]);
    
    setStepName('');
    setStepApprover('');
  };
  
  const handleRemoveStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSteps(items);
  };
  
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
        <Typography variant="h4" component="h1">
          Create New Workflow
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Workflow Information" />
              <Divider />
              <CardContent>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Workflow Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  margin="normal"
                  multiline
                  rows={4}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Add Workflow Step" />
              <Divider />
              <CardContent>
                <TextField
                  fullWidth
                  id="stepName"
                  label="Step Name"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  margin="normal"
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="approver-label">Approver</InputLabel>
                  <Select
                    labelId="approver-label"
                    id="approver"
                    value={stepApprover}
                    onChange={(e) => setStepApprover(e.target.value)}
                    label="Approver"
                  >
                    {usersLoading ? (
                      <MenuItem disabled>Loading users...</MenuItem>
                    ) : (
                      users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.username}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddStep}
                  disabled={!stepName || !stepApprover}
                  sx={{ mt: 2 }}
                >
                  Add Step
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Workflow Steps" 
                subheader="Drag to reorder steps"
              />
              <Divider />
              <CardContent>
                {steps.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No steps added yet. Add at least one step to create a workflow.
                  </Typography>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="steps">
                      {(provided) => (
                        <List {...provided.droppableProps} ref={provided.innerRef}>
                          {steps.map((step, index) => (
                            <Draggable key={step.id} draggableId={step.id} index={index}>
                              {(provided) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}
                                >
                                  <DragIndicatorIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                  <ListItemText
                                    primary={`Step ${index + 1}: ${step.name}`}
                                    secondary={`Approver: ${step.approver_name}`}
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      aria-label="delete"
                                      onClick={() => handleRemoveStep(index)}
                                      color="error"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </List>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            component={RouterLink}
            to="/workflows"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || steps.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Workflow'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default WorkflowCreate;