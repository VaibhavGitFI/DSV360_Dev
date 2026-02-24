import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Assignment as AssignmentIcon,
  Task as TaskIcon,
  BugReport as BugReportIcon,
  Business as BusinessIcon,
  Today as TodayIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactData } from "../redux/contacts/contactSlice";
import { fetchContactProject } from "../redux/contacts/contactProjectSlice";
import { fetchContactTask } from "../redux/contacts/contactTaskSlice";
import { fetchContactIssues } from "../redux/contacts/contactIssueSlice";
import HashLoader from "react-spinners/HashLoader";
import PropagateLoader from "react-spinners/PropagateLoader";

import { Button } from '@mui/material';


// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const ContactDashboard = () => {


  





  const theme = useTheme();
  const [currUser, setCurrUser] = useState({});
  const [contactData, setContactData] = useState({});
  const [totalProjects, settotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalIssues, setTotalIssues] = useState({
    open: 0,
    inProgress: 0,
    Closed: 0,
  });
  const [projectCompletionRate, setProjectCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);


  // Static data for demo
  const clientData = {
    clientName: "ABC Corporation",
    totalProjects: 24,
    totalTasks: 187,
    issuesData: {
      open: 14,
      inProgress: 23,
      closed: 42,
    },
    projectCompletionRate: 78,
    // Data for charts
    monthlyData: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    projectProgress: [5, 8, 12, 15, 20, 24],
    taskCompletionTrend: [48, 65, 92, 120, 150, 187],
    issueResolutionRate: [65, 72, 68, 78, 82, 88],
  };
  
  const dispatch = useDispatch();

  const {data} = useSelector((state)=> state.contactReducer);
  const {data:projects} = useSelector((state)=> state.contactProjectReducer);
  const {data: tasks} = useSelector((state) => state.contactTaskReducer); 
  const {data:issue} = useSelector((state) => state.contactIssueReducer); 


  const [statusCounts, setStatusCounts] = useState({
    Open: 0,
    Completed: 0,
    "Work In Process": 0,
  });
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("currUser"));
        const userid = user.userid;
        setCurrUser(user);
  
        let contactDataResult = data;
        if (!data || data.length === 0) {
          const resultAction = await dispatch(fetchContactData(userid)).unwrap();
          contactDataResult = resultAction;
        }
  
        if (!contactDataResult || contactDataResult.length === 0) return;
  
        const contactDetail = contactDataResult[0]?.Client_Contact;
        setContactData(contactDetail);
  
        const orgId = contactDetail.OrgID;
  
        const projectRes =
          projects?.length > 0
            ? projects
            : await dispatch(fetchContactProject(orgId)).unwrap();
  
        const taskRes =
          tasks?.length > 0
            ? tasks
            : await dispatch(fetchContactTask(orgId)).unwrap();
  
        const issueRes =
          issue?.length > 0
            ? issue
            : await dispatch(fetchContactIssues(orgId)).unwrap();
  
        const closedProjects = projectRes?.filter(
          (project) => project.Projects.Status === "Close"
        );
  
        setProjectCompletionRate(
          Math.round((closedProjects?.length / projectRes?.length) * 100)
        );
        settotalProjects(projectRes?.length);
  
        setTotalTasks(taskRes?.length || 0);

        const taskStatusCounts = { Open: 0, Completed: 0, "Work In Process": 0 };
