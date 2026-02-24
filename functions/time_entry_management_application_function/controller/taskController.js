"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const os = require("os");
const fs = require("fs");
const mime = require("mime-types");
const catalyst = require("zcatalyst-sdk-node");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const getAllTasks = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    try {
      const catalystApp = req.catalystApp;
      const datastore = catalystApp.datastore();
      const table = datastore.table("Tasks");
      const records = await table.getAllRows();


    records.sort((a, b) => {
      return new Date(b.CREATEDTIME) - new Date(a.CREATEDTIME);
    });

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
        error: error.message,
      });
    }
  } else {
    try {
      const catalystApp = req.catalystApp;
      const zcql = catalystApp.zcql();
      const datastore = catalystApp.datastore();

      const query = `SELECT * FROM Projects WHERE ROWID = ${id}`;
      const queryResp = await zcql.executeZCQLQuery(query);

      res.status(200).json({
        success: true,
        data: queryResp,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch project",
        error: error.message,
      });
    }
  }
};

const getTasksByEmployee = async (req, res) => {
  try {
    const userID = req.params.userid;
    if (!userID) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Get all tasks and filter for the specific user
    const tasksResp = await zcql.executeZCQLQuery(`SELECT * FROM Tasks ORDER BY CREATEDTIME DESC`);
    

 // Filter tasks where userID is either the creator OR exists in Assign_To_ID
const userTasks = tasksResp.filter((task) => {
  // If user is the creator, return immediately
  if (task.Tasks.CREATORID === userID) {
    return true;
  }

  // Otherwise, check Assign_To_ID
  const assignedIds = task.Tasks.Assign_To_ID
    ? task.Tasks.Assign_To_ID.split(",").map((id) => id.trim())
    : [];

  return assignedIds.includes(userID);
});



    if (userTasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No tasks assigned to this user",
      });
    }

    const formattedTasks = userTasks.map((task) => {
      return task.Tasks
    });

    return res.status(200).json({
      success: true,
      data: formattedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tasks",
      error: error.message,
    });
  }
};

// const tasksByProject = async (req, res) => {
//   const projectID = req.params.id;
//   if (!projectID) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Project ID is required" });
//   }
//   try {
//     const catalystApp = req.catalystApp;
//     const zcql = catalystApp.zcql();
//     const query = `SELECT * FROM Tasks WHERE ProjectID = '${projectID}'`;
//     const tasks = await zcql.executeZCQLQuery(query);
//     if (!tasks || tasks.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No tasks found for this project" });
//     }
//     const formattedTasks = tasks.map((task) => ({
//       ROWID: task.Tasks.ROWID,
//       Task_Name: task.Tasks.Task_Name,
//       Project_Name: task.Tasks.Project_Name,
//       Project_ID: task.Tasks.ProjectID,
//       Status: task.Tasks.Status,
//       Assign_To_ID: task.Tasks.Assign_To_ID,
//       Assign_To: task.Tasks.Assign_To,
//       Start_Date: task.Tasks.Start_Date,
//       End_Date: task.Tasks.End_Date,
//       Description: task.Tasks.Description,
//       Files:task.Tasks.Files,
//       Type:task.Tasks.Type,
//     }));
//     return res.status(200).json({
//       success: true,
//       data: formattedTasks,
//     });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching tasks",
//       error: error.message,
//     });
//   }
// };


