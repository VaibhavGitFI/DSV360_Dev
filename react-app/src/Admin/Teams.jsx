import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Paper,
  alpha,
  useTheme,
  Avatar,
  Drawer,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
function TeamManagement() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [draggedUser, setDraggedUser] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [teamMembersMap, setTeamMembersMap] = useState({});
  

 const scrollContainerRef = React.useRef(null);


 const handleDragOverContainer = (e) => {
  e.preventDefault(); // Necessary to allow drop
  
  if (!scrollContainerRef.current) return;

  const container = scrollContainerRef.current;
  const { left, right } = container.getBoundingClientRect();
  const edgeSize = 100; // Distance from edge in px to start scrolling
  const scrollSpeed = 15;

  // Scroll Right
  if (e.clientX > right - edgeSize) {
    container.scrollLeft += scrollSpeed;
  }
  // Scroll Left
  else if (e.clientX < left + edgeSize) {
    container.scrollLeft -= scrollSpeed;
  }
};

  const buildTeamMembersMap = (employees) => {
  const map = {};

  employees.forEach((user) => {
    const teamId = user.teamID; // or user.team_id (use correct key)

    if (teamId) {
      if (!map[teamId]) {
        map[teamId] = [];
      }
      map[teamId].push(user);
    }
  });

  setTeamMembersMap(map);
};


  const [newTeam, setNewTeam] = useState({
    Team_Name: "",
    Team_Reporting_Manager_ID: "",
  });

  const [currentTeam, setCurrentTeam] = useState({
    ROWID: "",
    Team_Name: "",
    Team_Reporting_Manager_ID: "",
  });

  const [errors, setErrors] = useState({});
  const [teamSearchQueries, setTeamSearchQueries] = useState({});
  const [managers, setManagers] = useState([]);
  const [unassignedSearchQuery, setUnassignedSearchQuery] = useState("");

  const placeholderURL =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";


  const { data: employeeData } = useSelector((state) => state.employeeReducer);

  // console.log("employeedara",employeeData)
    
// 1. Monitor employeeData changes specifically to rebuild the maps
useEffect(() => {
  if (employeeData && employeeData.length > 0) {
    // Update local users state
    setUsers(employeeData);
    
    // Re-run the mapping logic whenever the main employee list updates
    buildTeamMembersMap(employeeData);
   console.log("employeedata",employeeData)
    // Update managers
    // const managersList = employeeData.filter(
    //   (user) => user.role_details?.role_id === "17682000000035348"
    // );
    const managersList = employeeData.filter(
  (user) =>
    user.role_details?.role_name === "Admin" ||
    user.role_details?.role_id === "17682000000035348"
);

    setManagers(managersList);

    // Update unassigned users
    const unassigned = employeeData.filter((user) => !user.teamID);
    setUnassignedUsers(unassigned);
  }
}, [employeeData]); // This triggers whenever Redux finishes loading

