import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  Slide,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Grid,
  Divider,
  IconButton,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  alpha,
  useTheme,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useSelector } from "react-redux";

// Helper function to determine chip color
const getColor = (status) => {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "error";
  if (status === "Clarification Needed") return "info";
  return "warning";
};

const LeaveRequests = ({ url }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.user.user);

  const [allLeaveData, setAllLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState("");
  const [message, setMessage] = useState("");

  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterUsername, setFilterUsername] = useState("");

  const leaveTypeMap = {
    Paid_Leave: "Paid Leave",
    Sick_Leave: "Sick Leave",
    Unpaid_Leave: "Unpaid Leave",
  };

  const uniqueLeaveTypes = useMemo(() => {
    const types = new Set(allLeaveData.map((item) => item.Leave_Type).filter(Boolean));
    return ["All", ...Array.from(types)];
  }, [allLeaveData]);

  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  const handleAlert = (severity, message) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);

      if (response.status === 200) {
        if (!response.data.data || response.data.data.length === 0) {
          setAllLeaveData([]);
          return;
        }

        response.data.data.forEach((leave) => {
          if (leaveTypeMap[leave.Leave_Type]) {
            leave.Leave_Type = leaveTypeMap[leave.Leave_Type];
          }
        });

        setAllLeaveData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      handleAlert("error", "Failed to fetch leave requests.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const filteredLeaveData = useMemo(() => {
    return allLeaveData.filter((item) => {
      const typeMatch = filterLeaveType === "All" || item.Leave_Type === filterLeaveType;
      const usernameMatch =
        !filterUsername || item.Username.toLowerCase().includes(filterUsername.toLowerCase());
      return typeMatch && usernameMatch;
    });
  }, [allLeaveData, filterLeaveType, filterUsername]);

  const fetchLeaveBalance = useCallback(async (userId, username) => {
    setBalanceLoading(true);
    setLeaveBalance(null);
    try {
      const usernameEncoded = encodeURIComponent(username);
      const apiUrl = `/server/time_entry_management_application_function/leave/count?UserID=${userId}&Username=${usernameEncoded}`;
      const response = await axios.get(apiUrl);
      setLeaveBalance(response.data.data);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      setLeaveBalance({ error: "Could not load balance data." });
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const handleOpenDetails = (leave) => {
    setSelectedLeave(leave);
    setOpenDetailsDialog(true);
    if (leave.UserID && leave.Username) {
      fetchLeaveBalance(leave.UserID, leave.Username);
    }
  };

  const handleActionClick = (leave, type) => {
    setSelectedLeave(leave);
    setActionType(type);
    setMessage("");
    setOpenActionDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave) return;

    const statusToSend = actionType === "approve" ? "Approved" : "Rejected";
    const cancellationReason = message;

    try {
      const response = await axios.post(
        `/server/time_entry_management_application_function/leave/approval/${selectedLeave.ROWID}`,
        {
          Status: statusToSend,
          ActionByID: user.userid,
          ActionBy: user.firstName + " " + user.lastName,
          Cancellation_Reason: cancellationReason,
        }
      );

      handleAlert("success", response.data.message || "Action completed successfully.");

      setAllLeaveData((prev) =>
        prev.map((item) => (item.ROWID === selectedLeave.ROWID ? { ...item, Status: statusToSend } : item))
      );

      setOpenActionDialog(false);
      setOpenDetailsDialog(false);
      setSelectedLeave(null);
      setMessage("");
    } catch (error) {
      console.error("Error updating leave:", error);
      handleAlert("error", error?.response?.data?.message || "Something went wrong.");
      setOpenActionDialog(false);
      setOpenDetailsDialog(false);
    }
  };

  return (
    <>
      {/* MAIN SHELL */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          minHeight: "60vh",
          boxShadow: `0 12px 34px ${alpha(theme.palette.common.black, 0.06)}`,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
              theme.palette.primary.light,
              0.12
            )} 60%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Leave Requests
            </Typography>
            
          </Box>

          {/* FILTER BAR */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="leave-type-filter-label">Leave Type</InputLabel>
              <Select
                labelId="leave-type-filter-label"
                label="Leave Type"
                value={filterLeaveType}
                onChange={(e) => setFilterLeaveType(e.target.value)}
              >
                {uniqueLeaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Search User"
              placeholder="e.g., John Doe"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              sx={{ minWidth: 220 }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchLeaveRequests}
              disabled={loading}
              size="small"
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.18)}`,
              }}
            >
              {loading ? "Refreshing..." : "Sync"}
            </Button>
          </Stack>
        </Box>

        <CardContent sx={{ p: 0}}>
          {/* LIST */}
          <Box sx={{ maxHeight: 350, overflowY: "auto", p: 2 }}>
            {loading ? (
              <Stack spacing={1.2}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 3, borderColor: "divider" }}
                  >
                    <Skeleton width="35%" height={22} />
                    <Skeleton width="65%" height={18} />
                    <Box sx={{ display: "flex", gap: 1, mt: 1.2 }}>
                      <Skeleton variant="rounded" width={90} height={26} />
                      <Skeleton variant="rounded" width={110} height={30} />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : filteredLeaveData.length > 0 ? (
              <Stack spacing={1.2}>
                {filteredLeaveData.map((item) => (
                  <Paper
                    key={item.ROWID}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderColor: "divider",
                      transition: "transform 160ms ease, box-shadow 160ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 14px 30px ${alpha(theme.palette.common.black, 0.08)}`,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 900 }} noWrap title={item.Username}>
                          {item.Username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                          {item.Leave_Type} • {item.Start_Date} → {item.End_Date}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={item.Status}
                          color={getColor(item.Status)}
                          size="small"
                          sx={{ fontWeight: 900 }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenDetails(item)}
                          sx={{ borderRadius: 2, fontWeight: 900 }}
                        >
                          View
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: alpha(theme.palette.text.primary, 0.18),
                  textAlign: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}
              >
                <Typography sx={{ fontWeight: 900, color: "text.secondary" }}>
                  {allLeaveData.length > 0 && (filterLeaveType !== "All" || filterUsername)
                    ? "No requests match the current filter criteria."
                    : "No Leave Requests Found"}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* DETAILS DIALOG */}
      <Dialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            position: "relative",
            fontWeight: 900,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
              theme.palette.primary.light,
              0.12
            )} 100%)`,
          }}
        >
          Leave Details
          <IconButton
            aria-label="close"
            onClick={() => setOpenDetailsDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (t) => t.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: 600, overflowY: "auto" }}>
          {selectedLeave && (
            <Grid container spacing={2.5}>
              {/* LEFT: REQUEST INFO */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                  Request Information
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
                  <Grid container spacing={1.5}>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Employee
                      </Typography>
                      <Typography sx={{ fontWeight: 900 }}>{selectedLeave.Username}</Typography>
                    </Grid>

                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={selectedLeave.Status}
                          color={getColor(selectedLeave.Status)}
                          size="small"
                          sx={{ fontWeight: 900 }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Leave Type
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{selectedLeave.Leave_Type}</Typography>
                    </Grid>

                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Days
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{selectedLeave.LeaveCnt}</Typography>
                    </Grid>

                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Start
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{selectedLeave.Start_Date}</Typography>
                    </Grid>

                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        End
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{selectedLeave.End_Date}</Typography>
                    </Grid>

                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        Reason
                      </Typography>
                      <Typography sx={{ color: "text.secondary" }}>{selectedLeave.Reason}</Typography>
                    </Grid>

                    {selectedLeave.Cancellation_Reason && selectedLeave.Status === "Rejected" && (
                      <Grid size={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.error.main }}>
                          Rejection Reason
                        </Typography>
                        <Typography sx={{ color: theme.palette.error.dark, fontWeight: 700 }}>
                          {selectedLeave.Cancellation_Reason}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* RIGHT: BALANCE */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1 }}>
                  Current Leave Balance
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  }}
                >
                  {balanceLoading ? (
                    <Stack spacing={1}>
                      <Skeleton height={38} />
                      <Skeleton height={38} />
                      <Skeleton height={38} />
                    </Stack>
                  ) : leaveBalance && !leaveBalance.error ? (
                    <Stack spacing={1.2}>
                      {[
                        {
                          label: "Paid Leaves",
                          remaining: leaveBalance.Remaining_Paid_Leaves,
                          total: leaveBalance.Total_Paid_Leave,
                          used: leaveBalance.Used_Paid_Leave,
                          color: "success",
                        },
                        {
                          label: "Sick Leaves",
                          remaining: leaveBalance.Remaining_Sick_Leaves,
                          total: leaveBalance.Total_Sick_Leave,
                          used: leaveBalance.Used_Sick_Leave,
                          color: "warning",
                        },
                        {
                          label: "Unpaid Leaves Used",
                          remaining: leaveBalance.Used_Unpaid_Leave,
                          color: "info",
                          isUsed: true,
                        },
                      ].map((x) => (
                        <Box key={x.label} sx={{ pb: 1, borderBottom: "1px dashed", borderColor: "divider" }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontWeight: 900 }}>{x.label}</Typography>
                            {x.isUsed ? (
                              <Chip label={`Used: ${x.remaining}`} color={x.color} size="small" />
                            ) : (
                              <Chip
                                label={`${x.remaining} / ${x.total}`}
                                color={x.remaining > 0 ? x.color : "error"}
                                size="small"
                              />
                            )}
                          </Stack>
                          {!x.isUsed && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                              {x.used} used
                            </Typography>
                          )}
                        </Box>
                      ))}

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 900 }}>Total Remaining</Typography>
                        <Chip
                          label={`${leaveBalance.Remaining_Total_Leaves} days`}
                          color="primary"
                          icon={<CheckCircleIcon />}
                          sx={{ fontWeight: 900 }}
                        />
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography color="error.main" sx={{ fontWeight: 800 }}>
                      {leaveBalance?.error || "No leave balance data available."}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {selectedLeave?.Status === "Pending" && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleActionClick(selectedLeave, "approve")}
                sx={{ borderRadius: 2, fontWeight: 900 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleActionClick(selectedLeave, "reject")}
                sx={{ borderRadius: 2, fontWeight: 900 }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ACTION DIALOG */}
      {actionType === "approve" ? (
        <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)}>
          <DialogTitle sx={{ fontWeight: 900 }}>Approve Leave</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to approve this leave request?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
            <Button variant="contained" color="success" onClick={handleConfirmAction} sx={{ fontWeight: 900 }}>
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      ) : (
        <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 900 }}>Reject Leave</DialogTitle>
          <DialogContent>
            <Typography mb={1}>Please enter your reason for rejecting this leave.</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your rejection reason here..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmAction}
              disabled={!message.trim()}
              sx={{ fontWeight: 900 }}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LeaveRequests;
