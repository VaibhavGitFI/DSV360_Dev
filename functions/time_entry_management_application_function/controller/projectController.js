"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const os = require("os");
const fs = require("fs");
const mime = require("mime-types");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const catalyst = require("zcatalyst-sdk-node");

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use(async (req, res, next) => {
  const catalystApp = catalyst.initialize(req);
  let userManagement = catalystApp.userManagement();
  let user = await userManagement.getCurrentUser();
  req.catalystApp = catalystApp;
  req.user = user;
  next();
});

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");
    const records = await table.getAllRows();

    records.sort((a, b) => {
      return new Date(b.CREATEDTIME) - new Date(a.CREATEDTIME);
    });

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get projects by user ID
const getProjectsByUserId = async (req, res) => {
  console.log("req,", req.params);
  try {
    const userID = req.params.userid;
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Get all tasks and filter those containing the userID
    const tasksResp = await zcql.executeZCQLQuery(
      `SELECT ProjectID, Assign_To_ID FROM Tasks`
    );

    // Filter tasks where userID exists in the comma-separated string
    const relevantTasks = tasksResp.filter((task) => {
      if (!task.Tasks.Assign_To_ID) return false;
      const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
        id.trim()
      );
      return assignedIds.includes(userID);
    });

    if (relevantTasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No tasks found for this user",
      });
    }

    // Get unique project IDs
    const projectIds = [
      ...new Set(relevantTasks.map((task) => task.Tasks.ProjectID)),
    ];

  
    const projectsResp = await zcql.executeZCQLQuery(
  `SELECT * FROM Projects 
   WHERE ROWID IN (${projectIds.join(",")}) 
      OR CREATORID = '${userID}' 
      OR Assigned_To_Id = '${userID}'
   ORDER BY CREATEDTIME DESC`
);

    if (!projectsResp || projectsResp.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: projectsResp,
    });
  } catch (error) {
    console.error("Error fetching projects by user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching project data",
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const stratus = catalystApp.stratus();
    const bucket = stratus.bucket("dsv365");

    const projectData = JSON.parse(JSON.stringify(req.body));

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
      const uniqueFileName = `${timestamp}_file.${ext}`;
      const uploadPath = `dsv365/project/${uniqueFileName}`;
      const tempFilePath = path.join(os.tmpdir(), file.name);

      // Save temporarily & upload to Stratus
      await file.mv(tempFilePath);
      await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

      const uploadedObject = bucket.object(uploadPath);
      const objectDetails = await uploadedObject.getDetails();
      uploadedURLs.push(objectDetails.object_url);
    }

    const allImageURLs = uploadedURLs.join(",");
    console.log("✅ Uploaded URLs:", allImageURLs);
    projectData["Files"] = allImageURLs;
    console.log("project", projectData);

    const table = catalystApp.datastore().table("Projects");
    const createdRecord = await table.insertRow(projectData);
    res.status(201).json({
      success: true,
      data: createdRecord,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add project",
      error: error.message,
    });
  }
};

module.exports = createProject;

// Update project
const updateProject = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const { ROWID } = req.params;
    const updateProjectData = req.body;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");

    const updatedRow = await table.updateRow({
      ROWID,
      ...updateProjectData,
    });

    console.log("Updated profile", updatedRow);

    res.status(200).json({
      success: true,
      data: updatedRow,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const { ROWID } = req.params;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");

    await table.deleteRow(ROWID);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// Export all functions
module.exports = {
  getAllProjects,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
};