// 2. Fetch Teams only once on mount
useEffect(() => {
  const fetchTeamsOnly = async () => {
    try {
      setLoading(true);
      const teamsResponse = await axios.get("/server/time_entry_management_application_function/team");
      const teamsData = teamsResponse.data.success ? teamsResponse.data.data : [];
      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTeamsOnly();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);

    // Fetch teams
    const teamsResponse = await axios.get("/server/time_entry_management_application_function/team");

    const teamsData = teamsResponse.data.success ? teamsResponse.data.data : [];
    setTeams(teamsData);

    // Fetch users
    let employees = employeeData;

    if (!Array.isArray(employeeData) || employeeData.length === 0) {
      employees = await dispatch(fetchEmployees()).unwrap(); // fetch and get result
    }


    setUsers(employees);
   buildTeamMembersMap(employees)

    // Filter managers (Manager or Team Lead roles)
    const managersList = employees.filter(
      (user) => user.role_details.role_id === "17682000000035348"
    );
    setManagers(managersList);

    // Filter unassigned users
    const unassigned = employees.filter(
      (user) => !user.teamID
    );
    setUnassignedUsers(unassigned);



    setLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
    handleAlert("error", "Failed to fetch data");
    setLoading(false);
  }
};


  const handleAlert = (type, label) => {
    setShow(false);
    setTimeout(() => {
      setalerttype(type);
      setAlertLabel(label);
      setShow(true);
      setTimeout(() => {
        setShow(false);
        setAlertLabel("");
      }, 3000);
    }, 100);
  };

  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  // Drag and Drop Handlers
  const handleDragStart = (e, user) => {
    console.log("user",user)
    setDraggedUser(user);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

const handleDropOnTeam = (e, team) => {
  e.preventDefault();
  if (!draggedUser) return;

  if (draggedUser.teamID === team.ROWID) {
    handleAlert("info", "User already in this team");
    setDraggedUser(null);
    return;
  }

  const updatedUsers = users.map(user =>
    user.user_id === draggedUser.user_id
      ? {
          ...user,
          teamID: team.ROWID,
          team: team.Team_Name,
        }
      : user
  );

  setUsers(updatedUsers);
  setUnassignedUsers(updatedUsers.filter(u => !u.teamID));
  buildTeamMembersMap(updatedUsers);

  setPendingChanges(prev => {
    const exists = prev.find(p => p.user_id === draggedUser.user_id);
    if (exists) {
      return prev.map(p =>
        p.user_id === draggedUser.user_id
          ? { ...p, teamID: team.ROWID }
          : p
      );
    }
    return [...prev, { user_id: draggedUser.user_id, teamID: team.ROWID }];
  });

  setHasUnsavedChanges(true);
  setDraggedUser(null);

  handleAlert(
    "success",
    `${draggedUser.first_name} moved to ${team.Team_Name}`
  );
};


  const handleDropOnUnassigned = (e) => {
  e.preventDefault();
  if (!draggedUser) return;

  if (!draggedUser.teamID) {
    handleAlert("info", "User already unassigned");
    setDraggedUser(null);
    return;
  }

  const updatedUsers = users.map(user =>
    user.user_id === draggedUser.user_id
      ? { ...user, teamID: null, team: null }
      : user
  );

  setUsers(updatedUsers);
  setUnassignedUsers(updatedUsers.filter(u => !u.teamID));
  buildTeamMembersMap(updatedUsers);

  setPendingChanges(prev => {
    const exists = prev.find(p => p.user_id === draggedUser.user_id);
    if (exists) {
      return prev.map(p =>
        p.user_id === draggedUser.user_id
          ? { ...p, teamID: null }
          : p
      );
    }
    return [...prev, { user_id: draggedUser.user_id, teamID: null }];
  });

  setHasUnsavedChanges(true);
  setDraggedUser(null);

  handleAlert("success", "User moved to unassigned");
};


  // Save all changes to database
const handleSaveChanges = async () => {
  if (pendingChanges.length === 0) {
    handleAlert("info", "No changes to save");
    return;
  }

  try {
    setLoading(true);

    // Group users by TeamID
    const teamMap = {};

    pendingChanges.forEach(({ user_id, teamID }) => {
      if (!teamMap[teamID]) {
        const team = teams.find(t => t.ROWID === teamID);

        teamMap[teamID] = {
          TeamID: teamID || "",
          TeamName: team ? team.Team_Name : "",
          User_Id: [],
        };
      }

      teamMap[teamID].User_Id.push(user_id);
    });

    // Call API per team
    const responses = await Promise.all(
      Object.values(teamMap).map(payload =>
        axios.post(
          "/server/time_entry_management_application_function/team/assign",
          payload
        )
      )
    );

    // 🔥 Update users locally using API response
    let updatedUsers = [...users];

    responses.forEach(res => {
      if (res.data.success) {
        res.data.data.forEach(updatedUser => {
          updatedUsers = updatedUsers.map(user =>
            user.user_id === updatedUser.User_Id
              ? {
                  ...user,
                  teamID: updatedUser.TeamID,
                  team: updatedUser.TeamName,
                }
              : user
          );
        });
      }
    });

    // Update all local states
    setUsers(updatedUsers);
    setUnassignedUsers(updatedUsers.filter(u => !u.teamID));
    buildTeamMembersMap(updatedUsers);

    setPendingChanges([]);
    setHasUnsavedChanges(false);

    handleAlert("success", "All changes saved successfully");
  } catch (error) {
    console.error("Error saving changes:", error);
    handleAlert("error", "Failed to save changes");
  } finally {
    setLoading(false);
  }
};

  
  // Team CRUD Operations
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
    if (!open) {
      setNewTeam({
        Team_Name: "",
        Team_Reporting_Manager_ID: "",
      });
      setErrors({});
    }
  };

  const toggleEditDrawer = (open) => {
    setEditDrawerOpen(open);
    if (!open) {
      setCurrentTeam({
        ROWID: "",
        Team_Name: "",
        Team_Reporting_Manager_ID: "",
      });
      setErrors({});
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!newTeam.Team_Name.trim())
      tempErrors.Team_Name = "Team Name is required";
    if (!newTeam.Team_Reporting_Manager_ID)
      tempErrors.Team_Reporting_Manager_ID = "Reporting Manager is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateEditForm = () => {
    let tempErrors = {};
    if (!currentTeam.Team_Name.trim())
      tempErrors.Team_Name = "Team Name is required";
    if (!currentTeam.Team_Reporting_Manager_ID)
      tempErrors.Team_Reporting_Manager_ID = "Reporting Manager is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTeam((prev) => ({ ...prev, [name]: value }));
  };

  // const handleManagerChange = (event) => {
  //   const managerId = event.target.value;
  //   const selectedManager = managers.find((m) => m.User_Id === managerId);
    
  //   setNewTeam((prev) => ({
  //     ...prev,
  //     Team_Reporting_Manager_ID: managerId,
  //     Team_Reporting_Manager: selectedManager?.Username || "",
  //     Team_Reporting_Manager_Profile: selectedManager?.Profile_Link || "",
  //     Org_Id: selectedManager?.OrgID || "",
  //   }));
  // };
const handleManagerChange = (event) => {
  const managerId = event.target.value;
  console.log("managerId:", managerId);

  const selectedManager = managers.find(
    (m) => m.user_id === managerId
  );

  // console.log("selectedManager:", selectedManager);

  setNewTeam((prev) => ({
    ...prev,
    Team_Reporting_Manager_ID: selectedManager.user_id,
    Team_Reporting_Manager:`${selectedManager.first_name} ${selectedManager.last_name}`,
    Team_Reporting_Manager_Profile: selectedManager?.profile_pic || "",
    Org_Id: selectedManager?.org_id || "",

  }));
};




  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentTeam((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditManagerChange = (event) => {
    const managerId = event.target.value;
    const selectedManager = managers.find((m) => m.user_id === managerId);
    
    // console.log('se',selectedManager)
    setCurrentTeam((prev) => ({
      ...prev,
      Team_Reporting_Manager_ID: managerId,
      Team_Reporting_Manager: selectedManager?.first_name + selectedManager.last_name || "",
      Team_Reporting_Manager_Profile: selectedManager?.profile_pic || "",
      Org_Id: selectedManager?.org_id || "",
    }));
  };

  const handleAddTeam = async () => {
    if (validateForm()) {
      try {
        const selectedManager = managers.find((m) => m.user_id === newTeam.Team_Reporting_Manager_ID);
        
        const teamData = {
          Team_Name: newTeam.Team_Name,
          Team_Reporting_Manager_ID: newTeam.Team_Reporting_Manager_ID,
          Team_Reporting_Manager: newTeam?.Team_Reporting_Manager,
          Team_Reporting_Manager_Profile: newTeam?.Team_Reporting_Manager_Profile || placeholderURL,
          Org_Id: newTeam?.Org_Id || "",
        };
        
        const response = await axios.post(
          "/server/time_entry_management_application_function/team",
          teamData
        );
        
        if (response.data.success) {
          handleAlert("success", "Team added successfully");
          toggleDrawer(false);
          await fetchData();
        } else {
          handleAlert("error", response.data.message || "Failed to add team");
        }
      } catch (error) {
        console.error("Error adding team:", error);
        handleAlert("error", error.response?.data?.message || "Failed to add team");
      }
    }
  };

  const handleEdit = (team) => {
    setCurrentTeam({
      ROWID: team.ROWID,
      Team_Name: team.Team_Name || "",
      Team_Reporting_Manager_ID: team.Team_Reporting_Manager_ID || "",
    });
    toggleEditDrawer(true);
  };

  const handleUpdateTeam = async () => {
    if (validateEditForm()) {
      try {
        const selectedManager = managers.find((m) => m.user_id === currentTeam.Team_Reporting_Manager_ID);
        
        const teamData = {
          Team_Name: currentTeam.Team_Name,
          Team_Reporting_Manager_ID: currentTeam.Team_Reporting_Manager_ID,
          Team_Reporting_Manager: currentTeam?.Team_Reporting_Manager || "",
          Team_Reporting_Manager_Profile: currentTeam?.Team_Reporting_Manager_Profile || "",
          Org_Id: currentTeam?.Org_Id || "",
        };
        
        const response = await axios.put(
          `/server/time_entry_management_application_function/team?ROWID=${currentTeam.ROWID}`,
          teamData
        );

        if (response.data.success) {
          handleAlert("success", "Team updated successfully");
          toggleEditDrawer(false);
          await fetchData();
        } else {
          handleAlert("error", response.data.message || "Failed to update team");
        }
      } catch (error) {
        console.error("Error updating team:", error);
        handleAlert("error", error.response?.data?.message || "Failed to update team");
      }
    }
  };

  const handleDeleteClick = (team) => {
    const teamMembers = getTeamMembers(team.ROWID);
    
    // Check if team has members
    if (teamMembers.length > 0) {
      handleAlert("error", `Cannot delete team with ${teamMembers.length} member(s). Please reassign members first.`);
      return;
    }
    
    setSelectedTeam(team);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `/server/time_entry_management_application_function/team?ROWID=${selectedTeam.ROWID}`
      );

      if (response.data.success) {
        handleAlert("success", "Team deleted successfully");
        setDeleteModalOpen(false);
        setSelectedTeam(null);
        await fetchData();
      } else {
        handleAlert("error", response.data.message || "Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      handleAlert("error", error.response?.data?.message || "Failed to delete team");
    }
  };

 


//   const getTeamMembers = (teamId) => {
//   return teamMembersMap[teamId] || [];
// };

 

//   const getFilteredTeamMembers = (teamId) => {
//   const members = getTeamMembers(teamId);
//   const query = teamSearchQueries[teamId] || "";

//   if (!query.trim()) return members;

//   return members.filter((user) =>
//     `${user.first_name} ${user.last_name}`
//       .toLowerCase()
//       .includes(query.toLowerCase()) ||
//     user.phone?.includes(query)
//   );
// };

// This function now looks at the source of truth (users state)
const getTeamMembers = (teamId) => {
  // Use 'users' or 'employeeData' (the array of all employees)
  return users.filter((user) => String(user.teamID) === String(teamId));
};

const getFilteredTeamMembers = (teamId) => {
  const members = getTeamMembers(teamId);
  const query = (teamSearchQueries[teamId] || "").toLowerCase().trim();

  if (!query) return members;

  return members.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const phone = user.phone || "";
    return fullName.includes(query) || phone.includes(query);
  });
};


  const handleTeamSearch = (teamId, query) => {
    setTeamSearchQueries((prev) => ({
      ...prev,
      [teamId]: query,
    }));
  };

  const getFilteredUnassignedUsers = () => {
    if (!unassignedSearchQuery.trim()) {
      return unassignedUsers;
    }
    
    return unassignedUsers.filter((user) =>
      user.first_name?.toLowerCase().includes(unassignedSearchQuery.toLowerCase()) ||
      user.Phone?.includes(unassignedSearchQuery)
    );
  };




  return (
    <Box sx={{ padding: 3,   }}>
      <Snackbar
        open={show}
        onClose={() => setShow(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        TransitionComponent={SlideTransition}
      >
        <Alert severity={alerttype} onClose={() => setShow(false)}>
          {alertLabel}
        </Alert>
      </Snackbar>

      {/* Header */}
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
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 50,
                height: 50,
              }}
            >
              <GroupsIcon sx={{ color: "#fff" }} fontSize="large" />
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
              Team Management
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => toggleDrawer(true)}
            >
              Add Team
            </Button>
            <Badge badgeContent={pendingChanges.length} color="error">
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges}
              >
                Save Changes
              </Button>
            </Badge>
          </Box>
        </Box>
      </Paper>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="70%" height={40} />
                  <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // <Grid container spacing={3}
        
        // >
      <Grid
  container
  spacing={3}
  wrap="nowrap"
  ref={scrollContainerRef}
  onDragOver={handleDragOverContainer}
  sx={{
    overflowX: "auto",
    flexWrap: "nowrap",
    pb: 3, // Increased padding for shadow clearance
    px: 1,
    "&::-webkit-scrollbar": { height: "6px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.divider,
      borderRadius: "10px",
      "&:hover": { backgroundColor: alpha(theme.palette.text.secondary, 0.4) }
    },
  }}
