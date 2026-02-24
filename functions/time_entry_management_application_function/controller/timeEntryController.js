"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json()); // To handle text data if sent as JSON
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cors());

const catalyst = require("zcatalyst-sdk-node");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

// Sprint field column names
const SPRINT_FIELD_KEYS = ["Source_Type", "Sprint_ID", "Story_ID", "Sprint_Task_ID", "Sprint_SubTask_ID"];

// Extract optional sprint fields from a payload object.
// Returns only the keys that have truthy (non-empty) values.
function pickSprintFields(obj) {
  const result = {};
  for (const k of SPRINT_FIELD_KEYS) {
    if (obj[k]) result[k] = obj[k];
  }
  return result;
}

// Remove sprint field keys that have empty/falsy values from an object.
// This prevents Zoho Catalyst from rejecting empty string column values.
function cleanSprintFields(obj) {
  const cleaned = { ...obj };
  for (const k of SPRINT_FIELD_KEYS) {
    if (k in cleaned && !cleaned[k]) {
      delete cleaned[k];
    }
  }
  return cleaned;
}



function to24HourFormat(time) {
  const [hour, minute] = time.split(":");
  const [minutePart, period] = minute.split(" ");
  let hour24 = parseInt(hour, 10);
  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }
  return `${String(hour24).padStart(2, "0")}:${minutePart.padStart(2, "0")}`;
}

function getFormattedDateTime() {
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const parts = formatter.formatToParts(new Date());

  const lookup = {};
  parts.forEach(({ type, value }) => {
    lookup[type] = value;
  });

  return `${lookup.year}-${lookup.month}-${lookup.day} ${lookup.hour}:${lookup.minute}:${lookup.second}`;
}

function calculateTotalMinutes(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  // Convert "YYYY-MM-DD HH:mm:ss" → Date
  const start = new Date(startTime.replace(" ", "T"));
  const end = new Date(endTime.replace(" ", "T"));

  if (isNaN(start) || isNaN(end) || end < start) return 0;

  const diffInMs = end - start;
  return Math.floor(diffInMs / (1000 * 60));
}

function formatTimeAMPM(dateTime) {
  const date = new Date(dateTime.replace(" ", "T"));

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseTime(timeStr) {
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes; // Convert time to minutes
};

function checkTimeOverlap(newStart, newEnd, existingEntries) {
  for (const entry of existingEntries) {
    const timeEntry = entry.Time_Entries || entry; // Fix nested structure
    const existingStart = parseTime(timeEntry.Start_time);
    const existingEnd = parseTime(timeEntry.End_time);

    if (newStart < existingEnd && newEnd > existingStart) {
      return false; // Overlap detected
    }
  }
  return true; // No overlap
};


const getTimeEntryByTaskId = async (req, res) => {

  const taskId = req.params.taskid;
  const { startDate, endDate } = req.query;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    let userManagement = catalystApp.userManagement();
    let userPromise = await userManagement.getCurrentUser();
    console.log("userPromise", userPromise);
    const userID = userPromise.user_id;
    const userRoleID = userPromise.role_details.role_id;
    console.log("userID", userID);
    console.log("userRoleID", userRoleID);


    // Step 1: Determine the date range
    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      // Default to last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      start = sevenDaysAgo.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    }

    // Step 2: Fetch Time Entries within the date range
    let query;
    if (userRoleID === "17682000000035329") {
      query = `
      SELECT * FROM Time_Entries 
      WHERE Time_Entries.Task_ID = '${taskId}' 
      AND Time_Entries.Entry_Date BETWEEN '${start}' AND '${end}'
    `;
    } else {
      query = `
      SELECT * FROM Time_Entries 
      WHERE Time_Entries.Task_ID = '${taskId}' and User_ID='${userID}' 
      AND Time_Entries.Entry_Date BETWEEN '${start}' AND '${end}'
    `;
    }

    console.log("query", query);

    const queryResp = await zcql.executeZCQLQuery(query);

    // Step 3: Group entries by Entry_Date
    const groupedData = {};

    for (const item of queryResp) {
      const entryDate = item.Time_Entries.Entry_Date;
      if (!groupedData[entryDate]) {
        groupedData[entryDate] = {
          totalTime: 0,
          details: [],
        };
      }

      groupedData[entryDate].totalTime += Number(item.Time_Entries.Total_time) || 0;
      groupedData[entryDate].details.push(item);
    }

    // Step 4: Sort each group's details by Start_time
    const response = Object.entries(groupedData)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([entryDate, group]) => {
        group.details.sort((a, b) => {
          const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
          const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
          return startTimeA.localeCompare(startTimeB);
        });

        return {
          entryDate,
          totalTime: group.totalTime,
          details: group.details,
        };
      });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};


