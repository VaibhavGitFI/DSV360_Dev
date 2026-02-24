import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  useTheme,
  alpha,
  Avatar,
  Tooltip,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import { PieChart, BarChart } from "@mui/x-charts";
import {
  PeopleAltOutlined as PeopleIcon,
  AssignmentOutlined as AssignmentIcon,
  CheckCircleOutline as CompletedIcon,
  SchoolOutlined as UnassignedIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  FilterListOutlined as FilterIcon,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import BugReportIcon from "@mui/icons-material/BugReport";
import CloseIcon from "@mui/icons-material/Close";
import { Chip } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";
import UpdateIcon from "@mui/icons-material/Update";
import axios from "axios";
import GroupsIcon from "@mui/icons-material/Groups";
import LabelIcon from "@mui/icons-material/Label";
import EmailIcon from "@mui/icons-material/Email";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchIssueData } from "../redux/Client/issueSlice";
import { fetchTasks } from "../redux/Tasks/TaskSlice";
import { fetchProjects } from "../redux/Project/ProjectSlice";
import { fetchClientData } from "../redux/Client/clientSlice";
const styles = {
  dashboardContainer: {
    padding: { xs: 2, sm: 3 },
    minHeight: "100vh",
  },
  cardGrid: {
    marginBottom: { xs: 2, sm: 3 },
  },
  statsCard: {
    borderRadius: 4,
    boxShadow: 3,
    transition: "box-shadow 0.3s",
    height: "100%",
    "&:hover": {
      boxShadow: 6,
      transform: "translateY(-2px)",
    },
  },
  chartCard: {
    borderRadius: 4,
    boxShadow: 3,
    "&:hover": { boxShadow: 6 },
    height: { xs: "auto", md: 400 },
    minHeight: 400,
  },
  chartContainer: {
    height: { xs: 250, sm: 300 },
    width: "100%",
    overflow: "hidden",
  },
  pieChartContainer: {
    width: "100%",
    height: { xs: 250, sm: 300 },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  drawer: {
    "& .MuiDrawer-paper": {
      width: { xs: "100%", sm: 450 },
      padding: 0,
      background: "background.default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
  },
  drawerHeader: {
    paddingTop: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingBottom: "16px",
    background: "background.paper",
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"}`,
    position: "sticky",
    top: 0,
    zIndex: 1200,
    backdropFilter: "blur(5px)",
  },
  drawerHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 2,
    color: "text.secondary",
    "&:hover": {
      backgroundColor: "action.hover",
    },
  },
  drawerContent: {
    flex: 1,
    overflowY: "auto",
  },
  drawerList: {
    padding: "16px",
    "& .MuiListItem-root": {
      background: "background.paper",
      mb: 2,
      borderRadius: 2,
      boxShadow: (theme) =>
        `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}`,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: (theme) =>
          `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
      },
    },
  },
  employeeAvatar: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  employeeName: {
    fontWeight: 600,
    color: "text.primary",
  },
  employeeRole: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: "primary.light",
    color: "primary.main",
    marginTop: 0.5,
  },
  employeeEmail: {
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    marginTop: 0.5,
  },
  projectDrawer: {
    "& .MuiDrawer-paper": {
      width: { xs: "100%", sm: 450 },
      padding: 0,
      background: "background.default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
  },
  projectCard: {
    background: "background.paper",
    mb: 1,
    borderRadius: 2,
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}`,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
    },
  },
  projectStatus: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  projectDate: {
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    fontSize: "0.875rem",
  },
  projectTitle: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1.1rem",
  },
  projectDescription: {
    color: "text.secondary",
    marginBottom: 2,
  },
  drawerItem: {
    p: 2,
    bgcolor: "background.paper",
    borderRadius: 2,
    mb: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
    },
  },
  itemAvatar: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  itemTitle: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1rem",
  },
  itemStatus: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: "primary.light",
    color: "black",
  },
  itemInfo: {
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    mt: 0.5,
    fontSize: "0.875rem",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    mt: 1,
    p: 1.5,
    borderRadius: 1,
    backgroundColor: "action.hover",
  },
  UnassignedDrawerItem: {
    p: 2,
    bgcolor: "background.paper",
    borderRadius: 2,
    mb: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
    },
  },
  UnassignedAvatar: {
    background: (theme) =>
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)"
        : "linear-gradient(45deg, #FFB74D 30%, #FF8A65 90%)",
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)"}`,
  },
  UnassignedName: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1rem",
  },
  UnassignedBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 152, 0, 0.2)"
        : "rgba(255, 152, 0, 0.1)",
    color: (theme) => (theme.palette.mode === "dark" ? "#FFB74D" : "#F57C00"),
    marginTop: 0.5,
  },
  UnassignedInfoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    mt: 1,
    p: 1.5,
    borderRadius: 1,
    backgroundColor: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
  },
};

