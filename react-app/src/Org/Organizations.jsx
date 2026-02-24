import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Dialog, 
  DialogTitle,
  DialogContent,
  DialogContentText, 
  DialogActions,
  ListItem, 
  ListItemAvatar,
  ListItemText,
  List,
  Tooltip,
  Snackbar, 
  Alert, 
  Input, 
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  SupervisorAccount, // Used for the Admin Icon
  ToggleOn, 
  ToggleOff, 
  Delete,
  VerifiedUser, 
  Edit, 
  Close, 
  CloudUpload, 
} from '@mui/icons-material';
import axios from 'axios';
import AddAdminDrawer from './AddOrganizationDrawer'; 

const StatusChip = ({ label, status }) => {
  const color = status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'error';
  return <Chip label={label} color={color} size="small" variant="outlined" />;
};

const EditOrganizationModal = ({ open, onClose, organization, onUpdate, loading, showSnackbar }) => {
    const [orgName, setOrgName] = useState(organization?.Org_Name || '');
    const [orgTheme, setOrgTheme] = useState(organization?.Org_Theme || '#000000');
    const [orgLogoFile, setOrgLogoFile] = useState(null);

    useEffect(() => {
        if (organization) {
            setOrgName(organization.Org_Name || '');
            setOrgTheme(organization.Org_Theme || '#000000');
            setOrgLogoFile(null);
        }
    }, [organization]);

    const handleFileChange = (event) => {
        setOrgLogoFile(event.target.files[0]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        if (!orgName.trim()) {
            showSnackbar('Organization name cannot be empty.', 'warning');
            return;
        }

        const formData = new FormData();
        
        formData.append("Org_Name", orgName);
        formData.append("Org_Theme", orgTheme);

        if (orgLogoFile) {
            formData.append("orgImg", orgLogoFile); 
        }

        onUpdate(organization.OrgID, formData, orgLogoFile);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ component: 'form', onSubmit: handleSubmit, sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Edit Organization: {organization?.Org_Name || '...'}
                <IconButton onClick={onClose}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ pt: 2, pb: 2 }}>
                <TextField
                    label="Organization Name"
                    variant="outlined"
                    fullWidth
                    required
                    margin="normal"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>Theme Color:</Typography>
                    <Input 
                        type="color"
                        value={orgTheme}
                        onChange={(e) => setOrgTheme(e.target.value)}
                        sx={{ p: 0, '& input': { height: 36, width: 60, border: 'none', padding: 0 } }}
                    />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>{orgTheme}</Typography>
                </Box>
                
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>Organization Logo (Optional)</Typography>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    fullWidth
                >
                    {orgLogoFile ? orgLogoFile.name : 'Choose New Logo Image'}
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </Button>
                {organization?.Org_Logo && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">Current Logo Preview:</Typography>
                         <Box 
                                    sx={{ 
                                        maxHeight: 100, 
                                        maxWidth: 100,  
                                        mr: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'transparent', 
                                    }}
                                >
                                    <img 
                                        src={organization.Org_Logo} 
                                        alt={`${organization.Org_Name} Logo`} 
                                        style={{ 
                                            maxHeight: '100%', 
                                            maxWidth: '100%', 
                                            objectFit: 'contain', 
                                            display: 'block' 
                                        }} 
                                    />
                                </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined">Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const Organizations = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orgToEdit, setOrgToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false); 

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };


  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/server/time_entry_management_application_function/allOrg");
      
      if (response.status === 200 && response.data.success) {
        const organizationsWithStatus = response.data.data.map(org => ({
          ...org,
          status: org.status || 'Active', 
        }));
        setOrganizations(organizationsWithStatus);
      } else {
        console.error("API responded with success: false or non-200 status");
        showSnackbar('Failed to fetch organizations.', 'error');
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error connecting to server.', 'error');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAdminSuccess = (newAdminResponseData) => {
    if (newAdminResponseData && newAdminResponseData.OrgID) { 
      const newOrgWithStatus = { ...newAdminResponseData, status: newAdminResponseData.status || 'Active' };
      const isAlreadyPresent = organizations.some(org => org.OrgID === newOrgWithStatus.OrgID);
      
      if (!isAlreadyPresent) {
        setOrganizations(prevOrgs => [newOrgWithStatus, ...prevOrgs]);
      }
      showSnackbar('New organization admin added successfully!', 'success');
    }
  };

  const handleDrawer = () => {
    setDrawerOpen(true);
  };

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    handleFilterClose();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      (filter === 'all' || org.status === filter) &&
      (org.Org_Name && org.Org_Name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchAdmins = async (orgId) => {
    setAdminLoading(true);
    setAdminModalOpen(true);
    setOrgAdmins([]); 
    
    try {
      const response = await axios.get(`/server/time_entry_management_application_function/orgAdmin/${orgId}`);
      
      if (response.status === 200 && response.data.success) {
        setOrgAdmins(response.data.users || []);
      } else {
        showSnackbar('Failed to fetch admin list.', 'error');
      }
    } catch (error) {
      showSnackbar('Error fetching admin list.', 'error');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleShowAdmins = (org) => {
    setSelectedOrg(org);
    fetchAdmins(org.OrgID);
  };

  const handleToggleAdminStatus = async (admin) => {
    const oldStatus= admin.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
        const response = await axios.put('/server/time_entry_management_application_function/adminStatus', {
            userID: admin.user_id,
            status: oldStatus,
        });

        if (response.status === 200 && response.data.success) {
            setOrgAdmins(prevAdmins => 
                prevAdmins.map(a => 
                    a.user_id === admin.user_id ? { ...a, status: newStatus } : a
                )
            );
            showSnackbar(`Admin status toggled to ${newStatus}.`, 'success');
        } else {
            showSnackbar('Failed to toggle admin status.', 'error');
        }
    } catch (error) {
        showSnackbar('Error updating admin status.', 'error');
    }
  };

  const handleDeleteAdminClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    
    setDeleteConfirmOpen(false);
    const admin = adminToDelete;
    const isLastAdmin = orgAdmins.length === 1;
    const isDeleteOrg = isLastAdmin ? "true" : "false";
    
    try {
        const response = await axios.delete('/server/time_entry_management_application_function/admin', {
            data: {
                userID: admin.user_id,
                isDeleteOrg: isDeleteOrg,
                orgID: selectedOrg.OrgID, 
            }
        });

        if (response.status === 200 && response.data.success) {
            if (isLastAdmin) {
                setOrganizations(prevOrgs => prevOrgs.filter(org => org.OrgID !== selectedOrg.OrgID));
                setAdminModalOpen(false);
                setSelectedOrg(null);
                showSnackbar(`Admin and organization '${selectedOrg.Org_Name}' deleted successfully.`, 'success');
            } else {
                setOrgAdmins(prevAdmins => prevAdmins.filter(a => a.user_id !== admin.user_id));
                showSnackbar('Admin deleted successfully.', 'success');
            }
        } else {
            showSnackbar('Failed to delete admin.', 'error');
        }
    } catch (error) {
        showSnackbar('Error deleting admin.', 'error');
    } finally {
        setAdminToDelete(null);
    }
  };
  
  const handleEditOrgClick = (org) => {
      setOrgToEdit(org);
      setEditModalOpen(true);
  };

  const handleUpdateOrganization = async (orgId, formData, hasNewLogo) => {
      setEditLoading(true);
      try {
          const response = await axios.put(
              `/server/time_entry_management_application_function/org/${orgId}`, 
              formData,
              {
                  headers: {
                      'Content-Type': 'multipart/form-data',
                  }
              }
          );
          
          if (response.status === 200 && response.data.success) {
              const updatedOrgData = response.data.data;

              setOrganizations(prevOrgs => prevOrgs.map(org => 
                  org.OrgID === orgId 
                      ? { 
                          ...org, 
                          Org_Name: updatedOrgData.Org_Name || org.Org_Name,
                          Org_Theme: updatedOrgData.Org_Theme || org.Org_Theme,
                          Org_Logo: updatedOrgData.Org_Logo || org.Org_Logo, 
                        } 
                      : org
              ));
              
              setEditModalOpen(false);
              showSnackbar('Organization updated successfully!', 'success');
          } else {
              showSnackbar(response.data.message || 'Failed to update organization.', 'error');
          }
      } catch (error) {
          console.error('Error updating organization:', error);
          showSnackbar('Error connecting to server or updating data.', 'error');
      } finally {
          setEditLoading(false);
      }
  };


  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Controls (UNCHANGED) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search organizations..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 350 } }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={handleDrawer}
            >
              New Admin
            </Button>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
          >
            Filter
          </Button>
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterSelect('all')}>All Organizations</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('Active')}>Active</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('Suspended')}>Suspended</MenuItem>
            <MenuItem onClick={() => handleFilterSelect('Pending')}>Pending</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    {/* REMOVED 'Members' from the header array */}
                    {['Organization', 'Plan', 'Created', 'Status', 'Billing', 'Edit','Admin'
                      
                    ].map((header, index) => (
                        <TableCell 
                            key={index} 
                            sx={{ color: 'primary.contrastText', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                            {/* Render the custom Box if it's the last element, otherwise render the string */}
                            {typeof header === 'string' ? header : header}
                        </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrganizations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((org) => (
                      <TableRow hover key={org.OrgID} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                             <Box 
                                    sx={{ 
                                        maxHeight: 50, 
                                        maxWidth: 50,  
                                        mr: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        bgcolor: 'transparent', 
                                    }}
                                >
                                    <img 
                                        src={org.Org_Logo} 
                                        alt={`${org.Org_Name} Logo`} 
                                        style={{ 
                                            maxHeight: '100%', 
                                            maxWidth: '100%', 
                                            objectFit: 'contain', 
                                            display: 'block' 
                                        }} 
                                    />
                                </Box>
                            <Typography fontWeight="medium" variant="body1">{org.Org_Name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={'Basic'} size="small" color={'primary'} variant="outlined" />
                        </TableCell>
                        {/* REMOVED TableCell for 'Members' */}
                        <TableCell>
                          {new Date(org.CREATEDTIME.split(' ')[0]).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <StatusChip label={org.status} status={org.status} />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium" color="text.secondary">$0.00</Typography>
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Edit Organization">
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditOrgClick(org)}
                                    color="info"
                                    sx={{ mr: 1 }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>

                  
                        </TableCell>

                        <TableCell>  
                            <Tooltip title="View Administrators">
                                <IconButton 
                                    size="small"
                                    color="primary"
                                    onClick={() => handleShowAdmins(org)}
                                >
                                    <SupervisorAccount />
                                </IconButton>
                            </Tooltip></TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOrganizations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Admin Modal (UNCHANGED) */}
      <Dialog 
        open={adminModalOpen} 
        onClose={() => setAdminModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
          Admins for {selectedOrg ? selectedOrg.Org_Name : 'Organization' }
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {adminLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : orgAdmins.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2, px: 3 }}>
              No administrators found for this organization.
            </Typography>
          ) : (
            <List sx={{ width: '100%' }}>
              {orgAdmins.map((admin) => {
                const isActive = admin.status === 'ACTIVE';
                const isLastAdmin = orgAdmins.length === 1;
                
                return (
                  <ListItem 
                    key={admin.zuid} 
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Chip 
                            label={admin.role_details?.role_name || 'Admin'}
                            icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                            color="primary" 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1, fontWeight: 'bold' }}
                         />
                        
                        <Tooltip title={isActive ? 'Disable Admin' : 'Enable Admin'}>
                            <IconButton 
                                color={isActive ? "success" : "error"}
                                size="large"
                                onClick={() => handleToggleAdminStatus(admin)}
                            >
                                {isActive ? <ToggleOn sx={{ fontSize: 32 }} /> : <ToggleOff sx={{ fontSize: 32 }} />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip 
                            title={isLastAdmin ? 'Delete Admin and Organization' : 'Delete Admin'}
                        >
                            <IconButton 
                                color="error"
                                size="large"
                                onClick={() => handleDeleteAdminClick(admin)}
                                
                            >
                                <Delete sx={{ fontSize: 24 }} />
                            </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    sx={{ 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      '&:hover': {
                         bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: isActive ? 'success.main' : 'error.main' }}>
                        {admin.first_name ? admin.first_name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${admin.first_name} ${admin.last_name || ''}`}
                      secondary={admin.email_id}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                      secondaryTypographyProps={{ 
                          color: isActive ? 'text.secondary' : 'error.main',
                          fontStyle: !isActive ? 'italic' : 'normal',
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminModalOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog (UNCHANGED) */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
      >
        <DialogTitle sx={{ color: 'error.main' }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {adminToDelete && orgAdmins.length === 1
              ? `This is the ONLY admin for the organization "${selectedOrg?.Org_Name}". Deleting this admin will also PERMANENTLY delete the entire organization.`
              : `Are you sure you want to delete the administrator: "${adminToDelete?.first_name} ${adminToDelete?.last_name || ''}"?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
            {adminToDelete && orgAdmins.length === 1 ? 'Delete Admin & Org' : 'Delete Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Organization Modal (UNCHANGED) */}
      {orgToEdit && (
          <EditOrganizationModal 
              open={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              organization={orgToEdit}
              onUpdate={handleUpdateOrganization}
              loading={editLoading}
              showSnackbar={showSnackbar}
          />
      )}
      
      {/* Snackbar Notification (UNCHANGED) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AddAdminDrawer 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
          onAdd={handleAddAdminSuccess} 
          organizations={organizations} 
      />
    </Box>
  );
};

export default Organizations;