const createTimeEntry = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");
    const timeEntryData = req.body;
    const currDate = timeEntryData.Entry_Date;
    const id = timeEntryData.User_ID;

    const query = `SELECT * FROM Time_Entries WHERE User_ID = '${id}' AND Entry_Date = '${currDate}'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    const newStart = parseTime(timeEntryData.Start_time);
    const newEnd = parseTime(timeEntryData.End_time);


    if (newEnd <= newStart || !checkTimeOverlap(newStart, newEnd, queryResp)) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot overlaps or invalid" });
    }

    // Remove empty sprint field values to prevent Catalyst insert errors
    const insertPayload = cleanSprintFields(timeEntryData);

    // For sprint-sourced entries, remove Task_ID to avoid FK violation
    // (sprint task IDs are not ROWIDs in the Tasks table)
    if (insertPayload.Source_Type && insertPayload.Source_Type.startsWith("SPRINT")) {
      delete insertPayload.Task_ID;
    }

    const createdRecord = await table.insertRow(insertPayload);
    res.status(200).json({ success: true, data: createdRecord });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add task",
      error: error.message,
    });
  }
};

const deleteTimeEntry = async (req, res) => {
  const ROWID = req.params.ROWID;
  //console.log(ROWID);

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");

    const response = await table.deleteRow(ROWID);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

const updateTimeEntry = async (req, res) => {
  console.log("API hit");

  const ROWID = req.params.id;
  const timeEntryData = req.body;

  if (!ROWID) {
    return res
      .status(400)
      .json({ success: false, message: "ROWID is required" });
  }

  if (!timeEntryData || Object.keys(timeEntryData).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Task data is required" });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");

    const currDate = timeEntryData.Entry_Date;
    const id = timeEntryData.User_ID;

    const query = `SELECT * FROM Time_Entries WHERE User_ID = '${id}' AND Entry_Date = '${currDate}' AND ROWID != '${ROWID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    const newStart = parseTime(timeEntryData.Start_time);
    const newEnd = parseTime(timeEntryData.End_time);

    if (newEnd <= newStart || !checkTimeOverlap(newStart, newEnd, queryResp)) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot overlaps or invalid" });
    }

    const updatedRecord = await table.updateRow({ ROWID, ...cleanSprintFields(timeEntryData) });

    res.status(200).json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};
