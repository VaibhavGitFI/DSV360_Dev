


import {
  Card,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
 Paper,alpha,Snackbar,Alert
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { PlayArrowRounded, StopRounded, TimerOutlined } from '@mui/icons-material';
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import StopIcon from "@mui/icons-material/Stop";
import { useDispatch, useSelector } from "react-redux";
import { startTimer, tickTimer } from "../redux/TimeEntryTimer/timerSlice";
import { useEffect, useState } from "react";

const formatTime = (sec) => {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const TaskTimerCard = ({ task, user, onStop }) => {
  const dispatch = useDispatch();
  const { isRunning, taskId, elapsedSeconds } = useSelector(
    (state) => state.timer
  );
  const [loading, setLoading] = useState(false);

   const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isThisTaskRunning = isRunning && taskId === task?.ROWID;

  // Tick every second
  useEffect(() => {
    let interval;
    if (isThisTaskRunning) {
      interval = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isThisTaskRunning, dispatch]);

  const handleStart = async() => {
     try {
        setLoading(true);

      

 await  dispatch(
      startTimer({
         Entry_Date: new Date().toISOString().split("T")[0],
        Project_ID: task.ProjectID || task.Project_ID,
        Project_Name: task.Project_Name,
        Task_ID: task?.ROWID,
        Task_Name: task.Task_Name,
        Username: `${user.firstName} ${user.lastName}`,
        User_ID: user.userid,
      })
    ).unwrap();

      setSnackbar({
      open: true,
      message: "Your timer has started",
      severity: "success",
    });
  } catch (err) {
    setSnackbar({
      open: true,
      message: "Failed to start timer",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
    
    
  };

  return (
  

      <>
      <Paper
  elevation={0}
  sx={{
    display: 'flex',
    alignItems: 'center',
    px: 2,
    py: 1,
    borderRadius: '12px',
    border: '1px solid',
    borderColor: isThisTaskRunning ? 'primary.light' : 'divider',
    bgcolor: isThisTaskRunning ? 'action.hover' : 'background.paper',
    transition: 'all 0.3s ease',
    width: 'fit-content'
  }}
>
  <Stack
  direction="row"
  alignItems="center"
  spacing={2}
  sx={{
    flexWrap: "nowrap",     // 🔥 prevents breaking
    whiteSpace: "nowrap",   // 🔥 keeps time in one line
  }}
  >
    {/* Status Icon */}
    <TimerOutlined 
      sx={{ 
        fontSize: 20, 
        color: isThisTaskRunning ? 'primary.main' : 'text.secondary',
        animation: isThisTaskRunning ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        }
      }} 
    />

    {/* Time Display with Monospace Font to prevent jitter */}
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
        fontWeight: 600,
        fontSize: '1.1rem',
        minWidth: '85px',
        color: isThisTaskRunning ? 'text.primary' : 'text.secondary',
        letterSpacing: '0.5px'
      }}
    >
      {isThisTaskRunning ? formatTime(elapsedSeconds) : "00:00:00"}
    </Typography>

    {/* Action Button */}
    {isThisTaskRunning ? (
      <Tooltip title="Stop Recording" arrow>
        <IconButton
          onClick={onStop}
          size="small"
          sx={{
            bgcolor: '#ef4444',
            color: 'white',
            '&:hover': { bgcolor: '#dc2626', transform: 'scale(1.1)' },
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
        >
          <StopRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : (
      // <Tooltip title="Start Timer" arrow>
      //   <span> {/* Span required for tooltip on disabled element */}
      //     <IconButton
      //       onClick={handleStart}
      //       disabled={isRunning || loading}
      //       size="small"
      //       sx={{
      //         bgcolor: 'success.main',
      //         color: 'white',
      //         '&:hover': { bgcolor: 'success.dark', transform: 'scale(1.1)' },
      //         '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
      //         transition: 'all 0.2s'
      //       }}
      //     >
      //       <PlayArrowRounded fontSize="small" />
      //     </IconButton>
      //   </span>
      // </Tooltip>
      <Tooltip title="Start Timer" arrow>
  <span>
    <IconButton
      onClick={handleStart}
      disabled={isRunning || loading}
      size="small"
      sx={{
        bgcolor: 'success.main',
        color: 'white',
        '&:hover': { bgcolor: 'success.dark', transform: 'scale(1.1)' },
        '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
        transition: 'all 0.2s',
        minWidth: 36,
        minHeight: 36
      }}
    >
      {loading ? (
        <TimerOutlined
          sx={{
            fontSize: 18,
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
      ) : (
        <PlayArrowRounded fontSize="small" />
      )}
    </IconButton>
  </span>
</Tooltip>

    )}
  </Stack>
</Paper>

 <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
</>
  );
};

export default TaskTimerCard;

