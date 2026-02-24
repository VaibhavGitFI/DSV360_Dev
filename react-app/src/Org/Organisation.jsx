import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Add,
  Refresh,
  CheckCircle,
  Cancel,
  Payment,
  Receipt,
  People,
  Business,
  Settings,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DateRange
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { faker } from '@faker-js/faker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts';
import AddOrganizationDrawer from './AddOrganizationDrawer';
// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  backgroundColor: status === 'active' 
    ? theme.palette.success.light 
    : status === 'pending' 
      ? theme.palette.warning.light 
      : theme.palette.error.light,
  color: status === 'active' 
    ? theme.palette.success.dark 
    : status === 'pending' 
      ? theme.palette.warning.dark 
      : theme.palette.error.dark,
}));

// Mock data generation
const generateMockOrganizations = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    members: faker.number.int({ min: 1, max: 50 }),
    plan: ['Free', 'Basic', 'Pro', 'Enterprise'][faker.number.int({ min: 0, max: 3 })],
    status: ['active', 'pending', 'suspended'][faker.number.int({ min: 0, max: 2 })],
    created: faker.date.past({ years: 1 }).toISOString().split('T')[0],
    logo: faker.image.urlLoremFlickr({ category: 'business' }),
    billing: faker.finance.amount(0, 1000, 2),
    lastActive: faker.date.recent().toISOString().split('T')[0]
  }));
};

const growthData = Array.from({ length: 12 }, (_, i) => ({
  name: new Date(2023, i, 1).toLocaleString('default', { month: 'short' }),
  organizations: faker.number.int({ min: 10, max: 100 }),
  users: faker.number.int({ min: 50, max: 500 })
}));

