"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
require("dotenv").config();

const catalyst = require("zcatalyst-sdk-node");

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const env = process.env.CATALYST_USER_ENVIRONMENT;
console.log("Environment = ", env);

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

app.get("/test", async (req, res) => {
  console.log("Environment = ", env);
})

const {
  getAllProjects,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
} = require("./controller/projectController");
const {
  getAllTasks,
  getTasksByEmployee,
  tasksByProject,
  createTask,
  updateTask,
  deleteTask,
  tasksByProjectAndUser,
} = require("./controller/taskController");

const {
  getTimeEntryByTaskId,
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
  getTimeEntryByProjectId,
  getTimeEntryForExcel,
  getTimeEntryByUser,
  createBulkTimeEntry,
  createTimeEntryApproval,
  getTeamTimeEntryApproval,
  approveTimeEntry,
  getUserTimeEntryApproval,
  checkTimerForUser,
  startTimer,
  endTimer
} = require("./controller/timeEntryController");

const {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  addUser,
  getUserTasks,
  getUserProfile,
  updateUser,
  getUnassignedEmployees,
  reInvitedEmployee,
  setReporterToUser
} = require("./controller/employeeController");

const {
  updateProfile,
  updateCover,
  getProfile,
  getCover,
  updateProfileData,
  getProfileData,
  batchProfileData
} = require("./controller/profileController");


const { getResume, updateResume } = require("./controller/resumeController");
const { getFeedback, addFeedback, addImages } = require("./controller/feedbackController");

const {
  getAllIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  getAllAssignIssues,
  getAllClientIssues,
  projectIssues,
  assignIssue,
} = require("./controller/issueController");

const {
  getClientProjects,
  getOrgContact,
  updateClient,
  createClient,
  getClientOrg,
  addContact,
  getContact,
  getClientTasks,
  getClientData,
  deleteORG,
  deleteClient,
  updateClientContactStatus
} = require("./controller/clientController");

const {
  getAllBadges,
  getBadgeByUserId,
  createBadge,
  updateBadge,
  deleteBadge,
  assignBadge,
  deleteBadgeAssignments

} = require("./controller/BadgeController")

const sendNotification = require("./controller/notificationController");

const { addOrgAdmin, getAllAdmin, getAdminById, updateOrg, getAllOrg, getOrgAdmin, updateAdminStatus, deleteAdmin } = require("./controller/superAdminController");
const { createBulkReadJob, checkBulkReadJobStatus, downloadBulkReadCSV } = require("./utils/BulkOperation");
const { getStatus, checkOut, checkIn, getAttendanceLogsByDayAndUser, getAttendanceLogsByUser } = require("./controller/attendanceLogsController");
const { getLeaveCntByUserID, createLeaveCount, createLeaveApproval, updateLeaveApproval, deleteLeaveApproval, getAllLeaveApprovals, getLeaveApprovalsByUser, requestLeaves, leaveApproval, dashboard, getCurrMonthApprovLeave, getTeamLeaveApprovals } = require("./controller/leaveController");


app.post("/sendNotification", sendNotification);


// Project Api..---------------------------------------------------------------------------------------------
app.get("/projects", getAllProjects);
app.get("/projects/:userid", getProjectsByUserId);
app.post("/projects", createProject);
app.post("/projects/:ROWID", updateProject);
app.delete("/delete/:ROWID", deleteProject);
app.get("/dowloadExcel/:ROWID", getTimeEntryForExcel);

// Tasks Api..---------------------------------------------------------------------------------------------
app.get("/tasks", getAllTasks);
app.get("/tasks/employee/:userid", getTasksByEmployee);
app.post("/tasks/project", tasksByProject);
app.post("/tasks", createTask);
app.post("/tasks/:ROWID", updateTask);
app.delete("/tasks/:ROWID", deleteTask);
app.get("/taskByProjectAndUser", tasksByProjectAndUser);

// TimeEntry Api..---------------------------------------------------------------------------------------------
app.post("/timeentry/approval/:userId", createTimeEntryApproval);
app.post('/timeentry/approval', approveTimeEntry)
app.get("/timeentry/approval/:userId", getUserTimeEntryApproval);
app.get("/timeentry/approval", getTeamTimeEntryApproval);

