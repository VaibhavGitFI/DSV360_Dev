"use strict";

const milestoneRepo = require("../models/milestoneRepo");
const epicRepo = require("../models/epicRepo");
const storyRepo = require("../models/storyRepo");
const taskRepo = require("../models/taskRepo");
const subTaskRepo = require("../models/subTaskRepo");
const { sendAssignmentEmail } = require("./notificationService");

function getOrgId(user) {
  return String(user?.org_id || user?.orgId || "");
}

/**
 * Phase 1: normalize story priority
 * - DB column remains Priorityy
 * - API response exposes Priority only
 * - Priorityy is removed from response to prevent frontend coupling
 */
function normalizeStory(row) {
  if (!row || typeof row !== "object") return row;

  const Priority = row.Priorityy ?? row.Priority ?? "MEDIUM";
  const normalized = { ...row, Priority };

  // Never expose datastore-specific column name
  delete normalized.Priorityy;

  return normalized;
}

async function listHierarchy({ catalystApp, user, projectId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const zcql = catalystApp.zcql();

  // Wrap each query so a missing table returns [] instead of crashing all queries
  const safeQuery = (fn) =>
    fn.catch((err) => {
      console.warn("Hierarchy query skipped (table may not exist):", err?.message || err);
      return [];
    });

  const [milestonesRaw, epicsRaw, storiesRaw] = await Promise.all([
    safeQuery(milestoneRepo.list(zcql, { orgId, projectId: projectId || "" })),
    safeQuery(epicRepo.list(zcql, { orgId, projectId: projectId || "" })),
    safeQuery(storyRepo.list(zcql, { orgId, projectId: projectId || "" })),
  ]);

  const milestones = milestoneRepo.unwrap(milestonesRaw);
  const epics = epicRepo.unwrap(epicsRaw);
  const stories = storyRepo.unwrap(storiesRaw).map(normalizeStory);

  // Batch-fetch tasks and subtasks for all stories
  const storyIds = stories.map((s) => s.ROWID);
  let tasks = [];
  let subTasks = [];

  if (storyIds.length > 0) {
    const [tasksRaw, subTasksRaw] = await Promise.all([
      safeQuery(taskRepo.listByStoryIds(zcql, { orgId, storyIds })),
      safeQuery(subTaskRepo.listByStoryIds(zcql, { orgId, storyIds })),
    ]);
    tasks = taskRepo.unwrap(tasksRaw);
    subTasks = subTaskRepo.unwrap(subTasksRaw);
  }

  return { milestones, epics, stories, tasks, subTasks };
}

async function createMilestone({ catalystApp, user, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();

  return await milestoneRepo.insert(datastore, {
    OrgID: orgId,
    ProjectID: payload.ProjectID || "",
    Title: payload.Title,
    Description: payload.Description || "",
    DueDate: payload.DueDate || "",
    IsDeleted: 0,
  });
}

async function createEpic({ catalystApp, user, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();

  return await epicRepo.insert(datastore, {
    OrgID: orgId,
    ProjectID: payload.ProjectID || "",
    MilestoneID: payload.MilestoneID,
    Title: payload.Title,
    Description: payload.Description || "",
    Color: payload.Color || "#243859",
    IsDeleted: 0,
  });
}

async function createStory({ catalystApp, user, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();

  const result = await storyRepo.insert(datastore, {
    OrgID: orgId,
    ProjectID: payload.ProjectID || "",
    EpicID: payload.EpicID,
    SprintID: payload.SprintID || "",
    Title: payload.Title,
    Description: payload.Description || "",
    Points: Number(payload.Points || 0),

    // Phase 1 input contract:
    // accept Priorityy or Priority, store in Priorityy
    Priorityy: payload.Priorityy || payload.Priority || "MEDIUM",

    Status: payload.Status || "TODO",
    AssigneeID: payload.AssigneeID || "",
    IsDeleted: 0,
  });

  if (payload.AssigneeID) {
    sendAssignmentEmail(catalystApp, {
      assigneeId: payload.AssigneeID,
      itemType: "Story",
      title: payload.Title,
      status: payload.Status || "TODO",
      dueDate: payload.DueDate || "",
    });
  }

  return result;
}

async function updateStory({ catalystApp, user, storyId, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();

  // Map API payload into datastore column names
  const patch = {};

  if (payload.Title !== undefined) patch.Title = payload.Title;
  if (payload.Description !== undefined) patch.Description = payload.Description;
  if (payload.EpicID !== undefined) patch.EpicID = payload.EpicID;
  if (payload.SprintID !== undefined) patch.SprintID = payload.SprintID;
  if (payload.AssigneeID !== undefined) patch.AssigneeID = payload.AssigneeID;
  if (payload.Points !== undefined) patch.Points = Number(payload.Points || 0);
  if (payload.Status !== undefined) patch.Status = payload.Status;

  // Priority: store into Priorityy (datastore column)
  if (payload.Priority !== undefined) patch.Priorityy = payload.Priority;

  // Always ensure row is not deleted
  patch.IsDeleted = 0;

  const updated = await storyRepo.update(datastore, String(storyId), patch);

  if (payload.AssigneeID !== undefined && payload.AssigneeID) {
    sendAssignmentEmail(catalystApp, {
      assigneeId: payload.AssigneeID,
      itemType: "Story",
      title: payload.Title || "",
      status: payload.Status || "",
      dueDate: payload.DueDate || "",
    });
  }

  // return normalized shape for frontend
  const updatedRow = updated?.data || updated;
  return normalizeStory(updatedRow);
}

async function updateMilestone({ catalystApp, user, milestoneId, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");
  const datastore = catalystApp.datastore();
  const patch = {};
  if (payload.Title !== undefined) patch.Title = payload.Title;
  if (payload.Description !== undefined) patch.Description = payload.Description;
  if (payload.DueDate !== undefined) patch.DueDate = payload.DueDate;
  patch.IsDeleted = 0;
  return await milestoneRepo.update(datastore, String(milestoneId), patch);
}

async function softDeleteMilestone({ catalystApp, user, milestoneId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");
  const datastore = catalystApp.datastore();
  return await milestoneRepo.softDelete(datastore, { orgId, id: milestoneId });
}

async function updateEpic({ catalystApp, user, epicId, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");
  const datastore = catalystApp.datastore();
  const patch = {};
  if (payload.Title !== undefined) patch.Title = payload.Title;
  if (payload.Description !== undefined) patch.Description = payload.Description;
  if (payload.MilestoneID !== undefined) patch.MilestoneID = payload.MilestoneID;
  if (payload.Color !== undefined) patch.Color = payload.Color;
  patch.IsDeleted = 0;
  return await epicRepo.update(datastore, String(epicId), patch);
}

async function softDeleteEpic({ catalystApp, user, epicId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");
  const datastore = catalystApp.datastore();
  return await epicRepo.softDelete(datastore, { orgId, id: epicId });
}

async function softDeleteStory({ catalystApp, user, storyId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");
  const datastore = catalystApp.datastore();
  return await storyRepo.softDelete(datastore, { orgId, id: storyId });
}

module.exports = {
  listHierarchy,
  createMilestone,
  createEpic,
  createStory,
  updateStory,
  updateMilestone,
  softDeleteMilestone,
  updateEpic,
  softDeleteEpic,
  softDeleteStory,
};

