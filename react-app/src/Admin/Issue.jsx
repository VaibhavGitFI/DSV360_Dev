import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  alpha,
  TableFooter,
  TablePagination,
  IconButton,
  Drawer,
  MenuItem,
  useTheme,
  Chip,
  Autocomplete,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Modal,
  Snackbar,
  ListItemIcon,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  CircularProgress,
} from "@mui/material";
import { FaUsers } from "react-icons/fa";
import Slide from "@mui/material/Slide";
import { FormControl, InputLabel, Select } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import BugReportIcon from "@mui/icons-material/BugReport";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { FaBug } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssueData } from "../redux/Client/issueSlice";
import { issuesActions } from "../redux/Client/issueSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import CloseIcon from "@mui/icons-material/Close";
import { BugReport } from "@mui/icons-material";
import Badge from "@mui/material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import ReportIcon from "@mui/icons-material/Report";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

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
  "Work In Progress": {
    color: "#0d6efd",
    backgroundColor: "#cfe2ff",
    borderColor: "#b6d4fe",
  },
  Closed: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    borderColor: "#f5c2c7",
  },
};

const getStatusColor = (status) => {
  switch (status) {
    case "Closed":
      return "success";
    case "Work In Progress":
      return "warning";
    case "Open":
      return "error";
    default:
      return "default";
  }
};

export const Issues = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // Manage Popover state
  const [attachementAnchorEl, setAttachementAnchorEl] = useState(null); // Manage Popover state for attachments
  const [selectedAssignees, setSelectedAssignees] = useState([]); // Store assignees
  const [previewURLs, setPreviewURLs] = useState([]);

  const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const[deleteLoading, setDeleteLoading] = useState(false);
