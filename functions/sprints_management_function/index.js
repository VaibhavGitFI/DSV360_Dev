"use strict";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const catalyst = require("zcatalyst-sdk-node");

const { requireUser } = require("./middlewares/requireUser");
const sprintController = require("./controller/sprintController");
const hierarchyController = require("./controller/hierarchyController");
const taskController = require("./controller/taskController");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Attach Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

function ensureFn(fn, name) {
  if (typeof fn !== "function") {
    console.error(`[ROUTE_BIND_ERROR] "${name}" is not a function. Got:`, fn);
    throw new Error(`Route handler "${name}" is undefined or not a function`);
  }
  return fn;
}

// ✅ Health
app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "sprints_management_function",
    env: process.env.CATALYST_USER_ENVIRONMENT || "unknown",
  });
});

// ✅ Root
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "sprints_management_function",
    message: "Use /health, /sprints, /hierarchy",
  });
});

// ✅ Sprint routes (auth required)
app.get("/sprints", ensureFn(requireUser, "requireUser"), ensureFn(sprintController.list, "sprintController.list"));
app.post("/sprints", ensureFn(requireUser, "requireUser"), ensureFn(sprintController.create, "sprintController.create"));
app.get("/sprints/:id", ensureFn(requireUser, "requireUser"), ensureFn(sprintController.getById, "sprintController.getById"));
app.patch("/sprints/:id", ensureFn(requireUser, "requireUser"), ensureFn(sprintController.update, "sprintController.update"));
app.delete("/sprints/:id", ensureFn(requireUser, "requireUser"), ensureFn(sprintController.remove, "sprintController.remove"));

// ✅ Hierarchy routes (auth required)
app.get("/hierarchy", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.list, "hierarchyController.list"));

app.post("/milestones", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.createMilestone, "hierarchyController.createMilestone"));
app.patch("/milestones/:id", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.updateMilestone, "hierarchyController.updateMilestone"));
app.delete("/milestones/:id", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.removeMilestone, "hierarchyController.removeMilestone"));

app.post("/epics", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.createEpic, "hierarchyController.createEpic"));
app.patch("/epics/:id", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.updateEpic, "hierarchyController.updateEpic"));
app.delete("/epics/:id", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.removeEpic, "hierarchyController.removeEpic"));

app.post("/stories", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.createStory, "hierarchyController.createStory"));
app.patch("/stories/:id", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.updateStory, "hierarchyController.updateStory"));
app.delete("/stories/:id", ensureFn(requireUser, "requireUser"), ensureFn(hierarchyController.removeStory, "hierarchyController.removeStory"));

// ✅ Task routes (auth required)
app.get("/tasks", ensureFn(requireUser, "requireUser"), ensureFn(taskController.listByStory, "taskController.listByStory"));
app.post("/tasks", ensureFn(requireUser, "requireUser"), ensureFn(taskController.create, "taskController.create"));
app.patch("/tasks/:id", ensureFn(requireUser, "requireUser"), ensureFn(taskController.update, "taskController.update"));
app.delete("/tasks/:id", ensureFn(requireUser, "requireUser"), ensureFn(taskController.remove, "taskController.remove"));

// ✅ SubTask routes (auth required)
app.post("/subtasks", ensureFn(requireUser, "requireUser"), ensureFn(taskController.createSubTask, "taskController.createSubTask"));
app.patch("/subtasks/:id", ensureFn(requireUser, "requireUser"), ensureFn(taskController.updateSubTask, "taskController.updateSubTask"));
app.delete("/subtasks/:id", ensureFn(requireUser, "requireUser"), ensureFn(taskController.removeSubTask, "taskController.removeSubTask"));

// ✅ 404
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "The endpoint you are looking for does not exist.",
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("[SPRINTS_FUNCTION_ERROR]", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err?.message || "Unknown error",
  });
});

module.exports = app;
