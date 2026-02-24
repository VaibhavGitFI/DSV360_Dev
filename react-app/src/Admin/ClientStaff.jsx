import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TableFooter,
  TablePagination,
  Drawer,
  MenuItem,
  alpha,
  Avatar,
  Snackbar,
  Tooltip,
  Alert,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";

import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClientContact,
  clientContactActions,
  updateClientContactStatusLocally,
} from "../redux/Client/contacts";
import axios from "axios";
import { fetchClientData } from "../redux/Client/clientSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLocation } from "react-router-dom";
import { resolve } from "url";
export const ClientStaff = () => {



  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [ContactToDelete, setContactoDelete] = useState(null);

   const [addLoading, setAddLoading] = useState(false);

    const[deleteLoading, setDeleteLoading] = useState(false);

  const [newClientStaff, setNewClientStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    mobile: "",
    orgId: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  const theme = useTheme();

  const dispatch = useDispatch();
  const { data, isLoading } = useSelector(
    (state) => state.clientContactReducer
  );

  const { data: client } = useSelector((state) => state.clientReducer);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      dispatch(fetchClientContact());
    }

    if (!Array.isArray(client) || client.length === 0) {
      dispatch(fetchClientData());
    }
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event?.target?.value);
    setPage(0);
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
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
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "organization") {
      const selectedOption = client.find((option) => option.ROWID === value);
      if (selectedOption) {
        setNewClientStaff((prev) => ({
          ...prev,
          organization: selectedOption.Org_Name,
          orgId: selectedOption.ROWID,
        }));
      }
    } else setNewClientStaff((prev) => ({ ...prev, [name]: value }));

  //  console.log("input is chang");
  };

  const handleAddClientStaff = async () => {
    if (
      newClientStaff.firstName &&
      newClientStaff.email &&
      newClientStaff.mobile &&
      newClientStaff.organization &&
      newClientStaff.orgId
    ) {
    //  console.log("Adding ClientStaff:", newClientStaff);

      try {
        setAddLoading(true);
        const response = await axios.post(
          "/server/time_entry_management_application_function/addContact",
          {
            first_name: newClientStaff.firstName,
            last_name: newClientStaff.lastName,
            org_name: newClientStaff.organization,
            email_id: newClientStaff.email,
            org_id: newClientStaff.orgId,
            phone: newClientStaff.mobile,
          }
        );

      //  console.log("API Response:", response.data.data);
        if (response.status == 200) {
          dispatch(clientContactActions.addClientStaffData(response.data.data));
        }

        // Ensure user details are correctly received
        const userDetails = response.data.data;
        if (!userDetails) {
          throw new Error("User details not found in response.");
        }

        // Update employees state
        // setStaff((prev) => {
        //   const updatedStaff = [...prev, userDetails];
        //   console.log("Updated Employees List:", updatedStaff);
        //   return updatedStaff;
        // });

        // Show success alert
        handleAlert("success", "Client Contact Added and confirmed.");

        // Close drawer & reset form
        setDrawerOpen(false);
        setNewClientStaff({}); // Reset to an empty object
      } catch (error) {
        console.error("Error adding employee:", error);

        // Handle error alert
        handleAlert(
          "error",
          error.response?.data?.message ||
            error.message ||
            "Something went wrong!"
        );
      }finally{
        setAddLoading(false);
      }
    } else {
      handleAlert("error", "Please fill all fields");
    }
    toggleDrawer(false);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event?.target?.value, 10));
    setPage(0);
  };

  const filteredStaff = data?.filter(
    (stf) =>
      // return(
      stf.First_Name &&
      stf.First_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedStaff = filteredStaff?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const validateForm = () => {
    let newErrors = {};

    if (!newClientStaff.firstName)
      newErrors.firstName = "First name is required";
    if (!newClientStaff.email) newErrors.email = "email  is required";

    if (!newClientStaff.organization)
      newErrors.organization = "organization is required";
    if (!newClientStaff.mobile) newErrors.mobile = "mobile type  is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddClientStaff(newClientStaff);
  
    }
  };

  const toggleUserActive = async (userID, status, ROWID) => {
  //  console.log(userID, status);
    try {
      const newStatus = status ? "DISABLED" : "ACTIVE";
      // console.log("Updating Employee Status:", newStatus, userID);
      const response = await axios.post(
        "/server/time_entry_management_application_function/updateClientContactStatus",
        {
          status: status,
          ROWID: ROWID,
          USERID: userID,
        }
      );
     // console.log("response:", response);
      if (response.status === 200) {
        dispatch(
          updateClientContactStatusLocally({
            userID,
            status,
          })
        );
      }

      // console.log(response);
      // const updatedEmployee = employees.map((employee) => {
      //   if (employee.user_id === userID) {
      //     employee.status = active === "ACTIVE" ? "DISABLED" : "ACTIVE";
      //   }
      //   return employee;
      // });

      if (newStatus !== "ACTIVE") {
        handleAlert("success", "Employee is Active now..");
      } else {
        handleAlert("error", "Employee is Inactive");
      }
      // setEmployees(updatedEmployee);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setContactoDelete(null);
  };

  const handleDeleteClick = (data) => {
  //  console.log("hello hello hi ", data);
    setContactoDelete(data);
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (ContactToDelete) {

      try {
        setDeleteLoading(true);
        const { ROWID, UserID } = ContactToDelete;
        const response = await axios.delete(
          `/server/time_entry_management_application_function/contact`,
          {
            data: {
              ROWID: ROWID,
              USERID: UserID,
            },
          }
        );

       // console.log("deleted project", response);
        if (response.status === 200) {
     
          dispatch(clientContactActions.deleteClienttData(ROWID));
          handleAlert("success", "Staff deleted successfully");
        } else {
          handleAlert("error", "Failed to delete Staff");
        }
      } catch (error) {
        console.error("Error deleting Staff:", error);
        handleAlert("error", error.message || "Error deleting Staff");
      } finally {
        setDeleteConfirmOpen(false);
        setContactoDelete(null);
        setDeleteLoading(false);
      }
    }
  };

  return (
    <>
      <Box sx={{ padding: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.08
            )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Left Side: Avatar + Typography */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 50,
                height: 50,
              }}
            >
              <AccountCircleIcon sx={{ color: "#fff" }} fontSize="large" />
            </Avatar>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              Client Contacts
            </Typography>
          </Box>

          {/* Right Side: Search Bar + Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", md: "auto" },
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              label="Search Client Contacts"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{
                width: { xs: "100%", sm: "60%", md: "250px" },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => toggleDrawer(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Add Client Contacts
            </Button>
          </Box>
        </Paper>

        <Grid size={12}>
          {isLoading ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Frist Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Organization
                  </TableCell>

                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Contacts
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "300px",
                        gap: 2,
                      }}
                    >
                      {[...Array(6)].map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            width: "100%",
                            height: "40px",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Skeleton variant="text" width="8%" />
                          <Skeleton variant="text" width="15%" />
                          <Skeleton variant="text" width="10%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="15%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="8%" />
                          <Skeleton variant="text" width="8%" />
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : paginatedStaff?.length === 0 && !isLoading ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    First Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Organization
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "300px",
                        gap: 2,
                      }}
                    >
                      <ConnectWithoutContactIcon
                        sx={{
                          display: "block",
                          margin: "0 auto",
                          fontSize: 100,
                        }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No Client Contact Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You does not have any client contacts
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main, }}>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText,fontWeight: "bold" }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                      Last Name
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                      Email
                    </TableCell>

                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                      Organization
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                      Contacts
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.primary.contrastText, fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                {isLoading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            p: 2,
                          }}
                        >
                          {[...Array(6)].map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                width: "100%",
                                height: "40px",
                                alignItems: "center",
                                gap: 2,
                                animation: "pulse 1.5s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%": {
                                    opacity: 1,
                                  },
                                  "50%": {
                                    opacity: 0.4,
                                  },
                                  "100%": {
                                    opacity: 1,
                                  },
                                },
                              }}
                            >
                              <Skeleton
                                variant="text"
                                width="8%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="20%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="20%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {paginatedStaff?.map((data) => (
                      <TableRow key={data.ROWID}>
                        <TableCell>
                          {"Cl" + data.ROWID?.substr(data.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{data.First_Name}</TableCell>

                        <TableCell>{data.Last_Name}</TableCell>
                        <TableCell>{data.Email}</TableCell>
                        <TableCell>{data.Org_Name}</TableCell>
                        <TableCell>{data.Phone}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {/* Switch with label */}
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={data.status}
                                  onChange={() =>
                                    toggleUserActive(
                                      data.UserID,
                                      !data.status,
                                      data.ROWID
                                    )
                                  } // Toggle the status
                                />
                              }
                              // label={data.status ? true : false} // Display label based on status
                            />

                            {/* Delete Icon */}
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(data)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredStaff?.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </Grid>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => toggleDrawer(false)}
        >
          <Box
            sx={{
              width: 400,
              padding: 2,
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
              marginTop: "70px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                marginBottom: 2,
              backgroundColor: theme.palette.primary.main,
                boxShadow: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", color: "#fff" }}
              >
                <ContactsOutlinedIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Add New Client Contact
                </Typography>
              </Box>
              <Tooltip title="Close">
                <IconButton
                  onClick={() => toggleDrawer(false)}
                  sx={{
                    color: "#fff",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.2)",
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />

            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              // error={!!errors.last_name}
              // helperText={errors.last_name}
            />

            <TextField
              label="Email"
              name="email"
              fullWidth
              variant="outlined"
              type="email"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Organization"
              name="organization"
              fullWidth
              variant="outlined"
              select
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.organization}
              helperText={errors.organization}
            >
              {client?.map((organization) => (
                <MenuItem key={organization.ROWID} value={organization.ROWID}>
                  {organization.Org_Name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Contact Number"
              name="mobile"
              fullWidth
              variant="outlined"
              type="text"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.mobile}
              helperText={errors.mobile}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ width: 100 }}
                      disabled={addLoading}

              >
                {addLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Submit"
                    )}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => toggleDrawer(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Drawer>

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
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              width: "100%",
              maxWidth: "500px",
              borderRadius: "8px",
            },
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
            {"Delete Staff "}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete Staff{" "}
              <strong>
                {ContactToDelete?.First_Name} {ContactToDelete?.Last_Name}
              </strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button
              onClick={handleDeleteCancel}
              variant="outlined"
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              autoFocus
                    disabled={deleteLoading}

            >
              {deleteLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Delete"
                  )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
