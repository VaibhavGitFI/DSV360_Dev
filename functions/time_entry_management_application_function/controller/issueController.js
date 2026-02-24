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
const { log } = require("console");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const getAllIssues = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    try {
      const catalystApp = req.catalystApp;
      const datastore = catalystApp.datastore();
      const table = datastore.table("Issues");
      const records = await table.getAllRows();

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch issues",
        error: error.message,
      });
    }
  } else {
    try {
      const catalystApp = req.catalystApp;
      const zcql = catalystApp.zcql();
      const datastore = catalystApp.datastore();

      const query = `SELECT * FROM Issues WHERE ROWID = ${id}`;
      const queryResp = await zcql.executeZCQLQuery(query);

      res.status(200).json({
        success: true,
        data: queryResp,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch issue",
        error: error.message,
      });
    }
  }
};

const projectIssues = async (req, res) => {
  let id = req.params.userID;

  console.log("Fetching issues for project", id);

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT * FROM Issues WHERE Project_ID = ${id}`;
    const response = await zcql.executeZCQLQuery(query);

    const formattedResponse = response.map((issues) => {
      return issues.Issues;
    });

    console.log("Issues fetched successfully for projects", formattedResponse);

    res.status(200).json({
      success: true,
      data: formattedResponse, // flatten in case each resp is an array
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }
};

const getAllAssignIssues = async (req, res) => {
  const id = req.params.userID; // Assuming userID is passed in the request params

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "No user ID provided",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore("Issues");

    // Fetch all issues from the datastore
    const query = `SELECT * FROM Issues`;
    const queryResp = await zcql.executeZCQLQuery(query);

    // Filter issues based on whether the Assignee_ID contains the userID
    const response = queryResp.filter((item) => {
      console.log("issue", item.Issues);
      const issue = item.Issues;
      const assignID = issue.Assignee_ID;
      const assignIdsArray = assignID?.split(",");
      return assignIdsArray?.includes(id);
    });

    const formattedResponse = response.map((item) => item.Issues);
    // Return the filtered results
    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};

const getAllClientIssues = async (req, res) => {
  const id = req.params.userID;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "No client ID provided",
    });
  }
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore("Issues");
    const query = `SELECT * FROM Issues WHERE Reporter_ID = ${id}`;
    const queryResp = await zcql.executeZCQLQuery(query);

    const formattedResponse = queryResp.map((item) => item.Issues);

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
      error: error.message,
    });
  }
};
const createIssue = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const stratus = catalystApp.stratus();
    const bucket = stratus.bucket("dsv365");

    const issueData = JSON.parse(JSON.stringify(req.body));

    if (!issueData) {
      return res.status(400).json({
        success: false,
        message: "No issue data provided",
      });
    }

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
      const uniqueFileName = `${timestamp}_issue_file.${ext}`;
      const uploadPath = `dsv365/issue/${uniqueFileName}`;
      const tempFilePath = path.join(os.tmpdir(), file.name);

      // Temporarily save file and upload to Stratus
      await file.mv(tempFilePath);
      await bucket.putObject(uploadPath, fs.createReadStream(tempFilePath));

      const uploadedObject = bucket.object(uploadPath);
      const objectDetails = await uploadedObject.getDetails();
      uploadedURLs.push(objectDetails.object_url);
    }

    const allFileURLs = uploadedURLs.join(",");

    console,log("All file url",allFileURLs)
    issueData["Files"] = allFileURLs;
console.log("sadd",issueData)
    const table = catalystApp.datastore().table("Issues");
    const newIssue = await table.insertRow(issueData);

    

    res.status(201).json({
      success: true,
      data: newIssue,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create issue",
      error: error.message,
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Issues");
    const issueId = req.params.ROWID;
    const issueData = req.body;

    if (!issueId || !issueData) {
      return res.status(400).json({
        success: false,
        message: "No issue ID or data provided",
      });
    }

    const updatedIssue = await table.updateRow({
      ROWID: issueId,
      ...issueData,
    });

    res.status(200).json({
      success: true,
      data: updatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update issue",
      error: error.message,
    });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Issues");
    const issueId = req.params.ROWID;

    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "No issue ID provided",
      });
    }

    await table.deleteRow(issueId);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete issue",
      error: error.message,
    });
  }
};

const assignIssue = async (req, res) => {
  const id = req.params.ROWID;
  const { Assignee_ID, Assignee_Name } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "No issue ID provided",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Issues");

    const updatedIssue = await table.updateRow({
      ROWID: id,
      Assignee_ID,
      Assignee_Name,
    });

    res.status(200).json({
      success: true,
      message: "Issue assigned successfully",
      data: updatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign issue",
      error: error.message,
    });
  }
};

module.exports = {
  getAllIssues,
  projectIssues,
  getAllAssignIssues,
  getAllClientIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
};
