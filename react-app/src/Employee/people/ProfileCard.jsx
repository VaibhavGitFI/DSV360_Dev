import React from "react";
import { useState,useEffect } from "react";
import { Box, Card, Typography, Avatar, Button, alpha, useTheme,Snackbar,
  Alert,Chip } from "@mui/material";
  import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { useDispatch, useSelector } from "react-redux";
  import PendingActionsIcon from '@mui/icons-material/PendingActions';  
  import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from "axios";
import Slide from "@mui/material/Slide";
import { fetchUserProfile } from "../../redux/userData/userProfileSlice";


const ProfileCard = ({ userData, onCheckIn, onCheckOut, elapsedSeconds }) => {

 const { profile, loading, error } = useSelector(
  (state) => state.userProfile
);


const dispatch = useDispatch();

useEffect(()=>{
  dispatch(fetchUserProfile(userData.id));
},[dispatch])


const theme = useTheme();
    const [userProfile, setUserProfile] = useState();
     const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
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

      const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

   useEffect(() => {
      const profile = localStorage.getItem("profileData");
      // console.log("profile", profile);
      setUserProfile(profile);
    },[]);


  const verifyNetwork = async () => {
  try {
    const res = await axios.get("https://api.ipify.org?format=json");

    if (res.data.ip === "27.107.69.106") {
      return true;
    } else {
      return false;
    }

  } catch (e) {
    return false;
  }
};


  const handleCheckedIn = async () => {
  // const allowed = await verifyNetwork();
  // if (!allowed) {
  
  //   handleAlert("error","You are not connected to the official office WiFi")
  //   return;
  // }
  onCheckIn();
};

const handleCheckedOut = async () => {
 // const allowed = await verifyNetwork();
  // if (!allowed) {
   
  //       handleAlert("error","You are not connected to the official office WiFi")

  //   return;
  // }
  onCheckOut();
};


  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const isPending = userData.isCheckInPending;

  

  return (
    <>
   <Card
  elevation={0}
  sx={(theme) => ({
    borderRadius: 4,
    overflow: "hidden",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, 0.08)}`,
    width: "100%",
    maxWidth: 520,
    mx: "auto",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: `0 18px 50px ${alpha(theme.palette.common.black, 0.12)}`,
    },
  })}
>
  {/* Top Gradient Header */}
  <Box
    sx={(theme) => ({
      p: 2.5,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(
        theme.palette.primary.light,
        0.28
      )} 45%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
      borderBottom: "1px solid",
      borderColor: "divider",
      position: "relative",
    })}
  >
    {/* {console.log(userData)} */}
    <Chip
      size="small"
      label={`EMP-ID: ${profile?.EmpID || "00"}`}
      sx={(theme) => ({
        position: "absolute",
        top: 6,
        right: 6,
        fontWeight: 800,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.14),
        color: theme.palette.primary.main,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
        backdropFilter: "blur(8px)",
      })}
    />

    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Avatar */}
      <Avatar
        alt={userData?.name}
        src={userProfile}
        sx={(theme) => ({
          width: 96,
          height: 96,
          border: `4px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          boxShadow: `0 10px 25px ${alpha(theme.palette.common.black, 0.15)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.08),
        })}
      />

      {/* Name */}
      <Typography
        variant="h5"
        sx={(theme) => ({
          fontWeight: 900,
          mt: 1.5,
          textAlign: "center",
          color: theme.palette.text.primary,
          wordBreak: "break-word",
        })}
      >
        {userData?.name}
      </Typography>

      
      


<Chip
  icon={<LocationOnOutlinedIcon />}
  label={profile?.Location ? `Location: ${profile?.Location}` : "Location: Not set"}
  sx={(theme) => ({
    mt: 1,
    fontWeight: 800,
    px: 0.5,
    borderRadius: 999,

    bgcolor: alpha(theme.palette.info.main, 0.14),
    color: theme.palette.info.dark,
    border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,

    "& .MuiChip-icon": {
      color: theme.palette.info.dark,
    },
  })}
/>


      {/* Status Pill */}
      <Chip
        icon={isPending ? <PendingActionsIcon /> : <CheckCircleOutlineIcon />}
        label={isPending ? "Yet to check-in" : "Checked-in"}
        sx={(theme) => ({
          mt: 1,
          fontWeight: 800,
          px: 0.5,
          borderRadius: 999,
          bgcolor: alpha(
            isPending ? theme.palette.warning.main : theme.palette.success.main,
            0.14
          ),
          color: isPending ? theme.palette.warning.dark : theme.palette.success.dark,
          border: `1px solid ${alpha(
            isPending ? theme.palette.warning.main : theme.palette.success.main,
            0.25
          )}`,
          "& .MuiChip-icon": {
            color: isPending ? theme.palette.warning.dark : theme.palette.success.dark,
          },
        })}
      />
    </Box>
  </Box>

  {/* Body */}
  <Box sx={{ p: 3 }}>
    {/* Time Tracker (glass effect) */}
    <Box
      sx={(theme) => ({
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        textAlign: "center",
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.10)} 0%, ${alpha(
          theme.palette.background.paper,
          1
        )} 70%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.20)}`,
        boxShadow: `0 10px 24px ${alpha(theme.palette.common.black, 0.06)}`,
      })}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 1.6,
          display: "block",
          fontWeight: 800,
        }}
      >
        Time Elapsed
      </Typography>

      <Typography
        variant="h4"
        sx={(theme) => ({
          mt: 0.8,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontWeight: 500,
          color: theme.palette.primary.dark,
        })}
      >
        {formatTime(elapsedSeconds)}
      </Typography>
    </Box>

    {/* Action Button */}
    {isPending ? (
      <Button
        variant="contained"
        color="success"
        size="large"
        sx={(theme) => ({
          mt: 3,
          width: "100%",
          fontWeight: 900,
          borderRadius: 2,
          py: 1.2,
          boxShadow: `0 12px 26px ${alpha(theme.palette.success.main, 0.25)}`,
        })}
        onClick={handleCheckedIn}
      >
        Check-in Now
      </Button>
    ) : (
      <Button
        variant="contained"
        color="error"
        size="large"
        sx={(theme) => ({
          mt: 3,
          width: "100%",
          fontWeight: 900,
          borderRadius: 2,
          py: 1.2,
          boxShadow: `0 12px 26px ${alpha(theme.palette.error.main, 0.25)}`,
        })}
        onClick={handleCheckedOut}
      >
        Check-out
      </Button>
    )}
  </Box>
</Card>

{/* 
<Card
  sx={{
    mt: 2,
    boxShadow: theme.shadows[6],
    borderRadius: 3,
    p: 2.5,
    width: "100%",
    maxWidth: 520,
    mx: "auto",
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.info.light,
      0.25
    )}, ${alpha(theme.palette.info.main, 0.15)})`,
  }}
>
  <Box display="flex" alignItems="center" gap={2}>
    <Avatar
      sx={{
        bgcolor: theme.palette.info.main,
        width: 48,
        height: 48,
        fontWeight: "bold",
      }}
    >
      {userData?.reportingManager?.[0] || "M"}
    </Avatar>

    <Box>
      <Typography
        variant="caption"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "text.secondary",
        }}
      >
        Reporting Manager
      </Typography>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        {userData?.reportingManager || "Not Assigned"}
      </Typography>
    </Box>
  </Box>
</Card> */}




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

  </>

  );
};

export default ProfileCard;