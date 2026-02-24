"use strict";

const {
  validateCreateMilestonePayload,
  validateCreateEpicPayload,
  validateCreateStoryPayload,
  validateUpdateStoryPayload,
  validateUpdateMilestonePayload,
  validateUpdateEpicPayload,
} = require("../utils/validate");

const hierarchyService = require("../services/hierarchyService");

const list = async (req, res) => {
  try {
    const projectId = req.query.projectId ? String(req.query.projectId) : "";
    const data = await hierarchyService.listHierarchy({
      catalystApp: req.catalystApp,
      user: req.user,
      projectId,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error listing hierarchy:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to list hierarchy",
      error: err?.message || "Unknown error",
    });
  }
};

const createMilestone = async (req, res) => {
  try {
    const v = validateCreateMilestonePayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const created = await hierarchyService.createMilestone({
      catalystApp: req.catalystApp,
      user: req.user,
      payload: v.normalized,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error creating milestone:", err);
    return res.status(500).json({ success: false, message: "Failed to create milestone", error: err?.message || "Unknown error" });
  }
};

const createEpic = async (req, res) => {
  try {
    const v = validateCreateEpicPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const created = await hierarchyService.createEpic({
      catalystApp: req.catalystApp,
      user: req.user,
      payload: v.normalized,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error creating epic:", err);
    return res.status(500).json({ success: false, message: "Failed to create epic", error: err?.message || "Unknown error" });
  }
};

const createStory = async (req, res) => {
  try {
    const v = validateCreateStoryPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const created = await hierarchyService.createStory({
      catalystApp: req.catalystApp,
      user: req.user,
      payload: v.normalized,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error creating story:", err);
    return res.status(500).json({ success: false, message: "Failed to create story", error: err?.message || "Unknown error" });
  }
};

const updateStory = async (req, res) => {
  try {
    const storyId = req.params.id ? String(req.params.id) : "";
    if (!storyId) return res.status(400).json({ success: false, message: "Story ID is required" });

    const v = validateUpdateStoryPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const updated = await hierarchyService.updateStory({
      catalystApp: req.catalystApp,
      user: req.user,
      storyId,
      payload: v.normalized,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating story:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update story",
      error: err?.message || "Unknown error",
    });
  }
};


const updateMilestone = async (req, res) => {
  try {
    const milestoneId = req.params.id ? String(req.params.id) : "";
    if (!milestoneId) return res.status(400).json({ success: false, message: "Milestone ID is required" });

    const v = validateUpdateMilestonePayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const updated = await hierarchyService.updateMilestone({
      catalystApp: req.catalystApp,
      user: req.user,
      milestoneId,
      payload: v.normalized,
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating milestone:", err);
    return res.status(500).json({ success: false, message: "Failed to update milestone", error: err?.message || "Unknown error" });
  }
};

const removeMilestone = async (req, res) => {
  try {
    const milestoneId = req.params.id ? String(req.params.id) : "";
    if (!milestoneId) return res.status(400).json({ success: false, message: "Milestone ID is required" });

    const out = await hierarchyService.softDeleteMilestone({
      catalystApp: req.catalystApp,
      user: req.user,
      milestoneId,
    });
    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("Error deleting milestone:", err);
    return res.status(500).json({ success: false, message: "Failed to delete milestone", error: err?.message || "Unknown error" });
  }
};

const updateEpic = async (req, res) => {
  try {
    const epicId = req.params.id ? String(req.params.id) : "";
    if (!epicId) return res.status(400).json({ success: false, message: "Epic ID is required" });

    const v = validateUpdateEpicPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const updated = await hierarchyService.updateEpic({
      catalystApp: req.catalystApp,
      user: req.user,
      epicId,
      payload: v.normalized,
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating epic:", err);
    return res.status(500).json({ success: false, message: "Failed to update epic", error: err?.message || "Unknown error" });
  }
};

const removeEpic = async (req, res) => {
  try {
    const epicId = req.params.id ? String(req.params.id) : "";
    if (!epicId) return res.status(400).json({ success: false, message: "Epic ID is required" });

    const out = await hierarchyService.softDeleteEpic({
      catalystApp: req.catalystApp,
      user: req.user,
      epicId,
    });
    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("Error deleting epic:", err);
    return res.status(500).json({ success: false, message: "Failed to delete epic", error: err?.message || "Unknown error" });
  }
};

const removeStory = async (req, res) => {
  try {
    const storyId = req.params.id ? String(req.params.id) : "";
    if (!storyId) return res.status(400).json({ success: false, message: "Story ID is required" });

    const out = await hierarchyService.softDeleteStory({
      catalystApp: req.catalystApp,
      user: req.user,
      storyId,
    });
    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("Error deleting story:", err);
    return res.status(500).json({ success: false, message: "Failed to delete story", error: err?.message || "Unknown error" });
  }
};

module.exports = {
  list,
  createMilestone,
  createEpic,
  createStory,
  updateStory,
  updateMilestone,
  removeMilestone,
  updateEpic,
  removeEpic,
  removeStory,
};

