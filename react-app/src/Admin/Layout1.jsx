import * as React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import { CircularProgress, Snackbar, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ForumIcon from "@mui/icons-material/Forum";
import GroupIcon from "@mui/icons-material/Group";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { BugReport } from "@mui/icons-material";
import Person4Icon from "@mui/icons-material/Person4";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useDispatch, useSelector } from "react-redux";
import { hideSnackbar } from "../redux/Snackbar/SnackbarSlice"
import CloseIcon from "@mui/icons-material/Close";
import {Paper} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FI_logo from "../../public/FI_logo.png";
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

import GroupsIcon from '@mui/icons-material/Groups';





export default function Layout1() {
  const dispatch = useDispatch();

    const { openSnackbar, message, loading, action } = useSelector(
      (state) => state.snackbar
    );


  

  const [open, setOpen] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [colorCode] = useState('#1976d2');
  const [anchorEl, setAnchorEl] = React.useState(null); // State to manage dropdown menu anchor
  const [userProfile, setUserProfile] = useState();
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation

  const isMobile = useMediaQuery("(max-width:600px)");
  const {data:AdminData }= useSelector((state) => state.AdminSlice);

  const toggleMenu = () => setOpen(!open);
  const toggleTheme = () => {
    localStorage.setItem("darkMode", !darkMode);
    setDarkMode(!darkMode);
  };


  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: AdminData?.Org_Theme || colorCode,
      },
      background: {
        default: darkMode ? "#121212" : "#fafafa", // Dark mode background and light mode background
        paper: darkMode ? "#1d1d1d" : "#fff", // Color for cards, dropdowns, etc.
      },
    },
  });

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Projects", icon: <AssignmentIcon />, path: "/projects" },
    {
      text: "Tasks",
      icon: <FormatListBulletedIcon />,
      path: "/task",
    },
    { text: "Issues", icon: <BugReport />, path: "/bug" },
    { text: "Accounts", icon: <Person4Icon />, path: "/client" },

    {text: "Client Contacts",icon: <ConnectWithoutContactIcon />,path: "/clientStaff",},
    { text: "Badges", icon: <BadgeOutlinedIcon />, path: "/badges" },
    { text: "Users", icon: <GroupIcon />, path: "/employees" },
    // { text: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
    { text: "People", icon: < ManageAccountsIcon/>, path: "/peoples" },
     { text: "Teams", icon: < GroupsIcon/>, path: "/teams" },
    //  { text: "Expenses", icon: <CurrencyExchangeIcon />, path: "/expense" },
     { text: "DSV-AI", icon: <SmartToyIcon />, path: "/aiBot" },

    { text: "Feedback", icon: <ForumIcon />, path: "/feedback" },
    { text: "Sprints", icon: <AccountTreeIcon />, path: "/sprints" },
    { text: "Calendar", icon: <AssignmentIcon />, path: "/calendar" },
  
   
  ];
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

//   useEffect(() => {
//     fetchData();
//   },[]);