app.get("/timeentry/timer", checkTimerForUser);
app.post("/timeentry/timer/start", startTimer);
app.post("/timeentry/timer/end", endTimer);


app.get("/timeentry/:taskid", getTimeEntryByTaskId);
app.post("/timeentry", createTimeEntry);
app.delete("/timeentry/:ROWID", deleteTimeEntry);
app.post("/timeentry/:id", updateTimeEntry);
app.get("/time_entry/project/:id", getTimeEntryByProjectId);
app.get("/user-timeentry", getTimeEntryByUser);


//Employee Api...-------------------------------------------------------------------------------------------------
app.get("/employee", getAllUsers);
app.post("/employee/:user_ID", deleteUser);
app.post("/employee/:active/:user_ID", updateUserStatus);
app.post("/AddEmployees", addUser);
app.post("/UpdateEmployee/:userId", updateUser);
app.get("/employees/:User_Id", getUserTasks);
app.get("/emp/:User_Id", getUserProfile);
app.get("/unassignedEmployees", getUnassignedEmployees);
app.post("/reInviteEmployees", reInvitedEmployee);
app.post("/reporterToUser", setReporterToUser);

//Profile Api....-------------------------------------------------------------------
app.post("/userprofile/:user_ID", updateProfile);
app.post("/usercover/:user_ID", updateCover);
app.get("/userprofile/:user_ID", getProfile);
app.get("/usercover/:user_ID", getCover);
app.post("/profile/update/:id", updateProfileData);
app.get("/profile/data/:id", getProfileData);
app.post("/batchProfile", batchProfileData);


// resume api..----------------------------------------------
app.get("/resume/:user_ID", getResume);
app.post("/resume/:user_ID", updateResume);

// Feedback Api..---------------------------------------------------------------------------------------------
app.get("/feedback", getFeedback);
app.post("/feedback", addFeedback);
app.post("/upload/:user_ID", addImages);

//Issue  Api..---------------------------------------------------------------------------------------------
app.get("/issue", getAllIssues);
app.get("/projectIssues/:userID", projectIssues);
app.get("/assignissue/:userID", getAllAssignIssues);
app.get("/clientissue/:userID", getAllClientIssues);
app.post("/issue", createIssue);
app.post("/issue/:ROWID", updateIssue);
app.delete("/issue/:ROWID", deleteIssue);
app.post("/assignIssue/:ROWID", assignIssue);

//Client Api..---------------------------------------------------------------------------------------------
app.get("/contactData/:userID", getClientData);
app.post("/addContact", addContact);
app.get("/contact", getContact);
app.get("/contact/:id", getOrgContact);
app.get("/clientOrg", getClientOrg);
app.get("/clientProject/:id", getClientProjects);
app.get("/contact/tasks/:id", getClientTasks);
app.post("/createClient", createClient);
app.post("/updateClient/:ROWID", updateClient);
app.delete("/contact", deleteClient);
app.delete("/org/:id", deleteORG);
app.post("/updateClientContactStatus", updateClientContactStatus);



//SuperAdmin Api..---------------------------------------------------------------------------------------------
app.post("/addAdmin", addOrgAdmin);
app.get("/getAllAdmin", getAllAdmin);
app.get("/orgAdmin/:orgID", getOrgAdmin);
app.get("/allOrg", getAllOrg);
app.put("/adminStatus", updateAdminStatus);
app.delete("/admin", deleteAdmin);
app.get("/org/:id", getAdminById);
app.put("/org/:id", updateOrg);


//Badge Api..---------------------------------------------------------------------------------------------
app.get("/badge", getAllBadges);
// app.get("/badge/:id",getBadgeById);
app.get("/badge/:id", getBadgeByUserId);
app.post("/badge", createBadge);
app.put("/badge/:id", updateBadge);
app.delete("/badge/:id", deleteBadge);
app.post("/assignBadge", assignBadge);
app.delete("/assignBadge", deleteBadgeAssignments);

//Attendanc Api .---------------------------------------------------------------------------------------------
app.get("/status/:userId", getStatus);
app.post("/checkIn", checkIn);
app.put("/checkOut", checkOut);
app.post("/attendance/dashboard", getAttendanceLogsByDayAndUser);
app.get("/attendance/user", getAttendanceLogsByUser);

