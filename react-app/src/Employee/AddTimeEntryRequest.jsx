import {Card,CardContent,Typography,Box,Grid,Collapse,Divider,Chip,Dialog,DialogTitle,DialogContent,IconButton,Tooltip,Skeleton,ButtonTextField,
  MenuItem,
  DialogActions,
  useTheme,Button,TextField} from "@mui/material";
import { useState,useEffect } from "react";
import axios from "axios";
  import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { LoadingButton } from '@mui/lab';

  


const AddTimeEntryRequest = ({open,onClose,viewTask,currUser}) =>{
  const theme = useTheme();
    const [show, setShow] = useState(false);
    const [alerttype, setalerttype] = useState("");
      const [alertLabel, setAlertLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

  
const [rows, setRows] = useState([
  {
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    billable: "Yes",
    errors: {}, 
    rowError: null,
  },
]);




   const [viewMode, setViewMode] = useState("ADD"); // ADD | HISTORY
   const [expandedId, setExpandedId] = useState(null);


useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/server/time_entry_management_application_function/timeentry/approval/${currUser.userid}`
      );

      const normalized = (res?.data?.data || []).map(item => ({
        ...item,
        Timeentry_Data: JSON.parse(item.Timeentry_Data || "[]"),
        Reason:
          item.Status === "Rejected"
            ? JSON.parse(item.Reason || "[]")
            : [],
      }));

      setData(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [currUser.userid]);


     const handleAlert = (type, label) => {
    setalerttype(type);
    setAlertLabel(label);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setAlertLabel("");
    }, 2000);
  };

function formatTimeToAMPM(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}


const validateRow = (row) => {
  let errors = {};

  if (!row.date) errors.date = "Date is required";
  if (!row.startTime) errors.startTime = "Start time is required";
  if (!row.endTime) errors.endTime = "End time is required";

  if (
    row.startTime &&
    row.endTime &&
    row.startTime >= row.endTime
  ) {
    errors.endTime = "End time must be after start time";
  }

  if (!row.note) errors.note = "Note is required";

  return errors;
};


const addRow = () => {
  setRows(prev => [
    ...prev,
    {
      date: "",
      startTime: "",
      endTime: "",
      note: "",
      billable: "Yes",
      errors: {},
      rowError: null,
    },
  ]);
};


const removeRow = (index) => {
  setRows(prev => prev.filter((_, i) => i !== index));
};


const validateAllRows = () => {
  let hasError = false;

  setRows((prev) =>
    prev.map((row) => {
      const errors = validateRow(row);
      if (Object.keys(errors).length) hasError = true;
      return { ...row, errors };
    })
  );

  return !hasError;
};



const handleChange = (index, field, value) => {
    
  setRows(prev =>
    prev.map((row, i) =>
      i === index
        ? {
            ...row,
            [field]: value,
            rowError: null, // keep row-level error
            errors: {
              ...row.errors,
              [field]: null, // only clear field-level error
            },
          }
        : row
    )
  );
};


// const findTimeConflicts = rows => {
//   console.log("Checking conflicts for rows:", rows);
//   const parsed = rows.map((row, index) => ({
//     index,
//     date: row.date,
//     start: new Date(`1970-01-01T${row.startTime}`),
//     end: new Date(`1970-01-01T${row.endTime}`),
//     label: `Time Entry ${index + 1} (${row.startTime} - ${row.endTime})`,
//   }));

//   const conflicts = {};

//   for (let i = 0; i < parsed.length; i++) {
//     for (let j = i + 1; j < parsed.length; j++) {
//       if (
//         parsed[i].start < parsed[j].end &&
//         parsed[j].start < parsed[i].end
//       ) {
//         conflicts[parsed[i].index] ??= [];
//         conflicts[parsed[j].index] ??= [];

//         conflicts[parsed[i].index].push(parsed[j].label);
//         conflicts[parsed[j].index].push(parsed[i].label);
//       }
//     }
//   }

//   return conflicts;
// };


const findTimeConflicts = rows => {
  const parsed = rows.map((row, index) => ({
    index,
    date: row.date, // 👈 include date
    start: new Date(`${row.date}T${row.startTime}`),
    end: new Date(`${row.date}T${row.endTime}`),
    label: `Time Entry ${index + 1} (${row.startTime} - ${row.endTime})`,
  }));

  const conflicts = {};

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {

      // ✅ Only check if date is same
      if (parsed[i].date === parsed[j].date) {

        // ✅ Then check time overlap
        if (
          parsed[i].start < parsed[j].end &&
          parsed[j].start < parsed[i].end
        ) {
          conflicts[parsed[i].index] ??= [];
          conflicts[parsed[j].index] ??= [];

          conflicts[parsed[i].index].push(parsed[j].label);
          conflicts[parsed[j].index].push(parsed[i].label);
        }
      }
    }
  }

  return conflicts;
};




const handleRequest = async () => {
  if (!viewTask || !rows.length) return;

  if (!validateAllRows()) {
   handleAlert("error", "Please fix validation errors");
  return;
}

const conflictMap = findTimeConflicts(rows);

if (Object.keys(conflictMap).length > 0) {
  setRows(prev =>
    prev.map((row, index) => ({
      ...row,
      rowError: conflictMap[index]
        ? `Conflicts with ${conflictMap[index].join(", ")}`
        : null,
    }))
  );

  handleAlert("error", "Time entry conflicts detected");
  return; // ❌ STOP API CALL
}



  try {
    // setLoading(true);
     setIsLoading(true);

    const timeEntryData = rows.map((row, index) => {
      const start = new Date(`1970-01-01T${row.startTime}`);
      const end = new Date(`1970-01-01T${row.endTime}`);
      const diffMs = (end - start) / (1000 * 60); // minutes

      if (diffMs <= 0) {
        throw new Error(`Invalid time in row ${index + 1}`);
      }

      return {
        Username: `${currUser.firstName} ${currUser.lastName}`,
        User_ID: currUser.userid,
        Entry_Date: row.date,
        Note: row.note || "",
        Type: row.billable === "Yes" ? "Billable" : "Non-Billable",
        Start_time: formatTimeToAMPM(start),
        End_time: formatTimeToAMPM(end),
        Total_time: diffMs,
        Task_ID: viewTask.ROWID,
        Task_Name: viewTask.Task_Name,
        Project_ID: viewTask.ProjectID,
        Project_Name: viewTask.Project_Name,
      };
    });

   const res = await axios.post(
      "/server/time_entry_management_application_function/timeentry/approval/bulk",
      {
        "Status": "Pending",
        "Project_ID": viewTask.ProjectID,
        "Project_Name": viewTask.Project_Name,
        "Task_Name": viewTask.Task_Name,
        "Task_Id": viewTask.ROWID,
        "Rejected": false,
        "Reason": null,
        "ApproveDate": null,
        "Username": `${currUser.firstName} ${currUser.lastName}`,
        "ApprovedBy": null,
        "ApproveByID": null,
        "User_Id": currUser.userid,
    "Timeentry_Data": JSON.stringify(timeEntryData),
      }
    );
    // console.log("res",res)

    if(res.status === 200 && res.data.success){

         const localRequest = {
    Status: "Pending",
    Project_ID: viewTask.ProjectID,
    Project_Name: viewTask.Project_Name,
    Task_Name: viewTask.Task_Name,
    Task_Id: viewTask.ROWID,
    Username: `${currUser.firstName} ${currUser.lastName}`,
    User_Id: currUser.userid,
    ApprovedBy: null,
    ApproveByID: null,
    ApproveDate: null,
    Rejected: false,
    Reason: [],
    Timeentry_Data: timeEntryData, // already parsed
    CREATED_AT: new Date().toISOString(),
    ROWID:res.data.data.ROWID
  };

  setData(prev => [localRequest, ...prev]); // 👈 add locally
     handleAlert("success",res.data.message );
    setRows([{
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    billable: "Yes",
  },]);
 onClose()
    }
   if (res.status === 200 && res.data.rejectedRecords?.length > 0) {
  setRows(prevRows =>
    prevRows.map((row, index) => {
      const rejected = res.data.rejectedRecords.find(
        r => r.recordNumber === index + 1
      );

      return rejected
        ? { ...row, rowError: rejected.reason }
        : { ...row, rowError: null };
    })
  );

   handleAlert("error", res.data.message);
  return;
}

   
   

  } catch (error) {
     handleAlert("error", error.message || "Failed to submit time entries");
  } finally {
    // setLoading(false);
     setIsLoading(false);
    //  setOpen(false);
  }
};

const handleCancelReq = () =>{
    onClose()
    setViewMode("ADD")
    setRows([
       {
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    billable: "Yes",
    errors: {}, 
    rowError: null,
  },
    ])
}

    return (
        <>
        
          <Snackbar
                open={show}
                onClose={() => setShow(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                autoHideDuration={2000}
              >
                <Alert severity={alerttype}>{alertLabel}</Alert>
              </Snackbar>

                       
      <Dialog
  open={open}
  fullWidth
  maxWidth="md"
  PaperProps={{
    sx: {
      borderRadius: 3,
      p: 1,
    },
  }}
>

<DialogTitle
  sx={{
    fontWeight: 600,
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <Typography fontWeight={600}>
    {viewMode === "ADD" ? "Add Time Entries" : "Time Entry History"}
  </Typography>

  <Box sx={{ display: "flex", gap: 1 }}>
    <Button
      size="small"
      variant="outlined"
      onClick={() =>
        setViewMode(prev => (prev === "ADD" ? "HISTORY" : "ADD"))
      }
    >
      {viewMode === "ADD" ? "History" : "Add Time Entry"}
    </Button>

    <IconButton onClick={handleCancelReq}>
      <CloseIcon />
    </IconButton>
  </Box>
</DialogTitle>


{viewMode === "ADD" ? (
<DialogContent 
sx={{
    mt: 2,
    maxHeight: "60vh",
    overflowY: "auto",
  }}
>

{rows.map((row, i) => (
  <Box
    key={i}
    sx={{
      mb: 3,
      p: 2,
      borderRadius: 2,
      border: row.rowError
        ? `1px solid ${theme.palette.error.main}`
        : '1px solid #e0e0e0',
      backgroundColor: row.rowError
        ? `${theme.palette.error.light}22`
        : 'transparent',
      position: 'relative',
    }}
  >
    {/* ROW 1 : Date | Billable | Start | End */}
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TextField
          label="Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={row.date}
          onChange={(e) => handleChange(i, 'date', e.target.value)}
          error={Boolean(row.errors?.date)}
          helperText={row.errors?.date}
inputProps={{
    max: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7); // 7 days ago
      return d.toISOString().split("T")[0]; // max date = today-7
    })(),
  }} />
      </Grid>

      <Grid item xs={3}>
        <TextField
          select
          label="Billable"
          fullWidth
          value={row.billable}
          onChange={(e) => handleChange(i, 'billable', e.target.value)}
        >
          <MenuItem value="Yes">Billable</MenuItem>
          <MenuItem value="No">Non-Billable</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="Start Time"
          type="time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={row.startTime}
          onChange={(e) =>
            handleChange(i, 'startTime', e.target.value)
          }
          error={Boolean(row.errors?.startTime)}
          helperText={row.errors?.startTime}
        />
      </Grid>

      <Grid item xs={3}>
        <TextField
          label="End Time"
          type="time"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={row.endTime}
          onChange={(e) => handleChange(i, 'endTime', e.target.value)}
          error={Boolean(row.errors?.endTime)}
          helperText={row.errors?.endTime}
        />
      </Grid>
    </Grid>

    {/* ROW 2 : Notes */}
    <TextField
      label="Notes"
      multiline
      rows={3}
      fullWidth
      sx={{ mt: 2 }}
      value={row.note}
      onChange={(e) => handleChange(i, 'note', e.target.value)}
      error={Boolean(row.errors?.note)}
      helperText={row.errors?.note}
    />

    {/* ROW-LEVEL ERROR */}
    {row.rowError && (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="error">
          ⚠ {row.rowError}
        </Typography>
      </Box>
    )}

    {rows.length > 1 && (
      <IconButton
        size="small"
        onClick={() => removeRow(i)}
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          color: 'error.main',
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'error.light',
            color: 'error.contrastText',
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    )}
  </Box>
))}


  


    
   

  <Button sx={{ mt: 1 }} onClick={addRow}>
    + Add Entry
  </Button>
</DialogContent>
):(
  

    <DialogContent sx={{ mt: 2, maxHeight: "65vh", overflowY: "auto" }}>

      {data?.length === 0 ? (
    <Typography
      align="center"
      color="text.secondary"
      sx={{ py: 6 }}
    >
      No history data found
    </Typography>
  ) :(
  data?.map(item => (
    <Box key={item.ROWID} sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
      
      {/* SUMMARY */}
      <Grid container alignItems="center">
        <Grid item xs={3}>
          <Typography fontWeight={600}>REQ-{item.ROWID?.slice(-4)}</Typography>
        </Grid>

        <Grid item xs={3}>
          <Chip
            size="small"
            label={item.Status}
            color={item.Status === "Accepted" ? "success" : "error"}
          />
        </Grid>

        <Grid item xs={3}>
          <Typography>Entries: {item.Timeentry_Data.length}</Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="body2">{item.CREATEDTIME}</Typography>
        </Grid>

        <Grid item xs={1} textAlign="right">
          <IconButton onClick={() =>
            setExpandedId(prev => prev === item.ROWID ? null : item.ROWID)
          }>
            {expandedId === item.ROWID ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Grid>
      </Grid>

      {/* DETAILS */}
      <Collapse in={expandedId === item.ROWID}>
       
       <Box sx={{ mt: 2 }}>
  <Box sx={{ border: "1px solid #eee", borderRadius: 1, p: 1 }}>
    {item.Timeentry_Data.map((entry, i) => {

    const rejectionReasons = item.Reason || [];

      
      const matchedReason = rejectionReasons.find(
        r =>
          r.Entry_Date === entry.Entry_Date &&
          r.Start_time === entry.Start_time &&
          r.End_time === entry.End_time
      );

      return (
        <Box
          key={i}
          sx={theme => ({
            mb: 1.5,
            p: 1.5,
            borderRadius: 1,
            border: "1px solid",
            borderColor: matchedReason
              ? theme.palette.error.light
              : theme.palette.divider,
            backgroundColor: matchedReason
              ? `${theme.palette.error.light}20`
              : "transparent",
          })}
        >
          <Grid container spacing={1}>
            <Grid item xs={6}><b>Date:</b> {entry.Entry_Date}</Grid>
            <Grid item xs={6}><b>Type:</b> {entry.Type}</Grid>
            <Grid item xs={6}><b>Start:</b> {entry.Start_time}</Grid>
            <Grid item xs={6}><b>End:</b> {entry.End_time}</Grid>
            <Grid item xs={6}> <Typography
    variant="body2"
    sx={{
      wordBreak: "break-word",
      overflowWrap: "anywhere",
      whiteSpace: "pre-wrap",
    }}> <b>Project:</b>{entry.Project_Name} </Typography></Grid>
            <Grid item xs={6}>
              <Typography
    variant="body2"
    sx={{
      wordBreak: "break-word",
      overflowWrap: "anywhere",
      whiteSpace: "pre-wrap",
    }}
  > <b>Task:</b> {entry.Task_Name}</Typography>
           </Grid>
            <Grid item xs={12}><Typography
    variant="body2"
    sx={{
       wordBreak: "break-word",
      overflowWrap: "anywhere",
      whiteSpace: "pre-wrap",
    }}
  > <b>Note:</b>{entry.Note}
  </Typography>
  </Grid>

            {/* REASON INSIDE ROW */}
            {matchedReason && (
              <Grid item xs={12}>
                <Typography variant="body2" color="error">
                  <strong>Rejection Reason:</strong> {matchedReason.reason}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      );
    })}
  </Box>
</Box>

      </Collapse>
    </Box>
  )))}
</DialogContent>

)}


{viewMode === "ADD" && (
  <DialogActions
    sx={{ px: 3, py: 2, borderTop: "1px solid #e0e0e0" }}
  >
    <Button onClick={handleCancelReq}>Cancel</Button>
    <LoadingButton
  variant="contained"
  loading={isLoading}
  onClick={handleRequest}
>
  Submit Entries
</LoadingButton>
  </DialogActions>
)}


</Dialog>
        </>
   
    )
}
export default AddTimeEntryRequest;