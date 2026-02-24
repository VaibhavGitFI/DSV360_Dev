"use strict";

const {
  validateCreateTaskPayload,
  validateUpdateTaskPayload,
  validateCreateSubTaskPayload,
  validateUpdateSubTaskPayload,
} = require("../utils/validate");

const taskService = require("../services/taskService");

const listByStory = async (req, res) => {
  try {
    const storyId = req.query.storyId ? String(req.query.storyId) : "";
    if (!storyId) return res.status(400).json({ success: false, message: "storyId query param is required" });

    const data = await taskService.listTasksByStory({
      catalystApp: req.catalystApp,
      user: req.user,
      storyId,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error listing tasks:", err);
    return res.status(500).json({ success: false, message: "Failed to list tasks", error: err?.message || "Unknown error" });
  }
};

const create = async (req, res) => {
  try {
    const v = validateCreateTaskPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const created = await taskService.createTask({
      catalystApp: req.catalystApp,
      user: req.user,
      payload: v.normalized,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error creating task:", err);
    return res.status(500).json({ success: false, message: "Failed to create task", error: err?.message || "Unknown error" });
  }
};

const update = async (req, res) => {
  try {
    const taskId = req.params.id ? String(req.params.id) : "";
    if (!taskId) return res.status(400).json({ success: false, message: "Task ID is required" });

    const v = validateUpdateTaskPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const updated = await taskService.updateTask({
      catalystApp: req.catalystApp,
      user: req.user,
      taskId,
      payload: v.normalized,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating task:", err);
    return res.status(500).json({ success: false, message: "Failed to update task", error: err?.message || "Unknown error" });
  }
};

const remove = async (req, res) => {
  try {
    const taskId = req.params.id ? String(req.params.id) : "";
    if (!taskId) return res.status(400).json({ success: false, message: "Task ID is required" });

    const out = await taskService.softDeleteTask({
      catalystApp: req.catalystApp,
      user: req.user,
      taskId,
    });

    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("Error deleting task:", err);
    return res.status(500).json({ success: false, message: "Failed to delete task", error: err?.message || "Unknown error" });
  }
};

const createSubTask = async (req, res) => {
  try {
    const v = validateCreateSubTaskPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const created = await taskService.createSubTask({
      catalystApp: req.catalystApp,
      user: req.user,
      payload: v.normalized,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error creating subtask:", err);
    return res.status(500).json({ success: false, message: "Failed to create subtask", error: err?.message || "Unknown error" });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const subTaskId = req.params.id ? String(req.params.id) : "";
    if (!subTaskId) return res.status(400).json({ success: false, message: "SubTask ID is required" });

    const v = validateUpdateSubTaskPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const updated = await taskService.updateSubTask({
      catalystApp: req.catalystApp,
      user: req.user,
      subTaskId,
      payload: v.normalized,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating subtask:", err);
    return res.status(500).json({ success: false, message: "Failed to update subtask", error: err?.message || "Unknown error" });
  }
};

const removeSubTask = async (req, res) => {
  try {
    const subTaskId = req.params.id ? String(req.params.id) : "";
    if (!subTaskId) return res.status(400).json({ success: false, message: "SubTask ID is required" });

    const out = await taskService.softDeleteSubTask({
      catalystApp: req.catalystApp,
      user: req.user,
      subTaskId,
    });

    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("Error deleting subtask:", err);
    return res.status(500).json({ success: false, message: "Failed to delete subtask", error: err?.message || "Unknown error" });
  }
};

module.exports = { listByStory, create, update, remove, createSubTask, updateSubTask, removeSubTask };
