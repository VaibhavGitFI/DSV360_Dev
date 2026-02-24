import React, { useEffect, useState } from "react";
import {Card,CardContent,Typography,Box,Grid,Collapse,Divider,Chip,Dialog,DialogTitle,DialogContent,IconButton,Tooltip,Skeleton,Button,} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";

const TimeEntryApproval = ({ userId, reqOpen, onClose,url }) => {
  const [data, setData] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("Pending"); // pending | history

  useEffect(() => {
    if (!reqOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          // `/server/time_entry_management_application_function/timeentry/approval?userId=${userId}`
          url
        );
        // console.log("res",res)
        setData(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reqOpen, userId]);

  const filteredData =
    view === "Pending"
      ? data.filter((item) => item.Status === "Pending")
      : data.filter((item) => item.Status !== "Pending");

  // console.log("fileterData",filteredData);

  const handleApprove = async (item) => {
    try {
      const payload = {
        ROWID: item.ROWID,
        Project_ID: item.Project_ID,
        Project_Name: item.Project_Name,
        Task_Name: item.Task_Name,
        Task_Id: item.Task_ID,
        ApproveDate: new Date().toISOString().split("T")[0],
        Username: item.Username,
        ApprovedBy: "test", // manager/admin name
        ApproveByID: userId, // logged in user
        User_Id: item.User_ID,
        Timeentry_Data: item.Timeentry_Data, // already string
      };

      await axios.post(
        "/server/time_entry_management_application_function/timeentry/approval",
        payload
      );

      // Update UI instantly
      setData((prev) =>
        prev.map((row) =>
          row.ROWID === item.ROWID ? { ...row, Status: "Accepted" } : row
        )
      );
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const getEntryError = (item, index) => {
    if (!item.Rejected && item.Status !== "Rejected") return null;
    if (!item.Reason) return null;

    let rejectionReasons = [];
    try {
      rejectionReasons = JSON.parse(item.Reason);
      if (!Array.isArray(rejectionReasons)) rejectionReasons = [];
    } catch (e) {
      rejectionReasons = [{ recordNumber: null, reason: item.Reason }];
    }
    return (
      rejectionReasons.find((r) => r.recordNumber === index + 1) ||
      (rejectionReasons[0]?.recordNumber === null ? rejectionReasons[0] : null)
    );
  };

  return (
    <Dialog
      open={reqOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: "100%",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Time Entry Approval
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant={view === "history" ? "contained" : "outlined"}
            onClick={() =>
              setView((prev) => (prev === "Pending" ? "history" : "Pending"))
            }
            sx={{ textTransform: "none" }}
          >
            {view === "Pending" ? "History" : "Pending"}
          </Button>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {loading ? (
        <DialogContent dividers>
          <Box>
            {[1, 2, 3].map((_, i) => (
              <Card key={i} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Skeleton width="80%" />
                    </Grid>
                    <Grid item xs={3}>
                      <Skeleton width="80%" />
                    </Grid>
                    <Grid item xs={3}>
                      <Skeleton width="80%" />
                    </Grid>
                    <Grid item xs={2}>
                      <Skeleton width={60} height={24} />
                    </Grid>
                    <Grid item xs={1}>
                      <Skeleton width={24} height={24} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {[1, 2].map((_, j) => (
                    <Box
                      key={j}
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Grid container spacing={2}>
                        {[1, 2, 3, 4, 5, 6].map((_, k) => (
                          <Grid item xs={2} key={k}>
                            <Skeleton />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
      ) : (
        <DialogContent dividers>
          <Box>
            {filteredData.length === 0 && (
              <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
                {view === "Pending"
                  ? "No Pending approval requests"
                  : "No approval history available"}
              </Typography>
            )}
            {filteredData.map((item, index) => {
              const timeEntries = JSON.parse(item.Timeentry_Data || "[]");
              return (
                <Card
                  key={item?.ROWID}
                  variant="outlined"
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <CardContent>
                    {/* ===== SUMMARY ===== */}
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          User
                        </Typography>
                        <Typography fontWeight={600}>
                          {item.Username}
                        </Typography>
                      </Grid>

                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          Project
                        </Typography>
                        <Typography fontWeight={600}>
                          {item?.Project_Name}
                        </Typography>
                      </Grid>

                      <Grid item xs={3}>
                        <Typography variant="body2" color="text.secondary">
                          Task
                        </Typography>
                     <Tooltip title={item?.Task_Name || ""} arrow>
  <Typography
    fontWeight={600}
    sx={{
      maxWidth: 200,          // REQUIRED for ellipsis
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      cursor: "pointer",
    }}
  >
    {item?.Task_Name}
  </Typography>
</Tooltip>
                      </Grid>
                      
                      <Grid
                        item
                        xs={12}
                        sm={2}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: {
                            xs: "space-between",
                            sm: "flex-start",
                          },
                        }}
                      >
                        {/* STATUS CHIP */}
                        <Chip
                          label={item.Status}
                          size="small"
                          color={
                            item.Status === "Approved"
                              ? "success"
                              : item.Status === "Rejected"
                                ? "error"
                                : "warning"
                          }
                        />

                        {/* APPROVE ACTION */}
                        {item.Status === "Pending" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApprove(item)}
                            sx={{
                              textTransform: "none",
                              fontWeight: 500,
                            }}
                          >
                            Approve
                          </Button>
                        )}
                      </Grid>

                      <Grid item xs={1}>
                        <IconButton
                          onClick={() =>
                            setOpenIndex(openIndex === index ? null : index)
                          }
                        >
                          <ExpandMoreIcon
                            sx={{
                              transform:
                                openIndex === index
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "0.3s",
                            }}
                          />
                        </IconButton>
                      </Grid>
                    </Grid>

                    {/* ===== TIME ENTRIES ===== */}
                    <Collapse in={openIndex === index}>
                      <Divider sx={{ my: 2 }} />

                      {timeEntries.map((entry, i) => {
                        const error = getEntryError(item, i);

                        return (
                          <Box
                            key={i}
                            sx={{
                              mb: 1.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: error ? "error.light" : "divider",
                              backgroundColor: error
                                ? (theme) => theme.palette.error.light + "22" // light red
                                : "background.paper",
                              overflowX: "auto",
                            }}
                          >
                            {/* ❌ Show rejection reason above entry */}
                            {error && (
                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="body2"
                                  color="error"
                                  fontWeight={500}
                                >
                                  ⚠ Entry rejected: {error.reason}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {error.Entry_Date} · {error.Start_time} –{" "}
                                  {error.End_time}
                                </Typography>
                              </Box>
                            )}

                            {/* 📝 Time entry data row */}
                            <Box sx={{ minWidth: 700 }}>
                              <Grid container spacing={2} wrap="nowrap">
                                <Grid item minWidth={110}>
                                  <Typography variant="caption">
                                    Date
                                  </Typography>
                                  <Typography fontWeight={500}>
                                    {entry.Entry_Date}
                                  </Typography>
                                </Grid>

                                <Grid item minWidth={90}>
                                  <Typography variant="caption">
                                    Start
                                  </Typography>
                                  <Typography fontWeight={500}>
                                    {entry.Start_time}
                                  </Typography>
                                </Grid>

                                <Grid item minWidth={90}>
                                  <Typography variant="caption">End</Typography>
                                  <Typography fontWeight={500}>
                                    {entry.End_time}
                                  </Typography>
                                </Grid>

                                <Grid item minWidth={110}>
                                  <Typography variant="caption">
                                    Total
                                  </Typography>
                                  <Typography fontWeight={600}>
                                    {entry.Total_time} min
                                  </Typography>
                                </Grid>

                                <Grid item minWidth={120}>
                                  <Typography variant="caption">
                                    Type
                                  </Typography>
                                  <Typography fontWeight={500}>
                                    {entry.Type}
                                  </Typography>
                                </Grid>

                                <Grid item minWidth={180}>
                                  <Typography variant="caption">
                                    Note
                                  </Typography>
                                  <Tooltip title={entry.Note || "-"}>
                                    <Typography fontWeight={500} noWrap>
                                      {entry.Note || "-"}
                                    </Typography>
                                  </Tooltip>
                                </Grid>
                              </Grid>
                            </Box>
                          </Box>
                        );
                      })}
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default TimeEntryApproval;