const planDistributionData = [
  { name: 'Free', value: 45 },
  { name: 'Basic', value: 30 },
  { name: 'Pro', value: 20 },
  { name: 'Enterprise', value: 5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Organizations = () => {
  const theme = useTheme();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [drawerOpen,setDrawerOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setOrganizations(generateMockOrganizations(50));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setPage(0);
    handleFilterClose();
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || org.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setOrganizations(generateMockOrganizations(50));
      setLoading(false);
    }, 800);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDrawer  = () =>{
    setDrawerOpen(true);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Organization Management
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            sx={{ mr: 2 }}
            onClick={handleDrawer}
          >
            New Organization
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Dashboard" icon={<BarChart />} iconPosition="start" />
        <Tab label="Organizations" icon={<Business />} iconPosition="start" />
        <Tab label="Billing" icon={<Payment />} iconPosition="start" />
        <Tab label="Settings" icon={<Settings />} iconPosition="start" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Business color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Organizations Overview</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" color="text.secondary">Total Organizations</Typography>
                      <Typography variant="h4" fontWeight="bold">1,248</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp color="success" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="success.main">12% from last month</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" color="text.secondary">Active Organizations</Typography>
                      <Typography variant="h4" fontWeight="bold">1,024</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingUp color="success" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="success.main">8% from last month</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                   <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" color="text.secondary">In Active Organisation</Typography>
                      <Typography variant="h4" fontWeight="bold">122</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <TrendingDown color="error" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="error.main">5% from last month</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">User Growth</Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="organizations" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PieChart color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Plan Distribution</Typography>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DateRange color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Recent Activity</Typography>
                </Box>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Box key={i} sx={{ mb: 2, p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                      <Box display="flex" alignItems="center">
                        <Avatar src={faker.image.avatar()} sx={{ width: 32, height: 32, mr: 1.5 }} />
                        <Box flexGrow={1}>
                          <Typography variant="body2">
                            <strong>{faker.person.fullName()}</strong> from <strong>{faker.company.name()}</strong> {['created', 'updated', 'deleted'][i % 3]} {['organization', 'user', 'settings'][i % 3]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {faker.date.recent().toLocaleString()}
                          </Typography>
                        </Box>
                        <StatusChip size="small" label={['completed', 'pending', 'failed'][i % 3]} status={['active', 'pending', 'suspended'][i % 3]} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
              sx={{ width: 350 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Box>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={handleFilterClick}
                sx={{ mr: 2 }}
              >
                Filter
              </Button>
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={handleFilterClose}
              >
                <MenuItem onClick={() => handleFilterSelect('all')}>All Organizations</MenuItem>
                <MenuItem onClick={() => handleFilterSelect('active')}>Active</MenuItem>
                <MenuItem onClick={() => handleFilterSelect('pending')}>Pending</MenuItem>
                <MenuItem onClick={() => handleFilterSelect('suspended')}>Suspended</MenuItem>
              </Menu>
            </Box>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                      <TableRow sx={{
                    backgroundColor: theme.palette.primary.main,
                  }} >
                        <TableCell 
                         sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                        >Organization
                        </TableCell>
                        <TableCell
                          sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                    >
                          Plan
                        </TableCell>
                        <TableCell
                          sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                      >
                        Members
                      </TableCell>
                        <TableCell
                          sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                      >
                        Created
                       </TableCell>
                        <TableCell
                          sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                      >Status
                      </TableCell>
                      <TableCell
                          sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                        >Billing
                        </TableCell>
                        <TableCell   sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                          Actions
                          </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredOrganizations
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((org) => (
                          <TableRow hover key={org.id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar src={org.logo} sx={{ width: 32, height: 32, mr: 2 }} />
                                <Typography fontWeight="medium">{org.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={org.plan} 
                                size="small" 
                                color={
                                  org.plan === 'Enterprise' ? 'primary' : 
                                  org.plan === 'Pro' ? 'secondary' : 
                                  org.plan === 'Basic' ? 'default' : 'info'
                                }
                              />
                            </TableCell>
                            <TableCell>{org.members}</TableCell>
                            <TableCell>{org.created}</TableCell>
                            <TableCell>
                              <StatusChip label={org.status} status={org.status} />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="medium">${org.billing}</Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={(e) => {
                                  setSelectedOrg(org);
                                  setFilterMenuAnchor(e.currentTarget);
                                }}
                              >
                                <MoreVert />
                              </IconButton>
                            </TableCell>
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
        </>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Receipt color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Billing History</Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Organization</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow hover key={i}>
                          <TableCell>INV-{faker.string.numeric(6)}</TableCell>
                          <TableCell>{faker.date.recent().toISOString().split('T')[0]}</TableCell>
                          <TableCell>{faker.company.name()}</TableCell>
                          <TableCell>${faker.finance.amount(50, 500, 2)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={['Paid', 'Pending', 'Failed'][i % 3]} 
                              color={['success', 'warning', 'error'][i % 3]} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">Download</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Payment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Revenue Overview</Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary">This Month</Typography>
                  <Typography variant="h4" fontWeight="bold">$24,560</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <TrendingUp color="success" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">18% from last month</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>Plan Distribution</Typography>
                  {['Enterprise', 'Pro', 'Basic', 'Free'].map((plan, i) => (
                    <Box key={plan} display="flex" alignItems="center" mb={1.5}>
                      <Box width="100%" mr={1}>
                        <LinearProgress 
                          variant="determinate" 
                          value={[15, 30, 40, 15][i]} 
                          color={['primary', 'secondary', 'info', 'inherit'][i]}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" width={80}>{plan}</Typography>
                      <Typography variant="body2" color="text.secondary" width={60}>
                        {[15, 30, 40, 15][i]}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" mb={3}>General Settings</Typography>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Allow Organization Registration"
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Require Email Verification"
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable Analytics Tracking"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Default Plan</InputLabel>
                  <Select
                    label="Default Plan"
                    defaultValue="basic"
                  >
                    <MenuItem value="free">Free</MenuItem>
                    <MenuItem value="basic">Basic</MenuItem>
                    <MenuItem value="pro">Pro</MenuItem>
                    <MenuItem value="enterprise">Enterprise</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained">Save Settings</Button>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" mb={3}>Role Permissions</Typography>
                <Box mb={3}>
                  <Typography variant="subtitle2" mb={1}>Admin Permissions</Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Manage Organizations"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Manage Users"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Access Billing"
                    sx={{ mb: 1, display: 'block' }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" mb={1}>Organization Admin Permissions</Typography>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Manage Members"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Change Plan"
                    sx={{ mb: 1, display: 'block' }}
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="View Analytics"
                    sx={{ mb: 1, display: 'block' }}
                  />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor && selectedOrg)}
        onClose={() => {
          setFilterMenuAnchor(null);
          setSelectedOrg(null);
        }}
      >
        <MenuItem onClick={() => setFilterMenuAnchor(null)}>
          <CheckCircle color="success" sx={{ mr: 1 }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => setFilterMenuAnchor(null)}>
          <People sx={{ mr: 1 }} /> Manage Members
        </MenuItem>
        <MenuItem onClick={() => setFilterMenuAnchor(null)}>
          <Payment sx={{ mr: 1 }} /> Billing Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setFilterMenuAnchor(null)}>
          <Cancel color="error" sx={{ mr: 1 }} /> Suspend Organization
        </MenuItem>
      </Menu>

       <AddOrganizationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />


    </Box>
  );
};

export default Organizations;