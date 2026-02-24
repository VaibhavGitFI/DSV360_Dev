"use strict";

const taskRepo = require("../models/taskRepo");
const subTaskRepo = require("../models/subTaskRepo");
const { sendAssignmentEmail } = require("./notificationService");

function getOrgId(user) {
  return String(user?.org_id || user?.orgId || "");
}

async function listTasksByStory({ catalystApp, user, storyId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const zcql = catalystApp.zcql();
  const tasksRaw = await taskRepo.list(zcql, { orgId, storyId });
  const tasks = taskRepo.unwrap(tasksRaw);

  // Fetch subtasks for all tasks in one batch
  const taskIds = tasks.map((t) => t.ROWID);
  let subTasks = [];
  if (taskIds.length > 0) {
    const subRaw = await subTaskRepo.listByTaskIds(zcql, { orgId, taskIds });
    subTasks = subTaskRepo.unwrap(subRaw);
  }

  // Group subtasks by TaskID
  const subsByTask = {};
  for (const st of subTasks) {
    const tid = st.TaskID;
    if (!subsByTask[tid]) subsByTask[tid] = [];
    subsByTask[tid].push(st);
  }

  // Nest subtasks into tasks
  return tasks.map((t) => ({
    ...t,
    subTasks: subsByTask[t.ROWID] || [],
  }));
}

async function createTask({ catalystApp, user, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();

  const result = await taskRepo.insert(datastore, {
    OrgID: orgId,
    ProjectID: payload.ProjectID || "",
    StoryID: payload.StoryID,
    Title: payload.Title,
    Description: payload.Description || "",
    Status: payload.Status || "TODO",
    EstimatedHours: Number(payload.EstimatedHours || 0),
    AssigneeID: payload.AssigneeID || "",
    DueDate: payload.DueDate || "",
    IsDeleted: 0,
  });

  if (payload.AssigneeID) {
    sendAssignmentEmail(catalystApp, {
      assigneeId: payload.AssigneeID,
      itemType: "Task",
      title: payload.Title,
      status: payload.Status || "TODO",
      dueDate: payload.DueDate || "",
    });
  }

  return result;
}

async function updateTask({ catalystApp, user, taskId, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();
  const patch = {};

  if (payload.Title !== undefined) patch.Title = payload.Title;
  if (payload.Description !== undefined) patch.Description = payload.Description;
  if (payload.StoryID !== undefined) patch.StoryID = payload.StoryID;
  if (payload.Status !== undefined) patch.Status = payload.Status;
  if (payload.EstimatedHours !== undefined) patch.EstimatedHours = Number(payload.EstimatedHours || 0);
  if (payload.AssigneeID !== undefined) patch.AssigneeID = payload.AssigneeID;
  if (payload.DueDate !== undefined) patch.DueDate = payload.DueDate;

  patch.IsDeleted = 0;

  const result = await taskRepo.update(datastore, String(taskId), patch);

  if (payload.AssigneeID !== undefined && payload.AssigneeID) {
    sendAssignmentEmail(catalystApp, {
      assigneeId: payload.AssigneeID,
      itemType: "Task",
      title: payload.Title || "",
      status: payload.Status || "",
      dueDate: payload.DueDate || "",
    });
  }

  return result;
}

async function softDeleteTask({ catalystApp, user, taskId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();
  const zcql = catalystApp.zcql();

  // Cascade: soft-delete all subtasks of this task
  const subRaw = await subTaskRepo.list(zcql, { orgId, taskId });
  const subs = subTaskRepo.unwrap(subRaw);
  for (const st of subs) {
    await subTaskRepo.softDelete(datastore, { orgId, id: st.ROWID });
  }

  return await taskRepo.softDelete(datastore, { orgId, id: taskId });
}

async function createSubTask({ catalystApp, user, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();

  const result = await subTaskRepo.insert(datastore, {
    OrgID: orgId,
    ProjectID: payload.ProjectID || "",
    TaskID: payload.TaskID,
    StoryID: payload.StoryID,
    Title: payload.Title,
    Description: payload.Description || "",
    Status: payload.Status || "TODO",
    EstimatedHours: Number(payload.EstimatedHours || 0),
    AssigneeID: payload.AssigneeID || "",
    DueDate: payload.DueDate || "",
    IsDeleted: 0,
  });

  if (payload.AssigneeID) {
    sendAssignmentEmail(catalystApp, {
      assigneeId: payload.AssigneeID,
      itemType: "Sub-Task",
      title: payload.Title,
      status: payload.Status || "TODO",
      dueDate: payload.DueDate || "",
    });
  }

  return result;
}

async function updateSubTask({ catalystApp, user, subTaskId, payload }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();
  const patch = {};

  if (payload.Title !== undefined) patch.Title = payload.Title;
  if (payload.Description !== undefined) patch.Description = payload.Description;
  if (payload.Status !== undefined) patch.Status = payload.Status;
  if (payload.EstimatedHours !== undefined) patch.EstimatedHours = Number(payload.EstimatedHours || 0);
  if (payload.AssigneeID !== undefined) patch.AssigneeID = payload.AssigneeID;
  if (payload.DueDate !== undefined) patch.DueDate = payload.DueDate;

  patch.IsDeleted = 0;

  const result = await subTaskRepo.update(datastore, String(subTaskId), patch);

  if (payload.AssigneeID !== undefined && payload.AssigneeID) {
    sendAssignmentEmail(catalystApp, {
      assigneeId: payload.AssigneeID,
      itemType: "Sub-Task",
      title: payload.Title || "",
      status: payload.Status || "",
      dueDate: payload.DueDate || "",
    });
  }

  return result;
}

async function softDeleteSubTask({ catalystApp, user, subTaskId }) {
  const orgId = getOrgId(user);
  if (!orgId) throw new Error("OrgID not found on user session");

  const datastore = catalystApp.datastore();
  return await subTaskRepo.softDelete(datastore, { orgId, id: subTaskId });
}

module.exports = {
  listTasksByStory,
  createTask,
  updateTask,
  softDeleteTask,
  createSubTask,
  updateSubTask,
  softDeleteSubTask,
};
