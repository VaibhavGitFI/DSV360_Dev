import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,FormControl,InputLabel,Select,
  Tooltip,
  Stack,
  Chip,
  alpha 
} from "@mui/material";

// --- Original Data ---
const initialHolidays = [
  // ================= PUNE & MUMBAI =================
 { date: "26 Jan", year: 2026, name: "Republic Day", day: "Monday", location: "Pune" },
  { date: "04 Mar", year: 2026, name: "Holi", day: "Wednesday", location: "Pune" },
  { date: "19 Mar", year: 2026, name: "Gudi Padwa", day: "Thursday", location: "Pune" },
  { date: "03 Apr", year: 2026, name: "Good Friday", day: "Friday", location: "Pune" },
  { date: "01 May", year: 2026, name: "Maharashtra Day / Labour Day", day: "Friday", location: "Pune" },
  { date: "28 Aug", year: 2026, name: "Raksha Bandhan", day: "Friday", location: "Pune" },
  { date: "14 Sep", year: 2026, name: "Ganesh Chaturthi", day: "Monday", location: "Pune" },
  { date: "02 Oct", year: 2026, name: "Gandhi Jayanti", day: "Friday", location: "Pune" },
  { date: "20 Oct", year: 2026, name: "Dussehra", day: "Tuesday", location: "Pune" },
  { date: "09 Nov", year: 2026, name: "Diwali", day: "Monday", location: "Pune" },
  { date: "10 Nov", year: 2026, name: "Diwali", day: "Tuesday", location: "Pune" },
  { date: "25 Dec", year: 2026, name: "Christmas", day: "Friday", location: "Pune" },
  { date: "01 Jan", year: 2027, name: "New Year", day: "Friday", location: "Pune" },
 
  // ================= Mumbai =================

 { date: "26 Jan", year: 2026, name: "Republic Day", day: "Monday", location: "Mumbai" },
  { date: "04 Mar", year: 2026, name: "Holi", day: "Wednesday", location: "Mumbai" },
  { date: "19 Mar", year: 2026, name: "Gudi Padwa", day: "Thursday", location: "Mumbai" },
  { date: "03 Apr", year: 2026, name: "Good Friday", day: "Friday", location: "Mumbai" },
  { date: "01 May", year: 2026, name: "Maharashtra Day / Labour Day", day: "Friday", location: "Mumbai" },
  { date: "28 Aug", year: 2026, name: "Raksha Bandhan", day: "Friday", location: "Mumbai" },
  { date: "14 Sep", year: 2026, name: "Ganesh Chaturthi", day: "Monday", location: "Mumbai" },
  { date: "02 Oct", year: 2026, name: "Gandhi Jayanti", day: "Friday", location: "Mumbai" },
  { date: "20 Oct", year: 2026, name: "Dussehra", day: "Tuesday", location: "Mumbai" },
  { date: "09 Nov", year: 2026, name: "Diwali", day: "Monday", location: "Mumbai" },
  { date: "10 Nov", year: 2026, name: "Diwali", day: "Tuesday", location: "Mumbai" },
  { date: "25 Dec", year: 2026, name: "Christmas", day: "Friday", location: "Mumbai" },
  { date: "01 Jan", year: 2027, name: "New Year", day: "Friday", location: "Mumbai" },


  // ================= VAPI =================
  { date: "14 Jan", year: 2026, name: "Makar Sankranti / Kite Day", day: "Wednesday", location: "Vapi" },
  { date: "26 Jan", year: 2026, name: "Republic Day", day: "Monday", location: "Vapi" },
  { date: "04 Mar", year: 2026, name: "Holi", day: "Wednesday", location: "Vapi" },
  { date: "03 Apr", year: 2026, name: "Good Friday", day: "Friday", location: "Vapi" },
  { date: "01 May", year: 2026, name: "Gujarat Day / Labour Day", day: "Friday", location: "Vapi" },
  { date: "28 Aug", year: 2026, name: "Raksha Bandhan", day: "Friday", location: "Vapi" },
  { date: "14 Sep", year: 2026, name: "Ganesh Chaturthi", day: "Monday", location: "Vapi" },
  { date: "02 Oct", year: 2026, name: "Gandhi Jayanti", day: "Friday", location: "Vapi" },
  { date: "20 Oct", year: 2026, name: "Dussehra", day: "Tuesday", location: "Vapi" },
  { date: "09 Nov", year: 2026, name: "Diwali", day: "Monday", location: "Vapi" },
  { date: "10 Nov", year: 2026, name: "Diwali", day: "Tuesday", location: "Vapi" },
  { date: "25 Dec", year: 2026, name: "Christmas", day: "Friday", location: "Vapi" },
  { date: "01 Jan", year: 2027, name: "New Year", day: "Friday", location: "Vapi" },

  // ================= AUSTRALIA =================
  { date: "26 Jan", year: 2026, name: "Australia Day", day: "Monday", location: "Australia" },
  { date: "09 Mar", year: 2026, name: "Labour Day", day: "Monday", location: "Australia" },
  { date: "03 Apr", year: 2026, name: "Good Friday", day: "Friday", location: "Australia" },
  { date: "06 Apr", year: 2026, name: "Easter Monday", day: "Monday", location: "Australia" },
  { date: "01 May", year: 2026, name: "Labour Day", day: "Friday", location: "Australia" },
  { date: "08 Jun", year: 2026, name: "King's Birthday", day: "Monday", location: "Australia" },
  { date: "20 Oct", year: 2026, name: "Dussehra", day: "Tuesday", location: "Australia" },
  { date: "03 Nov", year: 2026, name: "Melbourne Cup", day: "Tuesday", location: "Australia" },
  { date: "09 Nov", year: 2026, name: "Diwali", day: "Monday", location: "Australia" },
  { date: "25 Dec", year: 2026, name: "Christmas Day", day: "Friday", location: "Australia" },
  { date: "28 Dec", year: 2026, name: "Boxing Day", day: "Monday", location: "Australia" },
  { date: "01 Jan", year: 2027, name: "New Year", day: "Friday", location: "Australia" },

  // ================= AMBASAMUDRAM =================
  { date: "15 Jan", year: 2026, name: "Mattu Pongal/Thiruvalluvar Day", day: "Thursday", location: "Ambasamudram" },
  { date: "16 Jan", year: 2026, name: "Kanuma Panduga/Pongal", day: "Friday", location: "Ambasamudram" },
  { date: "26 Jan", year: 2026, name: "Republic Day", day: "Monday", location: "Ambasamudram" },
  { date: "03 Apr", year: 2026, name: "Good Friday", day: "Friday", location: "Ambasamudram" },
  { date: "14 Apr", year: 2026, name: "Tamil New Year", day: "Tuesday", location: "Ambasamudram" },
  { date: "01 May", year: 2026, name: "Labour Day", day: "Friday", location: "Ambasamudram" },
  { date: "14 Sep", year: 2026, name: "Ganesh Chaturthi", day: "Monday", location: "Ambasamudram" },
  { date: "02 Oct", year: 2026, name: "Gandhi Jayanti", day: "Friday", location: "Ambasamudram" },
  { date: "19 Oct", year: 2026, name: "Ayutha Pooja", day: "Monday", location: "Ambasamudram" },
  { date: "20 Oct", year: 2026, name: "Dussehra", day: "Tuesday", location: "Ambasamudram" },
  { date: "09 Nov", year: 2026, name: "Diwali", day: "Monday", location: "Ambasamudram" },
  { date: "25 Dec", year: 2026, name: "Christmas", day: "Friday", location: "Ambasamudram" },
  { date: "01 Jan", year: 2027, name: "New Year", day: "Friday", location: "Ambasamudram" },
];


