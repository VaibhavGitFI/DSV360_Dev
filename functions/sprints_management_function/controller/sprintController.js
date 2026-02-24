"use strict";

const { validateCreateSprintPayload, validateUpdateSprintPayload } = require("../utils/validate");
const sprintService = require("../services/sprintService");

const list = async (req, res) => {
  try {
    const projectId = req.query.projectId ? String(req.query.projectId) : "";
    const data = await sprintService.listSprints({
      catalystApp: req.catalystApp,
      user: req.user,
      projectId,
    });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error listing sprints:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to list sprints",
      error: err?.message || "Unknown error",
    });
  }
};

const create = async (req, res) => {
  try {
    const v = validateCreateSprintPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const created = await sprintService.createSprint({
      catalystApp: req.catalystApp,
      user: req.user,
      payload: v.normalized,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error creating sprint:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create sprint",
      error: err?.message || "Unknown error",
    });
  }
};

const getById = async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ success: false, message: "Sprint id is required" });

    const row = await sprintService.getSprintById({
      catalystApp: req.catalystApp,
      user: req.user,
      id,
    });

    if (!row) return res.status(404).json({ success: false, message: "Sprint not found" });
    return res.status(200).json({ success: true, data: row });
  } catch (err) {
    console.error("Error getting sprint:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to get sprint",
      error: err?.message || "Unknown error",
    });
  }
};

const remove = async (req, res) => {
  try {
    const id = String(req.params.id || "");
    if (!id) return res.status(400).json({ success: false, message: "Sprint id is required" });

    const out = await sprintService.softDeleteSprint({
      catalystApp: req.catalystApp,
      user: req.user,
      id,
    });

    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    console.error("Error deleting sprint:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete sprint",
      error: err?.message || "Unknown error",
    });
  }
};

const update = async (req, res) => {
  try {
    const sprintId = req.params.id ? String(req.params.id) : "";
    if (!sprintId) return res.status(400).json({ success: false, message: "Sprint ID is required" });

    const v = validateUpdateSprintPayload(req.body || {});
    if (!v.ok) return res.status(400).json({ success: false, message: "Invalid payload", errors: v.errors });

    const updated = await sprintService.updateSprint({
      catalystApp: req.catalystApp,
      user: req.user,
      sprintId,
      payload: v.normalized,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating sprint:", err);
    return res.status(500).json({ success: false, message: "Failed to update sprint", error: err?.message || "Unknown error" });
  }
};

module.exports = { list, create, getById, update, remove };