const tasksByProject = async (req, res) => {
  let { projectID } = req.body; // Can be string or array

  if (!projectID || (Array.isArray(projectID) && projectID.length === 0)) {
    return res
      .status(400)
      .json({ success: false, message: "Project ID(s) are required" });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Normalize to array for consistent handling
    const projectIDs = Array.isArray(projectID) ? projectID : [projectID];

    // Create SQL IN clause
    const idsString = projectIDs.map(id => `'${id}'`).join(", ");
    const query = `SELECT * FROM Tasks WHERE ProjectID IN (${idsString})`;

    const tasks = await zcql.executeZCQLQuery(query);

    if (!tasks || tasks.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No tasks found for given project(s)" ,data:[]});
    }

    const formattedTasks = tasks.map(task => ({
      ROWID: task.Tasks.ROWID,
      Task_Name: task.Tasks.Task_Name,
      Project_Name: task.Tasks.Project_Name,
      Project_ID: task.Tasks.ProjectID,
      Status: task.Tasks.Status,
      Assign_To_ID: task.Tasks.Assign_To_ID,
      Assign_To: task.Tasks.Assign_To,
      Start_Date: task.Tasks.Start_Date,
      End_Date: task.Tasks.End_Date,
      Description: task.Tasks.Description,
      Files: task.Tasks.Files,
      Type: task.Tasks.Type,
    }));

    return res.status(200).json({
      success: true,
      data: formattedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tasks",
      error: error.message,
    });
  }
};


const createTask = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const stratus = catalystApp.stratus();
    const bucket = stratus.bucket("dsv365");

    const taskData = JSON.parse(JSON.stringify(req.body));

    let files = [];
    if (req.files) {
      files = Array.isArray(req.files.files)
        ? req.files.files
        : [req.files.files];
    }

    const uploadedURLs = [];

    for (const file of files) {
      const timestamp = Date.now();
      const ext = mime.extension(file.mimetype) || "bin";
      const uniqueFileName = `${timestamp}_task_file.${ext}`;
      const uploadPath = `dsv365/task/${uniqueFileName}`;
      const tempFilePath = path.join(os.tmpdir(), file.name);

      // Save temporarily and upload to Stratus
      await file.mv(tempFilePath);
      await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

      const uploadedObject = bucket.object(uploadPath);
      const objectDetails = await uploadedObject.getDetails();
      uploadedURLs.push(objectDetails.object_url);
    }

    const allFileURLs = uploadedURLs.join(",");
    console.log("✅ Uploaded Task File URLs:", allFileURLs);
    taskData["Files"] = allFileURLs;

    console.log("Task Data:", taskData);

    const table = catalystApp.datastore().table("Tasks");
    const createdRecord = await table.insertRow(taskData);

    res.status(201).json({
      success: true,
      data: createdRecord,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add task",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  const ROWID = req.params.ROWID;
  const updateData = req.body;

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");

    const response = await table.updateRow({
      ROWID,
      ProjectID: updateData.ProjectID,
      Project_Name: updateData.Project_Name,
      Assign_To: updateData.Assign_To,
      Assign_To_ID: updateData.Assign_To_ID,
      Task_Name: updateData.Task_Name,
      UserID: updateData.UserID,
      Status: updateData.Status,
      Start_Date: updateData.Start_Date,
      End_Date: updateData.End_Date,
      Description: updateData.Description,
      Type: updateData.Type,
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const ROWID = req.params.ROWID;
  //console.log(ROWID);

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");

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


const tasksByProjectAndUser = async (req, res) => { 
  const { projectID, userID } = req.query;

  if (!projectID || !userID) {
    return res.status(400).json({
      success: false,
      message: "Project ID and User ID are required",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT * FROM Tasks WHERE ProjectID = '${projectID}'`;
    const tasks = await zcql.executeZCQLQuery(query);

    const userTasks = tasks.filter((task) => {
      const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
        id.trim()
      );
      return assignedIds.includes(userID);
    });
    
    console.log("thr id is s", userTasks);

    if (!userTasks || userTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found for this project and user",
      });
    }


    const formattedTasks = userTasks.map((task) => (task.Tasks));

    return res.status(200).json({
      success: true,
      data: formattedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tasks",
      error: error.message,
    });
  }
};





module.exports = {
  getAllTasks,
  tasksByProject,
  getTasksByEmployee,
  createTask,
  updateTask,
  deleteTask,
  tasksByProjectAndUser,
};
