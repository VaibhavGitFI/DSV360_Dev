import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CardContent,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';

const StyledCard = ({ children }) => (
  <Paper sx={{ borderRadius: 4, overflow: 'hidden', p: 2 }}>
    {children}
  </Paper>
);

const Settings = () => {
  return (
        <Box sx={{ p: 3 }}>
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
    </Box>
  );
};

export default Settings;