taskRes?.forEach((task) => {
  if (taskStatusCounts[task.Status] !== undefined) {
    taskStatusCounts[task.Status]++;
  }
});
setStatusCounts(taskStatusCounts); // ✅ set the final counts to state


  
        const issuesData = { open: 0, inProgress: 0, Closed: 0 };
        issueRes?.forEach((issue) => {
          if (issue.Status === "Open") issuesData.open++;
          if (issue.Status === "Work In Progress") issuesData.inProgress++;
          if (issue.Status === "Closed") issuesData.Closed++;
        });
        setTotalIssues(issuesData);

        
      } catch (error) {
        console.error("Error loading data:", error);
      }
      finally {
        setLoading(false); // stop loader
      }
    };
  
    // Only fetch once when component mounts
    fetchAllData();
  }, []); 
  
   

  // Colors
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

  // Pie Chart for Issues
  const issuesChartData = {
    labels: ["Open", "In Progress", "Closed"],
    datasets: [
      {
        data: [totalIssues.open, totalIssues.inProgress, totalIssues.Closed],
        backgroundColor: [colors.error, colors.warning, colors.success],
        borderColor: [colors.error, colors.warning, colors.success],
        borderWidth: 1,
      },
    ],
  };

  // Line Chart for Project Progress
  const projectProgressChartData = {
    labels: clientData.monthlyData,
    datasets: [
      {
        label: "Total Projects",
        data: clientData.projectProgress,
        borderColor: colors.primary,
        backgroundColor: `${colors.primaryLight}66`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: colors.primary,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };



  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        bodyFont: {
          family: theme.typography.fontFamily,
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: "bold",
        },
        padding: 12,
        boxPadding: 8,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
          },
        },
      },
    },
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        bodyFont: {
          family: theme.typography.fontFamily,
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: "bold",
        },
        padding: 12,
        boxPadding: 8,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
    },
  };

  // Calculate the percentage change for KPIs
  const projectsChange = {
    value: 12,
   
  };
  const tasksChange = {
    value: 28,
  
  };
  const issuesChange = {
    value: -8,
   
  };

 
  
  tasks?.forEach((task) => {
    if (statusCounts[task.status] !== undefined) {
      statusCounts[task.status]++;
    }
  });
  
  const taskCompletionChartData = {
    labels: ["Open", "Work in Progress", "Closed"],
    datasets: [
      {
        label: "Task Status Distribution",
        data: [
          statusCounts["Open"],
          statusCounts["Work In Process"],
          statusCounts["Completed"],
        ],
        backgroundColor: [
          `${colors.warning}cc`,      // Open
          `${colors.info}cc`,         // Work in Progress
          `${colors.success}cc`,      // Closed
        ],
        borderColor: [
          colors.warning,
          colors.info,
          colors.success,
        ],
        borderWidth: 1,
        borderRadius: 5,
        barThickness: 30,
      },
    ],
  };
  

   return (

    <>
 {loading ? (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
       
       <HashLoader size={100} color={colors.primary} />


      </Box>
    ) : (
      <Box sx={{ p: 3 }}>

      
      {/* Client Organization Header */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${colors.primary}88, ${colors.info}88)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: "15px",
          }}
        />
        <CardContent sx={{ py: 4, px: 3, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: colors.primary,
                  width: 60,
                  height: 60,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <BusinessIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {"Welcome, " + currUser.firstName + " " + currUser.lastName}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {"Organisation Name: " + contactData?.Org_Name}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                <TodayIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Project Completion Progress */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body1" fontWeight="medium">
                Project Completion Rate
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {projectCompletionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={projectCompletionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: colors.secondary,
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Projects Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: "16px",
              height: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                
                <Avatar
                  sx={{
                    bgcolor: `${colors.primary}22`,
                    color: colors.primary,
                    width: 56,
                    height: 56,
                  }}
                >
                  <AssignmentIcon fontSize="large" />
                </Avatar>
               
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                {totalProjects}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Projects
              </Typography>
              <Divider sx={{ my: 2 }} />
               <Typography variant="body2" color="textSecondary"> 
                {/* <b>{projectsChange.value}</b> new projects in the last 30 days */}
              </Typography> 
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: "16px",
              height: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${colors.success}22`,
                    color: colors.success,
                    width: 56,
                    height: 56,
                  }}
                >
                  <TaskIcon fontSize="large" />
                </Avatar>
              
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                {totalTasks}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Tasks
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                {/* <b>{tasksChange.value}</b> new tasks added in the last 30 days */}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Issues Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: "16px",
              height: "100%",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${colors.warning}22`,
                    color: colors.warning,
                    width: 56,
                    height: 56,
                  }}
                >
                  <BugReportIcon fontSize="large" />
                </Avatar>
               
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 0.5 }}>
                {totalIssues.open + totalIssues.inProgress + totalIssues.Closed}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Issues
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color={colors.error}>
                  Open: <b>{totalIssues.open}</b>
                </Typography>
                <Typography variant="body2" color={colors.warning}>
                  In Progress: <b>{totalIssues.inProgress}</b>
                </Typography>
                <Typography variant="body2" color={colors.success}>
                  Closed: <b>{totalIssues.Closed}</b>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Project Progress Line Chart */}
        {/* <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: "16px", height: "100%", p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Project Progress Trend
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Monthly data showing cumulative project count
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line options={chartOptions} data={projectProgressChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid> */}

        {/* Issues Distribution Pie Chart */}
        {/* <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: "16px", height: "100%", p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Issues Status
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Distribution of issues by status
              </Typography>
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie options={pieChartOptions} data={issuesChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid> */}

        {/* Task Completion Bar Chart */}
        {/* <Grid item xs={12}>
          <Card sx={{ borderRadius: "16px", height: "100%", p: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Task Completion Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Monthly task completion trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar options={chartOptions} data={taskCompletionChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid> */}

<Grid item xs={12}>
  <Card sx={{ borderRadius: "16px", height: "100%", p: 1 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Task Status Overview
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Overall distribution of tasks by status
      </Typography>
      <Box sx={{ height: 300 }}>
        <Bar options={chartOptions} data={taskCompletionChartData} />
      </Box>
    </CardContent>
  </Card>
</Grid>

      </Grid>
    </Box>
    )}
    </>
   
  );



};

export default ContactDashboard;