// --- Group Holidays by Month ---
const groupHolidaysByMonth = (holidays) => {
  const monthOrder = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();


  const enriched = holidays.map((h) => {
  const [dayStr, monthAbbr] = h.date.split(" ");
  const year = h.year || today.getFullYear();

  const holidayDate = new Date(`${monthAbbr} ${dayStr}, ${year}`);
  holidayDate.setHours(0, 0, 0, 0);

  return {
    ...h,
    year,
    monthAbbr,
    day: dayStr,
    isOver: holidayDate < today,
    timestamp: holidayDate.getTime(),
  };
});


  const sorted = enriched.sort((a, b) => a.timestamp - b.timestamp);

  return sorted.reduce((acc, h) => {
   const monthName = `${new Date(
  `${h.monthAbbr} 1, ${h.year}`
).toLocaleString("en-us", { month: "long" })} ${h.year}`;

    if (!acc[monthName]) acc[monthName] = [];
    acc[monthName].push({
      day: h.day,
      name: h.name,
      location: h.location, 
      isOver: h.isOver,
    });
    return acc;
  }, {});
};

const HolidayCalendar = () => {
  const [list, setList] = useState(initialHolidays);

  const [location, setLocation] = useState("Pune");


  const [open, setOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });

  const handleAddHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) return;

    const updated = [...list, newHoliday];
    setList(updated);

    setNewHoliday({ date: "", name: "" });
    setOpen(false);
  };

  const filteredHolidays = list.filter(
  (h) => h.location === location || h.location === "All"
);