export default function EnhancedDashboard() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
const [year, setYear] = useState(currentYear);
  const [isLoading, setIsLoading] = useState(true);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [totaltask, settTotalTask] = useState(0);
  const [totalopen, setTotalopen] = useState(0);
  const [totalClose, setTotalClose] = useState(0);
  const [totalworking, setTotalWorking] = useState(0);
  const [totalUnassigned, settotalUnassigned] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const [monthlyProjectData, setMonthlyProjectData] = useState({
    open: Array(12).fill(0),
    working: Array(12).fill(0),
    closed: Array(12).fill(0),
  });
  const [taskYear, setTaskYear] = useState(currentYear);
  const [ProjectcloseCount, setProjectcloseCount] = useState(0);

  const { data: projectsData } = useSelector((state) => state.projectReducer);
  const { data: employeeData, profilePics } = useSelector(
    (state) => state.employeeReducer
  );
  const { data: taksData } = useSelector((state) => state.taskReducer);
  const { data: client } = useSelector((state) => state.clientReducer);
  const { data: issues } = useSelector((state) => state.issueReducer);
  const [userTasksByYear, setUserTasksByYear] = useState({});
  const [ProjectopenCount, setProjectopenCount] = useState(0);
  const [ProjectworkingCount, setProjectworkingCount] = useState(0);
  const [projectList, setProjectList] = useState([]);
  const [UnassignedList, setUnassignedList] = useState([]);
  const [totalResolved, setTotalResolved] = useState(0);
  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [clientDrawer, setClientDrawer] = useState(false);
  const [UnassignedDrawerOpen, setUnassignedDrawerOpen] = useState(false);

  const years = Array.from(
    new Set(projectsData?.map((p) => new Date(p.Start_Date).getFullYear()))
  ).sort((a, b) => b - a);

  const selectYears = Array.from(
  new Set([...years, currentYear])
).sort((a, b) => b - a);

  const taskyears = Array.from(
    new Set(taksData?.map((p) => new Date(p.Start_Date).getFullYear()))
  ).sort((a, b) => b - a);

  const selectTaskYear = Array.from(
     new Set([...taskyears, currentYear])
  )



  const dispatch = useDispatch();
  const placeholderURL =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        const promises = [];

        if (!projectsData || projectsData.length === 0) {
          promises.push(dispatch(fetchProjects()).unwrap());
        }

        if (!taksData || taksData.length === 0) {
          promises.push(dispatch(fetchTasks()).unwrap());
        }

        if (!client || client.length === 0) {
          promises.push(dispatch(fetchClientData()).unwrap());
        }

        if (!employeeData || employeeData.length === 0) {
          promises.push(dispatch(fetchEmployees()).unwrap());
        }

        if (!issues || issues.length === 0) {
          promises.push(dispatch(fetchIssueData()).unwrap());
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [dispatch]);

  // console.log("employee data from dashboard:",employeeList);

  // 🔸 1. Main Summary Card (Total clients, projects, employees, Unassigneds)
  // const getUnassignedEmployees = async () => {
  //   const response = await axios.get(
  //     "/server/time_entry_management_application_function/UnassignedEmployees"
  //   );
  //   const data = response.data.data;
  //   // console.log("Unassigned employees", data);
  //   settotalUnassigned(data);

  //   const UnassignedsList = data.map((user) => ({
  //     name: `${user.first_name} ${user.last_name}`,
  //     email: user.email_id,
  //     department: user.role_details.role_name || "Not Assigned",
  //     joiningDate: user.created_time,
  //   }));

  //   // console.log("Unassigneds List", UnassignedsList);
  //   setUnassignedList(UnassignedsList);
  // };

  // useEffect(() => {
  //   if (!employeeData || !taksData || !projectsData || !issues) return;
  //   getUnassignedEmployees();

  //   const Unassigneds = employeeData?.filter(
  //     (e) => e.role_details?.role_name === "Unassigneds"
  //   );
  //   settotalUnassigned(Unassigneds);

  //   setEmployeeList(
  //     employeeData
  //       .filter(
  //         (user) =>
  //           user.role_details.role_name !== "Super Admin" &&
  //           user.role_details.role_name !== "Contacts"
  //       )
  //       .map((user) => ({
  //         name: `${user.first_name} ${user.last_name}`,
  //         role: user.role_details.role_name,
  //         email: user.email_id,
  //         profile_pic: user.profile_pic,
  //       }))
  //   );

  //   // console.log("EmployeeData dashboard", employeeData);
  //   // console.log("EmployeeList dashboard", employeeList);

  //   // console.log("Issues Test :", issues);
  //   const totalResolved = issues.filter(
  //     (issue) => issue.Status === "Closed"
  //   ).length;
  //   setTotalResolved(totalResolved);

  //   setProjectList(
  //     projectsData.map((project) => ({
  //       name: project.Project_Name,
  //       status: project.Status,
  //       startDate: new Date(project.Start_Date).toLocaleDateString(),
  //       endDate: new Date(project.End_Date).toLocaleDateString(),
  //       owner: project.Owner,
  //       description: project.Description || "No description available",
  //     }))
  //   );

  //   // Task Status Count (total)
  //   const statusCount = {
  //     Completed: 0,
  //     Open: 0,
  //     "Work In Process": 0,
  //   };
  //   taksData.forEach((task) => statusCount[task.Status]++);
  //   setTotalClose(statusCount.Completed);
  //   setTotalopen(statusCount.Open);
  //   setTotalWorking(statusCount["Work In Process"]);

  //   // Project Status Count (total)
  //   const projectStatusCount = {
  //     Close: 0,
  //     Open: 0,
  //     "Work In Process": 0,
  //   };
  //   projectsData.forEach((p) => projectStatusCount[p.Status]++);
  //   setProjectcloseCount(projectStatusCount.Close);
  //   setProjectopenCount(projectStatusCount.Open);
  //   setProjectworkingCount(projectStatusCount["Work In Process"]);
  // }, [employeeData, taksData, projectsData]);

  // 🔸 2. Projects by Month for Selected Year
  useEffect(() => {
      if (!projectsData || projectsData.length === 0) return;

    const filtered = projectsData?.filter(
      (p) => new Date(p.Start_Date).getFullYear() === year
    );


    const monthlyData = {
      total: Array(12).fill(0),
      open: Array(12).fill(0),
      working: Array(12).fill(0),
      closed: Array(12).fill(0),
    };

    filtered?.forEach((p) => {
      const month = new Date(p.Start_Date).getMonth();
      monthlyData.total[month]++;
      if (p.Status === "Open") monthlyData.open[month]++;
      else if (p.Status === "Work In Process") monthlyData.working[month]++;
      else if (p.Status === "Close") monthlyData.closed[month]++;
    });

    setMonthlyProjectData(monthlyData);
  }, [year,projectsData]);

  // 🔸 3. Task Stats by Year
  useEffect(() => {
    const grouped = {};

    taksData?.forEach((task) => {
      const taskYear = new Date(task.End_Date).getFullYear();
      if (!grouped[taskYear])
        grouped[taskYear] = { close: 0, open: 0, working: 0, total: 0 };

      if (task.Status === "Completed") grouped[taskYear].close++;
      else if (task.Status === "Open") grouped[taskYear].open++;
      else if (task.Status === "Work In Process") grouped[taskYear].working++;

      grouped[taskYear].total++;
    });

    setUserTasksByYear(grouped);
  }, [taksData]);

  useEffect(() => {

    // if (taskyears.length > 0 && !taskyears.includes(taskYear)) {
    //   setTaskYear(taskyears[0]); // set to the most recent year in the data
    // }
    // if (!taskYear || !userTasksByYear[taskYear]) return;
      const yearData = userTasksByYear[taskYear];
if (!yearData) {
    // RESET everything
    setTotalClose(0);
    setTotalopen(0);
    setTotalWorking(0);
    settTotalTask(0);
    return;
  }

    // const yearData = userTasksByYear[taskYear] || {};
 setTotalClose(yearData.close);
  setTotalopen(yearData.open);
  setTotalWorking(yearData.working);
  settTotalTask(yearData.total);
  }, [taskYear, userTasksByYear]);




  // Card data with enhanced icons and colors
  const cardData = [
    {
      title: "Total Employees",
      value: employeeList?.length || 0,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      isIncrease: true,
    },
    {
      title: "Unassigned Employees",
      value: totalUnassigned?.length || 0,
      icon: <PersonIcon />,
      color: theme.palette.warning.main,
      isIncrease: true,
    },
    {
      title: "Total Projects",
      value: projectsData?.length || 0,
      icon: <AssignmentIcon />,
      color: theme.palette.success.main,
      isIncrease: true,
    },
    {
      title: "Total Issues",
      value: issues?.length || 0,
      icon: <BugReportIcon />,
      color: theme.palette.warning.main,
      isIncrease: true,
    },
    {
      title: "Total Accounts",
      value: client?.length || 0,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      isIncrease: true,
    },
  ];

  // Enhanced pie chart data

  const currentYearStats = userTasksByYear[taskYear] || { close: 0, open: 0, working: 0 };

  const PiechartValue = [
    {
      id: 1,
      value: currentYearStats.close,
      label: "Completed",
      color: theme.palette.success.main,
    },
    {
      id: 2,
      value: currentYearStats.open,
      label: "Open",
      color: theme.palette.warning.main,
    },
    {
      id: 3,
      value: currentYearStats.working,
      label: "Work In Process",
      color: theme.palette.error.main,
    },
  ];
  
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleEmployeeCardClick = () => {
    setEmployeeDrawerOpen(true);
  };

  const handleProjectCardClick = () => {
    setProjectDrawerOpen(true);
  };

  const handleIssueClick = () => {
    setIssueDrawerOpen(true);
  };
  const handleClientClick = () => setClientDrawer(true);

  const handleUnassignedClick = () => {
    // console.log(UnassignedList);
    setUnassignedDrawerOpen(true);
  };
  // Calculate completion percentage for the circular progress

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, sm: 3 },
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Dashboard Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              display: "inline-block",
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
            >
              <CalendarIcon fontSize="small" />
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Box>
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 5,
          }}
        >
        
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 80, height: 80 }}>
              <CircularProgressbar
                value={
                  projectList.length > 0
                    ? (ProjectcloseCount / projectList.length) * 100
                    : 0
                }
                text={
                  projectList.length > 0
                    ? `${Math.round((ProjectcloseCount / projectList.length) * 100)}%`
                    : "0%"
                }
                styles={buildStyles({
                  pathColor: theme.palette.success.main,
                  textColor: theme.palette.text.primary,
                  trailColor: alpha(theme.palette.success.light, 0.2),
                  textSize: "22px",
                })}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {ProjectcloseCount} of {projectList.length}
              </Typography>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Project Closed
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 80, height: 80 }}>
              <CircularProgressbar
                value={
                  taksData.length > 0 ? (totalClose / taksData.length) * 100 : 0
                }
                text={
                  taksData.length > 0
                    ? `${Math.round((totalClose / taksData.length) * 100)}%`
                    : "0%"
                }
                styles={buildStyles({
                  pathColor: theme.palette.success.main,
                  textColor: theme.palette.text.primary,
                  trailColor: alpha(theme.palette.success.light, 0.2),
                  textSize: "22px",
                })}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {totalClose} of {taksData.length}
              </Typography>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Tasks Completed
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 80, height: 80 }}>
              <CircularProgressbar
                value={
                  totalResolved > 0 ? (totalResolved / issues.length) * 100 : 0
                }
                text={
                  totalResolved > 0
                    ? `${Math.round((totalResolved / issues.length) * 100)}%`
                    : "0%"
                }
                styles={buildStyles({
                  pathColor: theme.palette.success.main,
                  textColor: theme.palette.text.primary,
                  trailColor: alpha(theme.palette.success.light, 0.2),
                  textSize: "22px",
                })}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {totalResolved} of {issues.length}
              </Typography>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Issue Resolved
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isLoading
          ? // Skeleton loaders
            [...Array(5)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid size="auto">
                        <Skeleton
                          variant="circular"
                          width={56}
                          height={56}
                          animation="wave"
                        />
                      </Grid>
                      <Grid size="grow">
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={30}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={40}
                          animation="wave"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : // Actual cards
            cardData.map((card, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
                <Card
                  sx={{
                   // borderRadius: 3,
                    height: "100%",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-8px)",
                       boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.15)}`,
                     
                    },
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onClick={() => {
                    if (card.title === "Total Employees")
                      handleEmployeeCardClick();
                    else if (card.title === "Total Projects")
                      handleProjectCardClick();
                    else if (card.title === "Total Issues") handleIssueClick();
                    else if (card.title === "Unassigned Employees")
                      handleUnassignedClick();
                    else if (card.title === "Total Accounts")
                      handleClientClick();
                  }}
                >
                  {/* Decorative top border */}
                  <Box
                    sx={{
                      height: 6,
                      width: "100%",
                      backgroundColor: card.color,
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />

                  <CardContent sx={{ pt: 3, pb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha(card.color, 0.1),
                          color: card.color,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {card.icon}
                      </Avatar>
                    </Box>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 0.5,
                        fontSize: { xs: "1.8rem", sm: "2.2rem" },
                      }}
                    >
                      {card.value}
                    </Typography>

                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ fontWeight: 500 }}
                    >
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Project Analytics Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
              height: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.12)}`,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <AssignmentIcon />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    }}
                  >
                    Project Analytics ({year})
                  </Typography>
                </Box>

           <FormControl
  variant="outlined"
  size="small"
  sx={{
    minWidth: 110,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  }}
