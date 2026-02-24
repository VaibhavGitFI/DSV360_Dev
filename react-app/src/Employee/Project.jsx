import React, { useState, useEffect } from "react";
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
  alpha,
  IconButton,
  TableFooter,
  Tooltip,
  Popover,
  Badge,
  TablePagination,
  Drawer,
  MenuItem,
  Modal,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Autocomplete,
  Dialog,
  DialogContentText,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Slide from "@mui/material/Slide";
import TaskIcon from "@mui/icons-material/Task";
import InfoIcon from "@mui/icons-material/Info";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { BugReport } from "@mui/icons-material";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { projectActions } from "../redux/Project/ProjectSlice";

import Skeleton from "@mui/material/Skeleton";
import { FaProjectDiagram } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { fetchEmpProject } from "../redux/EmpProject/EmpProjectSlice";
import { fetchClientData } from "../redux/Client/clientSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { EmpProjectActions } from "../redux/EmpProject/EmpProjectSlice";


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

const getStatusColor = (status) => {
  switch (status) {
    case "Close":
      return "success";
    case "Work In Process":
      return "warning";
    case "Open":
      return "error";
    default:
      return "default";
  }
};

function Project() {
  const [assignOptions, setAssignOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditProject, setCurrentEditProject] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [projectDetail, setprojectdetail] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
   const currUser = JSON.parse(localStorage.getItem("currUser"));
   const [projectToDelete, setProjectToDelete] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   
      const [addLoading, setAddLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const[deleteLoading, setDeleteLoading] = useState(false);
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  


  const [fileList, setFileList] = useState([]);
  const fileOpen = Boolean(anchorEl);

  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { data: projects, isLoading } = useSelector(
    (state) => state.empProjectReducer
  );
  // console.log("pprojects",projects)
  const { data: client } = useSelector((state) => state.clientReducer);
  const { data: employeedata } = useSelector((state) => state.employeeReducer);
  

  const dispatch = useDispatch();
  // Drawer State
  const [newProject, setNewProject] = useState({
    id: "",
    name: "",
    status: "",
    owner: currUser.firstName + " " + currUser.lastName,
    ownerID: currUser.userid,
    startDate: "",
    endDate: "",
    description: "",
    assignedTo: "",
    assignedToID: "",
  });

    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

  const theme = useTheme();

    useEffect(() => {
      if (employeedata) {
        // Check if employeedata is available before filtering
        const employee = employeedata
          .filter(
            (employee) =>
              employee.role_details.role_name !== "Contacts" &&
              employee.role_details.role_name !== "Super Admin"
          )
          .map((employee) => ({
            username: `${employee.first_name} ${employee.last_name}`,
            userID: employee.user_id,
            role: employee.role_details.role_name,
          }));
        // console.log("employee", employee);
        setAssignOptions(employee);
      }
    }, [employeedata]);
  useEffect(() => {
    const fetchAllData = async () => {
      if (!Array.isArray(projects) || projects.length === 0) {
        dispatch(fetchEmpProject());
      }
        if (!Array.isArray(client) || client.length === 0) {
            dispatch(fetchClientData());
          }
          if (!Array.isArray(employeedata) || employeedata.length === 0) {
            dispatch(fetchEmployees());
          }
    };
    fetchAllData();
  }, [dispatch]);

  
  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };


  
    const handleAttachementCloseSnackbar = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbar((prev) => ({ ...prev, open: false }));
    };
  
    function SlideTransition(props) {
      return <Slide {...props} direction="down" />;
    }
  const handleAttachementOpen = (e, filesString) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);

    const files = (filesString || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    setFileList(files);
  };

  const handleAttachementClose = (e) => {
    e.stopPropagation();
    setAnchorEl(null);
  };

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

  const filteredProjects = projects.filter(
    (project) =>
      project.Projects.Project_Name &&
      project.Projects.Project_Name.toLowerCase().includes(
        searchQuery.toLowerCase()
      )
  );

  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Drawer Handlers
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    // console.log("Value changed:", name, value);
    setCurrentEditProject((prev) => ({ ...prev, [name]: value }));

    if (name === "assignedTo") {
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      // console.log(selectedOption);

      if (selectedOption) {
        // Update the state with username and userID
        setCurrentEditProject((prev) => ({
          ...prev,
          assignedTo: selectedOption.username,
          assignedToID: selectedOption.userID,
        }));
      }
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlefiltetActive = (project) => {
    // console.log("Project = ", project);

    navigate("/task", {
      state: {
        projectId: project.Projects.ROWID,
        projectName: project.Projects.Project_Name,
      },
    });
    const pathname = "/tasks";
  };

  const handleShowIssue = (project) => {
    navigate("/bug", {
      state: { projectId: project.Projects.ROWID },
    });
  };
  const handleCloseDrawer = () => {
    setOpen(false);
  };
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
  const fields = [
    [
      "Project ID",
      "P" + projectDetail?.ROWID?.slice(-4),
      <InfoIcon color="primary" />,
    ],
    [
      "Project Name",
      projectDetail?.Project_Name,
      <AssignmentIcon color="primary" />,
    ],
    ["Assigned To", projectDetail?.Assigned_To, <PersonIcon color="primary" />],
    [
      "Client Name",
      projectDetail?.Client_Name ?? "Internal Project",
      <BusinessIcon color="primary" />,
    ],
    ["Start Date", new Date(projectDetail?.Start_Date).toLocaleDateString("en-GB"), <EventIcon color="primary" />],
    ["End Date", new Date(projectDetail?.End_Date).toLocaleDateString("en-GB"), <ScheduleIcon color="primary" />],
    ["Status", projectDetail?.Status, <TrackChangesIcon color="primary" />],
    ["Owner", projectDetail?.Owner, <EmojiEventsIcon color="primary" />],
    [
      "Description",
      projectDetail?.Description,
      <DescriptionIcon color="primary" />,
    ],
  ];

  const handleDetailDrwaer = (e, project) => {
    setOpen(true);
    // console.log("name of the project", project);
    setprojectdetail(project);
  };

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    // console.log("name", name);
    // console.log("value", value);
    if (name === "assignedToID") {
      // Find the selected option by matching userID
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      if (selectedOption) {
        // Update the state with username and userID
        setNewProject((prev) => ({
          ...prev,
          assignedTo: selectedOption.username, // Display the username in the field
          assignedToID: selectedOption.userID, // Use the userID for the backend logic
        }));
      }
    } else if (name === "clientID") {
      const selectedClient = client?.find((option) => option.ROWID === value);
      // console.log("selected client", selectedClient);

      if (selectedClient) {
        setNewProject((prev) => ({
          ...prev,
          client_name: selectedClient.Org_Name,
          clientID: selectedClient.ROWID,
        }));
      }
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    const newPreviews = files.map((file) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );

    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewURLs((prev) => [...prev, ...newPreviews]);
  };
  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    const updatedPreviews = [...previewURLs];

    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);

    setSelectedFiles(updatedFiles);
    setPreviewURLs(updatedPreviews);
  };
  const validate = () => {
    let tempErrors = {};
    if (!newProject.name || newProject.name.length < 3)
      tempErrors.name = "Project Name must be at least 3 characters.";

    if (!newProject.status) tempErrors.status = "Status is required.";
    if (!newProject.startDate) tempErrors.startDate = "Start Date is required.";
    if (!newProject.endDate) tempErrors.endDate = "End Date is required.";
    if (
      newProject.startDate &&
      newProject.endDate &&
      newProject.startDate > newProject.endDate
    )
      tempErrors.endDate = "End Date must be after Start Date.";
    if (!newProject.assignedToID)
      tempErrors.assignedToID = "Assign To is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAddProject = async () => {
    try {
      setAddLoading(true);
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        // console.log(file);
        formData.append("files", file);
      });

      // // Append all project fields
      formData.append("Project_Name", newProject.name);
      formData.append("Description", newProject.description);
      formData.append("Start_Date", newProject.startDate);
      formData.append("End_Date", newProject.endDate);
      formData.append("Status", newProject.status);
      formData.append("Owner", `${currUser.firstName} ${currUser.lastName}`);
      formData.append("Owner_Id", currUser.userid);
      formData.append("Assigned_To", newProject.assignedTo);
      formData.append("Assigned_To_Id", newProject.assignedToID);
      formData.append("Client_ID", newProject.clientID);
      formData.append("Client_Name", newProject.client_name);


      // console.log("formdata",formData)

      const response = await axios.post(
        "/server/time_entry_management_application_function/projects",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;
      // console.log("response",response.data);

      if (result.success) {
        const newProjectData = {
          ...newProject,
          owner: result.data.Owner,
          ownerID: result.data.ownerID,
          id: result.data.ROWID,
          rowid: result.data.ROWID,
        };

        dispatch(EmpProjectActions.addEmpProject(response.data.data));
          setHighlightedProjectId(result.data.ROWID);
           setTimeout(() => setHighlightedProjectId(null), 5000); 
        setNewProject({
          id: "",
          name: "",
          status: "",
          owner: "",
          ownerID: "",
          startDate: "",
          endDate: "",
          description: "",
          assignedTo: "",
          assignedToID: "",
          client_name: "",
          clientID: "",
        });

        setSelectedFiles([]); // Reset file selection
        toggleDrawer(false);
          handleAlert("success", "Project added successfully");
      } else {
         handleAlert("error", result.message || "Failed to add project");
      }
    } catch (error) {
       handleAlert("error", error.message || "Error adding project");
    }
    finally{
      setAddLoading(false);
       toggleDrawer(false);
    }
  };

  const handleSubmit = () => {
    // console.log("new", newProject);
    if (validate()) {
      handleAddProject(newProject);
     
    }
  };
  const handleCancel = () => {
    setErrors({});
    setNewProject({
      name: "",
      status: "",
      startDate: "",
      endDate: "",
      description: "",
      assignedTo: "",
    });
    toggleDrawer(false);
  };

    const handleEdit = (project) => {
    // console.log("edit project", project);
    const flattened = project.Projects;
    setCurrentEditProject(flattened);
    setEditModalOpen(true);
  };

  
  const EditValidate = () => {
    const tempErrors = {};

    // Project Name - minimum 3 characters
    if (
      !currentEditProject.Project_Name ||
      currentEditProject.Project_Name.trim().length < 3
    ) {
      tempErrors.Project_Name = "Project Name must be at least 3 characters.";
    }

    // Status - required
    if (!currentEditProject.Status) {
      tempErrors.Status = "Status is required.";
    }

    // Client_ID - required

    // Start Date - required
    if (!currentEditProject.Start_Date) {
      tempErrors.Start_Date = "Start Date is required.";
    }

    // End Date - required
    if (!currentEditProject.End_Date) {
      tempErrors.End_Date = "End Date is required.";
    }

    // Date logic - End must be after Start
    if (
      currentEditProject.Start_Date &&
      currentEditProject.End_Date &&
      new Date(currentEditProject.Start_Date) >
        new Date(currentEditProject.End_Date)
    ) {
      tempErrors.End_Date = "End Date must be after Start Date.";
    }

    // Assigned To - required
    if (!currentEditProject.Assigned_To_Id) {
      tempErrors.Assigned_To_Id = "Assigned user is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  
  const handleUpdateProject = async (rowid) => {
    // console.log("projects", currentEditProject);
    // console.log("currUser", currUser);

    try {
      setUpdateLoading(true);
      const response = await axios.post(
        `/server/time_entry_management_application_function/projects/${rowid}`,
        {
          Project_Name: currentEditProject.Project_Name,
          Description: currentEditProject.Description,
          Start_Date: currentEditProject.Start_Date,
          End_Date: currentEditProject.End_Date,
          Status: currentEditProject.Status,
          Owner: currUser.firstName + " " + currUser.lastName,
          Owner_Id: currUser.user_id,
          Assigned_To: currentEditProject.Assigned_To,
          Assigned_To_Id: currentEditProject.Assigned_To_Id,
          Client_Name: currentEditProject.Client_Name,
          Client_ID: currentEditProject.Client_ID,
        }
      );
      // console.log(response);
      if (response.status === 200) {
        const updateProject = response.data;
        dispatch(EmpProjectActions.updateEmpProject(response.data.data));
        handleAlert("success", "Project updated successfully");
        setEditModalOpen(false);
        currentEditProject("");
      } else {
        handleAlert("error", "Failed to update project");
      }
    } catch (error) {
      console.log("err", error.message);
    }finally{
      setUpdateLoading(false);
    }
  };


  
  const handleEditCancel = () => {
    setEditModalOpen(false);
    setCurrentEditProject(null);
  };

   const handleEditSubmit = (rowid) => {
    if (EditValidate()) {
      // console.log("finr");
      handleUpdateProject(rowid);
    }
  };

    const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

    const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  
  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        setDeleteLoading(true);
        // console.log("project", projectToDelete);
        const response = await axios.delete(
          `/server/time_entry_management_application_function/delete/${projectToDelete.Projects.ROWID}`
        );
        // console.log("deleted project", response);
        if (response.status === 200) {
          // Remove the project from the local state
          dispatch(EmpProjectActions.deleteEmpProject(projectToDelete.Projects.ROWID));
          handleAlert("success", "Project deleted successfully");
        } else {
          handleAlert("error", "Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        handleAlert("error", error.message || "Error deleting project");
      } finally {
        setDeleteConfirmOpen(false);
        setDeleteLoading(false);
        setProjectToDelete(null);
      }
    }
  };
  return (
    <Box sx={{ padding: 3 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
           background: `linear-gradient(135deg, ${colors.primary}88, ${colors.info}88)`,
              color: "white",
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
            <AssignmentIcon sx={{ color: "#fff" }} fontSize="large" />
          </Avatar>

          <Typography
                variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",

              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Projects
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
            label="Search Projects"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              width: { xs: "100%", sm: "60%", md: "250px" },
            }}
          />
          {currUser.roleId === "17682000000035348" && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => toggleDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            New Project
          </Button>
          )}

          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => toggleSheetDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Export
          </Button> */}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Table */}
        <Grid size={12}>
          {isLoading ? (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
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
                      Project ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Project Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Description
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
                      Action
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Tasks
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Issues
                    </TableCell>
                  </TableRow>
                </TableHead>
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
                              display: "grid",
                              gridTemplateColumns: "10% 18% 20% 10% 14% 14% 14%",
                              alignItems: "center",
                              gap: 2,
                              height: "40px",
                              width: "100%",
                            }}
                          >
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : paginatedProjects.length === 0 ? (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
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
                      Project ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Project Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Description
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
                      Action
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
                        <FaProjectDiagram
                          size={50}
                          color={theme.palette.text.secondary}
                        />
                        <Typography variant="h6" color="text.secondary">
                          No projects found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You currently don't have any projects assigned
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      ID
                    </TableCell>
                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Project Name
                    </TableCell>
                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Status
                    </TableCell>
                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Owner
                    </TableCell>

                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Start Date
                    </TableCell>
                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      End Date
                    </TableCell>
                    <TableCell   sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Attachement
                    </TableCell>

                    { currUser.roleId === "17682000000035348" && (  <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Actions
                    </TableCell>
)}
                    <TableCell    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Tasks
                    </TableCell>
                    <TableCell   sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}>
                      Issues
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
                    {paginatedProjects.map((project) => (
                      <TableRow
                        key={project.Projects.ROWID}
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
        highlightedProjectId === project.Projects.ROWID
          ? theme.palette.mode === "light"
            ? "#e3f2fd" // same as hover in light mode
            : theme.palette.primary.dark // same as hover in dark mode
          : "inherit",
      color:
        highlightedProjectId === project.Projects.ROWID
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
                        onClick={(e) => handleDetailDrwaer(e, project.Projects)}
                      >
                        <TableCell>
                          {"P" +
                            project.Projects.ROWID.substr(
                              project.Projects.ROWID.length - 4
                            )}
                        </TableCell>
                        <TableCell>{project.Projects.Project_Name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.Projects.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[project.Projects.Status]
                                  ?.backgroundColor || "#f5f5f5",
                              color:
                                statusConfig[project.Projects.Status]?.color ||
                                "#757575",
                              border: `1px solid ${statusConfig[project.Projects.Status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{project.Projects.Owner}</TableCell>
                        <TableCell>{new Date(project.Projects.Start_Date).toLocaleDateString("en-GB")}</TableCell>
                        <TableCell>{new Date(project.Projects.End_Date).toLocaleDateString("en-GB")}</TableCell>
                        <TableCell>
                          <Tooltip title="View Attachments">
                            <IconButton
                              onClick={(e) =>
                                handleAttachementOpen(e, project.Files)
                              }
                            >
                              <Badge
                                badgeContent={
                                  project.Files
                                    ? project.Files.split(",").filter(
                                        (file) => file.trim() !== ""
                                      ).length
                                    : 0
                                }
                                color="primary"
                                overlap="circular"
                              >
                                <AttachFileIcon
                                  fontSize="large"
                                  sx={{
                                    color: "#1976d2",
                                    fontSize: 30,
                                    cursor: "pointer",
                                  }}
                                />
                              </Badge>
                            </IconButton>
                          </Tooltip>
                       
                          

                          {/* <Popover
                                                  open={fileOpen}
                                                  anchorEl={anchorEl}
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
                                                      boxShadow: "none",
                                                      border: "1px solid #d0d7e2",
                                                      borderRadius: 2,
                                                      minWidth: 200,
                                                      maxWidth: 300,
                                                      bgcolor: "#f5f7ff",
                                                      p: 2,
                                                    },
                                                  }}
                                                >
                                                  {fileList.length > 0 ? (
                                                    <Stack direction="column" spacing={1}>
                                                      {fileList.map((url, index) => (
                                                        <Chip
                                                          key={`${url}-${index}`}
                                                          icon={
                                                            <InsertDriveFileIcon
                                                              sx={{ color: "#5c6bc0" }}
                                                            />
                                                          }
                                                          label={`File ${index + 1}`}
                                                          component="a"
                                                          href={url}
                                                          clickable
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDrawerOpen(false);
                                                          }}
                                                          sx={{
                                                            justifyContent: "flex-start",
                                                            color: "#3f51b5",
                                                            fontWeight: 500,
                                                            backgroundColor: "#e6edff",
                                                            "&:hover": {
                                                              backgroundColor: "#dbe4ff",
                                                            },
                                                          }}
                                                        />
                                                      ))}
                                                    </Stack>
                                                  ) : (
                                                    <Typography
                                                      variant="body2"
                                                      color="text.secondary"
                                                      fontStyle="italic"
                                                      textAlign="center"
                                                    >
                                                      No attachments
                                                    </Typography>
                                                  )}
                                                </Popover> */}
                          <Popover
                            open={fileOpen}
                            anchorEl={anchorEl}
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
                              {fileList.length > 0 ? (
                                fileList.map((url, index) => (
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

                           { currUser.roleId === "17682000000035348" && (
                          <TableCell>
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(project);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      )}

                        <TableCell>
                          <TaskIcon
                            fontSize="large"
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: 30,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlefiltetActive(project);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <BugReport
                            fontSize="large"
                            sx={{
                              color: theme.palette.primary.main,
                              fontSize: 30,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowIssue(project);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredProjects.length}
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
              position: "sticky", // Sticky position for header
              top: 0, // Stick to the top
              zIndex: 1, // Ensure it stays above content
            }}
          >
            <Typography variant="h6">Project Details</Typography>
            <IconButton onClick={handleCloseDrawer} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {isLoading ? (
            <Box px={3} py={2}>
              <Typography>Loading project details...</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {fields.map(([label, value, icon], index) => (
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
                          <Typography color="text.secondary">
                            {value}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                  {index !== fields.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCancel}
      >
        <Box
          sx={{
            width: 400,
            padding: 2,
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
              <WorkOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New Project
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={handleCancel}
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
            label="Project Name"
            name="name"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ marginBottom: 2 }}
          />

          <Autocomplete
            options={client}
            getOptionLabel={(option) => option.Org_Name} // Display username in options
            isOptionEqualToValue={(option, value) =>
              option.ROWID === value.ROWID
            } // Ensure correct selection
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "client_name", // Update the client_name in the state
                  value: newValue ? newValue.Org_Name : "", // Display username
                },
              });
              handleInputChange({
                target: {
                  name: "clientID", // Assuming you need the client ID too
                  value: newValue ? newValue.ROWID : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client Name"
                name="client_name"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
              />
            )}
            noOptionsText="No clients available" // Custom message when no options are found
          />

          <TextField
            label="Status"
            name="status"
            fullWidth
            variant="outlined"
            select
            value={newProject.status}
            onChange={handleInputChange}
            error={!!errors.status}
            helperText={errors.status}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Work In Process">Work In Process</MenuItem>
            <MenuItem value="Close">Close</MenuItem>
          </TextField>

          <TextField
            label="Start Date"
            name="startDate"
            fullWidth
            variant="outlined"
            type="date"
            value={newProject.startDate}
            onChange={handleInputChange}
            error={!!errors.startDate}
            helperText={errors.startDate}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="End Date"
            name="endDate"
            fullWidth
            variant="outlined"
            type="date"
            value={newProject.endDate}
            onChange={handleInputChange}
            error={!!errors.endDate}
            helperText={errors.endDate}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />

          <Autocomplete
            options={assignOptions}
            getOptionLabel={(option) => option.username} // Display username in options
            isOptionEqualToValue={(option, value) =>
              option.userID === value.userID
            } // Ensure correct selection
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "assignedToID",
                  value: newValue ? newValue.userID : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign To"
                name="assignedToID"
                fullWidth
                variant="outlined"
                error={!!errors.assignedToID}
                helperText={errors.assignedToID}
                sx={{ marginBottom: 2 }}
              />
            )}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newProject.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            sx={{ marginBottom: 2 }}
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
                onChange={handleFileChange}
              />
            </Button>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {selectedFiles.map((file, index) => (
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
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

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
                     "Add"
                   )}            

            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

        <Modal open={editModalOpen} onClose={handleEditCancel}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "40%", // Reduced width to 60%
                  maxHeight: "100vh", // Set max height to 80% of viewport height
                  overflowY: "auto", // Add scroll if content exceeds max height
                  padding: 4,
                  backgroundColor: (theme) => theme.palette.background.paper,
                  boxShadow: 24,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h5"
                  color={theme.palette.text.primary}
                  sx={{ marginBottom: 2 }}
                >
                  Edit Project
                </Typography>
                <TextField
                  label="Project Name"
                  name="Project_Name"
                  fullWidth
                  variant="outlined"
                  value={currentEditProject?.Project_Name || ""}
                  onChange={handleEditChange}
                  error={!!errors.Project_Name}
                  helperText={errors.Project_Name}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  label="Status"
                  name="Status"
                  fullWidth
                  variant="outlined"
                  select
                  value={currentEditProject?.Status || ""}
                  onChange={handleEditChange}
                  error={!!errors.Status}
                  helperText={errors.Status}
                  sx={{ marginBottom: 2 }}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Work In Process">Work In Process</MenuItem>
                  <MenuItem value="Close">Close</MenuItem>
                </TextField>
      
                <Autocomplete
                  value={
                    client.find(
                      (option) => option.ROWID === currentEditProject?.Client_ID
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleEditChange({
                      target: {
                        name: "Client_Name",
                        value: newValue ? newValue.Org_Name : "",
                      },
                    });
                    handleEditChange({
                      target: {
                        name: "Client_ID",
                        value: newValue ? newValue.ROWID : "",
                      },
                    });
                  }}
                  options={client}
                  getOptionLabel={(option) => option?.Org_Name || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.ROWID === value?.ROWID
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Client Name"
                      name="client_name"
                      fullWidth
                      variant="outlined"
                      sx={{ marginBottom: 2 }}
                    />
                  )}
                  noOptionsText="No clients available"
                />
      
                <TextField
                  label="Start Date"
                  name="Start_Date"
                  fullWidth
                  variant="outlined"
                  type="date"
                  value={currentEditProject?.Start_Date || ""}
                  onChange={handleEditChange}
                  error={!!errors.Start_Date}
                  helperText={errors.Start_Date}
                  InputLabelProps={{ shrink: true }}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  label="End Date"
                  name="End_Date"
                  fullWidth
                  variant="outlined"
                  type="date"
                  value={currentEditProject?.End_Date || ""}
                  onChange={handleEditChange}
                  error={!!errors.End_Date}
                  helperText={errors.End_Date}
                  InputLabelProps={{ shrink: true }}
                  sx={{ marginBottom: 2 }}
                />
      
                <Autocomplete
                  value={
                    assignOptions.find(
                      (option) => option.userID === currentEditProject?.Assigned_To_Id
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    // Handle the change correctly, and ensure the newValue is not null
                    handleEditChange({
                      target: {
                        name: "assignedTo",
                        value: newValue?.userID || "", // Handle the case where newValue might be null
                      },
                    });
                  }}
                  options={assignOptions}
                  getOptionLabel={(option) => option.username} // This will display the username in the autocomplete dropdown
                  isOptionEqualToValue={(option, value) =>
                    option.userID === value?.userID
                  } // Avoid comparing undefined values
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assign To"
                      name="assignedTo"
                      fullWidth
                      variant="outlined"
                      error={!!errors.Assigned_To_Id}
                      helperText={errors.Assigned_To_Id}
                      sx={{ marginBottom: 2 }}
                    />
                  )}
                />
      
                <TextField
                  label="Description"
                  name="Description"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={currentEditProject?.Description || ""}
                  onChange={handleEditChange}
                  error={!!errors.Description}
                  helperText={errors.Description}
                  sx={{ marginBottom: 2 }}
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
                    onClick={() => handleEditSubmit(currentEditProject.ROWID)}
                                 disabled={updateLoading}

                  >
                     {updateLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Submit"
                        )}
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleEditCancel}>
                    Cancel
                  </Button>
                </Box>
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
                      {"Delete Project"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete project{" "}
                        <strong>{projectToDelete?.name}</strong>?
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

                  
                        <Snackbar
                          open={snackbar.open}
                          autoHideDuration={3000}
                          onClose={handleAttachementCloseSnackbar}
                          anchorOrigin={{ vertical: "top", horizontal: "center" }}
                          TransitionComponent={SlideTransition}
                        >
                          <Alert
                            onClose={handleAttachementCloseSnackbar}
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
}

export default Project;
