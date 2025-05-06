import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  AccountTree as AccountTreeIcon,
  CloudUpload as CloudUploadIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <List component="nav">
      <ListItemButton component={RouterLink} to="/documents" selected={isActive('/documents')}>
        <ListItemIcon>
          <DescriptionIcon />
        </ListItemIcon>
        <ListItemText primary="Documents" />
      </ListItemButton>
      
      <ListItemButton component={RouterLink} to="/documents/upload" selected={location.pathname === '/documents/upload'}>
        <ListItemIcon>
          <CloudUploadIcon />
        </ListItemIcon>
        <ListItemText primary="Upload Document" />
      </ListItemButton>
      
      <ListItemButton component={RouterLink} to="/workflows" selected={isActive('/workflows')}>
        <ListItemIcon>
          <AccountTreeIcon />
        </ListItemIcon>
        <ListItemText primary="Workflows" />
      </ListItemButton>
      
      <Divider sx={{ my: 1 }} />
      
      <ListItemButton component={RouterLink} to="/profile" selected={location.pathname === '/profile'}>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="My Profile" />
      </ListItemButton>
    </List>
  );
};

export default Sidebar;