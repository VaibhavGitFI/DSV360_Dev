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
  TablePagination,
  Modal,
  MenuItem,
  Paper,
  alpha,
  useTheme,
  Drawer,
  Select,
  InputLabel,
  Chip,
  Tooltip,
  Skeleton,
  FormControlLabel,
  Switch,
  Autocomplete,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableFooter,
  List,
  ListItem,
  Snackbar,
  Alert,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
   Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../Loader/Loader";
import Slide from "@mui/material/Slide";

function Badges() {
  const theme = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assigndrawer, setAssigndrawer] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [userBadges, setUserBadges] = useState(null);
  const [badgesDawer, setBadgesDrawer] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
 const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
 const [opendelete, setdeleteOpen] = useState(false);
 const[openAssignBadges, setAssignBadgesOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  

  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState({
    badges_Id: "",
    badges_name: "",
    badges_level: "",
  });

  const { data: employeesData } = useSelector((state) => state.employeeReducer);

  // console.log("Dataa sis ss", employeesData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const BadgesResponse = await axios.get(
          "/server/time_entry_management_application_function/badge"
        );

        if (BadgesResponse.status === 200) {
         // console.log("Badges Response:", BadgesResponse);
          setBadges(BadgesResponse.data.data);
        }
      //  console.log("Badges:", badges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      }
    };

    fetchData();
  }, []);

  // console.log("Employee data from Badges", employeesData);

  const [newBadges, setNewBadges] = useState({
    badges_Id: "",
    badges_name: "",
    badges_details: {
      badges_level: "",
      badges_logo: "",
    },
  });

  const [assignForm, setAssignForm] = useState({
    username: "",
    user_id: "",
    badge_name: "",
    badge_level: "",
    badge_id: "",
    badge_logo: "",
    profile_link: "",
    badgesRowID: "",
  });

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const AssignToggleDrawer = (open) => {
    setAssigndrawer(open);
  };

  const logoMapping = {
    Bronze:
      "https://dsv365-development.zohostratus.in/dsv365/Badges/Bronze-min.png",
    Silver:
      "https://dsv365-development.zohostratus.in/dsv365/Badges/Silver-min.png",
    Gold: "https://dsv365-development.zohostratus.in/dsv365/Badges/GOLD-min.png",
    Platinum:
      "https://dsv365-development.zohostratus.in/dsv365/Badges/Platinium-min.png",
    Diamond:
      "https://dsv365-development.zohostratus.in/dsv365/Badges/Diamond-min.png",
    Titanium:
      "https://dsv365-development.zohostratus.in/dsv365/Badges/Titanium-min.png",

    // Add more roles as necessary
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "badges_level") {
      setNewBadges((prev) => ({
        ...prev,
        badges_details: {
          ...prev.badges_details,
          badges_level: value,
          badges_logo: logoMapping[value],
        },
      }));
    } else {
      setNewBadges((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAssignInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "badge_name") {
      // Reset level, id, and logo when badge name changes
      setAssignForm((prev) => ({
        ...prev,
        badge_name: value,
        badge_level: "",
        badge_id: "",
        badge_logo: "",
      }));
    } else if (name === "badge_level") {
      // Find badge by name + level
      const selectedBadge = badges.find(
        (b) => b.Badge_Name === assignForm.badge_name && b.Badge_Level === value
      );
      if (selectedBadge) {
        setAssignForm((prev) => ({
          ...prev,
          badge_level: value,
          badge_id: selectedBadge.Badge_ID,
          badge_logo: selectedBadge.Badge_Logo,
          badgesRowID: selectedBadge.ROWID,
        }));
      }
    } else if (name === "username") {
      const selectedUser = employeesData.find(
        (u) => `${u.first_name} ${u.last_name}` === value
      );
      if (selectedUser) {
        setAssignForm((prev) => ({
          ...prev,
          username: value,
          user_id: selectedUser.user_id, // hidden
          profile_link: selectedUser.profile_pic, // hidden
        }));
      }
     // console.log("dsaDAD", assignForm);
    } else {
      setAssignForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddBadges = async () => {
    try {
    //  console.log("asdsadasd");
      const response = await axios.post(
        "/server/time_entry_management_application_function/badge",
        {
          Badge_ID: newBadges.badges_Id,
          Badge_Name: newBadges.badges_name,
          Badge_Level: newBadges.badges_details.badges_level,
          Badge_Logo: newBadges.badges_details.badges_logo,
        }
      );

      console.log("API Response:", response);

      if (response.status === 201) {
        // Ensure user details are correctly received
        const userDetails = response?.data?.data;

      //  console.log("dsggsd",userDetails);
        // Update employees state
        setBadges((prev) => {
          const updatedBadge = [...prev, userDetails];
       //   console.log("Updated Users List:", updatedBadge);
          return updatedBadge;

          
        });
        setNewBadges({
  badges_Id: "",
  badges_name: "",
  badges_details: {
    badges_level: "",
    badges_logo: "",
  },
});


        handleAlert("success", "Badges Add Successfully");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      handleAlert("error", error.message || "Something went wrong!");
    }
  };

  const handleSubmit = () => {
  //  console.log("Final newBadges:", newBadges);

    let newErrors = {};

    if (!newBadges.badges_Id) newErrors.badges_Id = "Badge ID is required";
    if (!newBadges.badges_name)
      newErrors.badges_name = "Badge name is required";
    if (!newBadges.badges_details.badges_level)
      newErrors.badges_level = "Please select a badge level";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleAddBadges(newBadges);
      toggleDrawer(false);
    }
  };

  const handleAssignSubmit = async () => {
    let newErrors = {};

    // ✅ Validation
    if (!assignForm.user_id) newErrors.username = "Please select a user";
    if (!assignForm.badge_name)
      newErrors.badge_name = "Please select a badge name";
    if (!assignForm.badge_level)
      newErrors.badge_level = "Please select a badge level";
    if (!assignForm.badge_id) newErrors.badge_id = "Badge ID is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // prepare payload
        const payload = {
          Username: assignForm.username,
          UserID: assignForm.user_id,
          BadgeRowID: assignForm.badge_id,
          Badge_Name: assignForm.badge_name,
          Badge_Level: assignForm.badge_level,
          Badge_Logo: assignForm.badge_logo,
          Profile_Link: assignForm.profile_link,
          Badge_ID: assignForm.badge_id,
        };

      //  console.log("Assign Badge Payload:", payload);

        // API call
        const res = await axios.post(
          "/server/time_entry_management_application_function/assignBadge",
          payload
        );

        if (res.status === 200 || res.status === 201) {
          handleAlert("success", "Badges Assign successfully");
          setAssigndrawer(false);

          // reset form
          setAssignForm({
            user_id: "",
            username: "",
            profile_link: "",
            badge_id: "",
            badge_name: "",
            badge_level: "",
            badge_logo: "",
          });

          // optional: refresh users list
          // if (typeof fetchUsers === "function") {
          //   await fetchUsers();
          // }
        } else {
          handleAlert("error", "Failed to Assign Badges");
        }
      } catch (error) {
        console.error("❌ Error assigning badge:", error);
        handleAlert("error", error.message || "Error Assigning Badges");
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = employeesData?.filter(
    (user) =>
      user?.first_name &&
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUser = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  //   const handleOpen = (user) => {
  //     setSelectedUser(user);
  //     setOpen(true);
  //   };

  const handleOpen = async (user) => {
    setSelectedUser(user);
    setOpen(true);
    setLoading(true);

    try {
      const response = await axios.get(
        `/server/time_entry_management_application_function/badge/${user.user_id}`
      );
    //  console.log("the isiss",response);

      setUserBadges(response?.data?.data || []); // Assuming this is always an array

    } catch (err) {
      console.error("Error fetching user badges:", err);
      setUserBadges([]); // fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleAttachementCloseSnackbar = (event, reason) => {
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

  const handleOpenDialog = (id) => {
    setDeleteId(id);
    setdeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteId(null);
    setdeleteOpen(false);
  };

  const handleAssignDeleteClose = () =>{
        setDeleteId(null);
      setAssignBadgesOpen(false);
  }
 



  const handleConfirmDelete = async () => {
   
  try {
    const response = await axios.delete(
      `/server/time_entry_management_application_function/badge/${deleteId}`
    );

    if (response.status === 200) {
      setBadges((prev) => prev.filter((b) => b.ROWID !== deleteId));
        handleAlert("success", "Badges Delete successfully");
    } else {
      console.error("Failed to delete badge:", response);
         handleAlert("error", "Error Found");
    }
  } catch (error) {
    console.error("Error deleting badge:", error);
      handleAlert("error", error.message || "Error Delete Badges");
  } finally {
      handleDeleteClose();
    }
};


  const handleEdit = (badge) => {
  //  console.log("Edit badge:", badge);
    setSelectedBadge(badge);
    setEditModal(true);
    // open form modal or inline editing
  };
const handleSave = async () => {
  let tempErrors = {};
  if (!selectedBadge.Badge_ID) tempErrors.Badge_ID = "Badge ID is required";
  if (!selectedBadge.Badge_Name) tempErrors.Badge_Name = "Badge Name is required";
  if (!selectedBadge.Badge_Level) tempErrors.Badge_Level = "Badge Level is required";
  if (!selectedBadge.Badge_Logo) tempErrors.Badge_Logo = "Badge Logo is required";

  setErrors(tempErrors);

  // stop execution if there are validation errors
  if (Object.keys(tempErrors).length > 0) return;

  try {
    const response = await axios.put(
      `/server/time_entry_management_application_function/badge/${
        selectedBadge.ROWID}`,
      {
        Badge_ID: String(selectedBadge.Badge_ID),
        Badge_Name: selectedBadge.Badge_Name,
        Badge_Level: selectedBadge.Badge_Level,
        Badge_Logo: selectedBadge.Badge_Logo,
      }
    );

    if (response.status === 200) {
      setBadges((prev) =>
        prev.map((b) =>
          String(b.Badge_ID) === String(selectedBadge.Badge_ID) ? selectedBadge : b
        )
      );
         handleAlert("success", "Badges Edit successfully");
      setEditModal(false);
    }
  } catch (error) {
    console.error("Error saving badge:", error);
      handleAlert("error", error.message || "Error Editing Badges");
  }
};


const handleConfirm = (id) => {
  //  console.log("sd",id)
  setDeleteId(id);
setAssignBadgesOpen(true);
};

const handleBadgeDelete = async () => {
  try {
    const res = await axios.delete(
      "/server/time_entry_management_application_function/assignBadge",
      {
        data: { rowIDs: [deleteId] }, // ✅ must be inside `data`
      }
    );


  //  console.log("Response:", res);

    if (res.status === 200) {
      setUserBadges((prev) => prev.filter((b) => b.ROWID !== deleteId));
      setAssignBadgesOpen(false); 
      setDeleteId(null) // close dialog after success
         handleAlert("success", "Badges Delete successfully");
    } else {
      console.error("Failed to delete badge:", res.statusText);
        handleAlert("error", "Error Found");
    }
  } catch (err) {
    console.error("Error deleting badge:", err);
     handleAlert("error", err.message || "Error Delete Badges");
  }
};



  return (
    <Box sx={{ padding: 3 }}>
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
            <BadgeOutlinedIcon sx={{ color: "#fff" }} fontSize="large" />
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
            Badges
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
            label="Search Users"
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
            Add Badges
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => AssignToggleDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Assign Badges
          </Button>
            <Button
            variant="contained"
            color="primary"
            onClick={() => setBadgesDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Show Badges
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Header with Search and New Project Button */}

        {/* Table */}
        <Grid size={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    User Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    User Id
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
                    Badges
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedUser?.map((user) => (
                  <TableRow key={user.user_id}
                    // sx={{
                    //     cursor: "pointer",
                    //     "&:hover": {
                    //       backgroundColor:
                    //         theme.palette.mode === "light"
                    //           ? "#e3f2fd"
                    //           : theme.palette.primary.dark,
                    //       color: theme.palette.primary.contrastText,
                    //     },
                    //   }}
                  >
                    <TableCell
                     
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <img
                          src={
                            user.profile_pic
                              ? user.profile_pic
                              : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                          }
                          alt="Profile"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        {user.first_name + " " + user.last_name}
                      </Box>
                    </TableCell>

                    <TableCell>
                      {" "}
                      {"U" + user.user_id.substr(user.user_id.length - 4)}
                    </TableCell>
                    <TableCell> {user.email_id}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpen(user)}
                      >
                        Badges
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 20]}
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
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
          {/* Header */}
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
              <BadgeOutlinedIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add Badges
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={() => toggleDrawer(false)}
                sx={{
                  color: "#fff",
                  transition: "transform 0.2s ease",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Badge ID */}
          <TextField
            label="Badge ID"
            name="badges_Id"
            fullWidth
            variant="outlined"
            value={newBadges.badges_Id}
            onChange={handleInputChange}
            error={!!errors.badges_Id}
            helperText={errors.badges_Id}
            sx={{ marginBottom: 2 }}
          />

          {/* Badge Name */}
          <TextField
            label="Badge Name"
            name="badges_name"
            fullWidth
            variant="outlined"
            value={newBadges.badges_name}
            onChange={handleInputChange}
            error={!!errors.badges_name}
            helperText={errors.badges_name}
            sx={{ marginBottom: 2 }}
          />

          {/* Badge Level */}
          <TextField
            label="Badge Level"
            name="badges_level"
            fullWidth
            variant="outlined"
            select
            value={newBadges.badges_details.badges_level}
            onChange={handleInputChange}
            error={!!errors.badges_level}
            helperText={errors.badges_level}
            sx={{ marginBottom: 2 }}
          >
            {Object.keys(logoMapping).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ width: 100 }}
            >
              Add
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

      <Drawer
        anchor="right"
        open={assigndrawer}
        onClose={() => AssignToggleDrawer(false)}
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
          {/* Header */}
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
              <BadgeOutlinedIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Assign Badges
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={() => AssignToggleDrawer(false)}
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

          {/* Username */}
          <Autocomplete
            options={employeesData}
            getOptionLabel={(option) =>
              option.first_name + " " + option.last_name
            }
            isOptionEqualToValue={(option, value) =>
              option.user_id === value.user_id
            }
            value={
              employeesData.find((emp) => emp.user_id === assignForm.user_id) ||
              null
            }
            onChange={(event, newValue) => {
              if (newValue) {
                setAssignForm((prev) => ({
                  ...prev,
                  username: newValue.first_name + " " + newValue.last_name,
                  user_id: newValue.user_id,
                  profile_link: newValue.profile_pic,
                }));
              } else {
                setAssignForm((prev) => ({
                  ...prev,
                  username: "",
                  user_id: "",
                  profile_link: "",
                }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Username"
                fullWidth
                variant="outlined"
                error={!!errors.username}
                helperText={errors.username}
                sx={{ marginBottom: 2 }}
              />
            )}
          />

          {/* Badge Name Dropdown */}
          <TextField
            label="Badge Name"
            name="badge_name"
            fullWidth
            select
            value={assignForm.badge_name}
            onChange={handleAssignInputChange}
            error={!!errors.badge_name}
            helperText={errors.badge_name}
            sx={{ marginBottom: 2 }}
          >
            {[...new Set(badges?.map((b) => b.Badge_Name))].map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          {/* Badge Level Dropdown */}
          <TextField
            label="Badge Level"
            name="badge_level"
            fullWidth
            select
            value={assignForm.badge_level}
            onChange={handleAssignInputChange}
            error={!!errors.badge_level}
            helperText={errors.badge_level}
            sx={{ marginBottom: 2 }}
            disabled={!assignForm.badge_name}
          >
            {badges
              ?.filter((b) => b.Badge_Name === assignForm.badge_name)
              ?.map((b) => (
                <MenuItem key={b.Badge_Level} value={b.Badge_Level}>
                  {b.Badge_Level}
                </MenuItem>
              ))}
          </TextField>

          {/* Auto-filled Badge ID */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TextField
              label="Badge ID"
              name="badge_id"
              value={assignForm.badge_id}
              fullWidth
              variant="outlined"
              InputProps={{ readOnly: true }}
              error={!!errors.badge_id}
              helperText={errors.badge_id}
              sx={{ flex: 7 }}
            />

            {assignForm.badge_logo && (
              <Box sx={{ flex: 3, textAlign: "center" }}>
                <img
                  src={assignForm.badge_logo}
                  alt="Badge Logo"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignSubmit}
              sx={{ width: 120 }}
            >
              Assign
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => AssignToggleDrawer(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "60%", lg: "50%" },
            maxHeight: "80vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 24,
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
             color={theme.palette.text.secondary}
          >
            {selectedUser?.first_name}’s Badges
          </Typography>

          {/* 🔄 Loader */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <Loader />
            </Box>
          ) : userBadges?.length === 0 ? (
            // 🛑 No badges message
            <Typography
              variant="body1"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 4 }}
            >
              This user has no badges yet.
            </Typography>
          ) : (
            // ✅ Badge Grid
          <Grid container spacing={2} mt={1}>
  {userBadges?.map((badge) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={badge.badge_id}>
 <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    p: 2,
    borderRadius: 3,
    transition: "transform 0.6s ease, box-shadow 0.6s ease",
    transformStyle: "preserve-3d",
    "&:hover": {
      transform: "scale(1.15) rotateY(15deg) rotateX(8deg)",
      boxShadow: "0 0 25px rgba(0, 200, 255, 0.7)",
    },
  }}
>
  {/* ❌ Cross button */}
  <IconButton
    size="small"
    sx={{
      position: "absolute",
      top: 8,
      right: 8,
      bgcolor: "error.main",
      color: "white",
      "&:hover": { bgcolor: "error.dark" },
    }}
    onClick={() => handleConfirm(badge.ROWID)}
  >
    <CloseIcon fontSize="small" />
  </IconButton>

  {/* Badge Logo with floating + rotating animation */}
  <Avatar
    src={badge.Badge_Logo}
    alt={badge.Badge_Name}
    sx={{
      width: 100,
      height: 100,
      mb: 1,
      animation: "float 3s ease-in-out infinite, spin 8s linear infinite",
      boxShadow: "0 0 20px rgba(0, 255, 180, 0.8)",
      border: "2px solid rgba(0, 255, 180, 0.7)",
    }}
  />

  {/* Glowing text */}
  <Typography
    variant="subtitle1"
    fontWeight={700}
    sx={{
      textShadow: "0 0 10px rgba(0,255,200,0.9), 0 0 20px rgba(0,255,200,0.7)",
    }}
  >
    {badge.Badge_Name}
  </Typography>
  <Typography
    variant="body2"
    fontStyle="italic"
    sx={{
      color: "text.secondary",
      textShadow: "0 0 8px rgba(0,150,255,0.7)",
    }}
  >
    {badge.Badge_Level}
  </Typography>
</Box>

{/* animations */}
<style>
{`
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes spin {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}
`}
</style>


{/* floating keyframes */}
<style>
{`
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}
`}
</style>

    </Grid>
  ))}
</Grid>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleClose}
            sx={{
              mt: 3,
              borderRadius: "20px",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>

    <Drawer anchor="right" open={badgesDawer} onClose={() => setBadgesDrawer(false)}>
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
              <BadgeOutlinedIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                All Badges
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={() => setBadgesDrawer(false)}
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


          <List>
            {badges.map((badge) => (
              <ListItem
                key={badge.Badge_ID}
                sx={{
                  mb: 1,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={badge.Badge_Logo}
                    alt={badge.Badge_Name}
                    sx={{ width: 50, height: 50 }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={badge.Badge_Name}
                  secondary={`Level: ${badge.Badge_Level}`}
                />

                <ListItemSecondaryAction>
                  <Tooltip title="Edit">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(badge)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDialog(badge.ROWID)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Modal open={editModal} onClose={() => setEditModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography variant="h6" mb={2}>
            Edit Badge

         

          </Typography>
          {selectedBadge && (
            <>
              
<TextField
  label="Badge ID"
  fullWidth
  sx={{ mb: 2 }}
  value={selectedBadge.Badge_ID}
  onChange={(e) =>
    setSelectedBadge({ ...selectedBadge, Badge_ID: e.target.value })
  }
  error={!!errors.Badge_ID}
  helperText={errors.Badge_ID}
/>

<TextField
  label="Badge Name"
  fullWidth
  sx={{ mb: 2 }}
  value={selectedBadge.Badge_Name}
  onChange={(e) =>
    setSelectedBadge({ ...selectedBadge, Badge_Name: e.target.value })
  }
  error={!!errors.Badge_Name}
  helperText={errors.Badge_Name}
/>

<TextField
  label="Badge Level"
  name="Badge_Level"
  fullWidth
  select
  value={selectedBadge?.Badge_Level || ""}
  onChange={(e) => {
    const level = e.target.value;
    setSelectedBadge({
      ...selectedBadge,
      Badge_Level: level,
      Badge_Logo: logoMapping[level] || "",
    });
  }}
  sx={{ mb: 2 }}
  error={!!errors.Badge_Level}
  helperText={errors.Badge_Level}
>
  {Object.keys(logoMapping).map((level) => (
    <MenuItem key={level} value={level}>
      {level}
    </MenuItem>
  ))}
</TextField>

<TextField
  label="Badge Logo URL"
  fullWidth
  sx={{ mb: 2 }}
  value={selectedBadge?.Badge_Logo || ""}
  InputProps={{ readOnly: true }}
  error={!!errors.Badge_Logo}
  helperText={errors.Badge_Logo}
/>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button onClick={() => setEditModal(false)} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                  Save
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
     
       <Dialog open={opendelete} onClose={handleDeleteClose}
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
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>Confirm Deletion</DialogTitle>
         <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete badge{" "}
        
          </DialogContentText>
        </DialogContent>
        <DialogActions  sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleDeleteClose} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={handleConfirmDelete}  variant="contained"
            color="error"
            autoFocus
            >
            Delete
          </Button>
        </DialogActions>
      </Dialog>


       <Dialog open={openAssignBadges} onClose={handleAssignDeleteClose}
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
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>Confirm Deletion</DialogTitle>
         <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete badge dsadasds{" "}
        
          </DialogContentText>
        </DialogContent>
        <DialogActions  sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleAssignDeleteClose} variant="outlined" color="primary">Cancel</Button>
          <Button onClick={handleBadgeDelete}  variant="contained"
            color="error"
            autoFocus
            >
            Delete
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
}

export default Badges;
