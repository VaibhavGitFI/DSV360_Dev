import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Snackbar,Alert
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { stopTimer } from "../redux/TimeEntryTimer/timerSlice";
import { useState ,useEffect} from "react";
import { LoadingButton } from "@mui/lab";
import axios from "axios";

const StopTimerDialog = ({ open, onClose ,setTimeEntry,task }) => {
  const dispatch = useDispatch();
  const { timerId, startTime,loading } = useSelector((state) => state.timer);

  
  const validate = () => {
    const e = {};
    if (!type) e.type = "Type is required";
    if (!note.trim()) e.note = "Note is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

//   console.log(startTime, time)

  const [note, setNote] = useState("");
  const [type, setType] = useState("Billable");
    const [errors, setErrors] = useState({});

 const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });


   const handleSubmit = async () => {
    if (!validate()) return;

    const result = await dispatch(
      stopTimer({
        ROWID: timerId,
        Note: note,
        Type: type,
      })
    );

    if (stopTimer.fulfilled.match(result)) {
      setSnackbar({
        open: true,
        message: "Timer stopped successfully",
        severity: "success",
      });
       const TimeEntryResponse = await axios.get(
              `/server/time_entry_management_application_function/timeentry/${task.ROWID}`
            );
      
            // Update the state with the new data
            setTimeEntry(TimeEntryResponse.data.data);

      onClose();
    } else {
      setSnackbar({
        open: true,
        message: result.payload || "Something went wrong",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (!open) {
      setNote("");
      setType("Billable");
      setErrors({});
    }
  }, [open]);
  
  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle  >Stop Timer</DialogTitle>

      <DialogContent sx={{ mt: 1, paddingTop:15 }}>
        <Grid container spacing={2}>
          {/* Row 1 - Date & Type */}
          <Grid item xs={6}>
            <TextField
              label="Entry Date"
              fullWidth
              disabled
              value={new Date().toISOString().split("T")[0]}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Type"
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value)}
                error={Boolean(errors.type)}
                helperText={errors.type}
            >
              <MenuItem value="Billable">Billable</MenuItem>
              <MenuItem value="Non-Billable">Non-Billable</MenuItem>
            </TextField>
          </Grid>

          {/* Row 2 - Start & End Time */}
          <Grid item xs={6}>
            <TextField
              label="Start Time"
              fullWidth
              disabled
              value={startTime ? new Date(startTime).toLocaleTimeString() : ""}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="End Time"
              fullWidth
              disabled
              value={new Date().toLocaleTimeString()}
            />
          </Grid>

          {/* Row 3 - Note */}
          <Grid item xs={12}>
            <TextField
              label="Note"
              fullWidth
              multiline
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              error={Boolean(errors.note)}
                helperText={errors.note}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      <LoadingButton
  variant="contained"
  onClick={handleSubmit}
  loading={loading}
  disabled={loading}
>
  Stop Timer
</LoadingButton>

      </DialogActions>
      
    </Dialog>

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

export default StopTimerDialog;
