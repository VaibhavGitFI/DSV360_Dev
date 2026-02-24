import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ForumIcon from "@mui/icons-material/Forum";
import PeopleIcon from "@mui/icons-material/People";
import { GrTask } from "react-icons/gr";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import Dashboard from "./Dashboard"; // Import Dashboard.jsx file
import Project from "./Project"; // Import Project.jsx file
import Task from "./Task"; // Import Task.jsx file
import Employees from "./Employee"; // Import Employee.jsx file
import Profile from "./Profile"; // Import Profile.jsx file
import { useState } from "react"; // For managing modal state

import Modal from "@mui/material/Modal";
import { useTheme } from "@mui/material/styles";
import FI_logo from "../../public/FI_logo.png";
import Feedback from "./Feedback";
import SmartToyIcon from '@mui/icons-material/SmartToy';


const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const handleLogout = async () => {
  if (window && window.catalyst) {
    //console.log("Logging out...");
    let redirectURL = "/__catalyst/auth/login";
    try {
      await window.catalyst.auth.signOut(redirectURL);
      localStorage.clear();
      //console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  } else {
    console.error("Catalyst is not initialized. Cannot log out.");
  }
};

function DemoPageContent({ pathname }) {
  if (pathname === "/dashboard") {
    return <Dashboard />;
  }
  if (pathname === "/projects") {
    return <Project />;
  }
  if (pathname === "/tasks") {
    return <Task />;
  }
  if (pathname === "/employees") {
    return <Employees />;
  }
  if (pathname === "/profile") {
    return <Profile />;
  }
  if (pathname === "/feedback") {
    return <Feedback />;
  }

  return (
    <Box
      sx={{
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography>Content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

const NAVIGATION = [
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "projects",
    title: "Projects",
    icon: <AssignmentIcon />,
  },
  {
    segment: "tasks",
    title: "Tasks",
    icon: <GrTask size={20} style={{ marginLeft: "3px" }} />,
  },
  {
    segment: "employees",
    title: "Employees",
    icon: <PeopleIcon />,
  },
  {
    segment: "profile",
    title: "Profile",
    icon: <AccountCircleIcon />,
  },


  {
    segment: "feedback",
    title: "Feedback",
    icon: <ForumIcon />,
  },
];

function DashboardLayoutAccount(props) {
  const [currUser, setCurrUser] = useState({});
  const [session, setSession] = React.useState({
    user: {
      name: "username",
      email: "bharatkashyap@outlook.com",
      image: "https://avatars.githubusercontent.com/u/19550456",
    },
  });

  useState(() => {
    const user = JSON.parse(localStorage.getItem("currUser"));
    const profile = localStorage.getItem("profileData");
    //console.log(user);
    setSession({
      user: {
        name: user.firstName,
        email: user.mailid,
        image: profile,
      },
    });

    setCurrUser(user);
  }, []);
  const { window } = props;
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleAvatarClick = () => setOpenAvatar(true);
  const handleAvatarClose = () => setOpenAvatar(false);

  const authentication = React.useMemo(() => {
    return {
      signOut: () => {
        setSession(null);
        handleLogout();
      },
    };
  }, []);

  const router = useDemoRouter("/dashboard");
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
      branding={{
        logo: <img src={FI_logo} alt="logo" />,
        title: "Fristine Project",
        homeUrl: "/toolpad/core/introduction",
      }}
      session={session}
      authentication={authentication}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
      window={demoWindow}
    >
      <DashboardLayout>
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 300,
            textAlign: "center",
            border: `2px solid ${theme.palette.divider}`,
            zIndex: 9999,
          }}
        >
          <Typography id="logout-modal-title" variant="h6" component="h2">
            Confirm Logout
          </Typography>
          <Typography id="logout-modal-description" sx={{ mt: 2 }}>
            Are you sure you want to log out?
          </Typography>
          <button className="btn" onClick={handleLogout}>
            Log out
          </button>
          <button className="btn" onClick={handleClose}>
            Cancel
          </button>
        </Box>
      </Modal>

      <Modal open={openAvatar} onClose={handleAvatarClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: 300,
            textAlign: "center",
            border: `2px solid ${theme.palette.divider}`,
            zIndex: 9999,
          }}
        >
          <Typography id="avatar-modal-title" variant="h6" component="h2">
            Abhay Singh Patel
          </Typography>
          <button className="btn" onClick={handleOpen}>
            Log out
          </button>
          <button className="btn" onClick={handleAvatarClose}>
            Close
          </button>
        </Box>
      </Modal>
    </AppProvider>
  );
}

DashboardLayoutAccount.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutAccount;
