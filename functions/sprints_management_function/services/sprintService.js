"use strict";

const sprintRepo = require("../models/sprintRepo");

function getOrgId(user) {
  return String(user?.org_id || user?.orgId || "");
}

async function listSprints({ catalystApp, user, projectId }) {
  const zcql = catalystApp.zcql();
  const orgId = getOrgId(user);
  const rows = await sprintRepo.list(zcql, { orgId, projectId });
  return sprintRepo.unwrap(rows);
}

async function createSprint({ catalystApp, user, payload }) {
  const datastore = catalystApp.datastore();
  const orgId = getOrgId(user);

  return await sprintRepo.insert(datastore, {
    OrgID: orgId,
    ProjectID: payload.ProjectID || "",
    SprintName: payload.SprintName,
    Goal: payload.Goal || "",
    StartDate: payload.StartDate || "",
    EndDate: payload.EndDate || "",
    Status: payload.Status || "PLANNED",
    IsDeleted: 0,
  });
}

async function getSprintById({ catalystApp, user, id }) {
  const zcql = catalystApp.zcql();
  const orgId = getOrgId(user);
  const rows = await sprintRepo.getById(zcql, { orgId, id });
  const unwrapped = sprintRepo.unwrap(rows);
  return unwrapped?.[0] || null;
}

async function softDeleteSprint({ catalystApp, user, id }) {
  const datastore = catalystApp.datastore();
  const orgId = getOrgId(user);
  return await sprintRepo.softDelete(datastore, { orgId, id });
}

async function updateSprint({ catalystApp, user, sprintId, payload }) {
  const datastore = catalystApp.datastore();
  const orgId = getOrgId(user);

  const patch = {};
  if (payload.SprintName !== undefined) patch.SprintName = payload.SprintName;
  if (payload.Goal !== undefined) patch.Goal = payload.Goal;
  if (payload.StartDate !== undefined) patch.StartDate = payload.StartDate;
  if (payload.EndDate !== undefined) patch.EndDate = payload.EndDate;
  if (payload.Status !== undefined) patch.Status = payload.Status;

  patch.IsDeleted = 0;

  return await sprintRepo.update(datastore, String(sprintId), patch);
}

module.exports = {
  listSprints,
  createSprint,
  getSprintById,
  softDeleteSprint,
  updateSprint,
};