const getTimeEntryForExcel = async (req, res) => {
  const id = req.params.ROWID;
  console.log("id", id);

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Get all time entries for the given project
    const query = `SELECT * FROM Time_Entries WHERE Project_ID = '${id}'`;
    const allEntries = await zcql.executeZCQLQuery(query);

    // Group by Task_ID
    const taskMap = allEntries.reduce((acc, entry) => {
      const taskId = entry.Time_Entries.Task_ID;
      if (!acc[taskId]) {
        acc[taskId] = {
          Task_Id: taskId,
          Task_Name: entry.Time_Entries.Task_Name,
          details: [],
        };
      }
      acc[taskId].details.push(entry);
      return acc;
    }, {});

    // Sort by Date and Start_time (both in descending order)
    const response = Object.values(taskMap).map((task) => {
      task.details.sort((a, b) => {
        const dateA = new Date(a.Time_Entries.Entry_Date);
        const dateB = new Date(b.Time_Entries.Entry_Date);

        if (dateA.getTime() === dateB.getTime()) {
          // Convert time string to 24-hour format
          const timeA = to24HourFormat(a.Time_Entries.Start_time);
          const timeB = to24HourFormat(b.Time_Entries.Start_time);
          return timeB.localeCompare(timeA); // Descending
        }

        return dateB - dateA; // Descending by Date
      });
      return task;
    });

    res.status(200).json({
      message: "Fetch successful",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTimeEntryByProjectId = async (req, res) => {
  const id = req.params.id;
  const { startDate, endDate } = req.query; // expected in YYYY-MM-DD format

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Handle date filtering
    let fromDate = startDate;
    let toDate = endDate;

    // If dates are not provided, fallback to last 7 days (including today)
    if (!startDate || !endDate) {
      const currentDate = new Date();
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 6); // includes today

      fromDate = sevenDaysAgo.toISOString().split("T")[0];
      toDate = currentDate.toISOString().split("T")[0];
    }

    const dateCondition = `AND Entry_Date BETWEEN '${fromDate}' AND '${toDate}'`;

    // Fetch all entries for the project ID with date filtering
    const query = `SELECT * FROM Time_Entries WHERE Project_ID = '${id}' ${dateCondition}`;
    const allEntries = await zcql.executeZCQLQuery(query);

    // Group by Task_ID
    const taskMap = allEntries.reduce((acc, entry) => {
      const taskId = entry.Time_Entries.Task_ID;
      if (!acc[taskId]) {
        acc[taskId] = {
          Task_Id: taskId,
          Task_Name: entry.Time_Entries.Task_Name,
          details: [],
        };
      }
      acc[taskId].details.push(entry);
      return acc;
    }, {});

    // Sort each task's entries by Date ↓ and Start_time ↓
    const response = Object.values(taskMap).map((task) => {
      task.details.sort((a, b) => {
        const dateA = new Date(a.Time_Entries.Entry_Date);
        const dateB = new Date(b.Time_Entries.Entry_Date);

        if (dateA.getTime() === dateB.getTime()) {
          const timeA = to24HourFormat(a.Time_Entries.Start_time);
          const timeB = to24HourFormat(b.Time_Entries.Start_time);
          return timeB.localeCompare(timeA); // descending
        }

        return dateB - dateA; // descending by date
      });
      return task;
    });

    res.status(200).json({
      message: "Fetch successful",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getTimeEntryByUser = async (req, res) => {
  console.log("Request Body:", req.body);

  const { startDate, endDate, userID } = req.query;

  if (!startDate || !endDate || !userID) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `
      SELECT * FROM Time_Entries 
      WHERE Time_Entries.User_ID = '${userID}' 
      AND Time_Entries.Entry_Date BETWEEN '${startDate}' AND '${endDate}'
    `;

    const queryResp = await zcql.executeZCQLQuery(query);

    const filterData = queryResp.map((item) => {
      return {
        "Username": item.Time_Entries.Username,
        "Project Name": item.Time_Entries.Project_Name,
        "Task Name": item.Time_Entries.Task_Name,
        "Type": item.Time_Entries.Type,
        "Entry Date": item.Time_Entries.Entry_Date,
        "Start time": item.Time_Entries.Start_time,
        "End time": item.Time_Entries.End_time,
        "Total time(in minutes)": item.Time_Entries.Total_time,
        "Note": item.Time_Entries.Note,
      }
    })



    res.status(200).json({
      success: true,
      data: filterData,
    });
  } catch (error) {
    console.error("ZCQL Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time entries",
      error: error.message,
    });
  }
};

const approveTimeEntry = async (req, res) => {
  const {
    User_ID,
    Username,
    Timeentry_Data,
    ROWID,
    ApprovedBy,
    ApproveDate,
    ApproveByID,
    Task_Id,
    Task_Name,
    Project_ID,
    Project_Name,
  } = req.body;

  console.log("ROWID", ROWID);

  if (!Timeentry_Data) {
    return res.status(400).json({
      success: false,
      message: "Time entries not found"
    });
  }
  const timeEntriesArray = JSON.parse(Timeentry_Data);

  if (!Array.isArray(timeEntriesArray) || timeEntriesArray.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Time entries not found"
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore();

    const timeEntryTable = datastore.table("Time_Entries");
    const approvalTable = datastore.table("Time_Entry_Approvals");

    const rejectedRecords = [];

    for (let index = 0; index < timeEntriesArray.length; index++) {
      const entry = timeEntriesArray[index];

      const currDate = entry.Entry_Date;
      const userId = entry.User_ID;

      const query = `
        SELECT Start_time, End_time
        FROM Time_Entries
        WHERE User_ID = '${userId}'
        AND Entry_Date = '${currDate}'
      `;

      const existingEntries = await zcql.executeZCQLQuery(query);

      const newStart = parseTime(entry.Start_time);
      const newEnd = parseTime(entry.End_time);

      if (newEnd <= newStart) {
        rejectedRecords.push({
          recordNumber: index + 1,
          reason: "Invalid time range",
          Entry_Date: currDate,
          Start_time: entry.Start_time,
          End_time: entry.End_time
        });
        continue;
      }

      if (!checkTimeOverlap(newStart, newEnd, existingEntries)) {
        rejectedRecords.push({
          recordNumber: index + 1,
          reason: "Time overlap with existing entry",
          Entry_Date: currDate,
          Start_time: entry.Start_time,
          End_time: entry.End_time
        });
      }
    }


    if (rejectedRecords.length > 0) {
      const approvalPayload = {
        Status: "Rejected",
        Rejected: true,
        Reason: JSON.stringify(rejectedRecords),
        Timeentry_Data,
        ApproveDate,
        Username,
        ApprovedBy: ApprovedBy,
        ApproveByID,
        User_Id: User_ID,
        ROWID,
        Task_Id,
        Task_Name,
        Project_ID,
        Project_Name,
      };

      const approvalRecord = await approvalTable.updateRow(approvalPayload);

      return res.status(200).json({
        success: false,
        message: "Bulk time entry rejected",
        rejectedRecords,
        data: approvalRecord
      });
    }

    // ✅ All records valid → Insert (clean empty sprint fields from each entry)
    const cleanedEntries = timeEntriesArray.map(entry => {
      const cleaned = cleanSprintFields(entry);
      // For sprint-sourced entries, remove Task_ID to avoid FK violation
      if (cleaned.Source_Type && cleaned.Source_Type.startsWith("SPRINT")) {
        delete cleaned.Task_ID;
      }
      return cleaned;
    });
    const createdRecords = await timeEntryTable.insertRows(cleanedEntries);

    const approvalPayload = {
      Status: "Accepted",
      Rejected: false,
      Reason: "All time entries validated and added successfully",
      ApproveDate,
      Username,
      ApprovedBy: ApprovedBy,
      ApproveByID,
      User_Id: User_ID,
      ROWID,
      Task_Id,
      Task_Name,
      Project_ID,
      Project_Name,
      Timeentry_Data
    };

    await approvalTable.updateRow(approvalPayload);

    return res.status(200).json({
      success: true,
      message: "Bulk time entry added successfully",
      data: createdRecords
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add bulk time entry",
      error: error.message
    });
  }
};

const createTimeEntryApproval = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const zcql = catalystApp.zcql();

    const approvalTable = datastore.table("Time_Entry_Approvals");
    const approvalData = req.body;
    const { Timeentry_Data, User_Id } = approvalData;
    const timeEntriesArray = JSON.parse(Timeentry_Data);

    if (!Array.isArray(timeEntriesArray) || timeEntriesArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Time entry data is required"
      });
    }

    const rejectedRecords = [];

    for (let index = 0; index < timeEntriesArray.length; index++) {
      const entry = timeEntriesArray[index];

      console.log("entry", entry);

      const entryDate = entry.Entry_Date;
      const userId = entry.User_ID || User_Id;

      const query = `
        SELECT Start_time, End_time
        FROM Time_Entries
        WHERE User_ID = '${userId}'
        AND Entry_Date = '${entryDate}'
      `;

      const existingEntries = await zcql.executeZCQLQuery(query);

      const newStart = parseTime(entry.Start_time);
      const newEnd = parseTime(entry.End_time);

      if (newEnd <= newStart) {
        rejectedRecords.push({
          recordNumber: index + 1,
          reason: "Invalid time range",
          Entry_Date: entryDate,
          Start_time: entry.Start_time,
          End_time: entry.End_time
        });
        continue;
      }

      if (!checkTimeOverlap(newStart, newEnd, existingEntries)) {
        rejectedRecords.push({
          recordNumber: index + 1,
          reason: "Time overlap with existing entry",
          Entry_Date: entryDate,
          Start_time: entry.Start_time,
          End_time: entry.End_time
        });
      }
    }

    // ❌ Stop approval request creation if conflicts exist
    if (rejectedRecords.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Approval request not created due to time entry conflicts",
        rejectedRecords
      });
    }

    // ✅ Safe to create approval request
    const createdRecord = await approvalTable.insertRow(approvalData);

    return res.status(200).json({
      success: true,
      message: "Approval request created successfully",
      data: createdRecord
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create approval request",
      error: error.message
    });
  }
};

