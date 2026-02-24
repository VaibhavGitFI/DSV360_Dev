import React from "react";
import { useEffect, useState } from "react";
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
  useMediaQuery,
  alpha,
  Avatar,
  Tooltip,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  ListItemAvatar,
} from "@mui/material";
import { PieChart, BarChart, ContinuousColorLegend } from "@mui/x-charts";
import {
  PeopleAltOutlined as PeopleIcon,
  AssignmentOutlined as AssignmentIcon,
  CheckCircleOutline as CompletedIcon,
  SchoolOutlined as InternIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  FilterListOutlined as FilterIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LabelIcon from "@mui/icons-material/Label";
import { Chip } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import BugReportIcon from "@mui/icons-material/BugReport";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { fetchEmpProject } from "../redux/EmpProject/EmpProjectSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchEmpTask } from "../redux/EmpTask/EmpTaskSlice";
import { useSelector, useDispatch } from "react-redux";
import { fetchEmpIssue } from "../redux/EmpTask/EmpIssueSlice";

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
  internDrawerItem: {
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
  internAvatar: {
    background: (theme) =>
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)"
        : "linear-gradient(45deg, #FFB74D 30%, #FF8A65 90%)",
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)"}`,
  },
  internName: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1rem",
  },
  internBadge: {
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
  internInfoSection: {
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
  const colors = {
    primary: theme.palette.primary.main,
    primaryLight: theme.palette.primary.light,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    successLight: theme.palette.success.light,
    warning: theme.palette.warning.main,
    warningLight: theme.palette.warning.light,
    error: theme.palette.error.main,
    errorLight: theme.palette.error.light,
    info: theme.palette.info.main,
    infoLight: theme.palette.info.light,
  };

  const isXl = useMediaQuery(theme.breakpoints.up("xl"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  // Responsive chart height based on viewport
  const chartHeight = isXl ? 350 : isLg ? 300 : isMd ? 280 : 260;

  const dispatch = useDispatch();
   const currentYear = new Date().getFullYear();
  const [year, setYear] = React.useState(currentYear);
  const [taskYear, setTaskYear] = React.useState(currentYear);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currUser, setCurrUser] = useState({});
  const [totaltask, settTotalTask] = useState(0);
  // const [totalProject, settTotalProject] = useState(0);
  const [currentUserProjects, setCurrentUserProjects] = useState([]);
  const [monthlyProjectData, setMonthlyProjectData] = useState({
    total: Array(12).fill(0),
    open: Array(12).fill(0),
    working: Array(12).fill(0),
    closed: Array(12).fill(0),
  });
  const [ProjectopenCount, setProjectopenCount] = useState(0);
  const [ProjectworkingCount, setProjectworkingCount] = useState(0);
  const [ProjectcloseCount, setProjectcloseCount] = useState(0);
  const [totalopen, setTotalopen] = useState(0);
  const [totalClose, setTotalClose] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [totalworking, setTotalWorking] = useState(0);
  const [totalIntern, settotalIntern] = useState(0);
  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userTasksByYear, setUserTasksByYear] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [completedProjectDrawerOpen, setCompletedProjectDrawerOpen] =
    useState(false);
  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [closeIssue, setCloseIssue] = useState(false);
  // Your data props

  // Years for dropdowns
 

  const { data: projectsData } = useSelector((state) => state.empProjectReducer);
  const { data: tasksData } = useSelector((state) => state.empTaskReducer);
  const { data: employeeData } = useSelector((state) => state.employeeReducer);

  
  const { data: issuesData } = useSelector((state) => state.empIssuesReducer);
    

  // const years = Array.from(
  //   new Set(projectsData?.map(p => new Date(p.Projects.Start_Date).getFullYear()))
  // ).sort((a, b) => b - a);

const selectYears = Array.from(
  new Set([
    ...(projectsData?.map(p => new Date(p.Projects.Start_Date).getFullYear()) || []),
    currentYear
  ])
).sort((a, b) => b - a);


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("currUser"));
        const userId = user.userid;
        setCurrUser(user);

        const promises = [];

        if (!projectsData || projectsData.length === 0) {
          promises.push(dispatch(fetchEmpProject()).unwrap());
        }

        if (!tasksData || tasksData.length === 0) {
          promises.push(dispatch(fetchEmpTask()).unwrap());
        }

        if (!employeeData || employeeData.length === 0) {
          promises.push(dispatch(fetchEmployees()).unwrap());
        }

        if (!issuesData || issuesData.length === 0) {
          promises.push(dispatch(fetchEmpIssue(userId)).unwrap());
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [dispatch]);

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        
        setCurrentUserProjects(projectsData);
        // console.log("Taks dtaa",tasksData);
        const closeCount = tasksData?.filter(
          (task) => task.Status === "Completed"
        ).length;
        const openCount = tasksData?.filter(
          (task) => task.Status === "Open"
        ).length;
        const workingCount = tasksData?.filter(
          (task) => task.Status === "Work In Process"
        ).length;

        const ProjectcloseCount = projectsData?.filter(
          (project) => project.Projects.Status === "Close"
        ).length;
        const ProjectopenCount = projectsData?.filter(
          (project) => project.Projects.Status === "Open"
        ).length;
        const ProjectworkingCount = projectsData?.filter(
          (project) => project.Projects.Status === "Work In Process"
        ).length;

        setTotalClose(closeCount);
        setTotalopen(openCount);
        setTotalWorking(workingCount);
        setProjectcloseCount(ProjectcloseCount);
        setProjectopenCount(ProjectopenCount);
        setProjectworkingCount(ProjectworkingCount);

        const monthlyData = {
          total: Array(12).fill(0),
          open: Array(12).fill(0),
          working: Array(12).fill(0),
          closed: Array(12).fill(0),
        };

        const closeIssues = issuesData?.filter(
          (issue) => issue.Status === "Closed"
        );

        setCloseIssue(closeIssues?.length);

        const filteredProjects = projectsData?.filter(
  project =>
    new Date(project.Projects.Start_Date).getFullYear() === year
);


       filteredProjects?.forEach((project) => {
  const startDate = new Date(project.Projects.Start_Date);
  const month = startDate.getMonth();

  monthlyData.total[month]++;

  switch (project.Projects.Status) {
    case "Open":
      monthlyData.open[month]++;
      break;
    case "Work In Process":
      monthlyData.working[month]++;
      break;
    case "Close":
      monthlyData.closed[month]++;
      break;
  }
});


        setMonthlyProjectData(monthlyData);

        const appUsers = employeeData?.filter(
          (user) =>
            user.role_details.role_name !== "Super Admin" &&
            user.role_details.role_name !== "Contacts"
        );

        const interns = employeeData?.filter(
          (user) => user.role_details.role_name === "Interns"
        );

        setEmployees(appUsers);
        settotalIntern(interns.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } 
    };

    fetchTotalEmployees();
  }, [employeeData, tasksData, projectsData, issuesData]);

  useEffect(() => {
    try {
      if (!tasksData) return;
      // Filter tasks assigned to the current user

      // Group tasks by year
      const groupedTasks = {};
      tasksData?.forEach((task) => {
        // if (!task.Due_Date) return; // Skip if Due_Date is missing

        const taskYear = new Date(task.End_Date).getFullYear();
        // if (isNaN(taskYear)) {
        //   console.error("Invalid Due_Date found:", task.Due_Date, "in task:", task);
        //   return; // Skip invalid dates
        // }

        if (!groupedTasks[taskYear]) {
          groupedTasks[taskYear] = { close: 0, open: 0, working: 0, total: 0 };
        }

        if (task.Status === "Completed") groupedTasks[taskYear].close++;
        else if (task.Status === "Open") groupedTasks[taskYear].open++;
        else if (task.Status === "Work In Process")
          groupedTasks[taskYear].working++;

        groupedTasks[taskYear].total++;
      });

      // console.log(
      //   "Available Years in userTasksByYear:",
      //   Object.keys(groupedTasks).map(Number)
      // );
      setUserTasksByYear(groupedTasks);
    } catch (error) {
      console.error("Error found", error);
    }
  }, [tasksData]);

  useEffect(() => {
    const userProjects = projectsData?.filter((project) => {
      const startDate = new Date(project.Projects.Start_Date);
      return startDate.getFullYear() === year; // Filter by selected year
    });

    const monthlyData = {
      total: Array(12).fill(0),
      open: Array(12).fill(0),
      working: Array(12).fill(0),
      closed: Array(12).fill(0),
    };

    userProjects?.forEach((project) => {
      const startDate = new Date(project.Projects.Start_Date);
      const month = startDate.getMonth();

      monthlyData.total[month]++;

      switch (project.Projects.Status) {
        case "Open":
          monthlyData.open[month]++;
          break;
        case "Work In Process":
          monthlyData.working[month]++;
          break;
        case "Close":
          monthlyData.closed[month]++;
          break;
      }
    });

    setMonthlyProjectData(monthlyData);
  }, [year]);

  useEffect(() => {
    if (userTasksByYear[taskYear]) {
      setTotalClose(userTasksByYear[taskYear].close || 0);
      setTotalopen(userTasksByYear[taskYear].open || 0);
      setTotalWorking(userTasksByYear[taskYear].working || 0);
      settTotalTask(userTasksByYear[taskYear].total || 0);
    } else {
      setTotalClose(0);
      setTotalopen(0);
      settTotalTask(0);
    }
  }, [taskYear, userTasksByYear]);
  // Card data with enhanced icons and colors
  const cardData = [
    {
      title: "Total Employees",
      value: employees.length,
      icon: <PeopleIcon />,
      color: theme.palette.primary.main,
      // percentChange: 12,
      isIncrease: true,
    },

    {
      title: "Total Projects",
      value: projectsData.length,
      icon: <AssignmentIcon />,
      color: theme.palette.info.main,
      // percentChange: 8,
      isIncrease: true,
    },
    {
      title: "My Completed Projects",
      value: ProjectcloseCount,
      icon: <InternIcon />,
      color: theme.palette.success.main,
      // percentChange: 4,
      isIncrease: true,
    },
    {
      title: "Total Issues",
      value: issuesData.length,
      icon: <BugReportIcon />,
      color: theme.palette.warning.main,
      // percentChange: 15,
      isIncrease: true,
    },
  ];

  // Enhanced pie chart data
  const currentYearStats = userTasksByYear[taskYear] || { close: 0, open: 0, working: 0 };

  const PiechartValue = [
    // {
    //   id: 0,
    //   value: Number(totaltask) || 0,
    //   label: "Total",
    //   color: theme.palette.primary.main,
    // },
    {
      id: 1,
      value:  currentYearStats.close,
      label: "Completed",
      color: theme.palette.success.main,
    },
    {
      id: 2,
      value:currentYearStats.open,
      label: "Open",
      color: theme.palette.warning.main,
    },
    {
      id: 3,
      value: currentYearStats.working,
      label: " In Progress",
      color: theme.palette.error.main,
    },
  ];

  // Mock data for the bar chart

  // Event handlers
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleEmployeeCardClick = () => setDrawerOpen(true);
  const handleProjectCardClick = () => setProjectDrawerOpen(true);
  const handleCompletedProjectsClick = () =>
    setCompletedProjectDrawerOpen(true);
  const handleIssueCardClick = () => setIssueDrawerOpen(true);


  const completionIssuePercentage = Math.round(
    (closeIssue / issuesData.length) * 100
  );

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        height: "calc(100vh - 64px)",
        overflow: "auto",
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      {/* Dashboard Header */}
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 2, md: "1.5vh" },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${colors.primary}88, ${colors.info}88)`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 50,
                height: 50,
              }}
            >
              <DashboardCustomizeIcon fontSize="large" />
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "white",
                  display: "inline-block",
                }}
              >
                Dashboard
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
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: { xs: 60, md: 75 }, height: { xs: 60, md: 75 } }}>
              <CircularProgressbar
                value={
                  ProjectcloseCount > 0 ?
                   (ProjectcloseCount / projectsData.length) * 100
                   :0
                }
                text={
                  ProjectcloseCount > 0 ?
                  `${Math.round( (ProjectcloseCount / projectsData.length) * 100)}%`:"0%"
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
                {ProjectcloseCount} of {projectsData.length}
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
            <Box sx={{ width: { xs: 60, md: 75 }, height: { xs: 60, md: 75 } }}>
            <CircularProgressbar
  value={totalClose > 0 ? (totalClose / tasksData.length) * 100 : 0}
  text={
    totalClose > 0
      ? `${Math.round((totalClose / tasksData.length) * 100)}%`
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
                {totalClose} of {tasksData.length}
              </Typography>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Tasks Completed
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: { xs: 60, md: 75 }, height: { xs: 60, md: 75 } }}>
              <CircularProgressbar
                value={closeIssue > 0 ? 
                  (closeIssue / issuesData.length) * 100 :0
                }
                text={closeIssue > 0 ? 
                `${Math.round( (closeIssue / issuesData.length) * 100)}%`:"0%"
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
                {closeIssue} of {issuesData.length}
              </Typography>
              <Typography variant="subtitle2" color="text.primary" gutterBottom>
                Issue Resolved
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: "1.5vh" } }}>
        {isLoading
          ? // Skeleton loaders
            [...Array(4)].map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.08)}`,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid>
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
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
                    else if (card.title === "My Completed Projects")
                      handleCompletedProjectsClick();
                    else if (card.title === "Total Issues")
                      handleIssueCardClick();
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
      <Grid container spacing={{ xs: 2, md: 3 }}>
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
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                    size="small"
                    IconComponent={() => (
                      <IconButton size="small" sx={{ mr: 0.5 }}>
                        <FilterIcon fontSize="small" />
                      </IconButton>
                    )}
                  >
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
    </MenuItem>
  ))}