>
  <InputLabel>Year</InputLabel>
  {/* <Select
    value={year || ""}
    label="Year"
    onChange={handleYearChange}
    size="small"
    IconComponent={() => (
      <IconButton size="small" sx={{ mr: 0.5 }}>
        <FilterIcon fontSize="small" />
      </IconButton>
    )}
    displayEmpty
  >
    {years.length === 0 ? (
      <MenuItem disabled value="">
        No Year Available
      </MenuItem>
    ) : (
      years.map((yr) => (
        <MenuItem key={yr} value={yr}>
          {yr}
        </MenuItem>
      ))
    )}
  </Select> */}
  {/* <Select value={year} onChange={handleYearChange} label="Year">
  {!years.includes(year) && (
    <MenuItem value={year}>
      {year}
    </MenuItem>
  )}

  {years.map((yr) => (
    <MenuItem key={yr} value={yr}>
      {yr}
    </MenuItem>
  ))}
</Select> */}
<Select value={year} onChange={handleYearChange} label="Year">
  {selectYears.map((yr) => (
    <MenuItem key={yr} value={yr}>
      {yr}
      {!years.includes(yr)}
    </MenuItem>
  ))}
</Select>


</FormControl>

              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* <Box sx={{ position: "relative", height: 300, mx: -1 }}>
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={300}
                    animation="wave"
                  />
                ) : (
                  
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ],
                        tickLabelStyle: {
                          fontSize: 11,
                          color: theme.palette.text.secondary,
                        },
                      },
                    ]}
                    yAxis={[
                      {
                        scaleType: "linear",
                        tickMinStep: 1,
                        min: 0,
                        max: Math.max(...monthlyProjectData.total) + 2,
                        tickLabelStyle: {
                          fontSize: 11,
                          color: theme.palette.text.secondary,
                        },
                      },
                    ]}
                    series={[
                      // {
                      //   data: monthlyProjectData.total,
                      //   label: "Total Projects",
                      //   color: theme.palette.primary.main,
                      //   highlightScope: {
                      //     item: true,
                      //     series: false,
                      //   },
                      // },
                      {
                        data: monthlyProjectData.open,
                        label: "Open Projects",
                        color: theme.palette.success.main,
                        highlightScope: {
                          item: true,
                          series: false,
                        },
                      },
                      {
                        data: monthlyProjectData.working,
                        label: "Working Projects",
                        color: theme.palette.warning.main,
                        highlightScope: {
                          item: true,
                          series: false,
                        },
                      },
                      {
                        data: monthlyProjectData.closed,
                        label: "Closed Projects",
                        color: theme.palette.error.main,
                        highlightScope: {
                          item: true,
                          series: false,
                        },
                      },
                    ]}
                    height={300}
                    margin={{ left: 40, right: 40, top: 40, bottom: 30 }}
                    slotProps={{
                      legend: {
                        position: {
                          vertical: "top",
                          horizontal: "center",
                        },
                        padding: { xs: 10, sm: 20 },
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                        markGap: 5,
                        itemGap: 10,
                      },
                    }}
                  />
                )}
              </Box> */}
              <Box sx={{ position: "relative", height: 300, mx: -1 }}>
  {isLoading ? (
    <Skeleton
      variant="rectangular"
      width="100%"
      height={300}
      animation="wave"
    />
  ) :   monthlyProjectData.open.every((v) => v === 0) &&
  monthlyProjectData.working.every((v) => v === 0) &&
  monthlyProjectData.closed.every((v) => v === 0) ? (
    <Box
      sx={{
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.palette.text.secondary,
        fontSize: 16,
      }}
    >
      No data found
    </Box>
  ) : (
    <BarChart
      xAxis={[
        {
          scaleType: "band",
          data: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          tickLabelStyle: {
            fontSize: 11,
            color: theme.palette.text.secondary,
          },
        },
      ]}
      yAxis={[
        {
          scaleType: "linear",
          tickMinStep: 1,
          min: 0,
          max: Math.max(...monthlyProjectData.total || [0]) + 2,
          tickLabelStyle: {
            fontSize: 11,
            color: theme.palette.text.secondary,
          },
        },
      ]}
      series={[
        {
          data: monthlyProjectData.open,
          label: "Open Projects",
          color: theme.palette.success.main,
          highlightScope: { item: true, series: false },
        },
        {
          data: monthlyProjectData.working,
          label: "Working Projects",
          color: theme.palette.warning.main,
          highlightScope: { item: true, series: false },
        },
        {
          data: monthlyProjectData.closed,
          label: "Closed Projects",
          color: theme.palette.error.main,
          highlightScope: { item: true, series: false },
        },
      ]}
      height={300}
      margin={{ left: 40, right: 40, top: 40, bottom: 30 }}
      slotProps={{
        legend: {
          position: { vertical: "top", horizontal: "center" },
          padding: { xs: 10, sm: 20 },
          itemMarkWidth: 10,
          itemMarkHeight: 10,
          markGap: 5,
          itemGap: 10,
        },
      }}
    />
  )}
