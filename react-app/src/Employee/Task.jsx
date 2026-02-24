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
  alpha,
  TableFooter,
  TablePagination,
  IconButton,
  Drawer,
  useTheme,
  Tooltip,
  Popover,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  ListItemText,
  Autocomplete,
  MenuItem,
  Modal,
  Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Snackbar,Alert,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";

import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { EmpTimeEntry } from "./TimeEntry";
import { FaTasks } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { addEmpTaskLocal, fetchEmpTask } from "../redux/EmpTask/EmpTaskSlice";
import { TaskActions } from "../redux/Tasks/TaskSlice";
import { ConstructionOutlined } from "@mui/icons-material";
import { fetchEmpProject } from "../redux/EmpProject/EmpProjectSlice";
import { fetchClientData } from "../redux/Client/clientSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import StopCircleIcon from "@mui/icons-material/StopCircle";

const statusOptions = ["Open", "In Progress", "Completed"];

const statusConfig = {
  Open: {
    color: "#f0ad4e",
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
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
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "success";
    case "work In Process":
      return "warning";
    case "open":
      return "error";
    case "delayed":
      return "error";
    default:
      return "default";
  }
};

function Task() {
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

const user = useSelector((state) => state.user.user); 

const { isRunning, taskId } = useSelector((state) => state.timer);


  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = location.state || {};
  const { projectName } = location.state || {}; // Access projectId from state

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [assignOptions, setAssignOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [TaskName, setTaskName] = useState("");
  const [fileList, setFileList] = useState([]);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [taskDetail, setTaskDetail] = useState(null);
  const [attachementAnchorEl, setAttachementAnchorEL] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const[UserId, setuserId] = useState("");
  const [addDrawer, setAddDrawer] = useState(false);
  const [currProject, setCurrProject] = useState({});
  const [currUser, setCurrUser] = useState("");
  const [newTask, setNewTask] = useState({
    projectId: projectId || "",
    project_name: projectName || "",
    name: "",
    assignTo: "",
    assignToID: "",
    status: "",
    startDate: "",
    endDate: "",
    description: "",
    type: "",
  });

  const [addLoading, setAddLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const[deleteLoading, setDeleteLoading] = useState(false);
   // const [highlightedProjectId, setHighlightedProjectId] = useState(null);
     const [snackbar, setSnackbar] = useState({
       open: false,
       message: "",
       severity: "success",
     });
  const { data: employeedata } = useSelector((state) => state.employeeReducer);

  const { data: Task, isLoading } = useSelector(
    (state) => state.empTaskReducer
  );
  const { data } = useSelector((state) => state.empProjectReducer);

  // console.log("my employee daata iss the ", Task);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllData = async () => {
        setLoading(true);
      if (!Array.isArray(data) || data.length === 0) {
        dispatch(fetchEmpProject());
      }
      if (!Array.isArray(employeedata) || employeedata.length === 0) {
        dispatch(fetchEmployees());
      }
      setLoading(false);
    };
    fetchAllData();
  }, [dispatch]);

  useEffect(() => {
       
    const fetchTasks = async () => {
      setLoading(true);
      const currentUserId = JSON.parse(localStorage.getItem("currUser"));
      // console.log("current", currentUserId);
      const RoleId = currentUserId.roleId;
      const userId = currentUserId.userid;
      setCurrUser(RoleId);
       setuserId(userId)
      if (projectId) {
        // try {
          // const res = await axios.get(
          //   "/server/time_entry_management_application_function/taskByProjectAndUser",
          //   {
          //     params: {
          //       projectID: projectId,
          //       userID: id,
          //     },
          //   }
          // );
          // console.log("taskres", res);
          // setTasks(res.data.data);
          try {
    let res;
    // console.log("projectis",projectId)

    if (RoleId === "17682000000035348") {
      // 👇 Hit the alternate API for roleId 123
      res = await axios.post("/server/time_entry_management_application_function/tasks/project",{
         "projectID": projectId
      } );
      // console.log("Admin task response:", res);
    } else {
      // 👇 Default API for normal users
      res = await axios.get(
        "/server/time_entry_management_application_function/taskByProjectAndUser",
        {
          params: {
            projectID: projectId,
            userID: userId,
          },
        }
      );
      // console.log("User task response:", res);
    }

    setTasks(res.data.data || []);
        } catch (error) {
          console.error("Error fetching tasks by project:", error);
        }finally{
          setLoading(false);
        }
      } else {
        // try {
        //   if (!Array.isArray(Task) || Task.length === 0) {
        //     const response = await dispatch(fetchEmpTask()).unwrap();
        //     console.log("====", response);
        //     setTasks(response);
        //   } else {
        //     setTasks(Task);
        //   }
        //   // use response instead of Task directly
        // } catch (error) {
        //   console.error("Error fetching employee tasks:", error);
        // }
        try {
   if (RoleId === "17682000000035348") {
      // console.log("Manager role detected");

      // ✅ Fetch projects if not already available
      let projectData = data;
      if (!Array.isArray(data) || data?.length === 0) {
        const fetchedProjects = await dispatch(fetchEmpProject()).unwrap();
        projectData = fetchedProjects; // assign new data
      }

      // ✅ Extract project IDs safely
      const projectIDs = Array.isArray(projectData)
        ? projectData.map((project) => project.Projects.ROWID)
        : [];


      if (projectIDs.length === 0) {
        console.warn("No project IDs found for manager role.");
        return;
      }

      // ✅ Hit the manager API
      const res = await axios.post(
        "/server/time_entry_management_application_function/tasks/project",
        {
          projectID: projectIDs,
        }
      );

    
      setTasks(res?.data?.data|| []);
    } else {
      // 👇 Default existing logic
      if (!Array.isArray(Task) || Task?.length === 0) {
        const response = await dispatch(fetchEmpTask()).unwrap();
       
        setTasks(response);
      } else {
        setTasks(Task);
      }
    }
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
  }finally{
    setLoading(false)
  }
      }
    };

    fetchTasks();
  }, [projectId, dispatch]);

  

  useEffect(() => {
    if (employeedata.length > 0) {
      const employee = employeedata
        ?.filter(
          (employee) =>
            employee.role_details.role_name !== "Contacts" &&
            employee.role_details.role_name !== "Super Admin"
        )
        ?.map((employee) => ({
          username: `${employee.first_name} ${employee.last_name}`,
          userID: employee.user_id,
          role: employee.role_details.role_name,
        }));
      setAssignOptions(employee);
    }
  }, [employeedata]);

  const handleAttachementOpen = (e, filesString) => {
    e.stopPropagation();
    setAttachementAnchorEL(e.currentTarget);

    const files = (filesString || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    setFileList(files);
  };

  const handleAttachementClose = (e) => {
    e.stopPropagation();
    setAttachementAnchorEL(null);
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

  const filteredTasks = tasks?.filter((task) =>
    task.Task_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const paginatedTasks = filteredTasks?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
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

//   useEffect(() => {
//   if (user?.roleId !== "17682000000035348") {
//     handleInputChange({
//       target: {
//         name: "assignToID",
//         value: user.userid, // directly set assignToID
//       },
//     });
//   }
// }, [user]);
useEffect(() => {
  if (
    user?.roleId !== "17682000000035348" &&
    assignOptions.length > 0
  ) {
    handleInputChange({
      target: {
        name: "assignToID",
        value: user.userid,
      },
    });
  }
}, [user, assignOptions]);


  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "projectId") {
      const selectedOption = data.find(
        (option) => option?.Projects?.ROWID === value
      );

      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          project_name: selectedOption.Projects.Project_Name,
          projectId: selectedOption.Projects.ROWID,
        }));
      }
    } else if (name === "assignToID") {
      //  Ensure value is always an array
  const selectedValues = Array.isArray(value)
    ? value
    : value
    ? value.split(",")
    : [];

      const selectedUsernames = selectedValues
        ?.map((id) => {
          const user = assignOptions.find((option) => option.userID === id);
          return user ? user.username : "";
        })
        ?.filter(Boolean) // Remove empty names
        .join(", ");

      setNewTask((prev) => ({
        ...prev,
        assignTo: selectedUsernames, // Store names
        assignToID: selectedValues.join(","), //  Store IDs
      }));
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

const handleUpdateTask = async () => {
  try {
    setUpdateLoading(true);

    const ROWID = currentTask.ROWID;

    const updatePayload = {
      Status: currentTask.Status,
      Description: currentTask.Description,
      Assign_To: currentTask.Assign_To,
      Assign_To_ID: currentTask.Assign_To_ID,
      ProjectID: currentTask.Project_ID,
      Project_Name: currentTask.Project_Name,
      Task_Name: currentTask.Task_Name,
      Start_Date: currentTask.Start_Date,
      End_Date: currentTask.End_Date,
    };

    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/tasks/${ROWID}`,
      updatePayload
    );

    if (updateResponse?.data?.success) {
      setTasks((prev) =>
        prev.map((task) =>
          task.ROWID === currentTask.ROWID ? currentTask : task
        )
      );
      setCurrentTask("");
      setEditModalOpen(false);
      handleAlert("success","Task Updated Successfully")
    } else {
      console.error("Update failed:", updateResponse?.data?.message);
      handleAlert("error","Failed to update task. Please try again.");
    }
  } catch (error) {
    console.error("Error updating task:", error);
    handleAlert("error",error.message);
  } finally {
    setUpdateLoading(false);
  }
};


  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
  
    if (name === "Project_ID") {
      const selectedOption = data?.find(
        (option) => option.Projects.ROWID === value
      );

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          Project_ID: selectedOption.Projects.ROWID,
          Project_Name: selectedOption.Projects.Project_Name,
        }));
      }
    } else if (name === "associated") {
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          assignTo: selectedOption.username,
          assignToID: selectedOption.userID,
        }));
      }
    } else {
      setCurrentTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
    setViewModalOpen(true);
     navigate("/EmpTimeEntry/" + task.ROWID, { state: { task } });
 
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
  };

  const fields = [
    [
      "Task ID",
      "T" + taskDetail?.ROWID?.slice(-4),
      <AssignmentIcon color="primary" />,
    ],
    ["Task Name", taskDetail?.Task_Name, <DescriptionIcon color="primary" />],
    ["Assigned To", taskDetail?.Assign_To, <PersonIcon color="primary" />],
    [
      "Project Name",
      taskDetail?.Project_Name,
      <BusinessIcon color="primary" />,
    ],
    ["Start Date", new Date(taskDetail?.Start_Date).toLocaleDateString("en-GB"), <EventIcon color="primary" />],
    ["End Date", new Date(taskDetail?.End_Date).toLocaleDateString("en-GB"), <ScheduleIcon color="primary" />],
    ["Status", taskDetail?.Status, <TrackChangesIcon color="primary" />],
    ["Type", taskDetail?.Type, <MonetizationOnIcon color="primary" />],
    [
      "Description",
      taskDetail?.Description,
      <DescriptionIcon color="primary" />,
    ],
  ];

  const handleClose = () => {
    setOpen(false);
  };

  const handleDetailDrwaer = (e, task) => {
    setOpen(true);
    setTaskDetail(task);
  };

  // const handleOpenDrawer = (open) =>{
  //       setAddDrawer(open);
  // }

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

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    const updatedPreviews = [...previewURLs];
    updatedPreviews.splice(index, 1);
    setPreviewURLs(updatedPreviews);
  };
  const validateForm = () => {
    let newErrors = {};

    if (!newTask.projectId) newErrors.projectId = "Project is required";
    if (!newTask.name) newErrors.name = "Task name is required";
    if (!newTask.assignToID)
      newErrors.assignToID = "At least one user must be assigned";
    if (!newTask.status) newErrors.status = "Status is required";
    if (!newTask.startDate) newErrors.startDate = "Start date is required";
    if (!newTask.endDate) newErrors.endDate = "End date is required";

    if (newTask.startDate && newTask.endDate) {
      if (newTask.startDate > newTask.endDate) {
        newErrors.endDate = "Task end date cannot be before start date";
      }
    }

    if (newTask.startDate) {
      if (
        currProject.Start_Date &&
        newTask.startDate < currProject.Start_Date
      ) {
        newErrors.startDate =
          "Task start date cannot be before project start date";
      } else if (
        currProject.End_Date &&
        newTask.startDate > currProject.End_Date
      ) {
        newErrors.startDate =
          "Task start date cannot be after project end date";
      }
    }

    if (newTask.endDate) {
      if (currProject.Start_Date && newTask.endDate < currProject.Start_Date) {
        newErrors.endDate = "Task end date cannot be before project start date";
      } else if (
        currProject.End_Date &&
        newTask.endDate > currProject.End_Date
      ) {
        newErrors.endDate = "Task end date cannot be after project end date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async () => {
    try {
      let newErrors = {};

      // ✅ Validation
      if (!newTask.projectId) newErrors.projectId = "Project is required";
      if (!newTask.name) newErrors.name = "Task name is required";
      if (!newTask.assignToID)
        newErrors.assignToID = "At least one user must be assigned";
      if (!newTask.status) newErrors.status = "Status is required";
      if (!newTask.startDate) newErrors.startDate = "Start date is required";
      if (!newTask.endDate) newErrors.endDate = "End date is required";

      if (newTask.startDate && newTask.endDate) {
        if (newTask.startDate > newTask.endDate) {
          newErrors.endDate = "Task end date cannot be before start date";
        }
      }

      if (newTask.startDate) {
        if (
          currProject.Start_Date &&
          newTask.startDate < currProject.Start_Date
        ) {
          newErrors.startDate =
            "Task start date cannot be before project start date";
        } else if (
          currProject.End_Date &&
          newTask.startDate > currProject.End_Date
        ) {
          newErrors.startDate =
            "Task start date cannot be after project end date";
        }
      }

      if (newTask.endDate) {
        if (
          currProject.Start_Date &&
          newTask.endDate < currProject.Start_Date
        ) {
          newErrors.endDate =
            "Task end date cannot be before project start date";
        } else if (
          currProject.End_Date &&
          newTask.endDate > currProject.End_Date
        ) {
          newErrors.endDate = "Task end date cannot be after project end date";
        }
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return;
      }
      
      setAddLoading(true);
      // ✅ If validation passed → proceed
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const assignToID = Array.isArray(newTask.assignToID)
        ? newTask.assignToID.join(",")
        : newTask.assignToID;

      const assignTo = Array.isArray(newTask.assignTo)
        ? newTask.assignTo.join(",")
        : newTask.assignTo;

      formData.append("Status", newTask.status);
      formData.append("Description", newTask.description);
      formData.append("Assign_To", assignTo);
      formData.append("Assign_To_ID", assignToID);
      formData.append("ProjectID", newTask.projectId);
      formData.append("Project_Name", newTask.project_name);
      formData.append("Task_Name", newTask.name);
      formData.append("Start_Date", newTask.startDate);
      formData.append("End_Date", newTask.endDate);
      formData.append("Type", newTask.type);

      // Debug log
      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ":", pair[1]);
      // }

      // 🔥 Call API here (example)
      const response = await axios.post(
        "/server/time_entry_management_application_function/tasks",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;
      // console.log("results",result);
      if (result.success) {
        handleCancel(); // Clear UI, close forms etc.
         handleAlert("success", "Task added successfully");
        dispatch(addEmpTaskLocal(result.data));
       
        if (projectId && result.data.ProjectID === projectId) {
   
          setTasks((prev) => [...prev, result.data]);
        }else{
          setTasks((prev)=>[result.data ,...prev]);
        }

        // Clear form and file input
        setSelectedFiles([]);
        setNewTask({
          name: "",
          status: "",
          description: "",
          assignTo: [],
          assignToID: [],
          projectId: "",
          project_name: "",
          startDate: "",
          endDate: "",
          type: "",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
     handleAlert("error", error.message || "Error adding task");
    }finally{
      setAddLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    setNewTask({
      projectId: "",
      project_name: "",
      name: "",
      assignTo: "",
      assignToID: "",
      status: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    toggleDrawer(false);
  };
  //  const handleSubmit = () => {
  //   console.log("adsads")
  //   if (validateForm()) {
  //     console.log("gdf");
  //     handleAddTask();
  //   }
  // };

  const handleCloseEditModal = () => {
    setErrors({});
    setEditModalOpen(false);
  };

  const handleEdit = (task) => {
    setCurrentTask(task);

    setEditModalOpen(true);
  };
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        setDeleteLoading(true)
        const response = await axios.delete(
          `/server/time_entry_management_application_function/tasks/${taskToDelete.ROWID}`
        );
        if (response.status === 200) {
          dispatch(TaskActions.deleteTasktData(taskToDelete.ROWID));
          handleAlert("success", "Task deleted successfully");
          setTasks((prev) =>
            prev.filter((item) => item.ROWID !== taskToDelete.ROWID)
          );
        } else {
          handleAlert("error", "Failed to delete task");
        }
      } catch (error) {
        handleAlert("error", error.message || "Error deleting task");
      } finally {
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
        setDeleteLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          borderRadius: "16px",
          // background: `linear-gradient(135deg, ${alpha(
          //   theme.palette.primary.main,
          //   0.08
          // )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
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
              bgcolor: colors.primary,
              width: 60,
              height: 60,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
            Tasks
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
            label="Search Tasks"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              width: { xs: "100%", sm: "60%", md: "250px" },
            }}
          />

          {/* {currUser === "17682000000035348" && ( */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => toggleDrawer(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Add Task
            </Button>
          {/* )} */}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={12}>
          {loading ? (
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
                      Task ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task Name
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
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Description
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
                              gridTemplateColumns: "8% 18% 15% 10% 15% 15% 12%",
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
          ) : paginatedTasks?.length === 0 ? (
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
                      Task ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task Name
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
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Description
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
                        <FaTasks size={50} color={theme.palette.text.secondary} />
                        <Typography variant="h6" color="text.secondary">
                          No tasks found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You currently don't have any tasks assigned
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
                  <TableRow
                    sx={{ backgroundColor: theme.palette.primary.main }}
                  >
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task Name
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
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      End Date
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Attachement
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
                      Time Entry
                    </TableCell>
                  </TableRow>
                </TableHead>

                {loading ? (
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
                ) : paginatedTasks?.length === 0 ? (
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
                    {paginatedTasks?.map((task) => (
                      // <TableRow
                      //   key={task.ROWID}
                      //   onClick={(e) => handleDetailDrwaer(e, task)}
                      //   sx={{
                      //     cursor: "pointer",
                      //     "&:hover": {
                      //       backgroundColor:
                      //         theme.palette.mode === "light"
                      //           ? "#e3f2fd"
                      //           : theme.palette.primary.dark,
                      //       color: theme.palette.primary.contrastText,
                      //     },
                      //   }}
                      // >
      <TableRow
  key={task.ROWID}
  onClick={(e) => handleDetailDrwaer(e, task)}
  sx={{
    cursor: "pointer",

    // 🟠 Running task highlight
    backgroundColor:
      isRunning && taskId === task.ROWID
        ? theme.palette.mode === "light"
          ? "#fff8e1"                 // soft amber (light)
          : "rgba(255,193,7,0.18)"    // amber tint (dark)
        : "inherit",

    "&:hover": {
      backgroundColor:
        isRunning && taskId === task.ROWID
          ? theme.palette.mode === "light"
            ? "#ffecb3"
            : "rgba(255,193,7,0.28)"
          : theme.palette.mode === "light"
          ? "#e3f2fd"
          : theme.palette.primary.dark,

      color: theme.palette.primary.contrastText,
    },
  }}
>


                        <TableCell>
                          {"T" + task.ROWID.substr(task.ROWID.length - 4)}
                        </TableCell>
                        <Tooltip title={task.Task_Name} arrow>
                        <Tooltip title={task.Task_Name} arrow>
  <TableCell>
    <Box
      sx={{
        maxWidth: 220,        // ✅ adjust as needed
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {task.Task_Name}
    </Box>
  </TableCell>
</Tooltip>

                        </Tooltip>
                        <TableCell>{task.Project_Name}</TableCell>
                        <TableCell>
                          <Chip
                            label={task.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[task.Status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[task.Status]?.color || "#757575",
                              border: `1px solid ${statusConfig[task.Status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{new Date(task.Start_Date).toLocaleDateString("en-GB")}</TableCell>
                        <TableCell>{new Date(task.End_Date).toLocaleDateString("en-GB")}</TableCell>

                        <TableCell>
                          <Tooltip title="View Attachments">
                            <IconButton
                              onClick={(e) =>
                                handleAttachementOpen(e, task.Files)
                              }
                            >
                              <Badge
                                badgeContent={
                                  task.Files
                                    ? task.Files.split(",").filter(
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
                        {/* <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(task)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(task)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell> */}
               <TableCell onClick={(e) => e.stopPropagation()}>
  {(currUser === "17682000000035348" || UserId === task.CREATORID) ? (
    <>
      <IconButton color="primary" onClick={() => handleEdit(task)}>
        <EditIcon />
      </IconButton>
      <IconButton color="error" onClick={() => handleDeleteClick(task)}>
        <DeleteIcon />
      </IconButton>
    </>
  ) : (
    <Typography variant="body2" color="text.secondary">
      No Access
    </Typography>
  )}
</TableCell>

                        {/* <TableCell
                          align="center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AccessTimeIcon
                            fontSize="large" 
                            style={{
                              color: theme.palette.primary.main,
                              fontSize: 30, 
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewTask(task)}
                          />
                        </TableCell> */}
                        <TableCell
  align="center"
  onClick={(e) => e.stopPropagation()}
>
  {isRunning && taskId === task.ROWID ? (
    <StopCircleIcon
  fontSize="large"
  sx={{
    color: theme.palette.mode === "dark"
    ? "warning.light"
    : "primary.main",
    fontSize: 30,
    cursor: "pointer",

    "&:hover": {
  transform: "scale(1.1)",
}

  }}
  onClick={() => handleViewTask(task)}
/>

  ) : (
    <AccessTimeIcon
      fontSize="large"
      sx={{
        color: theme.palette.primary.main,
        fontSize: 30,
        cursor: "pointer",
      }}
      onClick={() => handleViewTask(task)}
    />
  )}
</TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredTasks?.length || 0}
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
      {/* time entry */}
      {viewTask ? (
        <EmpTimeEntry
          theme={theme}
          handleEditInputChange={handleEditInputChange}
          projects={projects}
          statusOptions={statusOptions}
          handleUpdateTask={handleUpdateTask}
          viewModalOpen={viewModalOpen}
          viewTask={viewTask}
          setViewTask={setViewTask}
          handleCloseViewModal={handleCloseViewModal}
        />
      ) : (
        <div></div>
      )}

      <Drawer anchor="right" open={open} onClose={handleClose}>
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
            <Typography variant="h6">Task Details</Typography>
            <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box px={3} py={2}>
              <Typography>Loading task details...</Typography>
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
              {/* <PlaylistAddCheckIcon sx={{ mr: 1 }} /> */}
              <Typography variant="h6" fontWeight="bold">
                Add New Task
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

          <Autocomplete
            options={data}
            getOptionLabel={
              (option) => option?.Projects?.Project_Name || "" // safe access
            }
            isOptionEqualToValue={(option, value) =>
              option?.Projects?.ROWID === value?.Projects?.ROWID
            }
            value={
              projectName
                ? data.find(
                    (option) => option?.Projects?.Project_Name === projectName
                  )
                : data.find(
                    (option) => option?.Projects?.ROWID === newTask.projectId
                  ) || null
            }
            onChange={(event, newValue) => {
              if (!projectName) {
                setCurrProject(newValue);

                handleInputChange({
                  target: {
                    name: "projectId",
                    value: newValue ? newValue.Projects.ROWID : "",
                  },
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Project"
                name="projectId"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
                error={!!errors.projectId}
                helperText={errors.projectId}
              />
            )}
            disabled={!!projectName}
          />

          <TextField
            label="Add Task"
            name="name"
            fullWidth
            value={newTask.name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* <Autocomplete
            multiple
            options={assignOptions}
            getOptionLabel={(option) => option.username}
            value={assignOptions.filter((option) =>
              Array.isArray(newTask.assignToID)
                ? newTask.assignToID.includes(option.userID)
                : typeof newTask.assignToID === "string"
                  ? newTask.assignToID?.split(",").includes(option.userID)
                  : []
            )}
            onChange={(event, newValue) => {
              const selectedValues = Array.isArray(newValue) ? newValue : [];
              const selectedIDs = selectedValues?.map(
                (option) => option.userID
              );

              handleInputChange({
                target: {
                  name: "assignToID",
                  value: selectedIDs.length > 0 ? selectedIDs.join(",") : "", // Convert to a string
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Associated"
                name="assignToID"
                fullWidth
                error={!!errors.assignToID}
                helperText={errors.assignToID}
                sx={{ marginBottom: 2 }}
              />
            )}
          /> */}

          {user?.roleId !== "17682000000035348" ? (
  // Show logged-in user's name as read-only
  <TextField
    label="Assigned To"
    fullWidth
    value={user?.firstName + " " + user?.lastName || "Current User"}
    disabled
    sx={{ marginBottom: 2 }}
  />
) : (
  // Original multiple select Autocomplete
  <Autocomplete
    multiple
    options={assignOptions}
    getOptionLabel={(option) => option.username}
    value={assignOptions.filter((option) =>
      Array.isArray(newTask.assignToID)
        ? newTask.assignToID.includes(option.userID)
        : typeof newTask.assignToID === "string"
        ? newTask.assignToID?.split(",").includes(option.userID)
        : []
    )}
    onChange={(event, newValue) => {
      const selectedValues = Array.isArray(newValue) ? newValue : [];
      const selectedIDs = selectedValues?.map((option) => option.userID);

      handleInputChange({
        target: {
          name: "assignToID",
          value: selectedIDs.length > 0 ? selectedIDs.join(",") : "",
        },
      });
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Associated"
        name="assignToID"
        fullWidth
        error={!!errors.assignToID}
        helperText={errors.assignToID}
        sx={{ marginBottom: 2 }}
      />
    )}
  />
)}

          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.status}
            helperText={errors.status}
          >
            {Object.keys(statusConfig)?.map((status) => (
              <MenuItem
                key={status}
                value={status}
                sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}
              >
                <Box
                  component={statusConfig[status].icon}
                  sx={{ color: statusConfig[status].color, fontSize: "1.1rem" }}
                />
                <Typography
                  sx={{ color: statusConfig[status].color, fontWeight: 500 }}
                >
                  {status}
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Start Date"
            name="startDate"
            fullWidth
            type="date"
            value={newTask.startDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />

          <TextField
            label="End Date"
            name="endDate"
            fullWidth
            type="date"
            value={newTask.endDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />

          <TextField
            label="Add Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
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

            {selectedFiles.length > 0 && (
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
              onClick={handleAddTask}
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

      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            maxHeight: "100vh",
            overflowY: "auto",
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
            Edit Task
          </Typography>

          {currentTask && (
            <>
              <TextField
                label="Task Name"
                name="Task_Name"
                fullWidth
                variant="outlined"
                value={currentTask.Task_Name}
                onChange={handleEditInputChange}
                error={!!errors.Task_Name}
                helperText={errors.Task_Name}
                sx={{ marginBottom: 2 }}
              />

              <TextField
                label="Project"
                name="Project_ID" // match the value you are storing
                fullWidth
                select
                variant="outlined"
                value={currentTask.Project_ID ||  currentTask.ProjectID || ""}
                onChange={handleEditInputChange}
                error={!!errors.ProjectID}
                helperText={errors.ProjectID}
                sx={{ marginBottom: 2 }}
              >
                {data?.map((option) => (
                  <MenuItem
                    key={option.Projects.ROWID}
                    value={option.Projects.ROWID}
                  >
                    {option.Projects.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                multiple
                fullWidth
                disabled={user?.roleId !== "17682000000035348"}
                options={assignOptions}
                getOptionLabel={(option) => option.username}
                value={assignOptions.filter((opt) =>
                  currentTask.Assign_To_ID
                    ? currentTask.Assign_To_ID.includes(opt.userID)
                    : typeof currentTask.Assign_To_ID === "string"
                      ? currentTask.Assign_To_ID?.split(",").includes(
                          opt.userID
                        )
                      : []
                )}
                onChange={(event, newValue) => {
                  const selectedIDs = newValue?.map((item) => item.userID);
                  const selectedNames = newValue?.map((item) => item.username);

                  setCurrentTask((prev) => ({
                    ...prev,
                    Assign_To_ID: selectedIDs.join(","),
                    Assign_To: selectedNames.join(", "),
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Associated"
                    name="Assign_To"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                  />
                )}
              />

              <TextField
                select
                fullWidth
                label="Status"
                name="Status"
                value={currentTask.Status}
                onChange={handleEditInputChange}
                error={!!errors.Status}
                helperText={errors.Status}
                sx={{ marginBottom: 2 }}
              >
                {Object.keys(statusConfig)?.map((Status) => (
                  <MenuItem key={Status} value={Status}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        component={statusConfig[Status].icon}
                        sx={{
                          color: statusConfig[Status].color,
                          fontSize: "1.1rem",
                        }}
                      />
                      <Typography
                        sx={{
                          color: statusConfig[Status].color,
                          fontWeight: 500,
                        }}
                      >
                        {Status}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Start Date"
                name="Start_Date"
                type="date"
                fullWidth
                variant="outlined"
                value={currentTask.Start_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.Start_Date}
                helperText={errors.Start_Date}
                sx={{ marginBottom: 2 }}
              />

              <TextField
                label="End Date"
                name="End_Date"
                type="date"
                fullWidth
                variant="outlined"
                value={currentTask.End_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.End_Date}
                helperText={errors.End_Date}
                sx={{ marginBottom: 2 }}
              />

              <TextField
                label="Add Description"
                name="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={currentTask.Description}
                onChange={handleEditInputChange}
                error={!!errors.Description}
                helperText={errors.Description}
                sx={{ marginBottom: 2 }}
              />
            </>
          )}

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
              onClick={handleUpdateTask}
                 disabled={updateLoading}
            >
              {updateLoading ? (
                                       <CircularProgress size={24} color="inherit" />
                                     ) : (
                                       "Submit"
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
        </Box>
      </Modal>

         <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete task "{taskToDelete?.Task_Name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
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
}

export default Task;