const getTeamTimeEntryApproval = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();


    const userId = req.params.userId;
    console.log("userId", userId);
    let query = "";

    if (userId) {
      const safeUserId = userId.replace(/'/g, "''");

      const teamQuery = `
        SELECT User_Id
        FROM Users
        WHERE ReporterID = '${safeUserId}'
      `;

      const teamResp = await zcql.executeZCQLQuery(teamQuery);

      if (!teamResp || teamResp.length === 0) {
        return res.status(200).json({
          message: "No team members found",
          data: []
        });
      }

      const teamIDs = teamResp
        .map(item => item?.Users?.User_Id)
        .filter(Boolean)
        .map(id => `'${id}'`)
        .join(",");

      console.log("teamIDs", teamIDs);

      query = `
        SELECT *
        FROM Time_Entry_Approvals
        WHERE User_Id IN (${teamIDs})
      `;
    }
    // CASE 2: no userId → fetch all approvals
    else {
      query = `
        SELECT *
        FROM Time_Entry_Approvals
      `;
    }

    const resp = await zcql.executeZCQLQuery(query);

    if (!resp || resp.length === 0) {
      return res.status(200).json({
        message: "No approval found",
        data: []
      });
    }

    const formattedResult = resp.map(item => item.Time_Entry_Approvals);

    return res.status(200).json({
      message: "Approval requests fetched successfully",
      data: formattedResult
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get approval",
      error: error.message
    });
  }
};

