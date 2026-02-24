import React, { useEffect, useState } from "react";
import {Box,Card, Tooltip,Paper,CardContent,Typography,Grid,Button,LinearProgress,Table,TableHead,TableRow,TableCell,TableBody,Dialog,DialogTitle,DialogContent,DialogActions,TextField,MenuItem,IconButton,Snackbar,Slide,Alert,Collapse,Skeleton,TablePagination,alpha} from "@mui/material";
import {CalendarToday,BeachAccess,LocalHospital,WorkOff, ConnectingAirportsOutlined} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SyncIcon from "@mui/icons-material/Sync";
import { keyframes } from "@mui/system";



import axios from "axios";
// import { useSelector } from "react-redux";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LeaveTab = ({ userData }) => {
  // console.log("userData", userData)
  const [open, setOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "",
    numberOfDays:0,
    startDate: "",
    endDate: "",
    reason: "",
  });
    const [loading, setLoading] = useState(true);


  const [leaveRequests,setleaveRequests] = useState(null);
  const [openRow, setOpenRow] = useState(null);
    
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    type: "",
     numberOfDays:0,
    startDate: "",
    endDate: "",
    reason: "",
    ROWID:"",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const fieldsToShow = ["Leave_Type", "Start_Date", "End_Date", "Status", "LeaveCnt", "ActionBy"];
  const longFields = ["Reason", "Cancellation_Reason"]; // long fields
  const [probationMessage, setProbationMessage] = useState("");
    const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);



    const [leaveData, setLeaveData] = useState(null);

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

    const handleToggle = (index) => {
    setOpenRow(openRow === index ? null : index);
  };
  



 const fetchLeaveData = async () => {
      setLoading(true);

      try {
        const currUser = JSON.parse(localStorage.getItem("currUser"));
        const createdTime = currUser?.createdTime;

        if (!createdTime) {
          setProbationMessage("User creation date not found.");
          setLoading(false);
          return;
        }

        const createdDate = new Date(createdTime);
        const currentDate = new Date();
        const diffInMonths =
          (currentDate.getFullYear() - createdDate.getFullYear()) * 12 +
          (currentDate.getMonth() - createdDate.getMonth());

        // console.log("Account age (months):", diffInMonths);

        if (diffInMonths < 3) {
          setProbationMessage("You are under the probation period.");
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          UserID: userData.id,
          Username: userData.name,
        });

        const response = await axios.get(
          `/server/time_entry_management_application_function/leave/count?${params}`
        );
        //  console.log("ressss",response)
        setLeaveData(response.data.data);
         const res = await axios.get(`/server/time_entry_management_application_function/leave/approval/${userData.id}`)
       
       if(res.status === 200){
        setleaveRequests(res.data.data);
       }


      } catch (err) {
        console.error(err);
        setProbationMessage(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
 useEffect(() => {
    if (userData?.id && userData?.name) {
      fetchLeaveData();
    }
  }, [userData.id, userData.name]);


//  const leavePercent = (leaveData?.usedLeaves / leaveData?.totalLeaves) * 100;

  // Handle Form Input
 const handleChange = (e) => {
  const { name, value } = e.target;

  // For numberOfDays: Strip leading zeros
  if (name === "numberOfDays") {
    const cleanedValue = value.replace(/^0+(?=\d)/, ""); // Remove leading zeros
    setLeaveForm((prev) => ({
      ...prev,
      [name]: cleanedValue,
    }));
  } else {
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

const validateForm = () => {
  let tempErrors = {};

  if (!leaveForm.type) tempErrors.type = "Leave type is required";
  if (!leaveForm.numberOfDays || leaveForm.numberOfDays <= 0) {
    tempErrors.numberOfDays = "Enter a valid number of days";
  }

  // ✅ Check leave balance based on updated leaveData keys
  if (leaveForm.type && leaveData && leaveForm.type !== "Unpaid Leave") {
    let remainingKey = "";

    if (leaveForm.type === "Paid Leave") remainingKey = "Remaining_Paid_Leaves";
    else if (leaveForm.type === "Sick Leave") remainingKey = "Remaining_Sick_Leaves";

    const remaining = parseInt(leaveData[remainingKey] || 0);
    const requested = parseInt(leaveForm.numberOfDays);

    if (requested > remaining) {
      tempErrors.numberOfDays = `You only have ${remaining} days left for ${leaveForm.type.replace("_", " ")}`;
    }
  }

  if (!leaveForm.startDate) tempErrors.startDate = "Start date is required";
  if (!leaveForm.endDate) tempErrors.endDate = "End date is required";
  if (!leaveForm.reason) tempErrors.reason = "Reason is required";

  setErrors(tempErrors);
  return Object.keys(tempErrors).length === 0;
};

const validateEditForm = () => {
  let tempErrors = {};

  if (!editForm.type) tempErrors.type = "Leave type is required";
  // if (!editForm.numberOfDays || editForm.numberOfDays <= 0) {
  //   tempErrors.numberOfDays = "Enter a valid number of days";
  // }
  const requestedDays = Number(editForm.numberOfDays);

if (!requestedDays || isNaN(requestedDays) || requestedDays <= 0) {
  tempErrors.numberOfDays = "Enter a valid number of days";
}

  // ✅ Check remaining leave balance based on updated leaveData keys
  // if (editForm.type && leaveData && editForm.type !== "Unpaid Leave") {
  //   let remainingKey = "";

  //   if (editForm.type === "Paid Leave") remainingKey = "Remaining_Paid_Leaves";
  //   else if (editForm.type === "Sick Leave") remainingKey = "Remaining_Sick_Leaves";

  //   const remaining = parseInt(leaveData[remainingKey] || 0);
  //   const requested = parseInt(editForm.numberOfDays);

  //   if (requested > remaining) {
  //     tempErrors.numberOfDays = `You only have ${remaining} days left for ${editForm.type.replace("_", " ")}`;
  //   }
  // }

  if (editForm.type && leaveData && editForm.type !== "Unpaid Leave") {
  let remainingKey = "";

  if (editForm.type === "Paid Leave") remainingKey = "Remaining_Paid_Leaves";
  else if (editForm.type === "Sick Leave") remainingKey = "Remaining_Sick_Leaves";

  const remaining = Number(leaveData[remainingKey] || 0);
  const requested = Number(editForm.numberOfDays);

  if (!isNaN(requested) && requested > remaining) {
    tempErrors.numberOfDays = `You only have ${remaining} days left for ${editForm.type}`;
  }
}


  if (!editForm.startDate) tempErrors.startDate = "Start date is required";
  if (!editForm.endDate) tempErrors.endDate = "End date is required";
  if (!editForm.reason) tempErrors.reason = "Reason is required";

  setErrors(tempErrors);
  return Object.keys(tempErrors).length === 0;
};



  const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      UserID: userData.id,
      Username: userData.name,
      Leave_Type: leaveForm.type,
      Reason: leaveForm.reason,
      Start_Date: leaveForm.startDate,
      End_Date: leaveForm.endDate,
      Status: "Pending",
      LeaveCnt: leaveForm.numberOfDays,
    };

    const response = await axios.post(
      "/server/time_entry_management_application_function/leave/request",
      payload
    );

    

    // console.log("✅ Leave Request Submitted:", response.data);

    if(response.data.success){
        handleAlert('success',response.data.message)

setleaveRequests((prev) => [response.data.data, ...(prev || [])]);

        setLeaveForm({
      type: "",
      numberOfDays: 0,
      startDate: "",
      endDate: "",
      reason: "",
    });

    setErrors({});
    setOpen(false);
    }
    else{
      handleAlert("error",response.data.message);
    }

     // close modal
  } catch (error) {
    handleAlert("error",error)
    console.error("❌ Error submitting leave request:", error);
  }
};

 

  const handleEditOpen = (index) => {
    const req = leaveRequests[index];
    // console.log("req",req);
    setEditForm({
      type: req.Leave_Type || "",
      numberOfDays:req.LeaveCnt || "",
      startDate: req.Start_Date  || "",
      endDate: req.End_Date || "",
      reason: req.Reason || "",
      ROWID: req.ROWID || "",
    });

    setEditingIndex(index);
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

const handleEditSubmit = async () => {
  if (!validateEditForm()) return;

  try {
    const payload = {
      UserID: userData.id,
      Username: userData.name,
      Leave_Type: editForm.type,
      Reason: editForm.reason,
      Start_Date: editForm.startDate,
      End_Date: editForm.endDate,
      LeaveCnt: editForm.numberOfDays,
    };

    // ✅ API call to update leave request
    const response = await axios.put(
      `/server/time_entry_management_application_function/leave/approval/${editForm.ROWID}`,  
       payload
    );
    // console.log("response from updated value :", response);

    if (response.status === 200) {
     // toast.success("Leave request updated successfully!");
      setleaveRequests((prev) => {
        if (!prev) return prev;
        const updated = prev.map((req) =>
          req.ROWID === editForm.ROWID ? { ...req, ...payload } : req
        );
        return updated;
      });
   
      setEditOpen(false);
      setEditingIndex(null);
    }
  } catch (error) {
    console.error("Error updating leave:", error);
   // toast.error("Failed to update leave request!");
  }
};
const handleSync = async () => {
  await fetchLeaveData();
};

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCancel = () =>{
    setErrors({});
    setOpen(false);
    setLeaveForm({
      type: "",
      numberOfDays: 0,
      startDate: "",
      endDate: "",
      reason: "",
    });
  }


  const handleEditCancel = () =>{
    setErrors({});
    setEditOpen(false);
    setEditForm({
    type: "",
     numberOfDays:0,
    startDate: "",
    endDate: "",
    reason: "",
    ROWID:"",
  })
  }
  // ✅ Paginated data
  const paginatedData = leaveRequests?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 2 }}>

      {probationMessage ? (
    <Grid container spacing={3} mb={3}>
      <Grid size={12}>
       <Card
  sx={{
    borderRadius: 3,
    boxShadow: 3,
    p: 3,
    textAlign: "center",
    bgcolor: "background.paper",       // auto changes in dark theme
    border: "1px solid",
    borderColor: "divider",            // auto changes in dark theme
  }}
>
  <Typography variant="h6" color="text.primary">
    {probationMessage}
  </Typography>
</Card>

      </Grid>
    </Grid>
  ) : (
    <>
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
  {/* Remaining Leave */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    {loading ? (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <Skeleton variant="text" width={120} height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={60} height={40} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
      </Card>
    ) : (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          transition: "0.3s",
          "&:hover": { boxShadow: 8, transform: "scale(1.03)" },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <BeachAccessIcon color="primary" />
            <Typography variant="subtitle2" fontWeight="medium">Remaining</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {leaveData?.Remaining_Total_Leaves}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Out of {Number(leaveData?.Total_Paid_Leave || 0) + Number(leaveData?.Total_Sick_Leave || 0)} leaves
          </Typography>
        </CardContent>
      </Card>
    )}
  </Grid>

  {/* Paid Leave */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    {loading ? (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <Skeleton variant="text" width={120} height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={60} height={40} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
      </Card>
    ) : (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          transition: "0.3s",
          "&:hover": { boxShadow: 8, transform: "scale(1.03)" },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <WorkOff sx={{ color: "error.main" }} />
            <Typography variant="subtitle2" fontWeight="medium">Paid</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {leaveData?.Remaining_Paid_Leaves || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Out of {leaveData?.Total_Paid_Leave || 0} leaves
          </Typography>
        </CardContent>
      </Card>
    )}
  </Grid>

  {/* Sick Leave */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    {loading ? (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <Skeleton variant="text" width={120} height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={60} height={40} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
      </Card>
    ) : (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          transition: "0.3s",
          "&:hover": { boxShadow: 8, transform: "scale(1.03)" },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocalHospital sx={{ color: "success.main" }} />
            <Typography variant="subtitle2" fontWeight="medium">Sick</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {leaveData?.Remaining_Sick_Leaves || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Out of {leaveData?.Total_Sick_Leave || 0} leaves
          </Typography>
        </CardContent>
      </Card>
    )}
  </Grid>

  {/* Unpaid Leave */}
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    {loading ? (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <Skeleton variant="text" width={120} height={30} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={60} height={40} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
      </Card>
    ) : (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          transition: "0.3s",
          "&:hover": { boxShadow: 8, transform: "scale(1.03)" },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <BeachAccessIcon sx={{ color: "info.main" }} />
            <Typography variant="subtitle2" fontWeight="medium">Unpaid</Typography>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {leaveData?.Used_Unpaid_Leave || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This month
          </Typography>
        </CardContent>
      </Card>
    )}
  </Grid>
</Grid>


{/* Leave Requests Table */}
<Box mt={4}>
       
  <Box
  sx={(theme) => ({
    display: "flex",
    alignItems: { xs: "flex-start", sm: "center" },
    justifyContent: "space-between",
    flexDirection: { xs: "column", sm: "row" },
    gap: 2,
    mb: 2,
    p: 2,
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(
      theme.palette.primary.light,
      0.12
    )} 55%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
  })}
>
  {/* Left: Title + Subtitle */}
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="h6" sx={{ mb: 0, fontWeight: 900, lineHeight: 1.2 }}>
      Recent Leave Requests
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
      Track approvals, sync updates, and request new leave
    </Typography>
  </Box>

  {/* Right: Actions */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.2,
      width: { xs: "100%", sm: "auto" },
      justifyContent: { xs: "flex-start", sm: "flex-end" },
      flexWrap: "wrap",
    }}
  >
    {/* Sync Button (pill) */}
    <Tooltip title="Sync Data">
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.2,
          py: 0.6,
          borderRadius: 999,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.25),
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        })}
      >
        <IconButton
          size="small"
          color="primary"
          onClick={handleSync}
          disabled={loading}
          sx={{
            p: 0.6,
            bgcolor: "transparent",
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          <SyncIcon
            sx={{
              animation: loading ? `${spin} 1s linear infinite` : "none",
            }}
          />
        </IconButton>

        <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main" }}>
          {loading ? "Syncing..." : "Sync"}
        </Typography>
      </Box>
    </Tooltip>

    {/* Request Leave Button */}
    <Button
      variant="contained"
      startIcon={<CalendarToday />}
      onClick={() => setOpen(true)}
      sx={(theme) => ({
        borderRadius: 3,
        textTransform: "none",
        fontWeight: 900,
        px: 2.4,
        py: 1,
        width: { xs: "100%", sm: "auto" }, // ✅ full width on mobile
        boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.25)}`,
        "&:hover": {
          boxShadow: `0 14px 30px ${alpha(theme.palette.primary.main, 0.32)}`,
        },
      })}
    >
      Request Leave
    </Button>
  </Box>
</Box>



         <Box sx={{ width: "100%", overflowX: "auto" }}>
      {loading ? (
        <Table sx={{ border: "1px solid #eee", borderRadius: 2 }}>
          <TableHead>
            <TableRow>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TableCell key={idx}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: 6 }).map((_, cIdx) => (
                  <TableCell key={cIdx}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <>
          <Table sx={{ border: "1px solid #eee", borderRadius: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <strong>Leave Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Start Date</strong>
                </TableCell>
                <TableCell>
                  <strong>End Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Edit</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData && paginatedData.length > 0 ? (
                paginatedData.map((req, i) => (
                  <React.Fragment key={i + page * rowsPerPage}>
                    <TableRow
                      hover
                      sx={{
                        transition: "0.2s",
                        "&:hover": { backgroundColor: "grey.100" },
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleToggle(i + page * rowsPerPage)}
                        >
                          {openRow === i + page * rowsPerPage ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{req.Leave_Type || "N/A"}</TableCell>
                      <TableCell>{req.Start_Date || "N/A"}</TableCell>
                      <TableCell>{req.End_Date || "N/A"}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: "white",
                            bgcolor:
                              req.Status === "Approved"
                                ? "success.main"
                                : req.Status === "Pending"
                                ? "warning.main"
                                : "error.main",
                          }}
                        >
                          {req.Status || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {req.Status !== "Approved" && (
                          <IconButton
                            color="primary"
                            onClick={() =>
                              handleEditOpen(i + page * rowsPerPage)
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expandable Section */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse
                          in={openRow === i + page * rowsPerPage}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ m: 2 }}>
                            <Paper
                              elevation={2}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              }}
                            >
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ mb: 2 }}
                              >
                                Leave Details
                              </Typography>

                              <Grid container spacing={2}>
                                {fieldsToShow.map((key) => (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={key}
                                  >
                                    <Box
                                      sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        border: "1px solid #eee",
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        {key.replace(/_/g, " ")}
                                      </Typography>
                                      <Typography
                                        variant="body1"
                                        fontWeight={500}
                                      >
                                        {req[key] &&
                                        req[key].toString().trim() !== ""
                                          ? req[key]
                                          : "N/A"}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>

                              {longFields.map((key) => (
                                <Box
                                  key={key}
                                  sx={{
                                    mt: 2,
                                    p: 2,
                                    borderRadius: 1,
                                    border: "1px solid #eee",
                                   // backgroundColor: "#fafafa",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1, fontWeight: "bold" }}
                                  >
                                    {key.replace(/_/g, " ")}
                                  </Typography>
                                  <Typography variant="body1">
                                    {req[key] &&
                                    req[key].toString().trim() !== ""
                                      ? req[key]
                                      : "N/A"}
                                  </Typography>
                                </Box>
                              ))}
                            </Paper>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No leave requests found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ✅ Pagination Component */}
          <TablePagination
            component="div"
            count={leaveRequests?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Box>
      </Box>

{/* Request Leave Button */}
{/* <Box display="flex" justifyContent="flex-end" mt={4}>
  <Button
    variant="contained"
    startIcon={<CalendarToday />}
    sx={{
      borderRadius: 3,
      textTransform: 'none',
      fontWeight: 'bold',
      px: 3,
      py: 1.5,
      bgcolor: 'primary.main',
      '&:hover': { bgcolor: 'primary.dark' },
    }}
    onClick={() => setOpen(true)}
  >
    Request Leave
  </Button>
</Box> */}
</>
  )}


   <Dialog open={open} onClose={() =>handleCancel()} fullWidth maxWidth="sm">
      <DialogTitle>Apply for Leave</DialogTitle>
      <DialogContent dividers>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Leave Type"
          name="type"
          value={leaveForm.type}
          onChange={handleChange}
          error={!!errors.type}
          helperText={errors.type}
        >
          <MenuItem value="Sick Leave">Sick Leave</MenuItem>
          <MenuItem value="Paid Leave">Paid Leave</MenuItem>
          <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          label="Number of days"
          name="numberOfDays"
          type="number"
          InputLabelProps={{ shrink: true }}
          value={leaveForm.numberOfDays}
          onChange={handleChange}
          error={!!errors.numberOfDays}
          helperText={errors.numberOfDays}
        />

        <TextField
          fullWidth
          margin="dense"
          label="Start Date"
          name="startDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={leaveForm.startDate}
          onChange={handleChange}
          error={!!errors.startDate}
          helperText={errors.startDate}
        />

        <TextField
          fullWidth
          margin="dense"
          label="End Date"
          name="endDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={leaveForm.endDate}
          onChange={handleChange}
          error={!!errors.endDate}
          helperText={errors.endDate}
        />

        <TextField
          fullWidth
          margin="dense"
          label="Reason"
          name="reason"
          multiline
          rows={3}
          value={leaveForm.reason}
          onChange={handleChange}
          error={!!errors.reason}
          helperText={errors.reason}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>handleCancel()}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>

      {/* Edit Leave Dialog */}
<Dialog
  open={editOpen}
  onClose={() =>handleEditCancel()}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: 4,
      boxShadow: 8,
   
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      fontSize: "1.4rem",
   
      textAlign: "center",
   
      mb: 1,
    }}
  >
    ✏️ Edit Leave Request
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
    
      p: 3,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <TextField
      select
      fullWidth
      margin="dense"
      label="Leave Type"
      name="type"
      value={editForm.type}
      onChange={handleEditChange}
      error={!!errors.type}
      helperText={errors.type}
      sx={{ borderRadius: 2 }}
    >
      <MenuItem value="Sick Leave">Sick Leave</MenuItem>
      <MenuItem value="Paid Leave">Paid Leave</MenuItem>
      <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
    </TextField>

    <TextField
      fullWidth
      margin="dense"
      label="Number of Days"
      name="numberOfDays"
      type="number"
      InputLabelProps={{ shrink: true }}
      value={editForm.numberOfDays}
      onChange={handleEditChange}
      error={!!errors.numberOfDays}
      helperText={errors.numberOfDays}
    />

    <Box display="flex" gap={2}>
      <TextField
        fullWidth
        margin="dense"
        label="Start Date"
        name="startDate"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={editForm.startDate}
        onChange={handleEditChange}
        error={!!errors.startDate}
        helperText={errors.startDate}
      />
      <TextField
        fullWidth
        margin="dense"
        label="End Date"
        name="endDate"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={editForm.endDate}
        onChange={handleEditChange}
        error={!!errors.endDate}
        helperText={errors.endDate}
      />
    </Box>

    <TextField
      fullWidth
      margin="dense"
      label="Reason"
      name="reason"
      multiline
      rows={3}
      value={editForm.reason}
      onChange={handleEditChange}
      error={!!errors.reason}
      helperText={errors.reason}
      sx={{ borderRadius: 2 }}
    />
  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: "space-between",
      p: 2,
    
      borderTop: "1px solid #bbdefb",
    }}
  >
    <Button
      onClick={() =>handleEditCancel()}
      sx={{
      
        textTransform: "none",
        fontWeight: "bold",
        "&:hover": { backgroundColor: "#bbdefb" },
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleEditSubmit}
      variant="contained"
      sx={{
      
        textTransform: "none",
        fontWeight: "bold",
        px: 3,
        "&:hover": { backgroundColor: "#0d47a1" },
      }}
    >
      Save Changes
    </Button>
  </DialogActions>
</Dialog>



 <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={SlideTransition}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: "100%",
              "&.MuiAlert-standardSuccess": {
                backgroundColor: "#4caf50",
                color: "#fff",
              },
              "&.MuiAlert-standardError": {
                backgroundColor: "#f44336",
                color: "#fff",
              },
              "& .MuiAlert-icon": {
                color: "#fff",
              },
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

    </Box>
  );
};

export default LeaveTab;