>
  {/* Section Wrapper - Shared by Unassigned & Teams */}
  {[ 
    { isUnassigned: true }, 
    ...teams 
  ].map((item, index) => {
    const isUnassigned = item.isUnassigned;
    const team = !isUnassigned ? item : null;
    
    // Logic for members
    const members = isUnassigned ? getFilteredUnassignedUsers() : getFilteredTeamMembers(team.ROWID);
    const totalCount = isUnassigned ? unassignedUsers.length : getTeamMembers(team.ROWID).length;
    const accentColor = isUnassigned ? theme.palette.warning.main : theme.palette.primary.main;

    return (
      <Grid size="auto" key={isUnassigned ? "unassigned" : team.ROWID} sx={{ minWidth: 340 }}>
        <Card
          elevation={0}
          sx={{
            height: "calc(100vh - 250px)",
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: alpha(accentColor, 0.4),
              boxShadow: `0 8px 24px ${alpha(accentColor, 0.08)}`,
            },
          }}
          onDragOver={handleDragOver}
          onDrop={isUnassigned ? handleDropOnUnassigned : (e) => handleDropOnTeam(e, team)}
        >
          {/* Header Section */}
          <Box sx={{ p: 2.5, pb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(accentColor, 0.1),
                    color: accentColor,
                    width: 42,
                    height: 42,
                    borderRadius: 2, // Modern squircle shape
                  }}
                >
                  {isUnassigned ? <PersonIcon /> : <GroupsIcon />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {isUnassigned ? "Unassigned" : team.Team_Name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {totalCount} {totalCount === 1 ? "Member" : "Members"}
                  </Typography>
                </Box>
              </Box>
              {!isUnassigned && (
                <Box>
                  <IconButton size="small"  
                  sx={{ 
        color: 'primary.main', // 👈 Specific color
        bgcolor: alpha(theme.palette.primary.main, 0.05), // 👈 Soft background
        "&:hover": {
          bgcolor: alpha(theme.palette.primary.main, 0.15),
        }
      }}
                  onClick={() => handleEdit(team)} >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small"
                  sx={{ 
        color: 'error.main', // 👈 Red for delete
        bgcolor: alpha(theme.palette.error.main, 0.05),
        "&:hover": {
          bgcolor: alpha(theme.palette.error.main, 0.15),
        }
      }}
                  onClick={() => handleDeleteClick(team)} >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder={isUnassigned ? "Search unassigned..." : "Search members..."}
              value={isUnassigned ? unassignedSearchQuery : (teamSearchQueries[team.ROWID] || "")}
              onChange={(e) => isUnassigned ? setUnassignedSearchQuery(e.target.value) : handleTeamSearch(team.ROWID, e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.disabled", fontSize: 18 }} />,
              }}
             sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      // Uses a very light grey (almost white) that works perfectly in light mode
      bgcolor: theme.palette.mode === 'light' ? "#e4e5e6ff" : alpha(theme.palette.common.white, 0.05),
      transition: "background-color 0.2s",
      "& fieldset": { 
        borderColor: "transparent", 
      },
      "&:hover": {
        bgcolor: theme.palette.mode === 'light' ? "#f3f4f6" : alpha(theme.palette.common.white, 0.08),
      },
      "&:hover fieldset": { 
        borderColor: theme.palette.divider, 
      },
"&.Mui-focused": {
  bgcolor: theme.palette.mode === 'light'
    ? "#f1f3f5"   // slightly lighter, not white
    : alpha(theme.palette.common.white, 0.1),
  "& fieldset": {
    borderColor: accentColor,
    borderWidth: "1px",
  },
      }
    },
  }}
            />
          </Box>

          {/* List Section */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              pb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {members.map((user) => (
              <Paper
                key={user.user_id}
                draggable
                onDragStart={(e) => handleDragStart(e, user)}
                elevation={0}
                sx={{
                  p: 1.25,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  cursor: "grab",
                  transition: "transform 0.1s, box-shadow 0.1s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: theme.shadows[2],
                    borderColor: alpha(accentColor, 0.3),
                  },
                  "&:active": { cursor: "grabbing" },
                }}
              >
                <DragIndicatorIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                <Avatar
                  src={user.profile_pic || placeholderURL}
                  sx={{ width: 36, height: 36, border: `1px solid ${theme.palette.divider}` }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }} noWrap>
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }} noWrap>
                    {user.phone || "No phone"}
                  </Typography>
                </Box>
              </Paper>
            ))}

            {/* Empty States */}
            {members.length === 0 && (
              <Box sx={{ textAlign: "center", py: 4, opacity: 0.6 }}>
                <Typography variant="body2" color="text.secondary">
                  {totalCount > 0 ? "No matches found" : isUnassigned ? "All users assigned" : "Drag users here"}
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Grid>
    );
  })}