const getUserTimeEntryApproval = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(500).json({
      success: false,
      message: "UserID is required"
    })
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `
        SELECT *
        FROM Time_Entry_Approvals
        WHERE User_Id = '${userId}'
      `

    const resp = await zcql.executeZCQLQuery(query);
    const formattedResult = resp.map(item => item.Time_Entry_Approvals);

    return res.status(200).json({
      success: true,
      message: "Approval fetched successfully",
      data: formattedResult
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get approval",
      error: error.message
    })
  }
}


const checkTimerForUser = async (req, res) => {
  const { User_ID, Task_ID } = req.query;

  if (!User_ID) {
    return res.status(500).json({
      message: "UserId is required",
      success: false,
    })
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = Task_ID ? `
      SELECT *
        FROM Time_Entry_Logs
        WHERE Time_Entry_Logs.User_ID = '${User_ID}'
        AND Time_Entry_Logs.Task_ID = '${Task_ID}'
          AND Time_Entry_Logs.End_time IS NULL AND isRejected = false;
    `: `
      SELECT *
        FROM Time_Entry_Logs
        WHERE Time_Entry_Logs.User_ID = '${User_ID}'
          AND Time_Entry_Logs.End_time IS NULL AND isRejected = false;
    `;

    console.log("query", query);

    const userTimeRep = await zcql.executeZCQLQuery(query);
    console.log("userTimeRep", userTimeRep);

    if (userTimeRep.length && userTimeRep[0].Time_Entry_Logs?.End_time === null) {
      const log = userTimeRep[0].Time_Entry_Logs;
      return res.status(200).json({
        message: "Timer is Running",
        TimerId: log.ROWID,
        Task_ID: log.Task_ID,
        Task_Name: log.Task_Name,
        Entry_Date: log.Entry_Date,
        startTime: log.Start_time,
        // Sprint fields (will be null/undefined for legacy timers)
        Source_Type: log.Source_Type || null,
        Sprint_ID: log.Sprint_ID || null,
        Story_ID: log.Story_ID || null,
        Sprint_Task_ID: log.Sprint_Task_ID || null,
        Sprint_SubTask_ID: log.Sprint_SubTask_ID || null,
      });
    }

    return res.status(200).json({
      message: "Timer is not Running",
      data: []
    });


  } catch (err) {
    return res.status(500).json({
      message: "Failed to check timer",
      success: false,
      error: err.message
    })
  }

}

