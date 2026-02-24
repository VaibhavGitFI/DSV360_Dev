import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import axios from "axios";

const leaveColors = {
  Sick_Leave: "#FFB300",
  Paid_Leave: "#00C49A",
  Unpaid_Leave: "#FF6B6B",
  Others: "#9E9E9E",
};

const formatVal = (v) => (Number.isFinite(v) ? v : 0);

const getTypeColor = (type) => leaveColors[type] || leaveColors.Others;

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts[1]?.[0] || "";
  return (first + last).toUpperCase() || "U";
};

const LeaveSummary = ({ userRole }) => {
  const theme = useTheme();

  const today = dayjs();
  const year = today.year();
  const month = today.month();
  const daysInMonth = today.daysInMonth();
  const firstDay = dayjs(new Date(year, month, 1)).day(); // 0=Sun

  const [data, setData] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLeaves, setSelectedLeaves] = useState([]);

  // Build calendar days with leading nulls
  const days = useMemo(() => {
    return Array.from({ length: firstDay + daysInMonth }, (_, i) =>
      i < firstDay ? null : i - firstDay + 1
    );
  }, [firstDay, daysInMonth]);

  useEffect(() => {
    // If you want to log role safely:
    // console.log("userRole is:", userRole);
  }, [userRole]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/server/time_entry_management_application_function/calendar");
        setData(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setData([]);
      }
    };

    fetchData();
  }, []);

  const getLeaveForDate = (date) => {
    const current = dayjs(new Date(year, month, date));
    return data.filter((l) => {
      const start = dayjs(l.Start_Date);
      const end = dayjs(l.End_Date);
      return current.isAfter(start.subtract(1, "day")) && current.isBefore(end.add(1, "day"));
    });
  };

  const handleDateClick = (day) => {
    const leaves = getLeaveForDate(day);
    if (!leaves.length) return;

    setSelectedDate(day);
    setSelectedLeaves(leaves);
    setOpen(true);
  };

  const selectedFullDate = selectedDate
    ? dayjs(new Date(year, month, selectedDate)).format("DD MMM YYYY (ddd)")
    : "";

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: `0 12px 34px ${alpha(theme.palette.common.black, 0.06)}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
              theme.palette.primary.light,
              0.14
            )} 50%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Leave Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {today.format("MMMM YYYY")}
            </Typography>
          </Box>

          {/* Legend */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {Object.keys(leaveColors).map((type) => (
              <Chip
                key={type}
                label={type.replaceAll("_", " ")}
                size="small"
                sx={{
                  bgcolor: alpha(leaveColors[type], 0.14),
                  color: leaveColors[type],
                  border: `1px solid ${alpha(leaveColors[type], 0.35)}`,
                  fontWeight: 800,
                }}
              />
            ))}
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {/* Weekdays */}
          <Grid container columns={7} spacing={1} sx={{ mb: 1 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <Grid size={1} key={d}>
                <Typography
                  align="center"
                  sx={{
                    fontWeight: 900,
                    color: theme.palette.primary.main,
                    letterSpacing: 0.3,
                  }}
                >
                  {d}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Days */}
          <Grid container columns={7} spacing={1}>
            {days.map((day, i) => {
              // Empty leading cells
              if (!day) {
                return (
                  <Grid size={1} key={i}>
                    <Box sx={{ height: 110, borderRadius: 3, opacity: 0 }} />
                  </Grid>
                );
              }

              const leaves = getLeaveForDate(day);
              const hasLeaves = leaves.length > 0;
              const isToday = dayjs(new Date(year, month, day)).isSame(dayjs(), "day");

              const preview = leaves.slice(0, 2);
              const extraCount = Math.max(0, leaves.length - preview.length);

              const uniqueTypes = [...new Set(leaves.map((l) => l.Leave_Type))].slice(0, 4);

              return (
                <Grid size={1} key={i}>
                  <Box
                    onClick={() => hasLeaves && handleDateClick(day)}
                    sx={{
                      height: 110,
                      p: 1.1,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: isToday
                        ? alpha(theme.palette.primary.main, 0.45)
                        : "divider",
                      bgcolor: isToday
                        ? alpha(theme.palette.primary.main, 0.06)
                        : theme.palette.background.paper,
                      cursor: hasLeaves ? "pointer" : "default",
                      transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                      "&:hover": hasLeaves
                        ? {
                            transform: "translateY(-2px)",
                            boxShadow: `0 14px 30px ${alpha(theme.palette.common.black, 0.08)}`,
                            borderColor: alpha(theme.palette.primary.main, 0.35),
                          }
                        : {},
                    }}
                  >
                    {/* Top row: day + count/today */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 900, color: theme.palette.primary.main }}
                      >
                        {day}
                      </Typography>

                      {hasLeaves ? (
                        <Chip
                          size="small"
                          label={leaves.length}
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                          }}
                        />
                      ) : (
                        isToday && (
                          <Chip
                            size="small"
                            label="Today"
                            sx={{
                              height: 20,
                              fontSize: "0.68rem",
                              fontWeight: 900,
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                              color: theme.palette.primary.main,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                            }}
                          />
                        )
                      )}
                    </Box>

                    {/* Summary */}
                    {hasLeaves ? (
                      <>
                        {/* stacked initials */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {preview.map((l, idx) => (
                              <Avatar
                                key={idx}
                                title={`${l.Username} • ${String(l.Leave_Type).replaceAll("_", " ")}`}
                                sx={{
                                  width: 26,
                                  height: 26,
                                  fontSize: "0.75rem",
                                  ml: idx === 0 ? 0 : -1.0,
                                  border: "2px solid",
                                  borderColor: theme.palette.background.paper,
                                  bgcolor: alpha(getTypeColor(l.Leave_Type), 0.18),
                                  color: getTypeColor(l.Leave_Type),
                                  fontWeight: 900,
                                }}
                              >
                                {getInitials(l.Username)}
                              </Avatar>
                            ))}
                          </Box>

                          {extraCount > 0 && (
                            <Typography
                              variant="caption"
                              sx={{ fontSize: "0.5rem", fontWeight: 900, color: "text.secondary" }}
                            >
                              +{extraCount} more
                            </Typography>
                          )}
                        </Box>

                        {/* type dots */}
                        <Box sx={{ mt: 1, display: "flex", gap: 0.6, flexWrap: "wrap" }}>
                          {uniqueTypes.map((t) => (
                            <Box
                              key={t}
                              title={String(t).replaceAll("_", " ")}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: getTypeColor(t),
                                opacity: 0.95,
                              }}
                            />
                          ))}
                        </Box>

                        
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No leaves
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: 900,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
              theme.palette.primary.light,
              0.14
            )} 100%)`,
          }}
        >
          Leave Details — {selectedFullDate}
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: theme.palette.background.paper }}>
          {selectedLeaves?.length ? (
            selectedLeaves.map((l, idx) => (
              <Box key={idx}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(getTypeColor(l.Leave_Type), 0.18),
                      color: getTypeColor(l.Leave_Type),
                      fontWeight: 900,
                    }}
                  >
                    {getInitials(l.Username)}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 900 }} noWrap title={l.Username}>
                      {l.Username}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {String(l.Leave_Type).replaceAll("_", " ")}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {dayjs(l.Start_Date).format("DD MMM")} → {dayjs(l.End_Date).format("DD MMM")}
                    </Typography>
                  </Box>

                  <Chip
                    label={String(l.Leave_Type).replaceAll("_", " ")}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      bgcolor: alpha(getTypeColor(l.Leave_Type), 0.14),
                      color: getTypeColor(l.Leave_Type),
                      border: `1px solid ${alpha(getTypeColor(l.Leave_Type), 0.30)}`,
                    }}
                  />
                </Box>

                {idx !== selectedLeaves.length - 1 && <Divider sx={{ my: 1.2 }} />}
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">No leave records found.</Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            sx={{ borderRadius: 3, fontWeight: 900 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LeaveSummary;