const grouped = groupHolidaysByMonth(filteredHolidays);
return (
  <Card
    elevation={0}
    sx={(theme) => ({
      borderRadius: 4,
      p: 0,
      height: "100%",
      border: "1px solid",
      borderColor: "divider",
      overflow: "hidden", // important for clean sticky + scroll
      boxShadow: `0 14px 40px ${alpha(theme.palette.common.black, 0.06)}`,
    })}
  >
    {/* HEADER (sticky inside Card) */}
    <Box
      sx={(theme) => ({
        position: "sticky",
        top: 0,
        zIndex: 5,
        px: 2.5,
        py: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
          theme.palette.primary.light,
          0.14
        )} 55%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        backdropFilter: "blur(8px)",
      })}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Holiday Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
            Holidays grouped month-wise
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`Remaining: ${
              Object.values(grouped).reduce(
                (sum, arr) => sum + arr.filter((x) => !x.isOver).length,
                0
              )
            } / ${filteredHolidays.length}`}
            sx={(theme) => ({
              fontWeight: 900,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.10),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.20)}`,
            })}
          />
        </Stack>
      </Box>

      {/* Location filter */}
      <FormControl fullWidth size="small" sx={{ mt: 2 }}>
        <InputLabel>Location</InputLabel>
        <Select
          value={location}
          label="Location"
          onChange={(e) => setLocation(e.target.value)}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            "& .MuiSelect-select": { fontWeight: 800 },
          }}
        >
          <MenuItem value="Pune">Pune</MenuItem>
          <MenuItem value="Mumbai">Mumbai</MenuItem>
          <MenuItem value="Vapi">Vapi</MenuItem>
          <MenuItem value="Ambasamudram">Ambasamudram</MenuItem>
          <MenuItem value="Australia">Australia</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {/* BODY (scroll area) */}
    <Box
      sx={{
        maxHeight: 600,
        overflowY: "auto",
        px: 2,
        py: 1.5,
        pr: 1,
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: (theme) => theme.palette.grey[400],
          borderRadius: "10px",
        },
      }}
    >
      {Object.entries(grouped).map(([month, monthHolidays]) => (
        <Box key={month} sx={{ mb: 2.5 }}>
          {/* Month Heading */}
          <Typography
            variant="subtitle1"
            sx={(theme) => ({
              fontWeight: 900,
              mt: 1,
              mb: 1,
              px: 1,
              py: 0.8,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "4px solid",
              borderLeftColor: theme.palette.primary.main,
            })}
          >
            {month}
          </Typography>

          <Divider sx={{ mb: 1 }} />

          {/* Holiday List */}
          {monthHolidays.map((holiday, i) => (
            <Box
              key={i}
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.2,
                py: 1.1,
                borderRadius: 2,
                mt: 1,
                border: "1px solid",
                borderColor: alpha(theme.palette.text.primary, 0.08),
                bgcolor: holiday.isOver
                  ? alpha(theme.palette.text.primary, 0.02)
                  : alpha(theme.palette.success.main, 0.05),
                opacity: holiday.isOver ? 0.75 : 1,
                transition: "transform 180ms ease, background 180ms ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  bgcolor: holiday.isOver
                    ? alpha(theme.palette.text.primary, 0.03)
                    : alpha(theme.palette.primary.main, 0.06),
                },
              })}
            >
              {/* Day */}
              <Chip
                size="small"
                label={holiday.day}
                sx={(theme) => ({
                  width: 56,
                  justifyContent: "center",
                  fontWeight: 900,
                  borderRadius: 2,
                  bgcolor: holiday.isOver
                    ? alpha(theme.palette.text.primary, 0.08)
                    : alpha(theme.palette.primary.main, 0.12),
                  color: holiday.isOver ? "text.secondary" : "primary.main",
                })}
              />

              {/* Name */}
              <Tooltip title={holiday.name} arrow placement="top">
                <Typography
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    cursor: "pointer",
                    textDecoration: holiday.isOver ? "line-through" : "none",
                    color: holiday.isOver ? "text.disabled" : "text.primary",
                  }}
                >
                  {holiday.name}
                </Typography>
              </Tooltip>

              {/* Location */}
              <Chip
                size="small"
                label={holiday.location}
                sx={(theme) => ({
                  fontWeight: 900,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                })}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>

    {/* Add Holiday Modal */}
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Add Holiday</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <TextField
          label="Date (e.g., 14 Jan)"
          fullWidth
          value={newHoliday.date}
          onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Holiday Name"
          fullWidth
          value={newHoliday.name}
          onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleAddHoliday}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  </Card>
);

};

export default HolidayCalendar;
