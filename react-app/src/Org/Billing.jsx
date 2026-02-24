import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Divider,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Receipt,
  Payment,
  TrendingUp,
  CreditCard as CreditCardIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { faker } from '@faker-js/faker';


const StyledCard = ({ children }) => (
  <Paper sx={{ borderRadius: 4, overflow: 'hidden', p: 2, height: '100%' }}>
    {children}
  </Paper>
);

const Billing = () => {
    const theme = useTheme();

    const revenueOverviewData = {
        thisMonth: '$24,560',
        change: '18% from last month'
    };

    const planDistributionData = [
        { plan: 'Enterprise', value: 15, color: 'primary' },
        { plan: 'Pro', value: 30, color: 'secondary' },
        { plan: 'Basic', value: 40, color: 'info' },
        { plan: 'Free', value: 15, color: 'inherit' }
    ];

    const billingHistoryData = Array.from({ length: 20 }).map((_, i) => ({
        invoiceId: `INV-${faker.string.numeric(6)}`,
        date: faker.date.recent().toISOString().split('T')[0],
        organization: faker.company.name(),
        amount: faker.finance.amount(50, 500, 2),
        status: ['Paid', 'Pending', 'Failed'][i % 3],
    }));

  return (
    <Box
      sx={{
        p: 2,
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${theme.palette.background.default} 100%)`
      }}
    >
      <Grid container spacing={3}>
        {/* Main Content Area */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent>
              {/* Revenue Overview Section - Top Part */}
              <Box mb={4}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                  Billing Overview
                </Typography>
                <Grid container spacing={3}>
                  {/* Monthly Revenue Card */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%', mr: 2 }}>
                        <AttachMoneyIcon fontSize="large" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">This Month's Revenue</Typography>
                        <Typography variant="h4" fontWeight="bold">{revenueOverviewData.thisMonth}</Typography>
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <TrendingUp color="success" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="success.main">{revenueOverviewData.change}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  {/* Plan Distribution Section */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" mb={2}>Plan Distribution</Typography>
                      {planDistributionData.map((item, i) => (
                        <Box key={item.plan} display="flex" alignItems="center" mb={1.5}>
                          <Box width="100%" mr={2}>
                            <LinearProgress
                              variant="determinate"
                              value={item.value}
                              color={item.color}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" width={80}>{item.plan}</Typography>
                          <Typography variant="body2" color="text.secondary" width={40}>
                            {item.value}%
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Billing History Section - Bottom Part */}
              <Box>
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
                      {billingHistoryData.map((row, i) => (
                        <TableRow hover key={i}>
                          <TableCell>{row.invoiceId}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.organization}</TableCell>
                          <TableCell>${row.amount}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              color={row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}
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
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Billing;