//  const fetchData = async () => {
//   const profile = localStorage.getItem("profileData");
//   setUserProfile(profile);
// };

  useEffect(() => {
    const profile = localStorage.getItem("profileData");
    setUserProfile(profile);
  }, [location.pathname]);



  const handleLogout = async () => {
    if (window && window.catalyst) {
      let redirectURL = "/__catalyst/auth/login";
      try {
        await window.catalyst.auth.signOut(redirectURL);
        setTimeout(() => {
          navigate("login");
        }, 2000);
        localStorage.clear();
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      console.error("Catalyst is not initialized. Cannot log out.");
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget); // Set the menu anchor element
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu by clearing the anchor element
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile section
    handleMenuClose(); // Close the menu after redirecting
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
        {/* Top Navbar */}
        
            <AppBar
          position="sticky"
          sx={{
            bgcolor: theme.palette.background.default,
            color: "primary.main",
            boxShadow: 1,
            zIndex: 1205,
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
  {/* LEFT SECTION — Menu + App Name */}
  <Box display="flex" alignItems="center" gap={1}>
    <IconButton onClick={toggleMenu} color="inherit" sx={{ fontSize: 32 }}>
      {open ? <MenuOpenIcon /> : <MenuIcon />}
    </IconButton>

    <img
      src={FI_logo}
      alt="logo"
      style={{ maxHeight: "40px", marginRight: "10px" }}
    />

    <Typography
      variant="h5"
      sx={{
        fontSize: { xs: "1rem", sm: "1.25rem" },
        fontWeight: "700",
        whiteSpace: "nowrap",
        color: "#2a3eb1",
        display: { xs: "none", sm: "block" }, // hide on mobile
      }}
    >
      DSV-360
    </Typography>
  </Box>

  {/* RIGHT SECTION — Theme Toggle + Capsule Box */}
  <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
    {/* Theme Toggle (outside capsule) */}
     <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"} arrow>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          fontSize: 26,
          ml: { xs: 0.5, sm: 1 },
        }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>

    {/* Capsule Box — Org Logo + Name + Avatar */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 0.8, sm: 1.2 },
        bgcolor: theme.palette.background.paper,
        borderRadius: "50px",
        px: { xs: 1, sm: 1.5 },
        py: { xs: 0.3, sm: 0.5 },
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
        maxWidth: { xs: "85%", sm: "auto" }, // prevent overflow
      }}
    >
      {/* Org Logo */}
      <img
        src={AdminData?.Org_Logo}
        alt="Org Logo"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "contain",
          objectPosition: "center",
          padding: 3,
          border: "1px solid #eee",
          flexShrink: 0,
        }}
      />

      {/* Org Name */}
      <Tooltip
        title={AdminData?.Org_Name || "Company Name"}
        arrow
        enterTouchDelay={0}        
        leaveTouchDelay={2000}     
        disableInteractive={false}  
      >
      <Typography
        variant="subtitle2"
        fontWeight="600"
        sx={{
          whiteSpace: "nowrap",
          fontSize: { xs: "0.8rem", sm: "0.9rem" },
          maxWidth: { xs: 80, sm: "none" },
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {AdminData?.Org_Name || "Company Name"}
      </Typography>
      </Tooltip>

      {/* User Avatar */}
      <Tooltip title="View Profile" arrow>
        <IconButton onClick={handleAvatarClick} sx={{ p: 0, ml: 0.5 }}>
          <Avatar
            alt="User Avatar"
            src={userProfile}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.main",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {(() => {
              try {
                const u = JSON.parse(localStorage.getItem("currUser"));
                return (u?.firstName?.[0] || "").toUpperCase();
              } catch { return ""; }
            })()}
          </Avatar>
        </IconButton>
      </Tooltip>
    </Box>
  </Box>

  {/* Avatar Dropdown Menu */}
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleMenuClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "right" }}
    sx={{
      mt: 1,
      "& .MuiPaper-root": {
        borderRadius: "10px",
        minWidth: "180px",
        bgcolor: theme.palette.background.paper,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
      },
    }}
  >
    <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
    <MenuItem
      onClick={() => setLogoutDialogOpen(true)}
      sx={{ color: "error.main", fontWeight: 500 }}
    >
      Logout
    </MenuItem>
  </Menu>