</Grid>
      )}

      {/* Add Team Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => toggleDrawer(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Add New Team</Typography>
            <IconButton onClick={() => toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Team Name"
            name="Team_Name"
            value={newTeam.Team_Name}
            onChange={handleInputChange}
            error={!!errors.Team_Name}
            helperText={errors.Team_Name}
            sx={{ mb: 2 }}
          />

         <FormControl fullWidth error={!!errors.Team_Reporting_Manager_ID} sx={{ mb: 2 }}>
  <InputLabel>Reporting Manager</InputLabel>

  <Select
    value={newTeam.Team_Reporting_Manager_ID || ""}
    onChange={handleManagerChange}
    label="Reporting Manager"
  >
    {managers.map((manager) => (
      <MenuItem key={manager.user_id} value={manager.user_id}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={manager.profile_pic || placeholderURL}
            sx={{ width: 24, height: 24 }}
          />
          <Typography>
            {manager.first_name} {manager.last_name}
          </Typography>
        </Box>
      </MenuItem>
    ))}
  </Select>

  {errors.Team_Reporting_Manager_ID && (
    <FormHelperText>{errors.Team_Reporting_Manager_ID}</FormHelperText>
  )}
</FormControl>


          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="outlined" fullWidth onClick={() => toggleDrawer(false)}>
              Cancel
            </Button>
            <Button variant="contained" fullWidth onClick={handleAddTeam}>
              Add Team
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Team Drawer */}
      <Drawer
        anchor="right"
        open={editDrawerOpen}
        onClose={() => toggleEditDrawer(false)}
      >
        <Box sx={{ width: 400, p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Edit Team</Typography>
            <IconButton onClick={() => toggleEditDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Team Name"
            name="Team_Name"
            value={currentTeam.Team_Name}
            onChange={handleEditInputChange}
            error={!!errors.Team_Name}
            helperText={errors.Team_Name}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth error={!!errors.Team_Reporting_Manager_ID} sx={{ mb: 2 }}>
            <InputLabel>Reporting Manager</InputLabel>
            <Select
              value={currentTeam.Team_Reporting_Manager_ID}
              onChange={handleEditManagerChange}
              label="Reporting Manager"
            >
              {managers.map((manager) => (
                <MenuItem key={manager.user_id} value={manager.user_id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={manager.profile_pic || placeholderURL}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography>{manager.first_name + manager.last_name}</Typography>
                  
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.Team_Reporting_Manager_ID && (
              <FormHelperText>{errors.Team_Reporting_Manager_ID}</FormHelperText>
            )}
          </FormControl>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => toggleEditDrawer(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" fullWidth onClick={handleUpdateTeam}>
              Update Team
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the team "{selectedTeam?.Team_Name}"?
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            All members will be moved to unassigned.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamManagement;
