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
  Avatar,
  IconButton,
  Drawer,
  MenuItem,
  Modal,
  useTheme,
  Chip,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { TimeEntry } from "./TimeEntry";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { FaTasks } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactData } from "../redux/contacts/contactSlice";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { fetchEmpTask } from "../redux/EmpTask/EmpTaskSlice";
import { fetchContactTask } from "../redux/contacts/contactTaskSlice";
const statusOptions = ["Open", "In Progress", "Completed"];

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

  const location = useLocation();
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
  const [loading, setLoading] = useState(false);
  const [TaskName, setTaskName] = useState("");

  const [newTask, setNewTask] = useState({
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
  const [currUser, setCurrUser] = useState({});

  // const Task = useSelector((state) => state.empTaskReducer);
  const dispatch = useDispatch();

  const {data} = useSelector((state)=> state.contactReducer);
  const {data:TaskData, isLoading} = useSelector((state)=> state.contactTaskReducer);
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("currUser"));
        setCurrUser(user);
        const userid = user.userid;

         let contactDataResult = data;
                  if (!data || data.length === 0) {
                    const resultAction = await dispatch(fetchContactData(userid)).unwrap();
                    contactDataResult = resultAction;
                  }
                  if (!contactDataResult || contactDataResult.length === 0) return;
            
        // const contactRes = await axios.get(
        //   `/server/time_entry_management_application_function/contactData/${userid}`
        // );

        const contactDetail = contactDataResult[0]?.Client_Contact;
        const orgId = contactDetail?.OrgID;
     if (!orgId)
          throw new Error("Organization ID not found in contact data");


       
     if(!TaskData || (Array.isArray(TaskData) && TaskData.length === 0)){
       await dispatch(fetchContactTask(orgId)).unwrap();
     
     }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const filteredTasks = TaskData?.filter((task) => {
    
  const matchesSearch = task.Task_Name.toLowerCase().includes(searchQuery.toLowerCase());
 
  const matchesProject = projectId ? task.ProjectID === projectId : true;
  return matchesSearch && matchesProject;
});


  const paginatedTasks = filteredTasks?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "project") {
      const selectedOption = projects.find((option) => option.ROWID === value);

      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
        }));
      }
    } else if (name === "associated") {
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          assignTo: selectedOption.username,
          assignToID: selectedOption.userID,
        }));
      }
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateTask = async () => {
    const ROWID = currentTask.id;
    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/tasks/${ROWID}`,
      {
        Status: currentTask.status,
        Description: currentTask.description,
        Assign_To: currentTask.assignTo,
        Assign_To_ID: currentTask.assignToID,
        ProjectID: currentTask.project,
        Project_Name: currentTask.project_name,
        Task_Name: currentTask.name,
        Start_Date: currentTask.startDate,
        End_Date: currentTask.endDate,
      }
    );

    setTasks((prev) =>
      prev.map((task) => (task.id === currentTask.id ? currentTask : task))
    );
    setCurrentTask("");
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "project") {
      const selectedOption = projects.find((option) => option.ROWID === value);

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
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
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
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
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: colors.primary,
                  width: 60,
                  height: 60,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  Tasks
                </Typography>
              </Box>
            </Box>
            <TextField
              label="Search Tasks"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ width: "40%" }}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {loading ? (
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
          ) : paginatedTasks.length === 0 ? (
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
                ) : paginatedTasks.length === 0 ? (
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
                    {paginatedTasks.map((task) => (
                      <TableRow key={task.ROWID}>
                        <TableCell>
                          {"T" + task.ROWID.substr(task.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{task.Task_Name}</TableCell>
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
                        <TableCell>{task.Start_Date}</TableCell>
                        <TableCell>{task.End_Date}</TableCell>
                        <TableCell>
                        <AccessTimeIcon
                          fontSize="large" // Use 'small', 'medium', 'large', or set via style
                          style={{
                            color: theme.palette.primary.main,
                            fontSize: 30, // You can increase this number as needed (e.g., 36, 40)
                            cursor: "pointer",
                          }}
                            onClick={() => handleViewTask(task)}
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
                      count={filteredTasks.length}
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
        <TimeEntry
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
    </Box>
  );
}

export default Task;