const [highlightedIssueId, setHighlightedIssueId] = useState(null);

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
  const [filter, setFilter] = useState("all"); // "all" or "unassigned"

  const [currUser, setCurrUser] = useState({});
  const [open, setOpen] = useState(false);
  const [issueDetail, setIssueDetail] = useState(null);
  const [fileList, setFileList] = useState([]);
  const Projects = useSelector((state) => state.projectReducer);
  const Employees = useSelector((state) => state.employeeReducer);


  const dispatch = useDispatch();

  const { data, isLoading } = useSelector((state) => state.issueReducer);
 

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currUser"));
    setCurrUser(user);

    if (!Array.isArray(data) || data?.length === 0) {
      dispatch(fetchIssueData());
    }
    if (!Array.isArray(Employees.data) || Employees.data?.length === 0) {
      dispatch(fetchEmployees());
    }
    if (!Array.isArray(Projects.data) || Projects.data?.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // Prevent duplicates by file name (optional)
    const filteredNewFiles = newFiles.filter(
      (newFile) => !selectedFiles.some((file) => file.name === newFile.name)
    );

    const updatedFiles = [...selectedFiles, ...filteredNewFiles];
    setSelectedFiles(updatedFiles);

    const newPreviews = filteredNewFiles?.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
    setPreviewURLs((prev) => [...prev, ...newPreviews]);

    // Reset input value to allow selecting the same file again if needed
    e.target.value = "";
  };

  const handleAttachementOpen = (e, filesString) => {
    e.stopPropagation();
    setAttachementAnchorEl(e.currentTarget);

    const files = (filesString || "")
      ?.split(",")
      ?.map((url) => url.trim())
      .filter(Boolean);

    setFileList(files);
  };

  const handleAttachementClose = (e) => {
    e.stopPropagation();
    setAttachementAnchorEl(null);
  };
  

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previewURLs];
    newPreviews.splice(index, 1);
    setPreviewURLs(newPreviews);
  };

  // Handle Popover open
  const handleAssigneeClick = (event, assignTo) => {
    setAnchorEl(event.currentTarget); // Set the Popover anchor element
    setSelectedAssignees(assignTo?.split(",")); // Split the assignees string by commas
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  // Close the Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const validateForm = () => {
    let newErrors = {};

    // If editing an issue
    if (currentIssue) {
      if (!currentIssue.Project_ID)
        newErrors.Project_ID = "Project is required";
      if (!currentIssue.Issue_name)
        newErrors.Issue_name = "Issue name is required";
      if (!currentIssue.Assignee_ID)
        newErrors.Assignee_ID = "At least one user must be assigned";
      if (!currentIssue.Status) newErrors.Status = "Status is required";
      if (!currentIssue.Severity) newErrors.Severity = "Severity is required";
      if (!currentIssue.Due_Date) newErrors.Due_Date = "Due date is required";
    }
    // If creating a new issue
    else {
      if (!newIssue.Project_ID) newErrors.Project_ID = "Project is required";
      if (!newIssue.Issue_name) newErrors.Issue_name = "Issue name is required";
      if (!newIssue.Assignee_ID)
        newErrors.Assignee_ID = "At least one user must be assigned";
      if (!newIssue.Status) newErrors.Status = "Status is required";
      if (!newIssue.Severity) newErrors.Severity = "Severity is required";
      if (!newIssue.Due_Date) newErrors.Due_Date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const issueFields = [
    [
      "Issue ID",
      "I" + issueDetail?.ROWID?.slice(-4),
      <BugReportIcon color="primary" />,
    ],
    ["Issue Name", issueDetail?.Issue_name, <AssignmentIcon color="primary" />],
    [
      "Description",
      issueDetail?.Description,
      <DescriptionIcon color="primary" />,
    ],
    [
      "Project Name",
      issueDetail?.Project_Name,
      <AssignmentIcon color="primary" />,
    ],
    ["Assignee", issueDetail?.Assignee_Name, <PersonIcon color="primary" />],
    ["Reporter", issueDetail?.Reporter_Name, <ReportIcon color="primary" />],
    ["Severity", issueDetail?.Severity, <PriorityHighIcon color="primary" />],
    ["Due Date", new Date(issueDetail?.Due_Date).toLocaleDateString("en-GB"), <EventIcon color="primary" />],
    ["Status", issueDetail?.Status, <DoneAllIcon color="primary" />],
    [
      "Description",
      issueDetail?.Description,
      <DescriptionIcon color="primary" />,
    ],
  ];

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredissue = data?.filter((issue) => {
    const matchesSearch = issue?.Issue_name?.toLowerCase().includes(
      searchQuery?.toLowerCase() || ""
    );

    const matchesAssignee =
      filter === "all"
        ? true
        : !issue?.Assignee_Name || issue?.Assignee_Name === "";

    return matchesSearch && matchesAssignee;
  });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

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
      const selectedOption = Projects?.data?.find(
        (option) => option.ROWID === value
      );

      if (selectedOption) {
        setnewIssue((prev) => ({
          ...prev,
          Project_Name: selectedOption.Project_Name,
          Project_ID: value,
        }));
      }
    }

    // Handle Assignee selection (multiple selection)
    else if (name === "AssigneeID") {
      const selectedAssignees = Employees?.data?.filter(
        (employee) => value.includes(employee.user_id) // Check if the employee's user_id is selected
      );

      const assigneeIDs = selectedAssignees
        ?.map((employee) => employee.user_id)
        .join(","); // Join selected IDs as comma-separated string
      const assigneeNames = selectedAssignees
        ?.map((employee) => `${employee.first_name} ${employee.last_name}`)
        .join(","); // Join selected names as comma-separated string

      setnewIssue((prev) => ({
        ...prev,
        Assignee_Name: assigneeNames, // Store names as comma-separated string
        Assignee_ID: assigneeIDs, // Store IDs as comma-separated string
      }));
    }

    // For all other inputs, just update the state
    else {
      setnewIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handeEditsubmit = () => {
    if (validateForm()) {
      handleUpdateIssue();
    }
  };

  const handleUpdateIssue = async () => {
    setUpdateLoading(true);
    const ROWID = currentIssue.ROWID;
   
    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/issue/${ROWID}`,
      {
        Status: currentIssue.Status,
        Description: currentIssue.Description,
        Due_Date: currentIssue.Due_Date,
        Issue_name: currentIssue.Issue_name,
        Project_ID: currentIssue.Project_ID,
        Severity: currentIssue.Severity,
        Project_Name: currentIssue.Project_Name,
        Assignee_ID: currentIssue.Assignee_ID,
        Assignee_Name: currentIssue.Assignee_Name,
      }
    );

    if (updateResponse.status === 200) {
      dispatch(issuesActions.updateIssueData(currentIssue));
      handleAlert("success", "Issue updated and confirmed.");
      setUpdateLoading(false);
    }

    // setIssue((prev) =>
    //   prev?.map((task) => (task.id === currentIssue.ROWID ? currentIssue : task))
    // );
    setCurrentIssue("");
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
   
    if (name === "Project_Name") {
      const selectedOption = Projects?.data?.find(
        (option) => option.ROWID === value
      );

      if (selectedOption) {
        setCurrentIssue((prev) => ({
          ...prev,
          Project_Name: selectedOption.Project_Name,
          Project_ID: selectedOption.ROWID,
        }));
      }
    } else if (name === "Assignee_ID") {
      const selectedValues = event.target.value;
      const selectedUsernames = selectedValues
        ?.map((id) => {
          const user = Employees?.data?.find((option) => option.user_id === id);
          return user ? user.first_name + " " + user.last_name : "";
        })
        .filter((name) => name)
        .join(",");

      setCurrentIssue((prev) => ({
        ...prev,
        Assignee_Name: selectedUsernames,
        Assignee_ID: selectedValues.join(","),
      }));
    } else {
      setCurrentIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDeleteClick = (issueId) => {
    setIssueToDelete(issueId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    // setProjectToDelete(null);
  };

  const handleAddIssue = async () => {
    try {
      setAddLoading(true);


      const formData = new FormData();

      // Append selected files
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Add reporter info
      formData.append("Reporter_ID", currUser.userid);
      formData.append(
        "Reporter_Name",
        `${currUser.firstName} ${currUser.lastName}`
      );

      // Append all required issue fields
      formData.append("Issue_name", newIssue.Issue_name);
      formData.append("Description", newIssue.Description);
      formData.append("Status", newIssue.Status);
      formData.append("Severity", newIssue.Severity);
      formData.append("Due_Date", newIssue.Due_Date);
      formData.append("Project_ID", newIssue.Project_ID);
      formData.append("Project_Name", newIssue.Project_Name.trim());
      formData.append("Assignee_Name", newIssue.Assignee_Name);
      formData.append("Assignee_ID", newIssue.Assignee_ID);

      const response = await axios.post(
        "/server/time_entry_management_application_function/issue",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;

      if (result.success) {
        handleCancel();
        handleAlert("success", "Issue added successfully");
        dispatch(issuesActions.addissueData(result.data));
        
         setHighlightedIssueId(result.data.ROWID);
        setTimeout(() => setHighlightedIssueId(null), 5000); 
        // Reset form
        setnewIssue({
          Status: "",
          Description: "",
          Due_Date: "",
          Issue_name: "",
          Project_ID: "",
          Severity: "",
          Project_Name: "",
          Reporter_ID: "",
          Assignee_ID: "",
          Reporter_Name: "",
          Assignee_Name: "",
        });
        setSelectedFiles([]);
      } else {
        handleAlert("error", result.message || "Failed to add issue");
      }
    } catch (error) {
      console.error("Error adding issue:", error);
      handleAlert("error", error.message || "Error adding issue");
    }finally{
      setAddLoading(false);
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

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      const response = await axios.delete(
        `/server/time_entry_management_application_function/issue/${issueToDelete}`
      );


      if (response.status === 200) {
        handleAlert("success", "Issue  Deleted and confirmed.");
        dispatch(issuesActions.deleteissueData(issueToDelete));
        setDeleteConfirmOpen(false);
      }
    } catch (error) {
      handleAlert("error", "something went wrong");
      console.error("Error deleting issue:", error);
    }finally{
      setDeleteLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEdit = (isue) => {
    setCurrentIssue(isue);
    setEditModalOpen(true);
  };

  const handleDetailDrwaer = (e, isue) => {
    setOpen(true);

    setIssueDetail(isue);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
  };

  return (
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
            <BugReportIcon sx={{ color: "#fff" }} fontSize="large" />
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
            Issues
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
            label="Search Issues"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              width: { xs: "100%", sm: "60%", md: "250px" },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select label="Filter" value={filter} onChange={handleFilterChange}>
              <MenuItem value="all">All Issues</MenuItem>
              <MenuItem value="unassigned">Unassigned Only</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={() => toggleDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Submit Issue
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
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
                    Project
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
                      {[...Array(6)]?.map((_, index) => (
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
          ) : filteredissue?.length === 0 ? (
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
                    Project
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
                      Project
                    </TableCell>
                    {/* <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Reporter
                    </TableCell> */}

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
                      Actions
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Attachements
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
                          {[...Array(6)]?.map((_, index) => (
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
                ) : paginatedissue?.length === 0 ? (
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
                          {[...Array(6)]?.map((_, index) => (
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
                      <TableRow
                        key={isue.id}
                        // sx={{
                        //   backgroundColor:
                        //     !isue.Assignee_Name ||
                        //     isue.Assignee_Name?.split(",").filter(
                        //       (name) => name.trim() !== ""
                        //     )?.length === 0
                        //       ? "#e9ff32"
                        //       : "inherit",
                        // }}
                        onClick={(e) => handleDetailDrwaer(e, isue)}
                        // sx={{
                        //   cursor: "pointer",
                        //   "&:hover": {
                        //     backgroundColor:
                        //       theme.palette.mode === "light"
                        //         ? "#e3f2fd"
                        //         : theme.palette.primary.dark,
                        //     color: theme.palette.primary.contrastText,
                        //   },
                        // }}
                                         sx={{
      cursor: "pointer",
      backgroundColor:
        highlightedIssueId === isue.ROWID
          ? theme.palette.mode === "light"
            ? "#e3f2fd" // same as hover in light mode
            : theme.palette.primary.dark // same as hover in dark mode
          : "inherit",
      color:
        highlightedIssueId === isue.ROWID
          ? theme.palette.primary.contrastText
          : "inherit",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "light"
            ? "#e3f2fd"
            : theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
      },
      transition: "background-color 0.3s ease",
    }}
                      >
                        <TableCell>
                          {"I" + isue.ROWID.substr(isue.ROWID?.length - 4)}
                        </TableCell>
                        <TableCell>
                          {isue.Issue_name?.length > 30 ? (
                            <Tooltip title={isue.Issue_name}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  maxWidth: 100,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                }}
                              >
                                {isue.Issue_name}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <>{isue.Issue_name}</>
                          )}
                        </TableCell>
                        <TableCell>{isue.Project_Name}</TableCell>
                        {/* <TableCell>{isue.Reporter_Name}</TableCell> */}
                        <TableCell>{new Date(isue.CREATEDTIME?.split(" ")[0]).toLocaleDateString("en-GB")}</TableCell>
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

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="View Assignees">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAssigneeClick(e, isue.Assignee_Name)
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers
                                style={{
                                  color:
                                    isue.Assignee_Name?.length === 0
                                      ? "red"
                                      : theme.palette.primary.main,
                                }}
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {isue.Assignee_Name
                                  ? isue.Assignee_Name?.split(",").filter(
                                      (name) => name.trim() !== ""
                                    )?.length
                                  : 0}
                              </Typography>
                            </IconButton>
                          </Tooltip>

                          <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClosePopover}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            <List
                              sx={{
                                minWidth: 200,
                                maxWidth: 300,
                                p: 1,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: theme.shadows[2],
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  px: 2,
                                  py: 1,
                                  color: theme.palette.text.secondary,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                {selectedAssignees?.length === 1 &&
                                selectedAssignees[0] === ""
                                  ? "Please Assigne User"
                                  : "Assigned User"}
                              </Typography>
                              {selectedAssignees?.map((assignee, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={assignee}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Popover>
                        </TableCell>

                        {/* <TableCell>{isue.assignTo}</TableCell> */}
                        <TableCell>{new Date(isue.Due_Date).toLocaleDateString("en-GB")}</TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
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

                        <TableCell align="center">
                          <Tooltip title={
      isue.Files && isue.Files.trim() !== ""
        ? "View Attachments"
        : "No Attachments"
    } arrow>
                            <IconButton
                              onClick={(e) =>
                                handleAttachementOpen(e, isue.Files)
                              }
                              aria-label="View Attachments"
                              size="large"
                            >
                              <Badge
                                badgeContent={
                                  isue.Files
                                    ? isue.Files?.split(",").filter(
                                        (file) => file.trim() !== ""
                                      )?.length
                                    : 0
                                }
                                color="primary"
                                overlap="circular"
                              >
                                <AttachFileIcon
                                  sx={{
                                    color: "#1976d2",
                                    fontSize: 30,
                                  }}
                                />
                              </Badge>
                            </IconButton>
                          </Tooltip>

                          <Popover
                            open={Boolean(attachementAnchorEl)}
                            anchorEl={attachementAnchorEl}
                            onClose={handleAttachementClose}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                            PaperProps={{
                              sx: {
                                padding: 1,
                                minWidth: 200,
                                maxWidth: 300,
                              },
                            }}
                          >
                            <List dense>
                              {fileList?.length > 0 ? (
                                fileList?.map((url, index) => (
                                  <ListItem
                                    key={`${url}-${index}`}
                                    component="a"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDrawerOpen(false);
                                    }}
                                    sx={{
                                      textDecoration: "none",
                                      "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                                      },
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{ minWidth: 30, marginRight: 1 }}
                                    >
                                      <InsertDriveFileIcon color="action" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={`File ${index + 1}`}
                                      sx={{
                                        color: "#1976d2",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    />
                                  </ListItem>
                                ))
                              ) : (
                                <ListItem>
                                  <ListItemText
                                    primary="No attachments available"
                                    sx={{
                                      color: "text.secondary",
                                      fontStyle: "italic",
                                    }}
                                  />
                                </ListItem>
                              )}
                            </List>
                          </Popover>
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
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <BugReport sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New Issue
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
            select
            fullWidth
            label="Project"
            name="Project"
            value={newIssue.Project_ID}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Project_ID}
            helperText={errors.Project_ID}
          >
            {Projects?.data?.map((project) => (
              <MenuItem key={project.ROWID} value={project.ROWID}>
                {project.Project_Name}
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

          <Autocomplete
            multiple
            options={Employees?.data}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name}`
            } // Show full name of the employee
            value={Employees?.data?.filter((employee) =>
              Array.isArray(newIssue.Assignee_ID)
                ? newIssue.Assignee_ID.includes(employee.user_id) // If Assignee_ID is an array
                : typeof newIssue.Assignee_ID === "string"
                  ? newIssue.Assignee_ID?.split(",").includes(employee.user_id) // If Assignee_ID is a comma-separated string
                  : []
            )}
            onChange={(event, newValue) => {
              const selectedValues = newValue; // Array of selected employees

              const selectedIDs = selectedValues?.map(
                (option) => option.user_id
              ); // Collect user IDs
              const selectedNames = selectedValues?.map(
                (option) => `${option.first_name} ${option.last_name}`
              ); // Collect employee names

              // Update Assignee_ID with comma-separated user IDs
              handleInputChange({
                target: {
                  name: "Assignee_ID",
                  value: selectedIDs.join(","),
                },
              });

              // Optionally, store the selected names as a comma-separated string if needed
              handleInputChange({
                target: {
                  name: "Assignee_Name",
                  value: selectedNames.join(","),
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assignee"
                name="AssigneeID"
                fullWidth
                error={!!errors.Assignee_ID}
                helperText={errors.Assignee_ID}
                sx={{ marginBottom: 2 }}
              />
            )}
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

          <Box sx={{ marginBottom: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<AttachFileIcon />}
              sx={{ marginBottom: 1 }}
            >
              Add Attachment
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileChange} // Your file handler
              />
            </Button>

            {selectedFiles?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {selectedFiles?.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                      p: 1,
                      border: "1px solid #ccc",
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {file.type.startsWith("image/") && previewURLs[index] ? (
                        <img
                          src={previewURLs[index]}
                          alt={file.name}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <DescriptionIcon sx={{ fontSize: 30 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFile(index)} // Your remove function
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
                                 "Add"
                               )}
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
          <Typography id="edit-task-modal" color={theme.palette.text.primary}  variant="h6" sx={{ mb: 2 }}>
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
                error={!!errors.Issue_name}
                helperText={errors.Issue_name}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Project"
                name="Project_Name"
                fullWidth
                select
                value={currentIssue.Project_ID}
                onChange={handleEditInputChange}
                error={!!errors.Project_ID}
                helperText={errors.Project_ID}
                sx={{ mb: 2 }}
              >
                {Projects?.data?.map((option) => (
                  <MenuItem key={option.ROWID} value={option.ROWID}>
                    {option.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Assignee"
                name="Assignee_ID"
                fullWidth
                select
                SelectProps={{ multiple: true }}
                value={
                  currentIssue.Assignee_ID
                    ? currentIssue.Assignee_ID?.split(",")
                    : []
                }
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {Employees?.data?.map((option) => (
                  <MenuItem key={option.user_id} value={option.user_id}>
                    {option.first_name} {option.last_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Status"
                name="Status"
                value={currentIssue.Status}
                onChange={handleEditInputChange}
                error={!!errors.Status}
                helperText={errors.Status}
                sx={{ mb: 2 }}
              >
                {["Open", "Work In Progress", "Closed"]?.map((status) => (
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
                value={currentIssue.Due_Date}
                onChange={handleEditInputChange}
                error={!!errors.Due_Date}
                helperText={errors.Due_Date}
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
                error={!!errors.severity}
                helperText={errors.severity}
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
                  onClick={handeEditsubmit}
                 disabled={updateLoading}

                >
                   {updateLoading ? (
                                     <CircularProgress size={24} color="inherit" />
                                   ) : (
                                     "Update"
                                   )}
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

      <Drawer anchor="right" open={open} onClose={handleCloseDrawer}>
        <Box
          sx={{
            width: 420,
            mt: "65px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "#fff",
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <Typography variant="h6">Issue Details</Typography>
            <IconButton onClick={handleCloseDrawer} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {isLoading ? (
            <Box px={3} py={2}>
              <Typography>Loading issue details...</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {issueFields?.map(([label, value, icon], index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 3, py: 1.5 }}>
                    <ListItemIcon sx={{ color: "primary.main" }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {label}
                        </Typography>
                      }
                      secondary={
                        label === "Status" ? (
                          <Chip
                            label={value}
                            color={getStatusColor(value)}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        ) : (
                          <Typography
                            color="text.secondary"
                            sx={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            {value}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  {index !== issueFields?.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
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
  );
};