</Select>

                </FormControl>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ position: "relative", height: chartHeight, mx: -1 }}>
                {isLoading ? (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
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
                    height={chartHeight}
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
                    value={taskYear}
                    onChange={(e) => {
                      setTaskYear(Number(e.target.value));
                    }}
                    label="Year"
                    size="small"
                    IconComponent={() => (
                      <IconButton size="small" sx={{ mr: 0.5 }}>
                        <FilterIcon fontSize="small" />
                      </IconButton>
                    )}
                  >
                    {selectYears.map((yr) => (
                      <MenuItem key={yr} value={yr}>
                        {yr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  position: "relative",
                  height: chartHeight,
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
                    <PieChart
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
                          valueFormatter: ({value}) => `${value} Tasks`,
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
                      height={chartHeight}
                      margin={{
                        left: 20,
                        right: 20,
                        top: 10,
                        bottom: 50,
                      }}
                    />

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
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
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
                  Total Employees: {employees.length}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setDrawerOpen(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={styles.drawerContent}>
            <List sx={styles.drawerList}>
              {employees.map((employee) => (
                <ListItem key={employee.id} sx={styles.drawerItem}>
                  <ListItemAvatar>
                    <Avatar sx={styles.itemAvatar}
                    src={employee.profile_pic}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={styles.itemTitle}>
                        {`${employee.first_name} ${employee.last_name}`}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography component="span" sx={styles.itemStatus}>
                          {employee.role_details.role_name}
                        </Typography>
                        <Typography sx={styles.itemInfo}>
                          <EmailIcon sx={{ fontSize: 16 }} />
                          {employee.email_id}
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
                  My Project Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Projects: {currentUserProjects.length}
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
            {currentUserProjects.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
                No projects available
              </Typography>
            ) : (
              <List sx={styles.drawerList}>
                {currentUserProjects.map((project, index) => (
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
                          {project.Projects.Project_Name}
                        </Typography>
                        <Typography
                          sx={{
                            ...styles.itemStatus,
                            backgroundColor: (theme) =>
                              project.Projects.Status === "Open"
                                ? theme.palette.info.light
                                : project.Projects.Status === "Work In Process"
                                  ? theme.palette.warning.light
                                  : theme.palette.success.light,
                            color: "white",
                          }}
                        >
                          {project.Projects.Status}
                        </Typography>
                      </Box>

                      <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                        {project.Projects.Description ||
                          "No description available"}
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
                            Start:{" "}
                            {new Date(
                              project.Projects.Start_Date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography sx={styles.itemInfo}>
                            <EventIcon sx={{ fontSize: 16 }} />
                            End:{" "}
                            {new Date(
                              project.Projects.End_Date
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography sx={styles.itemInfo}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                          Owner: {project.Projects.Owner || "N/A"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
      <Drawer
        anchor="right"
        open={completedProjectDrawerOpen}
        onClose={() => setCompletedProjectDrawerOpen(false)}
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
                  Completed Projects
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Completed: {ProjectcloseCount}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setCompletedProjectDrawerOpen(false)}
                sx={styles.closeButton}
                aria-label="close drawer"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={styles.drawerContent}>
            {currentUserProjects.filter(
              (project) => project.Projects.Status === "Close"
            ).length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
                No completed task
              </Typography>
            ) : (
              <List sx={styles.drawerList}>
                {currentUserProjects
                  .filter((project) => project.Projects.Status === "Close")
                  .map((project, index) => (
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
                            {project.Projects.Project_Name}
                          </Typography>
                          <Typography
                            sx={{
                              ...styles.itemStatus,
                              backgroundColor: "success.light",
                              color: "white",
                            }}
                          >
                            Completed
                          </Typography>
                        </Box>

                        <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                          {project.Projects.Description}
                        </Typography>

                        <Box sx={styles.infoSection}>
                          <Typography sx={styles.itemInfo}>
                            <CalendarTodayIcon sx={{ fontSize: 16 }} />
                            Started:{" "}
                            {new Date(
                              project.Projects.Start_Date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography sx={styles.itemInfo}>
                            <EventIcon sx={{ fontSize: 16 }} />
                            Completed:{" "}
                            {new Date(
                              project.Projects.End_Date
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography sx={styles.itemInfo}>
                            <PersonIcon sx={{ fontSize: 16 }} />
                            Owner: {project.Projects.Owner}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Box>
                  ))}
              </List>
            )}
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
                  Total Issues: {issuesData.length}
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
            {issuesData.map((issue, index) => (
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
    </Box>
  );
}