//Bulk Operation.---------------------------------------------------------------------------------------------
app.post("/bulk/create", createBulkReadJob);
app.get("/bulk/status/:jobId", checkBulkReadJobStatus);
app.get("/bulk/download/:jobId", downloadBulkReadCSV);

//Leave .---------------------------------------------------------------------------------------------
app.get("/leave/count", getLeaveCntByUserID);
app.get("/leave/approval", getAllLeaveApprovals);
app.get("/leave/approval/team/:userId", getTeamLeaveApprovals);
app.get("/leave/approval/:UserID", getLeaveApprovalsByUser);
app.post('/leave/request', requestLeaves);
app.put("/leave/approval/:ROWID", updateLeaveApproval);
app.delete("/leave/approval/:ROWID", deleteLeaveApproval);
app.post('/leave/approval/:ROWID', leaveApproval);
app.get('/dashboard', dashboard);
app.get('/calendar', getCurrMonthApprovLeave);

//Reporting Api ---------------------------------------------------------------------------------------------
app.get("/report/team", async (req, res) => {
  const { userId } = req.query; // FIX 1

  if (!userId) {
    return res.status(400).json({   // FIX 2 & 3
      message: "userId missing",
      success: false
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const safeUserId = userId.replace(/'/g, "''");

    const teamQuery = `
      SELECT *
      FROM Users
      WHERE ReporterID = '${safeUserId}'
    `;
    const teamResp = await zcql.executeZCQLQuery(teamQuery);
    const filterTeamResp = teamResp.map((item) => {
      return item.Users
    })

    return res.status(200).json({
      success: true,
      data: filterTeamResp
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

//Team ---------------------------------------------------------------------------------------------
app.get("/team", async (req, res) => {

  const { teamID } = req.query;

  try {
    const catalystApp = req.catalystApp;

    const teamQuery = teamID ? `
      SELECT * FROM Teams WHERE ROWID = '${teamID}'
    `: `
      SELECT * FROM Teams
    `;

    const teamResp = await catalystApp.zcql().executeZCQLQuery(teamQuery);
    const filterTeamResp = teamResp.map((item) => {
      return item.Teams
    })

    return res.status(200).json({
      success: true,
      data: filterTeamResp
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
})

app.post("/team", async (req, res) => {
  const {
    Org_Id,
    Team_Reporting_Manager_Profile,
    Team_Reporting_Manager_ID,
    Team_Name,
    Team_Reporting_Manager
  } = req.body;

  if (!Org_Id || !Team_Reporting_Manager_Profile || !Team_Reporting_Manager_ID || !Team_Name || !Team_Reporting_Manager) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const teamTable = catalystApp.datastore().table("Teams");
    const team = await teamTable.insertRow({
      Org_Id,
      Team_Reporting_Manager_Profile,
      Team_Reporting_Manager_ID,
      Team_Name,
      Team_Reporting_Manager
    });

    return res.status(200).json({
      success: true,
      message: "Team created successfully",
      data: team
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
})

app.put("/team", async (req, res) => {
  const { ROWID } = req.query;
  const data = req.body;

  if (!ROWID) {
    return res.status(400).json({
      success: false,
      message: "ROWID is required"
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const teamTable = catalystApp.datastore().table("Teams");
    const team = await teamTable.updateRow({
      ROWID,
      ...data
    });

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: team
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
})

app.delete("/team", async (req, res) => {
  const { ROWID } = req.query;

  if (!ROWID) {
    return res.status(400).json({
      success: false,
      message: "ROWID is required"
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const teamTable = catalystApp.datastore().table("Teams");
    const team = await teamTable.deleteRow(ROWID);

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
      data: team
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
})

app.post("/team/assign", async (req, res) => {
  const { TeamID, TeamName, User_Id } = req.body;

  if (!User_Id) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  console.log(req.body);

  try {
    const catalystApp = req.catalystApp;

    const userIdArray = Array.isArray(User_Id) ? User_Id : [User_Id];

    console.log(userIdArray);

    const updateUserQuery = `
      UPDATE Users
      SET TeamID = '${TeamID}', TeamName = '${TeamName}'
      WHERE User_Id IN (${userIdArray.map((id) => `'${id}'`).join(",")})
    `;

    console.log(updateUserQuery);

    const updatedUsers = await catalystApp.zcql().executeZCQLQuery(updateUserQuery);

    const filterUpdatedUsers = updatedUsers.map((item) => {
      return item.Users
    })

    return res.status(200).json({
      success: true,
      message: "Team assigned successfully",
      data: filterUpdatedUsers
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
})

app.get("/team/users", async (req, res) => {
  const { TeamID } = req.query;

  if (!TeamID) {
    return res.status(400).json({
      success: false,
      message: "TeamID is required"
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `
      SELECT * FROM Users WHERE TeamID = '${TeamID}'
    `;
    const result = await zcql.executeZCQLQuery(query);

    const filterResult = result.map((item) => {
      return item.Users
    })

    return res.status(200).json({
      success: true,
      data: filterResult
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
})

app.get("/mobile/dashboard", async (req, res) => {
  const { User_Id, Org_Id, Year } = req.query;

  try {

    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const userManagement = catalystApp.userManagement();
    const tasksResp = await zcql.executeZCQLQuery(`SELECT * FROM Tasks ORDER BY CREATEDTIME DESC`);
    const userTasks = tasksResp.filter((task) => {
      if (task.Tasks.CREATORID === User_Id) {
        return true;
      }
      const assignedIds = task.Tasks.Assign_To_ID
        ? task.Tasks.Assign_To_ID.split(",").map((id) => id.trim())
        : [];

      return assignedIds.includes(User_Id);
    });


    const yearTaskData = {
      open: userTasks.filter((task) => {
        return task.Tasks.Status === "Open" && task.Tasks.Start_Date.includes(Year)
      }).length,
      inProgress: userTasks.filter((task) => {
        return task.Tasks.Status === "Work In Process" && task.Tasks.Start_Date.includes(Year)
      }).length,
      closed: userTasks.filter((task) => {
        return task.Tasks.Status === "Completed" && task.Tasks.Start_Date.includes(Year)
      }).length
    }

    const projectIds = [
      ...new Set(userTasks.map((task) => task.Tasks.ProjectID)),
    ];


    const userProjects = await zcql.executeZCQLQuery(
      `SELECT * FROM Projects 
   WHERE ROWID IN (${projectIds.join(",")}) 
      OR CREATORID = '${User_Id}' 
      OR Assigned_To_Id = '${User_Id}'
   ORDER BY CREATEDTIME DESC`
    );

    const completedUserProjects = userProjects.filter((project) => {
      return project.Projects.Status === "Close";
    })



    const yearMonthwiseUserProjects = [];

    for (let i = 1; i <= 12; i++) {
      const month = i < 10 ? `0${i}` : `${i}`;

      yearMonthwiseUserProjects.push({
        open: userProjects.filter(project => {
          return project.Projects.Status === "Open" && project.Projects.Start_Date.includes(`${Year}-${month}`)
        }).length,
        inProgress: userProjects.filter(project => {
          return project.Projects.Status === "Work In Process" && project.Projects.Start_Date.includes(`${Year}-${month}`)
        }).length,
        closed: userProjects.filter(project => {
          return project.Projects.Status === "Close" && project.Projects.Start_Date.includes(`${Year}-${month}`)
        }).length
      })


    }



    const query = `SELECT * FROM Issues`;
    const queryResp = await zcql.executeZCQLQuery(query);


    const userResult = await userManagement.getAllUsers(Org_Id);
    const employeeUser = userResult.filter((item) => {
      return item.role_details.role_id !== "17682000000037211" && item.role_details.role_id !== "17682000000035329" && item.role_details.role_id !== "17682000000035363"
    })

    const issueResult = queryResp.filter((item) => {
      console.log("issue", item.Issues);
      const issue = item.Issues;
      const assignID = issue.Assignee_ID;
      const assignIdsArray = assignID?.split(",");
      return assignIdsArray?.includes(User_Id);
    });

    return res.status(200).json({
      success: true,
      userCnt: employeeUser.length,
      taskCnt: userTasks.length,
      yearTaskData,
      projectCnt: userProjects.length,
      completedProjectCnt: completedUserProjects.length,
      yearMonthwiseUserProjects,
      issueCnt: issueResult.length,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }


})

app.get("/help", (req, res) => {
  res.json({
    data: process.env.Allowed_IP
  })
})


app.use((req, res) => {
  res.status(404).send("The page you are looking for does not exist.");
});


module.exports = app;
