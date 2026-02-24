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
  TableFooter,
  TablePagination,
  IconButton,
  Avatar,
  Drawer,
  MenuItem,
  useTheme,
  Chip,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { FaBug } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import BugReportIcon from "@mui/icons-material/BugReport";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactData } from "../redux/contacts/contactSlice";
import { fetchContactIssues, issuesActions } from "../redux/contacts/contactIssueSlice";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { fetchContactProject } from "../redux/contacts/contactProjectSlice";
const statusConfig = {
  Open: {
    color: "#f0ad4e",
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
  },
  "In Progress": {
    color: "#0d6efd",
    backgroundColor: "#cfe2ff",
    borderColor: "#b6d4fe",
  },
  Completed: {
    color: "#198754",
    backgroundColor: "#d1e7dd",
    borderColor: "#badbcc",
  },
  "Work In Process": {
    color: "#0d6efd",
    backgroundColor: "#cfe2ff",
    borderColor: "#b6d4fe",
  },
  Close: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    borderColor: "#f5c2c7",
  },
};

const ContactIssues = () => {
  const theme = useTheme();
  const location = useLocation();

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

  const { projectName } = location.state || {}; // Access projectId from state
  const [issue, setIssue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [project, setProject] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orgID, setorgId] = useState("");
  const [orgName, setOrgName] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
      const [issueToDelete, setIssueToDelete] = useState(null);
    
  
 const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState("");

  const [newIssue, setnewIssue] = useState({
    Status: "",
    Description: "",
    Due_Date: "",
    Issue_name: "",
    Project_ID: "",
    Severity: "",
    Project_Name: " ",
    Reporter_ID: "",
    Assignee_ID: "",
    Reporter_Name: " ",
    Assignee_Name: "",
  });
  const [currUser, setCurrUser] = useState({});
  const {data:projectData} = useSelector((state)=> state.contactProjectReducer);

  const dispatch = useDispatch();

    const {data} = useSelector((state)=> state.contactReducer);
    const {data:issueData, isLoading} = useSelector((state)=> state.contactIssueReducer);

   useEffect(() => {
        const fetchAllData = async () => {
          try {
            const user = JSON.parse(localStorage.getItem("currUser"));
            const userid = user.userid;
            setCurrUser(user);
      
            let contactDataResult = data;
        
            if (!data || data.length === 0) {
            
              const resultAction = await dispatch(fetchContactData(userid)).unwrap();
              contactDataResult = resultAction;
            }
            if (!contactDataResult || contactDataResult.length === 0) return;
      
            const contactDetail = contactDataResult[0]?.Client_Contact;
            const orgId = contactDetail?.OrgID;
            if (!orgId) return;
            
          setorgId(orgId);
           setOrgName(contactDetail?.Org_Name);
           
            if (!issueData || (Array.isArray(issueData) && issueData.length === 0)) {
              await dispatch(fetchContactIssues(orgId)).unwrap();
            }

            if (!projectData || (Array.isArray(projectData) && projectData.length === 0)) {
                        await dispatch(fetchContactProject(orgId)).unwrap();
                        
                      }
           
              
                     
            
            
      
          } catch (error) {
            console.error("Error loading data:", error);
          }
        };
      
        fetchAllData();
      }, [dispatch]);



  const [anchorEl, setAnchorEl] = useState(null); // Manage Popover state
  const [selectedAssignees, setSelectedAssignees] = useState([]); // Store assignees

  // Handle Popover open
  const handleAssigneeClick = (event, assignTo) => {
    setAnchorEl(event.currentTarget); // Set the Popover anchor element
    setSelectedAssignees(assignTo.split(",")); // Split the assignees string by commas
  };

  // Close the Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    
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

  const validateForm = () => {
    let newErrors = {};

    if (!newIssue.Project_ID) newErrors.Project = "Project is required";
    if (!newIssue.Issue_name) newErrors.Issue_name = "Issue name is required";
   
    if (!newIssue.Status) newErrors.Status = "Status is required";
    if (!newIssue.Severity) newErrors.Severity = "Severity is required";
    if (!newIssue.Due_Date) newErrors.Due_Date = "Due Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredissue = issueData?.filter((isue) =>
    isue.Issue_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedissue = filteredissue?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;


    // Handle Project selection
    if (name === "Project") {
      const selectedOption = projectData?.find((option) => option.Projects.ROWID === value);

      if (selectedOption) {
        setnewIssue((prev) => ({
          ...prev,
          Project_Name: selectedOption.Projects.Project_Name,
          Project_ID: value,
        }));
      }
    }

    // For all other inputs, just update the state
    else {
      setnewIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateIssue = async () => {
    const ROWID = currentIssue.id;

    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/issue/${ROWID}`,
      currentIssue
    );

    if(updateResponse.status === 200){
      handleAlert("success", "Issue  Edited successfully.");
      dispatch(issuesActions.updateIssueData(updateResponse.data.data));
    }

    // setIssue((prev) =>
    //   prev.map((task) => (task.id === currentIssue.id ? currentIssue : task))
    // );
    setCurrentIssue("");
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;



    if (name === "Project_Name") {
      const selectedOption = projectData?.find((option) => option.Projects.ROWID === value);
      if (selectedOption) {
        setCurrentIssue((prev) => ({
          ...prev,
          Project_Name: selectedOption.Projects.Project_Name,
          Project_ID: selectedOption.Projects.ROWID,
        }));
      }
    } else {
      setCurrentIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddIssue = async () => {
    newIssue.Reporter_ID = orgID;
    newIssue.Reporter_Name = orgName;
  
  
    try {
      const response = await axios.post(
        "/server/time_entry_management_application_function/issue",
        newIssue
      );
  
  
      if (response.status === 201 && response.data?.data) {
        dispatch(issuesActions.addIssueData(response.data.data));
        handleCancel();
        handleAlert("success", "Issue added successfully");
      } else {
        throw new Error("Invalid response data received");
      }
    } catch (error) {
      handleAlert("error", error.message || "Error adding task");
    }
  };
  

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
   
  };

  const handleCancel = () => {
    setnewIssue({
      Status: "",
      Description: "",
      Due_Date: "",
      Issue_name: "",
      Project_ID: "",
      Severity: "",
      Project_Name: " ",
      Reporter_ID: "",
      Assignee_ID: "",
      Reporter_Name: " ",
      Assignee_Name: "",
    });
    toggleDrawer(false);
  };
  const handleSubmit = () => {
    if (validateForm()) {
    
      handleAddIssue();
    }
  };

  const deleteIssue = async () => {
    try {
      const response = await axios.delete(
        `/server/time_entry_management_application_function/issue/${issueToDelete}`
      );

      if(response.status == 200){
        dispatch(issuesActions.deleteIssueData(issueToDelete));
        handleDeleteCancel()
        handleAlert("success", "Issue  Deleted Successfully .");
      }
      // setIssue((prev) => prev.filter((issue) => issue.id !== issueId));
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleDeleteClick = (issueId) => {
    setIssueToDelete(issueId);
    setDeleteConfirmOpen(true);
  };


  const handleEdit = (isue) => {
    setCurrentIssue(isue);
    setEditModalOpen(true);
  };

  return (
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
                <BugReportIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  Issues
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                alignItems: "center",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                label="Search Issues"
                variant="outlined"
                size="small"
                sx={{ width: { xs: "100%", sm: "250px" } }}
                // value={searchQuery}
                // onChange={handleSearch}
              />

              <Button
                variant="contained"
                color="primary"
                onClick={() => toggleDrawer(true)}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Submit Issue
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
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
                    Issue ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Issue Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Reporter
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Creation Time
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Assignee
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Due Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Severity
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
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
          ) : paginatedissue?.length === 0 ? (
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
                    Issue ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Issue Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Reporter
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Creation Time
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Assignee
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Due Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Severity
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
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
                      <FaBug size={50} color={theme.palette.text.secondary} />
                      <Typography variant="h6" color="text.secondary">
                        No Issue found yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You currently don't created any Issue
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
                  <TableRow
                    sx={{ backgroundColor: theme.palette.primary.main }}
                  >
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Issue ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Issue Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Reporter
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Status
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Severity
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Creation Time
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Due Date
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

                {isLoading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ width: "100%", height: "200px" }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {[...Array(6)].map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1,
                              }}
                            >
                              <Skeleton variant="text" width={80} />
                              <Skeleton variant="text" width={150} />
                              <Skeleton variant="text" width={120} />
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Skeleton
                                  variant="circular"
                                  width={24}
                                  height={24}
                                />
                                <Skeleton variant="text" width={60} />
                              </Box>
                              <Skeleton
                                variant="rectangular"
                                width={100}
                                height={32}
                                sx={{ borderRadius: 1 }}
                              />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : paginatedissue.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0 }}>
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
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="7%"
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
                    {paginatedissue?.map((isue) => (
                      <TableRow key={isue.ROWID}>
                        <TableCell>
                          {"I" + isue.ROWID.substr(isue.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{isue.Issue_name}</TableCell>
                        <TableCell>{isue.Reporter_Name}</TableCell>

                        <TableCell>
                          <Chip
                            label={isue.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[isue.Status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[isue.Status]?.color || "#757575",
                              border: `1px solid ${statusConfig[isue.Status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{isue.Severity}</TableCell>
                        <TableCell>{isue.CREATEDTIME}</TableCell>
                        <TableCell>{isue.Due_Date}</TableCell>

                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(isue)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(isue.ROWID)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredissue?.length}
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
          <Typography variant="h5" sx={{ marginBottom: 3 }}>
            Add Issue
          </Typography>

          <TextField
            select
            fullWidth
            label="Project"
            name="Project"
            value={newIssue.Project_ID}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Project}
            helperText={errors.Project}
          >
            {projectData?.map((project) => (
              <MenuItem key={project.Projects.ROWID} value={project.Projects.ROWID}>
                {project.Projects.Project_Name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Add Issue"
            name="Issue_name"
            fullWidth
            value={newIssue.Issue_name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.Issue_name}
            helperText={errors.Issue_name}
          />

          <TextField
            select
            fullWidth
            label="Status"
            name="Status"
            value={newIssue.Status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Status}
            helperText={errors.Status}
          >
            {["Open", "Work In Progress", "Close"]?.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Due Date"
            name="Due_Date"
            fullWidth
            type="date"
            value={newIssue.Due_Date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.Due_Date}
            helperText={errors.Due_Date}
          />

          <TextField
            select
            fullWidth
            label="Severity"
            name="Severity"
            value={newIssue.Severity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Severity}
            helperText={errors.Severity}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
         
          </TextField>

          <TextField
            label="Add Description"
            name="Description"
            fullWidth
            multiline
            rows={4}
            value={newIssue.Description}
            onChange={handleInputChange}
            sx={{ marginBottom: 3 }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Add
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-task-modal"
        aria-describedby="modal-for-editing-task"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="edit-task-modal" variant="h6" sx={{ mb: 2 }}>
            Edit Issue
          </Typography>

          {currentIssue && (
            <>
              <TextField
                label="Issue Name"
                name="Issue_name"
                fullWidth
                value={currentIssue.Issue_name}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Project"
                name="Project_Name"
                fullWidth
                select
                value={currentIssue.Project_ID || ""}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {projectData?.map((option) => (
                  <MenuItem key={option.Projects.ROWID} value={option.Projects.ROWID}>
                    {option.Projects.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Due Date"
                name="Due_Date"
                fullWidth
                type="date"
                value={currentIssue.Due_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Severity"
                name="Severity"
                value={currentIssue.Severity}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
                error={!!errors.Severity}
                helperText={errors.Severity}
              >
                <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
              </TextField>

              <TextField
                label="Add Description"
                name="Description"
                fullWidth
                multiline
                rows={4}
                value={currentIssue.Description}
                onChange={handleEditInputChange}
                sx={{ marginBottom: 3 }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateIssue}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

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
          {"Delete Issue"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete Issue{" "}
            {/* <strong>{projectToDelete?.name}</strong>? */}
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
            onClick={deleteIssue}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
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

export default ContactIssues;
