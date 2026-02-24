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
  Avatar,
  Modal,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { FaProjectDiagram } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import { useSelector,dispatch, useDispatch } from "react-redux";
import axios from "axios";
import { fetchContactData } from "../redux/contacts/contactSlice";
import { fetchContactProject } from "../redux/contacts/contactProjectSlice";
import { fetchContact } from "../redux/contacts/contactsSlice";
const ClientStaff = () => {
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [staff, setStaff] = useState([]);
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
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

  const [org, setorg] = useState([]);
  const theme = useTheme();
  const colors = {
    primary: theme.palette.primary.main,
    primaryLight: theme.palette.primary.light,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    successLight: theme.palette.success.light,
    warning: theme.palette.warning.main,
    warningLight: theme.palette.warning.light,
    error: theme.palette.error.main,
    errorLight: theme.palette.error.light,
    info: theme.palette.info.main,
    infoLight: theme.palette.info.light,
  };

  const dispatch = useDispatch();

  const {data} = useSelector((state)=> state.contactReducer);
  const {data:contactData, isLoading} = useSelector((state)=> state.contactsReducer);
  


    useEffect(() => {
      const fetchAllData = async () => {
        try {
          const user = JSON.parse(localStorage.getItem("currUser"));
          const userid = user.userid;
        
    
          let contactDataResult = data;
         
          if (!data || data.length === 0) {
           
            const resultAction = await dispatch(fetchContactData(userid)).unwrap();
            contactDataResult = resultAction;
          }
         
          if (!contactDataResult || contactDataResult.length === 0) return;
    
          const contactDetail = contactDataResult[0]?.Client_Contact;
          const orgId = contactDetail?.OrgID;
          if (!orgId) return;
    
          // ❗ Check if projectData is undefined or an empty array
          if (!contactData || (Array.isArray(contactData) && contactData.length === 0)) {
            await dispatch(fetchContact(orgId)).unwrap();
          }
    
        } catch (error) {
          console.error("Error loading data:", error);
        }
      };
    
      fetchAllData();
    }, [dispatch]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
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
      const selectedOption = org.find((option) => option.id === value);
      if (selectedOption) {
        setNewClientStaff((prev) => ({
          ...prev,
          organization: selectedOption.name,
          orgId: selectedOption.id,
        }));
      }
    } else setNewClientStaff((prev) => ({ ...prev, [name]: value }));

  };

  const handleAddClientStaff = async () => {
    if (
      newClientStaff.firstName &&
      newClientStaff.lastName &&
      newClientStaff.email &&
      newClientStaff.mobile &&
      newClientStaff.organization &&
      newClientStaff.orgId
    ) {

      try {
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


        // Ensure user details are correctly received
        const userDetails = response.data.data;
        if (!userDetails) {
          throw new Error("User details not found in response.");
        }

        // Update employees state
        setStaff((prev) => {
          const updatedStaff = [...prev, userDetails];
          return updatedStaff;
        });

        // Show success alert
        handleAlert("success", "Employee Added and confirmed.");

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
      }
    } else {
      handleAlert("error", "Please fill all fields");
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredStaff = contactData?.filter(
    (stf) =>
      // return(
      stf.First_Name &&
      stf.First_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSubmit = () => {
    // if (validateForm()) {
    handleAddClientStaff(newClientStaff);
    //   toggleDrawer(false);
    // }

  };

  return (
    <>
      <Box sx={{ padding: 3 }}>
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${colors.primary}88, ${colors.info}88)`,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
              backgroundSize: "15px",
            }}
          />
          <CardContent sx={{ py: 4, px: 3, position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                rowGap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: colors.primary,
                    width: 60,
                    height: 60,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <SupervisorAccountIcon fontSize="large" />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h4" fontWeight="bold">
                    Contacts
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Search Client "
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearch}
                sx={{ width: "40%" }}
              />
            </Box>
          </CardContent>
        </Card>

        <Grid item xs={12}>
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
          ) : paginatedStaff?.length === 0 ? (
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
                  <TableRow sx={{ backgroundColor: "#1976d2" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Last Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Email
                    </TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Organization
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Contacts
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
                    {paginatedStaff.map((data) => (
                      <TableRow key={data.ROWID}>
                        <TableCell>
                          {"Cl" + data.ROWID?.substr(data.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{data.First_Name}</TableCell>

                        <TableCell>{data.Last_Name}</TableCell>
                        <TableCell>{data.Email}</TableCell>
                        <TableCell>{data.Org_Name}</TableCell>
                        <TableCell>{data.Phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredStaff.length}
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
                marginBottom: 2,
              }}
            >
              <Typography variant="h5">Add Client Contact</Typography>
              <IconButton onClick={() => toggleDrawer(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              // error={!!errors.first_name}
              // helperText={errors.first_name}
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
              // error={!!errors.email_id}
              // helperText={errors.email_id}
            />

            <TextField
              label="Organization"
              name="organization"
              fullWidth
              variant="outlined"
              select
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
            >
              {org.map((organization) => (
                <MenuItem key={organization.id} value={organization.id}>
                  {organization.name}
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
              // error={!!errors.email_id}
              // helperText={errors.email_id}
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
              >
                Submit
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
      </Box>
    </>
  );
};

export default ClientStaff;