const startTimer = async (req, res) => {
  const {
    Project_ID,
    Project_Name,
    Entry_Date,
    Task_Name,
    Task_ID,
    Username,
    User_ID
  } = req.body;

  // Validation
  if (
    !Project_ID ||
    !Project_Name ||
    !Entry_Date ||
    !Task_Name ||
    !Task_ID ||
    !Username ||
    !User_ID
  ) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const timeEntryTimerTable =
      catalystApp.datastore().table("Time_Entry_Logs");

    const safeUser_ID = User_ID.replace(/'/g, "''");

    const checkTimerQuery = `
      SELECT *
      FROM Time_Entry_Logs
      WHERE User_ID = '${safeUser_ID}'
        AND End_time IS NULL AND isRejected = false;
    `;

    const timerResp = await catalystApp.zcql().executeZCQLQuery(checkTimerQuery);

    if (
      timerResp.length > 0 &&
      timerResp[0]?.Time_Entry_Logs?.End_time === null
    ) {
      const runningTimer = timerResp[0].Time_Entry_Logs;

      return res.status(200).json({
        success: true,
        message: `Timer is already running for Task - ${runningTimer.Task_Name}`,
        Task_ID: runningTimer.Task_ID,
        Task_Name: runningTimer.Task_Name,
        Entry_Date: runningTimer.Entry_Date,
        startTime: runningTimer.Start_time,
      });
    }

    // Include optional sprint fields in the timer log
    const sprintFields = pickSprintFields(req.body);

    const timerInsertData = {
      Start_time: getFormattedDateTime(),
      Project_ID,
      Project_Name,
      Entry_Date,
      Task_Name,
      Task_ID,
      Username,
      User_ID,
      ...sprintFields,
    };

    // For sprint-sourced entries, remove Task_ID to avoid FK violation
    // (sprint task IDs are not ROWIDs in the Tasks table)
    if (timerInsertData.Source_Type && timerInsertData.Source_Type.startsWith("SPRINT")) {
      delete timerInsertData.Task_ID;
    }

    const timerAdded = await timeEntryTimerTable.insertRow(timerInsertData);

    return res.status(201).json({
      success: true,
      message: "Timer record created successfully",
      data: timerAdded,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in creating a timer record",
      error: err.message,
    });
  }
};

const endTimer = async (req, res) => {
  const { ROWID, Note, Type } = req.body;

  // Validation
  if (!ROWID || !Note || !Type) {
    return res.status(400).json({
      success: false,
      message: "ROWID, Note and Type are required",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const safeTimerId = ROWID.replace(/'/g, "''");

    const checkTimerQuery = `
      SELECT *
      FROM Time_Entry_Logs
      WHERE ROWID = '${safeTimerId}'
        AND End_time IS NULL AND isRejected = false;
    `;

    const checkTimerResp = await catalystApp.zcql().executeZCQLQuery(checkTimerQuery);

    if (!checkTimerResp.length) {
      return res.status(404).json({
        success: false,
        message: "Running timer not found",
      });
    }

    const timerLog = checkTimerResp[0].Time_Entry_Logs;

    const timeEntryTimerTable =
      catalystApp.datastore().table("Time_Entry_Logs");
    const timeEntryTable =
      catalystApp.datastore().table("Time_Entries");

    // Time handling
    const startDateTime = timerLog.Start_time;              // YYYY-MM-DD HH:mm:ss
    const endDateTime = getFormattedDateTime();             // YYYY-MM-DD HH:mm:ss

    const totalMinutes = calculateTotalMinutes(
      startDateTime,
      endDateTime
    );

    // Convert ONLY for Time_Entries table
    const startTimeAMPM = formatTimeAMPM(startDateTime);    // 5:05 PM
    const endTimeAMPM = formatTimeAMPM(endDateTime);        // 6:10 PM

    // Carry sprint fields from timer log (if they exist)
    const sprintFields = pickSprintFields(timerLog);

    // Insert final entry
    const newTimeEntry = {
      Start_time: startTimeAMPM,
      End_time: endTimeAMPM,
      Total_time: totalMinutes,
      Project_ID: timerLog.Project_ID,
      Project_Name: timerLog.Project_Name,
      Entry_Date: timerLog.Entry_Date,
      Task_Name: timerLog.Task_Name,
      Task_ID: timerLog.Task_ID,
      Type,
      Username: timerLog.Username,
      Note,
      User_ID: timerLog.User_ID,
      ...sprintFields,
    };

    // For sprint-sourced entries, remove Task_ID to avoid FK violation
    if (newTimeEntry.Source_Type && newTimeEntry.Source_Type.startsWith("SPRINT")) {
      delete newTimeEntry.Task_ID;
    }

    await timeEntryTable.insertRow(newTimeEntry);

    // Stop timer in logs table
    const timerEnd = await timeEntryTimerTable.updateRow({
      ROWID,
      End_time: endDateTime,
      Total_time: totalMinutes,
      Note,
      Type
    });

    return res.status(200).json({
      success: true,
      message: "Timer stopped successfully",
      timeEntryLog: timerEnd,
      timeEntry: newTimeEntry,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in stopping timer",
      error: err.message,
    });
  }
};



module.exports = {
  getTimeEntryByTaskId,
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
  getTimeEntryByProjectId,
  getTimeEntryForExcel,
  getTimeEntryByUser,
  approveTimeEntry,
  createTimeEntryApproval,
  getTeamTimeEntryApproval,
  getUserTimeEntryApproval,
  checkTimerForUser,
  startTimer,
  endTimer
};