</Toolbar>

        </AppBar>
        

        <Box sx={{
  display: "flex",
  width: "100%",
  height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
  overflow: "hidden",
}}>
          {/* Sidebar */}

          {!isMobile && (
            <Box
              sx={{
                height: "100%",
                overflowY: "auto",
                width: open ? "230px" : "64px",
                flexShrink: 0,
                bgcolor: theme.palette.background.paper,
                color: "primary.main",
                transition: "width 0.3s ease-in-out",
                boxShadow: open ? "2px 20px 10px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <List>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Tooltip
                      title={!open ? item.text : ""}
                      placement="right"
                      arrow
                      key={item.text}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            fontSize: "0.8rem", 
                            padding: "6px 10px",
                            fontWeight: 400,
                          },
                        },
                      }}
                    >
                      <ListItem
                        button
                        component={Link}
                        to={item.path}
                        sx={{
                          paddingY: "10px",
                          paddingX: open ? "10px" : "16px", 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: open ? "flex-start" : "center",
                          
                          color: isActive
                            ? theme.palette.mode === "light"
                              ? "black"
                              : "white"
                            : theme.palette.mode === "light"
                              ? "black"
                              : "white",
                          borderRadius: "10px",
                          minHeight: "48px",
                        }}
                      >
                        {React.cloneElement(item.icon, {
                          sx: {
                            width: "1em",
                            height: "1em",
                            display: isMobile ? "none" : "inline-block",
                            flexShrink: 0,
                            color: isActive
                              ? "primary.main"
                              : theme.palette.mode === "dark"
                                ? "white"
                                : "grey",
                            fontSize: "1.5rem",
                            marginLeft: "10px",
                          },
                        })}
                        {open && (
                          <ListItemText
                            primary={item.text}
                            sx={{ ml: 2, fontSize: "1.2rem" }}
                          />
                        )}
                      </ListItem>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
            
          )}

          {/* Main Content */}
          <Box
          sx={{
  flexGrow: 1,
  minWidth: 0,
  width: "calc(100% - 320px)",
  height: "100%",
  bgcolor: theme.palette.background.default,
  color: "text.primary",
  overflowY: "auto",
}}

          >
            <Dialog
              open={logoutDialogOpen}
              onClose={() => setLogoutDialogOpen(false)}
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
                {"Logout "}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to Logout
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button
                  onClick={() => setLogoutDialogOpen(false)}
                  variant="outlined"
                  color="primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="error"
                  autoFocus
                >
                  Logout
                </Button>
              </DialogActions>
            </Dialog>

            {isMobile && (
              <Drawer anchor="left" open={open} onClose={toggleMenu}>
                <List
                  sx={{
                    width: 320,
                    top: "58px",
                  }}
                >
                  {menuItems.map((item) => (
                    <ListItem
                      button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      onClick={toggleMenu}
                      sx={{
                        color:
                          theme.palette.mode === "light"
                            ? "grey" // Black text for light mode
                            : "white", // White text for dark mode
                      }}
                    >
                      {item.icon}
                      <ListItemText
                        primary={item.text}
                        sx={{
                          ml: 2,
                          color:
                            theme.palette.mode === "light"
                              ? "black" // Black text for light mode
                              : "white", // White text for dark mode
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            )}

            <Outlet context={{ setUserProfile }} />
          </Box>
        </Box>


      </Box>

        <Snackbar
  open={openSnackbar}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  autoHideDuration={null}
>
  <Paper
    elevation={6}
    sx={{
      backgroundColor: "#FFF9E0", // soft yellow
      color: "#333",
      borderLeft: "6px solid #FFC107",
      borderRadius: 2,
      padding: 2,
      minWidth: 320,
      maxWidth: 400,
    }}
  >
    {/* Header */}
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={1}
    >
      <Typography variant="subtitle2" fontWeight="bold">
        Export Status
      </Typography>
      <IconButton
        size="small"
        onClick={() => dispatch(hideSnackbar())}
        sx={{ color: "#333" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>

    {/* Body */}
    <Box display="flex" alignItems="center" gap={1}>
      <CheckCircleIcon sx={{ color: "green" }} />
      <Typography variant="body2" sx={{ flex: 1 }}>
        {message || "Projects - Export Completed"}
      </Typography>
      {loading && <CircularProgress size={16} />}
    </Box>
     {action && <Box mt={1}>{action}</Box>}

    {/* Footer (timestamp / download link) */}
    <Typography
      variant="caption"
      color="text.secondary"
      display="block"
      mt={1}
    >
      {new Date().toLocaleString()}
    </Typography>
  </Paper>
</Snackbar>
    </ThemeProvider>
  );
}