</Box>

            </CardContent>
          </Card>
        </Grid>

        {/* Task Report Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
              height: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.12)}`,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <TimeIcon />
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    }}
                  >
                    Task Status
                  </Typography>
                </Box>
<FormControl
  variant="outlined"
  size="small"
  sx={{
    minWidth: 110,
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
  }}
>
  <InputLabel>Year</InputLabel>
  <Select
    value={taskYear || ""}
    onChange={(e) => setTaskYear(Number(e.target.value))}
    label="Year"
    size="small"
    IconComponent={() => (
      <IconButton size="small" sx={{ mr: 0.5 }}>
        <FilterIcon fontSize="small" />
      </IconButton>
    )}
    displayEmpty
  >
    {selectTaskYear && selectTaskYear.length > 0 ? (
      selectTaskYear.map((yr) => (
        <MenuItem key={yr} value={yr}>
          {yr}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled value="">
        No Year Available
      </MenuItem>
    )}
  </Select>
</FormControl>

              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  position: "relative",
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <Skeleton
                    variant="circular"
                    width={200}
                    height={200}
                    animation="wave"
                    sx={{ mx: "auto" }}
                  />
                ) : (
                  <Box
                    sx={{ width: "100%", height: "100%", position: "relative" }}
                  >
                  {userTasksByYear[taskYear] && (  <PieChart
                      series={[
                        {
                          data: PiechartValue,
                          highlightScope: {
                            faded: "global",
                            highlighted: "item",
                          },
                          innerRadius: 60,
                          paddingAngle: 2,
                          cornerRadius: 5,
                          startAngle: -90,
                          endAngle: 270,
                          valueFormatter: ({ value }) => `${value} Tasks`,
                        },
                      ]}
                      slotProps={{
                        legend: {
                          direction: "row",
                          position: {
                            vertical: "bottom",
                            horizontal: "middle",
                          },
                          padding: { xs: 10, sm: 20 },
                          itemMarkWidth: 10,
                          itemMarkHeight: 10,
                          markGap: 5,
                          itemGap: 10,
                        },
                      }}
                      height={300}
                      margin={{
                        left: 20,
                        right: 20,
                        top: 10,
                        bottom: 50,
                      }}
                    />
                  )}

                    {/* Centered Text for Total Tasks */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 10,
                      }}
                    >
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {totaltask}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Total Tasks
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={employeeDrawerOpen}
        onClose={() => setEmployeeDrawerOpen(false)}
        sx={styles.drawer}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          <Box sx={styles.drawerHeader}>
            <Box sx={styles.drawerHeaderContent}>
              <Box sx={styles.drawerTitle}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Employee List
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Employees: {employeeList.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setEmployeeDrawerOpen(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={styles.drawerContent}>
            <List sx={styles.drawerList}>
              {employeeList.map((employee, index) => (
                <ListItem key={index} sx={styles.drawerItem}>
                  <ListItemAvatar>
                    <Avatar sx={styles.itemAvatar} src={employee.profile_pic} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={styles.itemTitle}>
                        {employee.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography component="span" sx={styles.itemStatus}>
                          {employee.role}
                        </Typography>
                        <Typography sx={styles.itemInfo}>
                          <EmailIcon sx={{ fontSize: 16 }} />
                          {employee.email}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={projectDrawerOpen}
        onClose={() => setProjectDrawerOpen(false)}
        sx={styles.projectDrawer}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          <Box sx={styles.drawerHeader}>
            <Box sx={styles.drawerHeaderContent}>
              <Box sx={styles.drawerTitle}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Project List
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Projects: {projectsData.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setProjectDrawerOpen(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={styles.drawerContent}>
            <List sx={styles.drawerList}>
              {projectList.map((project, index) => (
                <Box key={index} sx={styles.drawerItem}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography sx={styles.itemTitle}>
                        {project.name}
                      </Typography>
                      <Typography
                        sx={{
                          ...styles.itemStatus,
                          backgroundColor: (theme) =>
                            project.status === "Open"
                              ? theme.palette.info.light
                              : project.status === "Work In Process"
                                ? theme.palette.warning.light
                                : theme.palette.success.light,
                          color: "white",
                        }}
                      >
                        {project.status}
                      </Typography>
                    </Box>

                    <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                      {project.description}
                    </Typography>

                    <Box sx={styles.infoSection}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography sx={styles.itemInfo}>
                          <CalendarTodayIcon sx={{ fontSize: 16 }} />
                          Start: {project.startDate}
                        </Typography>
                        <Typography sx={styles.itemInfo}>
                          <EventIcon sx={{ fontSize: 16 }} />
                          End: {project.endDate}
                        </Typography>
                      </Box>
                      <Typography sx={styles.itemInfo}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                        Owner: {project.owner}
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
      <Drawer
        anchor="right"
        open={issueDrawerOpen}
        onClose={() => setIssueDrawerOpen(false)}
        sx={styles.drawer}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          <Box sx={styles.drawerHeader}>
            <Box sx={styles.drawerHeaderContent}>
              <Box sx={styles.drawerTitle}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  <BugReportIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Issues
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Issues: {issues.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setIssueDrawerOpen(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 2, overflowY: "auto" }}>
            {issues.map((issue, index) => (
              <Box
                key={index}
                sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: "background.paper",
                  borderLeft: `5px solid ${theme.palette.primary.main}`,
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  <AssignmentOutlinedIcon sx={{ fontSize: 20, mr: 1 }} />
                  {issue.Issue_name}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {issue.Description}
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={12}>
                    <LabelIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" display="inline">
                      Level:{" "}
                      <Chip
                        label={issue.Severity}
                        size="small"
                        color={
                          issue.Severity === "Show stopper"
                            ? "error"
                            : "warning"
                        }
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <BugReportIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" display="inline">
                      Status:{" "}
                      <Chip
                        label={issue.Status}
                        size="small"
                        color={
                          issue.Status === "Open"
                            ? "info"
                            : issue.Status === "Work In Process"
                              ? "warning"
                              : "success"
                        }
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <EventIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" display="inline">
                      Due: <strong>{issue.Due_Date}</strong>
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <LabelIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" display="inline">
                      Project: <strong>{issue.Project_Name}</strong>
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <PersonIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" display="inline">
                      Reporter: <strong>{issue.Reporter_Name}</strong>
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <GroupsIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" display="inline">
                      Assignees: <strong>{issue.Assignee_Name}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
      <Drawer
        anchor="right"
        open={clientDrawer}
        onClose={() => setClientDrawer(false)}
        sx={styles.drawer}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          <Box sx={styles.drawerHeader}>
            <Box sx={styles.drawerHeaderContent}>
              <Box sx={styles.drawerTitle}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  <GroupsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Clients
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Clients: {client.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setClientDrawer(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 2, overflowY: "auto" }}>
            {client.map((client, index) => (
              <Box
                key={index}
                sx={{
                  mb: 3,
                  p: 2.5,
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: "background.paper",
                  borderLeft: `5px solid ${theme.palette.primary.main}`,
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                {/* Org Name */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  <BusinessIcon sx={{ fontSize: 20, mr: 1 }} />
                  {client.Org_Name}
                </Typography>

                {/* Details - one per line */}
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <PublicIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    Website: <strong>{client.Website}</strong>
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <WorkIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    Type: <strong>{client.Org_Type}</strong>
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <EmailIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    Email: <strong>{client.Email}</strong>
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <EventIcon
                      sx={{ fontSize: 18, mr: 1, color: "text.secondary" }}
                    />
                    Created: <strong>{client.CREATEDTIME.split(" ")[0]}</strong>
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={client.Status}
                      size="small"
                      color={
                        client.Status === "Work In Process"
                          ? "warning"
                          : client.Status === "Open"
                            ? "info"
                            : "success" // assuming "Close" or others as success
                      }
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
      <Drawer
        anchor="right"
        open={UnassignedDrawerOpen}
        onClose={() => setUnassignedDrawerOpen(false)}
        sx={styles.drawer}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
            position: "relative",
          }}
        >
          <Box sx={styles.drawerHeader}>
            <Box sx={styles.drawerHeaderContent}>
              <Box sx={styles.drawerTitle}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "text.primary" }}
                >
                  Unassigned Employees List
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Unassigned Employees: {UnassignedList.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setUnassignedDrawerOpen(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={styles.drawerContent}>
            <List sx={styles.drawerList}>
              {UnassignedList.map((Unassigned, index) => (
                <ListItem key={index} sx={styles.UnassignedDrawerItem}>
                  <ListItemAvatar>
                    <Avatar sx={styles.UnassignedAvatar}>
                      {Unassigned.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={styles.UnassignedName}>
                        {Unassigned.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          component="span"
                          sx={styles.UnassignedBadge}
                        >
                          {Unassigned.department}
                        </Typography>
                        <Box sx={styles.UnassignedInfoSection}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center", // Ensures the icon and text are vertically aligned
                            }}
                          >
                            <EmailIcon sx={{ fontSize: 20 }} />
                            <Typography sx={{ ml: 1 }}>
                              {" "}
                              {/* Adds margin-left of 1 (spacing) */}
                              {Unassigned.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
