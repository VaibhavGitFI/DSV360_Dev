import React from 'react';
import { useState,useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CardContent,
  Chip,
  alpha,
  useTheme,
  Card
} from '@mui/material';
import {
  Business,
  People,
  CheckCircleOutline,
  HighlightOff,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { faker } from '@faker-js/faker';
import axios from 'axios';

// --- Dummy Data ---
const organizationsData = {
  total: 2150,
  active: 1820,
  inactive: 330,
};

const plansData = [
  { name: 'Enterprise', value: 400, color: '#1976d2' }, // MUI's primary
  { name: 'Pro', value: 750, color: '#f57c00' },      // MUI's warning
  { name: 'Basic', value: 1000, color: '#2e7d32' },     // MUI's success
  { name: 'Free', value: 300, color: '#d32f2f' },     // MUI's error
];

const monthlyUsersData = [
  { name: 'Jan', registrations: 120 },
  { name: 'Feb', registrations: 150 },
  { name: 'Mar', registrations: 180 },
  { name: 'Apr', registrations: 220 },
  { name: 'May', registrations: 200 },
  { name: 'Jun', registrations: 250 },
  { name: 'Jul', registrations: 280 },
  { name: 'Aug', registrations: 20 },
  { name: 'Sep', registrations: 200 },
  { name: 'Oct', registrations: 280 },
  { name: 'Nov', registrations: 220 },
  { name: 'Dec', registrations: 280 },

];

const Dashboard = () => {
  const theme = useTheme();

    const [Organizations,setOrganizations] = useState({});
    const [ActiveOrganization,SetactiveOrganization] = useState(0);
    const [InactiveOrganization,setInactiveOrganization] = useState(0);
    const [loading, setLoading] = useState(true);
     


 useEffect(() => {
      const fetchData = async () => {
    try {
     const response = await axios.get("/server/time_entry_management_application_function/getAllAdmin")
      // console.log("The response data from admins is :", response);

        setOrganizations(response.data.users);
       const active = response.data.users.filter(user => user.status === "ACTIVE");
       SetactiveOrganization(active.length);
       const inactive = response.data.users.length - active.length
      //  console.log("Inactive",inactive)
       setInactiveOrganization(inactive);

        

      if (response.status === 200 && response.data.success) {
        // console.log("The response data is given below", response.data);
        setOrganizations(response.data.users); // Set the fetched admin users
      } else {
        console.error("API responded with success: false or non-200 status");
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${theme.palette.background.default} 100%)`,
        fontFamily: theme.typography.fontFamily
      }}
    >
      <Box sx={{ mb: { xs: 4, sm: 6 } }}>
        <Typography
          variant="h3"
          component="h1"
          align="center"
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          DSV Dashboard
        </Typography>
      </Box>

      {/* Organization and User Stats Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">Total Organizations</Typography>
              <Business color="primary" />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>{Organizations.length}</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp color="success" sx={{ fontSize: 16 }} />
              <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>+20.1% from last month</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">Active Organizations</Typography>
              <CheckCircleOutline color="success" />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'success.main' }}>{ActiveOrganization}</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp color="success" sx={{ fontSize: 16 }} />
              <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>+18.5% from last month</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">Inactive Organizations</Typography>
              <HighlightOff color="error" />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1, color: 'error.main' }}>{InactiveOrganization}</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingDown color="error" sx={{ fontSize: 16 }} />
              <Typography variant="body2" color="error.main" sx={{ ml: 0.5 }}>+2.2% from last month</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">Total Users</Typography>
              <People color="primary" />
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>12,450</Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp color="success" sx={{ fontSize: 16 }} />
              <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>+5.5% from last month</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pie Chart Card and Bar Chart Card */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            {/* <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Plan Distribution</Typography>
              </Box>
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={plansData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      label
                    >
                      {plansData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent> */}


             <CardContent>
          <Box display="flex" alignItems="center" mb={2} >
              <PieChartIcon color="primary" sx={{ mr: 1 }} />
               <Typography variant="h6">Plan Distribution</Typography>
            </Box>
            
           <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={plansData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Donut chart
                    outerRadius={110}
                    paddingAngle={3}
                    cornerRadius={5}
                    labelLine={false}
                  >
                    {plansData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  {30}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Plans
                </Typography>
              </Box>
            </Box>
          </CardContent>
            
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)' } }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BarChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">Monthly User Registrations</Typography>
              </Box>
              <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="registrations" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

